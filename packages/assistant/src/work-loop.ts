// 대표 비서 Work Loop 엔진 — 요청→분석→직원선택→정보/품질 게이트→배분→취합→보고
// 근거: docs/specs/assistant-work-loop-spec.md
// 원칙(Cost First): AI 호출 0 — 규칙 기반 분석 + mock 결과물. Trust First: 부족하면 미실행.
import type {
  CompanyEmployee, EmployeeResult, Id, OutputType, OwnerReport, RoleFamily,
  SubTask, SubTaskPlan, WorkLoopResult,
} from "../../shared-types/src/index.ts";
import { getOutputScope, assessConfidence } from "../../quality/src/quality.ts";

export interface WorkLoopInput {
  requestId: Id;
  ownerText: string;
  employees: CompanyEmployee[];
  /** 회사가 보유한 정보 키 집합 (Company Memory) */
  companyInfo: Set<string>;
}

const ROLE_TITLE: Record<RoleFamily, string> = {
  content: "Writer Employee", design: "Designer Employee", support: "CS Employee",
  operations: "Operations Employee", marketing: "Marketing Employee", research: "Research Employee",
};
export const roleTitle = (r: RoleFamily): string => ROLE_TITLE[r] ?? `${r} Employee`;

const INFO_LABEL: Record<string, string> = {
  "brand-voice": "브랜드 말투", "product-info": "상품 정보", "target-audience": "고객층",
  "product-image": "제품 이미지", "brand-color": "브랜드 컬러", "design-reference": "디자인 레퍼런스",
  "logo": "로고", "policy": "정책", "faq": "FAQ", "tone": "응대 톤", "channel": "채널",
  "topic": "주제", "purpose": "목적", "source": "자료", "data": "데이터", "period": "기간",
  "goal": "목표", "storyboard": "스토리보드", "brand-assets": "브랜드 자산",
};
export const infoLabel = (k: string): string => INFO_LABEL[k] ?? k;

/** 규칙 기반 의도 분석 — 요청 텍스트 → 결과물 유형 (AI 미사용). */
export function analyzeRequest(text: string): OutputType[] {
  const t = text.toLowerCase();
  const out = new Set<OutputType>();
  if (/홍보|광고|마케팅/.test(t)) { out.add("ad_copy"); out.add("social_post"); out.add("image"); }
  if (/콘텐츠|글|카피|포스트|sns|인스타|피드/.test(t)) out.add("social_post");
  if (/이미지|사진|디자인|배너|포스터|썸네일/.test(t)) out.add("image");
  if (/문의|응대|cs|고객\s*답|리뷰\s*답/.test(t)) out.add("customer_reply");
  if (/리포트|보고서|분석/.test(t)) out.add("report");
  if (/상세\s*페이지|제품\s*페이지|product\s*page/.test(t)) out.add("product_page");
  if (out.size === 0) out.add("text");
  return [...out];
}

/** 결과물 유형 → SubTask(들). product_page처럼 다직군 유형은 직군별로 분해. */
function toSubTasks(outputTypes: OutputType[]): SubTask[] {
  const subs: SubTask[] = [];
  for (const type of outputTypes) {
    const scope = getOutputScope(type);
    for (const roleFamily of scope.requiredRoleFamilies) {
      subs.push({ outputType: type, roleFamily, requiredInfo: scope.requiredInfo, requiredSkills: scope.requiredSkills });
    }
  }
  return subs;
}

