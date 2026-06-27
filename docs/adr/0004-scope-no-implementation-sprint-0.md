# ADR 0004 — Sprint 0는 구현이 아니라 회사 설립이다

- 상태: Accepted
- 일자: Sprint 0 (설립)

## 배경
[CLAUDE_FIRST_DIRECTIVE](../constitution/CLAUDE_FIRST_DIRECTIVE.md): "이번 Sprint 목표는 구현이 아니라 회사 설립."
명시적 구현 금지 항목: 로그인, 결제, AI API, 영상생성, 이미지생성.

## 결정
Sprint 0의 산출물은 **구조·문서·아키텍처·로드맵**으로 한정한다.
`apps/`·`packages/`·`services/`·`skills/`는 의도를 드러내는 **골격(README only)**으로 둔다.

## 근거
- 잘못된 기초 위 구현은 비싸다. Documentation First로 설계를 먼저 합의.
- 금지 항목은 비용·보안·범위 리스크가 큰 영역 → 게이트 통과 후 순차 도입.

## 결과
- 코드 0줄. 설계 합의·로드맵 확보.
- 다음: [Sprint 1 제안](../sprints/sprint-1-proposal.md)에서 첫 구현 범위를 정의.
