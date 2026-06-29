# ADR 0015 — 직원 Output Standard (자유 제출 금지)

- 상태: Accepted
- 근거 메모: [EMPLOYEE_OUTPUT_STANDARD](../CEO_MEMOS/EMPLOYEE_OUTPUT_STANDARD.md)

## 맥락

직원이 결과물을 자유 형식으로 제출하면 품질이 균일하지 않고, 직원 교체·버전 업데이트 시 형식이 흔들린다. HQ가 결과물 유형별 표준을 정의하고 직원이 그 표준에 맞춰 제출해야 한다.

## 결정

- **HQ Output Standard**(유형별): `sections`·`format`·`maxChars`·`tone`·`mustInclude`·`mustAvoid`. HQ 소유(직원/고객 임의변경 금지). `packages/hq-catalog/src/output-standard.ts`.
- **생성 시 주입**: Alpha `buildPrompt`가 `renderStandardForPrompt`로 표준을 프롬프트에 주입 → 직원은 표준대로 작성.
- **기록**: `TaskResult.standardLabel`에 적용 표준 기록, 결과 카드/결과물 탭에 라벨 표시.
- **Trust First 정합**: `image_brief` 표준은 "실제 이미지는 아직 생성하지 않았습니다" 고지 필수. 이미지/영상은 산출 표준 없음(실제 생성 안 함).
- 기존 자료/Vault/크레딧/Ledger/직원 계약 구조 불변. 실결제·이미지/영상 생성·DB 추가 없음.

## 결과

모든 결과물이 HQ 표준을 따르고 적용 표준이 기록된다. 후속으로 전문 직원별 표준 세분화, 표준 위반 자동 점검을 이 토대 위에 둔다.
