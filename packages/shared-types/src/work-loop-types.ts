// 대표 비서 Work Loop 도메인 타입 (MEMO #010 설계 → Alpha 구현)
import type { Id, OutputType, RoleFamily } from "./index.ts";

export interface TaskRequest {
  id: Id;
  companyId: Id;
  ownerText: string;
}

export interface SubTask {
  outputType: OutputType;
  roleFamily: RoleFamily;
  requiredInfo: string[];
  requiredSkills: string[];
}

export type SubTaskStatus = "executable" | "need_staff" | "need_info" | "out_of_scope";

export interface SubTaskPlan {
  subTask: SubTask;
  status: SubTaskStatus;
  selectedEmployeeId?: Id;
  selectedEmployeePersona?: string;
  missingRoleFamilies: RoleFamily[];
  missingInfo: string[];
  readinessScore: number;          // 0..100
  confidence: "final" | "draft" | "info_request";
}

export interface EmployeeResult {
  outputType: OutputType;
  employeeId: Id;
  employeePersona: string;
  state: "final" | "draft";
  contentRef: string;              // mock placeholder (실제 생성은 Sprint 3)
}

export interface OwnerReport {
  taskId: Id;
  summary: string;
  deliverables: { type: OutputType; state: "final" | "draft"; by: string; contentRef: string }[];
  needed: { info: string[]; hire: string[] };   // 자료 요청 / 채용 추천(직원 타이틀)
  nextActions: string[];
  feedbackRequest: boolean;
  overallState: "delivered" | "partial" | "need_staff" | "need_info";
}

export type WorkLoopState = "reported" | "need_staff" | "need_info" | "blocked";

export interface WorkLoopResult {
  requestId: Id;
  analysisId: Id;
  outputTypes: OutputType[];
  plans: SubTaskPlan[];
  results: EmployeeResult[];
  report: OwnerReport;
  state: WorkLoopState;
}
