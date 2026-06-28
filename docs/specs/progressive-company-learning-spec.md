# Progressive Company Learning & Employee-Specific Onboarding

> 근거: [ATLAS MEMO #009](../adr/0011-trust-first-quality-boundary.md) §4·§5
> 가입 단계에서 모든 정보를 받지 않는다. **직원이 필요해서 묻는 구조** — 고객이 긴 설문을 쓰지 않는다.

## 1. 점진 학습 흐름 (Progressive Learning)
```
대표 계정 생성
→ 최소 진단 정보 (무료, 직원 추천에 필요한 것만)
→ 직원 추천
→ 직원 채용 (유료)
→ 해당 직원의 온보딩 질문 (그 직원이 필요로 하는 자료만)
→ 업무 중 부족 정보 요청 ([Quality Boundary](quality-boundary-spec.md))
→ 결과물 생성
→ 만족도 피드백 ([Satisfaction Memory](satisfaction-memory-spec.md))
→ 직원 학습 (성장 루프)
```
- 무료: 진단 최소 정보만([AI Business Diagnosis](ai-business-diagnosis-spec.md) 입력).
- 유료: **채용된 직원이 실제로 일하기 위해 필요한 정보만 단계적으로** 요청.

## 2. Employee-Specific Onboarding (직군별 질문)
직원이 채용되면 자신에게 필요한 자료만 요청한다.

| 직원 | 온보딩 질문(요청 자료) |
|---|---|
| **Writer Employee** | 브랜드 말투 · 대표 상품 · 고객층 · 기존 콘텐츠 · 금지 표현 |
| **Designer Employee** | 로고 · 브랜드 컬러 · 제품 이미지 · 디자인 레퍼런스 · 금지 스타일 |
| **CS Employee** | FAQ · 응대 톤 · 환불/교환 정책 · 자주 묻는 질문 |

> 직군별 질문 세트는 데이터로 확장. 수집된 자료는 [Brand Memory](../architecture/02-data-model.md)(Company 스코프)에 축적되어 [Readiness](employee-readiness-spec.md)를 높인다.

## 3. 원칙
- 가입 마찰 최소화: "필요할 때, 필요한 직원이, 필요한 만큼" 묻는다.
- 수집 자료 → Brand Memory 축적 → 직원 Readiness↑ → 결과 품질↑ (선순환).

## 4. 구현 (이번)
직군별 온보딩 질문 세트 데이터(`packages/quality`) + 타입. 실제 단계적 수집 UI/Work Loop는 **Sprint 2B**.

## 관련
- [Quality Boundary](quality-boundary-spec.md) · [Employee Readiness](employee-readiness-spec.md) · [Customer Journey](customer-journey-spec.md)
