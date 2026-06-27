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

### 화면 맵
```
Customer Workspace (= 내 회사)
├─ My Company      회사 개요(직원·부서는 단순 요약, Health/KPI 내부수치 비노출)
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

---

## Codex 인계 지점 (Sprint 2)
- 위 화면 맵을 Next.js(App Router)로 구현. 도메인은 `packages/*`·`services/orchestrator` 그대로 사용.
- 데이터 소스: Sprint 2에서 인메모리 → Postgres로 교체(orchestrator 인터페이스 유지).
- 정적 스냅샷 HTML을 시각 레퍼런스로 사용.
