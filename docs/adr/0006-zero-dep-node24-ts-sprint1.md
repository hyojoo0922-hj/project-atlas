# ADR 0006 — Sprint 1은 Zero-dependency Node 24 TypeScript로 구현한다

- 상태: Accepted
- 일자: 2026-06-27 (Sprint 1 착수)
- 관련: [ADR 0003 기술 스택](0003-tech-stack.md)

## 배경
Sprint 1은 인메모리 walking skeleton이며 실제 외부 의존성(AI API·DB·결제)이 없다.
[ADR 0003](0003-tech-stack.md)은 최종 스택으로 TS/pnpm/Turborepo/Next/Postgres/Zod를 제안했으나,
이는 *외부 의존성이 등장하는 Sprint 2+*에 필요한 것이다.

## 결정
Sprint 1은 **Node 24의 네이티브 TypeScript(type stripping) + 내장 `node:test`**만으로 구현한다.
- 빌드 도구·번들러·외부 패키지 **0개**. `node --test`로 테스트, `node services/demo/run-demo.ts`로 데모.
- 패키지 간 import는 상대경로(`.ts`)로 연결. 워크스페이스 해석기 불필요.
- 런타임 검증이 필요한 곳은 경량 수제 validator. (Zod는 Sprint 2에서 도입)

## 근거
- **재현성·속도**: 설치 단계가 없어 오프라인에서도 즉시 빌드/테스트 통과. CI 표면 최소.
- **범위 정합**: Sprint 1엔 외부 의존성이 없으므로 무거운 툴체인은 과설계.
- **헌법(비용 통제·단순성)**: 불필요한 의존성·공급망 리스크 제거.

## 결과
- 루트 `package.json` 스크립트: `test`(node --test), `demo`, `build:demo`(HTML 스냅샷 생성).
- Sprint 2에서 실제 제공자/DB 연동과 함께 pnpm+Turborepo+Next+Zod로 승격(ADR 0003 발효).
- 디렉터리 구조는 모노레포 그대로 유지 → Sprint 2 마이그레이션 비용 최소.
