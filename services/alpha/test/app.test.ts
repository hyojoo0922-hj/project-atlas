import { test } from "node:test";
import assert from "node:assert/strict";
import { rmSync } from "node:fs";
import { AlphaStore } from "../src/store.ts";
import {
  addVaultMaterial, addVaultMaterials, ALPHA_PASS, approveTask, dashboard, editVaultItem, executeTask, hideTask,
  hideVaultItem, hire, IMAGE_CREDIT_COST, login, proceedWithPartial, provideMaterial, provideMaterials, registerTask,
  reviseTask, setImageChoice, setTextGenerator, taskView, topUpCredits, vaultView,
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
  assert.equal(taskView(s, t2).cta.kind, "image_choice"); // 이미지 포함 → 진행 방식 선택 카드
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

test("이미지 업무: 기획안 자동 제공 안 함 — 선택 카드 노출, 기획안 선택 시에만 image_brief", async () => {
  const s = tmp();
  const t = registerTask(s, "신메뉴 사진 이미지 만들어줘");   // image(design), 디자이너 없음
  const v = taskView(s, t);
  assert.equal(v.cta.kind, "image_choice");                 // 기획안 자동 X → 선택 요구
  assert.equal(v.imageChoiceNeeded, true);
  assert.ok(v.recommendedHires.some((h) => h.roleFamily === "design")); // Designer 추천 유지
  // 선택 전 실행 → 이미지 결과 생성 안 함
  const pre = (await executeTask(s, t.id))!;
  assert.equal(pre.results.length, 0);
  assert.equal(pre.needsImageChoice, true);
  // 기획안 선택 → image_brief 제공(요청 유형 표시)
  setImageChoice(s, t.id, "brief");
  const r = (await executeTask(s, t.id))!;
  assert.equal(r.status, "delivered");
  const res = r.results[0]!;
  assert.equal(res.outputType, "image_brief");
  assert.equal(res.requestedOutputType, "image");
  assert.equal(res.requestType, "image_brief");
  assert.ok(res.content.includes("실제 이미지는 아직 생성하지 않았습니다"));
});

test("점6 — '신규메뉴 연출컷 이미지' 1회 크레딧 사용 → '생성 준비됨'까지(실제 생성 OFF)", async () => {
  const s = tmp();
  s.data.credits = 2;
  const t = registerTask(s, "신규메뉴 연출컷 이미지 만들어줘");
  assert.ok(t.outputTypes.includes("image"));              // image 분석
  assert.equal(taskView(s, t).cta.kind, "image_choice");   // 선택 카드
  setImageChoice(s, t.id, "credit");                       // 1회 크레딧 사용 선택
  const done = (await executeTask(s, t.id))!;
  assert.equal(done.status, "delivered");
  const res = done.results.find((x) => x.requestType === "image_credit")!;
  assert.equal(res.state, "pending");                      // 생성 준비됨까지만
  assert.equal(res.creditsUsed, 1);
  assert.ok(res.content.includes("준비됨"));
  assert.equal(s.data.credits, 1);                         // 크레딧 1 차감
  // Ledger 기록(예상 크레딧 + 비용)
  const led = s.data.usage.find((u) => u.requestType === "image_credit")!;
  assert.equal(led.credits, 1);
  assert.ok(led.costUsd > 0);
  approveTask(s, done.id, { overall: 5 });
  assert.ok(dashboard(s).deliverables.some((x) => x.taskId === done.id && x.approved));
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

test("다중 입력(자료 탭): 한 번에 여러 항목 → 여러 Vault 항목으로 분리 저장, 모두 표시", () => {
  const s = tmp();
  const created = addVaultMaterials(s, "reference", [
    { kind: "text", value: "미니멀 무드" },
    { kind: "url", value: "https://example.com/ref1" },
    { kind: "image", value: "ref-shot.png" },
  ], "촬영 레퍼런스 묶음");
  assert.equal(created.length, 3);
  assert.equal(s.data.vault.length, 3);
  // 각 항목이 카테고리/메모/생성일 유지
  assert.ok(s.data.vault.every((v) => v.category === "reference" && v.note === "촬영 레퍼런스 묶음" && v.createdAt));
  assert.deepEqual(s.data.vault.map((v) => v.kind).sort(), ["image", "text", "url"]);
  // 자료 탭에 모두 노출(직접 추가)
  const view = vaultView(s);
  assert.equal(view.length, 3);
  assert.ok(view.every((v) => v.source === "직접 추가" && v.categoryLabel === "레퍼런스"));
});

test("다중 입력(자료 탭): 빈 값은 건너뛴다", () => {
  const s = tmp();
  const created = addVaultMaterials(s, "brand", [
    { kind: "text", value: "따뜻한 말투" }, { kind: "text", value: "   " }, { kind: "text", value: "" },
  ]);
  assert.equal(created.length, 1);
  assert.equal(s.data.vault.length, 1);
});

test("다중 입력(업무 자료 제공): 같은 자료 키에 여러 항목 → Material·Vault 모두 분리 저장(출처 업무 유지)", () => {
  const s = tmp();
  const t = registerTask(s, "신메뉴 사진 이미지 만들어줘");   // image → design-reference 등 필요
  const r = provideMaterials(s, t.id, "design-reference", [
    { kind: "url", value: "https://example.com/a" },
    { kind: "image", value: "moodboard.png" },
  ])!;
  // task.materials에 2건
  const provided = r.materials.filter((m) => m.infoKey === "design-reference");
  assert.equal(provided.length, 2);
  // Vault에도 2건, 출처=업무
  const vaultRefs = s.data.vault.filter((v) => v.infoKey === "design-reference");
  assert.equal(vaultRefs.length, 2);
  assert.ok(vaultRefs.every((v) => v.sourceTaskId === t.id && v.category === "reference"));
  assert.ok(s.data.companyInfo.includes("design-reference"));  // 자동 활용 동기화
});

test("하위호환: 단일 provideMaterial/addVaultMaterial 그대로 동작", () => {
  const s = tmp();
  const t = registerTask(s, "신메뉴 소개 글 써줘");
  provideMaterial(s, t.id, "brand-voice", "text", "따뜻하게");
  assert.equal(s.data.vault.filter((v) => v.infoKey === "brand-voice").length, 1);
  const v = addVaultMaterial(s, "product", "url", "https://example.com/menu");
  assert.equal(v.kind, "url");
  assert.equal(s.data.vault.length, 2);
});

test("자료 수정: 카테고리·값·메모 변경", () => {
  const s = tmp();
  const v = addVaultMaterial(s, "brand", "text", "따뜻한 말투", "초기 메모");
  const edited = editVaultItem(s, v.id, { category: "liked_style", value: "담백한 말투", note: "수정 메모" })!;
  assert.equal(edited.category, "liked_style");
  assert.equal(edited.value, "담백한 말투");
  assert.equal(edited.note, "수정 메모");
  const view = vaultView(s)[0]!;
  assert.equal(view.categoryLabel, "좋아하는 스타일");
  assert.equal(view.value, "담백한 말투");
});

test("자료 숨김: 삭제가 아니라 hidden+archivedAt (데이터 보존)", () => {
  const s = tmp();
  const v = addVaultMaterial(s, "product", "url", "https://example.com/menu");
  assert.equal(hideVaultItem(s, v.id, "2026-06-29T00:00:00.000Z"), true);
  const raw = s.data.vault.find((x) => x.id === v.id)!;
  assert.ok(raw);                                  // 데이터 존재(삭제 아님)
  assert.equal(raw.hidden, true);
  assert.equal(raw.archivedAt, "2026-06-29T00:00:00.000Z");
});

test("자료 숨김: 자료 탭 기본 목록에서 제외", () => {
  const s = tmp();
  const a = addVaultMaterial(s, "brand", "text", "말투 A");
  addVaultMaterial(s, "product", "text", "상품 B");
  hideVaultItem(s, a.id);
  const view = vaultView(s);
  assert.equal(view.length, 1);                    // 숨김 1건 제외
  assert.ok(!view.some((x) => x.id === a.id));
  assert.equal(dashboard(s).vault.length, 1);      // dashboard도 동일
});

test("자료 숨김: 자동 활용에서 제외 → 업무가 해당 자료를 다시 요청", () => {
  const s = tmp();
  const v = addVaultMaterial(s, "brand", "text", "따뜻한 말투");   // brand-voice 보유
  const t1 = registerTask(s, "신메뉴 소개 글 써줘");               // social_post: brand-voice + channel
  assert.ok(taskView(s, t1).reusedMaterials.some((m) => m.key === "brand-voice")); // 자동 활용
  hideVaultItem(s, v.id);                                          // 숨김
  assert.ok(!s.data.companyInfo.includes("brand-voice"));          // companyInfo에서 제외
  const t2 = registerTask(s, "신상품 소개 글 써줘");
  assert.ok(taskView(s, t2).neededMaterials.some((m) => m.key === "brand-voice")); // 다시 요청
  // 기존 업무도 재계산되어 brand-voice를 다시 필요로 함
  assert.ok(taskView(s, t1).neededMaterials.some((m) => m.key === "brand-voice"));
});

test("크레딧 부족: 1회 크레딧 선택했지만 잔액 부족 → 실행 안 함 + 충전/채용 CTA", async () => {
  const s = tmp();
  s.data.credits = 0;
  const t = registerTask(s, "신메뉴 사진 이미지 만들어줘");
  setImageChoice(s, t.id, "credit");
  const v = taskView(s, t);
  assert.equal(v.cta.kind, "credit_blocked");              // 충전/채용 CTA
  assert.equal(v.creditShortfall, true);
  const done = (await executeTask(s, t.id))!;
  assert.ok(!done.results.some((r) => r.requestType === "image_credit")); // 실행 안 함
  assert.equal(done.creditShortfall, true);
  assert.equal(s.data.credits, 0);                         // 차감 없음
});

test("크레딧 충전(placeholder): 잔액 증가 후 크레딧 경로 실행 가능", async () => {
  const s = tmp();
  s.data.credits = 0;
  const t = registerTask(s, "신메뉴 사진 이미지 만들어줘");
  setImageChoice(s, t.id, "credit");
  const after = topUpCredits(s);                           // placeholder 충전
  assert.ok(after >= IMAGE_CREDIT_COST);
  assert.equal(taskView(s, t).cta.kind, "execute");        // 충전 후 실행 가능
  const done = (await executeTask(s, t.id))!;
  assert.ok(done.results.some((r) => r.requestType === "image_credit"));
});

test("Designer 채용 선택: 디자이너 자동 채용 + Designer 작성 기획안(image_brief)", async () => {
  const s = tmp();
  const t = registerTask(s, "신메뉴 사진 이미지 만들어줘");
  setImageChoice(s, t.id, "designer");
  assert.ok(s.data.employees.some((e) => e.dna.genome.roleFamily === "design")); // 자동 채용
  const done = (await executeTask(s, t.id))!;
  const res = done.results[0]!;
  assert.equal(res.outputType, "image_brief");
  assert.equal(res.requestType, "image_designer_brief");
  assert.equal(res.by, "디자이너");
});

test("텍스트 생성도 Ledger에 크레딧(0)·비용·요청유형(text) 기록", async () => {
  const s = tmp();
  const t = registerTask(s, "신메뉴 소개 글 써줘");
  provideMaterial(s, t.id, "brand-voice", "text", "v");
  provideMaterial(s, t.id, "channel", "text", "instagram");
  await executeTask(s, t.id);
  const led = s.data.usage.find((u) => u.requestType === "text")!;
  assert.equal(led.credits, 0);
  assert.equal(typeof led.costUsd, "number");
});

test("dashboard에 크레딧 잔액과 1회 이미지 비용이 노출된다", () => {
  const s = tmp();
  s.data.credits = 5;
  const d = dashboard(s);
  assert.equal(d.credits, 5);
  assert.equal(d.imageCreditCost, IMAGE_CREDIT_COST);
});

test("결과물 탭: 크레딧/요청 유형이 카드에 표시된다", async () => {
  const s = tmp();
  s.data.credits = 2;
  const t = registerTask(s, "신메뉴 사진 이미지 만들어줘");
  setImageChoice(s, t.id, "credit");
  const done = (await executeTask(s, t.id))!;
  approveTask(s, done.id, { overall: 5 });
  const card = dashboard(s).deliverables.find((x) => x.taskId === done.id)!;
  assert.equal(card.requestType, "image_credit");
  assert.equal(card.creditsUsed, 1);
  assert.equal(card.state, "pending");
});

test("Output Standard: 결과물에 적용 표준(standardLabel) 기록 + 프롬프트에 표준 주입", async () => {
  const s = tmp();
  let capturedPrompt = "";
  setTextGenerator(async (r) => {
    capturedPrompt = r.prompt;
    return { text: "결과", model: "claude-haiku-4-5", inputTokens: 10, outputTokens: 5, costUsd: 0.0001, mode: "ai" };
  });
  try {
    const t = registerTask(s, "신메뉴 소개 글 써줘");          // social_post
    provideMaterial(s, t.id, "brand-voice", "text", "v");
    provideMaterial(s, t.id, "channel", "text", "instagram");
    const done = (await executeTask(s, t.id))!;
    assert.equal(done.results[0]!.standardLabel, "SNS 포스트");  // 적용 표준 기록
    assert.ok(capturedPrompt.includes("HQ Output Standard"));    // 표준 프롬프트 주입
    assert.ok(capturedPrompt.includes("해시태그 3~5개"));        // 필수 구성요소 주입
  } finally {
    setTextGenerator(makeTextGenerator());
  }
});

test("Output Standard: 이미지 기획안도 표준(이미지 제작 기획안) 기록", async () => {
  const s = tmp();
  const t = registerTask(s, "신메뉴 사진 이미지 만들어줘");
  setImageChoice(s, t.id, "brief");
  const done = (await executeTask(s, t.id))!;
  const res = done.results[0]!;
  assert.equal(res.standardLabel, "이미지 제작 기획안");
  // 결과물 탭에도 표준 라벨 노출
  approveTask(s, done.id, { overall: 5 });
  const card = dashboard(s).deliverables.find((x) => x.taskId === done.id)!;
  assert.equal(card.standardLabel, "이미지 제작 기획안");
});

test("Output Quality: 결과물에 품질 라벨/점수/수정권장 기록 + 결과물 탭 노출", async () => {
  const s = tmp();
  const t = registerTask(s, "신메뉴 소개 글 써줘");
  provideMaterial(s, t.id, "brand-voice", "text", "v");
  provideMaterial(s, t.id, "channel", "text", "instagram");
  const done = (await executeTask(s, t.id))!;
  const r = done.results[0]!;
  assert.ok(["Excellent", "Good", "Draft", "Needs Revision"].includes(r.qualityLabel!));
  assert.equal(typeof r.qualityScore, "number");
  assert.equal(r.qualityCategory, "writer");
  // 결과물 탭에도 품질 노출
  approveTask(s, done.id, { overall: 5 });
  const card = dashboard(s).deliverables.find((x) => x.taskId === done.id)!;
  assert.equal(card.qualityLabel, r.qualityLabel);
  assert.equal(typeof card.qualityScore, "number");
});

test("Output Quality: 초안(일부 자료)은 Draft → 수정 요청 권장 플래그", async () => {
  const s = tmp();
  const t = registerTask(s, "신메뉴 소개 글 써줘");
  provideMaterial(s, t.id, "brand-voice", "text", "따뜻"); // 일부만 → draft
  const done = (await proceedWithPartial(s, t.id))!;
  const r = done.results[0]!;
  assert.equal(r.state, "draft");
  assert.equal(r.qualityLabel, "Draft");
  assert.equal(r.recommendRevision, true);
});

test("Output Quality + Satisfaction: 품질과 대표 만족도가 함께 보존된다", async () => {
  const s = tmp();
  const t = registerTask(s, "신메뉴 소개 글 써줘");
  provideMaterial(s, t.id, "brand-voice", "text", "v");
  provideMaterial(s, t.id, "channel", "text", "instagram");
  const done = (await executeTask(s, t.id))!;
  approveTask(s, done.id, { overall: 4, comment: "좋아요" });
  const task = s.data.tasks.find((x) => x.id === done.id)!;
  assert.equal(task.feedback!.overall, 4);                 // 대표 만족도 저장
  assert.ok(task.results[0]!.qualityLabel);                // HQ 품질도 함께 보존
});

test("템플릿: mock 결과물에 placeholder 문구가 없고 템플릿 구조(섹션)가 나온다", async () => {
  const s = tmp();
  const t = registerTask(s, "신메뉴 소개 글 써줘");        // social_post
  provideMaterial(s, t.id, "brand-voice", "text", "v");
  provideMaterial(s, t.id, "channel", "text", "instagram");
  const done = (await executeTask(s, t.id))!;
  const r = done.results[0]!;
  assert.ok(!/placeholder|예시\s*placeholder/i.test(r.content));   // placeholder 제거
  assert.ok(r.content.includes("후킹") && r.content.includes("CTA"));// 템플릿 섹션 구조
  assert.deepEqual(r.templateSections, ["후킹", "본문", "해시태그", "CTA"]);
});

test("템플릿: image_brief mock은 10개 이상 섹션의 상세 기획안", async () => {
  const s = tmp();
  const t = registerTask(s, "신메뉴 사진 이미지 만들어줘");
  setImageChoice(s, t.id, "brief");
  const done = (await executeTask(s, t.id))!;
  const r = done.results[0]!;
  assert.ok((r.templateSections ?? []).length >= 10);
  assert.ok(r.content.includes("실제 이미지는 아직 생성하지 않았습니다"));
  assert.ok(r.content.includes("이미지 생성 프롬프트 초안"));
  assert.ok(!/placeholder|예시\s*placeholder/i.test(r.content));
});

test("템플릿: 실제 AI ON 경로에도 템플릿이 프롬프트에 강하게 주입된다", async () => {
  const s = tmp();
  let prompt = "";
  setTextGenerator(async (r) => { prompt = r.prompt; return { text: "x", model: "m", inputTokens: 1, outputTokens: 1, costUsd: 0.001, mode: "ai" }; });
  try {
    const t = registerTask(s, "신메뉴 소개 글 써줘");
    provideMaterial(s, t.id, "brand-voice", "text", "v");
    provideMaterial(s, t.id, "channel", "text", "instagram");
    await executeTask(s, t.id);
    assert.ok(prompt.includes("필수 결과물 템플릿"));
    assert.ok(prompt.includes("후킹"));
    assert.ok(/placeholder/i.test(prompt) || prompt.includes("미완성"));  // 금지 지시 포함
  } finally { setTextGenerator(makeTextGenerator()); }
});

test("품질: 템플릿 섹션 누락/ placeholder 잔존 결과물은 Needs Revision", async () => {
  const s = tmp();
  // AI가 템플릿을 어겨 placeholder 문구를 낸 상황을 주입
  setTextGenerator(async () => ({ text: "대충 작성 (예시 placeholder)", model: "m", inputTokens: 1, outputTokens: 1, costUsd: 0.001, mode: "ai" }));
  try {
    const t = registerTask(s, "신메뉴 소개 글 써줘");
    provideMaterial(s, t.id, "brand-voice", "text", "v");
    provideMaterial(s, t.id, "channel", "text", "instagram");
    const done = (await executeTask(s, t.id))!;
    const r = done.results[0]!;
    assert.equal(r.qualityLabel, "Needs Revision");   // 섹션 누락 + placeholder → 최하
    assert.equal(r.recommendRevision, true);
  } finally { setTextGenerator(makeTextGenerator()); }
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