/** Work Loop 실행. idgen은 호출측(스토어)이 주입(영속 id 충돌 방지). */
export function runWorkLoop(input: WorkLoopInput, idgen: (p: string) => Id): WorkLoopResult {
  const analysisId = idgen("ta");
  const outputTypes = analyzeRequest(input.ownerText);
  const subTasks = toSubTasks(outputTypes);

  const presentRoles = new Set(input.employees.map((e) => e.dna.genome.roleFamily));

  const plans: SubTaskPlan[] = subTasks.map((st) => {
    // 1) 필요 직원 확인
    if (!presentRoles.has(st.roleFamily)) {
      return { subTask: st, status: "need_staff", missingRoleFamilies: [st.roleFamily],
        missingInfo: [], readinessScore: 0, confidence: "info_request" };
    }
    // 2) 필요 정보 확인 (추측 금지 — 부족하면 요청)
    const missingInfo = st.requiredInfo.filter((k) => !input.companyInfo.has(k));
    const score = st.requiredInfo.length === 0 ? 100
      : Math.round(((st.requiredInfo.length - missingInfo.length) / st.requiredInfo.length) * 100);
    const confidence = assessConfidence(score);
    if (confidence === "info_request") {
      return { subTask: st, status: "need_info", missingRoleFamilies: [],
        missingInfo, readinessScore: score, confidence };
    }
    // 3) 실행 가능 — 직원 선택 (해당 직군 첫 직원; Alpha v0)
    const emp = input.employees.find((e) => e.dna.genome.roleFamily === st.roleFamily)!;
    return { subTask: st, status: "executable", selectedEmployeeId: emp.id,
      selectedEmployeePersona: emp.dna.phenotype.persona, missingRoleFamilies: [],
      missingInfo: [], readinessScore: score, confidence };
  });

  // 4) 배분 + mock 결과물 (실제 생성은 Sprint 3)
  const results: EmployeeResult[] = plans
    .filter((p) => p.status === "executable")
    .map((p) => ({
      outputType: p.subTask.outputType,
      employeeId: p.selectedEmployeeId!,
      employeePersona: p.selectedEmployeePersona!,
      state: p.confidence === "final" ? "final" : "draft",
      contentRef: `mock://${p.subTask.outputType}/${p.selectedEmployeeId}`,
    }));

  // 5) 취합 + 대표 보고
  const needHire = uniq(plans.filter((p) => p.status === "need_staff").flatMap((p) => p.missingRoleFamilies)).map(roleTitle);
  const needInfo = uniq(plans.filter((p) => p.status === "need_info").flatMap((p) => p.missingInfo));

  let overallState: OwnerReport["overallState"];
  if (results.length === 0) overallState = needHire.length ? "need_staff" : "need_info";
  else if (needHire.length || needInfo.length) overallState = "partial";
  else overallState = "delivered";

  const nextActions: string[] = [];
  needInfo.forEach((k) => nextActions.push(`${infoLabel(k)} 자료 제공하기`));
  needHire.forEach((t) => nextActions.push(`${t} 채용하기`));
  if (results.length) nextActions.push("결과 검토하기");

  const taskId = input.requestId;
  const report: OwnerReport = {
    taskId,
    summary: buildSummary(results, needInfo, needHire),
    deliverables: results.map((r) => ({ type: r.outputType, state: r.state, by: r.employeePersona, contentRef: r.contentRef })),
    needed: { info: needInfo, hire: needHire },
    nextActions,
    feedbackRequest: results.length > 0,
    overallState,
  };

  const state: WorkLoopResult["state"] =
    results.length ? "reported" : (needHire.length ? "need_staff" : (needInfo.length ? "need_info" : "blocked"));

  return { requestId: input.requestId, analysisId, outputTypes, plans, results, report, state };
}

function buildSummary(results: EmployeeResult[], needInfo: string[], needHire: string[]): string {
  const parts: string[] = [];
  if (results.length) {
    const done = results.map((r) => `${r.outputType}(${r.state === "final" ? "최종본" : "초안"})`).join(", ");
    parts.push(`완료: ${done}`);
  }
  if (needInfo.length) parts.push(`필요 자료: ${needInfo.map(infoLabel).join(", ")}`);
  if (needHire.length) parts.push(`채용 추천: ${needHire.join(", ")}`);
  return parts.join(" · ") || "처리할 작업이 없습니다.";
}

const uniq = <T>(a: T[]): T[] => [...new Set(a)];
