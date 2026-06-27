# 헌법 개정 #003 — CEO 객체와 살아있는 조직

- 상태: **Accepted (CEO 승인)**
- 출처: ATLAS UPDATE MEMO #003 (CEO ↔ CEO Advisor 논의)
- 중요도: ★★★★★ — Sprint 2 구현 전 반드시 반영. **아키텍처 우선.**
- 일자: 2026-06-27
- 선행: [개정 #001](AMENDMENT-001-ai-employee-ecosystem.md) · [개정 #002](AMENDMENT-002-company-centric-organization.md)

> 원본 헌법·개정 #001·#002를 보존한다. 충돌 시 본 개정이 우선한다.

## 1. 계층 확장 — CEO 삽입
```
(구)  Company → Department → Employee → Skill
(신)  Company → CEO → Department → Employee → Skill
```
**CEO는 단순 사용자(User)가 아니라 회사의 핵심 객체**다.

## 2. CEO 객체
CEO는 최소 다음을 가진다:
- CEO DNA · 의사결정 스타일 · 승인 정책 · 리스크 성향
- 브랜드 우선순위 · 성장 전략 · 목표 · KPI · 권한(Authority)

> **같은 직원이라도 CEO에 따라 다른 방식으로 일한다.** CEO는 조직 운영의 *지배 변수*다.

## 3. Approval Workflow (독립 구조)
Approval Policy를 Company 속성으로만 두지 않고 **독립적인 Approval Workflow**로 설계한다.
확장 가능한 결정 유형: 자동 승인 · CEO 승인 · 부서장 승인 · 조건부 승인.
→ [Approval Workflow Spec](../specs/approval-workflow-spec.md)

## 4. Company Lifecycle — 성장 단계
회사는 성장 단계를 가진다: **창업 → 초기 성장 → 안정화 → 확장 → 프랜차이즈**.
단계에 따라 필요한 **부서·직원·Skill**이 달라진다. 확장 가능한 구조로 설계한다.
→ [Company Lifecycle](../specs/company-lifecycle-spec.md)

## 5. AI Organization Recommendation
Atlas는 고객에게 **조직을 추천**한다. 모든 회사를 동일한 조직으로 시작시키지 않는다.
**업종 + 회사 단계**에 따라 추천 조직이 달라진다 (예: 카페 → Marketing / Operations / Customer Care).
→ [Org Recommendation Spec](../specs/org-recommendation-spec.md)

## 6. Sprint 2 목표 수정 — "살아 움직이는 회사"
Sprint 2의 목표는 "회사가 존재하는 것"이 아니라 **"회사가 살아 움직이는 것"**이다.
`Company → CEO → Department → Employee → Skill` + **Approval · Growth · Health · Recommendation**이
하나의 **살아있는 조직**으로 연결되는 구조를 목표로 한다.

## 7. 절차
구현 중단 유지. 구조 확정 → [Sprint 2 재제안](../sprints/sprint-2-proposal.md) → CEO 승인 후 구현.
관련 결정: [ADR 0008](../adr/0008-ceo-object-and-approval-workflow.md).
