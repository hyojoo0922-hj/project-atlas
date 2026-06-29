# EMPLOYEE OUTPUT QUALITY STANDARD

> CEO MEMO / 헌법 보강 — Project Atlas. 작성 기준일 2026-06-29.
> Output **Standard**(형식)에 더해, HQ가 결과물의 **품질**을 평가하는 기준(Output Quality Standard)을 정의한다.

## 목적

- Output Standard는 결과물의 **형식**을 정의한다.
- Output Quality Standard는 HQ가 결과물의 **품질**을 평가하는 기준이다.
- 직원은 Output Standard를 지키는 것만으로 제출하지 않는다. **HQ Quality Check를 통과**해야 한다.

## 직원별 Quality Standard (필수 항목)

1. **Writer** — Hook 존재 · CTA 존재 · 저장하고 싶은 문장 ≥1 · 문단 구성 · 브랜드 톤 일치 · 금지 표현 없음
2. **Designer** — 목적 명확 · 핵심 메시지 · 브랜드 컬러 · 레이아웃 · 여백 · 시선 흐름 · 텍스트 가독성 · 이미지 Prompt · 체크리스트
3. **Marketing** — 목표 · 타겟 · KPI · 예상 효과 · CTA
4. **CS** — 공감 · 답변 · 해결책 · 후속 안내
5. **Report** — 요약 · 핵심 · 원인 · 추천 · 다음 행동

## HQ Quality Rule

- 결과물은 **Excellent / Good / Draft / Needs Revision** 으로 평가된다.
- **Draft 이하**이면 자동으로 대표에게 **"수정 요청"** 을 권장한다.

## Satisfaction 연결

- 대표 만족도는 HQ Quality와 함께 저장된다.
- HQ는 Quality와 대표 만족도 **둘 다 학습**한다(학습 로직은 후속, 이번엔 저장 구조만).

## 이번 구현 (Placeholder 구조만)

- 실제 AI 평가는 구현하지 않는다.
- **Quality Label** · **Quality Score(Placeholder)** · **Quality Badge** · **결과물 탭 표시** 까지만 구현한다.
- 결정적(deterministic) 플레이스홀더 평가: 결과물 상태(final/draft)와 길이 기반으로 Label/Score 산출(AI 아님).
- 유지/금지: 실제 AI 평가·실결제·이미지/영상 생성·DB 추가·UX 대규모 변경 없음. 기존 Standard/Vault/크레딧/Ledger/계약 구조 불변.

## 구현 위치 (CTO)

- 품질 기준·평가: `packages/hq-catalog/src/output-quality.ts`
  (`QUALITY_STANDARDS`, `qualityCategoryForOutput`, `evaluateQuality`).
- Alpha: 결과물 생성 시 `evaluateQuality`로 Label/Score 산출 → `TaskResult`에 기록(qualityLabel/qualityScore/recommendRevision),
  결과 카드/결과물 탭에 Quality Badge + "수정 요청 권장" 표시. 대표 승인(만족도)과 함께 보존.
- ADR: `docs/adr/0016-employee-output-quality-standard.md`.

## 완료 보고 항목

구현 내용 · 직원별 Quality Standard · 결과물 탭 표시 · 테스트 · 커밋.
