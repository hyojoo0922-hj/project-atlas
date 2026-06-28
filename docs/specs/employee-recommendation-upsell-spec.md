# Employee Recommendation / Upsell Specification

> 근거: [ATLAS BUSINESS MEMO #008](../adr/0010-free-paid-boundary.md) §6 · [free-paid-boundary](../business/free-paid-boundary.md)
> **필요한 직원이 없으면 결과물을 만들지 않고 채용을 추천한다.** 자연스러운 업셀링이자 핵심 수익 모델.

## 1. 원칙
요청 업무가 요구하는 직원(직군)이 회사에 없으면:
- 결과물을 *억지로* 만들지 않는다.
- **부족한 직원을 추천**하고, 채용 시 가능한 결과 vs 미채용 시 한계를 명확히 보여준다.

## 2. 예시 (메모 #008)
```
대표 요청: "오늘 신메뉴 콘텐츠가 필요해."
Atlas:
 - 이번 업무에는 Writer Employee와 Designer Employee가 필요합니다.
 - 현재 회사에는 Writer만 있습니다.
 - Designer를 채용하면 이미지 포함 콘텐츠까지 제작할 수 있습니다.
 - 채용하지 않으면 텍스트 초안까지만 가능합니다.
```

## 3. 구조 (StaffingAnalysis)
```yaml
staffingAnalysis:
  requiredRoleFamilies: [content, design]    # 업무가 요구하는 직군
  presentRoleFamilies:  [content]            # 회사 보유
  missingRoleFamilies:  [design]             # 부족 → 채용 추천
  canPartial: true                           # 보유분으로 부분 수행 가능?
  upsellMessage: "Designer를 채용하면 …"
```
- `missing`이 있으면 → **채용 추천**(업셀링). `canPartial`이면 보유분으로 부분 산출 가능함을 안내.
- 순수(stateless) 분석: 실제 업무 실행·결과물 생성은 **하지 않는다**(2B의 Work Loop와 분리).

## 4. 수익 연결
- 채용 = 직원 추가 = 좌석/구독 확대 → [Monetization](../business/monetization.md).
- 무료 단계의 추천은 "필요 직원 확인"으로, 유료 전환 후 실제 채용으로 이어진다.

## 5. 범위
이번(메모 #008): 구조 정의 + **순수 분석 helper**(`packages/staffing`)와 계약 테스트만.
업무 실행·결과물·결과 보고(대표 비서 Work Loop)는 **Sprint 2B**.

## 관련
- [Owner Assistant](owner-assistant-spec.md) · [Org Recommendation](org-recommendation-spec.md) · [Skill Matching Engine](skill-matching-engine-spec.md)
