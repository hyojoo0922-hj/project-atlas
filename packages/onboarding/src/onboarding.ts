// Onboarding — 대표 계정 생성 → 무료 사업진단권 → 사업 진단 → … → Company 생성 → 첫 업무
// 근거: docs/specs/customer-journey-spec.md + CPO UX Sprint #001 IA
import { newId } from "../../shared-types/src/index.ts";
import type {
  ConsultQuestion, CustomerView, Diagnosis, Id, JourneyState, OwnerAccount,
} from "../../shared-types/src/index.ts";

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

// 가입 직후 빈 대시보드로 보내지 않고 곧장 진단 흐름으로 진입(IA 원칙 3).
// account_created → voucher_activated → diagnosing → … → created → first_task
const TRANSITIONS: Record<JourneyState, JourneyState[]> = {
  account_created: ["voucher_activated"],
  voucher_activated: ["diagnosing"],
  diagnosing: ["designing"],
  designing: ["recommending"],
  recommending: ["reviewing"],
  reviewing: ["approving", "revising"],
  approving: ["created", "revising"],
  revising: ["designing"],
  created: ["first_task"],
  first_task: [],
};

export class JourneyTransitionError extends Error {}
export class VoucherError extends Error {}

// ───────────────────────── 대표 계정 / 무료 사업진단권 ─────────────────────────
/** 대표 계정 생성(= 회원가입 대신) + 무료 사업진단권 1회 부여 */
export function createOwnerAccount(ownerName: string): OwnerAccount {
  return { id: newId("acc"), ownerName, voucher: { total: 1, used: 0, active: false } };
}
export function activateVoucher(acc: OwnerAccount): void {
  acc.voucher.active = true;
}
/** 진단 시 진단권 1회 소진 (계정당 1회) */
export function consumeVoucher(acc: OwnerAccount): void {
  if (!acc.voucher.active) throw new VoucherError("무료 사업진단권이 활성화되지 않았습니다.");
  if (acc.voucher.used >= acc.voucher.total) throw new VoucherError("무료 사업진단권을 모두 사용했습니다(계정당 1회).");
  acc.voucher.used += 1;
}

// ───────────────────────── Customer Journey ─────────────────────────
export class CustomerJourney {
  readonly id: Id;
  state: JourneyState = "account_created";
  accountId?: Id;
  responseId?: Id;
  diagnosisId?: Id;
  recommendationId?: Id;
  draftId?: Id;
  companyId?: Id;
  readonly history: JourneyState[] = ["account_created"];
  readonly customerId: Id;

  constructor(customerId: Id) { this.customerId = customerId; this.id = newId("cj"); }

  to(next: JourneyState): void {
    if (!TRANSITIONS[this.state].includes(next)) {
      throw new JourneyTransitionError(`불법 전이: ${this.state} → ${next}`);
    }
    this.state = next;
    this.history.push(next);
  }
  get isCreated(): boolean { return this.state === "created" || this.state === "first_task"; }
}

// ───────────────────────── 고객 화면 3요소 (IA 원칙 4·6·7·8·9) ─────────────────────────
const STAGE_LABEL: Record<JourneyState, string> = {
  account_created: "대표 계정 생성",
  voucher_activated: "무료 사업진단권 활성화",
  diagnosing: "AI 사업 진단",
  designing: "회사 설계안 준비",
  recommending: "회사 설계안 준비",
  reviewing: "회사 설계안 검토",
  approving: "회사 설립 승인",
  created: "회사 생성 완료",
  first_task: "첫 업무 시작",
  revising: "설계안 재작성",
};

export interface CustomerViewContext {
  ownerName?: string;
  companyName?: string;
  diagnosis?: Diagnosis;       // 점수가 아닌 '판단'을 보여주기 위해 사용
  firstTaskText?: string;
}

/** 현재 단계 / 공동창업자의 판단 / 대표의 다음 행동 — 항상 노출되는 3요소 */
export function buildCustomerView(state: JourneyState, ctx: CustomerViewContext = {}): CustomerView {
  const judgment = (): string => {
    switch (state) {
      case "account_created": return `${ctx.ownerName ?? "대표"}님, 함께 회사를 세울 준비가 되었습니다.`;
      case "voucher_activated": return "무료 사업진단권 1회가 활성화되었습니다. 바로 진단을 시작할 수 있어요.";
      case "diagnosing": return "지금 사업을 진단하고 있습니다.";
      case "designing":
      case "recommending":
      case "reviewing":
      case "approving":
        // 점수가 아니라 '우선순위 판단'으로 보여준다(IA 원칙 6)
        return ctx.diagnosis?.rationale[0] ?? ctx.diagnosis?.bottleneck ?? "지금 사업에 맞는 회사를 설계했습니다.";
      case "created": return `${ctx.companyName ?? "회사"}가 만들어졌습니다. 이제 첫 업무를 시작해 보세요.`;
      case "first_task": return ctx.firstTaskText ?? "첫 업무를 맡겨 회사를 움직여 보세요.";
      case "revising": return "설계안을 다시 다듬고 있습니다.";
    }
  };
  const nextAction = (): string => {
    switch (state) {
      case "account_created": return "무료 사업진단권 활성화하기";
      case "voucher_activated": return "사업 진단 시작하기";
      case "diagnosing": return "진단 결과 기다리기";
      case "designing":
      case "recommending": return "설계안 기다리기";
      case "reviewing": return "설계안 검토하기";
      case "approving": return "이 설계안으로 내 회사 만들기";   // IA 원칙 7
      case "created": return "첫 업무 맡기기";                    // IA 원칙 8
      case "first_task": return "계속 회사 운영하기";            // IA 원칙 9
      case "revising": return "수정된 설계안 기다리기";
    }
  };
  return { stage: STAGE_LABEL[state], cofounderJudgment: judgment(), nextAction: nextAction() };
}
