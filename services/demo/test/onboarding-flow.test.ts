import { test } from "node:test";
import assert from "node:assert/strict";
import { runOnboardingScenario } from "../src/onboarding-scenario.ts";

test("2A flow: 카페 온보딩이 끝까지 동작 (DoD)", () => {
  const r = runOnboardingScenario();
  assert.ok(r.journey.isCreated);
  assert.deepEqual(r.journey.history, [
    "signup", "diagnosing", "designing", "recommending", "reviewing", "approving", "created",
  ]);
});

test("2A flow: 진단 핵심 병목 = 운영 → Operations 1순위", () => {
  const r = runOnboardingScenario();
  assert.equal(r.diagnosis.firstBuild, "operations");
  assert.equal(r.recommendation.departments[0]!.name, "Operations");
  assert.equal(r.created.departments[0]!.priority, 1);
});

test("2A flow: 대표 승인 후에만 Company 생성, Writer Employee 포함", () => {
  const r = runOnboardingScenario();
  assert.equal(r.approval.status, "approved");
  assert.equal(r.draft.status, "approved");
  assert.ok(r.created.employees.some((e) => e.dna.genome.roleFamily === "content"));
});

test("2A flow: 2B 범위는 미포함 (Health/Growth/운영 없음)", () => {
  const r = runOnboardingScenario();
  // 생성까지만 — created 상태가 종착점
  assert.equal(r.journey.state, "created");
  // CompanyEmployee의 Skill은 '추천'일 뿐 배포/인증 아님(2B)
  assert.ok(r.created.employees.every((e) => Array.isArray(e.recommendedSkills)));
});
