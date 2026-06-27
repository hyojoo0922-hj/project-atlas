# Operator HQ Specification

> 근거: 개정 [#001](../constitution/AMENDMENT-001-ai-employee-ecosystem.md) §4 · [#002](../constitution/AMENDMENT-002-company-centric-organization.md) §5
> 운영자는 "직원을 관리하는 사람"이 **아니다.** 운영자는 **회사 전체(조직)를 운영하는 사람**이다.

## 1. Operator HQ의 정의
Operator HQ는 Atlas의 **본사(Headquarters)**다. 개별 직원의 일상 업무를 지시하지 않는다.
**Company · Department · Employee · Skill · Training · Certification · Research Lab 전체**를 운영한다.

## 2. 운영자의 책임 (조직 전체)
| 책임 | 무엇을 하는가 | 연동 |
|---|---|---|
| **Company 운영** | DNA·Culture·CEO Style·Approval Policy·Goal·KPI·Health 관리 | [Company DNA](company-dna-spec.md) |
| **Department 운영** | 부서 신설/재편, KPI·필수Skill 설정, Department Health 관리 | [Department](department-spec.md) |
| **Employee 운영** | 채용·부서 배치·승진·Upgrade 승인 | [Employee DNA](employee-dna-spec.md) |
| **Skill Library 운영** | Skill 자산 카탈로그·버전·상태 관리 | [Skill Lifecycle](skill-lifecycle-spec.md) |
| **Training 운영** | 부서 Skill gap 기반 교육 편성·승인 | [AI University](ai-university-spec.md) |
| **Certification 운영** | 인증 기준·발급·만료 감독 | [Certification System](certification-system-spec.md) |
| **Research Lab 운영** | Skill 발굴·ROI 우선순위 지휘 | [AI Research Lab](ai-research-lab-spec.md) |

> 운영자는 조직 건강(Company/Department Health)을 보고 **충원·교육·인증·재편·Upgrade**를 결정한다.

## 3. 운영자가 보는 것 (Operator Console)
PRODUCT_CHARTER: **복잡성은 운영자에게.** HQ 콘솔은 강력하고 정보 밀도가 높다.
- **Company 대시보드**: Company Health Score·Goal/KPI 달성·거버넌스(승인 대기)
- **Organization 트리**: Company→Department→Employee 구조·재편
- **Department 보드**: Department Health·KPI·필수Skill 대비 현재 수준(gap)
- Skill Library 보드(라이프사이클 상태·ROI·성과)
- 직원 보드(DNA·rank·Skill·Certification·Performance·Matching Profile)
- Matching 추천 + 설명(breakdown/reasons)
- 원가 대시보드(회사/부서/직원/Skill별 — [Cost Control](../architecture/05-cost-control.md))
- Training/Certification 파이프라인 상태

## 4. 운영자가 하지 않는 것
- 직원에게 매 작업을 일일이 지시하지 않는다(그건 고객의 위임 + 직원의 자율).
- Skill을 즉흥 프롬프트로 만들지 않는다(자산은 Research Lab 라이프사이클을 거친다).

## 5. 구현 범위
- Sprint 1(완료): 직원/Skill/적합도/원가를 보여주는 읽기 골격(HTML 스냅샷).
- Sprint 2(재제안): **Company·Department·Organization·Health**를 콘솔에 추가. 편성·승인 액션 단계적 도입.

## 관련
- 고객 측 경험(단순): [../product/personas.md](../product/personas.md)
- 생태계 기관: [Research Lab](ai-research-lab-spec.md) · [University](ai-university-spec.md) · [Certification](certification-system-spec.md)
