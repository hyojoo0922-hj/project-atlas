import { test } from "node:test";
import assert from "node:assert/strict";
import { rmSync } from "node:fs";
import { AlphaStore } from "../src/store.ts";
import {
  ALPHA_PASS, approveTask, dashboard, executeTask, hire, hideTask, login, proceedWithPartial,
  provideMaterial, registerTask, reviseTask, taskView,
} from "../src/app.ts";

const deliver = (s: AlphaStore, title = "신메뉴 소개 글 써줘") => {
  const t = registerTask(s, title);
  provideMaterial(s, t.id, "brand-voice", "text", "v");
  provideMaterial(s, t.id, "channel", "text", "instagram");
  executeTask(s, t.id);
  return t.id;
};

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
  // 텍스트형(콘텐츠)은 초안 진행 가능 → ready_with_missing_info, 이미지(design)는 추천 채용(비차단)
  assert.equal(t.status, "ready_with_missing_info");
  assert.ok(t.missingInfo.length > 0);
  assert.ok(t.missingRoles.includes("design"));           // Designer 추천(비차단)
  assert.equal(t.results.length, 0);
});

test("자료 제공 → 실행 가능, Company Memory에 축적", () => {
  const s = tmp();
  const t = registerTask(s, "오늘 신메뉴 홍보하고 싶어");
  for (const k of CONTENT_INFO) provideMaterial(s, t.id, k, "text", `${k} 값`);
  const t2 = s.data.tasks.find((x) => x.id === t.id)!;
  // 콘텐츠는 최종본 가능하지만 이미지(design) 부분이 남아 일부 진행 상태
  assert.equal(t2.status, "ready_with_missing_info");
  assert.equal(taskView(s, t2).cta.kind, "proceed");      // 단일 CTA 노출
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

test("모든 텍스트형 업무: 자료 0%여도 '최소 정보로 초안' CTA 일관 노출", () => {
  const s = tmp();
  for (const title of ["신메뉴 소개 글 써줘", "리뷰 답변 정리하고 싶어", "이번 달 리포트 정리"]) {
    const t = registerTask(s, title);
    const v = taskView(s, t);
    assert.notEqual(t.status, "needs_hire");              // 텍스트형은 직원 없어도 막히지 않음
    assert.equal(v.cta.kind, "proceed");                  // 동일 CTA 구조
    assert.equal(v.cta.label, "최소 정보로 초안 진행하기"); // 0% → 최소 정보 초안
  }
});

test("이미지 업무: Designer 없어도 막히지 않고 '이미지 기획안' 대체 진행 + Designer 추천 유지", () => {
  const s = tmp();
  const t = registerTask(s, "신메뉴 사진 이미지 만들어줘");   // image(design), 디자이너 없음
  const v = taskView(s, t);
  assert.equal(v.cta.kind, "proceed");                      // 막히지 않음
  assert.ok(v.recommendedHires.some((h) => h.roleFamily === "design")); // Designer 추천 유지
  const r = executeTask(s, t.id)!;
  assert.equal(r.status, "delivered");
  const res = r.results[0]!;
  assert.equal(res.outputType, "image_brief");             // 대체 산출물(실제 image 아님)
  assert.equal(res.requestedOutputType, "image");          // 원 요청 기록
  assert.ok(res.content.includes("실제 이미지는 아직 생성하지 않았습니다")); // Trust First 명시
});

test("점6 — '신규메뉴 연출컷 이미지 만들어줘' 전체 흐름", () => {
  const s = tmp();
  const t = registerTask(s, "신규메뉴 연출컷 이미지 만들어줘");
  assert.ok(t.outputTypes.includes("image"));              // image 분석
  const v = taskView(s, t);
  assert.equal(v.cta.label, "최소 정보로 이미지 기획안 만들기"); // 자료 0% CTA
  assert.ok(v.neededMaterials.length > 0);                 // 자료 요청 표시
  const done = proceedWithPartial(s, t.id)!;               // 최소 정보로 진행
  assert.equal(done.status, "delivered");
  assert.ok(done.results.some((x) => x.outputType === "image_brief"));
  assert.ok(done.partialMaterials);
  approveTask(s, done.id, { overall: 5 });                 // 승인
  assert.ok(dashboard(s).deliverables.some((x) => x.taskId === done.id && x.approved)); // 결과물 탭
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

test("일부 자료만 제공 → CTA가 '이대로 초안으로 진행하기'", () => {
  const s = tmp();
  const t = registerTask(s, "신메뉴 소개 글 써줘");     // social_post: brand-voice + channel
  provideMaterial(s, t.id, "brand-voice", "text", "따뜻하게");  // 1/2 제공
  const v = taskView(s, s.data.tasks.find((x) => x.id === t.id)!);
  assert.equal(v.status, "ready_with_missing_info");
  assert.equal(v.cta.label, "이대로 초안으로 진행하기");  // 일부 제공 → 이 문구
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

test("리뷰 답변 업무(명시 테스트): 자료 0%여도 최소 정보 초안 → customer_reply 결과 → 승인 → 결과물 탭", () => {
  const s = tmp();
  const t = registerTask(s, "리뷰 답변 정리하고 싶어");
  assert.ok(t.outputTypes.includes("customer_reply"));     // 올바른 유형 분석
  assert.equal(taskView(s, t).cta.kind, "proceed");        // 진행 CTA 일관 노출(직원 없어도)
  const done = proceedWithPartial(s, t.id)!;               // 최소 정보 초안 진행
  assert.equal(done.status, "delivered");
  assert.ok(done.results.some((r) => r.outputType === "customer_reply"));
  assert.ok(done.partialMaterials);                        // 부족 표시
  approveTask(s, done.id, { overall: 5 });
  assert.ok(dashboard(s).deliverables.some((r) => r.taskId === done.id && r.approved)); // 결과물 탭 저장
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

test("결과물 탭: 전달/승인된 결과물만 포함", () => {
  const s = tmp();
  const id = deliver(s);
  let d = dashboard(s);
  assert.ok(d.deliverables.some((r) => r.taskId === id));   // 전달 완료 포함
  approveTask(s, id, { overall: 5 });
  d = dashboard(s);
  const card = d.deliverables.find((r) => r.taskId === id)!;
  assert.equal(card.approved, true);                        // 승인 상태 표시
  assert.ok(!d.tasks.some((t) => t.id === id));             // 승인 후 진행중 목록에서 제외
});

test("숨김: 기본 화면(진행중)과 결과물 탭 모두에서 제외", () => {
  const s = tmp();
  const id = deliver(s);
  assert.equal(hideTask(s, id, "2026-06-28T00:00:00.000Z"), true);
  const d = dashboard(s);
  assert.ok(!d.tasks.some((t) => t.id === id));             // 진행중 제외
  assert.ok(!d.deliverables.some((r) => r.taskId === id));  // 결과물 탭 제외
});

test("숨김: 데이터는 삭제되지 않고 보존된다(hidden+archivedAt)", () => {
  const s = tmp();
  const id = deliver(s);
  hideTask(s, id, "2026-06-28T00:00:00.000Z");
  const raw = s.data.tasks.find((t) => t.id === id)!;       // 원본 데이터 존재
  assert.ok(raw);
  assert.equal(raw.hidden, true);
  assert.equal(raw.archivedAt, "2026-06-28T00:00:00.000Z");
  assert.ok(raw.results.length > 0);                        // 결과물 내용도 보존
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
