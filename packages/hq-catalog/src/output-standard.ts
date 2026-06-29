// HQ Output Standard — 직원은 자유롭게 결과물을 제출하지 않고, 유형별 HQ 표준에 맞춰 제출한다.
// 근거: docs/CEO_MEMOS/EMPLOYEE_OUTPUT_STANDARD.md. 순수 데이터/함수(부수효과 없음).
import type { OutputType } from "../../shared-types/src/index.ts";

export interface OutputStandard {
  outputType: OutputType;
  label: string;            // 표준 라벨(결과물 카드 표시)
  sections: string[];       // 필수 구성요소
  format: string;           // 형식
  maxChars: number;         // 권장 분량 상한
  tone: string;             // 톤
  mustInclude: string[];    // 반드시 포함
  mustAvoid: string[];      // 금지
}

// HQ가 정의·관리하는 유형별 표준. (이미지/영상은 실제 생성 없음 → image_brief 표준만)
export const OUTPUT_STANDARDS: Partial<Record<OutputType, OutputStandard>> = {
  social_post: {
    outputType: "social_post", label: "SNS 포스트",
    sections: ["후킹 첫 문장", "핵심 메시지", "해시태그 3~5개", "행동 유도(CTA)"],
    format: "짧은 단락 + 해시태그", maxChars: 500, tone: "친근하고 생동감 있게",
    mustInclude: ["브랜드명", "핵심 혜택"], mustAvoid: ["과장 광고 표현", "미확인 효능"],
  },
  ad_copy: {
    outputType: "ad_copy", label: "광고 카피",
    sections: ["헤드라인", "서브카피", "CTA"],
    format: "헤드라인 / 서브카피 / CTA 3블록", maxChars: 400, tone: "설득적·간결",
    mustInclude: ["핵심 베네핏", "CTA"], mustAvoid: ["허위·과장", "경쟁사 비방"],
  },
  report: {
    outputType: "report", label: "리포트",
    sections: ["요약(3줄)", "주요 지표", "인사이트", "다음 액션"],
    format: "섹션 제목 + 불릿", maxChars: 1500, tone: "객관적·간결",
    mustInclude: ["기간", "핵심 수치(없으면 자리표시자)"], mustAvoid: ["근거 없는 추정", "민감정보"],
  },
  customer_reply: {
    outputType: "customer_reply", label: "고객 응대",
    sections: ["인사·공감", "답변 본문", "후속 안내", "마무리 인사"],
    format: "정중한 단락", maxChars: 600, tone: "정중·공감",
    mustInclude: ["문의 요점 재확인", "정책 근거"], mustAvoid: ["단정적 약속", "법적 확약"],
  },
  checklist: {
    outputType: "checklist" as OutputType, label: "체크리스트",
    sections: ["목적 한 줄", "점검 항목(체크박스)", "주의사항"],
    format: "[ ] 불릿 체크리스트", maxChars: 800, tone: "명확·실행지향",
    mustInclude: ["우선순위", "담당/시점(없으면 자리표시자)"], mustAvoid: ["모호한 표현"],
  },
  image_brief: {
    outputType: "image_brief", label: "이미지 제작 기획안",
    sections: ["실제 이미지 미생성 고지", "연출 기획", "촬영 가이드", "이미지 프롬프트 초안", "디자이너 요청서", "필요 자료 체크리스트"],
    format: "번호 섹션", maxChars: 1200, tone: "구체적·디렉션",
    mustInclude: ["실제 이미지는 아직 생성하지 않았습니다"], mustAvoid: ["실제 생성 완료 주장"],
  },
  document: {
    outputType: "document", label: "문서",
    sections: ["제목", "목적", "본문", "요약"],
    format: "제목 + 섹션", maxChars: 2000, tone: "명확",
    mustInclude: ["목적"], mustAvoid: ["불필요한 장황함"],
  },
  text: {
    outputType: "text", label: "텍스트",
    sections: ["핵심 메시지", "본문"],
    format: "단락", maxChars: 800, tone: "브랜드 톤",
    mustInclude: ["핵심 메시지"], mustAvoid: ["주제 이탈"],
  },
  product_page: {
    outputType: "product_page", label: "상세페이지",
    sections: ["헤드라인", "핵심 베네핏 3", "상세 설명", "스펙/구성", "CTA"],
    format: "섹션 + 불릿", maxChars: 1800, tone: "신뢰감·설득",
    mustInclude: ["핵심 베네핏", "구성/정책(없으면 자리표시자)"], mustAvoid: ["허위 효능", "미검증 주장"],
  },
};

export function getOutputStandard(t: OutputType): OutputStandard | undefined {
  return OUTPUT_STANDARDS[t];
}

/** 프롬프트에 주입할 표준 지시문. 직원이 HQ 표준대로 작성하도록 강제. */
export function renderStandardForPrompt(std: OutputStandard): string {
  return [
    `[HQ Output Standard — 반드시 준수: ${std.label}]`,
    `필수 구성요소: ${std.sections.join(" · ")}`,
    `형식: ${std.format}`,
    `톤: ${std.tone}`,
    `분량: 약 ${std.maxChars}자 이내`,
    `반드시 포함: ${std.mustInclude.join(", ")}`,
    `금지: ${std.mustAvoid.join(", ")}`,
  ].join("\n");
}
