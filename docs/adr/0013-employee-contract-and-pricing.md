# ADR 0013 — 직원은 계약이다: 전문 직원·원가 기준 가격·HQ 판단

- 상태: Accepted
- 근거 메모: [EMPLOYEE_CONTRACT_AND_PRICING_CONSTITUTION](../CEO_MEMOS/EMPLOYEE_CONTRACT_AND_PRICING_CONSTITUTION.md)

## 맥락

직원을 "구매(소유)"로 다루면 가격·업데이트·전문화 모델이 무너진다. Project Atlas의 직원은 HQ가 제공하는 전문 인력의 **계약**이어야 한다. 또한 단일 직군(RoleFamily)으로는 같은 Designer라도 SNS/패키지/럭셔리처럼 원가·적합 업무가 크게 다른 현실을 담지 못한다.

## 결정

1. **계약 모델**: 직원은 영구 소유가 아니라 계약. 상태(`active`/`expiring`/`ended`)와 종료 시 선택지(`extend`/`end`)를 구조로 둔다. (실결제·만료 타이머는 후속 Sprint.)
2. **전문 직원**: 직군과 직원을 분리한다. `SpecializedEmployee`(id/title/specialty/goodAt/notSupported/recommendedIndustries/costTier/contractOptions/version/supported/notRecommended). HQ가 레지스트리(`HQ_EMPLOYEES`)를 관리.
3. **가격은 원가 기준**: `costTier`(low~very_high) + `pricePlaceholder`. 직군이 아니라 원가로 매기며 직원마다 다르다. 이번 Sprint는 Placeholder.
4. **계약 옵션**: 직원별 `contractOptions`(일/프로젝트/월/회사 단위). 가격·기간은 Placeholder.
5. **HQ 판단**: `judgeSuitability(직원, 업무) → supported | not_recommended | unsupported`. 고객은 아무 직원에게 아무 업무를 시킬 수 없다 — HQ가 적합성을 관리한다.
6. **업데이트/롤백·ROI 교육**: 헌법에 명시하되 이번 Sprint 미구현. 버전 필드(`version`)만 토대로 둔다(자동 업데이트 안 함의 근거).

## 구현

- 타입: `packages/shared-types/src/employee-contract-types.ts`
- 순수 로직: `packages/hq-catalog/`(레지스트리·판단·추천·계약 옵션). 부수효과 없음.
- Alpha 노출: `dashboard().hqEmployees`, `taskView().suitability`, 직원 탭 전문 직원 카탈로그 렌더.
- 기존 Business Logic(업무·자료·결과물·Vault) 및 81→ 테스트 유지. 실결제·실DB·외부 AI 없음.

## 결과

직군↔직원 분리, 원가 기준 가격, 계약 옵션, HQ 적합성 판단 구조를 확보. 결제 Sprint에서 가격/기간 실값과 계약 상태머신, 업데이트/롤백을 이 토대 위에 올린다.
