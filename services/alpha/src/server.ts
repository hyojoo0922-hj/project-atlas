// Atlas Alpha — zero-dep HTTP 서버 (로그인 + 대표 비서 채팅)
// 실행: npm run alpha  → http://localhost:4317
import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import type { RoleFamily, WorkLoopResult } from "../../../packages/shared-types/src/index.ts";
import { roleTitle, infoLabel } from "../../../packages/assistant/src/work-loop.ts";
import { AlphaStore } from "./store.ts";
import {
  ALPHA_PASS, approveTask, assistantRequest, hire, login, onboardingAsks, provideInfo, reviseTask,
} from "./app.ts";

const PORT = Number(process.env.PORT ?? 4317);
const HTML = `${import.meta.dirname}/../public/index.html`;
const store = new AlphaStore();
const sessions = new Set<string>();

const TITLE_TO_ROLE: Record<string, RoleFamily> = {
  "Writer Employee": "content", "Designer Employee": "design", "CS Employee": "support",
  "Operations Employee": "operations", "Marketing Employee": "marketing", "Research Employee": "research",
};

/** Work Loop 결과 → 고객 친화 뷰 (내부 지표 숨김, 라벨/CTA 제공) */
function view(r: WorkLoopResult) {
  const infoNeeded = uniq(r.plans.filter((p) => p.status === "need_info").flatMap((p) => p.missingInfo))
    .map((k) => ({ key: k, label: infoLabel(k) }));
  const hireOptions = uniq(r.plans.filter((p) => p.status === "need_staff").flatMap((p) => p.missingRoleFamilies))
    .map((rf) => ({ roleFamily: rf, title: roleTitle(rf), asks: onboardingAsks(rf) }));
  return {
    taskId: r.report.taskId,
    summary: r.report.summary,
    deliverables: r.report.deliverables,
    nextActions: r.report.nextActions,
    overallState: r.report.overallState,
    feedbackRequest: r.report.feedbackRequest,
    infoNeeded, hireOptions,
  };
}
const uniq = <T>(a: T[]): T[] => [...new Set(a)];

function stateView() {
  return {
    ownerName: store.data.ownerName,
    company: { name: store.data.company.name, stage: store.data.company.stage },
    employees: store.data.employees.map((e) => ({ persona: e.dna.phenotype.persona, role: e.dna.genome.roleFamily })),
    companyInfo: store.data.companyInfo.map(infoLabel),
    tasks: store.data.tasks.slice(-10).map((t) => ({ id: t.id, text: t.ownerText, state: t.report.overallState, status: t.status })),
  };
}

const send = (res: import("node:http").ServerResponse, code: number, body: unknown) => {
  res.writeHead(code, { "content-type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(body));
};
const auth = (req: import("node:http").IncomingMessage): boolean =>
  sessions.has(String(req.headers["x-atlas-token"] ?? ""));

const server = createServer((req, res) => {
  const url = req.url ?? "/";
  if (req.method === "GET" && (url === "/" || url === "/index.html")) {
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    res.end(readFileSync(HTML, "utf8"));
    return;
  }
  if (req.method !== "POST" || !url.startsWith("/api/")) { send(res, 404, { error: "not found" }); return; }

  let raw = "";
  req.on("data", (c) => { raw += c; if (raw.length > 1e6) req.destroy(); });
  req.on("end", () => {
    let body: Record<string, unknown> = {};
    try { body = raw ? JSON.parse(raw) : {}; } catch { send(res, 400, { error: "bad json" }); return; }

    if (url === "/api/login") {
      const r = login(store, String(body.ownerName ?? ""), String(body.pass ?? ""));
      if (!r.ok) { send(res, 401, r); return; }
      const token = randomUUID(); sessions.add(token);
      send(res, 200, { ...r, token, state: stateView() });
      return;
    }
    if (!auth(req)) { send(res, 401, { error: "login required" }); return; }

    switch (url) {
      case "/api/state": send(res, 200, stateView()); return;
      case "/api/request": {
        const text = String(body.text ?? "").trim();
        if (!text) { send(res, 400, { error: "empty" }); return; }
        const { result } = assistantRequest(store, text);
        send(res, 200, { view: view(result), state: stateView() }); return;
      }
      case "/api/provide": {
        provideInfo(store, (body.keys as string[]) ?? []);
        send(res, 200, { state: stateView() }); return;
      }
      case "/api/hire": {
        hire(store, body.roleFamily as RoleFamily, body.persona as string | undefined);
        send(res, 200, { state: stateView() }); return;
      }
      case "/api/approve": {
        const ok = approveTask(store, String(body.taskId ?? ""),
          body.overall ? { overall: Number(body.overall), comment: body.comment as string } : undefined);
        send(res, ok ? 200 : 404, { ok }); return;
      }
      case "/api/revise": {
        const r = reviseTask(store, String(body.taskId ?? ""), String(body.note ?? ""));
        if (!r) { send(res, 404, { error: "not found" }); return; }
        send(res, 200, { view: view(r.result), state: stateView() }); return;
      }
      default: send(res, 404, { error: "not found" });
    }
  });
});

server.listen(PORT, () => {
  console.log(`\n  🏢 Atlas Alpha → http://localhost:${PORT}`);
  console.log(`  로그인: 이름 자유 / 비밀번호 "${ALPHA_PASS}" (ATLAS_PASS 로 변경)`);
  console.log(`  데이터: ${process.env.ATLAS_DATA ?? ".atlas-data/alpha.json"}\n`);
});
