// Onboarding Flow — Sprint 2A 경험 엔진
// 무료 AI 컨설팅 → 사업 진단 → 핵심 병목 → AI 회사 설계안 → 추천(Dept/Employee/Skill)
// → 대표 승인 → Company 생성. (운영 루프·Health·Growth·재추천은 2B)
import { newId } from "../../../packages/shared-types/src/index.ts";
import type {
  ApprovalRequest, CompanyDesignDraft, CreatedCompany, Diagnosis, Id,
  OnboardingResponse, OrgRecommendation,
} from "../../../packages/shared-types/src/index.ts";
import { CustomerJourney } from "../../../packages/onboarding/src/onboarding.ts";
import { diagnose } from "../../../packages/diagnosis/src/diagnosis.ts";
import { recommendOrganization } from "../../../packages/org-recommendation/src/recommendation.ts";
import {
  approve, buildDesignDraft, createCompanyFromDraft, requestFoundingApproval,
} from "../../../packages/company-creation/src/company-creation.ts";

export interface OnboardingResult {
  journey: CustomerJourney;
  response: OnboardingResponse;
  diagnosis: Diagnosis;
  recommendation: OrgRecommendation;
  draft: CompanyDesignDraft;
  approval: ApprovalRequest;
  created: CreatedCompany;
  audit: { step: string; detail: string }[];
}

/**
 * 전체 온보딩 흐름을 단계별 상태 전이와 함께 실행.
 * 고객은 (1) 응답 제출 (2) 대표 승인 두 번만 행위한다. 나머지는 AI가 수행.
 */
export class OnboardingFlow {
  readonly audit: { step: string; detail: string }[] = [];
  private log(step: string, detail: string) { this.audit.push({ step, detail }); }

  run(customerId: Id, answers: Omit<OnboardingResponse, "id">): OnboardingResult {
    const journey = new CustomerJourney(customerId);

    // ① 무료 AI 컨설팅 (응답 수집)
    const response: OnboardingResponse = { id: newId("ob"), ...answers };
    journey.responseId = response.id;
    this.log("consulting", `컨설팅 응답 수집: ${response.companyName} (${response.industry}/${response.stage})`);

    // ② 사업 진단 + ③ 핵심 병목
    journey.to("diagnosing");
    const diagnosis = diagnose(response);
    journey.diagnosisId = diagnosis.id;
    this.log("diagnosis", diagnosis.bottleneck);

    // ④ AI 회사 설계안 + 추천 Department/Employee/Skill
    journey.to("designing");
    const recommendation = recommendOrganization(response.industry, response.stage, diagnosis);
    journey.recommendationId = recommendation.id;
    journey.to("recommending");
    this.log("recommendation", `추천 부서: ${recommendation.departments.map((d) => `${d.priority}.${d.name}`).join(", ")}`);

    const draft = buildDesignDraft(response, diagnosis, recommendation);
    journey.draftId = draft.id;
    journey.to("reviewing");
    this.log("design", `설계안 생성(draft): ${draft.company.name}`);

    // ⑤ 대표 승인 (고객 행위)
    const approval = requestFoundingApproval(draft);
    journey.to("approving");
    approve(approval, draft);
    this.log("approval", "대표 승인 완료(founding)");

    // ⑥ Company 생성
    const created = createCompanyFromDraft(customerId, draft);
    journey.companyId = created.company.id;
    journey.to("created");
    this.log("created", `Company 생성: ${created.company.name} / 부서 ${created.departments.length} / 직원 ${created.employees.length}`);

    return { journey, response, diagnosis, recommendation, draft, approval, created, audit: this.audit };
  }
}
