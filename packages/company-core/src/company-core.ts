// Company Core — Company / CEO / Department / CompanyEmployee 팩토리
// 근거: docs/specs/{company-dna,ceo,department,employee-dna}-spec.md
import { newId } from "../../shared-types/src/index.ts";
import type {
  CEO, CeoDesign, Company, CompanyEmployee, Department, DepartmentRecommendation,
  EmployeeRecommendation, Id, Industry, CompanyStage,
} from "../../shared-types/src/index.ts";

export function createCompany(input: {
  customerId: Id; name: string; industry: Industry; stage: CompanyStage; goal: string; ceoId: Id;
}): Company {
  return { id: newId("com"), customerId: input.customerId, name: input.name,
    industry: input.industry, stage: input.stage, goal: input.goal, ceoId: input.ceoId };
}

export function createCEO(companyId: Id, design: CeoDesign): CEO {
  return {
    id: newId("ceo"), companyId,
    dna: {
      genome: { archetype: "creator", roleFamily: "operations" }, // CEO 리더십 코어(불변)
      phenotype: { persona: "대표(CEO)", tone: "decisive", locale: "ko-KR" },
      acquired: { traits: [], values: design.brandPriority },
      lineage: [{ version: 1, change: "founded" }],
    },
    decisionStyle: design.decisionStyle,
    riskAppetite: design.riskAppetite,
    brandPriority: [...design.brandPriority],
    growthStrategy: design.growthStrategy,
    authority: { canReorg: true, approvesFounding: true },
  };
}

export function createDepartment(companyId: Id, rec: DepartmentRecommendation): Department {
  return {
    id: newId("dep"), companyId, name: rec.name, focus: rec.focus,
    mandate: rec.mandate, priority: rec.priority, requiredSkills: [...rec.requiredSkills],
  };
}

export function createEmployee(
  companyId: Id, departmentId: Id, rec: EmployeeRecommendation,
): CompanyEmployee {
  return {
    id: newId("emp"), companyId, departmentId, rank: "junior",
    dna: {
      genome: { archetype: rec.archetype, roleFamily: rec.roleFamily },
      phenotype: { persona: rec.role, tone: "warm", locale: "ko-KR" },
      acquired: { traits: [...rec.traits], values: [] },
      lineage: [{ version: 1, change: "hired (auto-created)" }],
    },
    recommendedSkills: [...rec.recommendedSkills],
    memoryScope: ["voice", "product", "policy"],
  };
}
