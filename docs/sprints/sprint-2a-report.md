# Sprint 2A 완료 보고 (CTO → CEO / CPO)

- 상태: ✅ 완료 (구현·테스트·데모 통과)
- 범위: 온보딩 → 진단 → 회사 설계 → 대표 승인 → **Company 생성**까지만. (운영 루프·Health·Growth·재추천 = 2B)
- 스택: Zero-dependency Node 24 TypeScript ([ADR 0006](../adr/0006-zero-dep-node24-ts-sprint1.md)) · seed 업종 = **카페**

## 1. 구현 파일 목록
```
packages/shared-types/src/onboarding-types.ts     온보딩/조직 도메인 타입(+RoleFamily 확장)
packages/onboarding/src/onboarding.ts             컨설팅 질문 세트 + Customer Journey 상태머신
packages/diagnosis/src/diagnosis.ts               AI Business Diagnosis(규칙 엔진)
packages/org-recommendation/src/recommendation.ts (업종×단계×진단) 조직 추천 + 카페 템플릿
packages/company-core/src/company-core.ts         Company/CEO/Department/Employee 팩토리
packages/organization/src/organization.ts         조직 트리(불변식 강제)
packages/company-creation/src/company-creation.ts 설계안→대표 승인→Company 생성
services/onboarding/src/onboarding-flow.ts         온보딩 경험 엔진(8단계)
services/demo/src/onboarding-scenario.ts           카페 시나리오
services/demo/src/run-onboarding-demo.ts           내러티브 데모(npm run demo:onboarding)
services/demo/src/render-onboarding.ts             화면/상태 스냅샷(Customer/Operator)
apps/*/public/onboarding.html                      생성된 HTML 스냅샷(CPO UX 레퍼런스)
+ 각 package test/*.test.ts (2A 신규 21개)
```

## 2. 온보딩 상태 흐름 (Customer Journey)
```
signup → diagnosing → designing → recommending → reviewing → approving → created
                                          └─(반려)─ revising ─┘
```
- `created`는 **반드시 `approving`(대표 승인)**을 거친다(불법 전이 차단, 테스트로 검증).
- 고객 행위는 단 2번: **컨설팅 응답** + **대표 승인**. 나머지는 AI 수행.

## 3. AI Business Diagnosis 결과 예시 (카페)
입력: 재고/발주 시간소모 · 신규 고객 유입 문제 · 온라인 매출 성장 · 직원 3 · 온라인X · 브랜드X
```
1. operations (4)  — 운영성 업무 집중 + 소규모 운영 부하
2. marketing  (3)  — 수요 창출 문제 + 온라인 채널 구축 필요
3. content    (1.5)— 브랜드 미보유 → 보이스 정립
핵심 병목 = 운영 체계
→ "지금은 마케팅보다 운영 체계를 먼저 만드는 것이 좋습니다."
```
같은 업종이라도 응답이 다르면 firstBuild가 달라진다(예: 브랜드 인지도 문제 → content 우선) — 테스트 검증.

## 4. 추천 Company/Department/Employee/Skill 구조
```
Company: 로마티 카페 (cafe, 초기 성장) · 목표: 온라인 매출 중심 성장
CEO: 위임 medium · 리스크 medium · 브랜드우선 build-brand-voice
Departments (진단 우선순위순):
  [1] Operations  → Operations Employee(운영 매니저)  · Skill: inventory-mgmt, quality-check
  [2] Marketing   → Writer Employee(콘텐츠 라이터)    · Skill: brand-voice-writer, repurpose-to-channel
  (Customer Care는 '안정화' 단계부터 → 지금은 미포함, "동일 시작 금지")
```

## 5. 대표 승인 후 Company 생성 방식
1. `buildDesignDraft(진단, 추천)` → **CompanyDesignDraft(status=draft)**. *이 시점엔 실제 객체 없음.*
2. `requestFoundingApproval` → ApprovalRequest(founding, pending).
3. 대표가 `approve` → draft.status=approved.
4. `createCompanyFromDraft` → **승인된 draft만** Company·CEO·Department·CompanyEmployee + 조직 트리 인스턴스화.
   - 미승인 draft로 호출 시 `ApprovalRequiredError`(테스트 검증).
   - 조직 트리는 단일 루트·직원 리프·사이클 금지 불변식 통과.

## 6. CPO UX 인계 — 화면/상태 구조
- **상태머신**: 위 7+1 상태가 그대로 화면 단계. → [Customer Journey Spec](../specs/customer-journey-spec.md)
- **고객 화면(4스텝)**: 컨설팅 → 진단 요약 → 설계안 → 승인. (진단 규칙·가중 비노출) → `apps/customer-portal/public/onboarding.html`
- **운영자 화면**: Journey 상태 + 진단 점수 + 추천/생성 조직 + Audit. → `apps/operator-console/public/onboarding.html`
- 화면 맵 전체: [ux-screen-structure.md](../product/ux-screen-structure.md)
- 도메인 API는 `services/onboarding/src/onboarding-flow.ts`의 `OnboardingFlow.run()` 하나로 노출 → UX는 상태별 데이터만 바인딩.

## 7. 테스트 결과
- `npm test` → **40 passing / 0 fail** (Sprint 1: 19 + Sprint 2A: 21). node:test, 외부 의존성 0.

## 8. 데모 결과
- `npm run demo:onboarding` → 카페 온보딩 전 단계 정상, Journey `signup→…→created`.
- `npm run build:demo` → 온보딩 HTML 스냅샷 2종 생성.

## 9. Git 커밋 상태
- 본 보고와 함께 커밋. Sprint 1 코드 미변경(회귀 없음).

## 10. 범위 준수 (CPO 기준 고정)
- 회원가입=무료 AI 컨설팅 / 질문 폼이 아닌 진단 / 고객은 승인만 — 모두 반영.
- 운영 루프·Health 롤업·Growth·재추천은 **미구현(2B)**. 실모델·로그인·결제·영상/이미지 없음(Gateway mock·원가 $0).
