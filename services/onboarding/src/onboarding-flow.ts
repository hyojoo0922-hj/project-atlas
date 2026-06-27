// Onboarding Flow — Sprint 2A 경험 엔진 (CPO UX Sprint #001 IA 반영)
// 대표 계정 생성 → 무료 사업진단권 활성화 → 사업 진단 → 공동창업자 판단 → 회사 설계안
// → 대표 승인(회사 설립 승인) → Company 생성 → 첫 업무 추천. (운영 루프·Health·Growth = 2B)
import { newId } from "../../../packages/shared-types/src/index.ts";
import type {
  ApprovalRequest, CompanyDesignDraft, CreatedCompany, CustomerView, Diagnosis,
  FirstTaskSuggestion, Id, OnboardingResponse, OrgRecommendation, OwnerAccount,
} from "../../../packages/shared-types/src/index.ts";
import {
  CustomerJourney, activateVoucher, buildCustomerView, consumeVoucher, createOwnerAccount,
} from "../../../packages/onboarding/src/onboarding.ts";
import { diagnose } from "../../../packages/diagnosis/src/diagnosis.ts";
import { recommendOrganization } from "../../../packages/org-recommendation/src/recommendation.ts";
import {
  approve, buildDesignDraft, createCompanyFromDraft, requestFoundingApproval,
} from "../../../packages/company-creation/src/company-creation.ts";

export interface OnboardingResult {
  account: OwnerAccount;
  journey: CustomerJourney;
  response: OnboardingResponse;
  diagnosis: Diagnosis;
  recommendation: OrgRecommendation;
  draft: CompanyDesignDraft;
  approval: ApprovalRequest;
  created: CreatedCompany;
  firstTask: FirstTaskSuggestion;
  /** 단계별 고객 화면 3요소 타임라인 (CPO UX용) */
  customerViews: { state: string; view: CustomerView }[];
  audit: { step: string; detail: string }[];
}

/** Company 생성 결과에서 첫 업무를 추천(실행 아님). 최우선 부서의 seed 직원/Skill 기반. */
function suggestFirstTask(created: CreatedCompany): FirstTaskSuggestion {
  const dept = [...created.departments].sort((a, b) => a.priority - b.priority)[0]!;
  const emp = created.employees.find((e) => e.departmentId === dept.id)!;
  const skill = emp.recommendedSkills[0] ?? "first-task";
  return {
    departmentName: dept.name,
    employeePersona: emp.dna.phenotype.persona,
    skill,
    label: "첫 업무 맡기기",
    description: `${dept.name}의 ${emp.dna.phenotype.persona}에게 첫 업무(${skill})를 맡겨보세요.`,
  };
}

export class OnboardingFlow {
  readonly audit: { step: string; detail: string }[] = [];
  readonly customerViews: { state: string; view: CustomerView }[] = [];
  private log(step: string, detail: string) { this.audit.push({ step, detail }); }

  run(customerId: Id, ownerName: string, answers: Omit<OnboardingResponse, "id">): OnboardingResult {
    const journey = new CustomerJourney(customerId);
    const snap = (ctx: Parameters<typeof buildCustomerView>[1]) =>
      this.customerViews.push({ state: journey.state, view: buildCustomerView(journey.state, ctx) });

    // ① 대표 계정 생성 (회원가입 대신) + 무료 사업진단권 부여
    const account = createOwnerAccount(ownerName);
    journey.accountId = account.id;
    this.log("account", `대표 계정 생성: ${ownerName}`);
    snap({ ownerName });

    // ② 무료 사업진단권 활성화 (계정당 1회)
    activateVoucher(account);
    journey.to("voucher_activated");
    this.log("voucher", "무료 사업진단권 활성화(계정당 1회)");
    snap({ ownerName });

    // ③ 사업 진단 (진단권 소진) + ④ 핵심 병목(공동창업자의 판단)
    const response: OnboardingResponse = { id: newId("ob"), ...answers };
    journey.responseId = response.id;
    journey.to("diagnosing");
    consumeVoucher(account);
    const diagnosis = diagnose(response);
    journey.diagnosisId = diagnosis.id;
    this.log("diagnosis", diagnosis.bottleneck);
    snap({ diagnosis });

    // ⑤ AI 회사 설계안 + 추천 Department/Employee/Skill
    journey.to("designing");
    const recommendation = recommendOrganization(response.industry, response.stage, diagnosis);
    journey.recommendationId = recommendation.id;
    journey.to("recommending");
    snap({ diagnosis });
    const draft = buildDesignDraft(response, diagnosis, recommendation);
    journey.draftId = draft.id;
    journey.to("reviewing");
    this.log("design", `설계안 생성(draft): ${draft.company.name}`);
    snap({ diagnosis, companyName: draft.company.name });

    // ⑥ 대표 승인 (회사 설립 승인)
    const approval = requestFoundingApproval(draft);
    journey.to("approving");
    snap({ diagnosis, companyName: draft.company.name });
    approve(approval, draft);
    this.log("approval", "회사 설립 승인 완료(founding)");

    // ⑦ Company 생성
    const created = createCompanyFromDraft(customerId, draft);
    journey.companyId = created.company.id;
    journey.to("created");
    this.log("created", `Company 생성: ${created.company.name}`);
    snap({ companyName: created.company.name });

    // ⑧ 첫 업무 추천 (실행은 2B)
    const firstTask = suggestFirstTask(created);
    journey.to("first_task");
    this.log("first_task", firstTask.description);
    snap({ firstTaskText: firstTask.description });

    return {
      account, journey, response, diagnosis, recommendation, draft, approval, created,
      firstTask, customerViews: this.customerViews, audit: this.audit,
    };
  }
}
