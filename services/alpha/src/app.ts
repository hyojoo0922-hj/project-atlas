// Atlas Alpha — 앱 로직 (CEO Dashboard + 업무 카드). 순수, 테스트 가능.
// AI 호출 0: 분석=규칙, 결과물=mock 템플릿. 대시보드/직원/자료/상태는 일반 앱 로직.
import type { Id, OutputType, RoleFamily } from "../../../packages/shared-types/src/index.ts";
import { analyzeRequest, toSubTasks, planSubTask, roleTitle, infoLabel } from "../../../packages/assistant/src/work-loop.ts";
import { getOutputScope, onboardingQuestionsFor } from "../../../packages/quality/src/quality.ts";
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

// ── 중앙화된 업무 계획(Alpha) ──
// 모든 업무 유형에 동일 규칙 적용: 텍스트형(minDraftOk)은 정보/직원이 부족해도 초안 생성 가능
// (필요 직군 부재 시 Writer가 대체 초안). 이미지/영상(minDraftOk=false)만 직원·자료 필요로 막힘.
type SubPlanMode = "final" | "draft" | "blocked";
interface AlphaPlan {
  outputType: ReturnType<typeof toSubTasks>[number]["outputType"];
  roleFamily: RoleFamily;
  mode: SubPlanMode;
  executor?: string;            // 결과를 만들 직원 persona
  missingInfo: string[];
  missingRole?: RoleFamily;     // 추천 채용(이상적 직군)
  blockReason?: "staff" | "info";
}

function alphaPlans(store: AlphaStore, task: AlphaTask): AlphaPlan[] {
  const info = new Set(store.data.companyInfo);
  const writer = store.data.employees.find((e) => e.dna.genome.roleFamily === "content");
  return toSubTasks(task.outputTypes).map((st): AlphaPlan => {
    const base = planSubTask(st, store.data.employees, info);
    const scope = getOutputScope(st.outputType);
    if (base.status === "executable") {
      return { outputType: st.outputType, roleFamily: st.roleFamily, missingInfo: [],
        mode: base.confidence === "final" ? "final" : "draft", executor: base.selectedEmployeePersona };
    }
    if (base.status === "need_info") {
      const emp = store.data.employees.find((e) => e.dna.genome.roleFamily === st.roleFamily);
      if (scope.minDraftOk) {
        return { outputType: st.outputType, roleFamily: st.roleFamily, mode: "draft",
          executor: emp?.dna.phenotype.persona ?? roleTitle(st.roleFamily), missingInfo: base.missingInfo };
      }
      return { outputType: st.outputType, roleFamily: st.roleFamily, mode: "blocked", blockReason: "info", missingInfo: base.missingInfo };
    }
    // need_staff: 직군 부재
    if (scope.minDraftOk && writer) {
      // 텍스트형은 Writer가 대체 초안 작성 (이상적 직군은 추천 채용으로 표시)
      return { outputType: st.outputType, roleFamily: st.roleFamily, mode: "draft",
        executor: writer.dna.phenotype.persona, missingInfo: [], missingRole: st.roleFamily };
    }
    return { outputType: st.outputType, roleFamily: st.roleFamily, mode: "blocked", blockReason: "staff", missingInfo: [], missingRole: st.roleFamily };
  });
}

/** 보유 직원·정보 기준으로 업무 상태/부족 자료/추천 채용 재계산 (모든 유형 공통) */
export function recompute(store: AlphaStore, task: AlphaTask): void {
  if (task.status === "approved") return;
  const plans = alphaPlans(store, task);
  task.missingInfo = uniq(plans.flatMap((p) => p.missingInfo));
  task.missingRoles = uniq(plans.map((p) => p.missingRole).filter(Boolean) as RoleFamily[]);
  const producible = plans.filter((p) => p.mode !== "blocked");
  const allFinal = plans.length > 0 && plans.every((p) => p.mode === "final");

  if (task.results.length) task.status = "delivered";
  else if (producible.length === 0) task.status = task.missingRoles.length ? "needs_hire" : "awaiting_materials";
  else if (allFinal) task.status = task.reviseNote ? "revise" : "ready";
  else task.status = task.reviseNote ? "revise" : "ready_with_missing_info";
}

/** 카드의 단일 CTA(중앙화) — 모든 유형 동일 규칙 */
export function taskCTA(store: AlphaStore, task: AlphaTask): { kind: "execute" | "proceed" | "blocked"; label: string } {
  if (task.status === "ready") return { kind: "execute", label: "실행하기" };
  if (task.status === "revise") return { kind: "proceed", label: "수정해서 다시 실행" };
  if (task.status === "ready_with_missing_info") {
    const providedSome = task.materials.length > 0
      || toSubTasks(task.outputTypes).some((st) => st.requiredInfo.some((k) => store.data.companyInfo.includes(k)));
    return { kind: "proceed", label: providedSome ? "이대로 초안으로 진행하기" : "최소 정보로 초안 진행하기" };
  }
  return { kind: "blocked", label: task.status === "needs_hire" ? "직원 채용 필요" : "자료 필요" };
}

