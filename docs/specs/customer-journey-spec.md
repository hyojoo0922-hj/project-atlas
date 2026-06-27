# Customer Journey Specification

> 근거: [헌법 개정 #004](../constitution/AMENDMENT-004-ai-cofounder-onboarding.md) · [Onboarding Architecture](../architecture/07-onboarding-architecture.md)
> Customer Journey는 **독립 설계 대상**이며 Project Atlas의 **핵심 경험**이다.

## 1. 정의
고객이 Atlas를 "AI 공동창업자"로 처음 경험하는 여정. 회원가입부터 회사 생성 완료까지의
**상태머신**으로 관리한다. 고객은 *설계하지 않고*, 답하고·보고·승인한다.

## 2. 여정 단계 (상태)
CPO UX Sprint #001 IA 반영 — "대표 계정 생성 → 무료 사업진단권 → 진단 → 설계안 → 회사 설립 승인 → 생성 → 첫 업무":
```
account_created → voucher_activated → diagnosing → designing → recommending
   → reviewing → approving → created → first_task
                    └─(반려)→ revising
```
| 단계 | 고객이 하는 것 | 시스템이 하는 것 | 산출 |
|---|---|---|---|
| **account_created** | 대표 계정 생성(회원가입 X) | 계정 + 무료 사업진단권(1회) 부여 | OwnerAccount |
| **voucher_activated** | 진단권 활성화 | 곧장 진단 흐름 진입(빈 대시보드 금지) | DiagnosisVoucher(active) |
| **diagnosing** | 컨설팅 응답 | 진단권 소진 + [AI 사업 진단](ai-business-diagnosis-spec.md) | Diagnosis |
| **designing / recommending** | 대기 | 진단 기반 설계 + 부서·직원·Skill 추천 | DesignDraft / [OrgRecommendation](org-recommendation-spec.md) |
| **reviewing** | 설계안 검토 | 설계안 요약 제시(내부지표 숨김) | — |
| **approving** | **회사 설립 승인** (CTA "이 설계안으로 내 회사 만들기") | [Approval Workflow](approval-workflow-spec.md) 창업 승인 | ApprovalRequest(approved) |
| **created** | 회사 입장 | [Company Auto Creation](company-creation-flow-spec.md) | Company(+CEO/Dept/Employee) |
| **first_task** | (CTA "첫 업무 맡기기") | 첫 업무 추천 제시 | FirstTaskSuggestion |
| **revising** | 수정 요청 | 설계 재생성 | 새 DesignDraft |

> **고객 화면 3요소(항상 노출)**: 현재 단계 · 공동창업자의 판단(점수 아닌 우선순위) · 대표의 다음 행동(CTA).
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
