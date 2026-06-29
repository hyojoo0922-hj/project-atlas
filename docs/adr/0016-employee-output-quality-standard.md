# ADR 0016 — 직원 Output Quality Standard (HQ Quality Check 통과 후 제출)

- 상태: Accepted
- 근거 메모: [EMPLOYEE_OUTPUT_QUALITY_STANDARD](../CEO_MEMOS/EMPLOYEE_OUTPUT_QUALITY_STANDARD.md)

## 맥락

Output Standard(형식)만 지켜서는 품질이 보장되지 않는다. HQ가 결과물 품질을 평가하고, 직원은 그 평가를 통과(또는 등급 부여)한 뒤 제출해야 한다.

## 결정

- **Quality Standard**(카테고리별 필수 항목): Writer/Designer/Marketing/CS/Report. `packages/hq-catalog/src/output-quality.ts`.
- **평가 등급**: Excellent / Good / Draft / Needs Revision. **Draft 이하 → 대표에게 "수정 요청" 권장**(`recommendRevision`).
- **이번 구현은 Placeholder** — 실제 AI 평가는 하지 않는다. 결정적 평가(상태 final/draft + 분량)로 Label/Score 산출. `pending`(이미지 생성 대기)은 평가 대상 아님.
- **기록/표시**: `TaskResult`에 qualityLabel/qualityScore/qualityCategory/recommendRevision 저장. 결과 카드·결과물 탭에 Quality Badge + 수정 권장 힌트.
- **Satisfaction 연결**: 대표 만족도(`task.feedback.overall`)와 HQ Quality를 함께 보존(학습 로직은 후속).
- 실결제·이미지/영상 생성·DB 추가·UX 대규모 변경 없음. 기존 Output Standard/Vault/크레딧/Ledger/계약 구조 불변.

## 결과

모든 결과물이 HQ 품질 등급을 부여받고, Draft 이하는 수정 요청이 권장된다. 후속으로 실제 AI 평가, 등급별 자동 재작성, Quality×Satisfaction 학습을 이 토대 위에 둔다.
