# AI Business Diagnosis Specification

> 근거: [헌법 개정 #004](../constitution/AMENDMENT-004-ai-cofounder-onboarding.md) §3 · [Onboarding Architecture](../architecture/07-onboarding-architecture.md)
> Atlas는 **회사보다 사업을 먼저 진단**한다. 진단은 Company 생성 *이전* 단계다.

## 1. 목적
온보딩 컨설팅 응답을 분석해 "지금 이 사업에 무엇이 먼저 필요한가"를 진단한다.
이 진단이 [조직 추천](org-recommendation-spec.md)과 [회사 설계](company-creation-flow-spec.md)의 입력이 된다.

## 2. 입력 (온보딩 응답)
| 항목 | 예 |
|---|---|
| 업종 industry | 카페 |
| 사업 단계 stage | 창업 / 초기 성장 / 안정화 / 확장 / 프랜차이즈 |
| 직원 수 employees | 3 |
| 월 매출 revenue (선택) | — |
| 온라인 운영 online | true/false |
| 브랜드 보유 brand | true/false |
| 가장 시간을 많이 쓰는 업무 timeSink | "재고/발주" |
| 가장 해결하고 싶은 문제 problem | "신규 고객 유입" |
| 가장 성장시키고 싶은 분야 grow | "온라인 매출" |

## 3. 출력 (진단)
```yaml
diagnosis:
  id: dg_01
  priorities:                  # 우선순위 있는 처방
    - focus: operations
      reason: "직원 수 대비 운영 부하(재고/발주)가 병목"
    - focus: marketing
      reason: "신규 고객 유입 문제 → 수요 창출 필요(단, 운영 안정 후)"
  firstBuild: operations       # 가장 먼저 만들 것
  rationale: ["지금은 마케팅보다 운영 체계를 먼저 만드는 것이 좋습니다."]
  recommendedStage: 초기 성장
```
- **설명 가능**: 모든 처방은 `reason`/`rationale`을 동반.
- 예: "CS 직원보다 콘텐츠 직원이 우선" 같은 *상대적 우선순위*를 제시.

## 4. 진단 모델 v0 (규칙 기반)
신호 → 처방 규칙의 집합(확장 가능).
```
timeSink=운영/재고      → operations 우선
problem=신규 고객 유입   → marketing 가중
grow=온라인 매출 & online=false → 온라인 채널 구축 가중
brand=false             → 브랜드/보이스 정립(콘텐츠) 가중
stage=창업              → 핵심 운영 1개에 집중(과확장 경고)
```
> v0는 규칙·가중 기반·설명 가능. 데이터 축적 후 학습 기반 진단(v1)은 별도 ADR.

## 5. 불변식
1. 진단은 Company 생성 전에 수행되며 실제 객체를 만들지 않는다(분석 산출물).
2. 모든 처방은 사유 동반(설명 가능성).
3. 진단 결과는 추천/설계의 입력이며, 최종 채택은 대표 승인을 거친다.

## 관련
- [Customer Journey](customer-journey-spec.md) · [Org Recommendation](org-recommendation-spec.md) · [Company Creation Flow](company-creation-flow-spec.md)
