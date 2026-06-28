// Sprint 2A + MEMO #008 시나리오 — 카페 seed
// 무료(진단·추천·설계안 Preview) → [결제] → 유료(회사 설립·대표 비서·첫 직원)
import { __resetIds, newId } from "../../../packages/shared-types/src/index.ts";
import type { OnboardingResponse, PaymentConfirmation } from "../../../packages/shared-types/src/index.ts";
import {
  OnboardingFlow, type OnboardingFreeResult, type OnboardingPaidResult,
} from "../../onboarding/src/onboarding-flow.ts";

export interface ScenarioResult {
  flow: OnboardingFlow;
  free: OnboardingFreeResult;
  paid: OnboardingPaidResult;   // 데모를 위해 결제 전환까지 포함
}

const CAFE: Omit<OnboardingResponse, "id"> = {
  companyName: "로마티 카페", industry: "cafe", stage: "early_growth", employees: 3,
  online: false, brand: false, timeSink: "재고/발주 관리", problem: "신규 고객 유입", grow: "온라인 매출",
};

/** 무료 단계만 실행 (실제 Company 생성 없음). */
export function runFreeScenario(deterministic = true): OnboardingFreeResult {
  if (deterministic) __resetIds();
  return new OnboardingFlow().runFree(newId("cus"), "로마티 대표", CAFE);
}

/** 무료 → 결제 → 유료 전환까지 실행. */
export function runFullScenario(deterministic = true): ScenarioResult {
  if (deterministic) __resetIds();
  const flow = new OnboardingFlow();
  const free = flow.runFree(newId("cus"), "로마티 대표", CAFE);
  const payment: PaymentConfirmation = { id: newId("pay"), plan: "운영 플랜", confirmed: true };
  const paid = flow.convertToPaid(payment);
  return { flow, free, paid };
}
