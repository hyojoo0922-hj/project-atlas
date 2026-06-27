# Company Lifecycle

> 근거: [헌법 개정 #002](../constitution/AMENDMENT-002-company-centric-organization.md) · [Organization Architecture](../architecture/01-organization-architecture.md)
> Company(회사)도 생애를 가진다 — 설립부터 성장·재편까지.

## 1. 단계
```
설립(Found) → 조직 구성(Organize) → 채용·배치(Staff) → 운영(Operate)
        → 성장(Grow) → 재편(Reorg) ↺  → (보관/종료 Archive)
```

| 단계 | 무엇을 하는가 | 산출/게이트 |
|---|---|---|
| **설립 Found** | Company DNA·Culture·CEO Style·Approval Policy·Goal 설정 | Company 생성 |
| **조직 구성 Organize** | Department 정의, 필수 Skill·KPI 설정 | Organization 트리 + 부서 KPI |
| **채용·배치 Staff** | 직원 채용 → 부서 배치, 교육·인증·배포 | 부서별 Skill 수준 확보 |
| **운영 Operate** | 업무 수행, Usage/Cost/ROI·성과 측정 | CostLedger·Performance |
| **성장 Grow** | Employee 승진·Upgrade, 부서 역량 상승 | Health↑ |
| **재편 Reorg** | 부서 신설/통합/분리, KPI 재정렬 | lineage append + Audit |
| **보관 Archive** | 운영 종료(기억은 보존) | Brand Memory 잔존 |

## 2. 다른 라이프사이클과의 관계
Company Lifecycle은 하위 라이프사이클을 **포함·조율**한다:
- [Employee 생애](employee-dna-spec.md) (채용→교육→인증→배치→성과→승진/Upgrade)
- [Skill 라이프사이클](skill-lifecycle-spec.md) (발견→…→배포→성과측정)
- Department 성장([Department Spec](department-spec.md))

## 3. 트리거 (무엇이 단계 전이를 일으키나)
- **성장 → 재편**: Department Health/Company Health 신호([Health Spec](company-health-spec.md))가 충원·신설·통합을 유발.
- **운영 → 성장**: 성과·인증 누적이 승진·Upgrade·skillLevel 상승을 유발.
- 모든 전이는 Approval Policy를 통과해야 하며 Audit에 기록.

## 4. 불변식
- 설립 시 Company DNA.genome(미션·아키타입)은 고정.
- 재편은 Organization 트리 불변식(단일 루트·사이클 금지)을 위반할 수 없다.
- 종료(Archive) 후에도 회사의 기억(Brand Memory)은 손실 없이 보존(해자).

## 관련
- [Company DNA Spec](company-dna-spec.md) · [Department Spec](department-spec.md) · [Organization Tree Spec](organization-tree-spec.md)
