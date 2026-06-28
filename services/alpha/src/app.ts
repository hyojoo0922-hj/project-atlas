// Atlas Alpha — 앱 로직 (CEO Dashboard + 업무 카드). 순수, 테스트 가능.
// AI 호출 0: 분석=규칙, 결과물=mock 템플릿. 대시보드/직원/자료/상태는 일반 앱 로직.
import type { Id, OutputType, RoleFamily } from "../../../packages/shared-types/src/index.ts";
import { analyzeRequest, toSubTasks, planSubTask, roleTitle, infoLabel } from "../../../packages/assistant/src/work-loop.ts";
import { onboardingQuestionsFor } from "../../../packages/quality/src/quality.ts";
import { AlphaStore, type AlphaTask, type Material, type TaskResult, type TaskStatus } from "./store.ts";

export const ALPHA_PASS = process.env.ATLAS_PASS ?? "atlas";

// ── 직원 카탈로그 (채용 가능 직원) ──
export interface EmployeeCatalogItem {
  roleFamily: RoleFamily; title: string; canDo: string;
}
export const EMPLOYEE_CATALOG: EmployeeCatalogItem[] = [
  { roleFamily: "content", title: "Writer Employee", canDo: "글·카피·SNS 콘텐츠 작성" },
  { roleFamily: "design", title: "Designer Employee", canDo: "이미지·배너·썸네일 (추후 지원)" },
  { roleFamily: "marketing", title: "Marketing Employee", canDo: "캠페인·홍보 기획" },
  { roleFamily: "operations", title: "Operations Employee", canDo: "재고·발주·매장 운영" },
  { roleFamily: "support", title: "CS Employee", canDo: "문의·리뷰 응대" },
];
const titleToRole = (t: string): RoleFamily | undefined => EMPLOYEE_CATALOG.find((c) => c.title === t)?.roleFamily;

// ── 인증/로그인 ──
export function login(store: AlphaStore, ownerName: string, pass: string): { ok: boolean; ownerName?: string; reason?: string } {
  if (pass !== ALPHA_PASS) return { ok: false, reason: "비밀번호가 올바르지 않습니다." };
  if (ownerName?.trim()) store.data.ownerName = ownerName.trim();
  store.save();
  return { ok: true, ownerName: store.data.ownerName };
}

// ── 업무 등록 (채팅 아님 — 한 줄 입력 → 업무 카드 생성) ──
export function registerTask(store: AlphaStore, title: string): AlphaTask {
  const id = store.nextId("tsk");
  const outputTypes = analyzeRequest(title);
  const subTasks = toSubTasks(outputTypes);
  const requiredRoles = uniq(subTasks.map((s) => s.roleFamily));
  const task: AlphaTask = {
    id, title, outputTypes, requiredRoles,
    status: "ready", missingInfo: [], missingRoles: [], materials: [], results: [],
  };
  store.data.tasks.push(task);
  recompute(store, task);
  store.save();
  return task;
}

/** 보유 직원·정보 기준으로 업무 상태/부족 자료/추천 채용 재계산 */
export function recompute(store: AlphaStore, task: AlphaTask): void {
  if (task.status === "approved") return;
  const info = new Set(store.data.companyInfo);
  const subTasks = toSubTasks(task.outputTypes);
  const plans = subTasks.map((s) => planSubTask(s, store.data.employees, info));
  task.missingInfo = uniq(plans.filter((p) => p.status === "need_info").flatMap((p) => p.missingInfo));
  task.missingRoles = uniq(plans.filter((p) => p.status === "need_staff").flatMap((p) => p.missingRoleFamilies));
  const executable = plans.some((p) => p.status === "executable");

  // 일부 자료라도 있어 초안 생성이 가능한 subtask (정보 0%는 불가 — Trust First 하한선)
  const partialPossible = plans.some((p) => p.status === "need_info" && p.readinessScore > 0);
  const blockedInfo = task.missingInfo.length > 0;

  if (task.results.length) task.status = "delivered";
  else if (executable && !blockedInfo) task.status = task.reviseNote ? "revise" : "ready"; // 충분
  else if (task.proceedAnyway && (executable || partialPossible)) task.status = "ready_with_missing_info"; // 이대로 진행
  else if (blockedInfo) task.status = "awaiting_materials";   // 기본: 자료 더 필요
  else if (executable) task.status = task.reviseNote ? "revise" : "ready";
  else if (task.missingRoles.length) task.status = "needs_hire";
  else task.status = "ready";
}

