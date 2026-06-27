# Organization Tree Specification

> 근거: [헌법 개정 #002](../constitution/AMENDMENT-002-company-centric-organization.md) · [Organization Architecture](../architecture/01-organization-architecture.md)
> 조직 계층을 **확장 가능한 트리**로 표현한다.

## 1. 목적
Company→Department→Employee 계층을 정규화된 트리로 다뤄, **추가·이동·재편**을
일관되게 처리하고 미래 계층(Team/Role)도 같은 구조로 수용한다.

## 2. 노드 모델
```yaml
orgNode:
  id: node_xx
  companyId: com_01
  kind: company | department | employee   # 확장: team, role ...
  refId: <대상 객체 id>                    # Company/Department/Employee id
  parentId: <상위 node id | null>
  children: [node ids]
```
- 트리 루트 = `kind: company`.
- 부서는 company의 자식, 직원은 department의 자식.
- **확장성**: 새 계층(예: team)을 추가해도 `kind`와 부모-자식 관계만 늘리면 됨.

## 3. 연산 (개념)
| 연산 | 설명 | 제약 |
|---|---|---|
| `addDepartment` | Company 아래 부서 추가 | 부모는 company 노드 |
| `assignEmployee` | 직원을 부서로 배치/이동 | 직원은 항상 1개 부서 소속 |
| `moveDepartment` | 부서 재배치(재편) | 사이클 금지, 동일 company 내 |
| `reorg` | 부서 분리/통합/신설 | lineage append + Audit |
| `traverse` | 루트→리프 순회 | 롤업(Health) 계산에 사용 |

## 4. 불변식
1. 단일 루트(company). 사이클 없음(트리).
2. 모든 노드는 동일 `companyId`(테넌트 격리).
3. Employee 노드는 리프이며 정확히 하나의 Department 부모를 가진다.
4. 모든 구조 변경은 Audit + 관련 객체 lineage에 기록.

## 5. 롤업 경로
트리 순회로 Health/Performance를 상향 집계:
```
employee(리프) → department → company
```
→ [Company Health Spec](company-health-spec.md), [Department Health Spec](department-health-spec.md).

## 관련
- [Company DNA Spec](company-dna-spec.md) · [Department Spec](department-spec.md) · [Company Lifecycle](company-lifecycle-spec.md)
