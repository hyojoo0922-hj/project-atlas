# AI Research Lab Specification

> 근거: [헌법 개정 #001](../constitution/AMENDMENT-001-ai-employee-ecosystem.md) §6
> 생태계 기관 ①. Skill 자산을 **발굴·검증·평가**하는 R&D 조직.

## 1. 역할
AI Research Lab은 Skill 라이프사이클의 **앞단 4단계**를 담당한다.
새로운 능력을 찾아내고, 안전하게 실험하고, **돈이 되는지(ROI)** 판단해 생태계에 공급한다.

```
[ Research Lab 담당 구간 ]
발견 → 분석 → Sandbox → ROI 분석   ─────▶  (이후 University/Certification/HQ로 인계)
```

## 2. 책임 단계 (Skill Lifecycle 1~4)
| 단계 | 활동 | 게이트 |
|---|---|---|
| **발견** | 내부 요청·외부 패턴·반복 업무에서 Skill 후보 수집 | 후보 등록 |
| **분석** | 가치·리스크·실현가능성 분석 | [Employee/Skill 게이트](../business/employee-skill-gate.md) 4종 |
| **Sandbox** | 격리 환경 실험: 부작용·권한·안전 검증 | 안전 통과 |
| **ROI 분석** | 사용빈도×단위원가 vs 절감/매출 → roi_score | ROI 임계 통과(go/hold/kill) |

## 3. 산출물
- 검증된 `SkillVersion` (상태 `roi_evaluated`) + 평가셋(eval_set) 초안.
- ROI 리포트(권장 과금 모드 포함) → [Cost Control](../architecture/05-cost-control.md)/[Monetization](../business/monetization.md) 입력.

## 4. 원칙
- **자산화.** Skill은 즉흥 프롬프트가 아니라 *검증을 거친 자산*으로만 생태계에 들어온다.
- **안전 우선.** Sandbox를 통과하지 못한 Skill은 절대 다음 단계로 가지 않는다([Security](../architecture/06-security.md)).
- **수치 기반.** ROI는 정성이 아니라 정량 게이트.

## 5. Sprint 범위
Sprint 1: Skill 매니페스트 + 라이프사이클 상태(`discovered→roi_evaluated`)를 데이터로 표현.
실제 Sandbox 실행 엔진은 Sprint 4(Skill OS 풀 라이프사이클).

## 관련
- 다음 인계: [AI University](ai-university-spec.md) (교육·시험)
- 라이프사이클 전체: [skill-lifecycle-spec.md](skill-lifecycle-spec.md)
