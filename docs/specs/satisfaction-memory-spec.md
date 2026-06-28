# Satisfaction Memory & Outcome Feedback Specification

> 근거: [ATLAS MEMO #009](../adr/0011-trust-first-quality-boundary.md) §7
> 결과물 이후 **만족도 데이터**를 받을 수 있어야 한다. 후기용이 아니라 **학습/의사결정 연료**다.

## 1. 즉시 만족도 (결과물 직후)
| 항목 | 형태 |
|---|---|
| 전체 만족도 | 1–5 |
| 브랜드다움 | 1–5 |
| 유용성 | 1–5 |
| 다시 사용할 의향 | 1–5 |
| 한 줄 피드백 | text |

## 2. Outcome Feedback (7일 후, 선택)
"이 결과물이 실제로 도움이 되었나요?" → `시간 절약 / 문의 증가 / 매출 증가 / 별 효과 없음`.

## 3. 데이터 (개념)
```yaml
satisfactionFeedback:
  runId: run_01
  overall: 5
  onBrand: 4
  usefulness: 5
  willReuse: 5
  comment: "톤이 딱 맞았어요"
outcomeFeedback:
  runId: run_01
  daysAfter: 7
  outcome: 문의 증가
```

## 4. 데이터 사용처 (후기용 아님)
- 직원 교육(AI University) · Skill 개선/신규 Skill 개발(Research Lab)
- 유료 서비스화 판단 · 직원 추천 알고리즘 개선([Matching](skill-matching-engine-spec.md))
- Operator HQ 데이터 자산(해자)

→ 결과물 성과는 [Performance/Health 롤업](company-health-spec.md)과 [성장 루프](employee-dna-spec.md)에 환류(2B).

## 5. 구현 (이번)
타입(`SatisfactionFeedback`/`OutcomeFeedback`) + 수집 구조 정의. **수집 UI·학습 환류는 Sprint 2B**.

## 관련
- [Quality Boundary](quality-boundary-spec.md) · [Output Scope](output-scope-spec.md) · [Monetization](../business/monetization.md)
