// Sprint 2A 시나리오 — 카페 seed (CPO 고정 흐름과 1:1)
// 무료 AI 컨설팅 → 진단 → 핵심 병목 → 회사 설계안 → 추천 → 대표 승인 → Company 생성
import { __resetIds, newId } from "../../../packages/shared-types/src/index.ts";
import type { OnboardingResponse } from "../../../packages/shared-types/src/index.ts";
import { OnboardingFlow, type OnboardingResult } from "../../onboarding/src/onboarding-flow.ts";

/** 결정적 카페 시나리오. */
export function runOnboardingScenario(deterministic = true): OnboardingResult {
  if (deterministic) __resetIds();
  const customerId = newId("cus");
  const answers: Omit<OnboardingResponse, "id"> = {
    companyName: "로마티 카페",
    industry: "cafe",
    stage: "early_growth",
    employees: 3,
    online: false,
    brand: false,
    timeSink: "재고/발주 관리",
    problem: "신규 고객 유입",
    grow: "온라인 매출",
  };
  return new OnboardingFlow().run(customerId, "로마티 대표", answers);
}
