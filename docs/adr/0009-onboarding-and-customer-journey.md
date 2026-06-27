# ADR 0009 — 온보딩(Customer Journey)과 AI 사업 진단 기반 회사 자동 설계

- 상태: Accepted
- 출처: [헌법 개정 #004](../constitution/AMENDMENT-004-ai-cofounder-onboarding.md) (CEO 승인)
- 일자: 2026-06-27
- 선행: [ADR 0008](0008-ceo-object-and-approval-workflow.md)

## 배경
Atlas의 첫 경험이 "회사 생성"이 아니라 **"AI 공동창업자의 사업 진단 → 회사 자동 설계 → 대표 승인"**으로 정의됐다.
회원가입은 무료 AI 컨설팅이며, Customer Journey가 핵심 경험이다.

## 결정
1. **Onboarding을 1급 설계 대상으로 도입.** [Onboarding Architecture](../architecture/07-onboarding-architecture.md)가 우산 문서.
2. **Customer Journey를 독립 스펙으로 관리** (가입→진단→설계→추천→승인→생성). 단계별 상태머신.
3. **AI Business Diagnosis 도입.** 온보딩 응답 → 진단(우선순위·먼저 만들 것). Company 생성 *이전* 단계.
4. **Org Recommendation을 진단 기반으로 확장.** 입력 = (업종 × 단계 × **진단 결과**). 동일 시작 금지.
5. **Company Creation Flow 도입.** AI가 Company/CEO/Department/Employee/Skill을 *설계(제안)*, 대표는 **승인만**. 승인은 [Approval Workflow](../specs/approval-workflow-spec.md)의 창업 승인.
6. **Customer는 단순, 엔진은 복잡.** 고객은 컨설팅 대화·승인만 경험. 진단/설계 복잡성은 비노출(PRODUCT_CHARTER).

## 근거
- "AI 공동창업자" 포지셔닝은 빈 화면이 아니라 *맞춤 설계된 회사*를 제공 → 강력한 온보딩 가치·전환·해자.
- 진단을 회사 생성 앞에 두면 (업종×단계) 추천이 *사업 상태*까지 반영 → 차별화.
- "AI 설계 + 대표 승인"은 자동화와 통제의 균형(거버넌스).

## 확장성 원칙
- 진단·추천은 **규칙/템플릿 + 가중치 v0** → 데이터 축적 후 학습 기반(별도 ADR).
- 온보딩 질문 세트·진단 규칙·업종 템플릿은 **데이터로 추가**(코드 수정 불필요).
- Customer Journey는 상태머신 → 단계 추가/분기 확장 용이.

## 결과
- 신규: Onboarding Architecture(07), Customer Journey/AI Business Diagnosis/Company Creation Flow 스펙. Org Recommendation에 진단 입력·추천 플로우 추가.
- [Sprint 2 재제안 v3](../sprints/sprint-2-proposal.md): 살아있는 회사 + **온보딩 Customer Journey**를 핵심 경험으로.
- **구현은 CEO Advisor 검토 후 Codex 투입 판단.** Sprint 1 코드 미변경.
