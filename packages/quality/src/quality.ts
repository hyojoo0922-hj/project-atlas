// Quality — Trust First 순수 게이트(신뢰도·준비도·결과물 사양·직원 온보딩)
// 근거: docs/specs/{quality-boundary,employee-readiness,output-scope,progressive-company-learning}-spec.md
// 주의: 실제 결과물 생성/Work Loop는 하지 않는다(2B). 여기는 '구조·판단'만.
import type {
  ConfidenceLevel, EmployeeOnboardingQuestionSet, OutputScope, OutputType,
  ReadinessAssessment, RoleFamily,
} from "../../shared-types/src/index.ts";

// ── Confidence Threshold (≥90 최종본 / 70–89 초안 / <70 정보요청) ──
export const CONFIDENCE = { final: 90, draft: 70 } as const;
export function assessConfidence(score: number): ConfidenceLevel {
  if (score >= CONFIDENCE.final) return "final";
  if (score >= CONFIDENCE.draft) return "draft";
  return "info_request";
}

// ── Employee Readiness 체크리스트(직군별) ──
export const READINESS_CHECKLIST: Partial<Record<RoleFamily, string[]>> = {
  content: ["brand-voice", "product-info", "banned-terms", "past-content", "audience"],
  design: ["logo", "brand-color", "product-image", "design-reference", "banned-style"],
  support: ["faq", "tone", "refund-policy", "common-questions"],
};

/** 보유 자료 대비 준비도 점수·누락·등급 산출. */
export function computeReadiness(
  employeeId: string, roleFamily: RoleFamily, present: string[],
): ReadinessAssessment {
  const required = READINESS_CHECKLIST[roleFamily] ?? [];
  const have = new Set(present);
  const missing = required.filter((r) => !have.has(r));
  const score = required.length === 0 ? 100
    : Math.round(((required.length - missing.length) / required.length) * 100);
  return { employeeId, roleFamily, required, present: [...have], missing, score, level: assessConfidence(score) };
}

// ── Output Scope 레지스트리(유형별 사양) ──
export const OUTPUT_SCOPE: Record<OutputType, OutputScope> = {
  text: { type: "text", requiredInfo: ["topic", "tone"], requiredRoleFamilies: ["content"], requiredSkills: ["brand-voice-writer"], costTier: "low", qualityBar: "draft_ok", minDraftOk: true },
  ad_copy: { type: "ad_copy", requiredInfo: ["brand-voice", "product-info", "target-audience"], requiredRoleFamilies: ["content"], requiredSkills: ["brand-voice-writer"], costTier: "low", qualityBar: "final_ge_90", minDraftOk: true },
  social_post: { type: "social_post", requiredInfo: ["brand-voice", "channel"], requiredRoleFamilies: ["content"], requiredSkills: ["repurpose-to-channel"], costTier: "low", qualityBar: "draft_ok", minDraftOk: true },
  product_page: { type: "product_page", requiredInfo: ["product-info", "product-image", "policy"], requiredRoleFamilies: ["content", "design"], requiredSkills: ["brand-voice-writer"], costTier: "med", qualityBar: "final_ge_90", minDraftOk: true },
  image: { type: "image", requiredInfo: ["logo", "brand-color", "product-image", "design-reference"], requiredRoleFamilies: ["design"], requiredSkills: ["image-create"], costTier: "high", qualityBar: "final_ge_90", minDraftOk: false },
  video: { type: "video", requiredInfo: ["storyboard", "brand-assets", "design-reference"], requiredRoleFamilies: ["design"], requiredSkills: ["video-create"], costTier: "very_high", qualityBar: "final_ge_90", minDraftOk: false },
  document: { type: "document", requiredInfo: ["purpose", "source"], requiredRoleFamilies: ["content", "research"], requiredSkills: ["doc-writer"], costTier: "med", qualityBar: "draft_ok", minDraftOk: true },
  report: { type: "report", requiredInfo: ["data", "period", "goal"], requiredRoleFamilies: ["research"], requiredSkills: ["report-builder"], costTier: "med", qualityBar: "final_ge_90", minDraftOk: true },
  customer_reply: { type: "customer_reply", requiredInfo: ["faq", "tone", "policy"], requiredRoleFamilies: ["support"], requiredSkills: ["inquiry-responder"], costTier: "low", qualityBar: "final_ge_90", minDraftOk: true },
};
export function getOutputScope(type: OutputType): OutputScope { return OUTPUT_SCOPE[type]; }

// ── Employee-Specific Onboarding 질문(직원이 필요해서 묻는 구조) ──
export const ONBOARDING_QUESTIONS: EmployeeOnboardingQuestionSet[] = [
  { roleFamily: "content", title: "Writer Employee", asks: ["브랜드 말투", "대표 상품", "고객층", "기존 콘텐츠", "금지 표현"] },
  { roleFamily: "design", title: "Designer Employee", asks: ["로고", "브랜드 컬러", "제품 이미지", "디자인 레퍼런스", "금지 스타일"] },
  { roleFamily: "support", title: "CS Employee", asks: ["FAQ", "응대 톤", "환불/교환 정책", "자주 묻는 질문"] },
];
export function onboardingQuestionsFor(roleFamily: RoleFamily): EmployeeOnboardingQuestionSet | undefined {
  return ONBOARDING_QUESTIONS.find((q) => q.roleFamily === roleFamily);
}
