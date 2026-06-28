# 로드맵 (Roadmap)

> 각 단계는 [Employee/Skill 게이트](../business/employee-skill-gate.md)를 통과한 것만 진입. 순서는 가치·리스크 기준.
> 개정 #001~#004 반영. 계층: Company→CEO→Department→Employee→Skill. 첫 경험: 온보딩(AI 공동창업자).

| Sprint | 목표 | 핵심 산출 | 금지/제외 해제 |
|---|---|---|---|
| **0 — 설립** ✅ | 회사 설립 | 헌법+개정·아키텍처·스펙·ADR·로드맵·구조 골격 | (없음) |
| **1 — 걷는 골격** ✅ | Employee 중심 수직 슬라이스(인메모리) | Employee DNA·Brand Memory·Skill 10단계·Matching·Cert·Gateway mock·Operator HQ 골격(19 tests) | — |
| **2A — 온보딩(무료/유료 경계)** ✅ | 가입→설계안 Preview→(결제)→회사 설립 | 대표계정·무료 진단권·진단·추천·Proposal/Creation 분리·대표 비서·업셀(46→51 tests) | — |
| **2B — 운영 루프(Trust First 적용)** ⏭️다음 | 살아 움직이는 운영 | 대표 비서 Work Loop·직원 업무 실행·**결과물(Quality Boundary/Readiness/Confidence/Output Scope 게이트)**·Satisfaction·Health 롤업·Growth·재추천 | — |
| **3 — 영속화 & 실원가** | 신뢰할 수 있는 상태 | Postgres+RLS, **Model Gateway 실제 제공자 1종**(원가·ROI 실측), 감사 로그 | ✅ AI API |
| **4 — 고객 경험 & 과금** | 고객이 직접 회사 운영 | Customer Portal, **인증/로그인**, **Credit/Budget 집행** | ✅ 로그인 ✅ 결제 |
| **5 — 생태계 기관 가동** | Skill 공급망 + 성장 | Research Lab(Sandbox 실행), University(교육·시험), Certification, 성과→Upgrade/승진·부서 재편 루프 | — |
| **6+ — 확장** | 차별화 심화 | Matching v1(학습 랭킹), 멀티 제공자, 직군/부서 확대 | (필요 시) 영상/이미지 |

## 원칙
- 각 Sprint 시작 전 CTO가 제안 → 중대한 *사업 방향 변경*만 CEO 승인.
- 금지 항목(로그인/결제/AI API/영상·이미지)은 해당 Sprint에서 게이트 통과 후에만 해제.
- 모든 단계는 Cost Control과 멀티테넌시 격리를 *기본 전제*로 한다.
