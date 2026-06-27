# Company Health Specification

> 근거: [Company DNA Spec](company-dna-spec.md) · [Organization Architecture](../architecture/01-organization-architecture.md)
> Company Health Score는 회사 전체의 건강을 0~100으로 나타내는 **최상위 파생 지표**다.

## 1. 정의
"이 회사(Company)가 목표를 향해 건강하게 운영되는가"를 한 수치로 요약한다.
[Department Health](department-health-spec.md)와 회사 수준 신호를 **롤업**해 계산한다.

## 2. 구성 신호 (v0 — 설명 가능 가중합)
| 신호 | 설명 | 가중치(초안) |
|---|---|---|
| **Department Health (가중평균)** | 부서 건강의 가중평균(부서 규모/중요도 가중) | 0.40 |
| **Company KPI Attainment** | Company KPI 달성률 | 0.30 |
| **Goal Alignment** | 부서 KPI ↔ Company Goal 정합(캐스케이드 일치) | 0.15 |
| **Governance Friction** | Approval/Culture로 인한 병목(낮을수록 좋음) | 0.15 |

```
CompanyHealth = 100 × Σ(weightᵢ × signalᵢ)   (각 signal 0..1, friction은 1-병목)
```

## 3. 등급 & 의미
| 점수 | 등급 | 의미 |
|---|---|---|
| 80~100 | 🟢 Thriving | 목표 정렬·부서 건강·낮은 마찰 |
| 60~79 | 🟡 Stable | 일부 부서/KPI 주의 |
| 0~59 | 🔴 At-Risk | 다수 부서 위험·목표 이탈·승인 병목 |

## 4. 캐스케이드 ↔ 롤업 (한눈에)
```
Goal → KPI → Dept KPI → Employee 성과      (하향: 목표 캐스케이드)
Employee 성과 → Dept Health → Company Health (상향: 건강 롤업)
```

## 5. 운영 액션 연동 (Operator HQ)
- At-Risk 부서 식별 → 교육/충원/재편.
- Goal Alignment 낮음 → KPI 재설정(캐스케이드 정렬).
- Governance Friction 높음 → [CEO](ceo-spec.md) 의사결정 스타일/[Approval Workflow](approval-workflow-spec.md) 재검토.

## 6. 불변식
- 직접 수정 불가(파생). 모든 갱신은 롤업으로만.
- 계산 입력·결과는 추적 가능(AuditEvent).

## 관련
- [Company DNA Spec](company-dna-spec.md) · [Department Health Spec](department-health-spec.md) · [Company Lifecycle](company-lifecycle-spec.md)
