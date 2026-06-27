# Approval Workflow Specification

> 근거: [헌법 개정 #003](../constitution/AMENDMENT-003-ceo-and-living-organization.md) §3 · [ADR 0008](../adr/0008-ceo-object-and-approval-workflow.md)
> 승인은 Company 속성이 아니라 **독립적이고 확장 가능한 구조**다.

## 1. 목적
"어떤 액션이, 누구의, 어떤 방식의 승인을 거쳐야 하는가"를 규칙으로 분리한다.
결정 유형을 코드 수정 없이 **규칙 추가**로 확장할 수 있어야 한다.

## 2. 결정 유형 (확장 가능)
| 유형 | 설명 |
|---|---|
| **자동 승인 (auto)** | 규칙 충족 시 즉시 통과 (저위험·예산 내) |
| **CEO 승인 (ceo)** | [CEO](ceo-spec.md) 권한 범위의 결정 |
| **부서장 승인 (dept_head)** | 부서 단위 결정(Department lead) |
| **조건부 승인 (conditional)** | 조건(예산·리스크·시간) 충족 시 자동, 아니면 상위로 에스컬레이션 |
| *(확장)* | 다중 승인·정족수·외부 검토 등 규칙 추가로 수용 |

## 3. 구조 (개념)
```yaml
approvalWorkflow:            # 회사/CEO가 참조
  id: awf_01
  rules:                     # 위에서부터 매칭(우선순위)
    - when: { action: deploy, riskAtMost: low, budgetWithin: true }
      decision: auto
    - when: { action: budgetOver }
      decision: ceo
    - when: { action: deploy, riskAtMost: medium }
      decision: dept_head
    - when: { action: highRisk }
      decision: conditional
      condition: { ceoRiskAppetite: high }   # 충족 시 auto, 아니면 ceo로 에스컬레이션
    - default: ceo
```
```yaml
approvalRequest:            # 런타임 인스턴스
  id: apr_01
  action: deploy
  context: { employeeId, skillVersionId, estCost, risk }
  resolvedDecision: dept_head     # 워크플로 평가 결과
  status: pending | approved | rejected | escalated
  approver: <ceo_id | dept_head_employee_id | system>
```

## 4. 평가 절차
```
액션 발생 → ApprovalWorkflow 규칙 평가 → 결정 유형 산출
  · auto        → 즉시 통과(Audit 기록)
  · ceo/dept    → ApprovalRequest 생성(pending) → 승인자 처리
  · conditional → 조건 평가 → 통과/에스컬레이션
```
- **Orchestrator 게이트**와 연결: 배포·예산초과·고위험 작업은 워크플로를 통과해야 실행.
- CEO의 `authority`/`riskAppetite`/`decisionStyle`이 규칙 평가에 입력된다([CEO Spec](ceo-spec.md)).

## 5. 불변식
1. 모든 통제 대상 액션은 정확히 하나의 결정 유형으로 해소된다(default 보장).
2. 모든 결정/에스컬레이션은 AuditEvent.
3. 권한(authority) 초과 승인은 불가 — 자동으로 상위 에스컬레이션.

## 관련
- [CEO Spec](ceo-spec.md) · [Company DNA Spec](company-dna-spec.md) · [Operator HQ Spec](operator-hq-spec.md)
- 보안 게이트: [../architecture/06-security.md](../architecture/06-security.md)
