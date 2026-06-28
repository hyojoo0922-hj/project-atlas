# ADR 0012 — 대표 비서 Work Loop 아키텍처

- 상태: Accepted
- 출처: ATLAS BUSINESS MEMO #010 (CEO ↔ CEO Advisor)
- 일자: 2026-06-28
- 선행: [ADR 0011](0011-trust-first-quality-boundary.md)

## 배경
Atlas의 핵심은 직원이 아니라 **대표 비서가 회사를 오케스트레이션**하는 것이다.
대표는 직원과 직접 대화하지 않고 **항상 대표 비서에게 요청**한다.

## 결정
대표 비서 Work Loop를 단일 오케스트레이션 흐름으로 설계한다:
```
요청 수신 → 업무 분석 → 필요 직원 확인 → 부족 직원 확인 → 필요 정보 확인
→ 실행 가능 여부 판단 → (직원에게) 업무 배분 → 결과 취합 → 대표 보고
```
- **대표 비서는 결과물을 직접 만들지 않는다.** 분석·조율만. 결과물은 직원이 만든다.
- 직원 부족 → [업셀 추천](../specs/employee-recommendation-upsell-spec.md). 정보 부족 → [정보 요청](../specs/quality-boundary-spec.md).
- **품질 기준 미통과 시 실행하지 않는다**([Readiness/Confidence](../specs/employee-readiness-spec.md)).
- 기존 구조 재사용: Output Scope(유형 판정) · Staffing(직원 충족) · Quality(준비도/신뢰도) · Matching(직원 선택).

## 구성 (함께 설계)
업무 분석 구조 · 직원 선택 알고리즘 · 부족 직원 추천 흐름 · 정보 요청 흐름 · 결과 취합 구조 · 대표 보고 구조.
→ [assistant-work-loop-spec](../specs/assistant-work-loop-spec.md) · 상위: [architecture/08](../architecture/08-owner-assistant-work-loop.md)

## 범위 (이번)
**아키텍처 + 문서만.** 실제 결과물 생성·실행은 **Sprint 2B**. 본 ADR이 2B 오케스트레이션 사양을 고정한다.

## 결과
- 대표 비서 Work Loop 상태머신·하위 구조 문서화.
- [Sprint 2B 재제안](../sprints/sprint-2b-proposal.md): Work Loop를 중심으로 구현.
