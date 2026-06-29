// Atlas Alpha — 앱 로직 (CEO Dashboard + 업무 카드). 순수, 테스트 가능.
// AI 호출 0: 분석=규칙, 결과물=mock 템플릿. 대시보드/직원/자료/상태는 일반 앱 로직.
import type { Id, OutputType, RoleFamily } from "../../../packages/shared-types/src/index.ts";
import { analyzeRequest, toSubTasks, planSubTask, roleTitle, infoLabel } from "../../../packages/assistant/src/work-loop.ts";
import { getOutputScope, onboardingQuestionsFor } from "../../../packages/quality/src/quality.ts";
import { makeTextGenerator, type TextGenerator } from "../../../packages/cost-control/src/text-gateway.ts";
import { bySpecialization, recommendForOutput } from "../../../packages/hq-catalog/src/hq-catalog.ts";
import { getOutputStandard, renderStandardForPrompt } from "../../../packages/hq-catalog/src/output-standard.ts";
import { AlphaStore, type AlphaTask, type ImageChoice, type Material, type MaterialCategory, type TaskResult, type TaskStatus, type VaultItem } from "./store.ts";

export const ALPHA_PASS = process.env.ATLAS_PASS ?? "atlas";

// ── 크레딧/이미지 수익화 게이트 (Placeholder — 실결제·실제 이미지 생성 없음) ──
export const IMAGE_CREDIT_COST = 1;        // 1회 이미지 생성에 필요한 크레딧
const IMAGE_EST_USD = 0.04;                // 이미지 생성 예상 원가(Placeholder, 내부 기록용)
const TOPUP_AMOUNT = 3;                     // 충전 placeholder 단위

// 텍스트 생성기(기본 mock — 오프라인/테스트 안전). 서버가 실제 AI로 교체 가능.
let textGenerator: TextGenerator = makeTextGenerator();
export function setTextGenerator(g: TextGenerator): void { textGenerator = g; }

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
  deliveredType: ReturnType<typeof toSubTasks>[number]["outputType"]; // 실제 전달 유형(이미지→image_brief)
  roleFamily: RoleFamily;
  mode: SubPlanMode;
  executor?: string;            // 결과를 만들 직원 persona
  missingInfo: string[];
  missingRole?: RoleFamily;     // 추천 채용(이상적 직군)
  blockReason?: "staff" | "info";
  isVisual?: boolean;           // 이미지/영상 — 선택(채용/크레딧/기획안) 흐름 대상
}

const isVisual = (t: string): boolean => t === "image" || t === "video";

