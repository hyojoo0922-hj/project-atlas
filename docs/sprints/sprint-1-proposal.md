# Sprint 1 제안 (CTO → CEO)

> 상태: **제안 (CEO 승인 대기)**
> 작성: CTO | 기준: 헌법 전체 + [아키텍처](../architecture/00-overview.md)

## 0. 한 줄 목표
**"AI 직원을 채용하고, 회사의 기억으로 일을 맡긴다"는 핵심 경험의 *걷는 골격(walking skeleton)*을 만든다.**
실제 모델 호출·결제·로그인 없이, 도메인 3축(Brand Memory · Skill Library · Matching)이 살아있는 수직 슬라이스.

## 1. 왜 이 범위인가 (헌법 정합성)
- **Documentation First → Code Second**: Sprint 0에서 합의된 설계를 *가장 얇게* 코드로 증명.
- **Business First**: 결제·실모델 없이도 "직원/기억/적합도"라는 **차별적 가치**를 시연 가능 → 투자/고객 검증 가속.
- **Cost Control**: Model Gateway는 인터페이스+모의(mock)로만. 원가 0으로 구조 검증.
- 금지 항목(로그인/결제/AI API/영상·이미지)은 **여전히 제외**.

## 2. Sprint 1 산출물 (In Scope)
1. **모노레포 부트스트랩** — pnpm + Turborepo, `packages/shared-types`(Zod 도메인 타입). [ADR 0002](../adr/0002-monorepo-structure.md)/[0003](../adr/0003-tech-stack.md) 확정.
2. **도메인 코어 (메모리 내/로컬)** — `Customer/Brand/Employee/Skill/SkillVersion/SkillAssignment/BrandMemory` 타입 + 인메모리 리포지토리.
3. **Brand Memory v0** — CRUD + 버전관리(리비전) 로직 (`packages/brand-memory`).
4. **Skill Library v0** — 카탈로그 + 라이프사이클 상태머신 (`packages/skill-library`). seed Skill 2~3개(매니페스트만).
   - 첫 직군 = **콘텐츠 라이터**(CEO 승인). seed Skill 후보: `brand-voice-writer`, `product-description-writer`, `repurpose-to-channel`(원문→채널별 변형).
5. **Matching Engine v0** — 규칙 기반 설명가능 fit score (`packages/matching-engine`), 단위 테스트.
6. **Model Gateway 인터페이스 + Mock** — 호출 시 `CostLedger`에 모의 비용 기록 (`packages/cost-control`). *실 제공자 호출 없음.*
7. **Operator Console (읽기 위주 UI 골격)** — 직원·Skill·적합도·원가를 *보여주는* 화면. seed 데이터 기반.

## 3. 명시적 제외 (Out)
- ❌ 로그인/인증 · ❌ 결제/청구 · ❌ 실제 AI API · ❌ 영상/이미지 생성
- ❌ Customer Portal 완성(Operator 먼저, 다음 Sprint)
- ❌ 영속 DB(인메모리/로컬로 시작 → 검증 후 Postgres, Sprint 2)

## 4. 수직 슬라이스 (데모 시나리오)
> "운영자가 직원 'Writer-01'을 보고 → Brand Memory(voice)가 채워져 있고 →
> Skill 'brand-voice-writer'의 적합도 0.82로 추천됨 → 배포 → mock 실행 시 원가가 CostLedger에 0.0$로 기록된다."

이 한 흐름이 끝까지 동작하면 3축 + 원가 구조가 모두 증명된다.

## 5. 성공 기준 (Definition of Done)
- [ ] `pnpm install && pnpm test` 통과 (도메인 패키지 단위 테스트 green)
- [ ] Matching Engine이 신호별 분해(breakdown)와 함께 점수 반환
- [ ] Skill 라이프사이클 전이가 게이트 규칙대로 동작(불법 전이 차단)
- [ ] Brand Memory 수정 시 리비전 누적(손실 없음)
- [ ] Operator Console에서 위 데모 시나리오를 눈으로 확인
- [ ] 모든 새 결정은 ADR로 기록

## 6. 규모/리스크
- 규모: 1 스프린트(추정 1~2주, 1인+AI 기준). 인메모리라 인프라 리스크 낮음.
- 리스크: Matching 가중치는 *가설* → v0는 규칙 기반·조정 가능하게. 데이터 축적 후 v1 재검토.

## 7. CEO 결정 사항 (해결됨)
이 제안은 **사업 방향 변경이 아니라 합의된 설계의 첫 구현**이므로 CTO 자율 범위.
1건의 CEO 결정만 요청 → **해결**:
> ✅ **첫 타깃 직군 = 콘텐츠 라이터** (CEO 승인, 2026-06-27).
> 근거: Brand Memory(voice/product) 해자가 가장 직관적으로 드러나고, 효주님 기존 사업(콘텐츠/뷰티/카페)과 즉시 시너지.

## 8. 다음 (Sprint 2 예고)
영속화(Postgres+RLS) → 실제 Model Gateway 1개 제공자 연동(원가 실측) → Customer Portal.
전체 흐름: [roadmap](roadmap.md).
