import { test } from "node:test";
import assert from "node:assert/strict";
import { AlphaStore, normalizeData, type AlphaData, type Persister } from "../src/store.ts";
import { restHeaders, selectUrl, supabaseConfig, upsertBody, upsertUrl } from "../src/supabase.ts";
import { handleApi } from "../src/handler.ts";

// ── 영속 어댑터(Persister) 주입 — 메모리 가짜 어댑터로 저장 동작 검증 ──
test("AlphaStore: 주입한 Persister로 save가 호출되고 data가 보존된다", () => {
  let saved: AlphaData | null = null;
  const persister: Persister = { load: () => null, save: (d) => { saved = d; } };
  const store = new AlphaStore({ data: normalizeData(null), persister });
  assert.ok(saved, "생성 시 save 호출");
  store.data.credits = 7;
  store.save();
  assert.equal(saved!.credits, 7);   // 변경 후 저장된 스냅샷 반영
});

test("normalizeData: 비호환/빈 데이터는 안전 부트스트랩, 유효 데이터는 forward-merge", () => {
  const boot = normalizeData(null);
  assert.equal(boot.company.name, "로마티 카페");
  assert.ok(Array.isArray(boot.vault) && boot.credits >= 0);
  const merged = normalizeData({ ...boot, ownerName: "효주", credits: 3 } as Partial<AlphaData>);
  assert.equal(merged.ownerName, "효주");
  assert.equal(merged.credits, 3);
});

// ── Supabase 빌더(순수) — 네트워크 없이 URL/헤더/바디 검증, 키 값 노출 위치 한정 ──
test("supabaseConfig: env 미설정이면 null", () => {
  const u = process.env.SUPABASE_URL, k = process.env.SUPABASE_SERVICE_ROLE_KEY;
  delete process.env.SUPABASE_URL; delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  try { assert.equal(supabaseConfig(), null); }
  finally { if (u) process.env.SUPABASE_URL = u; if (k) process.env.SUPABASE_SERVICE_ROLE_KEY = k; }
});

test("supabase 빌더: REST URL/헤더/upsert 바디", () => {
  const c = { url: "https://x.supabase.co", key: "SECRET", table: "alpha_state", rowId: "default" };
  assert.equal(selectUrl(c), "https://x.supabase.co/rest/v1/alpha_state?id=eq.default&select=data");
  assert.equal(upsertUrl(c), "https://x.supabase.co/rest/v1/alpha_state");
  const h = restHeaders(c.key);
  assert.equal(h.apikey, "SECRET");
  assert.equal(h.Authorization, "Bearer SECRET");
  const body = JSON.parse(upsertBody(c, normalizeData(null), "2026-06-29T00:00:00.000Z"));
  assert.equal(body.id, "default");
  assert.ok(body.data && typeof body.updated_at === "string");
});

// ── 공용 핸들러(handler.ts) 라우팅 — 서버/Vercel 공통 소스 검증 ──
test("handleApi: 로그인→인증→등록→실행 흐름 (서버/Vercel 공통)", async () => {
  const store = new AlphaStore({ data: normalizeData(null), persister: { load: () => null, save: () => {} } });
  const sessions = new Set<string>();
  const noauth = await handleApi(store, sessions, "/api/dashboard", {}, "bad");
  assert.equal(noauth.status, 401);                         // 인증 필요

  const login = await handleApi(store, sessions, "/api/login", { ownerName: "효주 대표", pass: "atlas" }, "");
  assert.equal(login.status, 200);
  const token = (login.json as { token: string }).token;
  assert.ok(token && sessions.has(token));

  const reg = await handleApi(store, sessions, "/api/register", { title: "신메뉴 소개 글 써줘" }, token);
  assert.equal(reg.status, 200);
  const taskId = (reg.json as { task: { id: string } }).task.id;
  await handleApi(store, sessions, "/api/provide", { taskId, infoKey: "brand-voice", items: [{ kind: "text", value: "v" }] }, token);
  await handleApi(store, sessions, "/api/provide", { taskId, infoKey: "channel", items: [{ kind: "text", value: "instagram" }] }, token);
  const exec = await handleApi(store, sessions, "/api/execute", { taskId }, token);
  assert.equal(exec.status, 200);
  assert.equal((exec.json as { task: { status: string } }).task.status, "delivered");

  const bad = await handleApi(store, sessions, "/api/unknown", {}, token);
  assert.equal(bad.status, 404);
});
