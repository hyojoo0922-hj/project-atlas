# 02 — 데이터 모델 (개념 스키마)

> 개념 모델. 이번 Sprint에 DB/마이그레이션을 만들지 않는다. Sprint 1에서 영속 계층을 구현한다.

## 핵심 엔티티

### Customer / Brand
| 엔티티 | 핵심 필드 | 비고 |
|---|---|---|
| `Customer` | id, name, plan(Hosted/BYOK/Credit), status | 결제 주체 (구현은 후속) |
| `Brand` | id, customer_id, name, locale | 하나의 고객이 다수 브랜드 보유 가능 |

### Brand Memory (해자)
| 엔티티 | 핵심 필드 | 비고 |
|---|---|---|
| `BrandMemory` | id, brand_id, kind, key, value(jsonb), version, source | kind: voice / product / asset / policy / history / decision |
| `MemoryRevision` | id, memory_id, version, diff, author, created_at | 손실 없는 버전관리 |

> Brand Memory는 **append-friendly + versioned**. 직원이 바뀌어도 회사의 기억은 남는다.

### Employee (AI 직원 — 중심 객체)
> 직원은 독립 객체다. 7개 구성요소를 가진다. → [Employee DNA Spec](../specs/employee-dna-spec.md)

| 엔티티 | 핵심 필드 | 비고 |
|---|---|---|
| `Employee` | id, brand_id, memory_scope, guardrails, budget_id, matching_profile_id | 집계 루트 |
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
| `Task` | id, brand_id, requested_by, intent, status | 고객/운영자가 맡긴 업무 |
| `Run` | id, task_id, employee_id, skill_version_id, status, started_at | 1회 실행 |
| `CostLedger` | id, run_id, provider, model, tokens_in/out, cost, billing_mode | 모든 호출 미터링 |
| `Budget` | id, scope(employee/brand/customer), limit, period, spent | 예산 강제 |
| `AuditEvent` | id, actor, action, target, payload, created_at | 보안·감사 |

## 관계 요약

```
Customer 1─* Brand 1─* BrandMemory 1─* MemoryRevision
Brand 1─* Employee
Employee 1─1 EmployeeDNA ; Employee 1─1 MatchingProfile
Employee 1─* SkillAssignment *─1 SkillVersion *─1 Skill
Employee 1─* TrainingRecord ; Employee 1─* Certification ; Employee 1─* PerformanceRecord
Employee 1─* Run *─1 Task ; Run 1─1 PerformanceRecord
Run 1─1 CostLedger ; Budget 1─* CostLedger(scope)
```

> 성장 루프: PerformanceRecord/Certification → MatchingProfile 갱신 → 새 SkillAssignment 추천 → Employee Upgrade(DNA.acquired+lineage).

## 설계 노트
- 식별자는 ULID/UUID 가정. 멀티테넌시는 `brand_id`/`customer_id`로 격리 (RLS 후보).
- `value(jsonb)` 같은 반정형 필드는 Postgres 가정. 최종 스토어 결정은 [ADR 0003](../adr/0003-tech-stack.md).
- PII/시크릿(BYOK 키)은 본 테이블에 저장하지 않음 — [`06-security.md`](06-security.md) 참조.
