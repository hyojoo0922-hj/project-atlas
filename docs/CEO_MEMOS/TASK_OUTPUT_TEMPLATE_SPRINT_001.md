# TASK OUTPUT TEMPLATE SPRINT #001

> CEO MEMO — Atlas Alpha. 작성 기준일 2026-06-29. 본 문서가 이 Sprint의 단일 진실 공급원이다.

## 목표

결과물 품질을 높이기 위해 **직원별 양식이 아니라 업무(결과물) 유형별 결과물 템플릿**을 구현한다. 대표가 바로 검토할 수 있는 완성형 형식이어야 하며, mock·실제 AI 모두에서 동일한 템플릿 구조가 나와야 한다.

## 핵심

- social_post / ad_copy / report / customer_reply / checklist / image_brief 각각 **별도 제출 양식**.
- "placeholder" / "예시 placeholder" 같은 미완성 문구가 **실제 결과물에 절대 나오면 안 된다**.
- **image_brief는 최소 10개 섹션 이상**으로 상세하게.
- 각 결과물은 대표가 바로 검토 가능한 완성도.
- **Output Standard + Output Quality Standard와 연결** — 템플릿 섹션이 표준과 정합, 품질 평가가 템플릿 섹션 누락을 감지.
- 실제 AI ON일 때 템플릿을 프롬프트에 **강하게 주입**, mock 모드에서도 템플릿 구조가 제대로 나옴.

## 필수 구현

1. 업무 유형별 템플릿 정의(`OUTPUT_TEMPLATES`).
2. image_brief 상세 템플릿 강화(≥10 섹션).
3. placeholder 문구 제거(mockContent 템플릿화).
4. 결과물 카드에 템플릿 기반 구조(섹션) 표시.
5. 품질 평가가 템플릿 섹션 누락/placeholder 잔존을 감지(Needs Revision 유도).
6. 테스트 추가.

## 금지

실제 이미지 생성 · 실결제 · DB 추가 · 대규모 UI 변경 없음.

## 설계 (CTO)

- `packages/hq-catalog/src/output-template.ts`: `OUTPUT_TEMPLATES`(유형별 섹션: title/hint/mock),
  `getOutputTemplate`, `renderTemplateForPrompt`(강한 주입), `renderMockFromTemplate`(완성형 mock), `templateSectionTitles`.
- Alpha: `buildPrompt`에 템플릿 강하게 주입(+기존 Output Standard), `mockContent`를 템플릿 렌더로 교체(placeholder 제거),
  `TaskResult.templateSections` 기록 → 결과 카드/결과물 탭에 구성 표시.
- 품질: `evaluateQuality(content, category, state, expectedSections?)` — 템플릿 섹션 누락 시 감점/Needs Revision,
  "placeholder/예시" 잔존 시 Needs Revision.

## 완료 보고 항목

테스트 결과 · 커밋 해시 · 변경된 업무별 템플릿.
