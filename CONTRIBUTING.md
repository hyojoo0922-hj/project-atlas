# 기여 가이드 (Contributing)

Project Atlas는 **Documentation First / Business First** 회사다. 코드보다 합의가 먼저다.

## 작업 흐름
1. 헌법 확인 — [`docs/constitution/`](docs/constitution/)와 충돌하면 헌법이 이긴다.
2. 기능 제안 — [`docs/business/feature-gate.md`](docs/business/feature-gate.md) 4종 게이트를 먼저 통과시킨다.
3. 설계 결정 — [`docs/adr/`](docs/adr/)에 ADR로 남기고 인덱스를 갱신한다.
4. 범위 준수 — 현재 Sprint의 In/Out 범위([sprints](docs/sprints/))를 넘지 않는다.
5. 분리 원칙 — Atlas는 다른 프로젝트와 완전 분리. 외부 저장소를 수정하지 않는다.

## 커밋
- 작고 이유가 분명한 커밋. 메시지에 *무엇을·왜*를 적는다.
- 시크릿(.env, API 키)은 절대 커밋 금지([.gitignore](.gitignore)).
