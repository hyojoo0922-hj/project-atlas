# MVP 범위 (MVP Scope)

> MVP의 목표: "AI 직원을 채용한다"는 **핵심 경험**을 가장 작은 형태로 증명한다.
> 결제·실모델 호출 없이도 *직원·기억·적합도 배포*의 골격을 보여줄 수 있어야 한다.

## MVP가 증명해야 할 가설
1. 사용자는 "도구"가 아니라 "직원"으로 인식하면 더 오래 머문다(구독↑).
2. **Brand Memory 축적**이 전환·잔존의 핵심 동인이다(해자).
3. **직원별 적합도 배포**가 결과 품질과 신뢰를 높인다.

## MVP 포함 (In)
- AI 직원 생성/관리(역할·페르소나·메모리 범위) — *개념/UI 골격*.
- Brand Memory CRUD + 버전관리(개념).
- Skill Library 카탈로그 + 라이프사이클 상태 표시.
- Matching Engine v0(규칙 기반, 설명 가능 점수).
- Operator Console / Customer Portal 분리.
- Cost Control 모델: Budget/CostLedger + Model Gateway **인터페이스**.

## MVP 제외 (Out) — 이번 회사 설립 Sprint 기준
- ❌ 로그인/인증
- ❌ 결제/청구
- ❌ 실제 AI API 호출 (Model Gateway는 인터페이스만)
- ❌ 영상 생성 / 이미지 생성
- ❌ 학습 기반 랭킹(Matching v1) — 데이터 축적 후

## 비기능 요건(설계 시 반영)
- 멀티테넌트 격리, 원가 미터링 자리, 감사 로그 자리를 *처음부터* 데이터 모델에 둔다.

> 구현 착수는 [Sprint 1 제안](../sprints/sprint-1-proposal.md) 참조.