function alphaPlans(store: AlphaStore, task: AlphaTask): AlphaPlan[] {
  const info = new Set(store.data.companyInfo);
  const writer = store.data.employees.find((e) => e.dna.genome.roleFamily === "content");
  return toSubTasks(task.outputTypes).map((st): AlphaPlan => {
    // 이미지/영상: 실제 생성 대신 텍스트형 대체 산출물(image_brief)을 Writer/대표 비서가 작성.
    // Designer 부재는 추천 채용(비차단)으로 유지. 절대 "이미지 생성"하지 않음(Trust First).
    if (isVisual(st.outputType)) {
      const hasDesigner = store.data.employees.some((e) => e.dna.genome.roleFamily === "design");
      return {
        outputType: st.outputType, deliveredType: "image_brief", roleFamily: st.roleFamily,
        mode: "draft", executor: writer?.dna.phenotype.persona ?? "대표 비서",
        missingInfo: st.requiredInfo.filter((k) => !info.has(k)),
        missingRole: hasDesigner ? undefined : "design",
        isVisual: true,
      };
    }
    const base = planSubTask(st, store.data.employees, info);
    const scope = getOutputScope(st.outputType);
    if (base.status === "executable") {
      return { outputType: st.outputType, deliveredType: st.outputType, roleFamily: st.roleFamily, missingInfo: [],
        mode: base.confidence === "final" ? "final" : "draft", executor: base.selectedEmployeePersona };
    }
    if (base.status === "need_info") {
      const emp = store.data.employees.find((e) => e.dna.genome.roleFamily === st.roleFamily);
      if (scope.minDraftOk) {
        return { outputType: st.outputType, deliveredType: st.outputType, roleFamily: st.roleFamily, mode: "draft",
          executor: emp?.dna.phenotype.persona ?? roleTitle(st.roleFamily), missingInfo: base.missingInfo };
      }
      return { outputType: st.outputType, deliveredType: st.outputType, roleFamily: st.roleFamily, mode: "blocked", blockReason: "info", missingInfo: base.missingInfo };
    }
    // need_staff: 직군 부재
    if (scope.minDraftOk && writer) {
      // 텍스트형은 Writer가 대체 초안 작성 (이상적 직군은 추천 채용으로 표시)
      return { outputType: st.outputType, deliveredType: st.outputType, roleFamily: st.roleFamily, mode: "draft",
        executor: writer.dna.phenotype.persona, missingInfo: [], missingRole: st.roleFamily };
    }
    return { outputType: st.outputType, deliveredType: st.outputType, roleFamily: st.roleFamily, mode: "blocked", blockReason: "staff", missingInfo: [], missingRole: st.roleFamily };
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

export type CTAKind = "execute" | "proceed" | "blocked" | "image_choice" | "credit_blocked";

/** 카드의 단일 CTA(중앙화). 이미지 요청은 선택(채용/크레딧/기획안) → 크레딧 게이트 → 실행 순. */
export function taskCTA(store: AlphaStore, task: AlphaTask): { kind: CTAKind; label: string } {
  const visual = task.outputTypes.some(isVisual);
  if (visual) {
    // 1) 진행 방식 미선택 → 선택 카드 (기획안 자동 제공하지 않음)
    if (!task.imageChoice) return { kind: "image_choice", label: "이미지 진행 방식 선택" };
    // 2) 크레딧 경로인데 잔액 부족 → 충전/채용 CTA (실행 안 함)
    if (task.imageChoice === "credit" && store.data.credits < IMAGE_CREDIT_COST)
      return { kind: "credit_blocked", label: "크레딧 부족 — 충전 또는 Designer 채용" };
    // 3) 선택 완료 → 실행
    if (task.imageChoice === "credit") return { kind: "execute", label: `이미지 생성 진행 (크레딧 ${IMAGE_CREDIT_COST} 사용)` };
    if (task.imageChoice === "designer") return { kind: "execute", label: "Designer 기획안 진행" };
    return { kind: "execute", label: "이미지 기획안 받기" };
  }
  if (task.status === "ready") return { kind: "execute", label: "실행하기" };
  if (task.status === "revise") return { kind: "proceed", label: "수정해서 다시 실행" };
  if (task.status === "ready_with_missing_info") {
    const providedSome = task.materials.length > 0
      || toSubTasks(task.outputTypes).some((st) => st.requiredInfo.some((k) => store.data.companyInfo.includes(k)));
    return { kind: "proceed", label: providedSome ? "이대로 초안으로 진행하기" : "최소 정보로 초안 진행하기" };
  }
  return { kind: "blocked", label: task.status === "needs_hire" ? "직원 채용 필요" : "자료 필요" };
}

// ── Company Knowledge Vault (자료 인박스) 카테고리 매핑 ──
export const CATEGORY_LABEL: Record<MaterialCategory, string> = {
  brand: "브랜드", product: "상품", reference: "레퍼런스", liked_style: "좋아하는 스타일",
  disliked: "싫어하는 표현", customer_faq: "고객/FAQ", etc: "기타",
};
export const MATERIAL_CATEGORIES = Object.keys(CATEGORY_LABEL) as MaterialCategory[];

// 자료 탭 직접 추가: 카테고리 → 대표 infoKey (업무 요구사항 자동 충족용)
const CATEGORY_TO_INFOKEY: Record<MaterialCategory, string> = {
  brand: "brand-voice", product: "product-info", reference: "design-reference",
  liked_style: "tone", disliked: "banned-terms", customer_faq: "faq", etc: "source",
};
// 업무 제공 자료: infoKey → 카테고리 (역추론)
function categoryForInfoKey(k: string): MaterialCategory {
  if (["brand-voice", "tone", "logo", "brand-color", "brand-assets", "channel"].includes(k)) return "brand";
  if (["product-info", "product-image"].includes(k)) return "product";
  if (["design-reference", "storyboard"].includes(k)) return "reference";
  if (["target-audience", "faq"].includes(k)) return "customer_faq";
  return "etc";
}
/** Vault에 자료 1건 적재. companyInfo 동기화는 refreshMemory가 담당. */
function addToVault(store: AlphaStore, item: Omit<VaultItem, "id" | "createdAt"> & { createdAt?: string }): VaultItem {
  const v: VaultItem = {
    id: store.nextId("vlt"), createdAt: item.createdAt ?? new Date().toISOString(),
    infoKey: item.infoKey, category: item.category, kind: item.kind, value: item.value,
    note: item.note, sourceTaskId: item.sourceTaskId, byRole: item.byRole,
  };
  store.data.vault.push(v);
  return v;
}

/** Company Memory 갱신 — companyInfo는 "보이는(숨김 아님) Vault 항목"의 infoKey 집합에서 파생.
 *  숨김 자료는 자동 활용에서 제외(요구사항). 이후 모든 업무 상태 재계산. */
function refreshMemory(store: AlphaStore): void {
  store.data.companyInfo = uniq(
    store.data.vault.filter((v) => !v.hidden).map((v) => v.infoKey).filter(Boolean),
  );
  store.data.tasks.forEach((t) => recompute(store, t));
}

/** 다중 입력 단위 — 하나의 제출에 텍스트/URL/파일/이미지를 여러 개 담는다. */
export interface MaterialItem { kind: Material["kind"]; value: string }
const cleanItems = (items: MaterialItem[]): MaterialItem[] =>
  (items ?? []).map((it) => ({ kind: it.kind, value: String(it.value ?? "").trim() })).filter((it) => it.value);

// ── 자료 제공 (다중) — 한 번에 여러 항목. Company Memory(Vault)에 분리 저장 + 업무 갱신 ──
export function provideMaterials(store: AlphaStore, taskId: Id, infoKey: string, items: MaterialItem[], note?: string): AlphaTask | null {
  const task = store.data.tasks.find((t) => t.id === taskId);
  if (!task) return null;
  const byRole = uniq(toSubTasks(task.outputTypes).filter((st) => st.requiredInfo.includes(infoKey)).map((st) => st.roleFamily))[0];
  for (const it of cleanItems(items)) {
    const m: Material = { id: store.nextId("mat"), taskId, infoKey, kind: it.kind, value: it.value, note };
    task.materials.push(m);
    // 항목마다 별도 Vault 항목으로 보존(출처 업무·카테고리·연결 직원·생성일 유지)
    addToVault(store, { infoKey, category: categoryForInfoKey(infoKey), kind: it.kind, value: it.value, note, sourceTaskId: taskId, byRole });
  }
  refreshMemory(store);   // companyInfo 재파생 + 전 업무 재계산
  store.save();
  return task;
}

// ── 자료 제공 (단일) — 다중 경로에 위임(하위호환) ──
export function provideMaterial(store: AlphaStore, taskId: Id, infoKey: string, kind: Material["kind"], value: string, note?: string): AlphaTask | null {
  return provideMaterials(store, taskId, infoKey, [{ kind, value }], note);
}

// ── 자료 탭 직접 추가 (다중) — 한 번에 여러 항목, 같은 카테고리/메모/생성일로 분리 저장 ──
export function addVaultMaterials(
  store: AlphaStore, category: MaterialCategory, items: MaterialItem[], note?: string, infoKey?: string,
): VaultItem[] {
  const key = (infoKey && infoKey.trim()) || CATEGORY_TO_INFOKEY[category];
  const created = cleanItems(items).map((it) =>
    addToVault(store, { infoKey: key, category, kind: it.kind, value: it.value, note }));
  refreshMemory(store);   // companyInfo 재파생 + 기존 업무 자동 활용 갱신
  store.save();
  return created;
}

// ── 자료 수정 (카테고리·값·메모) — infoKey/출처는 유지 ──
export function editVaultItem(
  store: AlphaStore, id: Id, patch: { category?: MaterialCategory; value?: string; note?: string },
): VaultItem | null {
  const v = store.data.vault.find((x) => x.id === id);
  if (!v) return null;
  if (patch.category) v.category = patch.category;
  if (typeof patch.value === "string" && patch.value.trim()) v.value = patch.value.trim();
  if (typeof patch.note === "string") v.note = patch.note.trim() || undefined;
  refreshMemory(store);
  store.save();
  return v;
}

// ── 자료 숨김 (삭제 아님 — hidden+archivedAt, 데이터 보존) ──
export function hideVaultItem(store: AlphaStore, id: Id, now = new Date().toISOString()): boolean {
  const v = store.data.vault.find((x) => x.id === id);
  if (!v) return false;
  v.hidden = true; v.archivedAt = now;
  refreshMemory(store);   // 숨김 자료는 자동 활용에서 즉시 제외
  store.save();
  return true;
}

// ── 자료 탭 직접 추가 (단일) — 다중 경로에 위임(하위호환) ──
export function addVaultMaterial(
  store: AlphaStore, category: MaterialCategory, kind: Material["kind"], value: string, note?: string, infoKey?: string,
): VaultItem {
  return addVaultMaterials(store, category, [{ kind, value }], note, infoKey)[0]!;
}

/** 자료 탭 표시용 — Vault 항목을 라벨/카테고리/출처/날짜와 함께. 최신순. 숨김 제외. */
export function vaultView(store: AlphaStore) {
  const taskTitle = (id?: Id) => store.data.tasks.find((t) => t.id === id)?.title;
  return [...store.data.vault].filter((v) => !v.hidden).reverse().map((v) => ({
    id: v.id, infoKey: v.infoKey, infoLabel: infoLabel(v.infoKey),
    category: v.category, categoryLabel: CATEGORY_LABEL[v.category],
    kind: v.kind, value: v.value, note: v.note,
    source: v.sourceTaskId ? (taskTitle(v.sourceTaskId) ?? "업무") : "직접 추가",
    fromTask: !!v.sourceTaskId,
    byRole: v.byRole, byLabel: v.byRole ? roleTitle(v.byRole) : null,
    createdAt: v.createdAt,
  }));
}

const designerPersona = (store: AlphaStore): string | undefined =>
  store.data.employees.find((e) => e.dna.genome.roleFamily === "design")?.dna.phenotype.persona;
const writerPersona = (store: AlphaStore): string | undefined =>
  store.data.employees.find((e) => e.dna.genome.roleFamily === "content")?.dna.phenotype.persona;

function imagePendingContent(company: string, by: string): string {
  return [
    `🖼️ 이미지 생성 준비됨 · ${by}`,
    `1회 이미지 생성 크레딧을 사용했습니다. (크레딧 ${IMAGE_CREDIT_COST} 차감)`,
    `⚠️ 실제 이미지 생성은 아직 비활성화되어 있어 현재는 "생성 대기/준비됨" 상태까지만 진행됩니다.`,
    `생성이 활성화되면 ${company}의 요청 이미지가 이 카드에 표시됩니다. (실제 생성 OFF)`,
  ].join("\n");
}

// ── 직원 실행 — 결과물 생성 순간에만 AI 호출(없으면 mock). 이미지는 선택/크레딧 게이트 적용 ──
export async function executeTask(store: AlphaStore, taskId: Id): Promise<AlphaTask | null> {
  const task = store.data.tasks.find((t) => t.id === taskId);
  if (!task) return null;
  recompute(store, task);
  if (!["ready", "revise", "ready_with_missing_info"].includes(task.status)) return task; // 생성 가능한 부분이 없음
  const plans = alphaPlans(store, task);
  const results: TaskResult[] = [];
  let partial = false, needsImageChoice = false, creditShortfall = false;
  for (const p of plans) {
    if (p.mode === "blocked") { partial = true; continue; }

    // ── 이미지/영상: 선택(채용/크레딧/기획안)에 따라 분기. 실제 생성은 하지 않음 ──
    if (p.isVisual) {
      const choice = task.imageChoice;
      if (!choice) { needsImageChoice = true; partial = true; continue; }   // 선택 전엔 결과 생성 안 함
      if (choice === "credit") {
        if (store.data.credits < IMAGE_CREDIT_COST) { creditShortfall = true; partial = true; continue; }
        store.data.credits -= IMAGE_CREDIT_COST;                            // 크레딧 차감(실결제 아님)
        const by = designerPersona(store) ?? writerPersona(store) ?? "대표 비서";
        results.push({
          outputType: p.outputType, requestedOutputType: p.outputType, by,
          state: "pending", requestType: "image_credit", creditsUsed: IMAGE_CREDIT_COST,
          content: imagePendingContent(store.data.company.name, by),
        });
        store.data.usage.push({
          taskId: task.id, outputType: p.outputType, model: "image-gen(off)", mode: "mock",
          inputTokens: 0, outputTokens: 0, costUsd: IMAGE_EST_USD, credits: IMAGE_CREDIT_COST, requestType: "image_credit",
        });
        continue;
      }
      // brief / designer → image_brief (designer 선택 시 디자이너 작성 = fallback 기획안)
      const designer = designerPersona(store);
      const by = choice === "designer" && designer ? designer : (writerPersona(store) ?? "대표 비서");
      const fallbackText = mockContent("image_brief", store.data.company.name, by);
      const gen = await textGenerator({
        outputType: "image_brief", system: buildSystem(store, by, true),
        prompt: buildPrompt(store, task, "image_brief", true), fallbackText, draft: true,
      });
      const requestType = choice === "designer" ? "image_designer_brief" : "image_brief";
      results.push({ outputType: "image_brief", requestedOutputType: p.outputType, by, state: "draft", requestType, content: gen.text, standardLabel: getOutputStandard("image_brief")?.label });
      store.data.usage.push({
        taskId: task.id, outputType: "image_brief", model: gen.model, mode: gen.mode,
        inputTokens: gen.inputTokens, outputTokens: gen.outputTokens, costUsd: gen.costUsd, credits: 0, requestType,
      });
      partial = true;
      continue;
    }

    // ── 텍스트형 ──
    const by = p.executor ?? roleTitle(p.roleFamily);
    const draft = p.mode === "draft";
    const fallbackText = mockContent(p.deliveredType, store.data.company.name, by);
    const gen = await textGenerator({
      outputType: p.deliveredType,
      system: buildSystem(store, by, draft),
      prompt: buildPrompt(store, task, p.deliveredType, draft),
      fallbackText, draft,
    });
    results.push({
      outputType: p.deliveredType,
      requestedOutputType: p.deliveredType !== p.outputType ? p.outputType : undefined,
      by, state: p.mode, requestType: "text", content: gen.text,
      standardLabel: getOutputStandard(p.deliveredType)?.label,
    });
    store.data.usage.push({
      taskId: task.id, outputType: p.deliveredType, model: gen.model, mode: gen.mode,
      inputTokens: gen.inputTokens, outputTokens: gen.outputTokens, costUsd: gen.costUsd, credits: 0, requestType: "text",
    });
    if (draft) partial = true;
  }
  task.results = results;
  task.partialMaterials = partial && results.length > 0;
  task.needsImageChoice = needsImageChoice;
  task.creditShortfall = creditShortfall;
  task.reviseNote = undefined;
  recompute(store, task);
  store.save();
  return task;
}

// ── 이미지 진행 방식 선택 (designer 선택 시 디자이너 없으면 채용) ──
export function setImageChoice(store: AlphaStore, taskId: Id, choice: ImageChoice): AlphaTask | null {
  const task = store.data.tasks.find((t) => t.id === taskId);
  if (!task) return null;
  if (choice === "designer" && !store.data.employees.some((e) => e.dna.genome.roleFamily === "design")) {
    hire(store, "design", "디자이너");
  }
  task.imageChoice = choice;
  recompute(store, task);
  store.save();
  return task;
}

// ── 크레딧 충전 (Placeholder — 실결제 없음) ──
export function topUpCredits(store: AlphaStore, amount = TOPUP_AMOUNT): number {
  store.data.credits += amount;
  store.data.tasks.forEach((t) => recompute(store, t));
  store.save();
  return store.data.credits;
}

/** "이대로 진행하기"(별칭) — executeTask가 best-effort로 생성하므로 동일 동작. */
export function proceedWithPartial(store: AlphaStore, taskId: Id): Promise<AlphaTask | null> {
  return executeTask(store, taskId);
}

// 결과물 생성 프롬프트 (Cost First: 짧고 명확). 회사/보유 자료 맥락 주입.
function buildSystem(store: AlphaStore, by: string, draft: boolean): string {
  const c = store.data.company;
  return `당신은 ${c.name}(업종: ${c.industry})의 ${by}입니다. 한국어로 ${draft ? "초안" : "최종본"}을 작성하세요. `
    + `브랜드에 맞고 간결하게. 모르는 사실은 추측하지 말고 자리표시자로 두세요.`;
}
function buildPrompt(store: AlphaStore, task: AlphaTask, type: OutputType, draft: boolean): string {
  const known = store.data.companyInfo.map(infoLabel).join(", ") || "없음";
  const base = `요청: "${task.title}"\n결과물 유형: ${type}\n보유 자료: ${known}`;
  // HQ Output Standard 주입 — 직원은 자유롭게 제출하지 않고 표준에 맞춰 작성
  const std = getOutputStandard(type);
  const stdBlock = std ? `\n\n${renderStandardForPrompt(std)}` : "";
  if (type === "image_brief") {
    return base + `\n실제 이미지는 만들지 말고, 디자이너가 쓸 연출 기획안/촬영 가이드/이미지 프롬프트 초안/필요 자료 체크리스트를 작성하세요. 맨 앞에 "실제 이미지는 아직 생성하지 않았습니다"를 명시하세요.` + stdBlock;
  }
  return base + (draft ? `\n자료가 일부 부족하므로 초안 수준으로 작성하세요.` : ``) + stdBlock;
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
    // 자료 탭: Company Knowledge Vault 전체(최신순) + 카테고리 목록
    vault: vaultView(store),
    categories: MATERIAL_CATEGORIES.map((c) => ({ key: c, label: CATEGORY_LABEL[c] })),
    // HQ 전문 직원 카탈로그(직군↔직원 분리, 계약 옵션·가격 Placeholder, HQ 판단)
    hqEmployees: hqCatalog(),
    // 크레딧 잔액(Placeholder) + 1회 이미지 생성 비용
    credits: store.data.credits,
    imageCreditCost: IMAGE_CREDIT_COST,
  };
}

/** HQ 전문 직원 카탈로그 — 직군별 그룹, 계약 옵션·가격·전문화·가능 업무 노출(고객 표시용). */
export function hqCatalog() {
  return bySpecialization().map((g) => ({
    roleFamily: g.roleFamily, roleTitle: roleTitle(g.roleFamily),
    employees: g.employees.map((e) => ({
      id: e.id, title: e.title, specialty: e.specialty,
      goodAt: e.goodAt, notSupported: e.notSupported, recommendedIndustries: e.recommendedIndustries,
      costTier: e.costTier, price: e.pricePlaceholder,
      contractOptions: e.contractOptions.map((o) => ({ label: o.label, unit: o.unit, price: o.pricePlaceholder })),
      version: e.version,
      supported: e.supported, notRecommended: e.notRecommended,
    })),
  }));
}

/** 결과물 탭 데이터 — 결과가 있는(전달/승인) 업무의 결과 카드들. */
export function resultsTab(tasks: AlphaTask[]) {
  return tasks
    .filter((t) => !t.hidden && t.results.length > 0 && (t.status === "delivered" || t.status === "approved"))
    .reverse()
    .flatMap((t) => t.results.map((r) => ({
      taskId: t.id, title: t.title, by: r.by, outputType: r.outputType,
      requestedOutputType: r.requestedOutputType, state: r.state,
      requestType: r.requestType, creditsUsed: r.creditsUsed ?? 0, standardLabel: r.standardLabel,
      approved: t.status === "approved", content: r.content,
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
  // 기존 자료 사용: 업무가 필요로 하는 infoKey 중 이번 업무에서 직접 제공하지 않았는데
  // 이미 Vault(companyInfo)에 있어 자동 활용된 항목 → "기존 자료 사용"으로 표시
  const requiredKeys = uniq(toSubTasks(t.outputTypes).flatMap((st) => st.requiredInfo));
  const providedKeys = new Set(t.materials.map((m) => m.infoKey));
  const have = new Set(store.data.companyInfo);
  const reusedMaterials = requiredKeys
    .filter((k) => have.has(k) && !providedKeys.has(k))
    .map((k) => ({ key: k, label: infoLabel(k) }));
  // HQ 판단: 이 업무 유형들에 대해 가능/비추천인 전문 직원 (고객이 아무 직원에게 못 시킴)
  const suitability = uniq(t.outputTypes).map((ot) => {
    const r = recommendForOutput(ot);
    return {
      outputType: ot,
      supported: r.supported.map((e) => ({ id: e.id, title: e.title })),
      notRecommended: r.notRecommended.map((e) => ({ id: e.id, title: e.title })),
    };
  });
  // 이미지 요청 수익화 흐름 상태
  const isVisualTask = t.outputTypes.some(isVisual);
  const credits = store.data.credits;
  const imageChoiceNeeded = isVisualTask && !t.imageChoice;
  const creditShortfall = isVisualTask && t.imageChoice === "credit" && credits < IMAGE_CREDIT_COST;
  const designerHired = store.data.employees.some((e) => e.dna.genome.roleFamily === "design");
  return {
    id: t.id, title: t.title, status: t.status, statusLabel: STATUS_LABEL[t.status],
    assignees: uniq(t.requiredRoles).map(roleTitle),
    neededMaterials: t.missingInfo.map((k) => ({ key: k, label: infoLabel(k) })),
    reusedMaterials,
    suitability,
    isVisualTask, imageChoice: t.imageChoice ?? null, imageChoiceNeeded,
    creditShortfall, credits, imageCreditCost: IMAGE_CREDIT_COST, designerHired,
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
    case "image_brief": return [
      `📋 이미지 제작 기획안 · ${by}`,
      `⚠️ 실제 이미지는 아직 생성하지 않았습니다. 대신 Designer Employee가 사용할 수 있는 연출 기획안/촬영 가이드/프롬프트 초안입니다.`,
      ``,
      `1) 연출 기획안: ${company} 신메뉴를 따뜻한 분위기로 연출 (예시 placeholder)`,
      `2) 촬영 가이드: 자연광·45도 앵글·우드톤 배경 권장 (예시 placeholder)`,
      `3) 이미지 프롬프트 초안: "${company} 신메뉴, 따뜻한 조명, 미니멀, 고해상도" (예시 placeholder)`,
      `4) 디자이너 요청서: 위 기획안 기반 1차 시안 요청`,
      `5) 필요 자료 체크리스트: 로고 · 브랜드 컬러 · 제품 사진 · 디자인 레퍼런스`,
      ``,
      `※ 자료가 부족하면 실제 제작 품질은 제한될 수 있습니다. 자료를 더 제공하면 더 정확한 기획안이 됩니다.`,
    ].join("\n");
    case "image": case "video": return `🎨 ${type === "image" ? "이미지" : "영상"} 제작 기획안 (실제 생성 아님) · ${by}`;
    default: return `[초안 · ${by}] (예시 placeholder)`;
  }
}

const uniq = <T>(a: T[]): T[] => [...new Set(a)];
