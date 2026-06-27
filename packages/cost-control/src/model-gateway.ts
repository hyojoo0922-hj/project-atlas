// Cost Control v0 — Model Gateway(mock) + CostLedger + ROI + Budget
// 근거: docs/architecture/05-cost-control.md
// Sprint 1: 실제 제공자 호출 없음. 모든 호출은 mock, cost=0. (ADR 0006)
import { newId } from "../../shared-types/src/index.ts";
import type {
  BillingMode, Budget, CostLedgerEntry, Id, SkillVersion,
} from "../../shared-types/src/index.ts";

export interface GatewayRequest {
  runId: Id;
  skillVersion: SkillVersion;
  billingMode: BillingMode;
  prompt: string;
}

export interface GatewayResult {
  output: string;
  ledger: CostLedgerEntry;
}

export class BudgetExceededError extends Error {}

/**
 * Provider-agnostic Gateway. Sprint 1은 mock 구현.
 * 모든 모델 접근은 반드시 이 게이트를 통과 → 원가/사용량/ROI를 한 곳에서 기록.
 */
export class ModelGateway {
  private ledger: CostLedgerEntry[] = [];
  private budgets = new Map<Id, Budget>();

  registerBudget(b: Budget): void { this.budgets.set(b.id, b); }
  getBudget(id: Id): Budget | undefined { return this.budgets.get(id); }
  getLedger(): readonly CostLedgerEntry[] { return this.ledger; }

  /** mock 호출: 예산 체크 → 실행(mock) → 미터링/ROI 기록 */
  invoke(req: GatewayRequest, budgetId?: Id): GatewayResult {
    // 1) 예산 사전 체크 (mock 원가 0이라 통과하지만 경로는 1일차부터 강제)
    if (budgetId) {
      const budget = this.budgets.get(budgetId);
      if (budget && budget.spent >= budget.limit) {
        throw new BudgetExceededError(`예산 초과: ${budget.scope}:${budget.scopeId}`);
      }
    }

    // 2) 실행 (mock — 외부 AI API 없음)
    const tokensIn = req.prompt.length;
    const tokensOut = 120; // 결정적 mock
    const output = `[MOCK:${req.skillVersion.id}] ${req.prompt} → (생성 결과 placeholder)`;
    const cost = 0; // Sprint 1: 원가 0 기반

    // 3) ROI 기록 (mock: 가치 추정 / 원가. 원가 0 → 자산 ROI를 가치점수로 사용)
    const roiDelivered = req.skillVersion.roi.roiScore;

    const entry: CostLedgerEntry = {
      id: newId("cost"),
      runId: req.runId,
      provider: "mock",
      model: `mock-${req.skillVersion.manifest.costTier}`,
      tokensIn, tokensOut, cost,
      billingMode: req.billingMode,
      roiDelivered,
    };
    this.ledger.push(entry);

    if (budgetId) {
      const budget = this.budgets.get(budgetId);
      if (budget) budget.spent += cost;
    }

    return { output, ledger: entry };
  }

  /** 집계: 직원/스킬/브랜드별 Usage·Cost·ROI 요약 */
  summary(): { calls: number; cost: number; roi: number; tokensIn: number; tokensOut: number } {
    return this.ledger.reduce(
      (acc, e) => ({
        calls: acc.calls + 1,
        cost: acc.cost + e.cost,
        roi: acc.roi + e.roiDelivered,
        tokensIn: acc.tokensIn + e.tokensIn,
        tokensOut: acc.tokensOut + e.tokensOut,
      }),
      { calls: 0, cost: 0, roi: 0, tokensIn: 0, tokensOut: 0 },
    );
  }
}
