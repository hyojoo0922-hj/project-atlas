import { test } from "node:test";
import assert from "node:assert/strict";
import {
  assessConfidence, computeReadiness, getOutputScope, onboardingQuestionsFor,
} from "../src/quality.ts";

test("confidence: ≥90 최종본 / 70–89 초안 / <70 정보요청", () => {
  assert.equal(assessConfidence(95), "final");
  assert.equal(assessConfidence(80), "draft");
  assert.equal(assessConfidence(50), "info_request");
});

test("readiness: 자료 부족 → 누락 + info_request (결과물 강제 생성 안 함)", () => {
  const r = computeReadiness("emp_1", "design", ["logo", "brand-color"]);
  assert.equal(r.required.length, 5);
  assert.deepEqual(r.missing, ["product-image", "design-reference", "banned-style"]);
  assert.equal(r.score, 40);
  assert.equal(r.level, "info_request");
});

test("readiness: 전부 보유 → 최종본 가능", () => {
  const r = computeReadiness("emp_1", "support", ["faq", "tone", "refund-policy", "common-questions"]);
  assert.equal(r.score, 100);
  assert.equal(r.level, "final");
});

test("output scope: 유형별 필수 정보/직군/Skill/원가/품질 기준", () => {
  const adcopy = getOutputScope("ad_copy");
  assert.deepEqual(adcopy.requiredRoleFamilies, ["content"]);
  assert.equal(adcopy.qualityBar, "final_ge_90");
  const image = getOutputScope("image");
  assert.deepEqual(image.requiredRoleFamilies, ["design"]);
  assert.equal(image.costTier, "high");
});

test("employee onboarding: 직군별 직원이 필요해서 묻는 질문", () => {
  assert.ok(onboardingQuestionsFor("content")!.asks.includes("브랜드 말투"));
  assert.ok(onboardingQuestionsFor("design")!.asks.includes("로고"));
  assert.ok(onboardingQuestionsFor("support")!.asks.includes("FAQ"));
});
