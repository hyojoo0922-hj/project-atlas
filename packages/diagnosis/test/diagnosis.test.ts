import { test } from "node:test";
import assert from "node:assert/strict";
import { __resetIds } from "../../shared-types/src/index.ts";
import type { OnboardingResponse } from "../../shared-types/src/index.ts";
import { diagnose } from "../src/diagnosis.ts";

const base = (over: Partial<OnboardingResponse>): OnboardingResponse => ({
  id: "ob_1", companyName: "C", industry: "cafe", stage: "early_growth", employees: 3,
  online: false, brand: false, timeSink: "", problem: "", grow: "", ...over,
});

test("diagnosis: 카페(재고/발주) → 핵심 병목은 운영(operations)", () => {
  __resetIds();
  const d = diagnose(base({ timeSink: "재고/발주 관리", problem: "신규 고객 유입", grow: "온라인 매출" }));
  assert.equal(d.firstBuild, "operations");
  assert.ok(d.rationale.some((r) => r.includes("마케팅보다 운영")));
});

test("diagnosis: 같은 업종이라도 응답이 다르면 우선순위가 달라진다", () => {
  const opsFirst = diagnose(base({ timeSink: "재고/발주", problem: "신규 고객 유입" }));
  const contentFirst = diagnose(base({ timeSink: "디자인", problem: "브랜드 인지도", brand: false, online: true, grow: "브랜드" }));
  assert.equal(opsFirst.firstBuild, "operations");
  assert.equal(contentFirst.firstBuild, "content");
  assert.notEqual(opsFirst.firstBuild, contentFirst.firstBuild);
});

test("diagnosis: 모든 처방은 사유(reason)를 동반한다(설명 가능)", () => {
  const d = diagnose(base({ timeSink: "재고", problem: "유입" }));
  assert.ok(d.priorities.every((p) => p.reason.length > 0));
});
