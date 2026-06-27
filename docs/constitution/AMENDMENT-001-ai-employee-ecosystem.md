# 헌법 개정 #001 — AI Employee Ecosystem

- 상태: **Accepted (CEO 승인)**
- 출처: ATLAS UPDATE MEMO #001 (CEO Advisor ↔ CEO 논의)
- 중요도: ★★★★★ — Sprint 1 착수 전 반드시 반영
- 일자: 2026-06-27

> 원본 설립 헌법([constitution](.))은 보존한다. 이 문서는 그 위에 누적되는 **CEO 승인 개정**이며,
> 충돌 시 본 개정이 우선한다.

## 1. 회사 정의 확장
- (구) AI Workforce **OS** → (신) **AI Employee Ecosystem**
- Atlas는 단일 OS가 아니라 직원이 태어나고·배우고·인증받고·일하고·성장하는 **생태계**다.

## 2. Employee = 독립 객체 (1급 시민)
직원은 "Brand Memory를 가진 AI"가 아니다. 직원은 다음을 가진 **독립 객체**다:

```
Employee
 ├─ Employee DNA        (정체성·아키타입·페르소나·가드레일)
 ├─ Skill Library       (보유/배정 Skill, 직원별)
 ├─ Brand Memory        (스코프된 회사 기억 접근)
 ├─ Training History    (학습 이력)
 ├─ Certification       (보유 자격)
 ├─ Performance History (성과 이력)
 └─ Matching Profile    (적합도 산출용 프로파일)
```
→ 아키텍처는 **Employee를 중심**으로 재구성한다.

## 3. Skill = 플랫폼 핵심 자산 (프롬프트 아님)
Skill 라이프사이클에 **ROI 분석**이 추가되어 10단계가 된다:

```
발견 → 분석 → Sandbox → ROI 분석 → 직원 추천 → 교육 → 시험 → 인증 → 배포 → 성과 측정
```

## 4. Operator HQ 역할 재정의
운영자는 "직원을 관리하는 사람"이 아니라 다음을 **운영하는 사람**이다:
- Skill Library · Training · Certification · Skill Update · Employee Upgrade

## 5. 고객 = 직원을 채용한다 (용어 통일)
모든 문서에서 **Feature 대신 Employee 중심 용어**를 사용한다.
- ❌ Writer Feature  →  ⭕ **Writer Employee**

## 6. Sprint 1 전 필수 신규 스펙
아래를 `docs/specs/`로 추가/통합한다:
- [Employee DNA Specification](../specs/employee-dna-spec.md)
- [Skill Lifecycle Specification](../specs/skill-lifecycle-spec.md)
- [Skill Matching Engine Specification](../specs/skill-matching-engine-spec.md)
- [Operator HQ Specification](../specs/operator-hq-spec.md)
- [AI Research Lab](../specs/ai-research-lab-spec.md)
- [AI University](../specs/ai-university-spec.md)
- [Certification System](../specs/certification-system-spec.md)

## 7. 절차
구현은 시작하지 않는다. 구조 보완 → Sprint 1 재제안 → CEO 승인 후 구현.
관련 결정: [ADR 0005](../adr/0005-ai-employee-ecosystem-pivot.md).
