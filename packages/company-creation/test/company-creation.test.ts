import { test } from "node:test";
import assert from "node:assert/strict";
import { __resetIds } from "../../shared-types/src/index.ts";
import type { OnboardingResponse } from "../../shared-types/src/index.ts";
import { diagnose } from "../../diagnosis/src/diagnosis.ts";
import { recommendOrganization } from "../../org-recommendation/src/recommendation.ts";
import {
  ApprovalRequiredError, approve, buildDesignDraft, createCompanyFromDraft, requestFoundingApproval,
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

test("creation: 승인되지 않은 draft로는 Company를 만들 수 없다", () => {
  const { draft } = setup();
  assert.throws(() => createCompanyFromDraft("cus_1", draft), ApprovalRequiredError);
});

test("creation: 대표 승인 후 Company/CEO/Department/Employee + 트리 생성", () => {
  const { draft } = setup();
  const apr = requestFoundingApproval(draft);
  approve(apr, draft);
  const created = createCompanyFromDraft("cus_1", draft);
  assert.equal(created.company.name, "로마티 카페");
  assert.equal(created.ceo.companyId, created.company.id);
  assert.equal(created.departments[0]!.name, "Operations");      // 진단 1순위
  assert.equal(created.departments[0]!.priority, 1);
  assert.ok(created.employees.length >= 2);                       // 부서별 seed 직원
  // 트리: company 1 + ceo 1 + dept 2 + employee N
  const kinds = created.tree.map((n) => n.kind);
  assert.equal(kinds.filter((k) => k === "company").length, 1);
  assert.equal(kinds.filter((k) => k === "ceo").length, 1);
  assert.ok(kinds.filter((k) => k === "department").length >= 2);
});

test("creation: 설계안에 Writer Employee와 추천 Skill이 반영된다", () => {
  const { draft } = setup();
  const apr = requestFoundingApproval(draft);
  approve(apr, draft);
  const created = createCompanyFromDraft("cus_1", draft);
  const writer = created.employees.find((e) => e.dna.genome.roleFamily === "content");
  assert.ok(writer, "Writer Employee 존재");
  assert.ok(writer!.recommendedSkills.includes("brand-voice-writer"));
});
