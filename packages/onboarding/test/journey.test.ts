import { test } from "node:test";
import assert from "node:assert/strict";
import { __resetIds } from "../../shared-types/src/index.ts";
import { CONSULT_QUESTIONS, CustomerJourney, JourneyTransitionError } from "../src/onboarding.ts";

test("onboarding: 컨설팅 질문 세트가 핵심 항목을 포함한다", () => {
  const keys = CONSULT_QUESTIONS.map((q) => q.key);
  for (const k of ["industry", "stage", "timeSink", "problem", "grow"]) assert.ok(keys.includes(k));
});

test("journey: 정상 경로 signup→…→created", () => {
  __resetIds();
  const j = new CustomerJourney("cus_1");
  for (const s of ["diagnosing", "designing", "recommending", "reviewing", "approving", "created"] as const) j.to(s);
  assert.ok(j.isCreated);
});

test("journey: 불법 전이는 차단된다 (signup→created 직행 불가)", () => {
  __resetIds();
  const j = new CustomerJourney("cus_1");
  assert.throws(() => j.to("created"), JourneyTransitionError);
});

test("journey: created는 반드시 approving을 거친다", () => {
  __resetIds();
  const j = new CustomerJourney("cus_1");
  j.to("diagnosing"); j.to("designing"); j.to("recommending"); j.to("reviewing");
  assert.throws(() => j.to("created"), JourneyTransitionError); // reviewing→created 직행 불가
});
