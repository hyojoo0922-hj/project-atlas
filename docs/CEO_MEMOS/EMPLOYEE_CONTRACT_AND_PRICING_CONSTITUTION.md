# EMPLOYEE CONTRACT & PRICING CONSTITUTION

> CEO MEMO / 헌법 보강 — Project Atlas. 작성 기준일 2026-06-29.
> 본 문서는 직원의 **계약·가격·전문화·HQ 판단** 원칙의 단일 진실 공급원이다. 충돌 시 본 문서가 우선한다.

## 목적

Project Atlas의 직원은 **"구매"가 아니라 "계약"**이다. 고객은 직원을 영구 소유하지 않는다. HQ가 제공하는 전문 인력을 **기간/단위로 계약**한다.

---

## 1. 직원 계약 (Contract, not Purchase)

- 직원은 영구 소유가 아니다. HQ 전문 인력을 계약하는 구조.
- 계약은 **상태**를 가진다: `active` → 만료 임박 → 만료.
- 계약 종료 시 고객은 **연장(extend) / 종료(end)** 를 선택한다.
- (이번 Sprint) 실제 결제·만료 타이머는 구현하지 않는다 — 계약 상태/선택지 **구조만**.

## 2. 계약 옵션 (Contract Options) — Placeholder

직원마다 계약 기간/단위가 다를 수 있다. HQ가 직원별 옵션을 관리한다.

| 직원 | 계약 옵션(예시) |
|---|---|
| Writer | 7일 · 30일 · 90일 |
| Designer | 7일 · 30일 |
| Video Producer | 프로젝트 단위 |
| CFO | 월 단위 |
| AI 비서 | 회사 계약 |

가격/기간 수치는 모두 **Placeholder**(실값은 결제 Sprint에서 확정).

## 3. 가격 (Pricing) — 원가 기준

- 가격은 **직군이 아니라 원가(cost) 기준**이다.
- Writer = 낮은 원가 / Designer = 중간 / Video = 높은 원가.
- 직원마다 가격이 다를 수 있다(동일 직군 내에서도 전문화에 따라 상이).
- 이번 Sprint는 `costTier` + `pricePlaceholder`만. 실금액·실결제 없음.

## 4. 전문 직원 (Specialization) — 직군 ↔ 직원 분리

직군(RoleFamily)과 직원(SpecializedEmployee)을 분리한다.

- **Designer**: SNS Designer · Package Designer · Landing Designer · Print Designer · Luxury Designer
- **Writer**: SNS Writer · Detail Page Writer · Blog Writer · Brand Copy Writer

각 전문 직원은 다음을 가진다:
- 잘하는 업무(goodAt)
- 지원하지 않는 업무(notSupported)
- 추천 업종(recommendedIndustries)
- 전문 분야(specialty)

## 5. HQ 권한 (HQ Judgment)

- HQ는 직원×업무의 적합성을 **가능(supported) / 비추천(not_recommended) / 지원 안 함(unsupported)** 으로 관리한다.
- **고객은 아무 직원에게 아무 업무를 시킬 수 없다.** HQ가 업무 적합성을 판단한다.
- 비추천은 막지 않되 경고, 지원 안 함은 해당 직원으로 수행 불가(다른 전문 직원/직군 안내).

## 6. 업데이트 (Versioning) — *이번 Sprint 미구현, 헌법 명시*

- 기존 고객은 **자동 업데이트하지 않는다.** 계약한 직원 버전을 유지(version pin).
- 업데이트는 변경점 / 비교 / 선택 업데이트 / 롤백을 지원한다.
- 구조 토대(버전 필드 `version`)만 이번에 둔다. 비교/롤백 플로우는 후속 Sprint.

## 7. 수익 원칙 (Revenue) — *이번 Sprint 미구현, 헌법 명시*

- 기본 업데이트는 무료.
- 새로운 전문 직원은 신규 계약 대상.
- 직원 교육은 HQ가 ROI를 계산하여 결정한다(기존 Skill 라이프사이클 ROI 게이트 재사용).

---

## 8. 이번 Sprint 구현 범위 (구조만, 실결제 없음)

추가하는 것:
- **계약 모델** — 계약 상태 + 연장/종료 선택지 구조
- **가격 Placeholder** — `costTier` + `pricePlaceholder`
- **계약 기간 Placeholder** — 직원별 `contractOptions`
- **직원 전문화 구조** — `SpecializedEmployee`(직군↔직원 분리) + HQ 카탈로그
- **HQ 판단 구조** — `judgeSuitability(직원, 업무) → 가능/비추천/지원안함`

유지/금지:
- 기존 Business Logic(업무 등록·자료·결과물·자료 Vault)은 그대로 유지.
- 실결제·실DB·외부 AI·이미지/영상 실제 생성 없음.
- 기존 81 테스트 green 유지.

## 구현 위치 (CTO)

- 타입: `packages/shared-types/src/employee-contract-types.ts`
- HQ 카탈로그(순수·테스트 가능): `packages/hq-catalog/src/hq-catalog.ts`
  - `HQ_EMPLOYEES`(전문 직원 레지스트리), `listSpecialized`, `getSpecialized`,
    `judgeSuitability`, `recommendForOutput`, `contractOptionsFor`
- Alpha 노출: `dashboard().hqEmployees`(전문 직원 카탈로그·계약 옵션·가격 placeholder),
  `taskView().suitability`(업무별 HQ 판단), 직원/채용 탭 렌더 연결.
- ADR: `docs/adr/0013-employee-contract-and-pricing.md`.

## 완료 보고 항목

변경 구조 · 직원 계약 모델 · 전문 직원 구조 · HQ 판단 구조 · 테스트 결과 · Git 커밋.
