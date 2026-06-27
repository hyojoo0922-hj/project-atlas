# 07 — Onboarding Architecture (온보딩 아키텍처)

> 근거: [헌법 개정 #004](../constitution/AMENDMENT-004-ai-cofounder-onboarding.md) · [ADR 0009](../adr/0009-onboarding-and-customer-journey.md)
> Atlas의 첫 경험은 "회사 생성"이 아니라 **"AI 공동창업자의 컨설팅 → 회사 자동 설계 → 대표 승인"**이다.

## 1. 한 장의 그림
```
[고객]  회원가입(= 무료 AI 컨설팅: 질문 응답)
   │
   ▼
[AI]   AI Business Diagnosis (회사보다 사업을 먼저 진단)
   │            → "지금은 마케팅보다 운영 체계 먼저" 같은 우선순위
   ▼
[AI]   AI Company Design  (진단 기반 회사 설계 = 자동)
   │     ├─ AI Organization Recommendation (추천 Department)
   │     ├─ AI Employee Recommendation     (추천 Employee)
   │     ├─ 추천 Skill 적용
   │     └─ 추천 우선순위
   ▼
[고객]  대표 승인 (Approval Workflow의 '창업 승인')   ← 고객은 설계하지 않고 '승인만'
   │
   ▼
[시스템] Company Auto Creation (Company→CEO→Dept→Employee→Skill 인스턴스화)
   │
   ▼
        살아있는 회사 운영 시작 (개정 #003 루프로 연결)
```

## 2. 구성 요소와 책임
| 단계 | 무엇 | 스펙 |
|---|---|---|
| 회원가입(컨설팅) | 온보딩 질문 세트 수집 | [Customer Journey](../specs/customer-journey-spec.md) |
| 사업 진단 | 응답 → 진단(우선순위) | [AI Business Diagnosis](../specs/ai-business-diagnosis-spec.md) |
| 회사 설계/추천 | (업종×단계×진단) → 조직·직원·Skill 추천 | [Org Recommendation](../specs/org-recommendation-spec.md) |
| 대표 승인 | AI 설계안을 대표가 승인 | [Approval Workflow](../specs/approval-workflow-spec.md) |
| 회사 생성 | 승인안을 실제 객체로 인스턴스화 | [Company Creation Flow](../specs/company-creation-flow-spec.md) |

## 3. 경험 분리 (PRODUCT_CHARTER)
- **고객(단순)**: 질문에 답하고 → 진단 요약을 보고 → 설계안을 승인. 진단 규칙·추천 가중·라이프사이클 비노출.
- **운영자/엔진(복잡)**: 진단 로직·추천 템플릿·설계 조합·Approval 평가를 수행. → Operator HQ.

## 4. 살아있는 조직과의 접점
온보딩은 [Company Lifecycle](../specs/company-lifecycle-spec.md)의 **설립→조직 구성** 구간을 자동화한 것이다.
생성 완료 후에는 개정 #003의 살아있는 루프(운영→성과→Health→성장 단계 전이→재추천)로 자연 연결된다.

## 5. 확장성
- 온보딩 질문·진단 규칙·업종 템플릿은 **데이터로 추가**(코드 수정 불필요).
- Customer Journey는 **상태머신** → 단계 추가/분기(예: 결제·온라인 연동) 확장 용이.

## 관련 문서
- [00 시스템 개요](00-overview.md) · [01 조직 아키텍처](01-organization-architecture.md)
- 온보딩 스펙 묶음: [../specs/README.md](../specs/README.md)
