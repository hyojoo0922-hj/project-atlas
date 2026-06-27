# 01 — Organization Architecture (조직 아키텍처)

> 근거: [헌법 개정 #002](../constitution/AMENDMENT-002-company-centric-organization.md) · [ADR 0007](../adr/0007-company-centric-architecture.md)
> Atlas는 "회사를 운영하는 플랫폼"이다. 본 문서는 조직 계층의 상위 그림이다.

## 1. 계층 (Hierarchy)
```
Customer (과금 계정)
└─ Company  ★최상위 1급 객체
   ├─ Company DNA · Culture · CEO Style · Approval Policy
   ├─ Company Goal · Company KPI · Company Health Score
   ├─ Brand Memory (Company 스코프)
   └─ Organization (트리)
      └─ Department  ★독립 객체(성장)
         ├─ Department DNA · Mandate(담당 업무) · KPI
         ├─ 필수 Skill · 현재 Skill 수준 · Health · Performance
         └─ Employee  (Department 소속)
            └─ Skill (적합도+인증 기반 배정)
```

## 2. 공통 패턴 — 모든 계층은 같은 방식으로 성장한다
| 계층 | DNA | 목표 | 건강/성과 | 성장 |
|---|---|---|---|---|
| **Company** | Company DNA | Company Goal/KPI | Company Health Score | 부서 신설·재편 |
| **Department** | Department DNA | Department KPI | Department Health/Performance | 필수 Skill 확보·역량 상승 |
| **Employee** | Employee DNA | 배정 업무 | Performance History | 인증·승진·Upgrade |

> 하나의 공통 패턴(`DNA + Goal/KPI + Health + Performance + 성장 루프`)을 세 계층이 공유한다.
> → 일관성·확장성. 추후 팀(Team)/직무(Role) 계층 추가도 같은 패턴을 따른다.

## 3. 캐스케이드 (Goal/KPI 상→하)
```
Company Goal ──▶ Company KPI ──▶ Department KPI ──▶ Employee 배정 업무/성과
```
하위 성과가 상위 Health로 **롤업**된다(역방향):
```
Employee Performance ──▶ Department Health/Performance ──▶ Company Health Score
```
상세 공식: [Company Health Spec](../specs/company-health-spec.md) · [Department Health Spec](../specs/department-health-spec.md).

## 4. 거버넌스 (운영 방식의 차이를 1급으로)
- **Company Culture**: 규범·톤·리스크 성향 → 직원 가드레일·산출물 기준에 반영.
- **CEO Style**: 위임 수준·의사결정 속도·리스크 허용도 → 직원 자율도(autonomy) 결정.
- **Approval Policy**: 어떤 액션(배포·예산·고위험 작업)이 승인을 요구하는지 → Orchestrator 게이트.

→ 같은 Skill·직원이라도 Company마다 다르게 작동한다. 이것이 멀티테넌트 차별화의 축.

## 5. 조직과 서브시스템의 관계
- **Organization Tree**: 계층 구조의 정규 표현(추가/이동/재편). → [Organization Tree Spec](../specs/organization-tree-spec.md)
- **Brand Memory**: 이제 Company 스코프. 모든 부서·직원이 회사의 기억을 공유.
- **Skill OS / Matching / University / Certification / Research Lab**: Department의 *필수 Skill ↔ 현재 Skill 수준* 격차가 교육·연구 우선순위를 만든다.
- **Operator HQ**: Company~Research Lab 전체를 운영(직원 직접관리 아님). → [Operator HQ Spec](../specs/operator-hq-spec.md)

## 6. 생애 (Lifecycle)
회사 설립 → 조직(부서) 구성 → 직원 채용·배치 → 운영 → 성장(부서·직원 업그레이드, 신설) → 재편.
상세: [Company Lifecycle](../specs/company-lifecycle-spec.md).

## 관련 문서
- 전체 시스템 개요: [00-overview.md](00-overview.md)
- 데이터 모델: [02-data-model.md](02-data-model.md)
- 조직 스펙 묶음: [../specs/README.md](../specs/README.md)
