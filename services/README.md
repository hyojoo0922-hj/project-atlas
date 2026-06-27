# services/ — 백엔드/오케스트레이션 (골격)

> ⚠️ Sprint 0 골격. 코드 없음.

- `orchestrator/` — 업무(Task)→직원→Skill 실행 라우팅, 가드레일 강제, Run 생명주기.
  모든 모델 호출은 Model Gateway 경유(원가/ROI 통제). Sprint 2+.

## 생태계 기관(Ecosystem Organs)의 위치
AI Research Lab · AI University · Certification System은 개정 #001에서 도입된 생태계 기관이다.
Sprint 1에서는 도메인 데이터/상태로만 표현되고, **실행 엔진**(Sandbox 실행·실제 교육/평가)은
Sprint 4에서 `services/` 하위 서비스로 실체화한다. 스펙: ../docs/specs/README.md
