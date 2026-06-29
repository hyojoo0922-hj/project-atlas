// 업무(결과물) 유형별 결과물 템플릿 — 직원별 양식이 아니라 유형별 완성형 양식.
// 근거: docs/CEO_MEMOS/TASK_OUTPUT_TEMPLATE_SPRINT_001.md, ADR 0017.
// 원칙: 완성형(대표가 바로 검토) · placeholder 문구 금지 · Output Standard/Quality와 정합.
import type { OutputType } from "../../shared-types/src/index.ts";

export interface TemplateSection {
  title: string;   // 섹션 제목(품질 누락 감지 기준)
  hint: string;    // 프롬프트 주입용 작성 지침
  mock: string;    // mock 모드 기본 내용({company}/{title}/{tag} 토큰 사용, placeholder 문구 없음)
}
export interface OutputTemplate {
  outputType: OutputType;
  label: string;
  sections: TemplateSection[];
}

const S = (title: string, hint: string, mock: string): TemplateSection => ({ title, hint, mock });

export const OUTPUT_TEMPLATES: Partial<Record<OutputType, OutputTemplate>> = {
  social_post: { outputType: "social_post", label: "SNS 포스트", sections: [
    S("후킹", "첫 문장에서 시선을 잡는 한 줄", "{company}의 새로운 한 잔, 오늘 처음 공개합니다 ☕"),
    S("본문", "핵심 메시지와 혜택을 브랜드 톤으로", "정성껏 준비한 신메뉴를 {company}에서 만나보세요. 오늘의 분위기에 어울리는 특별한 선택이 되어드립니다."),
    S("해시태그", "관련 해시태그 3~5개", "#{tag} #신메뉴 #오늘의카페 #데일리추천"),
    S("CTA", "구체적 행동 유도 한 줄", "지금 매장에 방문해 가장 먼저 만나보세요 →"),
  ] },
  ad_copy: { outputType: "ad_copy", label: "광고 카피", sections: [
    S("헤드라인", "강력한 한 줄 후킹", "{company}, 오늘의 신메뉴로 하루를 깨우다"),
    S("서브카피", "핵심 베네핏 설명", "엄선한 재료와 정성으로 완성한 한 잔. {company}에서만 느낄 수 있는 풍미를 경험하세요."),
    S("CTA", "행동 유도", "지금 매장에서 만나보세요"),
  ] },
  report: { outputType: "report", label: "리포트", sections: [
    S("기간", "분석 대상 기간", "최근 4주"),
    S("요약", "핵심 3줄 요약", "{company}의 운영·마케팅 현황을 핵심만 요약합니다. 추가 데이터가 제공되면 수치가 더 구체화됩니다."),
    S("주요 지표", "방문/재방문/객단가 등", "방문 수 · 재방문율 · 객단가 · 인기 메뉴를 항목별로 정리합니다."),
    S("인사이트", "강점·개선 포인트", "강점과 개선이 필요한 지점을 구분해 제시합니다."),
    S("다음 액션", "우선순위 행동 3가지", "우선순위가 높은 실행 항목 3가지를 제안합니다."),
  ] },
  customer_reply: { outputType: "customer_reply", label: "고객 응대", sections: [
    S("인사·공감", "정중한 인사와 공감", "안녕하세요, {company}입니다. 먼저 불편을 드린 점 진심으로 사과드립니다."),
    S("답변", "문의 요점 재확인 + 답변", "문의하신 내용을 확인했습니다. 상황을 정확히 파악해 아래와 같이 안내드립니다."),
    S("해결책", "구체적 해결 방안", "요청하신 사항에 대해 가능한 처리 방법을 안내드립니다."),
    S("후속 안내", "추가 도움 경로", "추가로 도움이 필요하시면 언제든 다시 문의해 주세요."),
    S("마무리", "감사 인사", "소중한 의견을 주셔서 감사합니다. 더 나은 {company}가 되겠습니다."),
  ] },
  checklist: { outputType: "checklist" as OutputType, label: "체크리스트", sections: [
    S("목적", "체크리스트의 목적 한 줄", "{company} 운영 점검을 위한 실행 체크리스트입니다."),
    S("점검 항목", "체크박스 항목들(우선순위순)", "[ ] 우선순위 높은 점검 항목\n[ ] 두 번째 점검 항목\n[ ] 세 번째 점검 항목"),
    S("주의사항", "실행 시 유의점", "우선순위가 높은 항목부터 처리하고, 담당과 시점을 함께 확인하세요."),
  ] },
  image_brief: { outputType: "image_brief", label: "이미지 제작 기획안", sections: [
    S("실제 이미지 미생성 고지", "맨 앞에 미생성 사실 명시", "⚠️ 실제 이미지는 아직 생성하지 않았습니다. 아래는 디자이너가 바로 작업할 수 있는 상세 기획안입니다."),
    S("목적/용도", "이미지의 사용 목적·채널", "{company} 신메뉴 홍보용 비주얼. SNS 피드와 매장 게시 용도."),
    S("핵심 메시지", "한 장으로 전할 메시지", "따뜻하고 정성스러운 {company}의 신메뉴 경험."),
    S("타겟/톤앤매너", "대상 고객과 분위기", "20~30대, 따뜻하고 미니멀하며 감성적인 톤."),
    S("연출 기획", "구도·소품·상황 연출", "신메뉴를 중심에 두고 자연스러운 일상 소품(원목 트레이, 린넨)을 배치."),
    S("촬영 가이드", "조명·앵글·배경", "자연광 기준, 45도 앵글, 우드톤 배경 권장."),
    S("브랜드 컬러/스타일", "팔레트·스타일", "{company} 브랜드 컬러를 메인으로, 채도 낮은 보조 컬러로 안정감."),
    S("레이아웃/여백/시선 흐름", "구성과 여백, 시선 동선", "상단 여백 충분히, 제품 → 카피 → 로고로 이어지는 시선 흐름."),
    S("텍스트/카피 배치(가독성)", "문구 위치와 가독성", "핵심 카피는 좌상단, 충분한 대비로 가독성 확보."),
    S("이미지 생성 프롬프트 초안", "생성형 프롬프트 문장", "\"{company} 신메뉴, 따뜻한 자연광, 우드톤 배경, 미니멀 감성, 고해상도\""),
    S("디자이너 요청서", "디자이너에게 전달할 요청", "위 기획안 기반 1차 시안 2종 요청(정방형/세로형)."),
    S("필요 자료 체크리스트", "필요한 입력 자료", "[ ] 로고 [ ] 브랜드 컬러 [ ] 제품 사진 [ ] 디자인 레퍼런스"),
    S("참고 레퍼런스", "톤 참고", "유사 카페의 따뜻한 무드 레퍼런스 2~3개 첨부 권장."),
  ] },
  text: { outputType: "text", label: "텍스트", sections: [
    S("핵심 메시지", "전달할 핵심 한 줄", "{company}가 전하고자 하는 핵심 메시지입니다."),
    S("본문", "브랜드 톤의 본문", "주제에 맞춰 {company}의 톤으로 작성한 본문입니다."),
  ] },
  document: { outputType: "document", label: "문서", sections: [
    S("제목", "문서 제목", "{title}"),
    S("목적", "문서의 목적", "이 문서의 목적과 배경을 정리합니다."),
    S("본문", "핵심 내용", "주제별로 정리한 본문 내용입니다."),
    S("요약", "한눈 요약", "핵심을 한 문단으로 요약합니다."),
  ] },
  product_page: { outputType: "product_page", label: "상세페이지", sections: [
    S("헤드라인", "구매 욕구 자극 한 줄", "{company}가 자신 있게 선보이는 신제품"),
    S("핵심 베네핏 3", "베네핏 3가지", "1) 차별화 포인트\n2) 사용 가치\n3) 신뢰 요소"),
    S("상세 설명", "제품 설명", "제품의 특징과 사용 방법을 구체적으로 설명합니다."),
    S("스펙/구성", "구성·정책", "구성품과 교환/환불 정책을 안내합니다."),
    S("CTA", "구매 유도", "지금 구매하고 혜택을 받아보세요"),
  ] },
};

