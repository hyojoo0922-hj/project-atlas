# ADR 0003 — 기술 스택 (제안, CEO 승인 불필요 / CTO 자율)

- 상태: Proposed (Sprint 1 착수 시 Accepted 전환)
- 일자: Sprint 0 (설립)

## 배경
CTO는 구현 방법을 자율 결정한다([CTO_CHARTER](../constitution/CTO_CHARTER.md)).
Provider-agnostic·Cost-by-design·멀티테넌시를 만족하는 스택이 필요하다.

## 결정 (제안)
| 영역 | 선택 | 근거 |
|---|---|---|
| 언어 | **TypeScript** (end-to-end) | 프론트/백 타입 공유, 채용·생태계 |
| 모노레포 | **pnpm workspaces + Turborepo** | 빠른 캐시 빌드, 경량 |
| 앱 | **Next.js** (Operator Console, Customer Portal) | 두 경험 분리·SSR·빠른 개발 |
| 데이터 | **Postgres** (jsonb + RLS 후보) | 정형+반정형 혼합, 멀티테넌시 격리 |
| 모델 접근 | **Model Gateway 자체 추상화** | Provider 종속 회피·원가 미터링 강제 |
| 검증 | **Zod** (shared-types와 결합) | 런타임+정적 타입 일치 |

> Postgres 호스팅(예: Supabase 등)·인증·시크릿 관리(KMS/Vault)는 별도 ADR로 Sprint 1에서 확정.

## 근거
- 단일 언어로 `packages/shared-types`를 모든 레이어가 공유 → 일관성·속도.
- Model Gateway를 자체 레이어로 두어 헌법의 "원가 통제 우선"을 구조로 강제.
- Postgres의 jsonb는 Brand Memory의 반정형 데이터에 적합, RLS로 테넌트 격리.

## 대안
- Python 백엔드: AI 생태계 강점이나 타입 공유 약화 → 후보로 보류.
- 벡터 전용 DB 우선: 데이터 축적 전 과한 선택 → Skill/Memory 검색 필요 시점에 재검토.

## 결과
- 이번 Sprint에는 **설치/구현하지 않음.** 결정만 기록.
- Sprint 1 1일차에 워크스페이스 + shared-types 부트스트랩으로 실체화.
