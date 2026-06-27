# 02 — 데이터 모델 (개념 스키마)

> 개념 모델. 계층 = **Company → Department → Employee → Skill** (개정 #002, [ADR 0007](../adr/0007-company-centric-architecture.md)).
> 영속 계층(Postgres+RLS)은 Sprint 2에서 구현. Sprint 1은 인메모리.

## 핵심 엔티티

### Customer / Company (최상위)
| 엔티티 | 핵심 필드 | 비고 |
|---|---|---|
| `Customer` | id, name, plan(Hosted/BYOK/Credit), status | 과금 주체 |
| `Company` | id, customer_id, name, status, **dna, culture, goal, kpi[], stage, healthScore, ceo_id** | **최상위 운영 객체** → [Company DNA](../specs/company-dna-spec.md) |

### CEO (핵심 객체 — 개정 #003)
| 엔티티 | 핵심 필드 | 비고 |
|---|---|---|
| `CEO` | id, company_id, dna, decisionStyle, riskAppetite, brandPriority[], growthStrategy, goal, kpi[], authority, approvalWorkflow_id | 직원 작동 지배 → [CEO Spec](../specs/ceo-spec.md) |

### Approval (독립 구조 — 개정 #003)
| 엔티티 | 핵심 필드 | 비고 |
|---|---|---|
| `ApprovalWorkflow` | id, company_id, rules[] (when→decision: auto/ceo/dept_head/conditional) | → [Approval Workflow Spec](../specs/approval-workflow-spec.md) |
| `ApprovalRequest` | id, action, context, resolvedDecision, status, approver | 런타임 승인 인스턴스 |

### Department (독립 객체, 성장)
| 엔티티 | 핵심 필드 | 비고 |
|---|---|---|
| `Department` | id, company_id, name, dna, mandate, kpi[], requiredSkills[], skillLevel{}, health, performance, lead_employee_id | → [Department Spec](../specs/department-spec.md) |
| `OrgNode` | id, company_id, kind(company/**ceo**/department/employee), refId, parentId, children[] | 조직 트리 → [Organization Tree Spec](../specs/organization-tree-spec.md) |
| `OrgRecommendation` | id, industry, stage, departments[], rationale[] | (업종×단계) 조직 추천 → [Org Recommendation Spec](../specs/org-recommendation-spec.md) |

### Brand Memory (해자 — Company 스코프)
| 엔티티 | 핵심 필드 | 비고 |
|---|---|---|
| `BrandMemory` | id, **company_id**, kind, key, value(jsonb), version | kind: voice/product/asset/policy/history/decision |
| `MemoryRevision` | id, memory_id, version, value, author | 손실 없는 버전관리 |

> Brand Memory는 이제 **Company 스코프** — 회사의 모든 부서/직원이 공유. append-friendly + versioned.
> (Sprint 1 코드는 brand_id 기반 → Sprint 2에서 company_id로 마이그레이션, [ADR 0007](../adr/0007-company-centric-architecture.md).)

### Employee (AI 직원 — 중심 객체)
> 직원은 독립 객체다. 7개 구성요소를 가진다. → [Employee DNA Spec](../specs/employee-dna-spec.md)

| 엔티티 | 핵심 필드 | 비고 |
|---|---|---|
| `Employee` | id, **company_id, department_id, rank**, memory_scope, guardrails, budget_id, matching_profile_id | Department 소속(개정 #002) |
| `EmployeeDNA` | employee_id, genome(불변), phenotype, acquired, lineage[] | 4개 레이어(코어/발현/획득/계보) |
| `MatchingProfile` | id, employee_id, role_family, traits, signals(파생) | Matching Engine 입력(DNA+이력 파생) |
| `TrainingRecord` | id, employee_id, skill_version_id, status, score | ④ Training History (AI University) |
| `Certification` | id, employee_id, skill_version_id, status, valid_until, scope | ⑤ 자격(active/expired/revoked) |
| `PerformanceRecord` | id, employee_id, run_id, rating, roi_delivered | ⑥ 성과 이력 |

### Skill (핵심 자산)
| 엔티티 | 핵심 필드 | 비고 |
|---|---|---|
| `Skill` | id, name, category, description, asset_owner | 카탈로그 단위(자산) |
| `SkillVersion` | id, skill_id, version, lifecycle_state, manifest, roi | 라이프사이클+ROI 보유 |
| `SkillAssignment` | id, employee_id, skill_version_id, fit_score, certified, status | **직원별 적합도 배포 기록** |

`lifecycle_state` (10단계, ROI 추가):
`discovered → analyzed → sandboxed → roi_evaluated → recommended → trained → tested → certified → deployed → measured`
→ [Skill Lifecycle Spec](../specs/skill-lifecycle-spec.md) · [SKILL_OS_CONSTITUTION](../constitution/SKILL_OS_CONSTITUTION.md)

### 실행 & 비용
| 엔티티 | 핵심 필드 | 비고 |
|---|---|---|
| `Task` | id, company_id, requested_by, intent, status | 고객/운영자가 맡긴 업무 |
| `Run` | id, task_id, employee_id, skill_version_id, status, started_at | 1회 실행 |
| `CostLedger` | id, run_id, provider, model, tokens_in/out, cost, billing_mode, roi_delivered | 모든 호출 미터링 |
| `Budget` | id, scope(employee/department/company), limit, period, spent | 예산 강제(부서/회사 단위 추가) |
| `AuditEvent` | id, actor, action, target, payload, created_at | 보안·감사 |

## 관계 요약

```
Customer 1─* Company
Company 1─1 CEO ; Company 1─1 ApprovalWorkflow ; ApprovalWorkflow 1─* ApprovalRequest
Company 1─1 CompanyDNA ; Company 1─* BrandMemory 1─* MemoryRevision
Company 1─* Department ; Company 1─* OrgNode(트리: company/ceo/department/employee)
Department 1─* Employee
Employee 1─1 EmployeeDNA ; Employee 1─1 MatchingProfile
Employee 1─* SkillAssignment *─1 SkillVersion *─1 Skill
Employee 1─* TrainingRecord ; Employee 1─* Certification ; Employee 1─* PerformanceRecord
Employee 1─* Run *─1 Task ; Run 1─1 PerformanceRecord ; Run 1─1 CostLedger
Budget 1─* CostLedger(scope: employee/department/company)
```

> **캐스케이드**: CEO 성장전략/Goal → Company Goal → Company KPI → Department KPI → Employee 성과.
> **롤업**: Employee Performance → Department Health/Performance → Company Health Score.
> **거버넌스**: CEO(스타일·리스크·브랜드우선) × Employee DNA → 직원 작동 방식. 액션은 Approval Workflow 게이트.
> **살아있는 루프**: 조직추천(업종×단계) → 구성 → CEO/Approval → 업무·성과 → Health → Growth 단계 전이 → 재추천.

## 설계 노트
- 식별자는 ULID/UUID 가정. 멀티테넌시는 `brand_id`/`customer_id`로 격리 (RLS 후보).
- `value(jsonb)` 같은 반정형 필드는 Postgres 가정. 최종 스토어 결정은 [ADR 0003](../adr/0003-tech-stack.md).
- PII/시크릿(BYOK 키)은 본 테이블에 저장하지 않음 — [`06-security.md`](06-security.md) 참조.
