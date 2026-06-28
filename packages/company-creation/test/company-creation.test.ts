import { test } from "node:test";
import assert from "node:assert/strict";
import { __resetIds } from "../../shared-types/src/index.ts";
import type { OnboardingResponse, PaymentConfirmation } from "../../shared-types/src/index.ts";
import { diagnose } from "../../diagnosis/src/diagnosis.ts";
import { recommendOrganization } from "../../org-recommendation/src/recommendation.ts";
import {
  ApprovalRequiredError, PaymentRequiredError, approve, buildCompanyProposal,
  buildDesignDraft, createCompanyFromDraft, requestFoundingApproval,
} from "../src/company-creation.ts";

function setup() {
  __resetIds();
  const res: OnboardingResponse = {
    id: "ob_1", companyName: "로마티 카페", industry: "cafe", stage: "early_growth", employees: 3,
    online: false, brand: false, timeSink: "재고/발주", problem: "신규 고객 유입", grow: "온라인 매출",
  };
  const dg = diagnose(res);
  const rec = recommendOrganization(res.industry, res.stage, dg);
  const draft = buildDesignDraft(res, dg, rec);
  return { res, dg, rec, draft };
}
const paid: PaymentConfirmation = { id: "pay_1", plan: "운영", confirmed: true };

test("무료 산출: buildCompanyProposal은 Preview + 기대효과를 만든다(생성 아님)", () => {
  const { draft, rec } = setup();
  const p = buildCompanyProposal(draft, rec);
  assert.equal(p.status, "proposal_ready");
  assert.ok(p.expectedEffect.savedHoursPerWeek > 0);
  assert.ok(p.designPreview.departments.length >= 2);
});

test("결제 게이트: 결제 없이는 Company 생성 불가(무료는 Preview까지)", () => {
  const { draft } = setup();
  const apr = requestFoundingApproval(draft); approve(apr, draft);
  assert.throws(() => createCompanyFromDraft("cus_1", draft, { id: "p", plan: "x", confirmed: false }), PaymentRequiredError);
});

test("승인 게이트: 승인되지 않은 draft는 결제해도 생성 불가", () => {
  const { draft } = setup();
  assert.throws(() => createCompanyFromDraft("cus_1", draft, paid), ApprovalRequiredError);
});

test("결제+승인 후 Company/CEO/Department/Employee + 트리 생성", () => {
  const { draft } = setup();
  const apr = requestFoundingApproval(draft); approve(apr, draft);
  const created = createCompanyFromDraft("cus_1", draft, paid);
  assert.equal(created.company.name, "로마티 카페");
  assert.equal(created.departments[0]!.name, "Operations");
  assert.ok(created.employees.some((e) => e.dna.genome.roleFamily === "content")); // Writer Employee
});