// ── 자료 제공 (텍스트/URL/파일/이미지). Company Memory에 축적 + 업무 갱신 ──
export function provideMaterial(store: AlphaStore, taskId: Id, infoKey: string, kind: Material["kind"], value: string, note?: string): AlphaTask | null {
  const task = store.data.tasks.find((t) => t.id === taskId);
  if (!task) return null;
  const m: Material = { id: store.nextId("mat"), taskId, infoKey, kind, value, note };
  task.materials.push(m);
  if (!store.data.companyInfo.includes(infoKey)) store.data.companyInfo.push(infoKey); // Brand/Company Memory
  recompute(store, task);
  // 같은 자료가 필요한 다른 업무도 갱신
  store.data.tasks.forEach((t) => t.id !== taskId && recompute(store, t));
  store.save();
  return task;
}

// ── 직원 실행 (mock 결과물 생성, AI 없음) ──
export function executeTask(store: AlphaStore, taskId: Id): AlphaTask | null {
  const task = store.data.tasks.find((t) => t.id === taskId);
  if (!task) return null;
  recompute(store, task);
  const runnable = ["ready", "revise", "ready_with_missing_info"].includes(task.status);
  if (!runnable) return task; // 실행 불가 (자료가 너무 부족하거나 직원 없음)

  const forced = task.status === "ready_with_missing_info" || !!task.proceedAnyway;
  const info = new Set(store.data.companyInfo);
  const plans = toSubTasks(task.outputTypes).map((s) => planSubTask(s, store.data.employees, info));
  const results: TaskResult[] = [];
  let partial = false;
  for (const p of plans) {
    if (p.status === "executable") {
      // 충분(final) 또는 일부(draft) — readiness가 결과 등급을 결정
      results.push(mkResult(store, p, p.confidence === "final" ? "final" : "draft"));
      if (p.confidence !== "final") partial = true;
    } else if (forced && p.status === "need_info" && p.readinessScore > 0) {
      // 일부 자료만으로 초안 진행 (Trust First: 0%는 제외)
      results.push(mkResult(store, p, "draft"));
      partial = true;
    } else if (p.status !== "executable") {
      partial = true; // 직원 부족/정보 0% 등으로 빠진 부분이 있음
    }
  }
  task.results = results;
  task.partialMaterials = partial && results.length > 0;
  task.reviseNote = undefined;
  recompute(store, task);
  store.save();
  return task;
}

function mkResult(store: AlphaStore, p: ReturnType<typeof planSubTask>, state: "final" | "draft"): TaskResult {
  return {
    outputType: p.subTask.outputType,
    by: p.selectedEmployeePersona ?? roleTitle(p.subTask.roleFamily),
    state,
    content: mockContent(p.subTask.outputType, store.data.company.name, p.selectedEmployeePersona ?? roleTitle(p.subTask.roleFamily)),
  };
}

/** "이대로 진행하기" — 일부 자료 미제공이어도 초안 진행 승인 후 실행. */
export function proceedWithPartial(store: AlphaStore, taskId: Id): AlphaTask | null {
  const task = store.data.tasks.find((t) => t.id === taskId);
  if (!task) return null;
  task.proceedAnyway = true;
  return executeTask(store, taskId);
}

export function approveTask(store: AlphaStore, taskId: Id, feedback?: AlphaTask["feedback"]): boolean {
  const t = store.data.tasks.find((x) => x.id === taskId);
  if (!t) return false;
  t.status = "approved"; if (feedback) t.feedback = feedback;
  store.save();
  return true;
}

export function reviseTask(store: AlphaStore, taskId: Id, note: string): AlphaTask | null {
  const t = store.data.tasks.find((x) => x.id === taskId);
  if (!t) return null;
  t.reviseNote = note; t.results = [];
  recompute(store, t);
  store.save();
  return t;
}

// ── 채용 ──
export function hire(store: AlphaStore, roleFamily: RoleFamily, persona?: string): Id {
  const id = store.nextId("emp");
  const dep = store.data.departments[0]!;
  store.data.employees.push({
    id, companyId: store.data.company.id, departmentId: dep.id, rank: "junior",
    dna: { genome: { archetype: roleFamily === "design" ? "creator" : "responder", roleFamily },
      phenotype: { persona: persona ?? roleTitle(roleFamily), tone: "warm", locale: "ko-KR" },
      acquired: { traits: [], values: [] }, lineage: [{ version: 1, change: "hired (alpha)" }] },
    recommendedSkills: [], memoryScope: ["voice", "product", "policy"],
  });
  store.data.tasks.forEach((t) => recompute(store, t));
  store.save();
  return id;
}

