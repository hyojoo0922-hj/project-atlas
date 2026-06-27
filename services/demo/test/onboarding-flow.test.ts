import { test } from "node:test";
import assert from "node:assert/strict";
import { runOnboardingScenario } from "../src/onboarding-scenario.ts";

test("2A flow: 대표계정→진단권→…→첫업무 전 단계 동작 (DoD)", () => {
  const r = runOnboardingScenario();
  assert.ok(r.journey.isCreated);
  assert.deepEqual(r.journey.history, [
    "account_created", "voucher_activated", "diagnosing", "designing",
    "recommending", "reviewing", "approving", "created", "first_task",
  ]);
});

test("2A flow: 무료 사업진단권 1회 소진", () => {
  const r = runOnboardingScenario();
  assert.equal(r.account.voucher.total, 1);
  assert.equal(r.account.voucher.used, 1);
  assert.equal(r.account.voucher.active, true);
});

test("2A flow: 진단 핵심 병목=운영 → Operations 1순위", () => {
  const r = runOnboardingScenario();
  assert.equal(r.diagnosis.firstBuild, "operations");
  assert.equal(r.created.departments[0]!.name, "Operations");
  assert.equal(r.created.departments[0]!.priority, 1);
});

test("2A flow: 대표 승인 후에만 Company 생성, Writer Employee 포함", () => {
  const r = runOnboardingScenario();
  assert.equal(r.approval.status, "approved");
  assert.ok(r.created.employees.some((e) => e.dna.genome.roleFamily === "content"));
});

test("2A flow: 생성 후 첫 업무 추천 + 고객 3요소 뷰 제공", () => {
  const r = runOnboardingScenario();
  assert.equal(r.firstTask.label, "첫 업무 맡기기");
  assert.ok(r.firstTask.description.length > 0);
  // 모든 단계가 3요소(현재 단계/판단/다음 행동)를 갖는다
  assert.ok(r.customerViews.length >= 8);
  assert.ok(r.customerViews.every((c) => c.view.stage && c.view.cofounderJudgment && c.view.nextAction));
});

test("2A flow: 2B 범위 미포함 (운영 루프·Health·Growth 없음, first_task가 종착)", () => {
  const r = runOnboardingScenario();
  assert.equal(r.journey.state, "first_task");
  assert.ok(r.created.employees.every((e) => Array.isArray(e.recommendedSkills)));
});
