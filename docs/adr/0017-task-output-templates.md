# ADR 0017 — 업무 유형별 결과물 템플릿 (Task Output Templates)

- 상태: Accepted
- 근거 메모: [TASK_OUTPUT_TEMPLATE_SPRINT_001](../CEO_MEMOS/TASK_OUTPUT_TEMPLATE_SPRINT_001.md)

## 맥락

결과물 품질을 높이려면 직원별 자유 양식이 아니라 **업무(결과물) 유형별 완성형 템플릿**이 필요하다. mock·실제 AI 모두에서 동일한 구조가 나와야 하고, "placeholder/예시" 같은 미완성 문구가 결과물에 남으면 안 된다.

## 결정

- **OUTPUT_TEMPLATES**(유형별 섹션: title/hint/mock) — `packages/hq-catalog/src/output-template.ts`. Output Standard/Quality와 정합.
- **image_brief는 최소 10개 섹션**(13개)으로 상세화.
- **프롬프트 강주입**: `renderTemplateForPrompt`가 모든 섹션 + "미완성 문구 금지" 지시를 실제 AI 프롬프트에 주입.
- **mock 완성형**: `renderMockFromTemplate`가 회사 맥락을 채운 완성형 결과물 생성(placeholder 문구 없음). `mockContent` 전면 교체.
- **품질 연동**: `evaluateQuality(..., expectedSections)`가 템플릿 섹션 누락·placeholder 잔존을 감지 → 감점/Needs Revision.
- **표시**: `TaskResult.templateSections` 기록 → 결과 카드/결과물 탭에 구성(섹션) 표시.
- 실제 이미지 생성·실결제·DB 추가·대규모 UI 변경 없음.

## 결과

모든 결과물이 유형별 완성형 템플릿을 따르며 placeholder가 사라진다. 후속으로 섹션 단위 자동 보정·표준 위반 자동 리라이트를 이 토대 위에 둔다.
