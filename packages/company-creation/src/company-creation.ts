// Company Creation Flow — AI 설계안(draft) → 대표 승인 → Company 자동 생성
// 근거: docs/specs/company-creation-flow-spec.md
// 원칙: AI가 설계하고, 대표는 승인만. 승인 전에는 실제 Company 객체가 생성되지 않는다.
import { newId } from "../../shared-types/src/index.ts";
import type {
  ApprovalRequest, CompanyDesignDraft, CreatedCompany, Diagnosis,
  Id, OnboardingResponse, OrgRecommendation,
} from "../../shared-types/src/index.ts";
import { createCEO, createCompany, createDepartment, createEmployee } from "../../company-core/src/company-core.ts";
import { OrgTree } from "../../organization/src/organization.ts";

export class ApprovalRequiredError extends Error {}

/** 진단 + 추천 → AI 회사 설계안(draft). 아직 실제 객체 생성 없음. */
export function buildDesignDraft(
  res: OnboardingResponse, diagnosis: Diagnosis, rec: OrgRecommendation,
): CompanyDesignDraft {
  return {
    id: newId("cd"),
    responseId: res.id,
    diagnosisId: diagnosis.id,
    recommendationId: rec.id,
    company: {
      name: res.companyName, industry: res.industry, stage: res.stage,
      goal: `${res.grow} 중심 성장 (병목: ${diagnosis.firstBuild})`,
    },
    ceo: {
      decisionStyle: { delegation: "medium", speed: "fast", basis: "data" },
      riskAppetite: "medium",
      brandPriority: res.brand ? ["existing-brand"] : ["build-brand-voice"],
      growthStrategy: { targetStage: diagnosis.recommendedStage, focus: diagnosis.priorities.map((p) => p.focus) },
    },
    departments: rec.departments,
    rationale: [...diagnosis.rationale, ...rec.rationale],
    status: "draft",
  };
}

/** 창업 승인 요청 생성(대표 승인 대기). */
export function requestFoundingApproval(draft: CompanyDesignDraft): ApprovalRequest {
  return { id: newId("apr"), kind: "founding", draftId: draft.id, resolvedDecision: "ceo", status: "pending" };
}

/** 대표 승인 처리. */
export function approve(req: ApprovalRequest, draft: CompanyDesignDraft): void {
  req.status = "approved";
  draft.status = "approved";
}
export function reject(req: ApprovalRequest, draft: CompanyDesignDraft): void {
  req.status = "rejected";
  draft.status = "rejected";
}

/**
 * 승인된 draft → 실제 Company/CEO/Department/Employee + Organization 트리 인스턴스화.
 * 승인되지 않은 draft로는 생성 불가(불변식).
 */
export function createCompanyFromDraft(customerId: Id, draft: CompanyDesignDraft): CreatedCompany {
  if (draft.status !== "approved") {
    throw new ApprovalRequiredError("승인되지 않은 설계안으로는 Company를 생성할 수 없습니다.");
  }

  const ceo = createCEO("__pending__", draft.ceo);              // companyId는 직후 설정
  const company = createCompany({
    customerId, name: draft.company.name, industry: draft.company.industry,
    stage: draft.company.stage, goal: draft.company.goal, ceoId: ceo.id,
  });
  ceo.companyId = company.id;

  const tree = new OrgTree(company.id);
  tree.setRoot(company.id);
  tree.addUnderCompany("ceo", ceo.id);

  const departments = [];
  const employees = [];
  for (const dRec of draft.departments) {
    const dept = createDepartment(company.id, dRec);
    departments.push(dept);
    const deptNode = tree.addUnderCompany("department", dept.id);
    for (const eRec of dRec.seedEmployees) {
      const emp = createEmployee(company.id, dept.id, eRec);
      employees.push(emp);
      tree.addEmployee(deptNode.id, emp.id);
    }
  }
  tree.validate();

  return { company, ceo, departments, employees, tree: tree.all() };
}
