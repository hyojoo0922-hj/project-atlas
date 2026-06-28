# Owner's Assistant Specification (대표 비서)

> 근거: [ATLAS BUSINESS MEMO #008](../adr/0010-free-paid-boundary.md) §5 · [free-paid-boundary](../business/free-paid-boundary.md)
> 대표 비서는 **무료 단계 상시 기능이 아니다.** 회사 설립(유료) 후 **출근**한다.

## 1. 정의
대표(고객)와 AI 직원 사이를 잇는 **조율자**. 대표의 요청을 받아 분석하고, 적합한 직원에게
업무를 배분하고, 결과를 보고한다. 단, **대표 비서 본인은 결과물을 직접 만들지 않는다.**
결과물은 직원(Employee)이 만든다.

## 2. 출근 시점 (Lifecycle)
```
무료: AI 공동창업자(진단·추천)만 제공  ── 대표 비서 없음
유료: 회사 설립 → company_created → assistant_on_duty(대표 비서 출근) → first_employee_ready
```
- 무료 단계: 진단/추천은 **AI 공동창업자**가 담당(대표 비서 아님).
- 유료 전환 후: `assistant_on_duty` 상태에서 대표 비서 출근.

## 3. 역할
| 역할 | 설명 |
|---|---|
| 대표 요청 수신 | 자연어 업무 요청 접수 |
| 업무 분석 | 요청을 수행 가능한 작업으로 분해 |
| 필요한 직원 확인 | 어떤 직원(직군)이 필요한지 판단 |
| 부족한 직원 추천 | 없는 직원은 채용을 추천([업셀링](employee-recommendation-upsell-spec.md)) |
| 업무 배분 | 적합 직원에게 업무 할당 |
| 결과 보고 | 직원 산출물을 대표에게 보고 |

> **경계**: 대표 비서는 *오케스트레이션*만 한다. 실제 산출물 생성은 직원의 Work Loop(2B).

## 4. 데이터 (개념)
```yaml
ownerAssistant:
  id: asst_01
  companyId: com_01
  status: on_duty        # 유료 설립 후
  role: [수신, 분석, 직원확인, 직원추천, 업무배분, 결과보고]
```

## 5. Work Loop (MEMO #010)
대표 비서의 실제 오케스트레이션 흐름(요청→분석→직원선택→정보/품질 게이트→배분→취합→보고)은
[architecture/08 — Owner's Assistant Work Loop](../architecture/08-owner-assistant-work-loop.md) +
[assistant-work-loop-spec](assistant-work-loop-spec.md)에 설계되어 있다.

## 6. 범위
출근 시점·역할(#008) + Work Loop 아키텍처(#010) **설계 완료**. 실제 업무 실행/결과물 생성은 **Sprint 2B**.

## 관련
- [Customer Journey](customer-journey-spec.md) · [Company Creation Flow](company-creation-flow-spec.md)
- [Upsell Spec](employee-recommendation-upsell-spec.md) · [Operator HQ](operator-hq-spec.md)
