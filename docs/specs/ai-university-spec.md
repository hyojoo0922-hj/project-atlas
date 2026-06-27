# AI University Specification

> 근거: [헌법 개정 #001](../constitution/AMENDMENT-001-ai-employee-ecosystem.md) §6
> 생태계 기관 ②. **직원을 교육하고 시험**하는 교육 조직.

## 1. 역할
AI University는 Matching Engine이 추천한 직원에게 Skill을 **가르치고(교육), 평가(시험)**한다.
직원의 [Training History](employee-dna-spec.md)를 만들고, 합격자를 [Certification System](certification-system-spec.md)으로 보낸다.

```
[ University 담당 구간 ]
(Research Lab/Matching 인계) ──▶ 교육 → 시험 ──▶ (합격 시 Certification으로)
```

## 2. 책임 단계 (Skill Lifecycle 6~7)
| 단계 | 활동 | 산출 |
|---|---|---|
| **교육 Training** | 대상 직원에 Skill 맥락·예시·가이드 주입 | `TrainingRecord` (이력 누적) |
| **시험 Test** | 평가셋(eval_set)으로 성능·안전 측정 | `TestResult` (점수·합격여부) |

## 3. 교육 모델
- **직원별 맞춤.** 같은 Skill이라도 직원의 DNA(traits)·기존 성과에 따라 교육 강도/예시를 조정.
- **Brand Memory 연동.** 교육은 해당 브랜드 기억(voice/product 등)을 컨텍스트로 사용.
- **반복 가능.** 불합격 시 재교육(retrain) 루프.

## 4. 시험(평가) 모델
- 평가셋은 Skill 자산에 동봉(eval_set). Research Lab이 초안, University가 운영.
- 합격 기준: 성능 임계 + 안전 위반 0 + (해당 시) 비용 임계.
- 결과는 Performance History의 baseline으로도 기록.

## 5. Sprint 범위
Sprint 1: `TrainingRecord`/`TestResult` 데이터 모델 + 상태 표현(실제 모델 호출 없음, mock 평가).
실제 평가 실행은 Sprint 2+(Model Gateway 실연동 이후).

## 관련
- 입력(직원 추천): [Skill Matching Engine](skill-matching-engine-spec.md)
- 다음 인계: [Certification System](certification-system-spec.md)
