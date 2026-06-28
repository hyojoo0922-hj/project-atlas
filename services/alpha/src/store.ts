// Atlas Alpha — 영속 스토어(JSON 파일) + 부트스트랩
// 매일 사용을 위해 회사/직원/정보/업무가 재시작 후에도 유지된다(인메모리+파일).
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname } from "node:path";
import type {
  Company, CompanyEmployee, Department, Id, OutputType, RoleFamily,
} from "../../../packages/shared-types/src/index.ts";

/** 업무 상태 전이: 자료 대기 → 실행 가능 → (실행) → 결과 완료 → 승인/수정. 직원 부족 시 needs_hire. */
export type TaskStatus =
  | "needs_hire" | "awaiting_materials" | "ready" | "delivered" | "approved" | "revise";

/** 대표가 제공한 자료 (Company/Brand Memory에 연결) */
export interface Material {
  id: Id;
  taskId: Id;
  infoKey: string;
  kind: "text" | "url" | "file" | "image";
  value: string;          // 텍스트/URL/파일명
  note?: string;
  byEmployeeRole?: RoleFamily;   // 어떤 직원이 요청했는가
}

/** mock 결과물 (실제 생성은 Sprint 3) */
export interface TaskResult {
  outputType: OutputType;
  by: string;             // 담당 직원 persona
  state: "final" | "draft";
  content: string;        // mock/placeholder 텍스트
}

export interface AlphaTask {
  id: Id;
  title: string;          // 대표가 입력한 업무 한 줄
  outputTypes: OutputType[];
  requiredRoles: RoleFamily[];
  status: TaskStatus;
  missingInfo: string[];        // 현재 부족 자료(보유 직군 기준)
  missingRoles: RoleFamily[];   // 추천 채용 직군
  materials: Material[];
  results: TaskResult[];
  reviseNote?: string;
  feedback?: { overall: number; comment?: string };
}

export interface AlphaData {
  seq: number;
  ownerName: string;
  company: Company;
  departments: Department[];
  employees: CompanyEmployee[];
  companyInfo: string[];        // 보유 정보 키 (Company Memory)
  tasks: AlphaTask[];
}

const DATA_PATH = process.env.ATLAS_DATA ?? `${process.cwd()}/.atlas-data/alpha.json`;

export class AlphaStore {
  data: AlphaData;
  private path: string;

  constructor(path = DATA_PATH) {
    this.path = path;
    this.data = existsSync(path) ? JSON.parse(readFileSync(path, "utf8")) : bootstrap();
    this.save();
  }

  /** 영속 seq 기반 id (재시작 후 충돌 방지) */
  nextId(prefix: string): Id { this.data.seq += 1; return `${prefix}-${this.data.seq}`; }

  save(): void {
    mkdirSync(dirname(this.path), { recursive: true });
    writeFileSync(this.path, JSON.stringify(this.data, null, 2));
  }

  presentRoles(): RoleFamily[] {
    return [...new Set(this.data.employees.map((e) => e.dna.genome.roleFamily))];
  }
}

// ── 부트스트랩: 로마티 카페 (운영 매니저 + 콘텐츠 라이터). 정보는 비어 있음(첫 요청 시 자료 요청 유도) ──
function bootstrap(): AlphaData {
  let seq = 0;
  const id = (p: string) => `${p}-${++seq}`;
  const ceoId = id("ceo");
  const companyId = id("com");
  const depOps = id("dep");
  const depMkt = id("dep");
  const mkEmp = (departmentId: Id, roleFamily: RoleFamily, persona: string, archetype: CompanyEmployee["dna"]["genome"]["archetype"]): CompanyEmployee => ({
    id: id("emp"), companyId, departmentId, rank: "junior",
    dna: { genome: { archetype, roleFamily }, phenotype: { persona, tone: "warm", locale: "ko-KR" },
      acquired: { traits: [], values: [] }, lineage: [{ version: 1, change: "alpha bootstrap" }] },
    recommendedSkills: [], memoryScope: ["voice", "product", "policy"],
  });
  const company: Company = {
    id: companyId, customerId: id("cus"), name: "로마티 카페",
    industry: "cafe", stage: "early_growth", goal: "온라인 매출 중심 성장", ceoId,
  };
  const departments: Department[] = [
    { id: depOps, companyId, name: "Operations", focus: "operations", mandate: "매장 운영·재고", priority: 1, requiredSkills: ["inventory-mgmt"] },
    { id: depMkt, companyId, name: "Marketing", focus: "marketing", mandate: "콘텐츠·홍보", priority: 2, requiredSkills: ["brand-voice-writer"] },
  ];
  const employees: CompanyEmployee[] = [
    mkEmp(depOps, "operations", "운영 매니저", "responder"),
    mkEmp(depMkt, "content", "콘텐츠 라이터", "creator"),
  ];
  return { seq, ownerName: "효주 대표", company, departments, employees, companyInfo: [], tasks: [] };
}
