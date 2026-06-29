// HQ Output Quality Standard — 직원은 형식(Output Standard)만으로 제출하지 않고, HQ 품질 평가를 통과해야 한다.
// 근거: docs/CEO_MEMOS/EMPLOYEE_OUTPUT_QUALITY_STANDARD.md, ADR 0016.
// 주의: 실제 AI 평가는 하지 않는다 — 결정적(deterministic) Placeholder 평가만.
import type { OutputType } from "../../shared-types/src/index.ts";

export type QualityCategory = "writer" | "designer" | "marketing" | "cs" | "report";
export type QualityLabel = "Excellent" | "Good" | "Draft" | "Needs Revision";

export interface QualityStandard {
  category: QualityCategory;
  label: string;        // 한글 라벨
  must: string[];       // HQ 필수 품질 항목
}

export const QUALITY_STANDARDS: Record<QualityCategory, QualityStandard> = {
  writer: { category: "writer", label: "Writer", must: ["Hook 존재", "CTA 존재", "저장하고 싶은 문장 1개 이상", "문단 구성", "브랜드 톤 일치", "금지 표현 없음"] },
  designer: { category: "designer", label: "Designer", must: ["목적 명확", "핵심 메시지", "브랜드 컬러", "레이아웃", "여백", "시선 흐름", "텍스트 가독성", "이미지 Prompt", "체크리스트"] },
  marketing: { category: "marketing", label: "Marketing", must: ["목표", "타겟", "KPI", "예상 효과", "CTA"] },
  cs: { category: "cs", label: "CS", must: ["공감", "답변", "해결책", "후속 안내"] },
  report: { category: "report", label: "Report", must: ["요약", "핵심", "원인", "추천", "다음 행동"] },
};

/** 결과물 유형 → 품질 평가 카테고리 */
export function qualityCategoryForOutput(t: OutputType): QualityCategory {
  if (t === "image_brief") return "designer";
  if (t === "customer_reply") return "cs";
  if (t === "report" || (t as string) === "checklist") return "report";
  return "writer"; // social_post/ad_copy/text/document/product_page
}

export interface QualityResult {
  category: QualityCategory;
  categoryLabel: string;
  label: QualityLabel;
  score: number;            // 0..100 (Placeholder)
  recommendRevision: boolean; // Draft 이하 → 대표에게 수정 요청 권장
  must: string[];
}

const labelFromScore = (score: number): QualityLabel =>
  score >= 90 ? "Excellent" : score >= 75 ? "Good" : score >= 50 ? "Draft" : "Needs Revision";

/** Placeholder 품질 평가 — 상태(final/draft)+분량 기반. 실제 AI 평가 아님.
 *  state "pending"(이미지 생성 대기 등)은 평가 대상 아님 → undefined. */
export function evaluateQuality(content: string, category: QualityCategory, state: "final" | "draft" | "pending"): QualityResult | undefined {
  if (state === "pending") return undefined;
  const len = (content ?? "").trim().length;
  let score: number;
  if (len < 15) score = 42;                       // 사실상 빈 결과 → Needs Revision
  else if (state === "final") score = len > 200 ? 92 : 82;  // 충분 자료 최종본
  else score = 66;                                // 초안
  const label = labelFromScore(score);
  const std = QUALITY_STANDARDS[category];
  return {
    category, categoryLabel: std.label, label, score,
    recommendRevision: label === "Draft" || label === "Needs Revision",
    must: std.must,
  };
}
