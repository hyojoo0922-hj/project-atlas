# Employee & Skill 게이트 (Employee & Skill Gate)

> 헌법: [BUSINESS_CONSTITUTION](../constitution/BUSINESS_CONSTITUTION.md) · [개정 #001](../constitution/AMENDMENT-001-ai-employee-ecosystem.md)
> 용어 정렬: Atlas는 *Feature*가 아니라 **Employee/Skill**을 만든다.
> **모든 신규 Employee(직군)·Skill 제안은 이 게이트를 통과해야 한다.** 통과 못 하면 만들지 않는다.

## 4개의 필수 질문
각 제안은 아래 4개에 모두 "예"여야 진행한다.

- [ ] **1. 고객이 결제할 이유가 있는가?** — 이 직원/Skill에 지불 의사가 생기는가?
- [ ] **2. 장기 구독을 높이는가?** — 잔존/LTV를 끌어올리는가(일회성 아님)?
- [ ] **3. API 원가를 통제 가능한가?** — Model Gateway·예산·ROI로 원가를 통제할 수 있는가?
- [ ] **4. 경쟁 우위가 있는가?** — 모방 난이도(특히 Brand Memory 해자)와 차별성이 있는가?

## 기본 구조 고려
- [ ] Hosted / BYOK / Credit 중 어떤 모드와 맞는가?
- [ ] (Skill인 경우) [ROI 분석](../specs/skill-lifecycle-spec.md) 임계를 통과할 전망인가?

## 사용법
신규 **Employee 직군** 또는 **Skill** 제안 시 이 체크리스트를 복사해 채운다. 결과는 [ADR](../adr/)로 남긴다.
Skill은 추가로 [Skill 라이프사이클](../specs/skill-lifecycle-spec.md)의 4단계(ROI 분석) 게이트를 거친다.

## 예시 — Brand Memory (통과)
| 질문 | 판정 |
|---|---|
| 결제 이유 | ✅ 회사 맥락이 쌓일수록 직원 결과 품질↑ → 지불 가치 |
| 장기 구독 | ✅ 축적될수록 이탈 비용↑ (강력한 해자) |
| 원가 통제 | ✅ 저장/조회는 저비용, 모델 호출은 Gateway 경유 |
| 경쟁 우위 | ✅ 누적 데이터는 모방 난이도 높음 |
→ **진행.**

## 예시 — "모두에게 동일한 만능 Skill" (탈락)
| 질문 | 판정 |
|---|---|
| 경쟁 우위 | ❌ 차별성 없음 + SKILL_OS 헌법(직원별 적합도 배포) 위반 |
→ **기각.**
