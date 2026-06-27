# Operator HQ Specification

> 근거: [헌법 개정 #001](../constitution/AMENDMENT-001-ai-employee-ecosystem.md) §4
> 운영자는 "직원을 관리하는 사람"이 **아니다.** 운영자는 **생태계를 운영하는 사람**이다.

## 1. Operator HQ의 정의
Operator HQ는 Atlas 생태계의 **본사(Headquarters)**다. 개별 직원의 일상 업무를 지시하지 않는다.
대신 직원이 더 강해지는 **시스템**을 운영한다.

## 2. 운영자의 5대 책임
| 책임 | 무엇을 하는가 | 연동 기관 |
|---|---|---|
| **Skill Library 운영** | Skill 자산 카탈로그·버전·상태 관리 | [Skill Lifecycle](skill-lifecycle-spec.md) |
| **Training 운영** | 어떤 직원을 무엇으로 교육할지 편성·승인 | [AI University](ai-university-spec.md) |
| **Certification 운영** | 인증 기준 관리, 인증 발급/만료 감독 | [Certification System](certification-system-spec.md) |
| **Skill Update 운영** | Skill 신버전 발행 및 전파 결정 | [Skill Lifecycle](skill-lifecycle-spec.md) §6 |
| **Employee Upgrade 운영** | 성과·인증 기반으로 직원 성장(Skill/Cert 추가) 승인 | [Employee DNA](employee-dna-spec.md) §5 |

> 즉 운영자는 **생태계 기관(Research Lab·University·Certification)을 지휘**하고,
> 그 결과를 직원에게 **배포·업그레이드**하는 주체다.

## 3. 운영자가 보는 것 (Operator Console)
PRODUCT_CHARTER: **복잡성은 운영자에게.** HQ 콘솔은 강력하고 정보 밀도가 높다.
- Skill Library 보드(라이프사이클 상태·ROI·성과)
- 직원 보드(DNA·Skill·Certification·Performance·Matching Profile)
- Matching 추천 + 설명(breakdown/reasons)
- 원가 대시보드(직원별/Skill별/브랜드별 — [Cost Control](../architecture/05-cost-control.md))
- Training/Certification 파이프라인 상태

## 4. 운영자가 하지 않는 것
- 직원에게 매 작업을 일일이 지시하지 않는다(그건 고객의 위임 + 직원의 자율).
- Skill을 즉흥 프롬프트로 만들지 않는다(자산은 Research Lab 라이프사이클을 거친다).

## 5. Sprint 1 범위
Operator Console은 **읽기 위주 골격**으로 시작: 직원/Skill/적합도/원가를 *보여주는* 화면.
편성·승인 액션은 Sprint 2+에서 단계적 추가.

## 관련
- 고객 측 경험(단순): [../product/personas.md](../product/personas.md)
- 생태계 기관: [Research Lab](ai-research-lab-spec.md) · [University](ai-university-spec.md) · [Certification](certification-system-spec.md)
