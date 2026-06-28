# ADR 0010 — 무료/유료 경계: Company Proposal ↔ Company Creation 분리

- 상태: Accepted
- 출처: ATLAS BUSINESS MEMO #008 (CEO ↔ CEO Advisor)
- 일자: 2026-06-27
- 선행: [ADR 0009](0009-onboarding-and-customer-journey.md)
- 헌법: [BUSINESS_CONSTITUTION](../constitution/BUSINESS_CONSTITUTION.md) (Business First)

## 배경
Atlas의 과금 철학이 확정됐다: **무료 = 진단과 추천 / 유료 = 실행과 회사 운영**.
기존 2A의 `created` 상태가 "실제 회사 생성"처럼 느껴져 무료/유료 경계가 모호했다.

## 결정
1. **무료는 `proposal_ready`(Company Proposal Ready)까지.** 실제 Company는 생성하지 않는다.
   - 무료 산출물: 진단 · 핵심 병목 · 부서/직원/Skill 추천 · **예상 절약 시간/기대 효과** · **회사 설계안 Preview**.
   - 무료에서는 결과물·대표 비서·직원 업무·운영 가능한 Company가 **없다**.
2. **실제 Company Creation은 결제 이후로 이동.**
   - `createCompanyFromDraft`는 **PaymentConfirmation**을 요구(없으면 `PaymentRequiredError`).
3. **상태 흐름 분리**:
   - 무료: `account_created → voucher_activated → diagnosing → designing → recommending → reviewing → proposal_ready`
   - 유료: `payment_required → company_activation → company_created → assistant_on_duty → first_employee_ready`
4. **대표 비서(Owner's Assistant)는 회사 설립(유료) 후 출근.** 무료엔 없음. → [Owner Assistant Spec](../specs/owner-assistant-spec.md)
5. **직원 추천 = 업셀링 = 핵심 수익 모델.** 필요한 직원이 없으면 결과물을 만들지 않고 **채용을 추천**. → [Upsell Spec](../specs/employee-recommendation-upsell-spec.md)
6. **문구 원칙**: 무료에서 "회사 생성 완료" 류 표현 금지. 무료 CTA(설계안 보기/직원 확인/설립 준비) ↔ 유료 CTA(회사 설립하기/비서 출근/직원 채용/계속 운영).

## 근거
- Business First: 가치(실행·운영)에 과금, 무료는 강력한 *진단·설계 미리보기*로 전환을 유도.
- 업셀링(부족 직원 채용 추천)은 자연스러운 수익 구조이자 차별점.

## 범위 (이번)
구조/문서/상태/문구/테스트만. **Sprint 2B(운영 루프·실제 업무 실행·Output) 미구현.**
유료 경로는 결제 게이트 + Company 인스턴스화·대표 비서 출근·첫 직원 준비까지 *구조*로 제공하되,
직원 실제 업무 실행/결과물 생성은 2B.

## 결과
- 무료/유료 경계 문서([free-paid-boundary](../business/free-paid-boundary.md)), Customer Journey·Company Creation Flow·UX 조정.
- `payment` 게이트, `CompanyProposal`/`OwnerAssistant`/`PaymentConfirmation` 타입, 업셀링 helper.
