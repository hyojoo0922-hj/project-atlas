# ADR 0014 — 크레딧 게이트 & 이미지 요청 수익화 흐름

- 상태: Accepted
- 근거 메모: [ALPHA_CREDIT_AND_IMAGE_REQUEST_SPRINT_001](../CEO_MEMOS/ALPHA_CREDIT_AND_IMAGE_REQUEST_SPRINT_001.md)

## 맥락

이미지 요청에 기획안(image_brief)을 무료로 자동 제공하면 수익화 지점이 사라진다. 실제 이미지 생성은 아직 OFF이므로, 비용/크레딧을 기록하고 선택지를 제시하는 **구조**가 먼저 필요하다.

## 결정

- 이미지/영상 요청은 결과를 자동 생성하지 않고 **선택 카드**를 제시: ① Designer 채용 ② 1회 이미지 생성 크레딧 사용 ③ 기획안만.
- **크레딧 잔액(`AlphaData.credits`)** Placeholder + **Usage Ledger**(`usage[]`에 `credits`,`requestType` 추가). 텍스트/이미지 모두 기록.
- 크레딧 경로는 잔액 게이트: 부족 시 실행하지 않고 충전/채용 CTA(`credit_blocked`). 충전은 placeholder(`topUpCredits`).
- 크레딧 사용 시에도 실제 생성 OFF — 결과는 `state:"pending"`("이미지 생성 준비됨")까지만.
- `image_brief`는 기획안(③) 또는 Designer(①, fallback) 선택 시에만 생성.
- 기존 자료/Vault/결과물/직원 계약 구조 불변. 실결제·실제 이미지 생성·외부 AI·DB 추가 없음.

## 구현

- store: `credits`, `ImageChoice`/`RequestType`, `TaskResult.state:"pending"`+`requestType`/`creditsUsed`, `AlphaTask.imageChoice`/`needsImageChoice`/`creditShortfall`, `UsageEntry.credits`/`requestType`.
- app: `IMAGE_CREDIT_COST`, `setImageChoice`, `topUpCredits`, `executeTask` 분기, `taskCTA` (`image_choice`/`credit_blocked`/`execute`).
- server: `POST /api/image-choice`, `POST /api/credits/topup`.
- index.html: 선택 카드/크레딧 부족 카드, 결과 카드 요청 유형·크레딧 표시.

## 결과

수익화 선택지·크레딧 게이트·Ledger 토대 확보. 실제 이미지 생성과 실결제는 후속 Sprint에서 이 토대 위에 연결한다.
