import { test } from "node:test";
import assert from "node:assert/strict";
import { runFreeScenario, runFullScenario } from "../src/onboarding-scenario.ts";

test("무료: 대표계정→진단→설계안 Preview(proposal_ready)까지, 실제 Company 없음", () => {
  const f = runFreeScenario();
  assert.ok(f.journey.isProposalReady);
  assert.ok(!f.journey.isCompanyCreated);
  assert.deepEqual(f.journey.history, [
    "account_created", "voucher_activated", "diagnosing", "designing", "recommending", "reviewing", "proposal_ready",
  ]);
  assert.equal(f.proposal.status, "proposal_ready");
  assert.ok(f.proposal.expectedEffect.savedHoursPerWeek > 0);   // 무료 기대효과 요약
});

test("무료: 진단권 1회 소진, 핵심 병목=운영 → Operations 1순위(추천만)", () => {
  const f = runFreeScenario();
  assert.equal(f.account.voucher.used, 1);
  assert.equal(f.diagnosis.firstBuild, "operations");
  assert.equal(f.recommendation.departments[0]!.name, "Operations");
});

test("무료 고객 뷰: '회사 생성 완료' 문구를 쓰지 않는다", () => {
  const f = runFreeScenario();
  const text = f.customerViews.map((c) => `${c.view.stage} ${c.view.cofounderJudgment}`).join(" ");
  assert.ok(!text.includes("생성 완료"));
});

test("유료 전환: 결제 후 회사 설립 + 대표 비서 출근 + 첫 직원 준비", () => {
  const { paid, free } = runFullScenario();
  assert.equal(free.journey.state, "first_employee_ready");
  assert.equal(paid.payment.confirmed, true);
  assert.equal(paid.created.company.name, "로마티 카페");
  assert.equal(paid.assistant.status, "on_duty");           // 대표 비서는 설립 후 출근
  assert.ok(paid.firstEmployeePersona.length > 0);
});
