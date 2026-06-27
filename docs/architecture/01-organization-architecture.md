# 01 — Organization Architecture (조직 아키텍처)

> 근거: 개정 [#002](../constitution/AMENDMENT-002-company-centric-organization.md)·[#003](../constitution/AMENDMENT-003-ceo-and-living-organization.md) · [ADR 0007](../adr/0007-company-centric-architecture.md)/[0008](../adr/0008-ceo-object-and-approval-workflow.md)
> Atlas는 "회사를 운영하는 플랫폼"이다. 목표는 회사가 **살아 움직이는 것**.

## 1. 계층 (Hierarchy) — CEO 포함 (개정 #003)
```
Customer (과금 계정)
└─ Company  ★최상위 1급 객체
   ├─ Company DNA · Culture · Goal · KPI · Stage · Health Score
   ├─ Brand Memory (Company 스코프)
   ├─ CEO  ★핵심 객체 (DNA·의사결정스타일·승인정책·리스크·브랜드우선순위·성장전략·Goal·KPI·권한)
   └─ Organization (트리)
      └─ Department  ★독립 객체(성장)
         ├─ Department DNA · Mandate · KPI · Health · Performance
         ├─ 필수 Skill · 현재 Skill 수준
         └─ Employee  (Department 소속, 승진/성장)
            └─ Skill (적합도+인증 기반 배정)
```
> **CEO는 사용자가 아니라 핵심 객체**다. 같은 직원도 CEO에 따라 다르게 일한다. → [CEO Spec](../specs/ceo-spec.md)

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

## 4. 거버넌스 (CEO 중심 — 개정 #003)
- **CEO 객체**: 의사결정 스타일·리스크 성향·브랜드 우선순위·성장 전략·권한 → **직원 작동을 지배**. → [CEO Spec](../specs/ceo-spec.md)
- **Approval Workflow(독립 구조)**: 자동/CEO/부서장/조건부 승인으로 액션 라우팅 → Orchestrator 게이트. → [Approval Workflow Spec](../specs/approval-workflow-spec.md)
- **Company Culture**: 규범·톤·리스크 성향 → 직원 가드레일·산출물 기준에 반영.

→ 같은 Skill·직원이라도 **CEO/Company마다 다르게 작동**한다. 이것이 멀티테넌트 차별화의 축.

## 5. 조직과 서브시스템의 관계
- **Organization Tree**: 계층(`company/ceo/department/employee`)의 정규 표현(추가/이동/재편). → [Organization Tree Spec](../specs/organization-tree-spec.md)
- **Brand Memory**: Company 스코프. 모든 부서·직원이 회사의 기억을 공유.
- **AI Organization Recommendation**: (업종×단계)로 초기/재편 조직을 추천. → [Org Recommendation Spec](../specs/org-recommendation-spec.md)
- **Skill OS / Matching / University / Certification / Research Lab**: Department의 *필수 Skill ↔ 현재 수준* 격차가 교육·연구 우선순위를 만든다.
- **Operator HQ**: Company·CEO~Research Lab 전체를 운영(직원 직접관리 아님). → [Operator HQ Spec](../specs/operator-hq-spec.md)

## 6. 살아있는 조직 (Living Organization — 개정 #003)
```
가입(업종·단계) → [AI 조직 추천] → CEO·부서·직원·Skill 구성
     ▲                                          │
     │ 단계 전이 시 재추천                        ▼
 Growth 단계 ◀── Company/Dept Health 롤업 ◀── 직원 업무·성과 ◀── CEO 거버넌스 / Approval
```
"회사가 존재하는 것"이 아니라 "**살아 움직이는 것**" — Approval·Growth·Health·Recommendation이 한 루프로 연결.
생애 상세: [Company Lifecycle](../specs/company-lifecycle-spec.md).

## 관련 문서
- 전체 시스템 개요: [00-overview.md](00-overview.md)
- 데이터 모델: [02-data-model.md](02-data-model.md)
- 조직 스펙 묶음: [../specs/README.md](../specs/README.md)
