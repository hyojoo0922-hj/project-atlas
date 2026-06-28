# UX 화면 구조 & 사용자 흐름 (Codex 인계용)

> 목적: Sprint 1은 UI 완성도가 목표가 아니다. 하지만 **Sprint 2에서 Codex가 UX를 설계**할 수 있도록
> 화면 구조와 사용자 흐름을 명확히 남긴다. 정적 스냅샷: `apps/operator-console/public/index.html`,
> `apps/customer-portal/public/index.html` (`npm run build:demo`로 재생성).

## 원칙 (개정 #001 §4·§5, PRODUCT_CHARTER)
- **Operator HQ = 복잡성 수용.** 운영자는 Skill·교육·인증·성과·원가를 운영한다.
- **Customer = 단순함.** 고객은 Skill OS를 몰라도 직원에게 일을 맡기면 결과가 온다.
- 두 경험은 **물리적으로 분리**(`apps/operator-console` ↔ `apps/customer-portal`).

---

## A. Operator HQ (운영자)

### 화면 맵 (개정 #002 — Company 중심)
```
Operator HQ
├─ Company Dashboard    Company Health Score · Goal/KPI · 성장 단계(Stage)
├─ CEO                  CEO DNA·의사결정 스타일·리스크·브랜드 우선순위·성장 전략·권한
├─ Approvals            승인 대기(ApprovalRequest) · Workflow 규칙(auto/ceo/dept_head/conditional)
├─ Org Recommendation   (업종×단계) 추천 조직 + rationale · 채택
├─ Organization         Company→CEO→Department→Employee 트리 · 재편(reorg)
├─ Departments          부서 목록 → 부서 상세
│   └─ Department Detail Health·KPI·필수Skill 대비 현재 수준(gap)·소속 직원·Performance
├─ Employees            직원 목록 → 직원 상세
│   └─ Employee Detail  DNA(4레이어)·rank·보유 Skill·인증·성과·MatchingProfile
├─ Skill Library        Skill 자산 카탈로그 → 라이프사이클 보드(10단계)·ROI
├─ Matching             직원별 추천(적합도 + breakdown + 사유)
├─ University · Certification · Research Lab
└─ Cost & ROI           CostLedger(회사/부서/직원/Skill별)·예산
```

### 핵심 사용자 흐름 (운영자)
1. 가입 시 **Org Recommendation**으로 (업종×단계) 조직을 받아 채택 → CEO·부서·직원 구성.
2. Company Dashboard에서 Health·KPI·Stage 확인 → At-Risk 부서 식별.
3. Department Detail에서 필수Skill gap 확인 → University 교육·Certification 인증.
4. 업무 실행은 **Approvals**(CEO 거버넌스/Workflow)를 거침 → Health 롤업·성장 단계 전이 모니터링 → 재추천·재편.

---

## B. Customer Experience (고객)

### 온보딩 (Customer Journey — 개정 #004 + CPO UX #001 + BUSINESS MEMO #008 무료/유료)
**무료 = 진단과 추천 / 유료 = 실행과 회사 운영.** 무료는 **회사 설계안 Preview(`proposal_ready`)까지**.
```
■ 무료 (진단·추천)
├─ 대표 계정 생성        (회원가입 X → "대표 계정 생성")
├─ 무료 사업진단권 활성화 (계정당 1회) ── 가입 직후 빈 대시보드 금지, 곧장 진단으로
├─ 무료 AI 컨설팅        질문 응답
├─ AI 사업 진단          "지금은 마케팅보다 운영 체계를 먼저" (점수 아닌 우선순위 판단)
├─ AI 회사 설계안 Preview 부서·직원·우선순위 + 예상 절약 시간/기대 효과
└─ (무료 종착) proposal_ready
■ 유료 (실행·운영) — 결제 후
├─ 결제 → 회사 설립
├─ 대표 비서 출근 (assistant_on_duty)
└─ 첫 AI 직원 준비 (first_employee_ready)
```
**항상 보이는 3요소(모든 단계)**: ① 현재 단계 · ② 공동창업자의 판단 · ③ 대표의 다음 행동.

