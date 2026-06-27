# Company Lifecycle

> 근거: 개정 [#002](../constitution/AMENDMENT-002-company-centric-organization.md)·[#003](../constitution/AMENDMENT-003-ceo-and-living-organization.md) · [Organization Architecture](../architecture/01-organization-architecture.md)
> Company는 두 축의 생애를 가진다: **(A) 운영 단계**(무엇을 하는가) · **(B) 성장 단계**(얼마나 컸는가).

## 1. (A) 운영 단계 (Operational Phases)
```
설립(Found) → 조직 구성(Organize) → 채용·배치(Staff) → 운영(Operate)
        → 성장(Grow) → 재편(Reorg) ↺  → (보관/종료 Archive)
```

| 단계 | 무엇을 하는가 | 산출/게이트 |
|---|---|---|
| **설립 Found** | **온보딩(AI 컨설팅→진단→자동 설계→대표 승인)**으로 Company·CEO 생성 | Company + CEO 생성 → [Onboarding](../architecture/07-onboarding-architecture.md) |
| **조직 구성 Organize** | **AI 조직 추천**(진단 기반) → Department 정의, 필수 Skill·KPI | Organization 트리 + 부서 KPI |
| **채용·배치 Staff** | 직원 채용 → 부서 배치, 교육·인증·배포 | 부서별 Skill 수준 확보 |
| **운영 Operate** | 업무 수행, Usage/Cost/ROI·성과 측정 | CostLedger·Performance |
| **성장 Grow** | Employee 승진·Upgrade, 부서 역량 상승, **단계 전이** | Health↑ |
| **재편 Reorg** | 부서 신설/통합/분리, KPI 재정렬, **재추천 반영** | lineage append + Audit |
| **보관 Archive** | 운영 종료(기억은 보존) | Brand Memory 잔존 |

## 1b. (B) 성장 단계 (Growth Stages) — 개정 #003
```
창업 → 초기 성장 → 안정화 → 확장 → 프랜차이즈
```
성장 단계에 따라 **필요한 부서·직원·Skill이 달라진다**. 이는 [AI Organization Recommendation](org-recommendation-spec.md)의 입력이다.

| 성장 단계 | 조직의 초점 | 필요 변화(예) |
|---|---|---|
| **창업 Founding** | 핵심 운영 1개 부서 | 최소 부서·핵심 Skill |
| **초기 성장 Early** | 수요 창출 | Marketing 부서 추가 |
| **안정화 Stabilize** | 품질·고객유지 | Customer Care 추가, 인증 강화 |
| **확장 Scale** | 다지점·다채널 | Growth/Expansion 부서, 직원 충원 |
| **프랜차이즈 Franchise** | 표준화·복제 | Franchise Ops, SOP Skill |

> 성장 단계는 **확장 가능한 축**이다. 새 단계·업종 템플릿은 데이터로 추가된다(코드 수정 불필요).

## 2. 다른 라이프사이클과의 관계
Company Lifecycle은 하위 라이프사이클을 **포함·조율**한다:
- [Employee 생애](employee-dna-spec.md) (채용→교육→인증→배치→성과→승진/Upgrade)
- [Skill 라이프사이클](skill-lifecycle-spec.md) (발견→…→배포→성과측정)
- Department 성장([Department Spec](department-spec.md))

## 3. 트리거 (무엇이 단계 전이를 일으키나)
- **성장 → 재편**: Department Health/Company Health 신호([Health Spec](company-health-spec.md))가 충원·신설·통합을 유발.
- **운영 → 성장**: 성과·인증 누적이 승진·Upgrade·skillLevel 상승을 유발.
- **성장 단계 전이**(예: 초기 성장→안정화): KPI 달성·규모 신호가 전이를 유발 → **조직 재추천**.
- 모든 전이는 [Approval Workflow](approval-workflow-spec.md)를 통과하며 Audit에 기록.

## 3b. 살아있는 조직 루프 (개정 #003)
```
가입(업종·단계) → [AI 조직 추천] → 부서/직원/Skill 구성
     ▲                                      │
     │ 단계 전이 시 재추천                    ▼
 Growth 단계 ◀── Health 롤업 ◀── Employee 업무·성과 ◀── CEO 거버넌스/Approval
```
Company → CEO → Department → Employee → Skill + Approval·Growth·Health·Recommendation이
하나의 자기강화 루프로 연결된다 — 이것이 "**살아 움직이는 회사**"다.

## 4. 불변식
- 설립 시 Company DNA.genome(미션·아키타입)은 고정.
- 재편은 Organization 트리 불변식(단일 루트·사이클 금지)을 위반할 수 없다.
- 종료(Archive) 후에도 회사의 기억(Brand Memory)은 손실 없이 보존(해자).

## 관련
- [Company DNA Spec](company-dna-spec.md) · [CEO Spec](ceo-spec.md) · [Department Spec](department-spec.md) · [Organization Tree Spec](organization-tree-spec.md)
- [AI Organization Recommendation](org-recommendation-spec.md) · [Approval Workflow Spec](approval-workflow-spec.md)
