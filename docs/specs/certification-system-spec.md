# Certification System Specification

> 근거: [헌법 개정 #001](../constitution/AMENDMENT-001-ai-employee-ecosystem.md) §6
> 생태계 기관 ③. 시험 합격을 **자격(Certification)으로 공식화**하고, 배치 자격을 보증하는 시스템.

## 1. 역할
Certification System은 AI University의 시험을 통과한 (직원 × Skill) 쌍에 **인증**을 발급한다.
인증은 "이 직원은 이 Skill을 안전하고 유효하게 수행할 자격이 있다"는 **신뢰의 증명**이다.

```
[ Certification 담당 구간 ]
(University 시험 합격) ──▶ 인증 발급 ──▶ (Operator HQ가 배포)
```

## 2. 책임 단계 (Skill Lifecycle 8)
| 단계 | 활동 | 산출 |
|---|---|---|
| **인증 Certification** | 합격 기준 검증 후 자격 발급, 유효기간·범위 지정 | `Certification` 레코드 |

## 3. Certification 객체 (개념)
```yaml
certification:
  id: cert_01
  employee_id: emp_01
  skill_version_id: skv_01
  status: active            # active | expired | revoked
  issued_at: ...
  valid_until: ...          # 만료 → 재인증 필요
  scope: [brand_01]         # 어떤 브랜드 범위에서 유효한가
  evidence: test_result_id  # 근거(시험 결과)
```

## 4. 핵심 규칙 (신뢰의 게이트)
1. **배치 전 인증 필수.** 미인증 (직원×Skill)은 실행 배치 불가([Employee DNA](employee-dna-spec.md) §6).
2. **버전 결속.** 인증은 특정 `SkillVersion`에 묶인다. Skill Update(신버전) → **재인증** 필요.
3. **만료/회수.** 유효기간 경과 또는 성과 미달 시 `expired`/`revoked` → 자동 배치 해제.
4. **감사.** 모든 발급/만료/회수는 AuditEvent + Performance History에 반영.

## 5. Matching 연동
보유 인증은 [Matching Profile](skill-matching-engine-spec.md)의 신호(Certification readiness)가 된다.
→ 인증이 쌓일수록 더 높은 적합도의 Skill을 추천받는 **성장 루프**.

## 6. Sprint 범위
Sprint 1: `Certification` 데이터 모델 + 상태(active/expired/revoked) + "미인증 배치 불가" 규칙 강제.

## 관련
- 입력: [AI University](ai-university-spec.md) (시험 결과)
- 다음: [Operator HQ](operator-hq-spec.md) (배포·Upgrade)
