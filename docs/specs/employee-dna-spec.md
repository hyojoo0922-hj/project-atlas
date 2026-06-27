# Employee DNA Specification

> 근거: [헌법 개정 #001](../constitution/AMENDMENT-001-ai-employee-ecosystem.md) · [ADR 0005](../adr/0005-ai-employee-ecosystem-pivot.md)
> Employee는 Atlas의 **중심 객체(1급 시민)**다. 본 문서는 그 구성·생애·진화를 정의한다.

## 1. Employee란 무엇인가
Employee는 "Brand Memory를 가진 AI"가 아니다. 다음 7개 구성요소를 가진 **독립 객체**다.

```
Employee
 ├─ ① Employee DNA        정체성·아키타입·페르소나·가드레일·자율도
 ├─ ② Skill Library       배정된 Skill 집합 (직원별, 적합도 기반)
 ├─ ③ Brand Memory        스코프된 회사 기억 접근권
 ├─ ④ Training History     수료한 교육의 이력
 ├─ ⑤ Certification        보유 자격(유효기간 포함)
 ├─ ⑥ Performance History  실제 성과·ROI 이력
 └─ ⑦ Matching Profile     적합도 산출에 쓰이는 파생 프로파일
```

## 2. Employee DNA의 4개 레이어
DNA는 "고정되는 것"과 "자라는 것"을 구분한다.

| 레이어 | 가변성 | 내용 | 예 |
|---|---|---|---|
| **Genome (코어)** | 불변(immutable) | 아키타입, 역할 가족(role family), 생성 시 부여 | `archetype: creator`, `role_family: content` |
| **Phenotype (발현)** | 브랜드별 설정 | 현재 페르소나·톤·언어, 특정 브랜드에 맞춘 표현 | `tone: warm`, `locale: ko-KR` |
| **Acquired (획득)** | 가변(mutable) | Skill·Certification·학습 맥락 — 시간에 따라 성장 | `skills: [brand-voice-writer]` |
| **Lineage (계보)** | append-only | 버전·업그레이드 이력 | `v1 → v2 (skill+1, cert+1)` |

> Genome은 직원의 "정체성"을 안정시키고, Acquired/Lineage는 **Employee Upgrade**(성장)를 가능케 한다.

## 3. 데이터 형태 (개념 — 구현 아님)
```yaml
# 개념 예시. Sprint 1에서 packages/shared-types(Zod)로 구현.
employee:
  id: emp_01
  brand_id: brand_01
  dna:
    genome:    { archetype: creator, role_family: content }   # 불변
    phenotype: { persona: "브랜드 보이스 라이터", tone: warm, locale: ko-KR }
    acquired:  { traits: [creative, concise], values: [on-brand, no-pii] }
    lineage:   [{ version: 1, change: "created" }]
  memory_scope: [voice, product, policy]        # ③ Brand Memory 접근 범위
  skills:        [skill_assignment_ids...]       # ② Skill Library (적합도 포함)
  training:      [training_record_ids...]        # ④ Training History
  certifications:[certification_ids...]          # ⑤ Certification
  performance:   [performance_record_ids...]     # ⑥ Performance History
  matching_profile_id: mp_01                      # ⑦ Matching Profile
  guardrails:    [no-pii-export, budget-aware]
  budget_id:     budget_01
```

## 4. Matching Profile (⑦)
DNA(genome+acquired) + Training/Certification/Performance에서 **파생**되는 프로파일.
[Skill Matching Engine](skill-matching-engine-spec.md)의 입력이 된다.
- 포함 신호: role_family, traits, 보유 certification, 과거 성과(track record), 예산 여유.
- 직원이 교육·인증·성과를 쌓으면 Matching Profile이 갱신 → 더 높은 적합도의 Skill이 추천됨.

## 5. Employee 생애주기 (Lifecycle)
```
채용(Hire) → 온보딩(DNA+Brand Memory 스코프 설정) → Skill 배정(Matching)
        → 교육(AI University) → 인증(Certification System) → 배치(업무 수행)
        → 성과 측정 → Employee Upgrade(Skill/Cert 추가, DNA acquired 갱신) ↺
        → 은퇴/보관(Archive, 기억은 Brand Memory에 잔존)
```
- **핵심 루프**: 성과 → Matching Profile 갱신 → 새 Skill 추천 → 교육·인증 → Upgrade.
- 직원이 떠나도 **Brand Memory(회사의 기억)는 남는다** (해자).

## 6. 불변식 (Invariants)
1. Genome은 생성 후 변경 불가. 변경이 필요하면 새 Employee.
2. Skill은 [Matching](skill-matching-engine-spec.md) 적합도 게이트를 통과해야만 배정.
3. 미인증 Skill은 실행 배치 불가([Certification System](certification-system-spec.md)).
4. 모든 DNA 변경(Upgrade)은 Lineage에 append + AuditEvent 기록.

## 관련
- 데이터 모델 전체: [../architecture/02-data-model.md](../architecture/02-data-model.md)
- 적합도: [skill-matching-engine-spec.md](skill-matching-engine-spec.md)
- 교육/인증: [ai-university-spec.md](ai-university-spec.md) · [certification-system-spec.md](certification-system-spec.md)
