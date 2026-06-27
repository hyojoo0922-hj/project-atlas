# Department Specification

> 근거: [헌법 개정 #002](../constitution/AMENDMENT-002-company-centric-organization.md)
> **Department는 독립 객체이며 성장한다.** Company에 속하고 Employee를 거느린다.

## 1. Department란
회사의 기능 단위(예: 콘텐츠팀, CS팀, 리서치팀). 담당 업무(mandate)와 KPI를 갖고,
필요한 Skill을 확보하며, 소속 직원의 성과로 성장한다.

## 2. 구성요소 (최소)
| 구성요소 | 설명 |
|---|---|
| **Department DNA** | 기능 아키타입·운영 원칙(불변 코어 + 발현) |
| **담당 업무 (Mandate)** | 부서가 책임지는 일의 범위 |
| **KPI[]** | 부서 목표 지표(Company KPI에서 캐스케이드) |
| **담당 Employee[]** | 소속 직원 |
| **필수 Skill[]** | 부서가 보유해야 할 Skill 집합 |
| **현재 Skill 수준** | 필수 Skill 대비 현재 커버리지(0~1) |
| **Department Health** | 부서 건강(0~100) → [Department Health Spec](department-health-spec.md) |
| **Department Performance** | 소속 직원 성과 롤업 |

## 3. 데이터 형태 (개념)
```yaml
department:
  id: dep_01
  companyId: com_01
  name: "콘텐츠팀"
  dna: { genome: {function: content}, phenotype: {...}, acquired: {...}, lineage: [...] }
  mandate: "브랜드 보이스 콘텐츠 생산"
  kpi: [{ metric: "월 산출물", target: 40, current: 0 }]
  employees: [emp_01, ...]
  requiredSkills: [skl_voice_writer, skl_repurpose]   # 필수 Skill
  skillLevel: { skl_voice_writer: 1.0, skl_repurpose: 0.0 }  # 현재 수준(커버리지)
  health: 0..100        # 파생
  performance: { avgRating: 0, roiTotal: 0 }  # 롤업
```

## 4. Skill Gap → 운영 트리거
`필수 Skill` 대비 `현재 Skill 수준`의 격차(gap)가 핵심 신호다.
- gap이 크면 → [Research Lab](ai-research-lab-spec.md)/[University](ai-university-spec.md)에 교육·발굴 우선순위 발생.
- 부서가 필수 Skill을 인증 직원으로 채우면 skillLevel↑ → Department Health↑.

## 5. Department 성장
- **역량 상승**: 직원 인증·성과로 skillLevel·performance 상승.
- **충원**: 직원 채용/배치로 capacity 확대.
- **승진 경로**: 우수 직원이 부서 내 상위 rank로([Employee DNA](employee-dna-spec.md) §승진).
- **재편**: 부서 분리/통합/신설([Company Lifecycle](company-lifecycle-spec.md)).

## 6. 불변식
1. Department는 정확히 하나의 Company에 속한다.
2. Department Health/Performance는 파생값(롤업) — 직접 수정 불가.
3. 필수 Skill 미충족(미인증) 시 해당 업무는 수행 불가(인증 게이트, [Certification](certification-system-spec.md)).

## 관련
- 상위: [Company DNA Spec](company-dna-spec.md) · 트리: [Organization Tree Spec](organization-tree-spec.md)
- 건강: [Department Health Spec](department-health-spec.md) · 직원: [Employee DNA Spec](employee-dna-spec.md)
