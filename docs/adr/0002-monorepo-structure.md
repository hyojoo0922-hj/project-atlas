# ADR 0002 — 모노레포 구조를 채택한다

- 상태: Accepted
- 일자: Sprint 0 (설립)

## 배경
Atlas는 다수의 앱(Operator Console, Customer Portal)과 공유 도메인 패키지
(brand-memory, skill-library, matching-engine, cost-control)로 구성된다.
이들은 타입과 도메인 모델을 강하게 공유한다.

## 결정
단일 저장소(monorepo)를 사용한다. 구조:
- `apps/*` — 사용자 대면 앱 (운영자/고객 분리, PRODUCT_CHARTER 준수)
- `packages/*` — 공유 도메인 로직 (재사용·단일 타입 소스)
- `services/*` — 백엔드/오케스트레이션
- `skills/*` — Skill 정의
- `docs/*` — 단일 진실 공급원

## 근거
- 도메인 타입 공유(`packages/shared-types`)로 일관성 확보.
- 운영자/고객 경험을 *물리적으로* 분리해 "복잡성↔단순함" 원칙을 구조로 강제.
- 원자적 변경(크로스 패키지 리팩터)이 쉬움.

## 대안
- 폴리레포: 초기 오버헤드·버전 동기화 비용 큼 → 기각.

## 결과
- Sprint 1에서 워크스페이스 도구(pnpm/turborepo 후보, [ADR 0003](0003-tech-stack.md))로 실체화.
- 이번 Sprint는 **골격 디렉터리 + README**만 둔다(코드 없음).
