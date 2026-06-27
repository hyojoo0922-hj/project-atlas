# ADR 0005 — AI Employee Ecosystem으로 재정의 (Employee 중심 아키텍처)

- 상태: Accepted
- 출처: [헌법 개정 #001](../constitution/AMENDMENT-001-ai-employee-ecosystem.md) (CEO 승인)
- 일자: 2026-06-27

## 배경
CEO 논의로 Atlas의 정의가 "AI Workforce OS"에서 **"AI Employee Ecosystem"**으로 확장됐다.
Employee가 Brand Memory를 가진 AI가 아니라, DNA·Skill·기억·훈련·인증·성과·매칭 프로파일을
모두 가진 **독립 객체**임이 확정됐다.

## 결정
1. **Employee를 도메인의 중심 객체로 격상.** 데이터 모델·서브시스템을 Employee 기준으로 재구성.
2. **Skill 라이프사이클에 ROI 분석 단계 추가** (9 → 10단계).
3. **생태계 기관(organ) 3종을 1급 서브시스템으로 도입**: AI Research Lab, AI University, Certification System.
4. **Operator HQ 재정의**: 직원 일상 관리가 아닌 Skill/Training/Certification/Update/Upgrade 운영.
5. **용어 통일**: Feature → Employee 중심 (`Writer Employee`).
6. 신규 스펙 7종을 `docs/specs/`로 분리(아키텍처 ↔ 스펙 2계층).

## 근거
- Employee 중심 모델은 성과/학습/인증 피드백 루프(=Employee Upgrade)를 자연스럽게 표현 → 헌법의 "장기 구독↑·해자"와 정렬.
- 생태계 기관 분리는 Skill 라이프사이클(발견~성과측정)을 운영 주체로 매핑해 책임을 명확화.

## 결과
- 아키텍처 문서(00·02·03·04) 갱신, 제품/사업 문서 용어 정렬.
- 신규 스펙 7종 추가. Sprint 1 재제안([sprint-1-proposal](../sprints/sprint-1-proposal.md)).
- 구현은 CEO 승인 후 착수.
