# Employee Readiness & Confidence Specification

> 근거: [ATLAS MEMO #009](../adr/0011-trust-first-quality-boundary.md) §2·§3
> 직원마다 **업무 수행 준비도**가 있어야 하고, 결과물 생성 전 **신뢰도/준비도**를 내부 판단한다.

## 1. Employee Readiness (준비도 체크리스트)
직군별로 "이 직원이 일하기 위해 갖춰야 할 정보" 목록. 보유율이 준비도 점수가 된다.

| 직군 | 준비도 항목 |
|---|---|
| **Writer** (content) | 브랜드 말투 · 상품 정보 · 금지 표현 · 기존 콘텐츠 · 고객층 |
| **Designer** (design) | 로고 · 브랜드 컬러 · 제품 이미지 · 디자인 레퍼런스 · 금지 스타일 |
| **CS** (support) | FAQ · 응대 톤 · 환불/교환 정책 · 자주 묻는 질문 |

> 항목은 데이터로 확장 가능(직군 추가 시 목록만 추가).

## 2. Readiness Score
```
readinessScore = (보유 항목 수 / 필수 항목 수) × 100
```
누락 항목은 [정보 요청](quality-boundary-spec.md)의 대상이 된다.

## 3. Confidence Threshold (결과물 등급)
직원은 결과물 생성 전 신뢰도(readiness + 업무 적합도)를 산출하고 다음으로 분기한다:

| 신뢰도 | 결과물 | 동작 |
|---|---|---|
| **≥ 90** | `final` 최종본 | 생성 |
| **70 – 89** | `draft` 초안 | 생성하되 "초안" 표기 |
| **< 70** | `info_request` | 결과물 대신 부족 자료 요청 |

> 고객에게 점수를 복잡하게 보여줄 필요는 없다. **내부 구조에는 반드시** 존재한다(Operator HQ에서 확인).

## 4. 데이터 (개념)
```yaml
readinessAssessment:
  employeeId: emp_01
  roleFamily: content
  required: [brand-voice, product-info, banned-terms, past-content, audience]
  present:  [brand-voice, product-info]
  score: 40
  level: info_request          # <70
  missing: [banned-terms, past-content, audience]
```

## 5. 구현 (이번 — 순수 helper)
`packages/quality`:
- `assessConfidence(score)` → `final | draft | info_request`
- `computeReadiness(present, required)` → `{ score, missing, level }`
- 직군별 READINESS 체크리스트 데이터.
실제 결과물 생성/Work Loop는 **Sprint 2B**.

## 관련
- [Quality Boundary](quality-boundary-spec.md) · [Output Scope](output-scope-spec.md) · [Employee DNA](employee-dna-spec.md)
