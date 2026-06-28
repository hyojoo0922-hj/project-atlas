# Company Creation Flow Specification

> 근거: [헌법 개정 #004](../constitution/AMENDMENT-004-ai-cofounder-onboarding.md) §4·§5 · [Onboarding Architecture](../architecture/07-onboarding-architecture.md)
> **AI가 회사를 설계하고, 대표는 최종 승인만** 한다. 고객은 직접 조직을 짜지 않는다.
> ⚠️ **BUSINESS MEMO #008**: 무료는 **Company Proposal(설계안 Preview)까지**. 실제 **Company Creation은 결제 이후**.

## 0. 무료/유료 경계 (Proposal ↔ Creation)
| | 무료 | 유료 |
|---|---|---|
| 함수 | `buildCompanyProposal(draft, rec)` | `createCompanyFromDraft(customerId, draft, payment)` |
| 산출 | `CompanyProposal`(Preview + 기대효과) | 실제 Company/CEO/Dept/Employee + 트리 |
| 게이트 | 없음 | **PaymentConfirmation.confirmed** 필수 → 없으면 `PaymentRequiredError` |
| 종착 | `proposal_ready` | `company_created → assistant_on_duty → first_employee_ready` |

→ [free-paid-boundary](../business/free-paid-boundary.md)

## 1. 목적
진단 결과를 바탕으로 회사를 **자동 설계(draft→proposal)** 하고, **결제·승인 후** 실제 객체로 **인스턴스화**한다.

## 2. 흐름
```
Diagnosis ─▶ CompanyDesignDraft 생성(자동)
              ├─ Company(초안): DNA·문화·Goal·KPI·stage
              ├─ CEO(초안): 의사결정 스타일·리스크·브랜드 우선순위·성장 전략
              ├─ 추천 Department[] (우선순위)
              ├─ 부서별 추천 Employee[]
              └─ 직원별 추천 Skill[]
        ─▶ 대표 검토(reviewing) ─▶ 대표 승인(Approval Workflow) ─▶ 인스턴스화(created)
                                   └─ 반려 → 재설계(revising)
```

## 3. CompanyDesignDraft (개념)
```yaml
companyDesignDraft:
  id: cd_01
  customerId: cus_01
  diagnosisId: dg_01
  company: { name, dna, culture, goal, kpi, stage }
  ceo:     { decisionStyle, riskAppetite, brandPriority, growthStrategy, authority }
  departments:                       # 우선순위 순
    - { name: Operations, priority: 1, requiredSkills: [...], seedEmployees: [...] }
    - { name: Marketing,  priority: 2, requiredSkills: [...], seedEmployees: [...] }
  rationale: ["운영 우선 진단에 따라 Operations를 1순위로 배치"]
  status: draft | approved | rejected
```

## 4. 인스턴스화 (Auto Creation)
승인된 draft를 실제 객체로 생성:
```
Company 생성 → CEO 생성 → Organization 트리(company/ceo/department/employee) 구성
   → Department 생성(KPI·필수Skill) → Employee 채용·부서 배치
   → 추천 Skill 배정(이후 교육·인증은 운영 단계에서)
   → Company.stage = 진단 권장 단계, Health 초기 롤업
```
- 생성은 [Organization Tree](organization-tree-spec.md) 불변식을 지킨다.
- 직원의 실제 Skill 인증·배포는 생성 이후 운영(살아있는 루프)에서 진행.

## 5. 승인 + 결제 (대표는 승인만)
- 대표 승인은 [Approval Workflow](approval-workflow-spec.md)의 **창업 승인(founding)** 유형 — 유료 경로(`company_activation`)에서 처리.
- 실제 생성은 **결제(PaymentConfirmation) + 승인** 둘 다 필요(메모 #008).
- 대표는 draft를 통째로 승인/반려하거나 부분 수정 요청(→ revising) 가능. *직접 설계하지 않음.*

## 6. 불변식
1. 승인 전에는 실제 Company/CEO/Department/Employee 객체가 생성되지 않는다(draft만).
2. 인스턴스화는 반드시 승인된 draft에서만 일어난다.
3. 모든 설계·승인·생성은 AuditEvent + rationale(설명 가능).

## 관련
- [Customer Journey](customer-journey-spec.md) · [AI Business Diagnosis](ai-business-diagnosis-spec.md)
- [Org Recommendation](org-recommendation-spec.md) · [CEO Spec](ceo-spec.md) · [Company Lifecycle](company-lifecycle-spec.md)
