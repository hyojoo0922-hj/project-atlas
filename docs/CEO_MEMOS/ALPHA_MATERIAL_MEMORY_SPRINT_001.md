# ALPHA MATERIAL MEMORY SPRINT #001

> CEO MEMO — Atlas Alpha. 작성 기준일 2026-06-29. 본 문서가 이 Sprint의 단일 진실 공급원이다.

## 목표

업무 중 제공한 자료와, 업무와 상관없이 자료 탭에서 직접 추가한 자료를 **Company Knowledge Vault(자료 인박스)**에 저장하고, 이후 업무에서 **자동 활용**되도록 구현한다. 같은 자료를 다시 묻지 않는다(Trust First: 없으면 요청, 있으면 재사용).

## 범위

- Atlas Alpha 한정 (`services/alpha`, `packages/*` 재사용)
- 로컬 JSON 저장 (`.atlas-data/alpha.json`)
- 외부 AI 연결 없음 / 실결제 없음 / 실DB 추가 없음

## 필수 구현

1. **자료 탭 추가** — 탭 구조: 홈 / 업무 / **자료** / 결과물 / 직원
   - 자료 탭에서 텍스트·URL·파일명·이미지명(mock)을 직접 입력
   - 카테고리: 브랜드 / 상품 / 레퍼런스 / 좋아하는 스타일 / 싫어하는 표현 / 고객·FAQ / 기타
2. **업무 중 제공한 자료 저장** — 자료 제공 시 기본적으로 Company Memory(Vault)에 저장
   - 기록: 출처 업무, 자료 타입(kind), 카테고리, 연결 직원, 생성일
3. **기존 자료 자동 활용** — 새 업무 등록 시 필요한 자료가 Vault에 있으면 다시 요청하지 않음
   - 자동 활용된 자료는 업무 카드에 **"기존 자료 사용"**으로 표시
4. **자료 검색/목록** — 자료 탭에서 전체 자료 확인 + 카테고리 필터 + 간단 검색
5. **Trust First 유지** — 없으면 요청 / 있으면 재사용 / 오래된 자료 판단은 placeholder 가능
6. **테스트** — 업무 자료 제공→Vault 저장 / 새 업무에서 같은 자료 재요청 안 함 / 자료 탭 직접 추가 / 직접 추가 자료의 업무 자동 활용 / `npm test` 통과

## 금지

- 실제 파일 업로드 스토리지 구현 금지 (파일/이미지는 이름 메타데이터만)
- 외부 AI/API 연결 금지 · 실DB 추가 금지 · 실제 이미지/영상 생성 금지
- 대규모 UX 재설계 금지 (기존 탭/카드 흐름 유지, 자료 탭만 추가)

## 설계 결정 (CTO)

- **데이터 모델**: `AlphaData.vault: VaultItem[]` 추가. `VaultItem = { id, infoKey, category, kind, value, note?, sourceTaskId?, byRole?, createdAt }`. `companyInfo`(보유 infoKey 집합)는 기존대로 유지 — 자동 활용 판단은 이 집합을 그대로 사용하므로 재요청 차단이 자연히 동작한다. Vault는 출처·카테고리·날짜·이력을 담는 상위 기록.
- **카테고리 ↔ infoKey**: 업무 제공 자료는 infoKey로부터 카테고리를 역추론. 자료 탭 직접 추가는 카테고리로부터 대표 infoKey를 매핑(브랜드→brand-voice, 상품→product-info, 고객·FAQ→faq 등)해 업무 요구사항을 자동 충족.
- **"기존 자료 사용"**: `taskView.reusedMaterials` = 업무 필요 infoKey 중 이번 업무에서 제공하지 않았는데 이미 Vault(companyInfo)에 있는 항목.
- **버전**: `DATA_VERSION 2→3`(vault 필드 추가, 가산적). 기존 v2 데이터는 forward-merge로 보존(vault 기본 []).

## 완료 보고 항목

테스트 결과 · 커밋 해시 · 실행 방법.
