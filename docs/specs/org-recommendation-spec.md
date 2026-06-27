# AI Organization Recommendation Specification

> 근거: [헌법 개정 #003](../constitution/AMENDMENT-003-ceo-and-living-organization.md) §5 · [ADR 0008](../adr/0008-ceo-object-and-approval-workflow.md)
> Atlas는 고객에게 **조직을 추천**한다. 모든 회사를 동일한 조직으로 시작시키지 않는다.

## 1. 목적
회사 가입(온보딩) 시 **업종 + 회사 성장 단계**에 맞는 조직(부서·직원·Skill)을 추천한다.
"회사를 운영하는 플랫폼"의 첫 가치 — 고객은 빈 화면이 아니라 *추천된 조직*을 받는다.

## 2. 입력 / 출력
```
입력:  industry (예: 카페, 이커머스, 뷰티, SaaS …)
       stage    (창업 / 초기 성장 / 안정화 / 확장 / 프랜차이즈)
       (선택) CEO 성장전략·브랜드 우선순위 → 가중
출력:  OrgRecommendation {
         departments: [{ name, mandate, kpiTemplate, requiredSkills, seedEmployees }],
         rationale: string[]    // 왜 이 조직인가(설명 가능)
       }
```

## 3. 추천 모델 v0 — 템플릿 × 단계 (규칙 기반)
업종별 **조직 템플릿** + 단계별 **활성화 규칙**의 조합.

예시: **카페 (cafe)**
| 단계 | 추천 부서 |
|---|---|
| 창업 | Operations |
| 초기 성장 | Operations · **Marketing** |
| 안정화 | Operations · Marketing · **Customer Care** |
| 확장 | + **Growth/Expansion** |
| 프랜차이즈 | + **Franchise Ops** |

```yaml
orgTemplate:
  industry: cafe
  departments:
    - name: Operations
      activeFrom: 창업
      mandate: "매장 운영·재고·품질"
      requiredSkills: [inventory-mgmt, quality-check]
    - name: Marketing
      activeFrom: 초기 성장
      requiredSkills: [brand-voice-writer, repurpose-to-channel]
    - name: Customer Care
      activeFrom: 안정화
      requiredSkills: [inquiry-responder]
    - name: Franchise Ops
      activeFrom: 프랜차이즈
      requiredSkills: [sop-standardizer]
```

> v0는 **템플릿/규칙 기반·설명 가능**. 데이터 축적 후 학습 기반 추천(v1)은 별도 ADR.

## 4. "살아있는 조직"과의 연결
```
가입(industry, stage) ──▶ Org Recommendation ──▶ 부서/직원/Skill 구성
        ▲                                              │
        │ 재추천(단계 전이 시)                          ▼
   Growth 단계 전이 ◀── Health 롤업 ◀── Employee 업무·성과
```
- 회사가 성장 단계로 전이하면([Company Lifecycle](company-lifecycle-spec.md)) **새 부서/직원/Skill을 재추천**.
- 추천은 강제가 아니라 제안 — 채택 여부는 CEO/운영자가 [Approval Workflow](approval-workflow-spec.md)로 결정.

## 5. 불변식
1. 추천은 항상 `rationale`(사유)를 동반 — 설명 가능성.
2. 추천은 제안일 뿐, 실제 조직 변경은 승인·재편 절차를 거친다.
3. 동일 (industry, stage)라도 CEO 가중에 따라 우선순위가 달라질 수 있다.

## 관련
- [Company Lifecycle](company-lifecycle-spec.md) · [Department Spec](department-spec.md)
- [CEO Spec](ceo-spec.md) · [Skill Lifecycle](skill-lifecycle-spec.md)
