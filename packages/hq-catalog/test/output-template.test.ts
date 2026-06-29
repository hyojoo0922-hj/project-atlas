import { test } from "node:test";
import assert from "node:assert/strict";
import {
  getOutputTemplate, OUTPUT_TEMPLATES, renderMockFromTemplate, renderTemplateForPrompt, templateSectionTitles,
} from "../src/output-template.ts";

const CTX = { company: "로마티 카페", by: "콘텐츠 라이터", title: "신메뉴 소개" };
const REQUIRED = ["social_post", "ad_copy", "report", "customer_reply", "checklist", "image_brief"];

test("템플릿: 필수 6개 유형 각각 별도 양식 정의(섹션 2개 이상)", () => {
  for (const t of REQUIRED) {
    const tpl = getOutputTemplate(t as never);
    assert.ok(tpl, `${t} 템플릿 누락`);
    assert.ok(tpl!.sections.length >= 2);
  }
});

test("템플릿: image_brief는 최소 10개 섹션", () => {
  const tpl = getOutputTemplate("image_brief" as never)!;
  assert.ok(tpl.sections.length >= 10, `image_brief 섹션 ${tpl.sections.length}개`);
  assert.ok(tpl.sections[0]!.mock.includes("실제 이미지는 아직 생성하지 않았습니다"));
});

test("mock 렌더: 모든 섹션 제목 포함 + placeholder/예시 문구 없음", () => {
  for (const t of REQUIRED) {
    const tpl = getOutputTemplate(t as never)!;
    const out = renderMockFromTemplate(tpl, CTX);
    for (const s of tpl.sections) assert.ok(out.includes(s.title), `${t} 섹션 누락: ${s.title}`);
    assert.ok(!/placeholder|예시\s*placeholder|TODO/i.test(out), `${t} mock에 미완성 문구 잔존`);
    assert.ok(out.includes("로마티 카페"));   // 회사 맥락 주입
  }
});

test("프롬프트 렌더: 섹션과 '미완성 문구 금지' 지시 포함", () => {
  const p = renderTemplateForPrompt(getOutputTemplate("social_post" as never)!);
  assert.ok(p.includes("필수 결과물 템플릿"));
  assert.ok(/placeholder.*쓰지|쓰지.*마세요/.test(p) || p.includes("미완성 문구"));
  assert.ok(p.includes("후킹"));
});

test("templateSectionTitles: 섹션 제목 배열", () => {
  const titles = templateSectionTitles("customer_reply" as never);
  assert.ok(titles.includes("인사·공감") && titles.includes("마무리"));
});
