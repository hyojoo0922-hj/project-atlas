import { test } from "node:test";
import assert from "node:assert/strict";
import { __resetIds } from "../../shared-types/src/index.ts";
import type { MatchingProfile, SkillVersion } from "../../shared-types/src/index.ts";
import { computeFit, recommend, FIT_THRESHOLD } from "../src/matching-engine.ts";

const profile = (over: Partial<MatchingProfile> = {}): MatchingProfile => ({
  employeeId: "emp_1", roleFamily: "content", traits: ["creative", "concise"],
  trackRecord: {}, certifiedSkillVersionIds: [], ...over,
});

const sv = (over: Partial<SkillVersion> = {}): SkillVersion => ({
  id: "skv_1", skillId: "skl_1", version: "0.1.0", lifecycleState: "recommended",
  roi: { status: "go", roiScore: 3, recommendedMode: "hosted" },
  manifest: {
    requiresMemory: ["voice"], guardrails: [],
    fitSignals: { roleFamily: "content", traits: ["creative"] },
    costTier: "standard", prereqCertSkillIds: [],
  }, ...over,
});

test("matching: 설명 가능 — breakdown과 reasons를 함께 반환", () => {
  __resetIds();
  const f = computeFit(profile(), sv(), { availableMemoryKinds: ["voice"], budgetHeadroom: 1 });
  assert.ok(f.score > 0 && f.score <= 1);
  assert.ok("roleFamily" in f.breakdown && "trackRecord" in f.breakdown);
  assert.ok(f.reasons.length > 0);
});

test("matching: 선행 인증 미충족 시 eligible=false (배치 부적격)", () => {
  const skill = sv({ manifest: { ...sv().manifest, prereqCertSkillIds: ["skv_999"] } });
  const f = computeFit(profile(), skill, { availableMemoryKinds: ["voice"], budgetHeadroom: 1 });
  assert.equal(f.eligible, false);
});

test("matching: trackRecord(성과)가 점수를 끌어올린다 — 성장 루프", () => {
  const base = computeFit(profile(), sv(), { availableMemoryKinds: ["voice"], budgetHeadroom: 1 });
  const grown = computeFit(profile({ trackRecord: { content: 0.9 } }), sv(),
    { availableMemoryKinds: ["voice"], budgetHeadroom: 1 });
  assert.ok(grown.score > base.score);
});

test("matching: recommend는 임계 미만/부적격을 제외", () => {
  const low = sv({ id: "skv_low", manifest: { ...sv().manifest, fitSignals: { roleFamily: "support", traits: [] } } });
  const recos = recommend(profile(), [sv(), low], { availableMemoryKinds: ["voice"], budgetHeadroom: 1 });
  assert.ok(recos.every((r) => r.score >= FIT_THRESHOLD));
  assert.ok(!recos.some((r) => r.skillVersionId === "skv_low"));
});
