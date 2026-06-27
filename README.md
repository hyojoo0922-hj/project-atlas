# Project Atlas

> **AI Employee Ecosystem** — 고객은 AI를 *사용*하지 않는다. AI 직원을 *채용*한다.

Project Atlas는 AI 직원(AI Employee)이 **태어나고·배우고·인증받고·일하고·성장하는 생태계**입니다.
도구(Tool)가 아니라 **직원**을, 기능(Feature)이 아니라 **회사를 운영하는 경험**을 제공합니다.

> 📌 정의 업데이트: "AI Workforce OS" → **"AI Employee Ecosystem"** ([개정 #001](docs/constitution/AMENDMENT-001-ai-employee-ecosystem.md)) → **회사를 운영하는 플랫폼** ([개정 #002](docs/constitution/AMENDMENT-002-company-centric-organization.md)). 모두 CEO 승인.
> 계층: **Company → Department → Employee → Skill** (Company가 최상위 객체).
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
└─ Company   ★최상위 (DNA·Culture·CEO Style·Approval·Goal·KPI·Health · Brand Memory · Organization)
   └─ Department  (DNA·KPI·필수Skill·현재수준·Health, 성장)
      └─ Employee (DNA·Skill·Training·Cert·Performance·MatchingProfile·rank, 성장)
         └─ Skill (적합도+인증 기반)
```
캐스케이드 `Goal→KPI→Dept KPI→직원성과` · 롤업 `직원성과→Dept Health→Company Health`.
→ 조직 설계: [Organization Architecture](docs/architecture/01-organization-architecture.md) · 정밀 스펙: [docs/specs/](docs/specs/README.md)

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
- ⭐ [AMENDMENT #002 — Company 중심 조직](docs/constitution/AMENDMENT-002-company-centric-organization.md) — CEO 승인 개정(최우선)

## 현재 상태

🏛️ **Sprint 0 — 회사 설립 (Founding).** 코드 구현 없음. 구조·아키텍처·로드맵 정립.

- 다음 단계 제안: [`docs/sprints/sprint-1-proposal.md`](docs/sprints/sprint-1-proposal.md)
- 전체 로드맵: [`docs/sprints/roadmap.md`](docs/sprints/roadmap.md)

> ⚠️ 이번 Sprint에서 **구현하지 않는 것**: 로그인, 결제, AI API 연동, 영상/이미지 생성.
> 이는 의도된 범위 제한이며, Sprint 1+ 에서 게이트를 통과한 순서로 구현한다.

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
