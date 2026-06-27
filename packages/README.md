# packages/ — 공유 도메인 로직

> Sprint 1 구현됨(zero-dep TS, ADR 0006). 테스트: `npm test`.

| 패키지 | 역할 | 코드 |
|---|---|---|
| `shared-types/` | 도메인 타입 단일 소스 + ID 유틸 | `src/index.ts` |
| `employee-core/` | **Employee 중심 객체** + 성장 루프 | `src/employee-core.ts` |
| `brand-memory/` | 회사의 기억(CRUD+리비전) | `src/brand-memory.ts` |
| `skill-library/` | Skill 자산 + 10단계 라이프사이클 | `src/skill-library.ts` |
| `matching-engine/` | 직원별 적합도(설명가능)+인증게이트 | `src/matching-engine.ts` |
| `cost-control/` | Model Gateway(mock)+CostLedger+ROI | `src/model-gateway.ts` |
