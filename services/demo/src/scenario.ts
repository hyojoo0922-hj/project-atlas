// Sprint 1 핵심 시나리오 — CEO 승인 데모 흐름을 코드로 1:1 표현
// 고객 회사 생성 → Brand Memory → Writer Employee → 적합도 추천 → 교육 → 시험
// → 인증 → 배치 → 업무 요청 → mock 결과 → Usage/Cost/ROI → 성과 반영 → 다음 추천 변화
import { __resetIds } from "../../../packages/shared-types/src/index.ts";
import type { Budget, Customer, Brand, Employee, FitResult, SkillVersion } from "../../../packages/shared-types/src/index.ts";
import { Orchestrator } from "../../orchestrator/src/orchestrator.ts";
import { newId } from "../../../packages/shared-types/src/index.ts";

export interface ScenarioResult {
  orch: Orchestrator;
  customer: Customer;
  brand: Brand;
  writer: Employee;
  budget: Budget;
  skillA: SkillVersion; // brand-voice-writer
  skillB: SkillVersion; // repurpose-to-channel
  recoInitial: FitResult[];
  recoAfter: FitResult[];
  work: ReturnType<Orchestrator["requestWork"]>;
}

/** 결정적 시나리오. deterministic=true면 ID 시퀀스를 리셋(테스트 안정). */
export function runScenario(deterministic = true): ScenarioResult {
  if (deterministic) __resetIds();
  const orch = new Orchestrator();

  // ① 고객 회사 생성
  const customer: Customer = { id: newId("cus"), name: "Acme 브랜드", plan: "hosted", status: "active" };
  const brand: Brand = { id: newId("brd"), customerId: customer.id, name: "Acme", locale: "ko-KR" };
  const budget: Budget = { id: newId("bdg"), scope: "brand", scopeId: brand.id, limit: 100, period: "month", spent: 0 };
  orch.gateway.registerBudget(budget);

  // ② Brand Memory 입력
  orch.memory.write(brand.id, "voice", "tone", "따뜻하고 간결한, 신뢰감 있는 보이스");
  orch.memory.write(brand.id, "product", "hero", "민감성 피부용 진정 세럼");
  orch.memory.write(brand.id, "policy", "no-claim", "의학적 효능 단정 표현 금지");

  // Skill 자산 등록 + 라이프사이클(발견→…→recommended), ROI=go
  const aSkill = orch.skills.registerSkill("brand-voice-writer", "content", "브랜드 보이스로 글쓰기");
  const bSkill = orch.skills.registerSkill("repurpose-to-channel", "content", "원문을 채널별로 변형");
  const skillA = orch.skills.publishVersion(aSkill.id, "0.1.0", {
    requiresMemory: ["voice", "product"], guardrails: ["no-pii-export"],
    fitSignals: { roleFamily: "content", traits: ["creative"] }, costTier: "standard", prereqCertSkillIds: [],
  });
  const skillB = orch.skills.publishVersion(bSkill.id, "0.1.0", {
    requiresMemory: ["voice"], guardrails: ["no-pii-export"],
    fitSignals: { roleFamily: "content", traits: ["adaptive"] }, costTier: "light", prereqCertSkillIds: [],
  });
  for (const sv of [skillA, skillB]) {
    orch.skills.advanceTo(sv.id, "sandboxed");
    orch.skills.setRoi(sv.id, { status: "go", roiScore: sv === skillA ? 3.2 : 2.1, recommendedMode: "hosted" });
    orch.skills.advanceTo(sv.id, "recommended");
  }

  // ③ Writer Employee 채용/확인
  const writer = orch.employees.hire({
    brandId: brand.id, archetype: "creator", roleFamily: "content",
    persona: "브랜드 보이스 라이터", tone: "warm", locale: "ko-KR",
    traits: ["creative", "concise"], values: ["on-brand", "no-pii"],
    memoryScope: ["voice", "product", "policy"], guardrails: ["no-pii-export", "budget-aware"],
    budgetId: budget.id,
  });

  // ④ Skill 적합도 추천 (초기) — 임계 미만은 제외
  const recoInitial = orch.recommendSkills(writer.id);

  // ⑤ 교육 (AI University)
  const training = orch.employees.enroll(writer.id, skillA.id);
  orch.employees.completeTraining(training.id);
  orch.skills.advance(skillA.id); // recommended → trained

  // ⑥ 시험
  orch.employees.recordTest(training.id, 0.86);
  orch.skills.advance(skillA.id); // trained → tested

  // ⑦ 인증 (Certification System)
  orch.employees.certify(writer.id, skillA.id, [brand.id], 0.86);
  orch.skills.advance(skillA.id); // tested → certified

  // ⑧ 배치 (미인증이면 차단됨 — 여기선 인증 완료)
  orch.deploy(writer.id, skillA.id); // certified → deployed

  // ⑨~⑫ 업무 요청 → mock 결과 → Usage/Cost/ROI → 성과 반영
  const work = orch.requestWork({
    brandId: brand.id, employeeId: writer.id, skillVersionId: skillA.id,
    intent: "신제품 진정 세럼 인스타그램 카피 작성", requestedBy: "customer",
    billingMode: "hosted", rating: 0.9,
  });

  // ⑬ 성과가 MatchingProfile에 반영 → 다음 추천이 달라짐
  const recoAfter = orch.recommendSkills(writer.id);

  return { orch, customer, brand, writer, budget, skillA, skillB, recoInitial, recoAfter, work };
}