**문구(CTA)**:
- 무료: `회사 설계안 보기` · `필요한 직원 확인하기` · `내 회사 설립 준비하기`
- 유료 전환: `이 설계안으로 회사 설립하기` · `대표 비서 출근시키기` · `첫 AI 직원 채용하기` · `계속 회사 운영하기`
- ❌ 무료 단계 "회사 생성 완료" 류 문구 금지.

**고객 화면에서 숨기는 내부 요소**: Skill Lifecycle · Matching Score · Certification · Model · Token · CostLedger · Health/KPI 내부 수치.
(운영자 화면에서만 노출 — `apps/operator-console/public/onboarding.html`)
> 경계 상세: [free-paid-boundary](../business/free-paid-boundary.md) · 대표 비서: [owner-assistant-spec](../specs/owner-assistant-spec.md) · 업셀: [upsell spec](../specs/employee-recommendation-upsell-spec.md)

### 운영 화면 맵
```
Customer Workspace (= 내 회사)
├─ My Company      회사 개요(직원·부서 단순 요약, Health/KPI 내부수치 비노출)
├─ My Employees    채용한 AI 직원(근무 상태) — Skill OS 복잡성 비노출
├─ Delegate Work   직원에게 업무 위임(자연어 intent)
├─ Results         맡긴 업무의 결과
└─ Credits         크레딧 잔액/사용량 (단순)
```
> 고객은 "내 회사"를 느끼되, Department/Skill 라이프사이클/Health 공식 등 운영 복잡성은 보지 않는다.

### 핵심 사용자 흐름 (고객)
1. AI 직원을 채용(또는 추천된 직원 선택).
2. 업무를 자연어로 위임.
3. 결과 확인. (내부의 Skill·Matching·라이프사이클·토큰은 보이지 않음)

### 품질·신뢰 UX (Trust First — MEMO #009, Sprint 2B 적용)
업무 위임 시 직원은 **무조건 결과물을 만들지 않는다.** 준비도/신뢰도에 따라 화면이 달라진다:
```
Delegate Work → (직원이 판단)
  ├─ 정보 충분(≥90)  → 결과물(최종본) + 만족도 피드백 요청
  ├─ 부분 충족(70–89) → "초안입니다" 라벨 + 보완 자료 안내
  ├─ 부족(<70)        → 결과물 대신 "필요한 자료 요청"(직원이 묻는 카드)
  └─ 범위 밖          → "이 업무엔 ○○ 직원이 필요합니다" (채용 추천/업셀)
```
- **직원 온보딩**: 채용 직후 그 직원이 필요한 자료만 묻는다(긴 가입 설문 X). 직군별 질문 → [progressive-company-learning](../specs/progressive-company-learning-spec.md).
- **만족도**: 결과물 후 전체 만족도·브랜드다움·유용성·재사용 의향·한 줄 + (7일 후) 성과 피드백.
- 고객엔 신뢰도 점수를 복잡하게 보이지 않되, 정직하게(초안/자료 필요) 안내. 점수·누락은 Operator HQ.
> 상세: [quality-boundary](../specs/quality-boundary-spec.md) · [employee-readiness](../specs/employee-readiness-spec.md) · [output-scope](../specs/output-scope-spec.md) · [satisfaction-memory](../specs/satisfaction-memory-spec.md)

---

## Codex 인계 지점
- 온보딩 도메인은 `services/onboarding/src/onboarding-flow.ts`의 `OnboardingFlow.run()` 단일 진입점.
  - 각 단계의 고객 3요소는 `buildCustomerView(state, ctx)`(packages/onboarding) 가 반환 → 화면은 바인딩만.
  - 정적 스냅샷: `apps/customer-portal/public/onboarding.html`(고객), `apps/operator-console/public/onboarding.html`(운영자).
- 운영 워크스페이스 화면 맵을 Next.js(App Router)로 구현. 도메인은 `packages/*`·`services/*` 그대로 사용.
- 데이터 소스: Sprint 3에서 인메모리 → Postgres 교체(인터페이스 유지).
