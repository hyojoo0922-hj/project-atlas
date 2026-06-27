# Skill Lifecycle Specification

> 근거: [헌법 개정 #001](../constitution/AMENDMENT-001-ai-employee-ecosystem.md) · [SKILL_OS_CONSTITUTION](../constitution/SKILL_OS_CONSTITUTION.md)
> **Skill은 프롬프트가 아니라 플랫폼의 핵심 자산이다.** 본 문서는 Skill의 10단계 생애를 정의한다.

## 1. Skill = 자산 (Asset)
Skill은 버전·소유권·ROI·성과를 가진 **재사용 가능한 능력 자산**이다.
프롬프트는 Skill의 *구현 디테일 중 하나*일 뿐이다. Skill은 매니페스트·평가셋·인증·성과 기록을 동반한다.

## 2. 10단계 라이프사이클 (ROI 분석 추가)

```
발견 → 분석 → Sandbox → ROI 분석 → 직원 추천 → 교육 → 시험 → 인증 → 배포 → 성과 측정
                                                                              └── feedback ──┐
                                                                                              ↑
                                                              (재교육 / 회수 / Skill Update) ─┘
```

| # | 단계 | 운영 주체 | 게이트 / 산출 |
|---|---|---|---|
| 1 | **발견 Discovery** | [AI Research Lab](ai-research-lab-spec.md) | Skill 후보 등록 |
| 2 | **분석 Analysis** | AI Research Lab | [Employee/Skill 게이트](../business/employee-skill-gate.md) 4종 |
| 3 | **Sandbox** | AI Research Lab | 격리 실행·부작용/권한 검증 |
| 4 | **ROI 분석** ⭐신규 | AI Research Lab + [Cost Control](../architecture/05-cost-control.md) | 가치 대비 원가(ROI) 임계 통과 |
| 5 | **직원 추천 Recommendation** | [Matching Engine](skill-matching-engine-spec.md) | 적합 직원(fit≥임계) 목록 |
| 6 | **교육 Training** | [AI University](ai-university-spec.md) | 학습셋·온보딩 완료 |
| 7 | **시험 Test** | AI University | 평가셋 합격 |
| 8 | **인증 Certification** | [Certification System](certification-system-spec.md) | `certified` 전환 |
| 9 | **배포 Deployment** | [Operator HQ](operator-hq-spec.md) | 인증 직원에 SkillAssignment |
| 10 | **성과 측정 Measurement** | Operator HQ + Cost Control | 성과·ROI 추적 → 피드백 |

## 3. ROI 분석 (신규 단계 상세)
Sandbox에서 동작이 검증된 뒤, **배포 가치가 원가를 정당화하는지**를 정량 판단한다.
- 입력: 예상 사용 빈도, 단위 원가(Model Gateway 추정), 대체 효과(절감/매출 기여).
- 출력: `roi_score`, 권장 과금 모드(Hosted/BYOK/Credit), go/hold/kill.
- 게이트: ROI 임계 미달 시 라이프사이클 중단(kill) 또는 보류(hold).
- 헌법 정합: BUSINESS_CONSTITUTION "API 원가 통제 가능한가"를 *수치로* 강제.

## 4. 상태 머신 (SkillVersion.lifecycle_state)
`discovered → analyzed → sandboxed → roi_evaluated → recommended → trained → tested → certified → deployed → measured`
- 전진은 각 단계 게이트 통과 시에만. 실패 → 직전 단계 회귀 또는 `rejected`/`killed`.
- `deployed` 이후 성과 미달 → **회수(revoke)** 또는 **재교육(retrain)** 또는 **Skill Update**(새 버전).
- 모든 전이는 AuditEvent.

## 5. Skill 매니페스트 (개념)
```yaml
# skills/<name>/skill.yaml — Sprint 1에서 seed만 추가(실행코드 없음)
name: brand-voice-writer
version: 0.1.0
category: content
lifecycle_state: discovered
asset_owner: research-lab
requires_memory: [voice, product]
guardrails: [no-pii-export, budget-aware]
fit_signals: [role_family:content, trait:creative]
cost_profile: { tier: standard }
roi: { status: pending }          # ④ ROI 분석에서 채워짐
eval_set: ./evals/brand-voice.yaml # ⑦ 시험에 사용
```

## 6. Skill Update & 버전 관리
- Skill은 버전을 가진 자산 → 개선은 `SkillVersion` 신규 발행으로 처리(불변 이력).
- 배포된 직원에게 업데이트 전파 = **Employee Upgrade**의 트리거([Operator HQ](operator-hq-spec.md)).

## 관련
- 운영 주체 매핑: [Research Lab](ai-research-lab-spec.md) · [University](ai-university-spec.md) · [Certification](certification-system-spec.md) · [Operator HQ](operator-hq-spec.md)
- 아키텍처 요약: [../architecture/03-skill-os.md](../architecture/03-skill-os.md)
