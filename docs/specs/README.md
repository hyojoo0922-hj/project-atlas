# 스펙 (Specifications)

> 개정 [#001](../constitution/AMENDMENT-001-ai-employee-ecosystem.md)·[#002](../constitution/AMENDMENT-002-company-centric-organization.md)로 추가된 상세 스펙 계층.
> 아키텍처(`../architecture/`)가 "전체 그림"이라면, 스펙은 각 핵심 객체/기관의 "정밀 설계"다.
> 계층: **Company → Department → Employee → Skill** ([Organization Architecture](../architecture/01-organization-architecture.md)).

## 온보딩 / Customer Journey (개정 #004 + MEMO #008 무료/유료)
무료(진단·추천, `proposal_ready`까지) → 결제 → 유료(회사 설립·대표 비서·운영).
- [Customer Journey Specification](customer-journey-spec.md) — 핵심 경험(상태머신, 무료/유료)
- [AI Business Diagnosis Specification](ai-business-diagnosis-spec.md) — 회사보다 사업을 먼저 진단
- [Company Creation Flow Specification](company-creation-flow-spec.md) — Proposal(무료)↔Creation(유료, 결제 게이트)
- [Owner's Assistant Specification](owner-assistant-spec.md) — 대표 비서(설립 후 출근)
- [Employee Recommendation / Upsell](employee-recommendation-upsell-spec.md) — 부족 직원 채용 추천(수익 모델)
- 우산: [Onboarding Architecture](../architecture/07-onboarding-architecture.md) · 경계: [free-paid-boundary](../business/free-paid-boundary.md)

## 조직 객체 (Company 중심 — 개정 #002·#003)
계층: **Company → CEO → Department → Employee → Skill**
- [Company DNA Specification](company-dna-spec.md) — 최상위 객체, DNA·문화·목표·KPI·단계·건강
- [CEO Specification](ceo-spec.md) — 핵심 객체, 의사결정·승인·리스크·브랜드우선·성장전략·권한
- [Approval Workflow Specification](approval-workflow-spec.md) — 자동/CEO/부서장/조건부 승인(독립 구조)
- [AI Organization Recommendation](org-recommendation-spec.md) — (업종×단계) 조직 추천
- [Department Specification](department-spec.md) — 독립 객체(성장), DNA·KPI·필수Skill·현재수준·Health
- [Organization Tree Specification](organization-tree-spec.md) — 확장 가능한 조직 트리(company/ceo/department/employee)
- [Company Health Specification](company-health-spec.md) — 회사 건강(최상위 롤업)
- [Department Health Specification](department-health-spec.md) — 부서 건강(롤업)
- [Company Lifecycle](company-lifecycle-spec.md) — 운영 단계 + 성장 단계(창업~프랜차이즈) + 살아있는 루프

## 중심 객체 (직원)
- [Employee DNA Specification](employee-dna-spec.md) — Department 소속, 7개 구성요소·4개 DNA 레이어·승진/성장 루프

## Skill 자산
- [Skill Lifecycle Specification](skill-lifecycle-spec.md) — 10단계(ROI 분석 포함), Skill=자산
- [Skill Matching Engine Specification](skill-matching-engine-spec.md) — 직원별 적합도 배포

## 생태계 기관 (Ecosystem Organs)
- [AI Research Lab](ai-research-lab-spec.md) — 발견·분석·Sandbox·ROI (Skill 발굴)
- [AI University](ai-university-spec.md) — 교육·시험 (직원 훈련)
- [Certification System](certification-system-spec.md) — 인증 (자격 보증)
- [Operator HQ](operator-hq-spec.md) — 위 기관 + 배포·Skill Update·Employee Upgrade 운영

## 라이프사이클 ↔ 기관 매핑
```
발견·분석·Sandbox·ROI 분석   →  AI Research Lab
직원 추천                     →  Skill Matching Engine
교육·시험                     →  AI University
인증                          →  Certification System
배포·성과측정·Update·Upgrade  →  Operator HQ
```
