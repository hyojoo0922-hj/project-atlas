# ADR 0007 — Company 중심 조직 아키텍처 (Company → Department → Employee → Skill)

- 상태: Accepted
- 출처: [헌법 개정 #002](../constitution/AMENDMENT-002-company-centric-organization.md) (CEO 승인)
- 일자: 2026-06-27
- 선행: [ADR 0005](0005-ai-employee-ecosystem-pivot.md)

## 배경
CEO 논의로 Atlas가 "직원 플랫폼"에서 **"회사 운영 플랫폼"**으로 확장됐다.
최상위 객체가 Brand에서 **Company**로 바뀌고, **Department**라는 독립 성장 객체가 추가됐다.

## 결정
1. **Company를 최상위 도메인 객체로 격상.** Customer(과금 계정)는 Company를 소유한다.
2. **계층**: `Company → Department → Employee → Skill`. Employee는 `departmentId`를 갖는다.
3. **Brand Memory를 Company 스코프로 재배치** (Company 내부 구성요소).
4. **Department를 독립 객체로 도입** (DNA·KPI·필수Skill·현재Skill수준·Health·Performance, 성장).
5. **Health/KPI 롤업 계층 도입**: Employee 성과 → Department Health/Performance → Company Health Score.
6. **거버넌스 객체 도입**: Company Culture · CEO Style · Approval Policy → 직원/운영 액션의 자율·승인 게이트를 규율.
7. 신규 스펙 7종 추가. [Organization Architecture](../architecture/01-organization-architecture.md)를 상위 그림으로 둔다.

## 근거
- 회사 운영 메타포(PRODUCT_CHARTER "회사를 운영하는 느낌")를 도메인 모델로 직접 표현.
- Health/KPI 롤업은 "각 계층이 성장한다"는 요구(Company·Department·Employee)를 자연스럽게 수용.
- Company DNA/Culture/CEO Style/Approval Policy는 멀티테넌트별 *운영 방식 차이*를 1급으로 표현 → 확장성·차별화.

## 확장성 설계 원칙
- Organization은 **트리**로 모델링 → 추후 하위 부서/팀/직무 추가가 노드 추가로 끝나야 한다.
- 모든 계층 객체는 `DNA + KPI + Health + Performance` 공통 패턴을 공유 → 일관된 성장 루프.
- KPI/Goal은 상위→하위 **캐스케이드**(Company Goal → Department KPI → Employee 성과).

## 결과
- 데이터 모델([02-data-model.md](../architecture/02-data-model.md))·개요([00-overview.md](../architecture/00-overview.md)) 갱신.
- Employee/Operator HQ 스펙 갱신, 조직 스펙 7종 추가.
- **구현 없음** — Sprint 2 재제안([sprint-2-proposal.md](../sprints/sprint-2-proposal.md)) 후 CEO 승인 시 착수.
- Sprint 1 코드(brandId 기반)는 Sprint 2에서 companyId/departmentId로 마이그레이션(제안서에 명시).
