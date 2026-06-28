// Company Creation Flow — AI 설계안(draft) → 대표 승인 → Company 자동 생성
// 근거: docs/specs/company-creation-flow-spec.md
// 원칙: AI가 설계하고, 대표는 승인만. 승인 전에는 실제 Company 객체가 생성되지 않는다.
import { newId } from "../../shared-types/src/index.ts";
import type {
  ApprovalRequest, CompanyDesignDraft, CompanyProposal, CreatedCompany, Diagnosis,
  ExpectedEffect, Id, OnboardingResponse, OrgRecommendation, PaymentConfirmation,
} from "../../shared-types/src/index.ts";
import { createCEO, createCompany, createDepartment, createEmployee } from "../../company-core/src/company-core.ts";
import { OrgTree } from "../../organization/src/organization.ts";

export class ApprovalRequiredError extends Error {}
export class PaymentRequiredError extends Error {}

// ───────────────────────── 무료 산출: Company Proposal (Preview + 기대효과) ─────────────────────────
/** 추천으로부터 예상 절약 시간/기대 효과를 추정(결정적 v0). */
export function estimateExpectedEffect(rec: OrgRecommendation): ExpectedEffect {
  const HOURS_PER_DEPT = 6; // 부서당 주간 절약 추정(가설)
  const savedHoursPerWeek = rec.departments.length * HOURS_PER_DEPT;
  const summary = [
    `추천 부서 ${rec.departments.length}개 구성 시 주당 약 ${savedHoursPerWeek}시간 절약 예상`,
    ...rec.departments.map((d) => `${d.name}: ${d.mandate}`),
  ];
  return { savedHoursPerWeek, summary };
}

/** 무료 종착물 = 회사 설계안 Preview + 기대 효과 (실제 Company 생성 아님). */
export function buildCompanyProposal(draft: CompanyDesignDraft, rec: OrgRecommendation): CompanyProposal {
  return {
    id: newId("prop"),
    draftId: draft.id,
    expectedEffect: estimateExpectedEffect(rec),
    designPreview: {
      companyName: draft.company.name,
      departments: draft.departments.map((d) => ({
        name: d.name, priority: d.priority,
        employeeTitles: d.seedEmployees.map((e) => e.title),
        skills: d.requiredSkills,
      })),
    },
    status: "proposal_ready",
  };
}

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
 * BUSINESS MEMO #008: **결제(PaymentConfirmation) 이후에만** 생성 가능(유료).
 * 승인되지 않은 draft로는 생성 불가(불변식).
 */
export function createCompanyFromDraft(
  customerId: Id, draft: CompanyDesignDraft, payment: PaymentConfirmation,
): CreatedCompany {
  if (!payment?.confirmed) {
    throw new PaymentRequiredError("결제 후에만 실제 Company를 생성할 수 있습니다(무료는 설계안 Preview까지).");
  }
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
