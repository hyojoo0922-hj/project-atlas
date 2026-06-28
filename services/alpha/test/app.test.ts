import { test } from "node:test";
import assert from "node:assert/strict";
import { rmSync } from "node:fs";
import { AlphaStore } from "../src/store.ts";
import {
  ALPHA_PASS, approveTask, assistantRequest, hire, login, provideInfo, reviseTask,
} from "../src/app.ts";

const tmp = () => {
  const p = `${process.env.TMPDIR ?? "/tmp"}/atlas-alpha-test-${Math.round(performance.now() * 1000)}.json`;
  try { rmSync(p); } catch { /* noop */ }
  return new AlphaStore(p);
};

test("criterion 1: 대표 로그인 (틀린 비번 거부)", () => {
  const s = tmp();
  assert.equal(login(s, "효주", "wrong").ok, false);
  const ok = login(s, "효주 대표", ALPHA_PASS);
  assert.equal(ok.ok, true);
  assert.equal(ok.ownerName, "효주 대표");
});

test("criteria 2·3·4: 분석 → 직원 부족 채용추천 + 정보 부족 자료요청 (추측 안 함)", () => {
  const s = tmp();
  const { result } = assistantRequest(s, "오늘 신메뉴 홍보하고 싶어");
  // 직원 부족(Designer) → 채용 추천
  assert.ok(result.report.needed.hire.includes("Designer Employee"));
  // 정보 부족 → 자료 요청 (콘텐츠 직군)
  assert.ok(result.report.needed.info.length > 0);
  // 추측 금지: 정보 없는 작업은 결과물 미생성
  assert.equal(result.results.length, 0);
});

test("criterion 5: 정보 제공 후 보유 직원만 실행(부분), Designer는 여전히 추천", () => {
  const s = tmp();
  provideInfo(s, ["brand-voice", "product-info", "target-audience", "channel"]);
  const { result } = assistantRequest(s, "오늘 신메뉴 홍보하고 싶어");
  assert.ok(result.results.length > 0);                       // 콘텐츠 직원 실행
  assert.ok(result.results.every((r) => r.outputType !== "image")); // 이미지는 미실행
  assert.ok(result.report.needed.hire.includes("Designer Employee"));
  assert.equal(result.report.overallState, "partial");
});

test("progressive: Designer 채용 + 이미지 자료 제공 → 전체 전달(delivered)", () => {
  const s = tmp();
  provideInfo(s, ["brand-voice", "product-info", "target-audience", "channel",
    "logo", "brand-color", "product-image", "design-reference"]);
  hire(s, "design", "디자이너");
  const { result } = assistantRequest(s, "오늘 신메뉴 홍보하고 싶어");
  assert.ok(result.results.some((r) => r.outputType === "image"));
  assert.equal(result.report.overallState, "delivered");
  assert.equal(result.report.needed.hire.length, 0);
});

test("criterion 6: 대표가 승인 / 수정 요청", () => {
  const s = tmp();
  provideInfo(s, ["brand-voice", "channel"]);
  const { task } = assistantRequest(s, "신메뉴 소개 글 써줘");
  assert.equal(approveTask(s, task.id, { overall: 5, comment: "좋아요" }), true);
  assert.equal(s.data.tasks.find((t) => t.id === task.id)!.status, "approved");

  const { task: t2 } = assistantRequest(s, "이벤트 글 써줘");
  const revised = reviseTask(s, t2.id, "더 캐주얼하게");
  assert.ok(revised);
  assert.equal(s.data.tasks.find((t) => t.id === t2.id)!.status, "revise");
});

test("persistence: 재시작(재로딩) 후 회사·정보·업무 유지", () => {
  const p = `${process.env.TMPDIR ?? "/tmp"}/atlas-alpha-persist-${Math.round(performance.now() * 1000)}.json`;
  try { rmSync(p); } catch { /* noop */ }
  const s1 = new AlphaStore(p);
  provideInfo(s1, ["brand-voice"]);
  assistantRequest(s1, "신메뉴 소개 글 써줘");
  const s2 = new AlphaStore(p);
  assert.ok(s2.data.companyInfo.includes("brand-voice"));
  assert.equal(s2.data.tasks.length, 1);
  assert.equal(s2.data.company.name, "로마티 카페");
});
