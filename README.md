# Project Atlas

> **고객의 AI 공동창업자(AI Co-founder)** — 회사를 만드는 프로그램이 아니라, 사업을 진단하고 회사를 함께 세웁니다.

Project Atlas는 고객이 가입하면 **무료 AI 컨설팅**으로 사업을 진단하고, **AI가 회사를 설계**하면
대표는 **승인만** 합니다. 이후 Company→CEO→Department→Employee→Skill이 **살아 움직이는 회사**로 운영됩니다.
도구(Tool)가 아니라 **회사를 운영하는 경험**을 제공합니다.

> 📌 정의 진화: AI Employee Ecosystem ([#001](docs/constitution/AMENDMENT-001-ai-employee-ecosystem.md)) → 회사 운영 플랫폼 ([#002](docs/constitution/AMENDMENT-002-company-centric-organization.md)) → 살아 움직이는 회사 ([#003](docs/constitution/AMENDMENT-003-ceo-and-living-organization.md)) → **AI 공동창업자** ([#004](docs/constitution/AMENDMENT-004-ai-cofounder-onboarding.md)). 모두 CEO 승인.
> 계층: **Company → CEO → Department → Employee → Skill** · 첫 경험: **온보딩 = 무료 AI 컨설팅 → 진단 → 자동 설계 → 대표 승인**.
> 용어 원칙: *Feature*가 아니라 **Employee** (예: ~~Writer Feature~~ → **Writer Employee**).

---

## 무엇이 다른가

| 일반 AI 제품 | Project Atlas |
|---|---|
| AI 도구를 쓴다 | AI 직원을 채용한다 |
| 프롬프트를 입력한다 | 직원에게 업무를 맡긴다 |
| 모두에게 같은 기능 | 직원별 적합도 기반 Skill 배포 |
| 결과물만 남는다 | Brand Memory에 회사 맥락이 누적된다 |

## 조직 계층 (Company → Department → Employee → Skill)

Atlas는 회사를 운영하는 플랫폼입니다. 모든 계층이 DNA·목표·건강·성장 루프를 공유합니다.

```
Customer
└─ Company   ★최상위 (DNA·Culture·Goal·KPI·Stage·Health · Brand Memory · Organization)
   ├─ CEO     ★핵심 객체 (DNA·의사결정·승인정책·리스크·브랜드우선·성장전략·Goal·KPI·권한)
   └─ Department  (DNA·KPI·필수Skill·현재수준·Health, 성장)
      └─ Employee (DNA·Skill·Training·Cert·Performance·MatchingProfile·rank, 성장)
         └─ Skill (적합도+인증 기반)
```
캐스케이드 `CEO전략→Company Goal→KPI→Dept KPI→직원성과` · 롤업 `직원성과→Dept Health→Company Health`.
**살아있는 루프**: 조직추천(업종×단계) → 구성 → CEO/Approval → 업무·성과 → Health → 성장단계 → 재추천.
→ 조직 설계: [Organization Architecture](docs/architecture/01-organization-architecture.md) · 정밀 스펙: [docs/specs/](docs/specs/README.md)

## 첫 경험 — 온보딩 (Customer Journey)

```
회원가입(무료 AI 컨설팅) → AI 사업 진단 → AI 회사 설계 → AI 조직/직원/Skill 추천
        → 대표 승인 → Company 생성 완료 → 살아있는 회사 운영
```
고객은 설계하지 않고 **답하고·보고·승인**합니다. → [Onboarding Architecture](docs/architecture/07-onboarding-architecture.md) · [Customer Journey](docs/specs/customer-journey-spec.md)

## 생태계 기관 (Ecosystem Organs)

직원이 강해지는 시스템을 운영하는 기관들:

| 기관 | 역할 | Skill 라이프사이클 구간 |
|---|---|---|
| **AI Research Lab** | Skill 발굴·검증·ROI 분석 | 발견·분석·Sandbox·ROI |
| **Skill Matching Engine** | 직원별 적합도 배포 | 직원 추천 |
| **AI University** | 직원 교육·시험 | 교육·시험 |
| **Certification System** | 자격 인증 | 인증 |
| **Operator HQ** | 위 기관 + 배포·Skill Update·Employee Upgrade 운영 | 배포·성과측정 |

> Skill은 프롬프트가 아니라 **플랫폼 핵심 자산**이며 10단계 라이프사이클을 가집니다(ROI 분석 포함).
> 전체 설계: [`docs/architecture/00-overview.md`](docs/architecture/00-overview.md) · 정밀 스펙: [`docs/specs/`](docs/specs/README.md)

## 설립 헌법 (Source of Truth)

이 회사의 모든 결정은 [`docs/constitution/`](docs/constitution/)의 헌법 문서를 따른다.

- [ATLAS_CONSTITUTION](docs/constitution/ATLAS_CONSTITUTION.md) — 회사 정체성
- [BUSINESS_CONSTITUTION](docs/constitution/BUSINESS_CONSTITUTION.md) — 모든 기능이 통과해야 할 게이트
- [PRODUCT_CHARTER](docs/constitution/PRODUCT_CHARTER.md) — 제품 원칙
- [SKILL_OS_CONSTITUTION](docs/constitution/SKILL_OS_CONSTITUTION.md) — Skill 라이프사이클
- [CEO_CHARTER](docs/constitution/CEO_CHARTER.md) / [CTO_CHARTER](docs/constitution/CTO_CHARTER.md) — 의사결정 권한
- [CLAUDE_FIRST_DIRECTIVE](docs/constitution/CLAUDE_FIRST_DIRECTIVE.md) — 최초 지시
- ⭐ [AMENDMENT #001 — AI Employee Ecosystem](docs/constitution/AMENDMENT-001-ai-employee-ecosystem.md) — CEO 승인 개정
- ⭐ [AMENDMENT #002 — Company 중심 조직](docs/constitution/AMENDMENT-002-company-centric-organization.md) — CEO 승인 개정
- ⭐ [AMENDMENT #003 — CEO·살아있는 조직](docs/constitution/AMENDMENT-003-ceo-and-living-organization.md) — CEO 승인 개정
- ⭐ [AMENDMENT #004 — AI 공동창업자·온보딩](docs/constitution/AMENDMENT-004-ai-cofounder-onboarding.md) — CEO 승인 개정(최우선)

## 현재 상태

✅ **Sprint 2A + 무료/유료 경계(#008) + Trust First 품질 구조(#009)**. 무료=진단·추천 / 유료=실행·운영. 인메모리, **51 tests green**.
- 실행: `npm test` · `npm run demo:onboarding`(무료/유료 경계) · `npm run build:demo` (`npm run demo` = Sprint 1 운영루프)
- 경계: [free-paid-boundary](docs/business/free-paid-boundary.md) · 품질: [quality-boundary](docs/specs/quality-boundary-spec.md) · 보고: [sprint-2a-report.md](docs/sprints/sprint-2a-report.md)
- 다음: **Sprint 2B 제안됨** — [대표 비서 Work Loop](docs/architecture/08-owner-assistant-work-loop.md) 설계 완료([제안서](docs/sprints/sprint-2b-proposal.md))

> ⚠️ 아직 **구현하지 않는 것**: 로그인, 실제 결제 처리, 외부 AI API(Gateway mock·원가 $0), 직원 Work Loop/결과물 생성(2B), 영상/이미지 생성.
> 🔒 **Trust First**: 결과물은 준비도/신뢰도 게이트(≥90 최종/70–89 초안/<70 정보요청)를 통과해야 한다. 부족하면 만들지 않고 요청.

## 저장소 구조

```
Project-Atlas/
├── docs/                  # Documentation First — 설계의 단일 진실 공급원
│   ├── constitution/      # 설립 헌법 + 개정 #001·#002 (변경은 CEO 승인)
│   ├── architecture/      # 시스템 아키텍처 (00 개요, 01 조직 아키텍처 …)
│   ├── specs/             # 정밀 스펙: Company·Department·Organization·Health + Employee·Skill·HQ·Lab·University·Cert
│   ├── product/           # 제품 비전·페르소나·MVP 범위
│   ├── business/          # 수익모델·Employee&Skill 게이트
│   ├── skill-os/          # Skill 라이프사이클 인덱스
│   ├── adr/               # Architecture Decision Records
│   └── sprints/           # Sprint 제안·로드맵
├── apps/                  # (골격) 운영자 콘솔 / 고객 포털
├── packages/              # (골격) brand-memory / skill-library / matching-engine / cost-control
├── services/              # (골격) orchestrator
└── skills/                # (골격) Skill 정의 저장소
```

> `apps/`, `packages/`, `services/`, `skills/` 는 **의도된 구조를 보여주는 골격**이며 이번 Sprint에 코드는 없습니다.

## 의사결정 라인

- **CEO** — 무엇을 만들지 결정 (고객가치·기업가치·수익성·운영성·확장성)
- **CTO** — 어떻게 만들지 자율 결정 (Architecture·Security·Scalability·Cost·Sprint)
- 중대한 **사업 방향 변경**만 CEO 승인을 요청한다.
