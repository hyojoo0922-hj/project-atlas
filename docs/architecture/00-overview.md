# 00 — 아키텍처 개요 (System Overview)

> CTO 영역. 헌법([constitution](../constitution/))을 구현 가능한 시스템으로 번역한 문서.

> ⭐ [개정 #001](../constitution/AMENDMENT-001-ai-employee-ecosystem.md): Atlas는 **AI Employee Ecosystem**.
> ⭐ [개정 #002](../constitution/AMENDMENT-002-company-centric-organization.md)·[#003](../constitution/AMENDMENT-003-ceo-and-living-organization.md): 최상위는 **Company**, 계층 = **Company → CEO → Department → Employee → Skill**.
> Atlas는 회사를 운영하는 플랫폼이며 목표는 회사가 **살아 움직이는 것**(Approval·Growth·Health·Recommendation 연결). 조직 상위 그림: [01-organization-architecture.md](01-organization-architecture.md).

## 1. 한 문장 정의

Project Atlas는 **Company(회사)**를 운영하는 플랫폼이다 — **Department(부서)**가 목표(KPI)를 갖고,
부서 소속 **Employee(직원)**가 **Brand Memory(회사의 기억)**를 읽어 **적합도 높은 인증된 Skill**로
**예산(Cost Control) 안에서** 일하며, 성과가 **Employee→Department→Company**로 롤업되어 조직이 **성장**한다.

## 2. 핵심 도메인 모델 (개념)

```
Customer ──owns──> Company  ★최상위 (DNA·Culture·Goal·KPI·Stage·Health · Brand Memory · Organization)
                     │
                     ├──led by──> CEO  ★(DNA·의사결정·승인정책·리스크·브랜드우선·성장전략·Goal·KPI·권한)
                     │                 └── governs ──▶ (직원 작동 방식 지배)
                     └──has──> Department ──staffs──> Employee ──assigned──> SkillAssignment
                                  │(DNA·KPI·필수Skill·Health)   │(DNA·rank·성장)        │
                                  └── 필수 Skill ↔ 현재 수준     │                       │
Skill Library ──catalog──> Skill ──versions──> SkillVersion ──(10단계 lifecycle)─────────┘
                                                   │
Task/Run ──executes──> SkillVersion ──meters──> CostLedger
Approval Workflow ──gates──> {deploy, budgetOver, highRisk}   (auto/CEO/부서장/조건부)

롤업:  Employee 성과 → Department Health → Company Health Score
캐스케이드: CEO 성장전략/Goal → Company Goal → KPI → Department KPI → Employee 성과
살아있는 루프: 조직추천 → 구성 → CEO 거버넌스/Approval → 업무·성과 → Health → Growth 단계 → 재추천
```

- **Company (최상위 객체)**: 회사 그 자체. DNA·문화·목표·KPI·단계·건강 + Brand Memory + Organization. → [Company DNA Spec](../specs/company-dna-spec.md)
- **CEO (핵심 객체)**: 의사결정·승인·리스크·브랜드우선·성장전략·권한. 직원 작동을 지배(같은 직원도 CEO에 따라 다르게). → [CEO Spec](../specs/ceo-spec.md)
- **Department (독립 객체, 성장)**: 담당 업무·KPI·필수Skill·현재수준·Health·Performance. → [Department Spec](../specs/department-spec.md)
- **Employee (중심 객체)**: Department 소속. DNA + Skill + 기억 + Training + Certification + Performance + Matching Profile + rank. → [Employee DNA Spec](../specs/employee-dna-spec.md)
- **Skill (핵심 자산)**: 검증·인증을 거친 자산. 10단계 라이프사이클(ROI 포함). → [Skill Lifecycle Spec](../specs/skill-lifecycle-spec.md)
- **Brand Memory**: 직원이 바뀌어도 남는 회사의 기억(이제 **Company 스코프**). 진짜 해자(moat).

## 3. 핵심 서브시스템

### (A0) Organization — 조직 (개정 #002·#003)
- Company→**CEO**→Department→Employee 트리. Company DNA·문화·목표·KPI·단계·Health.
- **CEO**가 거버넌스 지배, **Approval Workflow**가 액션 승인, **AI 조직 추천**이 (업종×단계) 조직 제안.
- 상세: [`01-organization-architecture.md`](01-organization-architecture.md) · [Company](../specs/company-dna-spec.md) · [CEO](../specs/ceo-spec.md) · [Department](../specs/department-spec.md) · [Approval](../specs/approval-workflow-spec.md) · [Recommendation](../specs/org-recommendation-spec.md)

### (A) Brand Memory — 공유 기억 (Company 스코프)
- 브랜드 보이스, 제품/서비스, 자산, 정책, 과거 산출물, 의사결정 이력을 구조화·버전관리하여 저장.
- 이제 **Company 스코프** — 회사의 모든 부서·직원이 공유. 인증된 직원만 쓴다(write).
- 상세: [`02-data-model.md`](02-data-model.md)

### (B) Skill Library — 능력 카탈로그
- Skill의 정의·버전·라이프사이클 상태(발견→…→배포→성과측정)를 관리.
- Sandbox에서 검증·시험·인증을 거친 SkillVersion만 배포 가능.
- 상세: [`03-skill-os.md`](03-skill-os.md)

### (C) Matching Engine — 적합도 배포
- (Employee × Skill) 적합도 점수를 계산하여 *맞는 직원에게만* 배포.
- "모두에게 같은 Skill을 주지 않는다"는 SKILL_OS 헌법의 핵심을 강제하는 컴포넌트.
- 상세: [`04-matching-engine.md`](04-matching-engine.md)

## 4. 생태계 기관 (Ecosystem Organs)

직원이 강해지는 시스템. Skill 라이프사이클(발견~성과측정)을 운영 주체로 매핑한다.

| 기관 | 역할 | 라이프사이클 구간 | 스펙 |
|---|---|---|---|
| **AI Research Lab** | Skill 발굴·검증·ROI 분석 | 발견·분석·Sandbox·ROI | [spec](../specs/ai-research-lab-spec.md) |
| **AI University** | 직원 교육·시험 | 교육·시험 | [spec](../specs/ai-university-spec.md) |
| **Certification System** | 자격 인증(배치 신뢰 보증) | 인증 | [spec](../specs/certification-system-spec.md) |
| **Operator HQ** | 위 기관 + 배포·Skill Update·Employee Upgrade 운영 | 배포·성과측정 | [spec](../specs/operator-hq-spec.md) |

## 5. 지원 서브시스템

| 서브시스템 | 역할 | 헌법 근거 |
|---|---|---|
| **Orchestrator** | 업무(Task) → 직원 → Skill 실행 라우팅, 가드레일 강제 | PRODUCT (회사 운영 경험) |
| **Cost Control** | 예산·미터링·모델 라우팅(Hosted/BYOK/Credit) + ROI | BUSINESS (원가 통제) |
| **Operator Console** | Operator HQ의 화면 — 복잡성 수용 | PRODUCT (복잡성은 운영자에게) |
| **Customer Portal** | 고객용 — 단순함 (직원 채용·업무 위임) | PRODUCT (단순함은 고객에게) |

상세: [`05-cost-control.md`](05-cost-control.md), [`06-security.md`](06-security.md)

## 6. 레이어드 아키텍처 (개념도)

```
┌─────────────────────────────────────────────────────────────┐
│  Experience Layer                                            │
│   Customer Portal (단순)      Operator Console = Operator HQ  │
└───────────────┬─────────────────────────┬───────────────────┘
                │                          │
┌───────────────▼──────────────────────────▼──────────────────┐
│  Ecosystem Organs                                           │
│   Research Lab · University · Certification · Operator HQ     │
└───────────────┬─────────────────────────┬───────────────────┘
                │                          │
┌───────────────▼──────────────────────────▼──────────────────┐
│  Orchestration Layer                                         │
│   Task Router · Guardrails · Run Lifecycle                   │
└───────┬───────────────┬───────────────┬──────────────────────┘
        │               │               │
┌───────▼─────┐ ┌───────▼───────┐ ┌─────▼─────────┐  ┌──────────┐
│ Brand Memory│ │ Skill Library │ │ Matching      │  │ Cost     │
│  (+Employee)│ │ + Skill OS    │ │ Engine        │  │ Control  │
└───────┬─────┘ └───────┬───────┘ └─────┬─────────┘  └────┬─────┘
        │               │               │                 │
┌───────▼───────────────▼───────────────▼─────────────────▼─────┐
│  Foundation Layer                                            │
│   Data Store · Model Gateway(추상화) · Audit/Telemetry        │
└─────────────────────────────────────────────────────────────┘
```

> **Model Gateway**는 의도적인 추상화 레이어다. 특정 AI 제공자에 종속되지 않고
> Hosted/BYOK 라우팅과 원가 미터링을 한 곳에서 강제하기 위함. (이번 Sprint 구현 안 함)

## 7. 설계 원칙 (CTO)

1. **Employee-centric.** Employee가 중심 객체. 모든 설계는 직원의 DNA·성장 루프를 1급으로 다룬다.
2. **Provider-agnostic.** 모든 모델 호출은 Model Gateway를 통과한다. 직접 SDK 호출 금지.
3. **Cost-by-design.** 모든 실행 경로는 예산 체크 → 실행 → 미터링 기록을 거친다. Skill은 ROI 게이트 통과.
4. **Memory as moat.** 산출물보다 *축적된 맥락*이 자산. Brand Memory는 손실 없이 버전관리.
5. **Per-employee, not global.** 능력 배포는 항상 적합도+인증을 거친다.
6. **Skill as asset.** Skill은 프롬프트가 아니라 라이프사이클을 가진 자산.
7. **Operator complexity, customer simplicity.** 두 경험을 물리적으로 분리(`apps/`).

## 관련 문서
- 데이터 모델: [`02-data-model.md`](02-data-model.md)
- Skill OS: [`03-skill-os.md`](03-skill-os.md)
- Matching: [`04-matching-engine.md`](04-matching-engine.md)
- Cost: [`05-cost-control.md`](05-cost-control.md)
- Security: [`06-security.md`](06-security.md)
- 🔬 정밀 스펙(전체): [`../specs/`](../specs/README.md) — Employee DNA · Skill Lifecycle · Matching · HQ · Lab · University · Certification
- 기술 스택 결정: [`../adr/0003-tech-stack.md`](../adr/0003-tech-stack.md)
