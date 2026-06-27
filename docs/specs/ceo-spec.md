# CEO Specification

> 근거: [헌법 개정 #003](../constitution/AMENDMENT-003-ceo-and-living-organization.md) · [ADR 0008](../adr/0008-ceo-object-and-approval-workflow.md)
> **CEO는 사용자(User)가 아니라 회사의 핵심 객체**다. 계층: Company → **CEO** → Department → Employee → Skill.

## 1. CEO란
회사를 이끄는 의사결정 주체. 조직 운영의 **지배 변수(governing variable)**다.
같은 직원·Skill이라도 CEO에 따라 자율도·가드레일·우선순위가 달라진다.

## 2. 구성요소 (최소)
| 구성요소 | 설명 |
|---|---|
| **CEO DNA** | 정체성·리더십 아키타입(불변 코어 + 발현) |
| **의사결정 스타일** | 위임 수준·결정 속도·데이터 vs 직관 |
| **승인 정책** | 어떤 액션을 직접 승인/위임할지 → [Approval Workflow](approval-workflow-spec.md) |
| **리스크 성향** | low / medium / high — 가드레일 강도에 반영 |
| **브랜드 우선순위** | 어떤 브랜드/가치를 우선할지(자원·추천 가중) |
| **성장 전략** | 어느 단계로 어떻게 키울지 → [Company Lifecycle](company-lifecycle-spec.md) |
| **목표 (Goal)** | CEO 수준 북극성 |
| **KPI** | CEO가 추적하는 지표 |
| **권한 (Authority)** | 승인 가능 범위·예산 한도·재편 권한 |

## 3. 데이터 형태 (개념)
```yaml
ceo:
  id: ceo_01
  companyId: com_01
  dna: { genome: {archetype: visionary}, phenotype: {...}, acquired: {...}, lineage: [...] }
  decisionStyle: { delegation: high, speed: fast, basis: data }
  riskAppetite: medium
  brandPriority: [brand_premium, brand_value]
  growthStrategy: { targetStage: 확장, focus: [marketing, ops] }
  goal: { northStar: "...", horizon: "Y1" }
  kpi: [{ metric, target, current }]
  authority: { budgetLimit: 10000, canReorg: true, approves: [deploy, highRisk] }
  approvalPolicyRef: awf_01     # Approval Workflow 참조
```

## 4. CEO 거버넌스 — 직원 작동에 미치는 영향
직원 실행 시 다음이 합성된다:
```
Employee 실행 = Employee DNA  ×  CEO 거버넌스
   · riskAppetite      → 가드레일 강도(보수/공격)
   · decisionStyle     → 직원 자율도(승인 게이트 빈도)
   · brandPriority     → Matching/추천 가중·산출물 우선순위
```
→ **같은 직원도 CEO에 따라 다른 방식으로 일한다.**

## 5. 캐스케이드 위치
```
CEO 성장전략/Goal ──▶ Company Goal ──▶ Company KPI ──▶ Department KPI ──▶ Employee 성과
CEO 승인정책      ──▶ Approval Workflow (액션 라우팅)
```

## 6. 불변식
1. CEO는 정확히 하나의 Company에 속한다(조직 트리 `ceo` 노드).
2. CEO DNA.genome(리더십 아키타입)은 생성 후 불변. 변경은 새 CEO.
3. 권한(authority)을 초과하는 액션은 상위 승인(또는 CEO 본인 승인)을 요구 → Approval Workflow.
4. 모든 거버넌스 변경은 lineage append + AuditEvent.

## 관련
- [Company DNA Spec](company-dna-spec.md) · [Approval Workflow Spec](approval-workflow-spec.md)
- [Company Lifecycle](company-lifecycle-spec.md) · [Department Spec](department-spec.md)
