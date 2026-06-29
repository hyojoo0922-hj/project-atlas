import { test } from "node:test";
import assert from "node:assert/strict";
import { evaluateQuality, QUALITY_STANDARDS, qualityCategoryForOutput } from "../src/output-quality.ts";

test("Quality Standard: 5개 카테고리(Writer/Designer/Marketing/CS/Report) 필수 항목 정의", () => {
  for (const c of ["writer", "designer", "marketing", "cs", "report"] as const) {
    const s = QUALITY_STANDARDS[c];
    assert.ok(s && s.must.length >= 4, `${c} 필수 항목 부족`);
  }
  assert.ok(QUALITY_STANDARDS.writer.must.includes("Hook 존재"));
  assert.ok(QUALITY_STANDARDS.cs.must.includes("공감"));
  assert.ok(QUALITY_STANDARDS.report.must.includes("다음 행동"));
});

test("카테고리 매핑: 유형 → 평가 카테고리", () => {
  assert.equal(qualityCategoryForOutput("social_post" as never), "writer");
  assert.equal(qualityCategoryForOutput("image_brief" as never), "designer");
  assert.equal(qualityCategoryForOutput("customer_reply" as never), "cs");
  assert.equal(qualityCategoryForOutput("report" as never), "report");
});

test("Placeholder 평가: 최종본=Good 이상, 초안=Draft(수정 권장), 빈 결과=Needs Revision", () => {
  const finalQ = evaluateQuality("이 정도면 충분한 길이의 최종 결과물입니다. ".repeat(2), "writer", "final")!;
  assert.ok(["Good", "Excellent"].includes(finalQ.label));
  assert.equal(finalQ.recommendRevision, false);

  const draftQ = evaluateQuality("짧은 초안 결과물 내용입니다.", "writer", "draft")!;
  assert.equal(draftQ.label, "Draft");
  assert.equal(draftQ.recommendRevision, true);   // Draft 이하 → 수정 요청 권장

  const emptyQ = evaluateQuality("x", "writer", "final")!;
  assert.equal(emptyQ.label, "Needs Revision");
  assert.equal(emptyQ.recommendRevision, true);
});

test("Placeholder 평가: 긴 최종본 → Excellent, score 0..100", () => {
  const q = evaluateQuality("결과물 ".repeat(120), "report", "final")!;
  assert.equal(q.label, "Excellent");
  assert.ok(q.score >= 0 && q.score <= 100);
});

test("pending(이미지 생성 대기)은 품질 평가 대상이 아니다", () => {
  assert.equal(evaluateQuality("이미지 생성 준비됨", "designer", "pending"), undefined);
});
