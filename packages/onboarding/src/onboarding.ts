// Onboarding — 회원가입(=무료 AI 컨설팅) 질문 세트 + Customer Journey 상태머신
// 근거: docs/specs/customer-journey-spec.md
import { newId } from "../../shared-types/src/index.ts";
import type { ConsultQuestion, Id, JourneyState } from "../../shared-types/src/index.ts";

/** 무료 AI 컨설팅 질문 (질문 폼이 아니라 컨설팅 대화 — UX는 CPO가 설계) */
export const CONSULT_QUESTIONS: ConsultQuestion[] = [
  { key: "companyName", ask: "회사(가게) 이름이 어떻게 되세요?", kind: "text" },
  { key: "industry", ask: "어떤 업종인가요?", kind: "select", options: ["cafe", "ecommerce", "beauty", "saas"] },
  { key: "stage", ask: "지금 사업은 어느 단계인가요?", kind: "select", options: ["founding", "early_growth", "stabilize", "scale", "franchise"] },
  { key: "employees", ask: "직원은 몇 명인가요?", kind: "number" },
  { key: "revenue", ask: "월 매출은 어느 정도인가요? (선택)", kind: "number", optional: true },
  { key: "online", ask: "온라인으로 운영(주문/판매)하고 있나요?", kind: "boolean" },
  { key: "brand", ask: "정립된 브랜드가 있나요?", kind: "boolean" },
  { key: "timeSink", ask: "가장 시간을 많이 쓰는 업무는 무엇인가요?", kind: "text" },
  { key: "problem", ask: "가장 해결하고 싶은 문제는 무엇인가요?", kind: "text" },
  { key: "grow", ask: "가장 성장시키고 싶은 분야는 무엇인가요?", kind: "text" },
];

/** 허용된 상태 전이 (created는 반드시 approving을 거친다) */
const TRANSITIONS: Record<JourneyState, JourneyState[]> = {
  signup: ["diagnosing"],
  diagnosing: ["designing"],
  designing: ["recommending"],
  recommending: ["reviewing"],
  reviewing: ["approving", "revising"],
  approving: ["created", "revising"],
  revising: ["designing"],
  created: [],
};

export class JourneyTransitionError extends Error {}

/** Customer Journey 상태머신 인스턴스 */
export class CustomerJourney {
  readonly id: Id;
  state: JourneyState = "signup";
  responseId?: Id;
  diagnosisId?: Id;
  recommendationId?: Id;
  draftId?: Id;
  companyId?: Id;
  readonly history: JourneyState[] = ["signup"];
  readonly customerId: Id;

  constructor(customerId: Id) { this.customerId = customerId; this.id = newId("cj"); }

  to(next: JourneyState): void {
    if (!TRANSITIONS[this.state].includes(next)) {
      throw new JourneyTransitionError(`불법 전이: ${this.state} → ${next}`);
    }
    this.state = next;
    this.history.push(next);
  }

  get isCreated(): boolean { return this.state === "created"; }
}
