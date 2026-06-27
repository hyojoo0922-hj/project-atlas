# UX 화면 구조 & 사용자 흐름 (Codex 인계용)

> 목적: Sprint 1은 UI 완성도가 목표가 아니다. 하지만 **Sprint 2에서 Codex가 UX를 설계**할 수 있도록
> 화면 구조와 사용자 흐름을 명확히 남긴다. 정적 스냅샷: `apps/operator-console/public/index.html`,
> `apps/customer-portal/public/index.html` (`npm run build:demo`로 재생성).

## 원칙 (개정 #001 §4·§5, PRODUCT_CHARTER)
- **Operator HQ = 복잡성 수용.** 운영자는 Skill·교육·인증·성과·원가를 운영한다.
- **Customer = 단순함.** 고객은 Skill OS를 몰라도 직원에게 일을 맡기면 결과가 온다.
- 두 경험은 **물리적으로 분리**(`apps/operator-console` ↔ `apps/customer-portal`).

---

## A. Operator HQ (운영자)

### 화면 맵
```
Operator HQ
├─ Dashboard            직원 수·Skill 상태 분포·Usage/Cost/ROI 요약
├─ Employees            직원 목록 → 직원 상세
│   └─ Employee Detail  DNA(genome/phenotype/acquired/lineage) · 보유 Skill · 인증 · 성과 · MatchingProfile
├─ Skill Library        Skill 자산 카탈로그 → 라이프사이클 보드(10단계) · ROI
│   └─ Skill Detail     매니페스트 · 버전 · ROI · 배포된 직원
├─ Matching             직원별 추천(적합도 + breakdown + 사유)
├─ University           교육/시험 파이프라인(TrainingRecord·점수)
├─ Certification        인증 발급/만료/회수
└─ Cost & ROI           CostLedger(직원/Skill/브랜드별), 예산
```

### 핵심 사용자 흐름 (운영자)
1. Skill Library에서 자산 라이프사이클 진행상황 확인(발견→…→ROI→recommended).
2. Matching에서 직원별 추천을 보고 교육 대상 선정.
3. University에서 교육·시험 → Certification에서 인증 발급.
4. 배치 후 Cost & ROI에서 성과·원가 모니터링 → Skill Update / Employee Upgrade 판단.

---

## B. Customer Experience (고객)

### 화면 맵
```
Customer Workspace
├─ My Employees     채용한 AI 직원(근무 상태) — 복잡성 비노출
├─ Delegate Work    직원에게 업무 위임(자연어 intent)
├─ Results          맡긴 업무의 결과
└─ Credits          크레딧 잔액/사용량 (단순)
```

### 핵심 사용자 흐름 (고객)
1. AI 직원을 채용(또는 추천된 직원 선택).
2. 업무를 자연어로 위임.
3. 결과 확인. (내부의 Skill·Matching·라이프사이클·토큰은 보이지 않음)

---

## Codex 인계 지점 (Sprint 2)
- 위 화면 맵을 Next.js(App Router)로 구현. 도메인은 `packages/*`·`services/orchestrator` 그대로 사용.
- 데이터 소스: Sprint 2에서 인메모리 → Postgres로 교체(orchestrator 인터페이스 유지).
- 정적 스냅샷 HTML을 시각 레퍼런스로 사용.
