import { test } from "node:test";
import assert from "node:assert/strict";
import {
  anthropicGenerator, isRealTextType, llmStatus, makeTextGenerator, mockGenerator, REAL_TEXT_TYPES,
} from "../src/text-gateway.ts";

const req = (outputType: string) => ({
  outputType: outputType as never, system: "sys", prompt: "p", fallbackText: "FB", draft: false,
});

test("allowlist: 실제 생성 허용 유형(social_post/ad_copy/report/customer_reply/checklist/image_brief)", () => {
  ["social_post", "ad_copy", "report", "customer_reply", "checklist", "image_brief"].forEach((t) =>
    assert.ok(isRealTextType(t as never), `${t} should be allowed`));
  assert.equal(REAL_TEXT_TYPES.size, 6);
});

test("allowlist: 이미지/영상 및 비허용 유형은 실제 생성 금지", () => {
  ["image", "video", "text", "document", "product_page"].forEach((t) =>
    assert.equal(isRealTextType(t as never), false, `${t} must NOT be real-generated`));
});

test("mockGenerator: AI 호출 없이 fallbackText·원가 0·mode mock", async () => {
  const r = await mockGenerator(req("social_post"));
  assert.equal(r.text, "FB");
  assert.equal(r.costUsd, 0);
  assert.equal(r.mode, "mock");
});

test("anthropicGenerator: 키 없으면 어떤 유형도 mock 폴백(네트워크 호출 없음)", async () => {
  const saved = process.env.ANTHROPIC_API_KEY;
  delete process.env.ANTHROPIC_API_KEY;
  try {
    const r = await anthropicGenerator(req("social_post"));
    assert.equal(r.mode, "mock");
    assert.equal(r.text, "FB");
  } finally {
    if (saved !== undefined) process.env.ANTHROPIC_API_KEY = saved;
  }
});

test("makeTextGenerator: 기본(ATLAS_LLM 미설정) → mock", async () => {
  const saved = process.env.ATLAS_LLM;
  delete process.env.ATLAS_LLM;
  try {
    const gen = makeTextGenerator();
    const r = await gen(req("social_post"));
    assert.equal(r.mode, "mock");
  } finally {
    if (saved !== undefined) process.env.ATLAS_LLM = saved;
  }
});

// ── 실제 생성 경로(anthropicGenerator) — fetch를 stub 하여 오프라인·네트워크 없이 검증 ──
const withStubFetch = async (impl: (url: string, opts: { headers: Record<string, string>; body: string }) => unknown, fn: () => Promise<void>) => {
  const savedKey = process.env.ANTHROPIC_API_KEY, savedFetch = globalThis.fetch;
  process.env.ANTHROPIC_API_KEY = "sk-ant-test-DUMMY";
  globalThis.fetch = (async (url: string, opts: never) => impl(url, opts as never)) as never;
  try { await fn(); } finally {
    globalThis.fetch = savedFetch;
    if (savedKey === undefined) delete process.env.ANTHROPIC_API_KEY; else process.env.ANTHROPIC_API_KEY = savedKey;
  }
};

test("실제 생성: 허용 유형 + 키 → AI 호출(stub) → mode ai · model · tokens · costUsd 기록", async () => {
  await withStubFetch(
    () => ({ ok: true, json: async () => ({ model: "claude-haiku-4-5", content: [{ type: "text", text: "AI 결과물" }], usage: { input_tokens: 120, output_tokens: 80 } }) }),
    async () => {
      const r = await anthropicGenerator(req("social_post"));
      assert.equal(r.mode, "ai");
      assert.equal(r.text, "AI 결과물");
      assert.equal(r.model, "claude-haiku-4-5");
      assert.equal(r.inputTokens, 120);
      assert.equal(r.outputTokens, 80);
      assert.ok(r.costUsd > 0);   // haiku 120/80 → 비용 > 0
    },
  );
});

test("실제 생성: 올바른 헤더/바디로 호출(키 헤더 포함, 응답 텍스트 파싱)", async () => {
  let captured: { headers: Record<string, string>; body: string } | null = null;
  await withStubFetch(
    (_url, opts) => { captured = opts; return { ok: true, json: async () => ({ content: [{ type: "text", text: "ok" }], usage: { input_tokens: 1, output_tokens: 1 } }) }; },
    async () => { await anthropicGenerator(req("ad_copy")); },
  );
  assert.equal(captured!.headers["x-api-key"], "sk-ant-test-DUMMY");
  assert.equal(captured!.headers["anthropic-version"], "2023-06-01");
  const body = JSON.parse(captured!.body);
  assert.ok(typeof body.model === "string" && body.max_tokens > 0 && Array.isArray(body.messages));
});

test("실제 생성 실패: res !ok → mock fallback", async () => {
  await withStubFetch(
    () => ({ ok: false, status: 500, json: async () => ({}) }),
    async () => {
      const r = await anthropicGenerator(req("report"));
      assert.equal(r.mode, "mock");
      assert.equal(r.text, "FB");
    },
  );
});

test("실제 생성 실패: 네트워크 throw → mock fallback", async () => {
  const savedKey = process.env.ANTHROPIC_API_KEY, savedFetch = globalThis.fetch;
  process.env.ANTHROPIC_API_KEY = "sk-ant-test-DUMMY";
  globalThis.fetch = (async () => { throw new Error("network down"); }) as never;
  try {
    const r = await anthropicGenerator(req("customer_reply"));
    assert.equal(r.mode, "mock");
  } finally {
    globalThis.fetch = savedFetch;
    if (savedKey === undefined) delete process.env.ANTHROPIC_API_KEY; else process.env.ANTHROPIC_API_KEY = savedKey;
  }
});

test("이미지/영상은 키가 있어도 실제 생성 호출이 절대 일어나지 않는다", async () => {
  let calls = 0;
  await withStubFetch(
    () => { calls++; return { ok: true, json: async () => ({ content: [{ type: "text", text: "x" }], usage: { input_tokens: 1, output_tokens: 1 } }) }; },
    async () => {
      for (const t of ["image", "video", "text", "document", "product_page"]) {
        const r = await anthropicGenerator(req(t));
        assert.equal(r.mode, "mock", `${t} must fall back to mock`);
      }
      assert.equal(calls, 0, "비허용 유형은 fetch 호출 0");
      // 허용 유형(image_brief 포함)은 실제 호출
      await anthropicGenerator(req("image_brief"));
      assert.equal(calls, 1);
    },
  );
});

test("llmStatus: on+key 일 때만 active, 키 값은 노출하지 않음", () => {
  const savedLlm = process.env.ATLAS_LLM, savedKey = process.env.ANTHROPIC_API_KEY;
  try {
    process.env.ATLAS_LLM = "on"; delete process.env.ANTHROPIC_API_KEY;
    let s = llmStatus();
    assert.equal(s.on, true); assert.equal(s.hasKey, false); assert.equal(s.active, false);
    process.env.ANTHROPIC_API_KEY = "sk-ant-test";
    s = llmStatus();
    assert.equal(s.active, true);
    assert.ok(!JSON.stringify(s).includes("sk-ant-test"));   // 키 미노출
  } finally {
    if (savedLlm !== undefined) process.env.ATLAS_LLM = savedLlm; else delete process.env.ATLAS_LLM;
    if (savedKey !== undefined) process.env.ANTHROPIC_API_KEY = savedKey; else delete process.env.ANTHROPIC_API_KEY;
  }
});
