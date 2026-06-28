# Assistant Work Loop Specification

> 근거: [ATLAS MEMO #010](../adr/0012-owner-assistant-work-loop.md) · [architecture/08](../architecture/08-owner-assistant-work-loop.md)
> 대표 비서가 요청을 받아 회사를 오케스트레이션하는 **전체 흐름과 하위 구조**. (구현은 Sprint 2B)

## 1. Work Loop 상태머신
```
received → analyzing → staffing_check → readiness_check → feasibility
  feasibility ─┬─ executable   → dispatching → aggregating → reporting → done
               ├─ need_staff   → staff_recommendation   (대표 채용 대기)
               ├─ need_info    → info_request           (대표 자료 제공 대기)
               └─ out_of_scope → blocked                (다른 직원/Skill 추천)
재개: staff_recommendation/info_request 해소 → analyzing 또는 readiness_check로 복귀
```

## 2. 업무 분석 구조 (Task Analysis)
대표 요청(자연어) → 수행 가능한 작업으로 분해. [Output Scope](output-scope-spec.md) 활용.
```yaml
taskRequest:   { id, ownerText: "오늘 신메뉴 콘텐츠가 필요해", brandId }
taskAnalysis:
  id: ta_01
  outputTypes: [social_post, image]          # 요청에서 추론
  requiredRoleFamilies: [content, design]
  requiredInfo: [brand-voice, product-info, product-image, brand-color]
  requiredSkills: [brand-voice-writer, image-create]
  subTasks:
    - { outputType: social_post, roleFamily: content }
    - { outputType: image,       roleFamily: design }
```

## 3. 직원 선택 알고리즘 (Employee Selection)
각 subTask의 `roleFamily/skill`에 대해:
```
후보 = 회사 직원 중 해당 roleFamily
점수 = Matching 적합도(fit) × 인증 보유(필수) × Readiness(준비도)
선택 = eligible(인증) && fit ≥ 임계 중 최고점
없으면 = missing (→ 부족 직원 추천)
```
- [Skill Matching Engine](skill-matching-engine-spec.md)의 fit + [Certification](certification-system-spec.md) 게이트 + [Readiness](employee-readiness-spec.md).
- 미인증/부적격 직원은 선택 불가(Trust First).

## 4. 부족 직원 추천 흐름 (Missing Staff)
```
staffing_check → analyzeStaffing(required, present)  ([packages/staffing])
  missing 있음 → staff_recommendation
     → 대표 보고: "이번 업무엔 Writer·Designer 필요, 현재 Writer만 있음.
        Designer 채용 시 이미지 포함 제작 가능. 미채용 시 텍스트 초안까지."
  대표가 채용(유료) → 직원 추가 → Work Loop 재개
```
→ [Employee Recommendation / Upsell](employee-recommendation-upsell-spec.md). 핵심 수익 모델.

## 5. 정보 요청 흐름 (Info Request)
```
readiness_check → computeReadiness(present, required)  ([packages/quality])
  level=info_request(<70) → 직원이 필요한 자료를 묻는다(직군별, 직원이 필요해서)
     → 대표 자료 제공 → Brand Memory(Company 스코프) 축적 → Readiness 재계산 → 재개
```
→ [Quality Boundary](quality-boundary-spec.md) · [Progressive Company Learning](progressive-company-learning-spec.md).

## 6. 실행 가능 여부 판단 (Feasibility)
subTask별 Confidence로 결정([employee-readiness](employee-readiness-spec.md)):
```
모든 subTask final 가능        → executable (최종본)
일부 draft / 일부 부족          → 부분 실행(가능분 초안) + 나머지 need_info/need_staff
필수 직원 없음                  → need_staff
핵심 정보 없음                  → need_info
범위 밖                         → out_of_scope
```
**품질 미통과면 실행하지 않는다.**

## 7. 결과 취합 구조 (Aggregation)
여러 직원 산출물을 하나의 전달물로 통합.
```yaml
workOrder:   { id, employeeId, subTask, status }      # 비서가 직원에게 배분
employeeResult: { workOrderId, outputType, state: final|draft, contentRef? }  # 직원이 생성(2B)
aggregatedResult:
  taskId: ta_01
  parts: [ {role: content, state: final}, {role: design, state: draft} ]
  overallState: partial            # final | partial | info_request
```

## 8. 대표 보고 구조 (Owner Report)
정직한 보고(Trust First). 점수는 단순화, 누락/추천은 명확히.
```yaml
ownerReport:
  taskId: ta_01
  summary: "신메뉴 콘텐츠: 텍스트 초안 완료, 이미지는 Designer 채용 후 가능"
  deliverables: [ {type: social_post, state: draft} ]
  needed:
    info: []                       # 부족 자료
    hire: [Designer Employee]      # 추천 채용
  nextActions: ["Designer 채용하기", "텍스트 초안 검토하기"]
  feedbackRequest: true            # 만족도 수집(Satisfaction Memory)
```
→ 보고 후 [Satisfaction Memory](satisfaction-memory-spec.md) 수집 → 성장 루프 환류.

## 9. 불변식
1. 대표 비서는 결과물을 직접 생성하지 않는다(오케스트레이션만).
2. 대표는 직원과 직접 대화하지 않는다(항상 비서 경유).
3. 품질/인증 게이트 미통과 작업은 dispatch되지 않는다.
4. 모든 단계 전이·배분·보고는 AuditEvent.

## 관련
- [Owner Assistant](owner-assistant-spec.md) · [Output Scope](output-scope-spec.md) · [Quality Boundary](quality-boundary-spec.md)
- [Upsell](employee-recommendation-upsell-spec.md) · [Matching](skill-matching-engine-spec.md) · [Satisfaction Memory](satisfaction-memory-spec.md)