export function getOutputTemplate(t: OutputType): OutputTemplate | undefined { return OUTPUT_TEMPLATES[t]; }
export function templateSectionTitles(t: OutputType): string[] {
  return (OUTPUT_TEMPLATES[t]?.sections ?? []).map((s) => s.title);
}

const fill = (s: string, ctx: { company: string; by: string; title: string }): string =>
  s.replaceAll("{company}", ctx.company).replaceAll("{by}", ctx.by)
    .replaceAll("{title}", ctx.title).replaceAll("{tag}", ctx.company.replace(/\s/g, ""));

/** 프롬프트에 강하게 주입할 템플릿 지시문. */
export function renderTemplateForPrompt(tpl: OutputTemplate): string {
  return [
    `[필수 결과물 템플릿 — ${tpl.label}]`,
    `아래 모든 섹션을 실제 내용으로 채워 완성형으로 제출하세요. 섹션 제목을 그대로 머리표로 사용하세요.`,
    `절대 "placeholder", "예시", "TODO" 같은 미완성 문구를 쓰지 마세요. 대표가 바로 검토할 수 있어야 합니다.`,
    ...tpl.sections.map((s, i) => `${i + 1}. ${s.title} — ${s.hint}`),
  ].join("\n");
}

/** mock 모드 완성형 결과물(템플릿 구조 + 회사 맥락, placeholder 문구 없음). */
export function renderMockFromTemplate(tpl: OutputTemplate, ctx: { company: string; by: string; title: string }): string {
  const head = `【${tpl.label} · ${ctx.by}】 — ${ctx.title}`;
  const body = tpl.sections.map((s) => `■ ${s.title}\n${fill(s.mock, ctx)}`).join("\n\n");
  return `${head}\n\n${body}`;
}
