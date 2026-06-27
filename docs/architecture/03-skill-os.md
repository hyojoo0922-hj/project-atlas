# 03 — Skill OS

> 헌법: [SKILL_OS_CONSTITUTION](../constitution/SKILL_OS_CONSTITUTION.md)
> "Skill은 직원별 적합도를 계산하여 배포한다. 모든 직원에게 동일한 Skill을 적용하지 않는다."

Skill OS는 Atlas의 능력 공급망(supply chain)이다. 외부/내부에서 발견된 능력을
검증·인증하여 *적합한 직원에게만* 안전하게 배포한다.

## 라이프사이클 (9단계)

| # | 단계 | 무엇을 하는가 | 산출/게이트 |
|---|---|---|---|
| 1 | **발견 Discovery** | 새 Skill 후보 수집 (내부 요청·외부 패턴) | Skill 후보 등록 |
| 2 | **분석 Analysis** | 가치·원가·리스크 분석 | BUSINESS 게이트 4종 통과 여부 |
| 3 | **Sandbox** | 격리 환경에서 안전 실행 검증 | 부작용 없음·권한 경계 확인 |
| 4 | **추천 Recommendation** | Matching Engine이 적합 직원 후보 산출 | fit_score 임계 통과 직원 목록 |
| 5 | **교육 Training** | 대상 직원에 맥락/예시 주입 | 학습 데이터·프롬프트 세트 |
| 6 | **시험 Test** | 평가 셋으로 성능·안전 측정 | 합격 기준 충족 |
| 7 | **인증 Certification** | 통과 시 SkillVersion 인증 | `certified` 상태 전환 |
| 8 | **배포 Deployment** | 인증된 직원에게 SkillAssignment 생성 | 운영 투입 |
| 9 | **성과측정 Measurement** | 실제 성과·원가 추적, 피드백 루프 | 재학습/회수 결정 |

```
discovered → analyzed → sandboxed → recommended → trained → tested → certified → deployed → measured
     └────────────────────────── feedback loop ──────────────────────────┘
```

## 상태 머신 (SkillVersion.lifecycle_state)

- 전진은 게이트 통과 시에만. 실패 시 직전 단계로 회귀하거나 `rejected`.
- `deployed` 이후 성과 미달 → `measured`에서 **회수(revoke)** 또는 **재교육(retrain)**.
- 모든 전이는 `AuditEvent`로 기록.

## 분석 단계의 BUSINESS 게이트 (필수)

새 Skill은 [BUSINESS_CONSTITUTION](../constitution/BUSINESS_CONSTITUTION.md) 4종을 통과해야 진행한다:
1. 고객이 결제할 이유가 있는가?
2. 장기 구독을 높이는가?
3. API 원가를 통제 가능한가?
4. 경쟁 우위가 있는가?

→ 체크리스트: [`../business/feature-gate.md`](../business/feature-gate.md)

## Skill 매니페스트 (개념 형태)

```yaml
# skills/<skill-name>/skill.yaml  (예시 — 이번 Sprint 미구현)
name: brand-voice-writer
version: 0.1.0
category: content
lifecycle_state: discovered
requires_memory: [voice, product]        # 읽어야 하는 Brand Memory kind
guardrails: [no-pii-export, budget-aware]
fit_signals: [role:writer, trait:creative] # Matching Engine 입력
cost_profile: { tier: standard }           # Cost Control 라우팅 힌트
```

## 경계
- Sandbox 격리·실제 실행 엔진은 [Orchestrator](00-overview.md#4-지원-서브시스템)와 [Cost Control](05-cost-control.md)에 의존.
- 적합도 산출 로직은 [Matching Engine](04-matching-engine.md).
