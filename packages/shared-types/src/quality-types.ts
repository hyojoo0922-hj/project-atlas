// MEMO #009 — 품질/신뢰 도메인 타입 (Trust First)
import type { Id, RoleFamily } from "./index.ts";

// ───────────────────────── Confidence / Readiness ─────────────────────────
/** 결과물 등급/상태 */
export type OutputState = "final" | "draft" | "info_request" | "out_of_scope";
/** 신뢰도 등급(고객 비노출, 내부 필수) */
export type ConfidenceLevel = "final" | "draft" | "info_request";

export interface ReadinessAssessment {
  employeeId: Id;
  roleFamily: RoleFamily;
  required: string[];
  present: string[];
  missing: string[];
  score: number;            // 0..100
  level: ConfidenceLevel;
}

// ───────────────────────── Output Scope ─────────────────────────
export type OutputType =
  | "text" | "document" | "image" | "video" | "ad_copy"
  | "report" | "social_post" | "product_page" | "customer_reply";

export type CostTier = "low" | "med" | "high" | "very_high";

export interface OutputScope {
  type: OutputType;
  requiredInfo: string[];
  requiredRoleFamilies: RoleFamily[];
  requiredSkills: string[];
  costTier: CostTier;
  qualityBar: "draft_ok" | "final_ge_90";
  /** 최소 정보(0)로도 mock 초안이 가능한 유형인가 (텍스트형=true, 이미지/영상=false) */
  minDraftOk: boolean;
}

// ───────────────────────── Employee-specific Onboarding ─────────────────────────
export interface EmployeeOnboardingQuestionSet {
  roleFamily: RoleFamily;
  title: string;             // 예: "Writer Employee"
  asks: string[];            // 직원이 필요해서 요청하는 자료
}

// ───────────────────────── Satisfaction / Outcome Feedback ─────────────────────────
export interface SatisfactionFeedback {
  runId: Id;
  overall: number;           // 1..5
  onBrand: number;           // 브랜드다움
  usefulness: number;
  willReuse: number;
  comment?: string;
}
export type OutcomeKind = "time_saved" | "more_inquiries" | "more_revenue" | "no_effect";
export interface OutcomeFeedback {
  runId: Id;
  daysAfter: number;         // 예: 7
  outcome: OutcomeKind;
}
