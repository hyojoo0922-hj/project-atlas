# 무료/유료 경계 (Free / Paid Boundary)

> 근거: [ATLAS BUSINESS MEMO #008](../adr/0010-free-paid-boundary.md) · [BUSINESS_CONSTITUTION](../constitution/BUSINESS_CONSTITUTION.md)
> **핵심 원칙: 무료 = 진단과 추천 / 유료 = 실행과 회사 운영.**
> 이는 단순 UX가 아니라 Project Atlas의 **상용화 구조**다.

## 1. 무료 영역 (진단·추천)
무료 사용자는 여기까지만 경험한다:
- 대표 계정 생성
- 무료 사업진단권 1회 활성화
- 사업 진단 질문(무료 AI 컨설팅)
- AI Business Diagnosis
- 핵심 병목 판단
- 필요한 Department / Employee / Skill 추천
- **예상 절약 시간 / 기대 효과 요약**
- **회사 설계안 Preview** (= `proposal_ready`)

무료 단계에서 **하지 않는 것**:
- ❌ 실제 결과물 제공 · ❌ 대표 비서 출근 · ❌ 직원 실제 업무 수행
- ❌ 운영 가능한 Company 생성

## 2. 유료 영역 (실행·운영)
유료 전환 후에만:
- Company 설립 · CEO 객체 활성화 · 대표 비서 출근
- 직원 채용 · 직원 업무 실행 · 결과물 생성 · 결과 보고
- 파일/문서/이미지/영상 등 Output 생성
- Operator/Employee Work Loop · Credit 사용 · 플랜/구독 운영

## 3. 경계 = Company Proposal ↔ Company Creation
| | 무료 | 유료 |
|---|---|---|
| 산출 | **Company Proposal**(설계안 Preview + 기대효과) | **Company Creation**(실제 객체 생성) |
| 종착 상태 | `proposal_ready` | `first_employee_ready` |
| Company 객체 | 없음(draft/proposal만) | 결제 후 인스턴스화 |
| 대표 비서 | 없음 | 설립 후 출근 |

> 결제 게이트: `createCompanyFromDraft`는 `PaymentConfirmation` 없이는 `PaymentRequiredError`.

## 4. 상태 흐름
```
무료:  account_created → voucher_activated → diagnosing → designing → recommending → reviewing → proposal_ready
유료:  proposal_ready → payment_required → company_activation → company_created → assistant_on_duty → first_employee_ready
```

## 5. 문구 원칙
| 구분 | CTA |
|---|---|
| 무료 | 회사 설계안 보기 · 필요한 직원 확인하기 · 내 회사 설립 준비하기 |
| 유료 전환 | 이 설계안으로 회사 설립하기 · 대표 비서 출근시키기 · 첫 AI 직원 채용하기 · 계속 회사 운영하기 |

❌ 무료 단계에서 "회사 생성 완료"처럼 보이는 문구 금지.

## 6. 업셀링 (핵심 수익 모델)
요청 업무에 필요한 직원이 없으면 **결과물을 만들지 않고 채용을 추천**한다.
→ [Employee Recommendation / Upsell Spec](../specs/employee-recommendation-upsell-spec.md)

## 관련
- [Customer Journey](../specs/customer-journey-spec.md) · [Company Creation Flow](../specs/company-creation-flow-spec.md)
- [Owner Assistant](../specs/owner-assistant-spec.md) · [Monetization](monetization.md)
