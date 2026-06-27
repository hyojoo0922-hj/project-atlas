import { test } from "node:test";
import assert from "node:assert/strict";
import { __resetIds } from "../../shared-types/src/index.ts";
import type { SkillManifest } from "../../shared-types/src/index.ts";
import { SkillLibrary, IllegalTransitionError } from "../src/skill-library.ts";

const manifest: SkillManifest = {
  requiresMemory: ["voice"], guardrails: [],
  fitSignals: { roleFamily: "content", traits: ["creative"] },
  costTier: "standard", prereqCertSkillIds: [],
};

function freshVersion() {
  __resetIds();
  const lib = new SkillLibrary();
  const skill = lib.registerSkill("s", "content", "d");
  const sv = lib.publishVersion(skill.id, "0.1.0", manifest);
  return { lib, sv };
}

test("skill: 단계 건너뛰기(불법 전이)는 차단된다 — ROI 없이 roi_evaluated 불가", () => {
  const { lib, sv } = freshVersion();
  lib.advance(sv.id); // discovered -> analyzed
  lib.advance(sv.id); // analyzed -> sandboxed
  assert.throws(() => lib.advance(sv.id), IllegalTransitionError); // sandboxed -> roi_evaluated 차단(ROI pending)
});

test("skill: ROI 게이트 — status!=go면 recommended로 전진 불가", () => {
  const { lib, sv } = freshVersion();
  lib.advanceTo(sv.id, "sandboxed");
  lib.setRoi(sv.id, { status: "hold", roiScore: 0.4, recommendedMode: "credit" });
  assert.equal(lib.getVersion(sv.id)!.lifecycleState, "hold");
});

test("skill: ROI kill이면 killed 상태", () => {
  const { lib, sv } = freshVersion();
  lib.advanceTo(sv.id, "sandboxed");
  lib.setRoi(sv.id, { status: "kill", roiScore: 0.1, recommendedMode: "credit" });
  assert.equal(lib.getVersion(sv.id)!.lifecycleState, "killed");
});

test("skill: ROI go면 10단계 끝(measured)까지 정상 전진", () => {
  const { lib, sv } = freshVersion();
  lib.advanceTo(sv.id, "sandboxed");
  lib.setRoi(sv.id, { status: "go", roiScore: 3, recommendedMode: "hosted" });
  lib.advanceTo(sv.id, "measured");
  assert.equal(lib.getVersion(sv.id)!.lifecycleState, "measured");
});
