# Quality Boundary Specification (Trust First)

> 근거: [ATLAS MEMO #009](../adr/0011-trust-first-quality-boundary.md) §1·§8
> **Atlas는 모든 결과물을 만드는 서비스가 아니라, 신뢰할 수 있는 결과만 제공하는 서비스다.**

## 1. 원칙 — 결과물 강제 생성 금지
직원은 다음 상황에서 **결과물을 억지로 만들지 않는다**:
- 보유 정보 부족 · 브랜드 이해도 낮음 · 필수 자료 없음 · 업무 범위 이탈

→ 대신 **필요한 정보를 요청**한다(정보 요청 상태).

## 2. 결과물 상태 (Output State)
| 상태 | 의미 | 조건 |
|---|---|---|
| `final` | 최종본 | 준비도/신뢰도 충분(≥90) |
| `draft` | 초안 | 부분 충족(70–89) |
| `info_request` | 정보 요청 | 부족(<70) — 결과물 대신 자료 요청 |
| `out_of_scope` | 범위 이탈 | 업무가 직원/Skill 범위를 벗어남 → 직원 추천([업셀](employee-recommendation-upsell-spec.md)) |

상세 임계: [Employee Readiness & Confidence](employee-readiness-spec.md).

## 3. 정보 요청 형태 (예시)
```
대표님, 현재 광고 이미지를 제작하기에는 정보가 부족합니다.
Designer Employee가 아래 자료를 확인해야 합니다.
 - 제품 이미지 / 브랜드 컬러 / 참고 디자인 / 금지·선호 표현
자료가 준비되면 브랜드에 맞는 결과물을 제작할 수 있습니다.
```

## 4. Trust First — 금지 / 원칙
**금지**: 정보 부족 상태 추측 · 브랜드 학습 없이 최종본 제공 · "모든 업무를 다 해준다" 표현 · 과한 기대 유발 문구.
**원칙**: 확실한 것만 한다 · 모르면 묻는다 · 부족하면 요청한다 · 준비되면 실행한다 · 결과 후 평가받고 성장한다.

## 5. 고객 노출 vs 내부
- 고객: "초안입니다 / 자료가 필요합니다" 수준으로 단순·정직하게.
- 내부: 준비도·신뢰도 점수·누락 항목을 기록(Operator HQ).

## 6. Sprint 2B 영향
모든 결과물 생성 경로는 **생성 전 Quality Boundary 게이트**(Readiness→Confidence)를 통과해야 한다.
게이트 미통과 시 결과물 대신 `info_request`/`draft`를 반환.

## 관련
- [Employee Readiness](employee-readiness-spec.md) · [Output Scope](output-scope-spec.md) · [Satisfaction Memory](satisfaction-memory-spec.md)
