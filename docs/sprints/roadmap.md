# 로드맵 (Roadmap)

> 각 단계는 [feature-gate](../business/feature-gate.md)를 통과한 것만 진입. 순서는 가치·리스크 기준.

| Sprint | 목표 | 핵심 산출 | 금지/제외 해제 |
|---|---|---|---|
| **0 — 설립** ✅ | 회사 설립 | 헌법·아키텍처·ADR·로드맵·구조 골격 | (없음) |
| **1 — 걷는 골격** | 3축 수직 슬라이스(인메모리) | shared-types, Brand Memory v0, Skill Library v0, Matching v0, Gateway mock, Operator Console 골격 | — |
| **2 — 영속화 & 실원가** | 신뢰할 수 있는 상태 | Postgres+RLS, **Model Gateway 실제 제공자 1종**(원가 실측), 감사 로그 | ✅ AI API (게이트 통과 후) |
| **3 — 고객 경험 & 과금** | 고객이 직접 쓴다 | Customer Portal, **인증/로그인**, **Credit/Budget 집행**, 과금 모드 | ✅ 로그인 ✅ 결제 |
| **4 — Skill OS 풀 라이프사이클** | 능력 공급망 가동 | Sandbox 실행, 시험·인증 파이프라인, 성과측정 루프 | — |
| **5+ — 확장** | 차별화 심화 | Matching v1(학습 랭킹), 멀티 제공자 라우팅 최적화, 직군 확대 | (필요 시) 영상/이미지 — 게이트 통과 시 |

## 원칙
- 각 Sprint 시작 전 CTO가 제안 → 중대한 *사업 방향 변경*만 CEO 승인.
- 금지 항목(로그인/결제/AI API/영상·이미지)은 해당 Sprint에서 게이트 통과 후에만 해제.
- 모든 단계는 Cost Control과 멀티테넌시 격리를 *기본 전제*로 한다.
