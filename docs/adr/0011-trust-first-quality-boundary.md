# ADR 0011 — Trust First: 품질 경계와 신뢰 우선 실행

- 상태: Accepted
- 출처: ATLAS BUSINESS & QUALITY MEMO #009 (CEO ↔ CEO Advisor)
- 일자: 2026-06-28
- 선행: [ADR 0010](0010-free-paid-boundary.md)
- 헌법: [BUSINESS_CONSTITUTION](../constitution/BUSINESS_CONSTITUTION.md) (Business First) + Trust First

## 배경
실행 철학 확정: **Atlas는 모든 결과물을 만드는 서비스가 아니라, 신뢰할 수 있는 결과만 제공하는 서비스다.**
직원이 정보 부족·브랜드 이해 부족·자료 부재·범위 이탈 상태에서 결과물을 *억지로* 만들면 안 된다.

## 결정
1. **Quality Boundary**: 결과물 강제 생성 금지. 부족하면 **필요한 정보를 요청**한다. → [quality-boundary-spec](../specs/quality-boundary-spec.md)
2. **Employee Readiness**: 직원마다 업무 준비도(체크리스트). 준비도 낮으면 최종본이 아니라 **초안/정보 요청**. → [employee-readiness-spec](../specs/employee-readiness-spec.md)
3. **Confidence Threshold**: 결과물 생성 전 내부 신뢰도 판단. `≥90 최종본 / 70–89 초안 / <70 정보 요청`. 고객엔 단순 노출, 내부엔 필수.
4. **Progressive Company Learning**: 가입 시 전부 받지 않는다. 무료=진단 최소 정보. 유료 후 **채용된 직원이 필요한 정보만 단계적 요청**. → [progressive-company-learning-spec](../specs/progressive-company-learning-spec.md)
5. **Employee-Specific Onboarding**: 직원이 *필요해서* 자료를 묻는다(고객이 긴 설문 작성 X). 직군별 질문 세트.
6. **Output Scope**: 결과물 유형(text·document·image·video·ad_copy·report·social_post·product_page·customer_reply)별 필수 정보·예상 원가·필요 직원·필요 Skill·품질 기준. → [output-scope-spec](../specs/output-scope-spec.md)
7. **Satisfaction Memory + Outcome Feedback**: 결과 후 만족도·7일 후 성과 피드백 수집. 후기용이 아니라 직원 교육·Skill 개선·추천 알고리즘·유료화 판단·HQ 데이터 자산으로 재사용. → [satisfaction-memory-spec](../specs/satisfaction-memory-spec.md)
8. **Trust First**: 속도보다 신뢰. 확실한 것만, 모르면 묻고, 부족하면 요청, 준비되면 실행, 결과 후 평가받고 성장.

## 근거
- 신뢰는 제품이다(보안·브랜드). 잘못된 최종본 1개가 전환·잔존을 깨뜨린다.
- 점진 학습 + 직원 주도 질문은 가입 마찰을 낮추고 데이터 품질을 높인다.
- 만족도/성과 데이터는 Skill·추천·유료화의 학습 연료(해자).

## 범위 (이번)
구조/문서 + 최소 타입/순수 helper(`packages/quality`: confidence·readiness·output-scope·feedback). 
**Sprint 2B(실제 결과물 생성·Work Loop) 미구현.** 본 ADR은 2B의 품질 게이트 사양을 미리 고정한다.

## 결과
- 품질 스펙 5종 + `packages/quality`(순수) + UX 반영.
- Sprint 2B는 모든 결과물 생성 경로에서 Readiness/Confidence 게이트와 Output Scope·Satisfaction을 준수해야 한다.
