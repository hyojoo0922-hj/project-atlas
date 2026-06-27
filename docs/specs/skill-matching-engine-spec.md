# Skill Matching Engine Specification

> 근거: [헌법 개정 #001](../constitution/AMENDMENT-001-ai-employee-ecosystem.md)
> 헌법: "Skill은 직원별 적합도를 계산하여 배포한다. 모든 직원에게 동일한 Skill을 적용하지 않는다."

Matching Engine은 **(Employee × SkillVersion) 적합도**를 계산해 *누구에게 어떤 Skill을 배포할지*를
결정한다. Employee 중심 재정의에 따라 입력은 **Matching Profile**(DNA 파생)이다.

## 1. 입력 / 출력
```
입력:
  MatchingProfile  ← Employee DNA(genome+acquired) + Training + Certification + Performance
  SkillVersion     ← category, fit_signals, requires_memory, cost_profile, roi
  Context          ← Brand Memory 가용성, 예산 여유(Cost Control)
출력:
  FitResult { score ∈ [0,1], breakdown: 신호별 분해, eligible: bool, reasons[] }
```

## 2. 적합도 점수 v0 (규칙 기반·설명 가능)
| 신호 | 설명 | 가중치(초안) |
|---|---|---|
| Role family match | Skill 대상 역할 ↔ DNA role_family | 0.30 |
| Trait/Strength match | fit_signals ↔ acquired traits | 0.20 |
| Certification readiness | 요구 선행 인증 보유 여부 | 0.15 |
| Memory readiness | requires_memory ⊆ memory_scope | 0.15 |
| Track record | Performance History의 유사 Skill 성과 | 0.15 |
| Cost/ROI fit | cost_profile·roi ↔ 직원/브랜드 예산 여유 | 0.05 |

> v0는 의도적으로 규칙 기반. 데이터 축적 후 학습 기반 랭킹(v1)은 별도 ADR.

## 3. 핵심 규칙
1. **임계 게이트.** `score < threshold` → 배포 금지(헌법 강제).
2. **인증 선행.** 요구 certification 미보유 직원은 `eligible=false`.
3. **설명 가능성.** 모든 점수는 breakdown + reasons 동반 → [Operator HQ](operator-hq-spec.md)에서 사유 표시.
4. **재평가.** Training/Certification/Performance 갱신 시 영향 Assignment 재계산(Employee Upgrade 신호).
5. **비용 인지.** 예산 부족 직원은 고비용/저ROI Skill 적합도를 낮춘다.

## 4. 라이프사이클 연동
[Skill 라이프사이클](skill-lifecycle-spec.md) **5단계(직원 추천)**를 구동.
ROI 분석(4단계) 결과를 cost/ROI 신호로 사용.

## 5. 인터페이스 (개념 — Sprint 1 v0 구현 대상)
```ts
// packages/matching-engine
computeFit(profile: MatchingProfile, skill: SkillVersion, ctx: MatchContext): FitResult
recommendEmployees(skill: SkillVersion, pool: MatchingProfile[]): Recommendation[]
```

## 관련
- 입력 프로파일: [employee-dna-spec.md](employee-dna-spec.md)
- 아키텍처 요약: [../architecture/04-matching-engine.md](../architecture/04-matching-engine.md)
