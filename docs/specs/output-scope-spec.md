# Output Scope Specification

> 근거: [ATLAS MEMO #009](../adr/0011-trust-first-quality-boundary.md) §6
> 결과물 유형은 명확히 구분되어야 한다. **유형별로 필수 정보·예상 원가·필요 직원·필요 Skill·품질 기준이 다르다.**

## 1. 결과물 유형 (OutputType)
`text · document · image · video · ad_copy · report · social_post · product_page · customer_reply`

## 2. 유형별 사양 (v0 — 카페 기준 예시, 확장 가능)
| OutputType | 필수 정보 | 필요 직군 | 필요 Skill(예) | 예상 원가(상대) | 품질 기준 |
|---|---|---|---|---|---|
| `text` | 주제·톤 | content | brand-voice-writer | low | 초안 허용 |
| `ad_copy` | 브랜드 말투·상품·고객층 | content | brand-voice-writer | low | 최종본 ≥90 |
| `social_post` | 브랜드 말투·채널 | content | repurpose-to-channel | low | 초안 허용 |
| `product_page` | 상품 정보·이미지·정책 | content(+design) | brand-voice-writer | med | 최종본 ≥90 |
| `image` | 로고·브랜드 컬러·제품 이미지·레퍼런스 | design | image-create | high | 최종본 ≥90 |
| `video` | 스토리보드·브랜드 자산·레퍼런스 | design | video-create | very_high | 최종본 ≥90 |
| `document` | 목적·자료 | content/research | doc-writer | med | 초안 허용 |
| `report` | 데이터·기간·목표 | research | report-builder | med | 최종본 ≥90 |
| `customer_reply` | FAQ·응대 톤·정책 | support | inquiry-responder | low | 최종본 ≥90 |

> 원가는 [Cost Control](../architecture/05-cost-control.md)의 cost_profile/ROI와 연결(2B 실측).
> 필요 직군이 회사에 없으면 결과물 대신 [채용 추천(업셀)](employee-recommendation-upsell-spec.md).

## 3. 데이터 (개념)
```yaml
outputScope:
  type: ad_copy
  requiredInfo: [brand-voice, product-info, target-audience]
  requiredRoleFamilies: [content]
  requiredSkills: [brand-voice-writer]
  costTier: low
  qualityBar: final_ge_90      # 이 유형은 최종본 기준 90 이상
```

## 4. 게이트 연결
요청 업무 → OutputType 판정 → (a) [Staffing/업셀](employee-recommendation-upsell-spec.md)로 필요 직원 확인 →
(b) [Readiness/Confidence](employee-readiness-spec.md)로 final/draft/info_request 결정.

## 5. 구현 (이번)
`packages/quality`에 OUTPUT_SCOPE 레지스트리(데이터) + 조회 helper. 실제 생성은 **Sprint 2B**.

## 관련
- [Quality Boundary](quality-boundary-spec.md) · [Employee Readiness](employee-readiness-spec.md) · [Satisfaction Memory](satisfaction-memory-spec.md)