// ── 대시보드 (AI 호출 0 — 일반 앱 로직) ──
export function dashboard(store: AlphaStore) {
  const d = store.data;
  const presentRoles = new Set(d.employees.map((e) => e.dna.genome.roleFamily));
  const openTasks = d.tasks.filter((t) => t.status !== "approved");

  // 추천 채용: open 업무의 부족 직군 + (기본) Designer
  const recoRoles = uniq(openTasks.flatMap((t) => t.missingRoles));
  const recommendedHires = recoRoles.map((rf) => ({
    roleFamily: rf, title: roleTitle(rf),
    reason: reasonFor(rf, openTasks),
    asks: onboardingQuestionsFor(rf)?.asks ?? [],
  }));

  return {
    ownerName: d.ownerName,
    company: { name: d.company.name, stage: d.company.stage },
    readiness: readiness(store),
    priorities: openTasks.length
      ? openTasks.map((t) => t.title)
      : ["신메뉴 홍보", "리뷰 답변", "재고 점검"],   // 비어 있으면 빠른 시작 제안
    assistantOnDuty: true,
    employees: EMPLOYEE_CATALOG.map((c) => ({
      ...c, hired: presentRoles.has(c.roleFamily),
    })),
    recommendedHires,
    tasks: d.tasks.slice(-12).reverse().map((t) => taskView(store, t)),
  };
}

export function taskView(store: AlphaStore, t: AlphaTask) {
  // 일부 자료만으로 진행 가능한가 (need_info 중 readiness>0 존재) — Trust First 하한선 적용
  const info = new Set(store.data.companyInfo);
  const plans = toSubTasks(t.outputTypes).map((s) => planSubTask(s, store.data.employees, info));
  const canProceedPartial = t.status === "awaiting_materials"
    && plans.some((p) => p.status === "need_info" && p.readinessScore > 0);
  return {
    id: t.id, title: t.title, status: t.status, statusLabel: STATUS_LABEL[t.status],
    assignees: uniq(t.requiredRoles).map(roleTitle),
    neededMaterials: t.missingInfo.map((k) => ({ key: k, label: infoLabel(k) })),
    recommendedHires: t.missingRoles.map((r) => ({ roleFamily: r, title: roleTitle(r) })),
    provided: t.materials.map((m) => ({ label: infoLabel(m.infoKey), kind: m.kind, value: m.value })),
    results: t.results,
    partialMaterials: !!t.partialMaterials,
    canProceedPartial,
    feedback: t.feedback ?? null,
  };
}

export const STATUS_LABEL: Record<TaskStatus, string> = {
  needs_hire: "직원 필요", awaiting_materials: "자료 대기", ready: "실행 가능",
  ready_with_missing_info: "일부 자료로 진행", delivered: "결과 완료", approved: "승인됨", revise: "수정 요청",
};

export function onboardingAsks(roleFamily: RoleFamily): string[] {
  return onboardingQuestionsFor(roleFamily)?.asks ?? [];
}
export { titleToRole };

// ── 내부 helper ──
function readiness(store: AlphaStore): number {
  const coreInfo = ["brand-voice", "product-info", "target-audience", "logo", "brand-color", "faq", "tone"];
  const coreRoles: RoleFamily[] = ["content", "design", "support", "operations", "marketing"];
  const present = new Set(store.data.employees.map((e) => e.dna.genome.roleFamily));
  const infoPct = coreInfo.filter((k) => store.data.companyInfo.includes(k)).length / coreInfo.length;
  const rolePct = coreRoles.filter((r) => present.has(r)).length / coreRoles.length;
  return Math.round((infoPct * 0.5 + rolePct * 0.5) * 100);
}

function reasonFor(rf: RoleFamily, openTasks: AlphaTask[]): string {
  if (rf === "design") return "콘텐츠 요청에는 이미지 작업이 자주 필요합니다.";
  const t = openTasks.find((x) => x.missingRoles.includes(rf));
  return t ? `"${t.title}" 업무에 ${roleTitle(rf)}가 필요합니다.` : `${roleTitle(rf)}가 있으면 더 많은 업무를 처리할 수 있습니다.`;
}

function mockContent(type: OutputType, company: string, by: string): string {
  switch (type) {
    case "ad_copy": return `[광고 카피 초안 · ${by}]\n${company} 신메뉴 출시! 오늘만의 특별한 한 잔 — 따뜻한 브랜드 말투로 작성된 홍보 문구입니다. (예시 placeholder)`;
    case "social_post": return `[SNS 포스트 초안 · ${by}]\n오늘의 신메뉴 ✨ #${company.replace(/\s/g, "")} #신메뉴 (예시 placeholder)`;
    case "text": return `[텍스트 초안 · ${by}]\n${company} 관련 콘텐츠 초안입니다. (예시 placeholder)`;
    case "report": return `[리포트 초안 · ${by}]\n${company} 요약 리포트 (예시 placeholder)`;
    case "customer_reply": return `[고객 응대 초안 · ${by}]\n안녕하세요, ${company}입니다. 문의 주셔서 감사합니다. (예시 placeholder)`;
    case "image": case "video": return `🎨 ${type === "image" ? "이미지" : "영상"} 결과물은 추후 지원 예정입니다 (${by} 준비 완료).`;
    default: return `[초안 · ${by}] (예시 placeholder)`;
  }
}

const uniq = <T>(a: T[]): T[] => [...new Set(a)];
