import { test } from "node:test";
import assert from "node:assert/strict";
import { runScenario } from "../src/scenario.ts";
import { Orchestrator, DeploymentBlockedError } from "../../orchestrator/src/orchestrator.ts";
import { __resetIds } from "../../../packages/shared-types/src/index.ts";

test("flow: 데모 시나리오가 끝까지 동작한다 (DoD)", () => {
  const r = runScenario();
  // 인증 active
  const cert = r.orch.employees.getCert(r.writer.certifications[0]!)!;
  assert.equal(cert.status, "active");
  // 배치됨 + certified
  const asn = r.orch.getAssignments(r.writer.id)[0]!;
  assert.equal(asn.certified, true);
  // 업무 성공 + mock 결과 존재
  assert.equal(r.work.run.status, "succeeded");
  assert.ok(r.work.run.output && r.work.run.output.includes("MOCK"));
});

test("flow: Cost는 0(mock)이고 Ledger에 Usage/ROI가 기록된다", () => {
  const r = runScenario();
  const sum = r.orch.gateway.summary();
  assert.equal(sum.cost, 0);
  assert.equal(sum.calls, 1);
  assert.ok(sum.roi > 0);                 // ROI 기록됨
  const e = r.orch.gateway.getLedger()[0]!;
  assert.ok(e.tokensIn > 0 && e.tokensOut > 0);
});

test("flow: 성과가 MatchingProfile에 반영되어 '다음 추천이 달라진다'", () => {
  const r = runScenario();
  const before = r.recoInitial.map((f) => f.skillVersionId).sort();
  const after = r.recoAfter.map((f) => f.skillVersionId).sort();
  assert.notDeepEqual(before, after);                 // 추천이 변함
  assert.ok(after.length > before.length);            // 새 Skill이 추가됨
  assert.ok(after.includes(r.skillB.id));             // repurpose가 새로 추천됨
  assert.ok(!before.includes(r.skillB.id));           // 초기엔 없었음
});

test("flow: 미인증 (직원×Skill)은 배치(Deployment)가 차단된다", () => {
  __resetIds();
  const o = new Orchestrator();
  const skill = o.skills.registerSkill("x", "content", "d");
  const sv = o.skills.publishVersion(skill.id, "0.1.0", {
    requiresMemory: [], guardrails: [], fitSignals: { roleFamily: "content", traits: [] },
    costTier: "light", prereqCertSkillIds: [],
  });
  const e = o.employees.hire({
    brandId: "brd_1", archetype: "creator", roleFamily: "content", persona: "p",
    tone: "warm", locale: "ko-KR", traits: [], values: [], memoryScope: [], guardrails: [], budgetId: "bdg_1",
  });
  assert.throws(() => o.deploy(e.id, sv.id), DeploymentBlockedError);
});
