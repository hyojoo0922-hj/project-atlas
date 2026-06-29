// Atlas Alpha — 영속 스토어(JSON 파일) + 부트스트랩
// 매일 사용을 위해 회사/직원/정보/업무가 재시작 후에도 유지된다(인메모리+파일).
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname } from "node:path";
import type {
  Company, CompanyEmployee, Department, Id, OutputType, RoleFamily,
} from "../../../packages/shared-types/src/index.ts";

/** 업무 상태 전이: 자료 대기 → 실행 가능 → (실행) → 결과 완료 → 승인/수정. 직원 부족 시 needs_hire.
 *  ready_with_missing_info: 일부 자료 미제공이지만 대표가 "이대로 진행"을 선택해 초안 진행 가능. */
export type TaskStatus =
  | "needs_hire" | "awaiting_materials" | "ready" | "ready_with_missing_info"
  | "delivered" | "approved" | "revise";

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

/** 이미지 요청 진행 방식 (수익화 선택) */
export type ImageChoice = "designer" | "credit" | "brief";
/** 결과물 요청 유형 (Ledger/표시용) */
export type RequestType = "text" | "image_credit" | "image_brief" | "image_designer_brief";

/** mock 결과물 (실제 생성은 Sprint 3) */
export interface TaskResult {
  outputType: OutputType;          // 실제 전달된 산출물 유형(이미지면 image_brief)
  requestedOutputType?: OutputType; // 원래 요청 유형(예: image) — 대체 산출물 구분용
  by: string;             // 담당 직원 persona
  state: "final" | "draft" | "pending";  // pending: 이미지 생성 대기/준비됨(실제 생성 OFF)
  content: string;        // mock/placeholder 텍스트
  requestType?: RequestType;   // 결과물 요청 유형
  creditsUsed?: number;        // 이 결과물에 사용된 크레딧(이미지 크레딧 경로)
  standardLabel?: string;      // 적용된 HQ Output Standard 라벨(직원 자유 제출 아님)
  // HQ Output Quality (Placeholder 평가 — 실제 AI 평가 아님)
  qualityLabel?: string;       // Excellent | Good | Draft | Needs Revision
  qualityScore?: number;       // 0..100 Placeholder
  qualityCategory?: string;    // writer | designer | marketing | cs | report
  recommendRevision?: boolean; // Draft 이하 → 대표에게 수정 요청 권장
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
  proceedAnyway?: boolean;       // 대표가 "이대로 진행" 선택(일부 자료 미제공 허용)
  partialMaterials?: boolean;    // 결과가 일부 자료 부족 상태로 생성됨
  hidden?: boolean;              // 숨김 처리(삭제 아님 — Satisfaction/감사 활용 위해 보존)
  archivedAt?: string;          // 숨김 처리 시각(ISO)
  imageChoice?: ImageChoice;     // 이미지 요청 진행 방식 선택(미선택이면 선택 카드 노출)
  needsImageChoice?: boolean;    // 이미지 subtask가 선택 대기 중
  creditShortfall?: boolean;     // 크레딧 부족으로 이미지 생성 미실행
}

/** AI 호출 원가/사용량 + 크레딧 내부 기록 (Usage Ledger) */
export interface UsageEntry {
  taskId: Id;
  outputType: OutputType;
  model: string;
  mode: "ai" | "mock";
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  credits: number;             // 예상/차감 크레딧 (텍스트=0, 이미지 크레딧=IMAGE_CREDIT_COST)
  requestType: RequestType;    // 요청 유형
}

/** Company Knowledge Vault 카테고리 (대표가 분류하는 자료 묶음) */
export type MaterialCategory =
  | "brand" | "product" | "reference" | "liked_style" | "disliked" | "customer_faq" | "etc";

/** Company Knowledge Vault 항목 — 업무 제공 자료 + 자료 탭 직접 추가 자료의 단일 저장소.
 *  companyInfo(보유 infoKey 집합)와 함께 출처·카테고리·날짜·연결 직원을 보존한다. */
export interface VaultItem {
  id: Id;
  infoKey: string;              // 어떤 정보 슬롯을 채우는가 (brand-voice, product-info, ...)
  category: MaterialCategory;
  kind: "text" | "url" | "file" | "image";
  value: string;               // 텍스트/URL/파일명/이미지명(mock)
  note?: string;
  sourceTaskId?: Id;           // 업무 중 제공된 경우 그 업무 id (없으면 자료 탭 직접 추가)
  byRole?: RoleFamily;         // 이 자료를 필요로 한(연결) 직원 직군
  createdAt: string;           // 생성일 ISO
  hidden?: boolean;            // 숨김 처리(삭제 아님 — 데이터 보존, 목록·자동활용에서 제외)
  archivedAt?: string;         // 숨김 처리 시각(ISO)
}

export interface AlphaData {
  version: number;
  seq: number;
  ownerName: string;
  company: Company;
  departments: Department[];
  employees: CompanyEmployee[];
  companyInfo: string[];        // 보유 정보 키 (Company Memory) — 자동 활용 판단의 단일 기준
  tasks: AlphaTask[];
  usage: UsageEntry[];          // 결과물 생성 시 AI 원가/사용량/크레딧 기록(Ledger)
  vault: VaultItem[];           // Company Knowledge Vault (자료 인박스)
  credits: number;              // 크레딧 잔액 (Placeholder — 실결제 없음)
}

/** 데이터 스키마 버전. 구버전(예: 채팅 시절 tasks)과 호환되지 않으면 새로 부트스트랩.
 *  v3: vault 필드 추가(가산적) — v2 데이터는 forward-merge로 보존. */
export const DATA_VERSION = 3;
const DATA_PATH = process.env.ATLAS_DATA ?? `${process.cwd()}/.atlas-data/alpha.json`;

const isCurrentTask = (t: unknown): boolean =>
  !!t && typeof (t as AlphaTask).title === "string" && Array.isArray((t as AlphaTask).requiredRoles);

/** 저장된 데이터를 현재 스키마로 안전 로드. 비호환이면 백업 후 새로 시작(검은 화면 방지). */
function loadOrBootstrap(path: string): AlphaData {
  if (!existsSync(path)) return bootstrap();
  let raw: Partial<AlphaData> | null = null;
  try { raw = JSON.parse(readFileSync(path, "utf8")); } catch { raw = null; }
  const tasksOk = !raw?.tasks || (Array.isArray(raw.tasks) && raw.tasks.every(isCurrentTask));
  // v2→v3는 가산적(vault 추가)이라 forward-merge로 보존. 그 이전/손상만 재부트스트랩.
  const versionOk = raw?.version === undefined || raw.version === 2 || raw.version === DATA_VERSION;
  const ok = raw && raw.company && Array.isArray(raw.employees) && Array.isArray(raw.companyInfo) && tasksOk && versionOk;
  if (!ok) {
    // 구버전/손상 데이터 → 백업 후 새로 부트스트랩
    try { writeFileSync(`${path}.bak`, readFileSync(path)); } catch { /* noop */ }
    return bootstrap();
  }
  return { ...bootstrap(), ...(raw as AlphaData), version: DATA_VERSION };
}

export class AlphaStore {
  data: AlphaData;
  private path: string;

  constructor(path = DATA_PATH) {
    this.path = path;
    this.data = loadOrBootstrap(path);
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
  return { version: DATA_VERSION, seq, ownerName: "효주 대표", company, departments, employees, companyInfo: [], tasks: [], usage: [], vault: [], credits: 2 };
}
