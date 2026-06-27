# 헌법 개정 #002 — Company 중심 조직 구조

- 상태: **Accepted (CEO 승인)**
- 출처: ATLAS UPDATE MEMO #002 (CEO ↔ CEO Advisor 논의)
- 중요도: ★★★★★ — Sprint 2 구현 전 반드시 반영. **아키텍처 변경(UI 아님).**
- 일자: 2026-06-27
- 선행: [개정 #001](AMENDMENT-001-ai-employee-ecosystem.md)

> 원본 헌법·개정 #001을 보존한다. 본 개정이 충돌 시 우선한다.

## 1. 계층 확장 — Company가 최상위 객체
```
(구)  Brand → Employee → Skill
(신)  Company → Department → Employee → Skill
```
Project Atlas는 직원을 관리하는 프로그램이 아니라 **회사를 운영하는 플랫폼**이다.
**Company**가 최상위 1급 객체다.

## 2. Company = Brand보다 큰 개념
Company는 다음을 가진다 (Brand Memory는 **Company 안에 포함**):
- Company DNA · Brand Memory · Organization · Department
- Company Culture · CEO Style · Approval Policy
- Company Goal · Company KPI · Company Health Score

## 3. Department도 독립 객체 (성장한다)
Department는 최소 다음을 가진다:
- Department DNA · 담당 업무(mandate) · KPI · 담당 Employee
- 필수 Skill · 현재 Skill 수준 · Department Health · Department Performance

## 4. Employee는 Department 소속
Employee는 Department에 속하며 Skill을 배우고·성과를 만들고·**승진**하고·업그레이드된다.

## 5. Operator HQ는 조직 전체를 운영
직원을 직접 관리하지 않는다. **Company · Department · Employee · Skill · Training · Certification · Research Lab** 전체를 운영한다.

## 6. Sprint 2 전 필수 신규/갱신 스펙
- [Company DNA Specification](../specs/company-dna-spec.md)
- [Department Specification](../specs/department-spec.md)
- [Organization Tree Specification](../specs/organization-tree-spec.md)
- [Company Health Specification](../specs/company-health-spec.md)
- [Department Health Specification](../specs/department-health-spec.md)
- [Company Lifecycle](../specs/company-lifecycle-spec.md)
- [Organization Architecture](../architecture/01-organization-architecture.md)

## 7. 절차
Sprint 2 구현 **중단**. Company 중심으로 아키텍처 확정 → Sprint 2 재제안 → CEO 승인 후 진행.
설계는 **Company → Department → Employee 구조를 가장 자연스럽게 확장 가능한 형태**로 한다.
관련 결정: [ADR 0007](../adr/0007-company-centric-architecture.md).
