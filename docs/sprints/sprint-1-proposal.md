# Sprint 1 제안 v2 (CTO → CEO) — Employee 중심 재제안

> 상태: **재제안 (CEO 승인 대기)**
> 작성: CTO | 기준: 헌법 + [개정 #001](../constitution/AMENDMENT-001-ai-employee-ecosystem.md) + [아키텍처](../architecture/00-overview.md) + [스펙](../specs/README.md)
> 변경: 개정 #001(AI Employee Ecosystem)을 반영해 **Employee를 중심**으로 범위를 재구성.

## 0. 한 줄 목표
**"AI 직원을 채용하고, 회사의 기억으로 일을 맡기고, 성과로 성장시킨다"는 핵심 경험의 *걷는 골격(walking skeleton)*을 만든다.**
실제 모델 호출·결제·로그인 없이, **Employee(중심 객체)**를 축으로 Brand Memory · Skill(자산) · Matching · 인증·성과가 살아있는 수직 슬라이스.

## 1. 왜 이 범위인가 (헌법 + 개정 정합성)
- **Employee-centric**: 직원을 DNA·Skill·기억·훈련·인증·성과·매칭으로 구성된 *독립 객체*로 코드에 처음 표현.
- **Documentation First → Code Second**: Sprint 0의 스펙 7종을 *가장 얇게* 코드로 증명.
- **Business First / Cost Control**: 결제·실모델 없이 "직원/기억/적합도/ROI"라는 차별 가치를 0원 원가로 시연. Model Gateway는 mock.
- 금지 항목(로그인/결제/AI API/영상·이미지)은 **여전히 제외**.

## 2. Sprint 1 산출물 (In Scope)
1. **모노레포 부트스트랩** — pnpm + Turborepo, `packages/shared-types`(Zod). [ADR 0002](../adr/0002-monorepo-structure.md)/[0003](../adr/0003-tech-stack.md)/[0005](../adr/0005-ai-employee-ecosystem-pivot.md) 확정.
2. **Employee 도메인 코어 (인메모리)** — [Employee DNA Spec](../specs/employee-dna-spec.md) 구현:
   `Employee` + `EmployeeDNA`(genome/phenotype/acquired/lineage) + `MatchingProfile` + `TrainingRecord`/`Certification`/`PerformanceRecord` 타입 + 인메모리 리포지토리.
3. **Brand Memory v0** — CRUD + 버전관리(리비전) (`packages/brand-memory`).
4. **Skill Library v0 (자산 + 10단계)** — 카탈로그 + 라이프사이클 상태머신(ROI 단계 포함) (`packages/skill-library`).
   - 첫 직군 = **Writer Employee(콘텐츠 라이터)** (CEO 승인). seed Skill: `brand-voice-writer`, `product-description-writer`, `repurpose-to-channel` (매니페스트만).
5. **Skill Matching Engine v0** — `MatchingProfile` 입력, 규칙 기반 설명가능 fit score + 인증 선행 게이트 (`packages/matching-engine`), 단위 테스트.
6. **Certification 규칙 v0** — "미인증 (직원×Skill)은 배치 불가" 강제 + 상태(active/expired/revoked).
7. **Model Gateway 인터페이스 + Mock + ROI 필드** — 호출 시 `CostLedger`에 모의 비용/ROI 기록 (`packages/cost-control`). *실 제공자 호출 없음.*
8. **Operator HQ 콘솔 (읽기 위주 골격)** — 직원(DNA·Skill·Cert·성과)·Skill 라이프사이클·적합도(사유)·원가를 *보여주는* 화면. seed 데이터 기반.

## 3. 명시적 제외 (Out)
- ❌ 로그인/인증 · ❌ 결제/청구 · ❌ 실제 AI API · ❌ 영상/이미지 생성
- ❌ 생태계 기관의 *실행 엔진*(Sandbox 실제 실행, 실제 교육/평가) — 데이터·상태로만 표현, 실행은 Sprint 4
- ❌ Customer Portal 완성(Operator HQ 먼저, Sprint 3)
- ❌ 영속 DB(인메모리로 시작 → 검증 후 Postgres, Sprint 2)
- ❌ Matching v1(학습 랭킹) — 데이터 축적 후

## 4. 수직 슬라이스 (데모 시나리오 — Employee 성장 루프)
> "운영자가 **Writer Employee 'Writer-01'**의 DNA(genome: creator/content)를 보고 →
> Brand Memory(voice)가 채워져 있고 → Skill `brand-voice-writer`의 적합도 0.82(사유 분해 표시)로 추천 →
> 교육(TrainingRecord)·시험 합격 → **인증(Certification active)** → 배치(SkillAssignment, certified=true) →
> mock 실행 시 CostLedger에 0.0$ + ROI 기록 → 성과(PerformanceRecord)가 MatchingProfile을 갱신해 다음 Skill 추천 후보가 바뀐다."

이 한 흐름이 끝까지 동작하면 **Employee 중심 모델 + Skill 자산 라이프사이클 + 인증 게이트 + 원가/ROI + 성장 루프**가 모두 증명된다.

## 5. 성공 기준 (Definition of Done)
- [ ] `pnpm install && pnpm test` 통과 (도메인 패키지 단위 테스트 green)
- [ ] Employee가 7개 구성요소를 가진 객체로 표현되고, DNA genome은 불변·lineage는 append
- [ ] Matching Engine이 신호별 분해(breakdown)+사유와 함께 점수 반환, **인증 미보유 시 eligible=false**
- [ ] Skill 라이프사이클 10단계 전이가 게이트대로 동작(불법 전이·미인증 배치 차단, ROI 미달 kill/hold)
- [ ] Brand Memory 수정 시 리비전 누적(손실 없음)
- [ ] CostLedger에 mock 비용 + ROI 필드 기록
- [ ] Operator HQ 콘솔에서 위 데모 시나리오를 눈으로 확인
- [ ] 모든 새 결정은 ADR로 기록

## 6. 규모/리스크
- 규모: 1 스프린트(추정 1.5~2주, 1인+AI). 인메모리라 인프라 리스크 낮음. 개정 반영으로 Sprint 0 대비 도메인 타입이 늘어 약간 증가.
- 리스크: Matching 가중치·ROI 임계는 *가설* → v0는 규칙 기반·조정 가능하게. 데이터 축적 후 재검토.

## 7. CEO 승인 요청
이 재제안은 [개정 #001](../constitution/AMENDMENT-001-ai-employee-ecosystem.md)의 구조 반영분이며, 추가 *사업 방향 결정*은 없습니다(첫 직군=콘텐츠 라이터 기승인 유지).
요청: **본 Sprint 1 v2 범위 승인** → 승인 시 모노레포 부트스트랩부터 구현 착수.

## 8. 다음 (Sprint 2 예고)
영속화(Postgres+RLS) → 실제 Model Gateway 1개 제공자 연동(원가/ROI 실측) → 이후 Customer Portal·생태계 기관 실행 엔진.
전체 흐름: [roadmap](roadmap.md).
