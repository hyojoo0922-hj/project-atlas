# EMPLOYEE OUTPUT STANDARD

> CEO MEMO / 헌법 보강 — Project Atlas. 작성 기준일 2026-06-29.
> 본 문서는 직원 결과물의 **표준(Output Standard)** 원칙의 단일 진실 공급원이다.

## 목적

Project Atlas의 직원은 **자유롭게 결과물을 제출하지 않는다.** 직원이 만드는 모든 결과물은 HQ가 결과물 유형별로 정의한 **Output Standard**(필수 구성요소·형식·분량·톤·필수 포함/금지)에 맞춰 제출된다. 이렇게 해야 품질이 균일하고(Trust First), 고객 경험이 일관되며, 직원 교체·버전 업데이트에도 결과물 형식이 흔들리지 않는다.

## 원칙

1. **표준 우선** — 결과물 생성 시 해당 유형의 Output Standard가 프롬프트에 주입되고, 결과물에는 적용된 표준이 기록된다.
2. **HQ 소유** — 표준은 HQ가 정의·관리한다(직원/고객이 임의 변경하지 않는다). 직군↔직원 분리와 동일하게 HQ 카탈로그에 둔다.
3. **유형별 표준** — 각 Output Standard는 `sections`(필수 구성요소) · `format` · `maxChars`(권장 분량) · `tone` · `mustInclude` · `mustAvoid` 를 가진다.
4. **Trust First 정합** — 이미지/영상은 실제 생성하지 않으므로 `image_brief` 표준은 "실제 이미지는 아직 생성하지 않았습니다" 고지를 필수 포함한다.
5. **기록** — 결과물 카드/결과물 탭에 적용된 표준 라벨을 표시한다.

## HQ Output Standard (유형별)

| 유형 | 라벨 | 필수 구성요소(sections) |
|---|---|---|
| social_post | SNS 포스트 | 후킹 첫 문장 · 핵심 메시지 · 해시태그 3~5 · CTA |
| ad_copy | 광고 카피 | 헤드라인 · 서브카피 · CTA |
| report | 리포트 | 요약(3줄) · 주요 지표 · 인사이트 · 다음 액션 |
| customer_reply | 고객 응대 | 인사·공감 · 답변 본문 · 후속 안내 · 마무리 |
| checklist | 체크리스트 | 목적 한 줄 · 점검 항목(체크박스) · 주의사항 |
| image_brief | 이미지 제작 기획안 | 미생성 고지 · 연출 기획 · 촬영 가이드 · 프롬프트 초안 · 디자이너 요청서 · 자료 체크리스트 |
| document | 문서 | 제목 · 목적 · 본문 · 요약 |
| text | 텍스트 | 핵심 메시지 · 본문 |
| product_page | 상세페이지 | 헤드라인 · 핵심 베네핏 3 · 상세 설명 · 스펙/구성 · CTA |

각 표준은 형식·분량 상한·톤·필수 포함/금지를 함께 정의한다(세부는 `packages/hq-catalog/src/output-standard.ts`).

## 이번 작업 범위 (설계 + Alpha 반영)

- 표준 정의: `packages/hq-catalog/src/output-standard.ts` (`OUTPUT_STANDARDS`, `getOutputStandard`, `renderStandardForPrompt`).
- Alpha 반영: 결과물 생성 시 표준을 프롬프트에 주입(`buildPrompt`), `TaskResult.standardLabel`에 적용 표준 기록, 결과 카드/결과물 탭에 표준 라벨 표시.
- 유지/금지: 실제 이미지/영상 생성·실결제·DB 추가·UX 대규모 변경 없음. 기존 자료/Vault/크레딧/Ledger/직원 계약 구조 불변.

## 완료 보고 항목

테스트 결과 · 커밋 해시 · 변경된 직원 Output Standard.
