// Project Atlas — 공유 도메인 타입 (Sprint 1, zero-dep)
// 근거: docs/specs/employee-dna-spec.md, docs/architecture/02-data-model.md
// 주의: Sprint 1은 Zod 미사용(ADR 0006). 타입 + 경량 수제 validator만.

// ───────────────────────── 식별자 / 유틸 ─────────────────────────
export type Id = string;

let __seq = 0;
/** 결정적 ID 생성기 (테스트 안정성을 위해 시간/난수 미사용) */
export const newId = (prefix: string): Id => `${prefix}_${String(++__seq).padStart(3, "0")}`;
/** 테스트 격리를 위한 시퀀스 리셋 */
export const __resetIds = (): void => { __seq = 0; };

// ───────────────────────── 고객 / 브랜드 ─────────────────────────
export type BillingMode = "hosted" | "byok" | "credit";

export interface Customer {
  id: Id;
  name: string;
  plan: BillingMode;
  status: "active" | "suspended";
}

export interface Brand {
  id: Id;
  customerId: Id;
  name: string;
  locale: string;
}

// ───────────────────────── Brand Memory ─────────────────────────
export type MemoryKind = "voice" | "product" | "asset" | "policy" | "history" | "decision";

export interface MemoryRevision {
  version: number;
  value: unknown;
  author: string;
}

export interface BrandMemory {
  id: Id;
  brandId: Id;
  kind: MemoryKind;
  key: string;
  value: unknown;
  version: number;
  revisions: MemoryRevision[]; // append-only, 손실 없는 버전관리
}

// ───────────────────────── Employee (중심 객체) ─────────────────────────
// Sprint 2A: operations·marketing 추가. MEMO #009: design 추가(Designer Employee). 하위호환 유지.
export type RoleFamily = "content" | "support" | "research" | "operations" | "marketing" | "design";

/** DNA 4레이어: genome(불변) / phenotype(발현) / acquired(획득) / lineage(계보) */
export interface EmployeeGenome {       // 불변 — 생성 후 변경 금지
  archetype: "creator" | "responder" | "analyst";
  roleFamily: RoleFamily;
}
export interface EmployeePhenotype {    // 브랜드별 발현
  persona: string;
  tone: string;
  locale: string;
}
export interface EmployeeAcquired {     // 가변 — 성장
  traits: string[];
  values: string[];
}
export interface LineageEntry {         // append-only
  version: number;
  change: string;
}
export interface EmployeeDNA {
  genome: EmployeeGenome;
  phenotype: EmployeePhenotype;
  acquired: EmployeeAcquired;
  lineage: LineageEntry[];
}

export interface MatchingProfile {      // DNA + 이력에서 파생
  employeeId: Id;
  roleFamily: RoleFamily;
  traits: string[];
  /** 카테고리별 누적 성과(0..1) — 성장 루프의 핵심 신호 */
  trackRecord: Record<string, number>;
  certifiedSkillVersionIds: Id[];
}

export type TrainingStatus = "enrolled" | "completed" | "failed";
export interface TrainingRecord {
  id: Id;
  employeeId: Id;
  skillVersionId: Id;
  status: TrainingStatus;
  score?: number;
}

export type CertStatus = "active" | "expired" | "revoked";
export interface Certification {
  id: Id;
  employeeId: Id;
  skillVersionId: Id;
  status: CertStatus;
  scope: Id[];          // 유효 브랜드 범위
  evidenceTestScore: number;
}

export interface PerformanceRecord {
  id: Id;
  employeeId: Id;
  runId: Id;
  category: string;     // skill category
  rating: number;       // 0..1
  roiDelivered: number;
}

export interface Employee {
  id: Id;
  brandId: Id;
  dna: EmployeeDNA;
  memoryScope: MemoryKind[];
  guardrails: string[];
  budgetId: Id;
  matchingProfile: MatchingProfile;
  skills: Id[];                 // SkillAssignment ids
  training: Id[];               // TrainingRecord ids
  certifications: Id[];         // Certification ids
  performance: Id[];            // PerformanceRecord ids
}

// ───────────────────────── Skill (핵심 자산) ─────────────────────────
/** 10단계 (ROI 분석 포함) + 종료 상태 */
export type LifecycleState =
  | "discovered" | "analyzed" | "sandboxed" | "roi_evaluated"
  | "recommended" | "trained" | "tested" | "certified"
  | "deployed" | "measured"
  | "hold" | "killed";

export interface RoiResult {
  status: "pending" | "go" | "hold" | "kill";
  roiScore: number;       // 가치/원가
  recommendedMode: BillingMode;
}

export interface SkillManifest {
  requiresMemory: MemoryKind[];
  guardrails: string[];
  fitSignals: { roleFamily: RoleFamily; traits: string[] };
  costTier: "light" | "standard" | "heavy";
  prereqCertSkillIds: Id[];   // 선행 인증 요구(없으면 [])
}

export interface Skill {
  id: Id;
  name: string;
  category: string;
  description: string;
  assetOwner: string;
}

export interface SkillVersion {
  id: Id;
  skillId: Id;
  version: string;
  lifecycleState: LifecycleState;
  manifest: SkillManifest;
  roi: RoiResult;
}

export interface SkillAssignment {
  id: Id;
  employeeId: Id;
  skillVersionId: Id;
  fitScore: number;
  certified: boolean;
  status: "deployed" | "revoked";
}

// ───────────────────────── 실행 & 비용 ─────────────────────────
export interface Task {
  id: Id;
  brandId: Id;
  requestedBy: string;
  intent: string;
  status: "open" | "running" | "done" | "failed";
}

export interface Run {
  id: Id;
  taskId: Id;
  employeeId: Id;
  skillVersionId: Id;
  status: "running" | "succeeded" | "failed";
  output?: string;
}

export interface CostLedgerEntry {
  id: Id;
  runId: Id;
  provider: string;
  model: string;
  tokensIn: number;
  tokensOut: number;
  cost: number;          // Sprint 1: mock → 항상 0
  billingMode: BillingMode;
  roiDelivered: number;
}

export interface Budget {
  id: Id;
  scope: "employee" | "brand" | "customer";
  scopeId: Id;
  limit: number;
  period: "day" | "month";
  spent: number;
}

// ───────────────────────── Matching 결과 ─────────────────────────
export type FitSignal =
  | "roleFamily" | "traits" | "certReadiness"
  | "memoryReadiness" | "trackRecord" | "costFit";

export interface FitResult {
  skillVersionId: Id;
  score: number;                              // 0..1
  breakdown: Record<FitSignal, number>;
  eligible: boolean;                          // 선행 인증 충족 여부
  reasons: string[];                          // 설명 가능성
}

// ───────────────────────── 감사 ─────────────────────────
export interface AuditEvent {
  id: Id;
  actor: string;
  action: string;
  target: string;
  payload?: unknown;
}

// Sprint 2A 온보딩/조직 도메인 타입 재노출
export * from "./onboarding-types.ts";
// MEMO #009 품질/신뢰 도메인 타입 재노출
export * from "./quality-types.ts";
// MEMO #010 대표 비서 Work Loop 타입 재노출
export * from "./work-loop-types.ts";
// EMPLOYEE CONTRACT & PRICING CONSTITUTION — 계약/가격/전문화/HQ 판단 타입 재노출
export * from "./employee-contract-types.ts";
