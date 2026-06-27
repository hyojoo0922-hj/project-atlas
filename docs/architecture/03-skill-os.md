# 03 — Skill OS

> 헌법: [SKILL_OS_CONSTITUTION](../constitution/SKILL_OS_CONSTITUTION.md)
> "Skill은 직원별 적합도를 계산하여 배포한다. 모든 직원에게 동일한 Skill을 적용하지 않는다."

Skill OS는 Atlas의 능력 공급망(supply chain)이다. 외부/내부에서 발견된 능력을
검증·인증하여 *적합한 직원에게만* 안전하게 배포한다.
**Skill은 프롬프트가 아니라 자산**이다(개정 #001). 정밀 설계: [Skill Lifecycle Spec](../specs/skill-lifecycle-spec.md).

## 라이프사이클 (10단계 — ROI 분석 추가)

| # | 단계 | 무엇을 하는가 | 운영 주체 | 산출/게이트 |
|---|---|---|---|---|
| 1 | **발견 Discovery** | Skill 후보 수집 | [Research Lab](../specs/ai-research-lab-spec.md) | 후보 등록 |
| 2 | **분석 Analysis** | 가치·원가·리스크 분석 | Research Lab | [Employee/Skill 게이트](../business/employee-skill-gate.md) 4종 |
| 3 | **Sandbox** | 격리 환경 안전 실행 검증 | Research Lab | 부작용 없음·권한 경계 |
| 4 | **ROI 분석** ⭐신규 | 가치 대비 원가(ROI) 정량 판단 | Research Lab + [Cost Control](05-cost-control.md) | ROI 임계(go/hold/kill) |
| 5 | **직원 추천 Recommendation** | 적합 직원 후보 산출 | [Matching Engine](../specs/skill-matching-engine-spec.md) | fit_score 임계 통과 |
| 6 | **교육 Training** | 대상 직원에 맥락/예시 주입 | [AI University](../specs/ai-university-spec.md) | TrainingRecord |
| 7 | **시험 Test** | 평가셋으로 성능·안전 측정 | AI University | 합격 기준 충족 |
| 8 | **인증 Certification** | 통과 시 인증 발급 | [Certification System](../specs/certification-system-spec.md) | `certified` 전환 |
| 9 | **배포 Deployment** | 인증 직원에 SkillAssignment | [Operator HQ](../specs/operator-hq-spec.md) | 운영 투입 |
| 10 | **성과측정 Measurement** | 실제 성과·ROI 추적, 피드백 | Operator HQ + Cost Control | 재학습/회수/Update |

```
discovered → analyzed → sandboxed → roi_evaluated → recommended → trained → tested → certified → deployed → measured
     └──────────────────────────────── feedback loop (재교육/회수/Skill Update) ────────────────────────────────┘
```

## 상태 머신 (SkillVersion.lifecycle_state)

- 전진은 게이트 통과 시에만. 실패 시 직전 단계로 회귀하거나 `rejected`.
- `roi_evaluated`에서 ROI 미달 → `killed`/`hold`.
- `deployed` 이후 성과 미달 → `measured`에서 **회수(revoke)** 또는 **재교육(retrain)** 또는 **Skill Update(신버전)**.
- 모든 전이는 `AuditEvent`로 기록.

## 분석 단계의 BUSINESS 게이트 (필수)

새 Skill은 [BUSINESS_CONSTITUTION](../constitution/BUSINESS_CONSTITUTION.md) 4종을 통과해야 진행한다:
1. 고객이 결제할 이유가 있는가?
2. 장기 구독을 높이는가?
3. API 원가를 통제 가능한가?
4. 경쟁 우위가 있는가?

→ 체크리스트: [`../business/employee-skill-gate.md`](../business/employee-skill-gate.md)

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
