# Sprint 1 완료 보고 (CTO → CEO)

- 상태: ✅ 완료 (구현·테스트·데모 통과)
- 범위: [Sprint 1 v2 제안](sprint-1-proposal.md) · 기준: 헌법 + [개정 #001](../constitution/AMENDMENT-001-ai-employee-ecosystem.md)
- 스택: Zero-dependency Node 24 네이티브 TypeScript ([ADR 0006](../adr/0006-zero-dep-node24-ts-sprint1.md))

## 1. 구현 파일 목록
```
packages/shared-types/src/index.ts              도메인 타입 단일 소스 + ID 유틸
packages/employee-core/src/employee-core.ts     Employee 중심 객체 + 성장 루프
packages/brand-memory/src/brand-memory.ts       회사의 기억(CRUD+리비전)
packages/skill-library/src/skill-library.ts     Skill 자산 + 10단계 라이프사이클
packages/matching-engine/src/matching-engine.ts 직원별 적합도(설명가능)+인증게이트
packages/cost-control/src/model-gateway.ts      Model Gateway(mock)+CostLedger+ROI+Budget
services/orchestrator/src/orchestrator.ts        경험 엔진(입사→…→성과→다음추천)
services/demo/src/scenario.ts                    CEO 데모 흐름 1:1
services/demo/src/run-demo.ts                    Employee 중심 내러티브 출력
services/demo/src/render.ts, build-demo.ts       Operator HQ / Customer HTML 스냅샷
apps/operator-console/public/index.html          운영자 화면 스냅샷(생성물)
apps/customer-portal/public/index.html           고객 화면 스냅샷(생성물)
+ 각 package test/*.test.ts (19개 테스트)
package.json, tsconfig.json
```

## 2. 데모 흐름 (CEO 승인 흐름과 1:1)
고객 회사 생성 → Brand Memory 입력 → Writer Employee 확인 → Skill 적합도 추천 →
교육 → 시험 → 인증 → 배치 → 업무 요청 → mock 결과 → Usage/Cost/ROI 기록 →
성과가 MatchingProfile 반영 → **다음 추천이 달라짐**.
실행: `npm run demo`. 결과 핵심: 초기 추천 `[brand-voice-writer 0.85]` → 성과 후 `[brand-voice-writer 0.99, repurpose-to-channel 0.79]` (repurpose 신규 추천).

## 3. Employee 중심 구조 반영
- Employee = 독립 객체: DNA(genome 불변/phenotype/acquired/lineage) + Skill + Brand Memory 스코프 + Training + Certification + Performance + MatchingProfile.
- 성장 루프: 업무 성과 → PerformanceRecord → MatchingProfile.trackRecord 갱신 → 추천 변화 + Employee Upgrade(trait 획득·lineage append).
- 모든 화면/데이터/로그/데모 용어는 **Employee 중심**(Writer Employee). "Feature" 미사용.

## 4. Skill Lifecycle 반영
- 10단계 상태머신(ROI 분석 포함). 게이트: 단계 건너뛰기 차단 / ROI 없이 roi_evaluated 불가 / ROI≠go면 recommended 불가(hold·kill) / **미인증 배치 차단**.

## 5. Cost / Usage / ROI 기록
- 모든 모델 접근은 Model Gateway(mock) 경유 → CostLedger 1행 기록(provider·model·tokens·cost·billingMode·roiDelivered).
- Sprint 1 cost=0(원가 0 기반). `summary()`로 직원/스킬/브랜드 집계.

## 6. Operator HQ ↔ Customer 분리
- 물리적 분리(`apps/operator-console` ↔ `apps/customer-portal`). 운영자=복잡(Skill·교육·인증·성과·원가), 고객=단순(직원·업무·결과·크레딧).
- 화면 구조/흐름: [ux-screen-structure.md](../product/ux-screen-structure.md).

## 7. Sprint 2에서 Codex 투입 지점
- `apps/*`를 Next.js로 구현(화면 맵·스냅샷 제공). 도메인(`packages/*`,`orchestrator`) 재사용.
- 인메모리 → Postgres+RLS 교체(orchestrator 인터페이스 유지).
- Model Gateway mock → 실제 제공자 1종 연동(원가/ROI 실측), Zod 도입.

## 8. 빌드/테스트 결과
- `npm test` → **19 passing / 0 fail** (node:test).
- `npm run demo` → 흐름 정상, "다음 추천 변화" 확인.
- `npm run build:demo` → HTML 스냅샷 2종 생성.
- 외부 의존성 0 → 설치 없이 재현.

## 9. 범위 준수
미구현 유지: 실제 로그인 · 결제 · 외부 AI API · 이미지/영상 생성. Model Gateway는 mock(원가 0).
