import { test } from "node:test";
import assert from "node:assert/strict";
import { rmSync } from "node:fs";
import { AlphaStore } from "../src/store.ts";
import {
  ALPHA_PASS, approveTask, dashboard, executeTask, hire, login, proceedWithPartial,
  provideMaterial, registerTask, reviseTask, taskView,
} from "../src/app.ts";

const tmp = () => {
  const p = `${process.env.TMPDIR ?? "/tmp"}/atlas-fix-${Math.round(performance.now() * 1000)}.json`;
  try { rmSync(p); } catch { /* noop */ }
  return new AlphaStore(p);
};
const CONTENT_INFO = ["brand-voice", "product-info", "target-audience", "channel"];

test("로그인 + 대시보드 기본 구조(준비도·직원 카탈로그·우선순위)", () => {
  const s = tmp();
  assert.equal(login(s, "효주", "x").ok, false);
  assert.equal(login(s, "효주 대표", ALPHA_PASS).ok, true);
  const d = dashboard(s);
  assert.equal(typeof d.readiness, "number");
  assert.equal(d.employees.length, 5);                    // 채용 목록 5종
  assert.ok(d.priorities.length > 0);
  assert.equal(d.assistantOnDuty, true);
});

test("업무 등록 → 자료 대기, 부족 직원은 추천(비차단)", () => {
  const s = tmp();
  const t = registerTask(s, "오늘 신메뉴 홍보하고 싶어");
  assert.equal(t.status, "awaiting_materials");           // 정보 부족 → 추측 안 함
  assert.ok(t.missingInfo.length > 0);
  assert.ok(t.missingRoles.includes("design"));           // Designer 추천(비차단)
  assert.equal(t.results.length, 0);
});

test("자료 제공 → 실행 가능, Company Memory에 축적", () => {
  const s = tmp();
  const t = registerTask(s, "오늘 신메뉴 홍보하고 싶어");
  for (const k of CONTENT_INFO) provideMaterial(s, t.id, k, "text", `${k} 값`);
  const t2 = s.data.tasks.find((x) => x.id === t.id)!;
  assert.equal(t2.status, "ready");
  assert.ok(s.data.companyInfo.includes("brand-voice"));  // 메모리 축적
});

test("실행 → mock 결과물(글) 생성, 이미지는 추후 지원/미생성", () => {
  const s = tmp();
  const t = registerTask(s, "오늘 신메뉴 홍보하고 싶어");
  for (const k of CONTENT_INFO) provideMaterial(s, t.id, k, "text", "v");
  const done = executeTask(s, t.id)!;
  assert.equal(done.status, "delivered");
  assert.ok(done.results.length >= 1);
  assert.ok(done.results.every((r) => r.outputType !== "image"));  // 이미지 실제 생성 안 함
});

test("자료 미제공 시 실행 불가(추측 금지)", () => {
  const s = tmp();
  const t = registerTask(s, "신메뉴 소개 글 써줘");
  const r = executeTask(s, t.id)!;
  assert.notEqual(r.status, "delivered");
  assert.equal(r.results.length, 0);
});

test("승인 / 수정 요청 상태 전이", () => {
  const s = tmp();
  const t = registerTask(s, "신메뉴 소개 글 써줘");
  provideMaterial(s, t.id, "brand-voice", "text", "v");
  provideMaterial(s, t.id, "channel", "text", "v");
  executeTask(s, t.id);
  assert.equal(approveTask(s, t.id, { overall: 5 }), true);
  assert.equal(s.data.tasks.find((x) => x.id === t.id)!.status, "approved");

  const t2 = registerTask(s, "이벤트 글 써줘");
  provideMaterial(s, t2.id, "brand-voice", "text", "v");
  provideMaterial(s, t2.id, "channel", "text", "v");
  executeTask(s, t2.id);
  const rv = reviseTask(s, t2.id, "더 캐주얼하게")!;
  assert.equal(rv.status, "revise");
  assert.equal(rv.results.length, 0);                     // 수정 요청 시 결과 초기화
});

test("일부 자료만 제공 → '이대로 진행' 가능 표시(canProceedPartial)", () => {
  const s = tmp();
  const t = registerTask(s, "신메뉴 소개 글 써줘");     // social_post: brand-voice + channel
  provideMaterial(s, t.id, "brand-voice", "text", "따뜻하게");  // 1/2 제공
  const v = taskView(s, s.data.tasks.find((x) => x.id === t.id)!);
  assert.equal(v.status, "awaiting_materials");
  assert.equal(v.canProceedPartial, true);             // 일부만으로 진행 가능
});

test("'이대로 진행하기' → 초안 생성 + 일부 자료 부족 표시(partialMaterials)", () => {
  const s = tmp();
  const t = registerTask(s, "신메뉴 소개 글 써줘");
  provideMaterial(s, t.id, "brand-voice", "text", "따뜻하게");  // 일부만
  const done = proceedWithPartial(s, t.id)!;
  assert.equal(done.status, "delivered");
  assert.ok(done.results.length >= 1);
  assert.equal(done.results[0]!.state, "draft");       // 초안
  assert.equal(done.partialMaterials, true);           // 부족 표시
});

test("Trust First 하한선: 자료 0%면 '이대로 진행'해도 실행되지 않고 정보 요청 유지", () => {
  const s = tmp();
  const t = registerTask(s, "신메뉴 소개 글 써줘");     // 자료 전혀 없음
  const r = proceedWithPartial(s, t.id)!;
  assert.equal(r.results.length, 0);                    // 추측 안 함
  assert.equal(r.status, "awaiting_materials");         // 정보 요청 유지
});

test("자료를 충분히 제공하면 partialMaterials 없이 최종본", () => {
  const s = tmp();
  const t = registerTask(s, "신메뉴 소개 글 써줘");
  provideMaterial(s, t.id, "brand-voice", "text", "v");
  provideMaterial(s, t.id, "channel", "text", "instagram");
  const done = executeTask(s, t.id)!;
  assert.equal(done.results[0]!.state, "final");
  assert.ok(!done.partialMaterials);
});

test("채용 → 추천 채용에서 제거, 직원 출근 반영", () => {
  const s = tmp();
  registerTask(s, "오늘 신메뉴 홍보하고 싶어");
  let d = dashboard(s);
  assert.ok(d.recommendedHires.some((r) => r.roleFamily === "design"));
  hire(s, "design", "디자이너");
  d = dashboard(s);
  assert.ok(d.employees.find((e) => e.roleFamily === "design")!.hired);
});

test("파일/이미지 자료는 메타데이터(mock)로 저장된다", () => {
  const s = tmp();
  const t = registerTask(s, "신메뉴 소개 글 써줘");
  provideMaterial(s, t.id, "brand-voice", "image", "logo.png", "로고 파일");
  const m = s.data.tasks.find((x) => x.id === t.id)!.materials[0]!;
  assert.equal(m.kind, "image");
  assert.equal(m.value, "logo.png");
});

test("persistence: 재시작 후 업무·자료 유지", () => {
  const p = `${process.env.TMPDIR ?? "/tmp"}/atlas-fix-persist-${Math.round(performance.now() * 1000)}.json`;
  try { rmSync(p); } catch { /* noop */ }
  const s1 = new AlphaStore(p);
  const t = registerTask(s1, "신메뉴 소개 글 써줘");
  provideMaterial(s1, t.id, "brand-voice", "text", "v");
  const s2 = new AlphaStore(p);
  assert.equal(s2.data.tasks.length, 1);
  assert.ok(s2.data.companyInfo.includes("brand-voice"));
});
