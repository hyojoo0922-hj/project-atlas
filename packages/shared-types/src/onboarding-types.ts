// Sprint 2A — 온보딩 / 회사 생성 도메인 타입
// 근거: docs/specs/{customer-journey,ai-business-diagnosis,company-creation-flow,org-recommendation}-spec.md
import type { Id, EmployeeDNA, MemoryKind, RoleFamily } from "./index.ts";

// ───────────────────────── 업종 / 성장 단계 ─────────────────────────
export type Industry = "cafe" | "ecommerce" | "beauty" | "saas";
/** 성장 단계(개정 #003) */
export type CompanyStage = "founding" | "early_growth" | "stabilize" | "scale" | "franchise";
export const STAGE_LABEL: Record<CompanyStage, string> = {
  founding: "창업", early_growth: "초기 성장", stabilize: "안정화", scale: "확장", franchise: "프랜차이즈",
};
export const STAGE_ORDER: CompanyStage[] = ["founding", "early_growth", "stabilize", "scale", "franchise"];

/** 진단 처방 초점(부서 도메인 축) */
export type FocusArea = "operations" | "marketing" | "content" | "customer_care";

// ───────────────────────── 회원가입 = 무료 AI 컨설팅 ─────────────────────────
/** 컨설팅 질문 1개 (질문 폼이 아니라 AI 컨설팅 질의) */
export interface ConsultQuestion {
  key: string;
  ask: string;            // 고객에게 보여줄 질문
  kind: "select" | "number" | "boolean" | "text";
  options?: string[];
  optional?: boolean;
}

export interface OnboardingResponse {
  id: Id;
  companyName: string;
  industry: Industry;
  stage: CompanyStage;
  employees: number;
  revenue?: number;        // 선택
  online: boolean;
  brand: boolean;
  timeSink: string;        // 가장 시간을 많이 쓰는 업무
  problem: string;         // 가장 해결하고 싶은 문제
  grow: string;            // 가장 성장시키고 싶은 분야
}

// ───────────────────────── AI Business Diagnosis ─────────────────────────
export interface DiagnosisPriority {
  focus: FocusArea;
  score: number;
  reason: string;
}
export interface Diagnosis {
  id: Id;
  responseId: Id;
  priorities: DiagnosisPriority[];   // 내림차순
  firstBuild: FocusArea;             // 핵심 병목 → 가장 먼저 만들 것
  bottleneck: string;                // 핵심 병목 판단(설명)
  rationale: string[];
  recommendedStage: CompanyStage;
}

// ───────────────────────── AI Organization Recommendation ─────────────────────────
export interface EmployeeRecommendation {
  role: string;            // 예: "콘텐츠 라이터"
  title: string;           // Employee 중심 표기, 예: "Writer Employee"
  roleFamily: RoleFamily;
  archetype: EmployeeDNA["genome"]["archetype"];
  traits: string[];
  recommendedSkills: string[];   // 2A: 추천(배포·인증은 2B)
}
export interface DepartmentRecommendation {
  focus: FocusArea;
  name: string;            // 예: "Operations"
  mandate: string;
  priority: number;        // 1 = 최우선(진단 기반)
  requiredSkills: string[];
  seedEmployees: EmployeeRecommendation[];
}
export interface OrgRecommendation {
  id: Id;
  industry: Industry;
  stage: CompanyStage;
  departments: DepartmentRecommendation[];   // priority 오름차순
  rationale: string[];
}

// ───────────────────────── Company Design Draft (AI 설계안) ─────────────────────────
export interface CeoDesign {
  decisionStyle: { delegation: "low" | "medium" | "high"; speed: "slow" | "fast"; basis: "data" | "intuition" };
  riskAppetite: "low" | "medium" | "high";
  brandPriority: string[];
  growthStrategy: { targetStage: CompanyStage; focus: FocusArea[] };
}
export interface CompanyDesignDraft {
  id: Id;
  responseId: Id;
  diagnosisId: Id;
  recommendationId: Id;
  company: { name: string; industry: Industry; stage: CompanyStage; goal: string };
  ceo: CeoDesign;
  departments: DepartmentRecommendation[];
  rationale: string[];
  status: "draft" | "approved" | "rejected";
}