// ── 자료 제공 (텍스트/URL/파일/이미지). Company Memory에 축적 + 업무 갱신 ──
export function provideMaterial(store: AlphaStore, taskId: Id, infoKey: string, kind: Material["kind"], value: string, note?: string): AlphaTask | null {
  const task = store.data.tasks.find((t) => t.id === taskId);
  if (!task) return null;
  const m: Material = { id: store.nextId("mat"), taskId, infoKey, kind, value, note };
  task.materials.push(m);
  if (!store.data.companyInfo.includes(infoKey)) store.data.companyInfo.push(infoKey); // Brand/Company Memory
  recompute(store, task);
  store.data.tasks.forEach((t) => t.id !== taskId && recompute(store, t));
  store.save();
  return task;
}

// ── 직원 실행 (mock 결과물 생성, AI 없음) — 모든 유형 best-effort ──
export function executeTask(store: AlphaStore, taskId: Id): AlphaTask | null {
  const task = store.data.tasks.find((t) => t.id === taskId);
  if (!task) return null;
  recompute(store, task);
  if (!["ready", "revise", "ready_with_missing_info"].includes(task.status)) return task; // 생성 가능한 부분이 없음
  const plans = alphaPlans(store, task);
  const results: TaskResult[] = [];
  let partial = false;
  for (const p of plans) {
    if (p.mode === "blocked") { partial = true; continue; }
    results.push({
      outputType: p.outputType,
      by: p.executor ?? roleTitle(p.roleFamily),
      state: p.mode,
      content: mockContent(p.outputType, store.data.company.name, p.executor ?? roleTitle(p.roleFamily)),
    });
    if (p.mode === "draft") partial = true;
  }
  task.results = results;
  task.partialMaterials = partial && results.length > 0;
  task.reviseNote = undefined;
  recompute(store, task);
  store.save();
  return task;
}

/** "이대로 진행하기"(별칭) — executeTask가 best-effort로 생성하므로 동일 동작. */
export function proceedWithPartial(store: AlphaStore, taskId: Id): AlphaTask | null {
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

// ── 숨김 처리 (삭제 아님 — 데이터는 JSON에 보존) ──
export function hideTask(store: AlphaStore, taskId: Id, now = new Date().toISOString()): boolean {
  const t = store.data.tasks.find((x) => x.id === taskId);
  if (!t) return false;
  t.hidden = true; t.archivedAt = now;
  store.save();
  return true;
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
  const visible = d.tasks.filter((t) => !t.hidden);          // 숨김 제외
  const openTasks = visible.filter((t) => t.status !== "approved");

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
    tasks: openTasks.slice(-12).reverse().map((t) => taskView(store, t)),
    // 결과물 탭: 전달/승인 완료 결과물(숨김 제외)
    deliverables: resultsTab(visible),
  };
}

/** 결과물 탭 데이터 — 결과가 있는(전달/승인) 업무의 결과 카드들. */
export function resultsTab(tasks: AlphaTask[]) {
  return tasks
    .filter((t) => !t.hidden && t.results.length > 0 && (t.status === "delivered" || t.status === "approved"))
    .reverse()
    .flatMap((t) => t.results.map((r) => ({
      taskId: t.id, title: t.title, by: r.by, outputType: r.outputType,
      state: r.state, approved: t.status === "approved", content: r.content,
      canRevise: t.status !== "approved", partialMaterials: !!t.partialMaterials,
    })));
}

export function taskView(store: AlphaStore, t: AlphaTask) {
  const cta = taskCTA(store, t);   // 모든 유형 동일 규칙(중앙화)
  // 막힘(blocked) 사유와 다음 행동 (Trust First — 진행 불가일 때도 이유/다음 행동 노출)
  const blocked = cta.kind === "blocked";
  const nextActions: string[] = [];
  if (blocked) {
    t.missingRoles.forEach((r) => nextActions.push(`${roleTitle(r)} 채용하기`));
    t.missingInfo.forEach((k) => nextActions.push(`${infoLabel(k)} 자료 제공하기`));
  }
  return {
    id: t.id, title: t.title, status: t.status, statusLabel: STATUS_LABEL[t.status],
    assignees: uniq(t.requiredRoles).map(roleTitle),
    neededMaterials: t.missingInfo.map((k) => ({ key: k, label: infoLabel(k) })),
    recommendedHires: t.missingRoles.map((r) => ({ roleFamily: r, title: roleTitle(r) })),
    provided: t.materials.map((m) => ({ label: infoLabel(m.infoKey), kind: m.kind, value: m.value })),
    results: t.results,
    partialMaterials: !!t.partialMaterials,
    cta, blocked, nextActions,
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
