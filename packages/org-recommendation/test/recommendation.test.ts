import { test } from "node:test";
import assert from "node:assert/strict";
import { __resetIds } from "../../shared-types/src/index.ts";
import type { OnboardingResponse } from "../../shared-types/src/index.ts";
import { diagnose } from "../../diagnosis/src/diagnosis.ts";
import { recommendOrganization } from "../src/recommendation.ts";

const cafe = (over: Partial<OnboardingResponse> = {}): OnboardingResponse => ({
  id: "ob_1", companyName: "C", industry: "cafe", stage: "early_growth", employees: 3,
  online: false, brand: false, timeSink: "재고/발주", problem: "신규 고객 유입", grow: "온라인 매출", ...over,
});

test("recommendation: 카페 early_growth → Operations + Marketing (Customer Care는 아직)", () => {
  __resetIds();
  const d = diagnose(cafe());
  const rec = recommendOrganization("cafe", "early_growth", d);
  const names = rec.departments.map((x) => x.name);
  assert.deepEqual(names.sort(), ["Marketing", "Operations"]);
  assert.ok(!names.includes("Customer Care"));
});

test("recommendation: 진단 병목(operations)이 1순위 부서가 된다", () => {
  const d = diagnose(cafe());
  const rec = recommendOrganization("cafe", "early_growth", d);
  assert.equal(rec.departments[0]!.name, "Operations");
  assert.equal(rec.departments[0]!.priority, 1);
});

test("recommendation: 단계가 다르면 조직이 다르다 (동일 시작 금지)", () => {
  const d = diagnose(cafe({ stage: "founding" }));
  const founding = recommendOrganization("cafe", "founding", d);
  const stabilize = recommendOrganization("cafe", "stabilize", d);
  assert.deepEqual(founding.departments.map((x) => x.name), ["Operations"]);
  assert.ok(stabilize.departments.map((x) => x.name).includes("Customer Care"));
});

test("recommendation: 추천 직원/Skill 구조를 포함한다", () => {
  const d = diagnose(cafe());
  const rec = recommendOrganization("cafe", "early_growth", d);
  const mkt = rec.departments.find((x) => x.name === "Marketing")!;
  assert.equal(mkt.seedEmployees[0]!.title, "Writer Employee");
  assert.ok(mkt.seedEmployees[0]!.recommendedSkills.includes("brand-voice-writer"));
});
