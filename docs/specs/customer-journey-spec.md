# Customer Journey Specification

> 근거: [헌법 개정 #004](../constitution/AMENDMENT-004-ai-cofounder-onboarding.md) · [Onboarding Architecture](../architecture/07-onboarding-architecture.md)
> Customer Journey는 **독립 설계 대상**이며 Project Atlas의 **핵심 경험**이다.

## 1. 정의
고객이 Atlas를 "AI 공동창업자"로 처음 경험하는 여정. 회원가입부터 회사 생성 완료까지의
**상태머신**으로 관리한다. 고객은 *설계하지 않고*, 답하고·보고·승인한다.

## 2. 여정 단계 (상태)
CPO UX #001 + BUSINESS MEMO #008(무료/유료 경계) 반영:
```
무료(진단·추천):  account_created → voucher_activated → diagnosing → designing
                    → recommending → reviewing → proposal_ready   └─(반려)→ revising
유료(실행·운영):  payment_required → company_activation → company_created
                    → assistant_on_duty → first_employee_ready
```
| 영역 | 단계 | 고객이 하는 것 | 시스템 | 산출 |
|---|---|---|---|---|
| 무료 | **account_created** | 대표 계정 생성(회원가입 X) | 계정 + 무료 사업진단권(1회) | OwnerAccount |
| 무료 | **voucher_activated** | 진단권 활성화 | 곧장 진단 진입(빈 대시보드 금지) | Voucher(active) |
| 무료 | **diagnosing** | 컨설팅 응답 | 진단권 소진 + [AI 사업 진단](ai-business-diagnosis-spec.md) | Diagnosis |
| 무료 | **designing/recommending** | 대기 | 설계 + 부서·직원·Skill 추천 | [OrgRecommendation](org-recommendation-spec.md) |
| 무료 | **reviewing** | 설계안 검토 | 설계안 요약(내부지표 숨김) | DesignDraft |
| 무료 | **proposal_ready** ⛳ | 설계안 Preview 확인 | 기대효과 + Preview (실제 생성 X) | **CompanyProposal** |
| ─ | **revising** | 수정 요청 | 설계 재생성 | 새 DesignDraft |
| 유료 | **payment_required** | **결제** (CTA "이 설계안으로 회사 설립하기") | 결제 게이트 | PaymentConfirmation |
| 유료 | **company_activation** | — | 창업 승인 | ApprovalRequest |
| 유료 | **company_created** | — | [Company Creation](company-creation-flow-spec.md) | Company(+CEO/Dept/Employee) |
| 유료 | **assistant_on_duty** | (CTA "대표 비서 출근시키기") | [대표 비서](owner-assistant-spec.md) 출근 | OwnerAssistant |
| 유료 | **first_employee_ready** | (CTA "첫 AI 직원 채용/계속 운영") | 첫 직원 준비 | — |

> **무료 경계 = `proposal_ready`** (실제 Company 생성·대표 비서·결과물 없음). 자세히: [free-paid-boundary](../business/free-paid-boundary.md).
> **고객 3요소(항상)**: 현재 단계 · 공동창업자의 판단(점수 아님) · 대표의 다음 행동(CTA).
> 숨기는 내부 요소: Skill Lifecycle · Matching Score · Certification · Model · Token · CostLedger.

## 3. 데이터 (개념)
```yaml
customerJourney:
  id: cj_01
  customerId: cus_01
  state: reviewing
  responses: { industry: 카페, stage: 초기성장, employees: 3, online: true, brand: false,
               timeSink: "재고/발주", problem: "신규 고객 유입", grow: "온라인 매출" }
  diagnosisId: dg_01
  designDraftId: cd_01
  approvals: [apr_01]
```

## 4. 원칙
- **단순함은 고객에게**: 진단 규칙·추천 가중·라이프사이클은 비노출. 고객은 컨설팅 대화·요약·승인만.
- **AI가 설계, 대표는 승인**: 고객이 빈 화면에서 조직을 짜지 않는다.
- **모든 고객이 다르게 시작**: 동일 온보딩이라도 진단·업종·단계에 따라 결과가 달라진다.
- 모든 단계 전이는 AuditEvent.

## 5. 불변식
1. `created` 이전에는 실제 Company 객체가 만들어지지 않는다(진단·설계는 draft).
2. `created`는 반드시 `approving`(대표 승인)을 거친다.
3. 여정은 언제든 `revising`으로 되돌아갈 수 있다(승인 전).

## 관련
- [AI Business Diagnosis](ai-business-diagnosis-spec.md) · [Org Recommendation](org-recommendation-spec.md) · [Company Creation Flow](company-creation-flow-spec.md)
- 화면/흐름: [../product/ux-screen-structure.md](../product/ux-screen-structure.md)
