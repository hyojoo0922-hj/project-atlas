import { test } from "node:test";
import assert from "node:assert/strict";
import { rmSync } from "node:fs";
import { AlphaStore } from "../src/store.ts";
import {
  addVaultMaterial, ALPHA_PASS, approveTask, dashboard, executeTask, hire, hideTask, login,
  proceedWithPartial, provideMaterial, registerTask, reviseTask, setTextGenerator, taskView, vaultView,
} from "../src/app.ts";
import { makeTextGenerator } from "../../../packages/cost-control/src/text-gateway.ts";

const deliver = async (s: AlphaStore, title = "신메뉴 소개 글 써줘") => {
  const t = registerTask(s, title);
  provideMaterial(s, t.id, "brand-voice", "text", "v");
  provideMaterial(s, t.id, "channel", "text", "instagram");
  await executeTask(s, t.id);
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

test("실행 → mock 결과물(글) 생성, 이미지는 추후 지원/미생성", async () => {
  const s = tmp();
  const t = registerTask(s, "오늘 신메뉴 홍보하고 싶어");
  for (const k of CONTENT_INFO) provideMaterial(s, t.id, k, "text", "v");
  const done = (await executeTask(s, t.id))!;
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

test("이미지 업무: Designer 없어도 막히지 않고 '이미지 기획안' 대체 진행 + Designer 추천 유지", async () => {
  const s = tmp();
  const t = registerTask(s, "신메뉴 사진 이미지 만들어줘");   // image(design), 디자이너 없음
  const v = taskView(s, t);
  assert.equal(v.cta.kind, "proceed");                      // 막히지 않음
  assert.ok(v.recommendedHires.some((h) => h.roleFamily === "design")); // Designer 추천 유지
  const r = (await executeTask(s, t.id))!;
  assert.equal(r.status, "delivered");
  const res = r.results[0]!;
  assert.equal(res.outputType, "image_brief");             // 대체 산출물(실제 image 아님)
  assert.equal(res.requestedOutputType, "image");          // 원 요청 기록
  assert.ok(res.content.includes("실제 이미지는 아직 생성하지 않았습니다")); // Trust First 명시
});

test("점6 — '신규메뉴 연출컷 이미지 만들어줘' 전체 흐름", async () => {
  const s = tmp();
  const t = registerTask(s, "신규메뉴 연출컷 이미지 만들어줘");
  assert.ok(t.outputTypes.includes("image"));              // image 분석
  const v = taskView(s, t);
  assert.equal(v.cta.label, "최소 정보로 이미지 기획안 만들기"); // 자료 0% CTA
  assert.ok(v.neededMaterials.length > 0);                 // 자료 요청 표시
  const done = (await proceedWithPartial(s, t.id))!;       // 최소 정보로 진행
  assert.equal(done.status, "delivered");
  assert.ok(done.results.some((x) => x.outputType === "image_brief"));
  assert.ok(done.partialMaterials);
  approveTask(s, done.id, { overall: 5 });                 // 승인
  assert.ok(dashboard(s).deliverables.some((x) => x.taskId === done.id && x.approved)); // 결과물 탭
});

test("승인 / 수정 요청 상태 전이", async () => {
  const s = tmp();
  const t = registerTask(s, "신메뉴 소개 글 써줘");
  provideMaterial(s, t.id, "brand-voice", "text", "v");
  provideMaterial(s, t.id, "channel", "text", "v");
  await executeTask(s, t.id);
  assert.equal(approveTask(s, t.id, { overall: 5 }), true);
  assert.equal(s.data.tasks.find((x) => x.id === t.id)!.status, "approved");

  const t2 = registerTask(s, "이벤트 글 써줘");
  provideMaterial(s, t2.id, "brand-voice", "text", "v");
  provideMaterial(s, t2.id, "channel", "text", "v");
  await executeTask(s, t2.id);
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

test("'이대로 진행하기' → 초안 생성 + 일부 자료 부족 표시(partialMaterials)", async () => {
  const s = tmp();
  const t = registerTask(s, "신메뉴 소개 글 써줘");
  provideMaterial(s, t.id, "brand-voice", "text", "따뜻하게");  // 일부만
  const done = (await proceedWithPartial(s, t.id))!;
  assert.equal(done.status, "delivered");
  assert.ok(done.results.length >= 1);
  assert.equal(done.results[0]!.state, "draft");       // 초안
  assert.equal(done.partialMaterials, true);           // 부족 표시
});

test("리뷰 답변 업무(명시 테스트): 자료 0%여도 최소 정보 초안 → customer_reply 결과 → 승인 → 결과물 탭", async () => {
  const s = tmp();
  const t = registerTask(s, "리뷰 답변 정리하고 싶어");
  assert.ok(t.outputTypes.includes("customer_reply"));     // 올바른 유형 분석
  assert.equal(taskView(s, t).cta.kind, "proceed");        // 진행 CTA 일관 노출(직원 없어도)
  const done = (await proceedWithPartial(s, t.id))!;       // 최소 정보 초안 진행
  assert.equal(done.status, "delivered");
  assert.ok(done.results.some((r) => r.outputType === "customer_reply"));
  assert.ok(done.partialMaterials);                        // 부족 표시
  approveTask(s, done.id, { overall: 5 });
  assert.ok(dashboard(s).deliverables.some((r) => r.taskId === done.id && r.approved)); // 결과물 탭 저장
});

test("자료를 충분히 제공하면 partialMaterials 없이 최종본", async () => {
  const s = tmp();
  const t = registerTask(s, "신메뉴 소개 글 써줘");
  provideMaterial(s, t.id, "brand-voice", "text", "v");
  provideMaterial(s, t.id, "channel", "text", "instagram");
  const done = (await executeTask(s, t.id))!;
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

test("결과물 탭: 전달/승인된 결과물만 포함", async () => {
  const s = tmp();
  const id = await deliver(s);
  let d = dashboard(s);
  assert.ok(d.deliverables.some((r) => r.taskId === id));   // 전달 완료 포함
  approveTask(s, id, { overall: 5 });
  d = dashboard(s);
  const card = d.deliverables.find((r) => r.taskId === id)!;
  assert.equal(card.approved, true);                        // 승인 상태 표시
  assert.ok(!d.tasks.some((t) => t.id === id));             // 승인 후 진행중 목록에서 제외
});

test("숨김: 기본 화면(진행중)과 결과물 탭 모두에서 제외", async () => {
  const s = tmp();
  const id = await deliver(s);
  assert.equal(hideTask(s, id, "2026-06-28T00:00:00.000Z"), true);
  const d = dashboard(s);
  assert.ok(!d.tasks.some((t) => t.id === id));             // 진행중 제외
  assert.ok(!d.deliverables.some((r) => r.taskId === id));  // 결과물 탭 제외
});

test("숨김: 데이터는 삭제되지 않고 보존된다(hidden+archivedAt)", async () => {
  const s = tmp();
  const id = await deliver(s);
  hideTask(s, id, "2026-06-28T00:00:00.000Z");
  const raw = s.data.tasks.find((t) => t.id === id)!;       // 원본 데이터 존재
  assert.ok(raw);
  assert.equal(raw.hidden, true);
  assert.equal(raw.archivedAt, "2026-06-28T00:00:00.000Z");
  assert.ok(raw.results.length > 0);                        // 결과물 내용도 보존
});

test("결과물 생성 시 AI 원가/사용량(UsageEntry)이 내부 기록된다", async () => {
  const s = tmp();
  const t = registerTask(s, "신메뉴 소개 글 써줘");
  provideMaterial(s, t.id, "brand-voice", "text", "v");
  provideMaterial(s, t.id, "channel", "text", "instagram");
  const done = (await executeTask(s, t.id))!;
  assert.ok(s.data.usage.length >= 1);                         // 호출 기록 존재
  const u = s.data.usage[s.data.usage.length - 1]!;
  assert.equal(u.taskId, done.id);
  assert.ok(["ai", "mock"].includes(u.mode));                  // 모드 기록
  assert.equal(typeof u.costUsd, "number");                   // 예상 원가 기록
  assert.ok(u.inputTokens >= 0 && u.outputTokens >= 0);       // 토큰 사용량
});

test("커스텀 생성기 주입: 실제 텍스트 결과물이 결과/결과물 탭에 반영", async () => {
  const s = tmp();
  setTextGenerator(async (r) => ({
    text: `[AI] ${r.outputType} 결과물`, model: "claude-haiku-4-5",
    inputTokens: 120, outputTokens: 80, costUsd: 0.00052, mode: "ai",
  }));
  try {
    const t = registerTask(s, "신메뉴 소개 글 써줘");
    provideMaterial(s, t.id, "brand-voice", "text", "v");
    provideMaterial(s, t.id, "channel", "text", "instagram");
    const done = (await executeTask(s, t.id))!;
    assert.ok(done.results[0]!.content.startsWith("[AI]"));    // 실제 생성 텍스트 반영
    const u = s.data.usage[s.data.usage.length - 1]!;
    assert.equal(u.mode, "ai");
    assert.ok(u.costUsd > 0);                                  // 원가 누적
    approveTask(s, done.id, { overall: 5 });
    const card = dashboard(s).deliverables.find((x) => x.taskId === done.id)!;
    assert.ok(card.content.startsWith("[AI]"));                // 결과물 탭에도 저장
  } finally {
    setTextGenerator(makeTextGenerator());                     // 기본 생성기 복원
  }
});

test("Vault: 업무 중 제공한 자료가 Company Knowledge Vault에 저장된다(출처·카테고리·연결직원·생성일)", () => {
  const s = tmp();
  const t = registerTask(s, "신메뉴 소개 글 써줘");     // social_post: brand-voice + channel
  provideMaterial(s, t.id, "brand-voice", "text", "따뜻하고 친근하게");
  assert.equal(s.data.vault.length, 1);
  const v = s.data.vault[0]!;
  assert.equal(v.infoKey, "brand-voice");
  assert.equal(v.category, "brand");            // infoKey→카테고리 역추론
  assert.equal(v.sourceTaskId, t.id);           // 출처 업무 기록
  assert.equal(v.byRole, "content");            // 연결 직원 직군
  assert.ok(v.createdAt && v.createdAt.length >= 10); // 생성일
  assert.ok(s.data.companyInfo.includes("brand-voice")); // companyInfo 동기화
});

test("Vault: 새 업무에서 이미 보유한 자료는 다시 요청하지 않고 '기존 자료 사용' 표시", () => {
  const s = tmp();
  const t1 = registerTask(s, "신메뉴 소개 글 써줘");
  provideMaterial(s, t1.id, "brand-voice", "text", "따뜻하게");
  provideMaterial(s, t1.id, "channel", "text", "instagram");
  // 새 업무 등록 — 같은 자료(brand-voice, channel)를 다시 묻지 않아야 함
  const t2 = registerTask(s, "신상품 소개 글 써줘");      // social_post 동일 요구
  const v2 = taskView(s, t2);
  assert.ok(!v2.neededMaterials.some((m) => m.key === "brand-voice")); // 재요청 안 함
  assert.ok(!v2.neededMaterials.some((m) => m.key === "channel"));
  const reused = v2.reusedMaterials.map((m) => m.key);
  assert.ok(reused.includes("brand-voice") && reused.includes("channel")); // 기존 자료 사용 표시
  assert.equal(v2.status, "ready");              // 자료 충분 → 바로 실행 가능
});

test("Vault: 자료 탭에서 직접 추가(업무 무관) → Vault 저장 + companyInfo 반영", () => {
  const s = tmp();
  const v = addVaultMaterial(s, "brand", "text", "미니멀하고 담백한 말투");
  assert.equal(s.data.vault.length, 1);
  assert.equal(v.infoKey, "brand-voice");        // 카테고리→대표 infoKey
  assert.equal(v.sourceTaskId, undefined);       // 직접 추가(출처 업무 없음)
  assert.ok(s.data.companyInfo.includes("brand-voice"));
  const view = vaultView(s)[0]!;
  assert.equal(view.source, "직접 추가");
  assert.equal(view.categoryLabel, "브랜드");
});

test("Vault: 직접 추가한 자료가 이후 새 업무에 자동 활용된다", () => {
  const s = tmp();
  addVaultMaterial(s, "brand", "text", "따뜻한 브랜드 말투");   // brand-voice를 미리 보유
  const t = registerTask(s, "신메뉴 소개 글 써줘");            // social_post: brand-voice + channel
  const v = taskView(s, t);
  assert.ok(v.reusedMaterials.some((m) => m.key === "brand-voice")); // 자동 활용
  assert.ok(!v.neededMaterials.some((m) => m.key === "brand-voice"));// 다시 묻지 않음
  assert.ok(v.neededMaterials.some((m) => m.key === "channel"));     // 없는 자료만 요청
});

test("Vault: dashboard에 자료 목록과 카테고리가 노출된다", () => {
  const s = tmp();
  addVaultMaterial(s, "product", "url", "https://example.com/menu");
  const d = dashboard(s);
  assert.ok(Array.isArray(d.vault) && d.vault.length === 1);
  assert.equal(d.vault[0]!.categoryLabel, "상품");
  assert.equal(d.vault[0]!.kind, "url");
  assert.equal(d.categories.length, 7);          // 7개 카테고리
});

test("HQ 카탈로그: dashboard에 전문 직원(직군별 그룹·계약 옵션·가격 Placeholder)이 노출된다", () => {
  const s = tmp();
  const d = dashboard(s);
  assert.ok(Array.isArray(d.hqEmployees) && d.hqEmployees.length > 0);
  const content = d.hqEmployees.find((g) => g.roleFamily === "content")!;
  assert.ok(content.employees.length >= 4);                 // Writer 전문화 4종+
  const sns = content.employees.find((e) => e.id === "writer-sns")!;
  assert.equal(sns.costTier, "low");
  assert.ok(/Placeholder/.test(sns.price));                 // 실금액 아님
  assert.deepEqual(sns.contractOptions.map((o) => o.label), ["7일", "30일", "90일"]);
  assert.ok(sns.supported.includes("social_post"));         // HQ 가능 업무
});

test("HQ 판단: 업무 카드에 가능/비추천 전문 직원이 표시된다(고객이 아무 직원에게 못 시킴)", () => {
  const s = tmp();
  const t = registerTask(s, "리뷰 답변 정리하고 싶어");       // customer_reply
  const v = taskView(s, t);
  const cr = v.suitability.find((x) => x.outputType === "customer_reply")!;
  assert.deepEqual(cr.supported.map((e) => e.id), ["cs-responder"]); // CS만 가능
  // 이미지 업무는 디자이너 계열만 가능
  const t2 = registerTask(s, "신메뉴 사진 이미지 만들어줘");
  const v2 = taskView(s, t2);
  const img = v2.suitability.find((x) => x.outputType === "image")!;
  assert.ok(img.supported.some((e) => e.id.startsWith("designer-")));
  assert.ok(!img.supported.some((e) => e.id.startsWith("writer-")));  // Writer는 이미지 미지원
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
