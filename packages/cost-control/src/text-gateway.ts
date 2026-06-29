// Text Generation Gateway — 결과물 생성 순간에만 AI 호출 (Cost First).
// 기본은 mock(오프라인/테스트 안전). ATLAS_LLM=on + ANTHROPIC_API_KEY 일 때만 실제 Claude 호출.
// 이미지/영상 실제 생성은 하지 않음 — 텍스트 결과물만(image_brief 포함).
import type { OutputType } from "../../shared-types/src/index.ts";

export interface GenRequest {
  outputType: OutputType;
  system: string;
  prompt: string;
  fallbackText: string;   // AI 미사용/실패 시 사용할 mock 텍스트
  draft: boolean;
}
export interface GenResult {
  text: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;        // 예상 원가(내부 기록)
  mode: "ai" | "mock";
}
export type TextGenerator = (r: GenRequest) => Promise<GenResult>;

// 실제 텍스트 생성 허용 유형(allowlist). 그 외(text/document/image/video 등)는 안전하게 mock.
// 이미지/영상은 절대 실제 생성하지 않는다(image_brief는 텍스트 기획안이므로 허용).
export const REAL_TEXT_TYPES: ReadonlySet<OutputType> = new Set<OutputType>([
  "social_post", "ad_copy", "report", "customer_reply", "checklist" as OutputType, "image_brief",
]);
export const isRealTextType = (t: OutputType): boolean => REAL_TEXT_TYPES.has(t);

// Cost First: 가장 저렴한 모델. (claude-api: Haiku 4.5 = $1/$5 per MTok)
const MODEL = process.env.ATLAS_LLM_MODEL ?? "claude-haiku-4-5";
// Messages 엔드포인트. 기본은 실제 Anthropic. 호환 프록시/검증용으로만 override(ATLAS_LLM_URL).
const API_URL = process.env.ATLAS_LLM_URL ?? "https://api.anthropic.com/v1/messages";
const PRICE: Record<string, { in: number; out: number }> = {
  "claude-haiku-4-5": { in: 1, out: 5 },     // $/MTok
  "claude-sonnet-4-6": { in: 3, out: 15 },
};
const estTokens = (s: string): number => Math.ceil(s.length / 3.5);
const usd = (model: string, inTok: number, outTok: number): number => {
  const p = PRICE[model] ?? PRICE["claude-haiku-4-5"]!;
  return Number(((inTok / 1e6) * p.in + (outTok / 1e6) * p.out).toFixed(6));
};

/** mock — AI 호출 없음. fallbackText 그대로, 원가 0(예상 토큰만 기록). */
export const mockGenerator: TextGenerator = async (r) => ({
  text: r.fallbackText,
  model: "mock",
  inputTokens: estTokens(r.system + r.prompt),
  outputTokens: estTokens(r.fallbackText),
  costUsd: 0,
  mode: "mock",
});

/** 실제 Claude 호출 (zero-dep fetch). 실패 시 mock으로 안전 폴백. */
export const anthropicGenerator: TextGenerator = async (r) => {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return mockGenerator(r);                 // 키 없음 → 안전 폴백
  if (!isRealTextType(r.outputType)) return mockGenerator(r); // allowlist 밖 → 실제 호출 금지
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 600,                 // Cost First: 짧은 결과물
        system: r.system,
        messages: [{ role: "user", content: r.prompt }],
      }),
    });
    if (!res.ok) return mockGenerator(r);
    const j = await res.json() as { content?: { type: string; text?: string }[]; usage?: { input_tokens: number; output_tokens: number }; model?: string };
    const text = (j.content ?? []).filter((b) => b.type === "text").map((b) => b.text ?? "").join("\n").trim();
    if (!text) return mockGenerator(r);
    const inTok = j.usage?.input_tokens ?? estTokens(r.system + r.prompt);
    const outTok = j.usage?.output_tokens ?? estTokens(text);
    const model = j.model ?? MODEL;
    return { text, model, inputTokens: inTok, outputTokens: outTok, costUsd: usd(model, inTok, outTok), mode: "ai" };
  } catch {
    return mockGenerator(r);           // 네트워크/오류 → 안전 폴백
  }
};

/** 환경에 따라 생성기 선택. 기본 mock(테스트/오프라인 안전). */
export function makeTextGenerator(): TextGenerator {
  return process.env.ATLAS_LLM === "on" ? anthropicGenerator : mockGenerator;
}

/** 현재 LLM 설정 상태(서버 로그/진단용 — 키 값은 노출하지 않음). */
export function llmStatus(): { on: boolean; hasKey: boolean; active: boolean; model: string } {
  const on = process.env.ATLAS_LLM === "on";
  const hasKey = !!process.env.ANTHROPIC_API_KEY;
  return { on, hasKey, active: on && hasKey, model: MODEL };
}
