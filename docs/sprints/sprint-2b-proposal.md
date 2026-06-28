# Sprint 2B 제안 (CTO → CEO / CPO) — 대표 비서 Work Loop로 살아 움직이는 운영

> 상태: **제안 (CEO 승인 대기)**
> 작성: CTO | 기준: 헌법 + 개정 #001~#004 + MEMO #008(무료/유료)·#009(Trust First)·#010(Work Loop)
> 설계 근거: [architecture/08](../architecture/08-owner-assistant-work-loop.md) · [assistant-work-loop-spec](../specs/assistant-work-loop-spec.md)

## 0. 한 줄 목표
**대표가 비서에게 요청하면, 비서가 분석·조율해 적합 직원이 결과물을 만들고, 비서가 보고한다 — 단, 신뢰할 수 있을 때만.**
(유료 회사에서 가동. 결과물은 mock 생성. 실모델·결제 처리 없음 — Gateway mock·원가 $0)

## 1. 왜 이 범위인가
- #010으로 Work Loop 아키텍처가 고정됨 → 이제 그 오케스트레이션을 인메모리로 구현.
- 2A(온보딩→설립)·#008(경계)·#009(품질 게이트) 위에 **운영 루프**를 얹어 "살아 움직이는 회사"를 완성.
- 결과물 *실제 생성*(외부 모델)은 Sprint 3+. 2B는 **mock 결과물 + 품질 게이트 + 보고/만족도 루프**.

## 2. Sprint 2B 산출물 (In Scope)
1. **assistant 패키지** (신규): 대표 비서 Work Loop 상태머신(received→…→reporting/branch).
2. **task-analysis** (assistant 내): 요청→`TaskAnalysis`(OutputType·필요 직군·정보·Skill) — [Output Scope](../specs/output-scope-spec.md) 사용.
3. **employee selection**: Matching fit × 인증 × Readiness로 직원 선택(미충족→missing).
4. **부족 직원 추천**: `packages/staffing` 연결 → `staff_recommendation` 분기 + 업셀 보고.
5. **정보 요청**: `packages/quality` Readiness → `info_request` 분기 → Brand Memory(Company 스코프) 축적 → 재개.
6. **품질 게이트**: Confidence(≥90/70/<70) → final/draft/info_request. **미통과 시 미실행**.
7. **결과 취합 + 대표 보고**: `AggregatedResult` → `OwnerReport`(정직: 초안/필요자료/추천).
8. **Satisfaction 수집 구조 연결**: 보고 후 `SatisfactionFeedback`(+7일 Outcome) 기록.
9. **(연결) Health 롤업·Growth·재추천**: 성과→Department/Company Health→성장 단계 전이→조직 재추천(2A 도메인 위에).
10. **데모 + 스냅샷**: 카페 "신메뉴 콘텐츠" 요청 → Writer 초안 + Designer 부족 추천 → 보고.

## 3. 명시적 제외 (Out)
- ❌ 외부 AI 모델 실제 호출 — 결과물은 mock(contentRef placeholder). 실모델은 Sprint 3.
- ❌ 영속 DB·실결제·로그인 — 인메모리 유지.
- ❌ 실제 파일/이미지/영상 산출 — Output 메타데이터/상태만.

## 4. 수직 슬라이스 (데모)
> "대표: '오늘 신메뉴 콘텐츠가 필요해' → 비서 분석: social_post+image →
> 직원 확인: Writer 있음, **Designer 없음** → 정보 확인: brand-voice 보유, product-image 없음 →
> 판단: 텍스트 **초안(draft)** 가능 / 이미지 **불가(need_staff+need_info)** →
> Writer에 배분 → mock 초안 취합 → **대표 보고**(초안 완료, Designer 채용+제품이미지 필요) →
> 만족도 요청 → (채용/자료 제공 시 재개)."

이 흐름이 동작하면 **Work Loop + Trust First + 업셀 + 보고**가 모두 증명된다.

## 5. 성공 기준 (DoD)
- [ ] `npm test` green (Work Loop 상태·직원 선택·게이트 분기·보고 신규)
- [ ] 직원 부족 → `staff_recommendation`(업셀), 정보 부족 → `info_request`, 품질<70 → 미실행
- [ ] 대표 비서가 결과물을 직접 만들지 않음(직원 WorkOrder 경유)
- [ ] OwnerReport가 정직하게 초안/필요자료/추천을 포함
- [ ] Satisfaction 기록 → Health/성장 루프 환류(2A 도메인 연결)
- [ ] 데모 + 스냅샷, 새 결정 ADR

## 6. 규모/리스크 · 분할
- 규모: 3~4주. 신규 패키지 1~2개 + orchestrator 확장.
- **분할 옵션**: 2B-1(Work Loop+게이트+보고) / 2B-2(Satisfaction→Health/Growth/재추천 환류).
- 리스크: 직원 선택·취합 규칙은 가설 → v0 규칙 기반·조정 가능.

## 7. CEO / CPO 승인 요청
1. **Sprint 2B 범위 승인** (또는 2B-1/2B-2 분할).
2. 결과물 mock 수준 확인(메타/상태만 vs 간단 텍스트 placeholder).
3. Codex UX: Work Loop 보고 화면([ux-screen-structure](../product/ux-screen-structure.md) 품질·신뢰 UX) 기반.

## 8. 다음 (Sprint 3 예고)
영속화(Postgres+RLS) → Model Gateway 실제 제공자(결과물 실제 생성·원가/ROI 실측) → Codex Next.js UX.
전체: [roadmap](roadmap.md).
