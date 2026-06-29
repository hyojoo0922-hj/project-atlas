import { test } from "node:test";
import assert from "node:assert/strict";
import { getOutputStandard, OUTPUT_STANDARDS, renderStandardForPrompt } from "../src/output-standard.ts";

const TYPES = ["social_post", "ad_copy", "report", "customer_reply", "checklist", "image_brief", "document", "text", "product_page"];

test("Output Standard: 주요 유형마다 표준 정의(섹션·형식·분량·톤·포함/금지)", () => {
  for (const t of TYPES) {
    const s = getOutputStandard(t as never);
    assert.ok(s, `${t} 표준 누락`);
    assert.ok(s!.label.length > 0);
    assert.ok(s!.sections.length >= 2, `${t} 섹션 부족`);
    assert.ok(s!.format.length > 0 && s!.tone.length > 0);
    assert.ok(s!.maxChars > 0);
    assert.ok(s!.mustInclude.length >= 1 && s!.mustAvoid.length >= 1);
  }
});

test("Output Standard: image_brief는 '실제 이미지 미생성' 고지를 필수 포함(Trust First)", () => {
  const s = getOutputStandard("image_brief" as never)!;
  assert.ok(s.mustInclude.some((x) => x.includes("실제 이미지는 아직 생성하지 않았습니다")));
  assert.ok(s.mustAvoid.some((x) => x.includes("실제 생성 완료")));
});

test("renderStandardForPrompt: 표준 라벨·필수 구성요소·금지 항목을 프롬프트 문구로 렌더", () => {
  const s = getOutputStandard("social_post" as never)!;
  const p = renderStandardForPrompt(s);
  assert.ok(p.includes("HQ Output Standard"));
  assert.ok(p.includes("SNS 포스트"));
  assert.ok(p.includes("해시태그 3~5개"));   // 섹션
  assert.ok(p.includes("금지:"));
});

test("Output Standard: 미정의 유형(image/video)은 undefined — 실제 산출 표준 없음", () => {
  assert.equal(getOutputStandard("image" as never), undefined);
  assert.equal(getOutputStandard("video" as never), undefined);
});
