// Orchestrator — Employee 경험 엔진
// 입사 → 교육 → 시험 → 인증 → 배치 → 업무 → Cost/Usage/ROI → 성과 → 다음 추천 변화
// 근거: docs/specs/operator-hq-spec.md, docs/architecture/00-overview.md
import { newId } from "../../../packages/shared-types/src/index.ts";
import type {
  BillingMode, FitResult, Id, Run, SkillAssignment, SkillVersion, Task,
} from "../../../packages/shared-types/src/index.ts";
import { BrandMemoryStore } from "../../../packages/brand-memory/src/brand-memory.ts";
import { SkillLibrary } from "../../../packages/skill-library/src/skill-library.ts";
import { EmployeeStore } from "../../../packages/employee-core/src/employee-core.ts";
import { ModelGateway } from "../../../packages/cost-control/src/model-gateway.ts";
import { computeFit, recommend, type MatchContext } from "../../../packages/matching-engine/src/matching-engine.ts";

export class DeploymentBlockedError extends Error {}

export class Orchestrator {
  readonly memory = new BrandMemoryStore();
  readonly skills = new SkillLibrary();
  readonly employees = new EmployeeStore();
  readonly gateway = new ModelGateway();

  private assignments = new Map<Id, SkillAssignment>();
  private tasks = new Map<Id, Task>();
  private runs = new Map<Id, Run>();
  readonly audit: { action: string; target: string }[] = [];

  private log(action: string, target: string) { this.audit.push({ action, target }); }

  /** 브랜드 기준 Matching 컨텍스트 */
  matchContext(brandId: Id, budgetHeadroom = 1): MatchContext {
    return { availableMemoryKinds: this.memory.availableKinds(brandId), budgetHeadroom };
  }

  /** 직원에게 적합한 Skill 추천 (적격 + 임계 통과만) */
  recommendSkills(employeeId: Id): FitResult[] {
    const emp = this.employees.get(employeeId);
    if (!emp) throw new Error(`Employee not found: ${employeeId}`);
    const ctx = this.matchContext(emp.brandId);
    return recommend(emp.matchingProfile, this.skills.allVersions(), ctx);
  }

  /** 단일 (직원×Skill) 적합도 — 설명용 */
  fitFor(employeeId: Id, skillVersionId: Id): FitResult {
    const emp = this.employees.get(employeeId)!;
    const sv = this.skills.getVersion(skillVersionId)!;
    return computeFit(emp.matchingProfile, sv, this.matchContext(emp.brandId));
  }

  /** 배치(배포): 미인증이면 차단 (Certification System 게이트) */
  deploy(employeeId: Id, skillVersionId: Id): SkillAssignment {
    if (!this.employees.hasActiveCert(employeeId, skillVersionId)) {
      throw new DeploymentBlockedError("미인증 (직원×Skill) — 배치 불가");
    }
    const fit = this.fitFor(employeeId, skillVersionId);
    const a: SkillAssignment = {
      id: newId("asn"), employeeId, skillVersionId,
      fitScore: fit.score, certified: true, status: "deployed",
    };
    this.assignments.set(a.id, a);
    this.employees.get(employeeId)!.skills.push(a.id);
    const sv = this.skills.getVersion(skillVersionId)!;
    if (sv.lifecycleState === "certified") this.skills.advance(sv.id); // → deployed
    this.log("deploy", `${employeeId}/${skillVersionId}`);
    return a;
  }

  /** 업무 요청 → mock 실행 → Cost/Usage/ROI 기록 → 성과 → MatchingProfile 갱신 */
  requestWork(opts: {
    brandId: Id; employeeId: Id; skillVersionId: Id; intent: string;
    requestedBy: string; billingMode: BillingMode; rating: number;
  }): { task: Task; run: Run; fitBefore: FitResult[]; fitAfter: FitResult[] } {
    const { brandId, employeeId, skillVersionId, intent, requestedBy, billingMode, rating } = opts;
    const emp = this.employees.get(employeeId)!;
    const sv = this.skills.getVersion(skillVersionId)!;

    // 배치 확인
    const assigned = [...this.assignments.values()].some(
      (a) => a.employeeId === employeeId && a.skillVersionId === skillVersionId && a.status === "deployed");
    if (!assigned) throw new DeploymentBlockedError("미배치 Skill로는 업무를 수행할 수 없습니다.");

    const fitBefore = this.recommendSkills(employeeId);

    const task: Task = { id: newId("tsk"), brandId, requestedBy, intent, status: "running" };
    this.tasks.set(task.id, task);
    const run: Run = { id: newId("run"), taskId: task.id, employeeId, skillVersionId, status: "running" };
    this.runs.set(run.id, run);

    // mock 실행 — 모든 모델 접근은 Gateway 경유
    const memCtx = this.memory.byKind(brandId, "voice").map((m) => String(m.value)).join("; ");
    const result = this.gateway.invoke(
      { runId: run.id, skillVersion: sv, billingMode, prompt: `${intent} [voice:${memCtx}]` },
      emp.budgetId,
    );
    run.output = result.output;
    run.status = "succeeded";
    task.status = "done";

    // 성과 기록 → trackRecord(=roleFamily 카테고리) 갱신
    const category = sv.manifest.fitSignals.roleFamily;
    this.employees.recordPerformance(employeeId, run.id, category, rating, result.ledger.roiDelivered);
    // 성과측정 단계로 라이프사이클 전진
    if (sv.lifecycleState === "deployed") this.skills.advance(sv.id); // → measured
    // 작은 Employee Upgrade (실무 경험 획득)
    this.employees.upgrade(employeeId, "on-brand", `completed work via ${sv.id}`);
    this.log("requestWork", `${employeeId}/${skillVersionId}`);

    const fitAfter = this.recommendSkills(employeeId);
    return { task, run, fitBefore, fitAfter };
  }

  // 조회 헬퍼 (Operator HQ / Customer 렌더용)
  getAssignments(employeeId: Id): SkillAssignment[] {
    return [...this.assignments.values()].filter((a) => a.employeeId === employeeId);
  }
  allTasks(): Task[] { return [...this.tasks.values()]; }
  allRuns(): Run[] { return [...this.runs.values()]; }
}
