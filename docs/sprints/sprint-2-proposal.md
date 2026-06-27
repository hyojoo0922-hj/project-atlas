# Sprint 2 제안 (CTO → CEO) — Company 중심 조직 모델

> 상태: **재제안 (CEO 승인 대기)** — 개정 #002 반영본
> 작성: CTO | 기준: 헌법 + 개정 [#001](../constitution/AMENDMENT-001-ai-employee-ecosystem.md)·[#002](../constitution/AMENDMENT-002-company-centric-organization.md) + [Organization Architecture](../architecture/01-organization-architecture.md)
> 변경 사유: 기존 Sprint 2(영속화+실원가)는 **Sprint 3로 이동**. 개정 #002에 따라 Sprint 2를 **Company 중심 조직 모델** 구축으로 재정의.

## 0. 한 줄 목표
**"회사(Company)를 운영한다"는 경험을 코드로 증명한다.**
Company → Department → Employee → Skill 계층, Goal/KPI 캐스케이드, Health 롤업이 인메모리로 살아있는 수직 슬라이스.
(여전히 실모델·로그인·결제 없음. Gateway mock 유지.)

## 1. 왜 이 범위인가
- 개정 #002는 **아키텍처 변경**이다. 영속화(Postgres) 전에 *도메인 모델*을 먼저 Company 중심으로 안정화해야 마이그레이션 비용이 최소화된다.
- Sprint 1 자산(Employee/Skill/Matching/Cost) 위에 **Company·Department·Organization·Health**를 얹는다.
- "회사를 운영하는 플랫폼"의 핵심 차별점(조직 건강·목표 캐스케이드)을 0원 원가로 시연.

## 2. Sprint 2 산출물 (In Scope)
1. **도메인 타입 확장** (`packages/shared-types`): `Company`(+DNA/Culture/CEOStyle/ApprovalPolicy/Goal/KPI/HealthScore), `Department`(+DNA/KPI/필수Skill/skillLevel/Health/Performance), `OrgNode`. Employee에 `companyId/departmentId/rank` 추가.
2. **company-core 패키지** (신규): Company 생성·거버넌스 객체·Goal/KPI 보유.
3. **department-core 패키지** (신규): 부서 생성·필수Skill/현재수준·KPI.
4. **organization 패키지** (신규): 조직 트리(add/assign/move/reorg, 불변식: 단일 루트·사이클 금지).
5. **health 패키지** (신규): Department Health·Company Health Score 롤업 계산(설명 가능 가중합).
6. **Brand Memory를 Company 스코프로 마이그레이션** (`brand-memory`): `brandId` → `companyId`.
7. **Orchestrator 확장**: 회사 설립→부서 구성→직원 배치→업무→**성과 롤업(직원→부서→회사 Health)**→**Goal/KPI 캐스케이드** 반영.
8. **데모 v2 + Operator HQ 스냅샷 확장**: Company Dashboard(Health/KPI)·Organization 트리·Department 보드 추가.

## 3. 명시적 제외 (Out)
- ❌ 영속 DB(Postgres+RLS) — **Sprint 3**. Sprint 2는 인메모리 유지.
- ❌ 실제 AI API / Model Gateway 실연동 — Gateway mock 유지(원가 $0).
- ❌ 로그인 · 결제 · 영상/이미지 생성.
- ❌ 조직 *재편(reorg) UI* — 트리 연산은 도메인/테스트로만, 화면은 Sprint 4+.

## 4. 수직 슬라이스 (데모 v2 시나리오)
> "Company 'Acme' 설립(DNA·Goal·KPI) → 부서 '콘텐츠팀'(필수 Skill·KPI) 구성 →
> Writer Employee를 콘텐츠팀에 배치 → (Sprint 1 흐름) 교육·인증·업무·성과 →
> 직원 성과가 **부서 Health**로, 부서 Health가 **Company Health Score**로 롤업 →
> Company Goal→KPI→부서 KPI 캐스케이드 정합 확인 →
> 부서 'CS팀'은 필수 Skill 미충족(skillLevel gap)으로 **At-Risk**로 표시되어 교육 우선순위 발생."

이 흐름이 동작하면 **회사 운영(조직·목표·건강)** 모델이 증명된다.

## 5. 성공 기준 (DoD)
- [ ] `npm test` green (기존 19 + Company/Department/Organization/Health 신규 테스트)
- [ ] Organization 트리 불변식(단일 루트·사이클 금지·직원 단일 부서) 테스트 통과
- [ ] 직원 성과 → Department Health → Company Health **롤업**이 수치로 검증
- [ ] Goal→KPI→Dept KPI **캐스케이드** 정합 검증
- [ ] 필수 Skill 미충족 부서가 At-Risk로 식별됨
- [ ] Brand Memory가 Company 스코프로 동작(기존 테스트 유지)
- [ ] 데모 v2 + Operator HQ 스냅샷에 Company/Department/Org 반영
- [ ] 새 결정은 ADR로 기록

## 6. 규모/리스크
- 규모: 1.5~2.5주(1인+AI). 인메모리라 인프라 리스크 낮음. 신규 패키지 4개로 Sprint 1 대비 증가.
- 리스크: Health 가중치는 *가설* → v0 규칙 기반·조정 가능. Sprint 1 코드의 brandId→companyId 마이그레이션은 brand-memory에 국한되어 영향 작음.

## 7. CEO 승인 요청
이 재제안은 [개정 #002](../constitution/AMENDMENT-002-company-centric-organization.md)의 구조 반영분입니다.
요청: **본 Sprint 2 범위 승인** → 승인 시 도메인 타입 확장부터 구현 착수.
1건 확인 요청(선택): 데모의 **2번째 부서 예시**를 'CS팀'(At-Risk 시연)으로 둘지, 다른 부서로 할지.

## 8. 다음 (Sprint 3 예고)
영속화(Postgres+RLS) → Model Gateway 실제 제공자 1종(원가/ROI 실측) → 이후 Codex의 Next.js UX([ux-screen-structure](../product/ux-screen-structure.md)).
전체: [roadmap](roadmap.md).
