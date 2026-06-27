# 05 — Cost Control

> 헌법: "비용 통제 우선" (ATLAS) · "API 원가를 통제 가능한가" (BUSINESS).
> Cost Control은 부가기능이 아니라 **1급 아키텍처 요구사항**이다.

## 원칙

1. **모든 모델 호출은 Model Gateway를 통과한다.** 앱/Skill이 제공자 SDK를 직접 호출하지 않는다.
2. **실행 전 예산 체크 → 실행 → 미터링 기록**의 3단계를 모든 Run이 거친다.
3. **세 가지 과금 모드를 1일차부터 추상화한다**: Hosted / BYOK / Credit.

## 과금 모드 (BUSINESS_CONSTITUTION 기본 구조)

| 모드 | 설명 | 원가 주체 | 우리 수익 | 리스크 |
|---|---|---|---|---|
| **Hosted** | Atlas가 모델 운영, 사용량을 Credit으로 차감 | Atlas | 마진 + 구독 | 원가 변동 노출 → 미터링·상한 필수 |
| **BYOK** | 고객이 자기 API 키 사용 | 고객 | 플랫폼 구독료 | 원가 무노출, 키 보안 관건 |
| **Credit** | 선불 크레딧 차감 | 고객(선불) | 선불 + 마진 | 잔액/소진 UX 필요 |

> 세 모드는 동일한 `billing_mode` 추상화 뒤에 둔다. 직원/브랜드/고객 단위로 모드 혼합 가능.

## Model Gateway (추상화 레이어)

```
Skill/Orchestrator ──> Model Gateway ──> [routing] ──> Provider
                            │
                            ├─ budget check (Budget.spent < limit?)
                            ├─ provider/model 선택 (cost_profile + 가용성)
                            ├─ 호출 실행
                            └─ CostLedger 기록 (tokens, cost, billing_mode)
```

- **Provider-agnostic**: 특정 AI 제공자 종속 금지. 교체/추가가 Gateway 설정 변경으로 끝나야 함.
- 이번 Sprint에는 **인터페이스만 정의**(구현 금지 — AI API 연동은 범위 밖).

## 예산(Budget)

- 스코프: `employee` / `brand` / `customer`. 기간: 일/월.
- 초과 시 정책: 차단(block) · 경고(warn) · 다운시프트(저비용 모델로 강등) 중 택1(직원별 설정).
- Matching Engine은 예산 여유를 적합도 신호로 사용([04](04-matching-engine.md)).

## 미터링 & 가시성

- 모든 Run → `CostLedger` 1행. 제공자·모델·토큰·비용·모드 기록.
- Operator Console에 원가 대시보드(직원별/Skill별/브랜드별) — 운영자 복잡성 수용.
- 고객 포털에는 단순한 Credit 잔액/사용량만 — 단순성 유지.

## 이번 Sprint 경계
정의: 도메인 모델(`Budget`, `CostLedger`), Model Gateway **인터페이스**, 과금 모드 추상화.
미구현: 실제 제공자 호출, 결제/청구 연동(둘 다 Sprint 범위 밖).