// ───────────────────────── 생성된 조직 객체 ─────────────────────────
export interface Company {
  id: Id;
  customerId: Id;
  name: string;
  industry: Industry;
  stage: CompanyStage;
  goal: string;
  ceoId: Id;
}
export interface CEO {
  id: Id;
  companyId: Id;
  dna: EmployeeDNA;
  decisionStyle: CeoDesign["decisionStyle"];
  riskAppetite: CeoDesign["riskAppetite"];
  brandPriority: string[];
  growthStrategy: CeoDesign["growthStrategy"];
  authority: { canReorg: boolean; approvesFounding: boolean };
}
export interface Department {
  id: Id;
  companyId: Id;
  name: string;
  focus: FocusArea;
  mandate: string;
  priority: number;
  requiredSkills: string[];
}
export interface CompanyEmployee {
  id: Id;
  companyId: Id;
  departmentId: Id;
  rank: "junior" | "senior" | "lead";
  dna: EmployeeDNA;
  recommendedSkills: string[];      // 2A: 추천. 인증·배포는 2B.
  memoryScope: MemoryKind[];
}

// 조직 트리
export type OrgNodeKind = "company" | "ceo" | "department" | "employee";
export interface OrgNode {
  id: Id;
  companyId: Id;
  kind: OrgNodeKind;
  refId: Id;
  parentId: Id | null;
  childrenIds: Id[];
}

// 창업 승인
export interface ApprovalRequest {
  id: Id;
  kind: "founding";
  draftId: Id;
  resolvedDecision: "ceo";          // 대표(고객) 승인
  status: "pending" | "approved" | "rejected";
}

// 생성 결과 묶음
export interface CreatedCompany {
  company: Company;
  ceo: CEO;
  departments: Department[];
  employees: CompanyEmployee[];
  tree: OrgNode[];
}

// ───────────────────────── 대표 계정 / 무료 사업진단권 (UX Sprint #001) ─────────────────────────
export interface DiagnosisVoucher {
  total: number;     // 계정당 1
  used: number;
  active: boolean;   // 활성화 여부
}
export interface OwnerAccount {
  id: Id;
  ownerName: string;          // 대표
  voucher: DiagnosisVoucher;
}

/** Company 생성 직후 첫 업무 추천 (실행 아님 — 2B에서 운영) */
export interface FirstTaskSuggestion {
  departmentName: string;
  employeePersona: string;
  skill: string;
  label: string;              // CTA: "첫 업무 맡기기"
  description: string;
}

/** 고객 화면 항상-노출 3요소 (현재 단계 / 공동창업자의 판단 / 대표의 다음 행동) */
export interface CustomerView {
  stage: string;              // 현재 단계
  cofounderJudgment: string;  // 공동창업자의 판단 (점수 아닌 '판단')
  nextAction: string;         // 대표의 다음 행동 (CTA)
}

// ───────────────────────── 무료/유료 경계 (BUSINESS MEMO #008) ─────────────────────────
/** 무료 산출물: 회사 설계안 Preview + 기대 효과 (실제 Company 생성 아님) */
export interface ExpectedEffect {
  savedHoursPerWeek: number;
  summary: string[];
}
export interface CompanyProposal {
  id: Id;
  draftId: Id;
  expectedEffect: ExpectedEffect;
  designPreview: {
    companyName: string;
    departments: { name: string; priority: number; employeeTitles: string[]; skills: string[] }[];
  };
  status: "proposal_ready";   // 무료 종착
}

/** 유료 전환 결제 확인 */
export interface PaymentConfirmation {
  id: Id;
  plan: string;
  confirmed: boolean;
}

/** 대표 비서 — 유료(회사 설립) 후 출근 */
export interface OwnerAssistant {
  id: Id;
  companyId: Id;
  status: "on_duty";
  role: string[];
}

/** 업셀링 — 부족 직원 채용 추천(순수 분석, 결과물 미생성) */
export interface StaffingAnalysis {
  requiredRoleFamilies: RoleFamily[];
  presentRoleFamilies: RoleFamily[];
  missingRoleFamilies: RoleFamily[];
  canPartial: boolean;
  upsellMessage: string;
}

// Customer Journey 상태 (BUSINESS MEMO #008 — 무료/유료 분리)
export type JourneyState =
  // 무료 (진단·추천)
  | "account_created" | "voucher_activated" | "diagnosing" | "designing"
  | "recommending" | "reviewing" | "proposal_ready" | "revising"
  // 유료 (실행·운영)
  | "payment_required" | "company_activation" | "company_created"
  | "assistant_on_duty" | "first_employee_ready";
