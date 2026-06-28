// Atlas Alpha — zero-dep HTTP 서버 (CEO Dashboard). AI 호출 0.
// 실행: npm run alpha  → http://localhost:4317
import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import type { Material, RoleFamily } from "../../../packages/shared-types/src/index.ts";
import { AlphaStore } from "./store.ts";
import {
  ALPHA_PASS, approveTask, dashboard, executeTask, hire, login, provideMaterial,
  proceedWithPartial, registerTask, reviseTask, taskView,
} from "./app.ts";

const PORT = Number(process.env.PORT ?? 4317);
const HTML = `${import.meta.dirname}/../public/index.html`;
const store = new AlphaStore();
const sessions = new Set<string>();

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
  req.on("data", (c) => { raw += c; if (raw.length > 2e6) req.destroy(); });
  req.on("end", () => { try { handle(url, req, res, raw); } catch (e) {
    console.error("[alpha] handler error:", e);
    send(res, 500, { error: "server error" });   // 절대 프로세스를 죽이지 않는다
  } });
});

function handle(url: string, req: import("node:http").IncomingMessage, res: import("node:http").ServerResponse, raw: string) {
  {
    let b: Record<string, unknown> = {};
    try { b = raw ? JSON.parse(raw) : {}; } catch { send(res, 400, { error: "bad json" }); return; }

    if (url === "/api/login") {
      const r = login(store, String(b.ownerName ?? ""), String(b.pass ?? ""));
      if (!r.ok) { send(res, 401, r); return; }
      const token = randomUUID(); sessions.add(token);
      send(res, 200, { ...r, token, dashboard: dashboard(store) });
      return;
    }
    if (!auth(req)) { send(res, 401, { error: "login required" }); return; }

    const reply = (extra: Record<string, unknown> = {}) => send(res, 200, { dashboard: dashboard(store), ...extra });
    switch (url) {
      case "/api/dashboard": reply(); return;
      case "/api/register": {
        const title = String(b.title ?? "").trim();
        if (!title) { send(res, 400, { error: "empty" }); return; }
        const t = registerTask(store, title); reply({ task: taskView(store, t) }); return;
      }
      case "/api/provide": {
        const t = provideMaterial(store, String(b.taskId ?? ""), String(b.infoKey ?? ""),
          (b.kind as Material["kind"]) ?? "text", String(b.value ?? ""), b.note as string | undefined);
        if (!t) { send(res, 404, { error: "no task" }); return; }
        reply({ task: taskView(store, t) }); return;
      }
      case "/api/execute": {
        const t = executeTask(store, String(b.taskId ?? ""));
        if (!t) { send(res, 404, { error: "no task" }); return; }
        reply({ task: taskView(store, t) }); return;
      }
      case "/api/proceed": {   // 일부 자료 미제공 — "이대로 진행하기"
        const t = proceedWithPartial(store, String(b.taskId ?? ""));
        if (!t) { send(res, 404, { error: "no task" }); return; }
        reply({ task: taskView(store, t) }); return;
      }
      case "/api/hire": { hire(store, b.roleFamily as RoleFamily, b.persona as string | undefined); reply(); return; }
      case "/api/approve": {
        const ok = approveTask(store, String(b.taskId ?? ""),
          b.overall ? { overall: Number(b.overall), comment: b.comment as string } : undefined);
        send(res, ok ? 200 : 404, { ok, dashboard: dashboard(store) }); return;
      }
      case "/api/revise": {
        const t = reviseTask(store, String(b.taskId ?? ""), String(b.note ?? ""));
        if (!t) { send(res, 404, { error: "no task" }); return; }
        reply({ task: taskView(store, t) }); return;
      }
      default: send(res, 404, { error: "not found" });
    }
  }
}

server.listen(PORT, () => {
  console.log(`\n  🏢 Atlas Alpha (CEO Dashboard) → http://localhost:${PORT}`);
  console.log(`  로그인: 이름 자유 / 비밀번호 "${ALPHA_PASS}"`);
  console.log(`  데이터: ${process.env.ATLAS_DATA ?? ".atlas-data/alpha.json"}\n`);
});
