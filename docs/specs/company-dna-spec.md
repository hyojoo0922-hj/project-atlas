# Company DNA Specification

> 근거: [헌법 개정 #002](../constitution/AMENDMENT-002-company-centric-organization.md) · [Organization Architecture](../architecture/01-organization-architecture.md)
> **Company**는 Atlas의 최상위 1급 객체다. Brand보다 큰, 회사 그 자체.

## 1. Company란
Customer(과금 계정)가 소유하는 **운영 단위의 회사**. 부서·직원·Skill·기억·문화·목표·건강을 가진다.
Atlas는 이 Company를 *운영*한다.

## 2. 구성요소
| 구성요소 | 설명 |
|---|---|
| **Company DNA** | 미션·아키타입·핵심 가치(불변 코어 + 발현) |
| **Brand Memory** | 회사의 기억(Company 스코프). 모든 부서/직원 공유 |
| **Organization** | 조직 트리([Organization Tree](organization-tree-spec.md)) |
| **Department[]** | 부서들([Department Spec](department-spec.md)) |
| **Company Culture** | 규범·톤·리스크 성향 |
| **CEO Style** | 위임 수준·의사결정 속도·리스크 허용도 |
| **Approval Policy** | 승인 필요 액션·임계 |
| **Company Goal** | 북극성 목표 |
| **Company KPI[]** | 측정 지표(목표/현재) |
| **Company Health Score** | 조직 건강 롤업(0~100) → [Company Health Spec](company-health-spec.md) |

## 3. Company DNA 레이어 (Employee DNA와 동형)
| 레이어 | 가변성 | 내용 |
|---|---|---|
| **Genome (코어)** | 불변 | 미션, 산업 아키타입 |
| **Phenotype (발현)** | 설정 | 현재 포지셔닝·locale·브랜드 표현 |
| **Acquired (획득)** | 가변 | 누적 역량·운영 노하우 |
| **Lineage (계보)** | append-only | 재편·성장 이력 |

## 4. 거버넌스 객체 (운영 방식)
```yaml
company:
  dna: { genome: {mission, archetype}, phenotype: {positioning, locale}, acquired: {...}, lineage: [...] }
  culture:        { norms: [...], tone: "...", riskAppetite: low|medium|high }
  ceoStyle:       { delegation: low|medium|high, decisionSpeed: ..., riskTolerance: ... }
  approvalPolicy: { requiresApproval: [deploy, budgetOver, highRisk], thresholds: {...} }
  goal:           { northStar: "...", horizon: "Q?" }
  kpi:            [{ metric, target, current }]
  healthScore:    0..100   # 롤업(파생)
```
- **CEO Style → 직원 자율도**: delegation이 높을수록 Approval 게이트가 느슨.
- **Approval Policy → Orchestrator 게이트**: 배포·예산초과·고위험 작업의 승인 요구를 강제.
- **Culture → 가드레일/톤**: 직원 산출물·Skill 가드레일에 반영.

## 5. 불변식
1. Genome(미션·아키타입)은 생성 후 변경 불가. 변경은 새 Company.
2. Brand Memory·Department는 항상 하나의 Company에 속한다(테넌트 격리 키).
3. Company Health Score는 파생값 — 직접 수정 불가, 롤업으로만 갱신.
4. 모든 거버넌스/재편 변경은 lineage append + AuditEvent.

## 관련
- 부서: [Department Spec](department-spec.md) · 조직트리: [Organization Tree Spec](organization-tree-spec.md)
- 건강: [Company Health Spec](company-health-spec.md) · 생애: [Company Lifecycle](company-lifecycle-spec.md)
- 데이터 모델: [../architecture/02-data-model.md](../architecture/02-data-model.md)
