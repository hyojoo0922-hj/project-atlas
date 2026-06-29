# ALPHA CREDIT & IMAGE REQUEST SPRINT #001

> CEO MEMO — Atlas Alpha. 작성 기준일 2026-06-29. 본 문서가 이 Sprint의 단일 진실 공급원이다.

## 목표

Atlas Alpha에 **크레딧/원가 게이트**와 **이미지 요청 수익화 흐름**을 구현한다. 실제 이미지 생성은 아직 하지 않는다.

## 핵심 원칙

1. 실제 이미지 생성은 아직 하지 않는다(OFF).
2. 이미지 요청 시 **기획안만 기본 제공하지 않는다.** 먼저 선택을 받는다.
3. 이미지 요청 시 **선택 카드**를 제공한다:
   - a. Designer 채용하기
   - b. 1회 이미지 생성 크레딧 사용
   - c. 기획안만 받기
4. 텍스트 생성/이미지 요청 모두 **예상 크레딧 + 비용**을 Usage Ledger에 기록한다.
5. 크레딧 부족 시 **실행하지 않고** 충전/채용 CTA를 보여준다.
6. 기존 자료/Vault/결과물/직원 계약 구조는 유지한다.

## 필수 구현

- **Credit balance (Placeholder)** — `AlphaData.credits`(실결제 없음, 충전은 placeholder).
- **Usage Ledger** — 기존 `usage[]` 확장: `credits`(예상 크레딧) + `requestType`.
- **이미지 요청 선택 카드** — a) Designer 채용, b) 1회 크레딧 사용, c) 기획안만.
- **실제 image generation OFF** — 어떤 경로도 실제 이미지를 만들지 않는다.
- **크레딧 사용 시에도** 현재는 "이미지 생성 대기/준비됨" 상태(`state: "pending"`)까지만.
- **image_brief는 fallback 또는 기획안(c) 선택 시에만** 제공(Designer 선택 시 Designer 작성 기획안 = fallback).
- **결과물 카드/결과물 탭에 크레딧·요청 유형 표시.**
- **테스트 추가 / npm test 통과 / 커밋.**

## 금지

- 실결제 구현 금지 · 실제 이미지 생성 금지 · 외부 AI/API 추가 연결 금지 · DB 추가 금지 · 대규모 UI 재설계 금지.

## 설계 (CTO)

- **store**: `AlphaData.credits:number`(부트스트랩 placeholder). `UsageEntry`에 `credits`,`requestType` 추가. `TaskResult`에 `requestType`,`creditsUsed` 추가 + `state`에 `"pending"`. `AlphaTask`에 `imageChoice?("designer"|"credit"|"brief")`,`needsImageChoice?`,`creditShortfall?`.
- **app**: `IMAGE_CREDIT_COST=1`. 이미지 subtask는 `imageChoice` 전까지 결과 생성 안 함(선택 카드). `setImageChoice`(designer 선택 시 디자이너 없으면 채용), `topUpCredits`(충전 placeholder). `executeTask`가 선택별 분기 — credit(크레딧 차감+pending, 부족 시 미실행), brief/designer(image_brief). 텍스트/이미지 모두 Ledger 기록. `taskCTA`: `image_choice`/`credit_blocked`/`execute`.
- **server**: `POST /api/image-choice`, `POST /api/credits/topup`.
- **index.html**: 업무 카드에 이미지 선택 카드 + 크레딧 부족 시 충전/채용 CTA, 결과 카드에 요청 유형·크레딧 표시. 기존 탭/카드 구조 유지.

## 완료 보고 항목

테스트 결과 · 커밋 해시 · 실행 방법.
