# CLAUDE.md — Project Atlas

이 파일은 이 저장소에서 작업하는 Claude(및 모든 AI/사람 기여자)를 위한 운영 지침이다.

## 정체성

Project Atlas는 **AI Employee Ecosystem**이다. 고객은 AI 도구를 쓰지 않고 **AI 직원을 채용**한다.
직원은 독립 객체(= DNA + Skill Library + Brand Memory + Training + Certification + Performance + Matching Profile)다.
모든 작업은 [`docs/constitution/`](docs/constitution/)의 헌법 + [개정 #001](docs/constitution/AMENDMENT-001-ai-employee-ecosystem.md)을 최상위 기준으로 따른다.
충돌 시 헌법(개정 우선)이 이긴다. 정밀 설계는 [`docs/specs/`](docs/specs/README.md).

## 절대 규칙

1. **Documentation First.** 코드보다 문서가 먼저다. 설계 결정은 `docs/adr/`에 ADR로 남긴다.
2. **Business First.** 모든 신규 Employee(직군)·Skill은 [Employee&Skill 게이트](docs/business/employee-skill-gate.md) 4종을 통과해야 한다:
   결제 이유 · 장기 구독 향상 · API 원가 통제 가능 · 경쟁 우위.
3. **Cost Control은 1급 요구사항.** 모든 AI 호출 경로는 예산·미터링·모델 라우팅(Hosted/BYOK/Credit)을 전제로 설계한다.
4. **복잡성은 운영자에게, 단순함은 고객에게.** (PRODUCT_CHARTER)
5. **권한 분리.** CEO는 *무엇을*, CTO는 *어떻게*. 중대한 사업 방향 변경만 CEO 승인.
6. **용어 통일.** *Feature*가 아니라 **Employee** 중심 용어 (Writer Feature ❌ / Writer Employee ⭕).
7. **Skill은 자산.** 즉흥 프롬프트로 만들지 않는다. [Skill 라이프사이클](docs/specs/skill-lifecycle-spec.md) 10단계를 거친다.

## 이번 Sprint(0) 범위 제한 — 구현 금지

다음은 **구현하지 않는다** (구조/문서만): 로그인, 결제, AI API 연동, 영상 생성, 이미지 생성.
요청이 이 범위를 넘으면 멈추고 Sprint 제안으로 전환한다.

## 작업 방식

- 새 설계 결정 → `docs/adr/NNNN-title.md` 추가 후 인덱스 갱신.
- 새 Employee/Skill 아이디어 → 먼저 [`docs/business/employee-skill-gate.md`](docs/business/employee-skill-gate.md) 체크리스트로 검증.
- `apps/`·`packages/`·`services/`·`skills/`는 현재 **골격(README only)**. 코드 추가는 해당 Sprint 승인 후.
- 기존의 다른 프로젝트(`/Users/hyojoo/Projects/*`)는 **절대 수정하지 않는다.** Atlas는 완전 분리된 회사다.
