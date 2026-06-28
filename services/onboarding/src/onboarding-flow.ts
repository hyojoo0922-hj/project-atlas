// Onboarding Flow — Sprint 2A + BUSINESS MEMO #008 (무료/유료 경계)
// 무료: 대표 계정 → 무료 진단권 → 진단 → 추천 → 회사 설계안 Preview(proposal_ready). 실제 생성 X.
// 유료: 결제 → 회사 설립 → 대표 비서 출근 → 첫 AI 직원 준비. (직원 Work Loop·결과물은 2B)
import { newId } from "../../../packages/shared-types/src/index.ts";
import type {
  ApprovalRequest, CompanyDesignDraft, CompanyProposal, CreatedCompany, CustomerView,
  Diagnosis, Id, OnboardingResponse, OrgRecommendation, OwnerAccount, OwnerAssistant,
  PaymentConfirmation,
} from "../../../packages/shared-types/src/index.ts";
import {
  CustomerJourney, activateVoucher, buildCustomerView, consumeVoucher, createOwnerAccount,
} from "../../../packages/onboarding/src/onboarding.ts";
import { diagnose } from "../../../packages/diagnosis/src/diagnosis.ts";
import { recommendOrganization } from "../../../packages/org-recommendation/src/recommendation.ts";
import {
  approve, buildCompanyProposal, buildDesignDraft, createCompanyFromDraft, requestFoundingApproval,
} from "../../../packages/company-creation/src/company-creation.ts";

export interface OnboardingFreeResult {
  account: OwnerAccount;
  journey: CustomerJourney;
  response: OnboardingResponse;
  diagnosis: Diagnosis;
  recommendation: OrgRecommendation;
  draft: CompanyDesignDraft;
  proposal: CompanyProposal;        // 무료 종착물 (Preview + 기대효과)
  customerViews: { state: string; view: CustomerView }[];
  audit: { step: string; detail: string }[];
}

export interface OnboardingPaidResult {
  payment: PaymentConfirmation;
  approval: ApprovalRequest;
  created: CreatedCompany;
  assistant: OwnerAssistant;        // 회사 설립 후 출근
  firstEmployeePersona: string;
}

export class OnboardingFlow {
  readonly audit: { step: string; detail: string }[] = [];
  readonly customerViews: { state: string; view: CustomerView }[] = [];
  private free?: OnboardingFreeResult;
  private log(step: string, detail: string) { this.audit.push({ step, detail }); }
  private snap(j: CustomerJourney, ctx: Parameters<typeof buildCustomerView>[1]) {
    this.customerViews.push({ state: j.state, view: buildCustomerView(j.state, ctx) });
  }

  /** 무료 영역: 대표 계정 → 진단 → 추천 → 회사 설계안 Preview. 실제 Company 생성하지 않음. */
  runFree(customerId: Id, ownerName: string, answers: Omit<OnboardingResponse, "id">): OnboardingFreeResult {
    const journey = new CustomerJourney(customerId);

    // 대표 계정 생성 + 무료 사업진단권
    const account = createOwnerAccount(ownerName);
    journey.accountId = account.id;
    this.log("account", `대표 계정 생성: ${ownerName}`);
    this.snap(journey, { ownerName });

    activateVoucher(account);
    journey.to("voucher_activated");
    this.log("voucher", "무료 사업진단권 활성화(계정당 1회)");
    this.snap(journey, { ownerName });

    // 사업 진단 (진단권 소진)
    const response: OnboardingResponse = { id: newId("ob"), ...answers };
    journey.responseId = response.id;
    journey.to("diagnosing");
    consumeVoucher(account);
    const diagnosis = diagnose(response);
    journey.diagnosisId = diagnosis.id;
    this.log("diagnosis", diagnosis.bottleneck);
    this.snap(journey, { diagnosis });

    // 회사 설계안 + 추천
    journey.to("designing");
    const recommendation = recommendOrganization(response.industry, response.stage, diagnosis);
    journey.recommendationId = recommendation.id;
    journey.to("recommending");
    this.snap(journey, { diagnosis });

    const draft = buildDesignDraft(response, diagnosis, recommendation);
    journey.draftId = draft.id;
    journey.to("reviewing");
    this.snap(journey, { diagnosis });

    // 무료 종착: Company Proposal Ready (Preview + 기대효과) — 실제 생성 없음
    const proposal = buildCompanyProposal(draft, recommendation);
    journey.to("proposal_ready");
    const effectText = proposal.expectedEffect.summary[0];
    this.log("proposal", `회사 설계안 Preview 준비: ${draft.company.name} (${effectText})`);
    this.snap(journey, { diagnosis, expectedEffectText: effectText });

    this.free = {
      account, journey, response, diagnosis, recommendation, draft, proposal,
      customerViews: this.customerViews, audit: this.audit,
    };
    return this.free;
  }

  /** 유료 전환: 결제 → 회사 설립 → 대표 비서 출근 → 첫 AI 직원 준비. */
  convertToPaid(payment: PaymentConfirmation): OnboardingPaidResult {
    if (!this.free) throw new Error("무료 단계(runFree)를 먼저 완료해야 합니다.");
    const { journey, draft, created: _ } = this.free as OnboardingFreeResult & { created?: never };
    const { customerId } = journey;

    // 결제 요구 → 진행
    journey.to("payment_required");
    this.snap(journey, { companyName: draft.company.name });
    this.log("payment", `결제 확인: ${payment.plan} (confirmed=${payment.confirmed})`);

    // 회사 설립 승인(founding) — 유료 경로에서 처리
    journey.to("company_activation");
    const approval = requestFoundingApproval(draft);
    approve(approval, draft);
    this.log("activation", "회사 설립 승인(founding)");

    // 실제 Company 생성 (결제 게이트 통과 필요)
    const created = createCompanyFromDraft(customerId, draft, payment);
    journey.companyId = created.company.id;
    journey.to("company_created");
    this.log("created", `Company 설립: ${created.company.name}`);
    this.snap(journey, { companyName: created.company.name });

    // 대표 비서 출근 (유료 후)
    const assistant: OwnerAssistant = {
      id: newId("asst"), companyId: created.company.id, status: "on_duty",
      role: ["대표 요청 수신", "업무 분석", "필요 직원 확인", "부족 직원 추천", "업무 배분", "결과 보고"],
    };
    journey.to("assistant_on_duty");
    this.log("assistant", "대표 비서 출근");
    this.snap(journey, { companyName: created.company.name });

    // 첫 AI 직원 준비 (업무 실행은 2B)
    const first = [...created.departments].sort((a, b) => a.priority - b.priority)[0]!;
    const firstEmp = created.employees.find((e) => e.departmentId === first.id)!;
    journey.to("first_employee_ready");
    this.snap(journey, { firstEmployeeText: `${firstEmp.dna.phenotype.persona} 준비 완료` });
    this.log("first_employee", `첫 AI 직원 준비: ${firstEmp.dna.phenotype.persona}`);

    return { payment, approval, created, assistant, firstEmployeePersona: firstEmp.dna.phenotype.persona };
  }
}
