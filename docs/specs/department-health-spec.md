# Department Health Specification

> 근거: [Department Spec](department-spec.md) · [Organization Architecture](../architecture/01-organization-architecture.md)
> Department Health는 부서의 건강을 0~100으로 나타내는 **파생 지표**다.

## 1. 정의
부서가 "필요한 일을, 필요한 역량으로, 잘 하고 있는가"를 한 수치로 요약한다.
직접 입력하지 않고 하위 신호에서 **롤업**으로 계산한다.

## 2. 구성 신호 (v0 — 설명 가능 가중합)
| 신호 | 설명 | 가중치(초안) |
|---|---|---|
| **Skill Coverage** | 필수 Skill 대비 현재 Skill 수준(인증 직원 보유) | 0.30 |
| **KPI Attainment** | Department KPI 달성률(현재/목표) | 0.30 |
| **Performance** | 소속 직원 평균 성과(rating) | 0.25 |
| **Capacity** | 업무량 대비 직원 수용력(과부하 여부) | 0.15 |

```
DepartmentHealth = 100 × Σ(weightᵢ × signalᵢ)   (각 signal 0..1)
```

## 3. 등급
| 점수 | 등급 | 의미 |
|---|---|---|
| 80~100 | 🟢 Healthy | 안정 운영 |
| 60~79 | 🟡 Watch | 일부 Skill gap/KPI 미달 |
| 0~59 | 🔴 At-Risk | 필수 Skill 미충족·과부하·KPI 심각 미달 |

## 4. 운영 액션 연동 (Operator HQ)
- Skill Coverage 낮음 → [Research Lab](ai-research-lab-spec.md)/[University](ai-university-spec.md) 교육 우선순위.
- Capacity 낮음 → 직원 충원(채용·배치).
- Performance 낮음 → 재교육/Employee Upgrade 또는 Skill Update.

## 5. 롤업
Department Health는 [Company Health Score](company-health-spec.md)의 입력이 된다.

## 관련
- [Department Spec](department-spec.md) · [Company Health Spec](company-health-spec.md)
