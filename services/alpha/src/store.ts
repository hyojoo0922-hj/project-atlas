// Atlas Alpha — 영속 스토어(JSON 파일) + 부트스트랩
// 매일 사용을 위해 회사/직원/정보/업무가 재시작 후에도 유지된다(인메모리+파일).
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname } from "node:path";
import type {
  Company, CompanyEmployee, Department, Id, OwnerReport, RoleFamily,
} from "../../../packages/shared-types/src/index.ts";

export interface AlphaTask {
  id: Id;
  ownerText: string;
  report: OwnerReport;
  status: "open" | "approved" | "revise";
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
