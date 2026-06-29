# ALPHA DEPLOY & PERSISTENCE SPRINT #001

> CEO MEMO — Atlas Alpha. 작성 기준일 2026-06-29. 본 문서가 이 Sprint의 단일 진실 공급원이다.

## 목표

Atlas Alpha를 로컬 터미널 실행이 아니라 **핸드폰에서 접속 가능한 배포 환경**으로 전환하고,
자료/Vault/업무/결과물/직원/Usage Ledger/크레딧이 저장되도록 **Supabase 영속화**를 준비한다.

## 핵심 / 범위

- **Vercel 배포 준비** — `vercel.json` + 서버리스 함수 엔트리(공용 핸들러 재사용).
- **Supabase schema 설계** — 운영 스냅샷 테이블 + 정규화 엔티티 테이블(설계).
- **로컬 JSON 의존 제거(선택형)** — Storage **Persister** 추상화: 기본 JSON 파일, `ATLAS_DB=supabase`면 Supabase.
- 자료/결과물/업무/직원/크레딧/Usage 저장.
- API 키는 **env로만** 관리(코드 하드코딩 금지). 실제 텍스트 생성은 `ATLAS_LLM` 토글 유지.
- 이미지/영상 실제 생성 금지 · 실결제 금지 · 기존 Alpha UX 유지.

## 설계 (CTO)

### Storage Persister 추상화
- `Persister { load(): AlphaData|null|Promise; save(data): void|Promise }`.
- `AlphaStore`는 Persister를 주입받는다. 기본 = JSON 파일(`jsonPersister`, 동기). 서버 부팅 시 `ATLAS_DB=supabase`면 Supabase Persister 사용.
- `save()`는 동기(JSON) 또는 fire-and-forget(Supabase) — 인메모리 `data`가 요청 중 단일 진실, 변경 즉시 비동기 저장.

### Supabase Adapter
- `services/alpha/src/supabase.ts` — zero-dep `fetch`로 PostgREST 사용.
- 운영 저장: 단일 행 JSONB 스냅샷 테이블 `alpha_state(id, owner_name, data jsonb, updated_at)` upsert/select.
- 정규화 엔티티 테이블(companies/employees/departments/tasks/materials/vault_items/task_results/usage_ledger/credits)은 **설계(SQL)** 로 제공 — 후속 per-entity 마이그레이션의 목표 모델.

### 배포
- 공용 라우팅 핸들러 `handler.ts`(`handleApi`)를 추출 → node:http 서버와 Vercel 함수가 동일 로직 공유.
- Vercel 서버리스 인스턴스는 휘발성이므로 영속화는 **Supabase 필수**(env로 활성화). 로컬은 JSON 기본.

## env 설정 목록

| 변수 | 용도 | 기본 |
|---|---|---|
| `PORT` / `HOST` | 서버 포트/바인딩 | 4317 / 0.0.0.0 |
| `ATLAS_PASS` | 로그인 비밀번호 | atlas |
| `ATLAS_DB` | `json`(기본) 또는 `supabase` | json |
| `SUPABASE_URL` | Supabase 프로젝트 URL | — |
| `SUPABASE_SERVICE_ROLE_KEY` | 서버 전용 키(서버리스/서버에서만) | — |
| `ATLAS_LLM` | 실제 텍스트 생성 on/off | off |
| `ANTHROPIC_API_KEY` | 실제 생성 키 | — |
| `ATLAS_LLM_MODEL` / `ATLAS_LLM_URL` | 모델/엔드포인트(선택) | haiku / 실제 |

## 배포 런북 (대표 계정 필요 — 외부 리소스는 대표가 생성)

1. **Supabase**: 프로젝트 생성 → SQL Editor에 `supabase/migrations/0001_alpha_schema.sql` 실행 → Project URL과 service_role 키 확보.
2. **Vercel**: 저장소 연결 → 환경변수(위 표) 설정(`ATLAS_DB=supabase`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, 필요 시 `ATLAS_LLM`/`ANTHROPIC_API_KEY`) → 배포 → 발급된 `https://<project>.vercel.app` 가 핸드폰 접속 URL.
3. **로컬 대안(즉시)**: `npm run alpha` → 같은 WiFi에서 출력된 `http://<LAN-IP>:4317`.

> 주의: Supabase 프로젝트/Vercel 배포는 대표 계정 로그인이 필요한 외부·과금 작업이라 CTO가 자동 생성하지 않는다. 본 Sprint는 그 준비(스키마·어댑터·설정·런북)까지다.

## 완료 보고 항목

배포 URL · Supabase 적용 SQL · env 목록 · 테스트 결과 · 커밋 해시 · 핸드폰 접속 방법.
