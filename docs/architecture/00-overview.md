# 00 — 아키텍처 개요 (System Overview)

> CTO 영역. 헌법([constitution](../constitution/))을 구현 가능한 시스템으로 번역한 문서.

## 1. 한 문장 정의

Project Atlas는 **AI 직원(Employee)** 이 **Brand Memory**(회사의 기억)를 읽고,
**자신에게 적합도(fit)가 높은 Skill**을 사용해, **예산(Cost Control) 안에서** 고객의 업무를 수행하게 하는 운영체제다.

## 2. 핵심 도메인 모델 (개념)

```
Customer ──owns──> Brand ──has──> BrandMemory (영속 기억)
                     │
                     ├──hires──> Employee (AI 직원 = 페르소나 + 역할 + 가드레일 + 예산)
                     │              │
                     │              └──assigned──> SkillAssignment (적합도 점수 포함)
                     │                                   │
Skill Library ──catalog──> Skill ──versions──> SkillVersion ──(lifecycle)──┘
                                                   │
Task/Run ──executes──> SkillVersion ──meters──> CostLedger
```

- **Employee**: 도구가 아니라 "직원". 역할(role), 페르소나, 접근 가능한 Brand Memory 범위, 가드레일, 예산을 가진다.
- **Skill**: 직원이 *습득*하는 능력. 모든 직원에게 일괄 적용하지 않고, Matching Engine이 적합도를 계산해 배포.
- **Brand Memory**: 직원이 바뀌어도 남는 회사의 기억. Atlas의 진짜 해자(moat).

## 3. 3개의 핵심 서브시스템

### (A) Brand Memory — 공유 기억
- 브랜드 보이스, 제품/서비스, 자산, 정책, 과거 산출물, 의사결정 이력을 구조화·버전관리하여 저장.
- 모든 직원이 읽고, 인증된 직원만 쓴다(write).
- 상세: [`02-data-model.md`](02-data-model.md)

### (B) Skill Library — 능력 카탈로그
- Skill의 정의·버전·라이프사이클 상태(발견→…→배포→성과측정)를 관리.
- Sandbox에서 검증·시험·인증을 거친 SkillVersion만 배포 가능.
- 상세: [`03-skill-os.md`](03-skill-os.md)

### (C) Matching Engine — 적합도 배포
- (Employee × Skill) 적합도 점수를 계산하여 *맞는 직원에게만* 배포.
- "모두에게 같은 Skill을 주지 않는다"는 SKILL_OS 헌법의 핵심을 강제하는 컴포넌트.
- 상세: [`04-matching-engine.md`](04-matching-engine.md)

## 4. 지원 서브시스템

| 서브시스템 | 역할 | 헌법 근거 |
|---|---|---|
| **Orchestrator** | 업무(Task) → 직원 → Skill 실행 라우팅, 가드레일 강제 | PRODUCT (회사 운영 경험) |
| **Cost Control** | 예산·미터링·모델 라우팅(Hosted/BYOK/Credit) | BUSINESS (원가 통제) |
| **Operator Console** | 운영자용 — 복잡성 수용 (직원/Skill/예산 관리) | PRODUCT (복잡성은 운영자에게) |
| **Customer Portal** | 고객용 — 단순함 (직원에게 업무 위임) | PRODUCT (단순함은 고객에게) |

상세: [`05-cost-control.md`](05-cost-control.md), [`06-security.md`](06-security.md)

## 5. 레이어드 아키텍처 (개념도)

```
┌─────────────────────────────────────────────────────────────┐
│  Experience Layer                                            │
│   Customer Portal (단순)      Operator Console (복잡)         │
└───────────────┬─────────────────────────┬───────────────────┘
                │                          │
┌───────────────▼──────────────────────────▼──────────────────┐
│  Orchestration Layer                                         │
│   Task Router · Guardrails · Run Lifecycle                   │
└───────┬───────────────┬───────────────┬──────────────────────┘
        │               │               │
┌───────▼─────┐ ┌───────▼───────┐ ┌─────▼─────────┐  ┌──────────┐
│ Brand Memory│ │ Skill Library │ │ Matching      │  │ Cost     │
│             │ │ + Skill OS    │ │ Engine        │  │ Control  │
└───────┬─────┘ └───────┬───────┘ └─────┬─────────┘  └────┬─────┘
        │               │               │                 │
┌───────▼───────────────▼───────────────▼─────────────────▼─────┐
│  Foundation Layer                                            │
│   Data Store · Model Gateway(추상화) · Audit/Telemetry        │
└─────────────────────────────────────────────────────────────┘
```

> **Model Gateway**는 의도적인 추상화 레이어다. 특정 AI 제공자에 종속되지 않고
> Hosted/BYOK 라우팅과 원가 미터링을 한 곳에서 강제하기 위함. (이번 Sprint 구현 안 함)

## 6. 설계 원칙 (CTO)

1. **Provider-agnostic.** 모든 모델 호출은 Model Gateway를 통과한다. 직접 SDK 호출 금지.
2. **Cost-by-design.** 모든 실행 경로는 예산 체크 → 실행 → 미터링 기록을 거친다.
3. **Memory as moat.** 산출물보다 *축적된 맥락*이 자산. Brand Memory는 손실 없이 버전관리.
4. **Per-employee, not global.** 능력 배포는 항상 적합도를 거친다.
5. **Operator complexity, customer simplicity.** 두 경험을 물리적으로 분리(`apps/`).

## 관련 문서
- 데이터 모델: [`02-data-model.md`](02-data-model.md)
- Skill OS: [`03-skill-os.md`](03-skill-os.md)
- Matching: [`04-matching-engine.md`](04-matching-engine.md)
- Cost: [`05-cost-control.md`](05-cost-control.md)
- Security: [`06-security.md`](06-security.md)
- 기술 스택 결정: [`../adr/0003-tech-stack.md`](../adr/0003-tech-stack.md)
