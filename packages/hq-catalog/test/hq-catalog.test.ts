import { test } from "node:test";
import assert from "node:assert/strict";
import {
  bySpecialization, contractOptionsFor, getSpecialized, HQ_EMPLOYEES, judgeSuitability,
  judgeSuitabilityById, listSpecialized, recommendForOutput, SUITABILITY_LABEL,
} from "../src/hq-catalog.ts";

test("전문 직원: 직군과 직원이 분리되어 있다(Writer 4종·Designer 5종+Video)", () => {
  const writers = listSpecialized("content");
  assert.ok(writers.length >= 4);
  assert.ok(writers.every((w) => w.roleFamily === "content"));
  const designIds = listSpecialized("design").map((d) => d.id);
  ["designer-sns", "designer-package", "designer-landing", "designer-print", "designer-luxury"].forEach((id) =>
    assert.ok(designIds.includes(id), `missing ${id}`));
  assert.ok(designIds.includes("producer-video"));
});

test("전문 직원: 잘하는/지원안하는 업무·추천 업종·전문 분야를 가진다", () => {
  for (const e of HQ_EMPLOYEES) {
    assert.ok(e.specialty.length > 0);
    assert.ok(e.goodAt.length > 0);
    assert.ok(e.notSupported.length > 0);
    assert.ok(e.recommendedIndustries.length > 0);
  }
});

test("가격: 원가 기준(costTier) — Writer 낮음 / Designer 중간 이상 / Video 매우 높음, 모두 Placeholder", () => {
  assert.equal(getSpecialized("writer-sns")!.costTier, "low");
  assert.ok(["medium", "high"].includes(getSpecialized("designer-sns")!.costTier));
  assert.equal(getSpecialized("producer-video")!.costTier, "very_high");
  // 가격은 실금액이 아니라 Placeholder 문자열
  assert.ok(HQ_EMPLOYEES.every((e) => /Placeholder/.test(e.pricePlaceholder)));
});

test("계약 옵션: 직원마다 기간/단위가 다르다(Writer 7/30/90일, Video 프로젝트, Marketing 월, AI 비서 회사)", () => {
  const w = contractOptionsFor("writer-sns").map((o) => o.days);
  assert.deepEqual(w, [7, 30, 90]);
  assert.equal(contractOptionsFor("designer-sns").length, 2);            // 7/30일
  assert.equal(contractOptionsFor("producer-video")[0]!.unit, "project");
  assert.equal(contractOptionsFor("marketer-campaign")[0]!.unit, "monthly");
  assert.equal(contractOptionsFor("assistant-owner")[0]!.unit, "company");
  // 모든 계약 옵션 가격은 Placeholder
  assert.ok(HQ_EMPLOYEES.flatMap((e) => e.contractOptions).every((o) => /Placeholder/.test(o.pricePlaceholder)));
});

test("HQ 판단: 가능 / 비추천 / 지원 안 함", () => {
  const sns = getSpecialized("writer-sns")!;
  assert.equal(judgeSuitability(sns, "social_post"), "supported");      // 가능
  assert.equal(judgeSuitability(sns, "report"), "not_recommended");     // 비추천
  assert.equal(judgeSuitability(sns, "image"), "unsupported");          // 지원 안 함
  assert.equal(SUITABILITY_LABEL.unsupported, "지원 안 함");
});

test("HQ 판단: 고객은 아무 직원에게 아무 업무를 시킬 수 없다 — 미지원 직원은 unsupported", () => {
  // CS 직원에게 이미지 업무 → 지원 안 함
  assert.equal(judgeSuitabilityById("cs-responder", "image"), "unsupported");
  // 없는 직원 id → 지원 안 함
  assert.equal(judgeSuitabilityById("no-such-employee", "social_post"), "unsupported");
});

test("업무별 HQ 추천: supported/notRecommended 분류", () => {
  const r = recommendForOutput("social_post");
  const supIds = r.supported.map((e) => e.id);
  assert.ok(supIds.includes("writer-sns"));
  assert.ok(supIds.includes("marketer-campaign"));
  assert.ok(!supIds.includes("producer-video"));          // 영상 직원은 SNS 글 미지원
  // customer_reply는 CS만 가능
  const cr = recommendForOutput("customer_reply");
  assert.deepEqual(cr.supported.map((e) => e.id), ["cs-responder"]);
});

test("버전: 모든 전문 직원이 버전을 가진다(자동 업데이트 안 함의 토대)", () => {
  assert.ok(HQ_EMPLOYEES.every((e) => /^\d+\.\d+\.\d+$/.test(e.version)));
});

test("그룹핑: roleFamily별 카탈로그(빈 직군 제외)", () => {
  const groups = bySpecialization();
  assert.ok(groups.find((g) => g.roleFamily === "content")!.employees.length >= 4);
  assert.ok(groups.every((g) => g.employees.length > 0));
});
