// Employee Contract & Pricing — 직원은 "구매"가 아니라 "계약"이다.
// 근거: docs/CEO_MEMOS/EMPLOYEE_CONTRACT_AND_PRICING_CONSTITUTION.md, ADR 0013.
// 주의: 이번 Sprint는 구조만 — 실결제/실금액/만료 타이머 없음(가격·기간은 Placeholder).
import type { OutputType, RoleFamily } from "./index.ts";

/** 원가 기준 가격 등급 (직군이 아니라 원가로 매긴다) */
export type CostTier = "low" | "medium" | "high" | "very_high";

/** 계약 단위 — 직원마다 다를 수 있다 */
export type ContractUnit = "days" | "project" | "monthly" | "company";

/** 계약 상태 — active → 만료 임박 → 만료(연장/종료 선택) */
export type ContractState = "active" | "expiring" | "ended";

/** 계약 종료 시 선택지 */
export type ContractDecision = "extend" | "end";

/** 직원별 계약 옵션 (HQ 관리, 가격/기간은 Placeholder) */
export interface ContractOption {
  unit: ContractUnit;
  days?: number;              // unit === "days" 일 때만
  label: string;              // "7일", "프로젝트 단위", "월 단위", "회사 계약"
  pricePlaceholder: string;   // "₩— · Placeholder"
}

/** HQ 적합성 판단 결과: 가능 / 비추천 / 지원 안 함 */
export type SuitabilityVerdict = "supported" | "not_recommended" | "unsupported";

/** 전문 직원 — 직군(RoleFamily)과 분리된 구체 직원. HQ가 카탈로그를 관리한다. */
export interface SpecializedEmployee {
  id: string;                        // "writer-sns"
  roleFamily: RoleFamily;            // 소속 직군
  title: string;                     // "SNS Writer"
  specialty: string;                 // 전문 분야
  goodAt: string[];                  // 잘하는 업무
  notSupported: string[];            // 지원하지 않는 업무
  recommendedIndustries: string[];   // 추천 업종
  costTier: CostTier;                // 원가 기준 가격 등급
  pricePlaceholder: string;          // 가격 Placeholder
  contractOptions: ContractOption[]; // 계약 옵션(기간/단위)
  version: string;                   // 직원 버전(업데이트 모델 토대 — 자동 업데이트 안 함)
  supported: OutputType[];           // HQ 판단: 가능 업무
  notRecommended: OutputType[];      // HQ 판단: 비추천 업무(가능하나 권장 안 함)
  // 그 외 OutputType = 지원 안 함(unsupported)
}
