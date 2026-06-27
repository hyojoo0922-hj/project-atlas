# 수익 모델 (Monetization)

> 헌법: [BUSINESS_CONSTITUTION](../constitution/BUSINESS_CONSTITUTION.md) — Hosted/BYOK/Credit 기본 구조.

## 핵심 명제
고객은 "AI 사용량"이 아니라 **"AI 직원의 고용"**에 지불한다. → 좌석/구독 + 사용량의 결합.

## 3가지 과금 모드

| 모드 | 과금 방식 | 적합 고객 | 우리 수익원 | 원가 통제 |
|---|---|---|---|---|
| **Hosted** | 구독 + Credit 차감 | 손 안 대고 맡기려는 고객 | 마진 + 구독 | 미터링·예산 상한 필수 |
| **BYOK** | 플랫폼 구독료(좌석) | 자체 API 키/규정 있는 고객 | 구독료 | 원가 무노출(고객 부담) |
| **Credit** | 선불 크레딧 | 변동 사용·실험 고객 | 선불 + 마진 | 잔액 소진으로 자연 상한 |

## 가격 레버 (가설)
- **직원 수(좌석)**: "직원을 더 고용" = 구독 확대. LTV의 핵심.
- **Employee Upgrade**: 직원이 인증·성과로 성장 → 상위 등급 직원으로 가치 상승.
- **Brand Memory 용량/이력**: 축적이 깊을수록 이탈 비용↑(해자).
- **Skill 등급/인증 Skill**: 고급·인증 Skill을 프리미엄으로(자산 가치).
- **Credit 사용량**: Hosted의 변동 수익.

## 헌법 게이트와의 연결
모든 신규 **Employee(직군)·Skill**은 [Employee/Skill 게이트](employee-skill-gate.md) 4종 + (Skill은) [ROI 분석](../specs/skill-lifecycle-spec.md)을 통과해야 가격에 편입.

## 이번 Sprint 경계
모델만 정의. **결제/청구 연동은 구현하지 않음.** Credit/Budget은 데이터 모델로만 존재.
