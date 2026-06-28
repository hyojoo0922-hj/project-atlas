import { test } from "node:test";
import assert from "node:assert/strict";
import type { CompanyEmployee, RoleFamily } from "../../shared-types/src/index.ts";
import { analyzeRequest, runWorkLoop } from "../src/work-loop.ts";

let seq = 0;
const idgen = (p: string) => `${p}_${++seq}`;
const emp = (roleFamily: RoleFamily, persona: string): CompanyEmployee => ({
  id: `${roleFamily}_emp`, companyId: "com_1", departmentId: "dep_1", rank: "junior",
  dna: { genome: { archetype: "creator", roleFamily }, phenotype: { persona, tone: "warm", locale: "ko-KR" },
    acquired: { traits: [], values: [] }, lineage: [] },
  recommendedSkills: [], memoryScope: ["voice", "product"],
});

test("분석: '오늘 신메뉴 홍보하고 싶어' → ad_copy·social_post·image", () => {
  const out = analyzeRequest("오늘 신메뉴 홍보하고 싶어");
  assert.ok(out.includes("ad_copy"));
  assert.ok(out.includes("social_post"));
  assert.ok(out.includes("image"));
});

test("정보 부족: 추측하지 않고 자료를 요청한다 (Trust First)", () => {
  // Writer 보유, 정보 없음 → content 작업은 need_info
  const r = runWorkLoop({ requestId: "tsk_1", ownerText: "신메뉴 소개 글 써줘",
    employees: [emp("content", "콘텐츠 라이터")], companyInfo: new Set() }, idgen);
  assert.ok(r.report.needed.info.length > 0);
  assert.equal(r.results.length, 0);          // 결과물 강제 생성 안 함
  assert.equal(r.state, "need_info");
});

test("직원 부족: 자연스럽게 채용을 추천한다 (업셀)", () => {
  // Writer만 보유 + 정보 충분 → content 실행, design(image)은 채용 추천
  const r = runWorkLoop({ requestId: "tsk_2", ownerText: "신메뉴 홍보하고 싶어",
    employees: [emp("content", "콘텐츠 라이터")],
    companyInfo: new Set(["brand-voice", "product-info", "target-audience", "channel"]) }, idgen);
  assert.ok(r.report.needed.hire.includes("Designer Employee"));
  assert.ok(r.results.some((x) => x.outputType !== "image"));   // 글은 수행
  assert.equal(r.report.overallState, "partial");
});

test("실행 가능: 정보·직원 충족 시 결과물(초안/최종본) 생성, 보고 제공", () => {
  const r = runWorkLoop({ requestId: "tsk_3", ownerText: "신메뉴 홍보 글 써줘",
    employees: [emp("content", "콘텐츠 라이터")],
    companyInfo: new Set(["brand-voice", "product-info", "target-audience", "channel", "topic", "tone"]) }, idgen);
  assert.ok(r.results.length > 0);
  assert.equal(r.state, "reported");
  assert.equal(r.report.feedbackRequest, true);
});

test("대표 비서는 결과물을 직접 만들지 않는다 — 직원이 생성(by 직원)", () => {
  const r = runWorkLoop({ requestId: "tsk_4", ownerText: "신메뉴 홍보 글 써줘",
    employees: [emp("content", "콘텐츠 라이터")],
    companyInfo: new Set(["brand-voice", "product-info", "target-audience", "channel"]) }, idgen);
  assert.ok(r.results.every((x) => x.employeePersona === "콘텐츠 라이터"));  // 직원이 수행
});
