# 헌법 개정 #004 — AI 공동창업자와 온보딩(Customer Journey)

- 상태: **Accepted (CEO 승인)**
- 출처: ATLAS UPDATE MEMO #004 (CEO ↔ CEO Advisor 논의)
- 중요도: ★★★★★ — Sprint 2 구현 전 반드시 반영. **아키텍처 우선.**
- 일자: 2026-06-27
- 선행: 개정 [#001](AMENDMENT-001-ai-employee-ecosystem.md)·[#002](AMENDMENT-002-company-centric-organization.md)·[#003](AMENDMENT-003-ceo-and-living-organization.md)

> 원본 헌법·이전 개정을 보존한다. 충돌 시 본 개정이 우선한다.

## 1. Atlas = 고객의 AI 공동창업자
Project Atlas는 회사를 만드는 프로그램이 아니라 **"고객의 AI 공동창업자(AI Co-founder)"**다.
가입 즉시 Company를 만들지 않는다. **먼저 AI가 고객의 현재 사업을 진단**한다.

## 2. 회원가입 = 무료 AI 컨설팅
가입은 단순 회원가입이 아니라 **무료 AI 컨설팅**이다. 고객은 질문에 답한다:
업종 · 현재 사업 단계 · 직원 수 · 월 매출(선택) · 온라인 운영 여부 · 브랜드 보유 여부 ·
가장 시간을 많이 쓰는 업무 · 가장 해결하고 싶은 문제 · 가장 성장시키고 싶은 분야.

## 3. AI Business Diagnosis — 회사보다 사업을 먼저 진단
질문이 끝나면 AI가 먼저 분석한다. 예: "지금은 마케팅보다 운영 체계를 먼저", "CS 직원보다 콘텐츠 직원이 우선".
→ [AI Business Diagnosis Spec](../specs/ai-business-diagnosis-spec.md)

## 4. AI Organization Recommendation — 진단 기반 자동 설계
진단 결과로 AI가 회사를 설계한다: Company → 추천 Department → 추천 Employee → 추천 Skill → 추천 우선순위.
**모든 고객이 같은 조직으로 시작하지 않는다.** (업종·성장 단계·사업 상태에 따라 달라짐)
→ [Org Recommendation Spec](../specs/org-recommendation-spec.md)

## 5. Company Auto Creation — AI가 설계, 대표는 승인만
고객이 직접 조직을 설계하지 않는다. **AI가 회사를 설계하고, 대표는 최종 승인만** 한다.
→ [Company Creation Flow Spec](../specs/company-creation-flow-spec.md)

## 6. Customer Journey — 독립 설계 대상
Sprint 2부터 Customer Journey를 **하나의 독립적인 설계 대상**으로 관리한다:
```
회원가입 → AI 사업 진단 → AI 회사 설계 → AI 조직 추천 → AI 직원 추천
        → 추천 Skill 적용 → 대표 승인 → Company 생성 완료
```
이 과정 자체가 Project Atlas의 **핵심 경험**이다.
→ [Customer Journey Spec](../specs/customer-journey-spec.md) · [Onboarding Architecture](../architecture/07-onboarding-architecture.md)

## 7. 절차
구현 보류 유지. Customer Journey 포함 구조 보완 → [Sprint 2 재제안](../sprints/sprint-2-proposal.md) → CEO Advisor 검토 후 **Codex 투입 여부** 판단.
관련 결정: [ADR 0009](../adr/0009-onboarding-and-customer-journey.md).
