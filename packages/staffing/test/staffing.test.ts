import { test } from "node:test";
import assert from "node:assert/strict";
import { analyzeStaffing } from "../src/staffing.ts";

test("upsell: 필요 직원이 모두 있으면 수행 가능", () => {
  const a = analyzeStaffing(["content"], ["content", "operations"]);
  assert.deepEqual(a.missingRoleFamilies, []);
  assert.ok(a.upsellMessage.includes("수행할 수 있습니다"));
});

test("upsell: 일부만 보유 → 부족 직원 채용 추천(부분 가능)", () => {
  // 예: 신메뉴 콘텐츠 = content + design 필요, 보유는 content만
  const a = analyzeStaffing(["content", "marketing"], ["content"]);
  assert.deepEqual(a.missingRoleFamilies, ["marketing"]);
  assert.equal(a.canPartial, true);
  assert.ok(a.upsellMessage.includes("채용"));
});

test("upsell: 보유 직원이 전혀 없으면 채용해야 시작 가능", () => {
  const a = analyzeStaffing(["support"], ["content"]);
  assert.equal(a.canPartial, false);
  assert.ok(a.missingRoleFamilies.includes("support"));
});
