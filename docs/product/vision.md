# 제품 비전 (Product Vision)

> 헌법: [PRODUCT_CHARTER](../constitution/PRODUCT_CHARTER.md) · [개정 #001](../constitution/AMENDMENT-001-ai-employee-ecosystem.md)
> Atlas = **AI Employee Ecosystem**. 직원이 성장하는 생태계를 운영하는 경험.

## 비전 한 줄
**회사를 운영하는 느낌으로, AI 직원을 채용하고·키우고·일을 맡긴다.**

## 제품 원칙 (헌법)
1. 고객은 AI가 아닌 **직원**을 경험한다.
2. UX는 *회사를 운영하는 느낌*이어야 한다.
3. **복잡성은 운영자에게, 단순함은 고객에게.**

## 경험 설계 함의
- "프롬프트 입력창"이 아니라 "직원에게 업무 위임" 메타포.
- 산출물 나열이 아니라 **직원·팀·업무·성과**가 보이는 대시보드.
- 고객 화면은 단순(Customer Portal), 운영 화면은 강력(Operator Console) — 물리적 분리(`apps/`).

## 반(反)패턴 (하지 않을 것)
- 모든 직원에게 같은 Skill을 노출(헌법 위반 — 직원별 적합도 배포가 핵심).
- *Feature* 중심 용어 사용(개정 #001 — Employee 중심으로: Writer Feature ❌ / Writer Employee ⭕).
- Skill을 즉흥 프롬프트로 취급(Skill은 자산, 라이프사이클을 거친다).
- 고객에게 모델/토큰/프롬프트 같은 내부 복잡성 노출.
- 원가 통제 없는 무제한 호출 UX.
