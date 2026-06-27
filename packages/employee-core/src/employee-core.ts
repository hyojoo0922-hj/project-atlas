// Employee Core — 중심 객체(1급 시민)의 생성·성장 로직
// 근거: docs/specs/employee-dna-spec.md
import { newId } from "../../shared-types/src/index.ts";
import type {
  Certification, Employee, EmployeeDNA, Id, MemoryKind,
  PerformanceRecord, RoleFamily, TrainingRecord,
} from "../../shared-types/src/index.ts";

export interface HireInput {
  brandId: Id;
  archetype: EmployeeDNA["genome"]["archetype"];
  roleFamily: RoleFamily;
  persona: string;
  tone: string;
  locale: string;
  traits: string[];
  values: string[];
  memoryScope: MemoryKind[];
  guardrails: string[];
  budgetId: Id;
}

export class EmployeeStore {
  private employees = new Map<Id, Employee>();
  private trainings = new Map<Id, TrainingRecord>();
  private certs = new Map<Id, Certification>();
  private perf = new Map<Id, PerformanceRecord>();

  /** 직원 채용(입사): DNA 4레이어 구성 + 파생 MatchingProfile 초기화 */
  hire(input: HireInput): Employee {
    const id = newId("emp");
    const dna: EmployeeDNA = {
      genome: { archetype: input.archetype, roleFamily: input.roleFamily }, // 불변
      phenotype: { persona: input.persona, tone: input.tone, locale: input.locale },
      acquired: { traits: [...input.traits], values: [...input.values] },
      lineage: [{ version: 1, change: "created (hired)" }],
    };
    const emp: Employee = {
      id, brandId: input.brandId, dna,
      memoryScope: [...input.memoryScope],
      guardrails: [...input.guardrails],
      budgetId: input.budgetId,
      matchingProfile: {
        employeeId: id,
        roleFamily: input.roleFamily,
        traits: [...input.traits],
        trackRecord: {},
        certifiedSkillVersionIds: [],
      },
      skills: [], training: [], certifications: [], performance: [],
    };
    this.employees.set(id, emp);
    return emp;
  }

  get(id: Id): Employee | undefined { return this.employees.get(id); }
  all(): Employee[] { return [...this.employees.values()]; }

  // ── 교육 (AI University) ──
  enroll(employeeId: Id, skillVersionId: Id): TrainingRecord {
    const rec: TrainingRecord = { id: newId("trn"), employeeId, skillVersionId, status: "enrolled" };
    this.trainings.set(rec.id, rec);
    this.must(employeeId).training.push(rec.id);
    return rec;
  }
  completeTraining(trainingId: Id): TrainingRecord {
    const rec = this.trainings.get(trainingId);
    if (!rec) throw new Error(`TrainingRecord not found: ${trainingId}`);
    rec.status = "completed";
    return rec;
  }
  getTraining(id: Id): TrainingRecord | undefined { return this.trainings.get(id); }

  // ── 시험 결과 기록 ──
  recordTest(trainingId: Id, score: number): TrainingRecord {
    const rec = this.trainings.get(trainingId);
    if (!rec) throw new Error(`TrainingRecord not found: ${trainingId}`);
    rec.score = score;
    rec.status = score >= 0.6 ? "completed" : "failed";
    return rec;
  }

  // ── 인증 (Certification System) ──
  certify(employeeId: Id, skillVersionId: Id, brandScope: Id[], testScore: number): Certification {
    if (testScore < 0.6) throw new Error("시험 불합격 — 인증 발급 불가");
    const cert: Certification = {
      id: newId("cert"), employeeId, skillVersionId,
      status: "active", scope: [...brandScope], evidenceTestScore: testScore,
    };
    this.certs.set(cert.id, cert);
    const emp = this.must(employeeId);
    emp.certifications.push(cert.id);
    if (!emp.matchingProfile.certifiedSkillVersionIds.includes(skillVersionId)) {
      emp.matchingProfile.certifiedSkillVersionIds.push(skillVersionId);
    }
    return cert;
  }
  getCert(id: Id): Certification | undefined { return this.certs.get(id); }
  hasActiveCert(employeeId: Id, skillVersionId: Id): boolean {
    return [...this.certs.values()].some(
      (c) => c.employeeId === employeeId && c.skillVersionId === skillVersionId && c.status === "active",
    );
  }

  // ── 성과 기록 → MatchingProfile 갱신 (성장 루프) ──
  recordPerformance(employeeId: Id, runId: Id, category: string, rating: number, roiDelivered: number): PerformanceRecord {
    const rec: PerformanceRecord = { id: newId("perf"), employeeId, runId, category, rating, roiDelivered };
    this.perf.set(rec.id, rec);
    const emp = this.must(employeeId);
    emp.performance.push(rec.id);
    // trackRecord = 해당 카테고리 평균 rating
    const catRecs = [...this.perf.values()].filter((p) => p.employeeId === employeeId && p.category === category);
    const avg = catRecs.reduce((a, p) => a + p.rating, 0) / catRecs.length;
    emp.matchingProfile.trackRecord[category] = avg;
    return rec;
  }
  performanceOf(employeeId: Id): PerformanceRecord[] {
    return [...this.perf.values()].filter((p) => p.employeeId === employeeId);
  }

  // ── Employee Upgrade: 획득 특성/계보 갱신 ──
  upgrade(employeeId: Id, acquireTrait: string, change: string): Employee {
    const emp = this.must(employeeId);
    if (!emp.dna.acquired.traits.includes(acquireTrait)) {
      emp.dna.acquired.traits.push(acquireTrait);
      emp.matchingProfile.traits.push(acquireTrait);
    }
    emp.dna.lineage.push({ version: emp.dna.lineage.length + 1, change });
    return emp;
  }

  private must(id: Id): Employee {
    const e = this.employees.get(id);
    if (!e) throw new Error(`Employee not found: ${id}`);
    return e;
  }
}
