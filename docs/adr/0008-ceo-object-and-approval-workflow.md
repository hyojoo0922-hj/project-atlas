# ADR 0008 — CEO 객체 · Approval Workflow · 살아있는 조직

- 상태: Accepted
- 출처: [헌법 개정 #003](../constitution/AMENDMENT-003-ceo-and-living-organization.md) (CEO 승인)
- 일자: 2026-06-27
- 선행: [ADR 0007](0007-company-centric-architecture.md)

## 배경
CEO 논의로 조직 모델이 재확장됐다. **CEO**가 핵심 객체로 계층에 삽입되고,
승인은 **독립 Approval Workflow**로, 회사는 **성장 단계**를 갖고, Atlas는 **조직을 추천**한다.
Sprint 2 목표가 "회사 존재"에서 "**살아 움직이는 회사**"로 상향됐다.

## 결정
1. **CEO를 핵심 도메인 객체로 추가.** 계층: `Company → CEO → Department → Employee → Skill`.
   - 개정 #002에서 Company에 두었던 `ceoStyle`·`approvalPolicy`를 **CEO 객체로 이전**.
   - CEO는 의사결정 스타일·리스크 성향·브랜드 우선순위·성장 전략·목표·KPI·권한을 보유.
2. **CEO를 거버넌스 지배 변수로.** Employee 실행 = Employee DNA × **CEO 거버넌스**(스타일·리스크·브랜드 우선순위) → 같은 직원도 CEO에 따라 다르게 작동.
3. **Approval Workflow를 독립 구조로.** 규칙 기반 결정 라우팅(자동/CEO/부서장/조건부), `ApprovalRequest` 객체. Company 속성에 종속되지 않음.
4. **Company Lifecycle에 성장 단계 축 추가** (창업~프랜차이즈). 단계별 필요 부서/직원/Skill 매핑.
5. **AI Organization Recommendation 도입.** (업종 × 단계) → 추천 조직 템플릿. 동일 시작 금지.
6. **"살아있는 조직" 루프**: Recommendation → 조직 구성 → CEO 거버넌스/Approval → Employee 업무 → Health 롤업 → Growth 단계 전이 → 재추천. (자기 강화 루프)

## 근거
- CEO를 1급 객체로 두면 멀티테넌트 *운영 방식 차이*를 강하게 표현 → 차별화·해자.
- Approval을 독립 구조로 두면 결정 유형 확장이 규칙 추가로 끝남(확장성).
- (업종×단계) 추천은 "회사를 운영하는 플랫폼"의 온보딩 가치를 극대화.

## 확장성 원칙
- CEO/Approval/Stage/Recommendation 모두 **규칙·템플릿 기반 v0** → 데이터 축적 후 학습 기반으로 승격(별도 ADR).
- 조직 트리에 `ceo` 노드 종류 추가 — 트리 불변식 유지.

## 결과
- 아키텍처(00·01·02)·조직 스펙 갱신, CEO/Approval/Recommendation 스펙 신규.
- [Sprint 2 재제안](../sprints/sprint-2-proposal.md): "살아 움직이는 회사". **구현은 CEO 승인 후.**
- Sprint 1 코드 미변경. Company/CEO/Department 도입은 Sprint 2 구현 범위.
