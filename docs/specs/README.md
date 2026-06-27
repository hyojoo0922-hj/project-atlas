# 스펙 (Specifications)

> 개정 [#001](../constitution/AMENDMENT-001-ai-employee-ecosystem.md)·[#002](../constitution/AMENDMENT-002-company-centric-organization.md)로 추가된 상세 스펙 계층.
> 아키텍처(`../architecture/`)가 "전체 그림"이라면, 스펙은 각 핵심 객체/기관의 "정밀 설계"다.
> 계층: **Company → Department → Employee → Skill** ([Organization Architecture](../architecture/01-organization-architecture.md)).

## 조직 객체 (Company 중심 — 개정 #002)
- [Company DNA Specification](company-dna-spec.md) — 최상위 객체, DNA·문화·CEO Style·승인정책·목표·KPI·건강
- [Department Specification](department-spec.md) — 독립 객체(성장), DNA·KPI·필수Skill·현재수준·Health
- [Organization Tree Specification](organization-tree-spec.md) — 확장 가능한 조직 트리
- [Company Health Specification](company-health-spec.md) — 회사 건강(최상위 롤업)
- [Department Health Specification](department-health-spec.md) — 부서 건강(롤업)
- [Company Lifecycle](company-lifecycle-spec.md) — 설립→구성→운영→성장→재편

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
