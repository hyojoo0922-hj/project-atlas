// Atlas Alpha — 앱 로직(순수, 테스트 가능). HTTP 바인딩은 server.ts.
import type { Id, RoleFamily, WorkLoopResult } from "../../../packages/shared-types/src/index.ts";
import { runWorkLoop, roleTitle } from "../../../packages/assistant/src/work-loop.ts";
import { onboardingQuestionsFor } from "../../../packages/quality/src/quality.ts";
import { AlphaStore, type AlphaTask } from "./store.ts";

export const ALPHA_PASS = process.env.ATLAS_PASS ?? "atlas";

export interface LoginResult { ok: boolean; ownerName?: string; reason?: string }

export function login(store: AlphaStore, ownerName: string, pass: string): LoginResult {
  if (pass !== ALPHA_PASS) return { ok: false, reason: "비밀번호가 올바르지 않습니다." };
  if (ownerName && ownerName.trim()) store.data.ownerName = ownerName.trim();
  store.save();
  return { ok: true, ownerName: store.data.ownerName };
}

/** 대표가 비서에게 요청 → Work Loop 실행 → 업무 기록 + 결과 반환. */
export function assistantRequest(store: AlphaStore, text: string): { task: AlphaTask; result: WorkLoopResult } {
  const requestId = store.nextId("tsk");
  const result = runWorkLoop(
    { requestId, ownerText: text, employees: store.data.employees, companyInfo: new Set(store.data.companyInfo) },
    (p) => store.nextId(p),
  );
  const task: AlphaTask = { id: requestId, ownerText: text, report: result.report, status: "open" };
  store.data.tasks.push(task);
  store.save();
  return { task, result };
}

/** 정보 부족 → 대표가 자료 제공(키 추가). Company Memory에 축적. */
export function provideInfo(store: AlphaStore, keys: string[]): string[] {
  for (const k of keys) if (k && !store.data.companyInfo.includes(k)) store.data.companyInfo.push(k);
  store.save();
  return store.data.companyInfo;
}

/** 직원 부족 → 대표가 채용. 해당 직군 직원 추가(유료 가정 — Alpha). */
export function hire(store: AlphaStore, roleFamily: RoleFamily, persona?: string): Id {
  const id = store.nextId("emp");
  const dep = store.data.departments[0]!;
  store.data.employees.push({
    id, companyId: store.data.company.id, departmentId: dep.id, rank: "junior",
    dna: { genome: { archetype: roleFamily === "design" ? "creator" : "responder", roleFamily },
      phenotype: { persona: persona ?? roleTitle(roleFamily), tone: "warm", locale: "ko-KR" },
      acquired: { traits: [], values: [] }, lineage: [{ version: 1, change: "hired (alpha)" }] },
    recommendedSkills: [], memoryScope: ["voice", "product", "policy"],
  });
  store.save();
  return id;
}

export function approveTask(store: AlphaStore, taskId: Id, feedback?: AlphaTask["feedback"]): boolean {
  const t = store.data.tasks.find((x) => x.id === taskId);
  if (!t) return false;
  t.status = "approved";
  if (feedback) t.feedback = feedback;
  store.save();
  return true;
}

export function reviseTask(store: AlphaStore, taskId: Id, note: string): { task: AlphaTask; result: WorkLoopResult } | null {
  const t = store.data.tasks.find((x) => x.id === taskId);
  if (!t) return null;
  t.status = "revise";
  t.reviseNote = note;
  store.save();
  // 수정 요청 = 동일 요청 + 메모로 재실행 (Alpha)
  return assistantRequest(store, `${t.ownerText} (수정 요청: ${note})`);
}

/** 채용 시 그 직원이 필요로 하는 온보딩 질문(직원이 묻는 구조) */
export function onboardingAsks(roleFamily: RoleFamily): string[] {
  return onboardingQuestionsFor(roleFamily)?.asks ?? [];
}
