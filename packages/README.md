# packages/ — 공유 도메인 로직

> Sprint 1 + 2A 구현됨(zero-dep TS, ADR 0006). 테스트: `npm test`.

## Sprint 1 (운영 루프)
| 패키지 | 역할 |
|---|---|
| `shared-types/` | 도메인 타입 단일 소스(+온보딩 타입) + ID 유틸 |
| `employee-core/` | Employee 중심 객체 + 성장 루프 |
| `brand-memory/` | 회사의 기억(CRUD+리비전) |
| `skill-library/` | Skill 자산 + 10단계 라이프사이클 |
| `matching-engine/` | 직원별 적합도(설명가능)+인증게이트 |
| `cost-control/` | Model Gateway(mock)+CostLedger+ROI |

## Sprint 2A (온보딩 → 회사 생성)
| 패키지 | 역할 |
|---|---|
| `onboarding/` | 컨설팅 질문 + Customer Journey 상태머신 |
| `diagnosis/` | AI Business Diagnosis(규칙) |
| `org-recommendation/` | (업종×단계×진단) 조직 추천 |
| `company-core/` | Company/CEO/Department/Employee 팩토리 |
| `organization/` | 조직 트리(불변식) |
| `company-creation/` | 설계안→대표 승인→Company 생성 |

## BUSINESS MEMO #008 (무료/유료 경계)
| 패키지 | 역할 |
|---|---|
| `staffing/` | 부족 직원 채용 추천(업셀링) 순수 분석 |
| (company-creation) | + `buildCompanyProposal`(무료) / `createCompanyFromDraft` 결제 게이트 |
