# 04 — Matching Engine

> 헌법: "Skill은 직원별 적합도를 계산하여 배포한다. 모든 직원에게 동일한 Skill을 적용하지 않는다."

Matching Engine은 (Employee × SkillVersion) 적합도(fit score)를 계산해
**누구에게 어떤 Skill을 배포할지**를 결정하는 컴포넌트다. Atlas의 "차별적 능력 배포"를 강제한다.

## 입력 / 출력

```
입력:  EmployeeProfile (role, traits, strengths, certifications)
       SkillVersion (category, fit_signals, requires_memory, cost_profile)
       BrandMemory 가용성 (직원의 memory_scope가 요구 메모리를 커버하는가)
출력:  fit_score ∈ [0,1]  +  사유(explainable breakdown)
       → 임계 이상이면 추천(Recommendation), 배포 시 SkillAssignment 생성
```

## 적합도 점수 (v0 제안 — 설명 가능 가중합)

| 신호 | 설명 | 가중치(초안) |
|---|---|---|
| Role match | Skill의 대상 역할 ↔ 직원 역할 | 0.35 |
| Trait/Strength match | fit_signals ↔ 직원 특성 | 0.25 |
| Memory readiness | requires_memory ⊆ employee.memory_scope | 0.20 |
| Track record | 유사 Skill에서의 과거 성과(measurement) | 0.15 |
| Cost fit | cost_profile ↔ 직원/브랜드 예산 여유 | 0.05 |

> v0는 의도적으로 **규칙 기반·설명 가능**. 임베딩/학습 기반 랭킹은 데이터가 쌓인 뒤(Sprint 후속) 도입.
> 결정은 ADR로 남긴다.

## 핵심 규칙

1. **임계값 게이트.** `fit_score < threshold` 직원에게는 배포하지 않는다(헌법 강제).
2. **설명 가능성.** 모든 점수는 신호별 분해를 함께 반환 → 운영자 콘솔에서 사유 표시.
3. **재평가.** 직원 인증/성과가 갱신되면 영향받는 Assignment를 재계산.
4. **비용 인지.** 예산이 부족한 직원에게는 고비용 Skill 적합도를 낮춘다(Cost Control 연동).

## 인터페이스 (개념)

```ts
// packages/matching-engine (이번 Sprint 미구현 — 시그니처 초안)
computeFit(employee: EmployeeProfile, skill: SkillVersion, ctx: MatchContext): FitResult
// FitResult = { score: number; breakdown: Record<Signal, number>; eligible: boolean }
```

## 연동
- 추천 단계에서 [Skill OS](03-skill-os.md) 라이프사이클 4단계를 구동.
- 예산 신호는 [Cost Control](05-cost-control.md)에서 가져온다.
