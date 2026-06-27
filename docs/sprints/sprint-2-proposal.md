# Sprint 2 제안 (CTO → CEO) — 살아 움직이는 회사

> 상태: **재제안 v2 (CEO 승인 대기)** — 개정 #003 반영본
> 작성: CTO | 기준: 헌법 + 개정 [#001](../constitution/AMENDMENT-001-ai-employee-ecosystem.md)·[#002](../constitution/AMENDMENT-002-company-centric-organization.md)·[#003](../constitution/AMENDMENT-003-ceo-and-living-organization.md) + [Organization Architecture](../architecture/01-organization-architecture.md)
> 목표 상향: "회사가 **존재**" → "회사가 **살아 움직임**".

## 0. 한 줄 목표
**Company → CEO → Department → Employee → Skill 이 Approval · Growth · Health · Recommendation으로 연결되어
하나의 살아있는 조직으로 동작함을 코드로 증명한다.** (인메모리, 실모델·로그인·결제 없음. Gateway mock.)

## 1. 왜 이 범위인가
- 개정 #003은 **아키텍처 변경**이다. CEO·Approval·Growth·Recommendation을 *도메인*에 먼저 안정화해야 영속화(Sprint 3) 비용이 최소화된다.
- Sprint 1 자산(Employee/Skill/Matching/Cost) 위에 **Company·CEO·Department·Organization·Health·Approval·Recommendation**을 얹어 *살아있는 루프*를 완성.
- "회사를 운영하는 플랫폼"의 차별점(CEO 거버넌스·조직 추천·성장 단계)을 0원 원가로 시연.

## 2. Sprint 2 산출물 (In Scope)
1. **도메인 타입 확장** (`shared-types`): `Company`(+stage), `CEO`(+DNA/decisionStyle/riskAppetite/brandPriority/growthStrategy/goal/kpi/authority), `Department`, `OrgNode(ceo 포함)`, `ApprovalWorkflow`/`ApprovalRequest`, `OrgRecommendation`. Employee에 `companyId/departmentId/rank`.
2. **company-core / ceo-core / department-core 패키지** (신규): 객체 생성·DNA·Goal/KPI·거버넌스.
3. **organization 패키지** (신규): 트리(add/assign/move/reorg, 불변식: 단일 루트·사이클 금지·CEO 노드).
4. **approval 패키지** (신규): Approval Workflow 규칙 평가(auto/ceo/dept_head/conditional) + ApprovalRequest.
5. **health 패키지** (신규): Department/Company Health 롤업(설명 가능 가중합).
6. **org-recommendation 패키지** (신규): (업종×단계) 템플릿 추천 + rationale. seed: **카페** 템플릿.
7. **Brand Memory → Company 스코프** 마이그레이션 (`brand-memory`).
8. **Orchestrator 확장 — 살아있는 루프**: 가입(업종·단계)→조직 추천→CEO·부서·직원 구성→(Sprint 1) 교육·인증·업무→**CEO 거버넌스·Approval 게이트**→성과→**Health 롤업**→**Growth 단계 전이→재추천**.
9. **데모 v2 + Operator HQ 스냅샷 확장**: Company Dashboard(Health/KPI/Stage)·CEO·Organization 트리·Department·Approval·추천.

## 3. 명시적 제외 (Out)
- ❌ 영속 DB(Postgres+RLS) — **Sprint 3**. Sprint 2는 인메모리.
- ❌ 실제 AI API / Gateway 실연동 — mock 유지(원가 $0).
- ❌ 로그인 · 결제 · 영상/이미지 생성.
- ❌ 학습 기반 추천/Matching v1 — 규칙·템플릿 기반 v0만.

## 4. 수직 슬라이스 (데모 v2 — 살아있는 회사)
> "**카페** 회사 'Acme' 가입(stage=초기 성장) → **AI 조직 추천**: Operations·Marketing(+안정화 시 Customer Care) →
> **CEO** 'Acme CEO'(리스크 medium·brandPriority=premium·delegation high) 설정 →
> Marketing 부서에 **Writer Employee** 배치 → 교육·인증 →
> 업무 요청 시 **Approval Workflow** 평가(저위험·예산 내 → auto, 고위험 → CEO 승인) →
> mock 실행 → 성과가 **부서 Health → Company Health Score**로 롤업 →
> KPI 달성으로 **stage 전이(초기 성장→안정화)** → **Customer Care 부서 재추천**."

이 흐름이 동작하면 **CEO 거버넌스 + Approval + Health + Growth + Recommendation**이 한 루프로 살아 움직임을 증명한다.

## 5. 성공 기준 (DoD)
- [ ] `npm test` green (기존 19 + Company/CEO/Department/Organization/Approval/Health/Recommendation 신규)
- [ ] 조직 트리 불변식(단일 루트·사이클 금지·CEO/직원 소속) 테스트 통과
- [ ] **CEO 거버넌스**가 직원 작동을 바꾼다(리스크/위임에 따른 Approval·가드레일 차이) 검증
- [ ] **Approval Workflow** 4유형(auto/ceo/dept_head/conditional) 라우팅 검증
- [ ] 성과 → Department Health → Company Health **롤업** 수치 검증
- [ ] **AI 조직 추천**이 (업종×단계)별로 다른 조직 + rationale 반환
- [ ] **Growth 단계 전이 → 재추천** 동작
- [ ] Brand Memory Company 스코프 동작(기존 테스트 유지)
- [ ] 데모 v2 + Operator HQ 스냅샷 반영, 새 결정은 ADR로 기록

## 6. 규모/리스크
- 규모: 2.5~3.5주(1인+AI). 인메모리라 인프라 리스크 낮음. 신규 패키지 6개로 증가.
- 리스크: CEO 거버넌스/Health/추천 가중치·규칙은 *가설* → v0 규칙·템플릿 기반·조정 가능. brandId→companyId 마이그레이션은 brand-memory에 국한.

## 7. CEO 승인 요청
이 재제안은 [개정 #003](../constitution/AMENDMENT-003-ceo-and-living-organization.md)의 구조 반영분입니다.
요청: **본 Sprint 2 v2 범위 승인** → 승인 시 도메인 타입 확장부터 구현 착수.
확인 1건(선택): 데모 seed 업종을 **카페**로 확정할지(또는 효주님 사업군: 콘텐츠/뷰티/카페 중 택1).

## 8. 다음 (Sprint 3 예고)
영속화(Postgres+RLS) → Model Gateway 실제 제공자 1종(원가/ROI 실측) → 이후 Codex의 Next.js UX([ux-screen-structure](../product/ux-screen-structure.md)).
전체: [roadmap](roadmap.md).
