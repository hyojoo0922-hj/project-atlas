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
