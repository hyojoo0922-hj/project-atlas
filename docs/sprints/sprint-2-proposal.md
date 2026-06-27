# Sprint 2 제안 (CTO → CEO) — AI 공동창업자: 온보딩으로 살아나는 회사

> 상태: **재제안 v3 (CEO 승인 대기)** — 개정 #004 반영본
> 작성: CTO | 기준: 헌법 + 개정 [#001](../constitution/AMENDMENT-001-ai-employee-ecosystem.md)·[#002](../constitution/AMENDMENT-002-company-centric-organization.md)·[#003](../constitution/AMENDMENT-003-ceo-and-living-organization.md)·[#004](../constitution/AMENDMENT-004-ai-cofounder-onboarding.md)
> + [Onboarding Architecture](../architecture/07-onboarding-architecture.md) · [Organization Architecture](../architecture/01-organization-architecture.md)
> 핵심 추가: **Customer Journey(온보딩)**를 독립 설계 대상이자 *첫 핵심 경험*으로 포함.

## 0. 한 줄 목표
**"AI 공동창업자가 사업을 진단해 회사를 설계하고, 대표 승인으로 회사가 태어나 살아 움직인다"는
전체 경험을 코드로 증명한다.** (인메모리, 실모델·로그인·결제 없음. Gateway mock.)

## 1. 왜 이 범위인가
- 개정 #004로 **첫 경험이 "회사 생성"이 아니라 "온보딩(진단→설계→승인)"**으로 정의됨 → 이 여정이 Atlas의 핵심.
- 온보딩이 만들어내는 결과물이 곧 개정 #003의 살아있는 조직(Company→CEO→…)이므로, 둘을 한 Sprint에서 *하나의 흐름*으로 증명.
- 영속화·실모델은 Sprint 3. 지금은 도메인·여정을 인메모리로 안정화.

## 2. Sprint 2 산출물 (In Scope)
**A. 온보딩 (Customer Journey — 핵심)**
1. **onboarding 패키지** (신규): 컨설팅 질문 세트 + `OnboardingResponse` 수집, Customer Journey **상태머신**(signup→…→created).
2. **diagnosis 패키지** (신규): [AI Business Diagnosis](../specs/ai-business-diagnosis-spec.md) 규칙 엔진 → 우선순위·firstBuild + rationale.
3. **org-recommendation 패키지** (신규): (업종×단계×**진단**) → 추천 부서·직원·Skill·우선순위 + rationale. seed: **카페** 템플릿.
4. **company-creation 패키지** (신규): `CompanyDesignDraft` 자동 생성 → 대표 승인 → 인스턴스화(Company/CEO/Dept/Employee/Skill).

**B. 조직 도메인 (살아있는 회사)**
5. **도메인 타입 확장** (`shared-types`): Company(+stage)·CEO·Department·OrgNode(ceo)·ApprovalWorkflow/Request·OnboardingResponse·Diagnosis·CompanyDesignDraft. Employee+companyId/departmentId/rank.
6. **company-core / ceo-core / department-core / organization / approval / health 패키지** (신규).
7. **Brand Memory → Company 스코프** 마이그레이션.
8. **Orchestrator 확장**: 온보딩→생성→운영(Approval 게이트·성과·Health 롤업·성장 단계 전이·재추천)을 하나의 흐름으로.

**C. 시연**
9. **데모 v2 + 스냅샷**: 온보딩 내러티브(가입→진단→설계→승인→생성) + Operator HQ(Company/CEO/Org/Approval/추천) + Customer(온보딩 4스텝).

## 3. 명시적 제외 (Out)
- ❌ 영속 DB(Postgres+RLS) — Sprint 3. 인메모리 유지.
- ❌ 실제 AI API / Gateway 실연동 — mock(원가 $0). (진단·추천도 규칙 기반, LLM 미사용)
- ❌ 로그인 · 결제 · 영상/이미지 생성.
- ❌ 학습 기반 진단/추천/Matching v1.

## 4. 수직 슬라이스 (데모 v2 — AI 공동창업자)
> "**카페** 사장이 가입 → 컨설팅 질문 응답(직원 3·온라인X·시간소모=재고/발주·문제=신규고객·성장=온라인매출) →
> **AI 진단**: '지금은 마케팅보다 운영 체계 먼저, 그다음 콘텐츠' →
> **AI 회사 설계(draft)**: Operations(1순위)·Marketing(2순위) + Writer Employee + 추천 Skill →
> **대표 승인 1번** → **회사 생성 완료**(Company·CEO·부서·직원) →
> 운영: 업무 요청 → Approval 게이트 → mock 실행 → 성과 → **Health 롤업** →
> KPI 달성 → **stage 전이(초기성장→안정화) → Customer Care 재추천**."

이 한 흐름이 **온보딩 + 살아있는 회사**를 한 번에 증명한다.

## 5. 성공 기준 (DoD)
- [ ] `npm test` green (기존 19 + 온보딩/진단/추천/생성/조직/Approval/Health 신규)
- [ ] Customer Journey 상태머신: `created` 이전엔 실제 Company 미생성, `created`는 대표 승인을 반드시 거침
- [ ] **AI 진단**이 동일 업종이라도 응답에 따라 다른 우선순위 + rationale 반환
- [ ] **조직 추천**이 (업종×단계×진단)별로 다른 조직 반환(동일 시작 금지)
- [ ] **회사 자동 생성**: 승인된 draft만 인스턴스화, 트리 불변식 준수
- [ ] CEO 거버넌스 + Approval 4유형 라우팅 검증
- [ ] 성과 → Dept Health → Company Health 롤업 + stage 전이→재추천 검증
- [ ] 데모 v2 + 스냅샷 반영, 새 결정은 ADR로 기록

## 6. 규모/리스크
- 규모: 3~4주(1인+AI). 신규 패키지 ~10개. 인메모리라 인프라 리스크 낮음.
- 리스크: 진단·추천·Health 규칙/가중치는 *가설* → v0 규칙·템플릿·조정 가능. 범위가 커 **2단계 분할 가능**(2A 온보딩→생성 / 2B 운영 루프).

## 7. CEO / CEO Advisor 승인 요청
이 재제안은 [개정 #004](../constitution/AMENDMENT-004-ai-cofounder-onboarding.md) 반영분입니다.
요청 사항:
1. **본 Sprint 2 v3 범위 승인** (또는 2A/2B 분할 여부).
2. 데모 seed 업종 확정: **카페**(권장) 또는 콘텐츠/뷰티.
3. **Codex 투입 여부** — CEO Advisor 검토 후 결정(메모 #004). 투입 시 UX는 [ux-screen-structure](../product/ux-screen-structure.md) 기반.

## 8. 다음 (Sprint 3 예고)
영속화(Postgres+RLS) → Model Gateway 실제 제공자 1종(원가/ROI 실측, 진단·추천에 LLM 도입 검토) → Codex Next.js UX.
전체: [roadmap](roadmap.md).
