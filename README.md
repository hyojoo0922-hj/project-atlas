# Project Atlas

> **AI Workforce OS** — 고객은 AI를 *사용*하지 않는다. AI 직원을 *채용*한다.

Project Atlas는 기업이 AI 직원(AI Employee)을 채용·교육·배치·관리하는 운영체제(OS)입니다.
도구(Tool)가 아니라 **직원**을, 기능(Feature)이 아니라 **회사를 운영하는 경험**을 제공합니다.

---

## 무엇이 다른가

| 일반 AI 제품 | Project Atlas |
|---|---|
| AI 도구를 쓴다 | AI 직원을 채용한다 |
| 프롬프트를 입력한다 | 직원에게 업무를 맡긴다 |
| 모두에게 같은 기능 | 직원별 적합도 기반 Skill 배포 |
| 결과물만 남는다 | Brand Memory에 회사 맥락이 누적된다 |

## 3개의 핵심 축

1. **Brand Memory** — 고객/브랜드의 맥락(보이스·자산·제품·정책·이력)을 영속 저장. 모든 직원이 공유하는 기억.
2. **Skill Library** — 직원이 습득하는 능력의 카탈로그. 발견→인증→배포의 라이프사이클을 가짐.
3. **Matching Engine** — 직원과 Skill의 적합도를 계산. 모두에게 같은 Skill을 주지 않고, *맞는 직원에게* 배포.

> 자세한 설계는 [`docs/architecture/00-overview.md`](docs/architecture/00-overview.md) 참조.

## 설립 헌법 (Source of Truth)

이 회사의 모든 결정은 [`docs/constitution/`](docs/constitution/)의 헌법 문서를 따른다.

- [ATLAS_CONSTITUTION](docs/constitution/ATLAS_CONSTITUTION.md) — 회사 정체성
- [BUSINESS_CONSTITUTION](docs/constitution/BUSINESS_CONSTITUTION.md) — 모든 기능이 통과해야 할 게이트
- [PRODUCT_CHARTER](docs/constitution/PRODUCT_CHARTER.md) — 제품 원칙
- [SKILL_OS_CONSTITUTION](docs/constitution/SKILL_OS_CONSTITUTION.md) — Skill 라이프사이클
- [CEO_CHARTER](docs/constitution/CEO_CHARTER.md) / [CTO_CHARTER](docs/constitution/CTO_CHARTER.md) — 의사결정 권한
- [CLAUDE_FIRST_DIRECTIVE](docs/constitution/CLAUDE_FIRST_DIRECTIVE.md) — 최초 지시

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
│   ├── constitution/      # 설립 헌법 (불변, 변경은 CEO 승인)
│   ├── architecture/      # 시스템 아키텍처 (CTO 영역)
│   ├── product/           # 제품 비전·페르소나·MVP 범위
│   ├── business/          # 수익모델·기능 게이트
│   ├── skill-os/          # Skill 라이프사이클 상세
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
