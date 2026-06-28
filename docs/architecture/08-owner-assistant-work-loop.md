# 08 — Owner's Assistant Work Loop (대표 비서 오케스트레이션)

> 근거: [ATLAS MEMO #010](../adr/0012-owner-assistant-work-loop.md) · [Owner Assistant Spec](../specs/owner-assistant-spec.md)
> Atlas의 핵심은 직원이 아니라 **대표 비서가 회사를 오케스트레이션**하는 것이다.

## 1. 한 장의 그림
```
[대표]  요청 ("오늘 신메뉴 콘텐츠가 필요해")
   │            (대표는 직원과 직접 대화하지 않는다 — 항상 비서에게)
   ▼
[대표 비서] ── Work Loop ───────────────────────────────────────────────
   1) 요청 수신
   2) 업무 분석        → OutputType·필요 직군·필요 정보·필요 Skill ([Output Scope](../specs/output-scope-spec.md))
   3) 필요 직원 확인    → [직원 선택 알고리즘](../specs/assistant-work-loop-spec.md) (Matching+인증)
   4) 부족 직원 확인    → 있으면 [채용 추천(업셀)](../specs/employee-recommendation-upsell-spec.md) ↯ 일시 정지
   5) 필요 정보 확인    → 부족하면 [정보 요청](../specs/quality-boundary-spec.md) ↯ 일시 정지
   6) 실행 가능 판단    → [Readiness/Confidence](../specs/employee-readiness-spec.md): final/draft/info_request/out_of_scope
   7) 업무 배분         → 직원에게 WorkOrder (결과물은 직원이 생성 — 2B)
   8) 결과 취합         → AggregatedResult (여러 직원 산출물 통합)
   9) 대표 보고         → OwnerReport (정직하게: 최종본/초안/필요 자료/추천)
   ───────────────────────────────────────────────────────────────────
   ▼
[대표]  보고 확인 → (만족도 피드백 / 채용 / 자료 제공)
```

## 2. 분기 (Trust First)
| 상황 | Work Loop 결과 | 다음 |
|---|---|---|
| 직원 부족 | `staff_recommendation` | 대표가 채용(유료) → 재개 |
| 정보 부족 | `info_request` | 대표가 자료 제공 → Brand Memory 축적 → 재개 |
| 품질 미달(<70) | `info_request`/`blocked` | 결과물 만들지 않음 |
| 범위 밖 | `out_of_scope` | 다른 직원/Skill 추천 |
| 실행 가능 | `dispatch → aggregate → report` | 결과 보고 |

> **대표 비서는 결과물을 직접 만들지 않는다.** 분석·조율·보고만. 품질 미통과 시 실행하지 않는다.

## 3. 사용하는 서브시스템
- **Output Scope**(유형·필수정보·필요직군 판정) · **Staffing/업셀**(직원 충족) · **Quality**(준비도/신뢰도) · **Matching**(직원 선택) · **Brand Memory**(자료 축적) · **Cost Control**(원가/예산, 2B 실측).

## 4. 경계와의 관계
- 유료(회사 설립) 후 [`assistant_on_duty`](../specs/customer-journey-spec.md)에서 비서 출근 → Work Loop 가동.
- 결과물 생성·실행은 **Sprint 2B**. 본 문서는 그 오케스트레이션 골격.

## 관련
- 상세 하위 구조: [assistant-work-loop-spec](../specs/assistant-work-loop-spec.md)
- [00 개요](00-overview.md) · [07 온보딩](07-onboarding-architecture.md)
