# @atlas/hq-catalog

HQ가 관리하는 **전문 직원 카탈로그 + 업무 적합성 판단**. 순수 모듈(부수효과 없음).

근거: [`EMPLOYEE_CONTRACT_AND_PRICING_CONSTITUTION`](../../docs/CEO_MEMOS/EMPLOYEE_CONTRACT_AND_PRICING_CONSTITUTION.md) · ADR 0013.

## 핵심 개념

- **직원은 계약**이다(구매 아님). 직군(RoleFamily)과 직원(SpecializedEmployee)을 분리한다.
- 가격은 **원가 기준**(`costTier`), 계약 옵션은 직원별로 다름(`contractOptions`). 모두 **Placeholder** — 실결제 없음.
- HQ가 직원×업무 적합성을 **가능 / 비추천 / 지원 안 함**으로 판단한다.

## API

- `HQ_EMPLOYEES` — 전문 직원 레지스트리(Writer/Designer/Video/Marketing/CS/Operations/AI 비서)
- `listSpecialized(roleFamily?)` · `getSpecialized(id)` · `bySpecialization()`
- `contractOptionsFor(id)`
- `judgeSuitability(emp, outputType)` · `judgeSuitabilityById(id, outputType)` → `supported | not_recommended | unsupported`
- `recommendForOutput(outputType)` → `{ supported, notRecommended }`
- `SUITABILITY_LABEL`

## 범위 밖(헌법에 명시, 후속 Sprint)

직원 버전 비교/선택 업데이트/롤백, 실결제, ROI 기반 교육 결정.
