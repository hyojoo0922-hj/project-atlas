// Atlas Alpha — zero-dep HTTP 서버 (CEO Dashboard). AI 호출 0.
// 실행: npm run alpha  → http://localhost:4317
import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import type { Material, RoleFamily } from "../../../packages/shared-types/src/index.ts";
import type { ImageChoice, MaterialCategory } from "./store.ts";
import { AlphaStore } from "./store.ts";
import {
  addVaultMaterials, ALPHA_PASS, approveTask, dashboard, editVaultItem, executeTask, hideVaultItem, hire, hideTask, login,
  type MaterialItem, provideMaterials, proceedWithPartial, registerTask, reviseTask, setImageChoice, taskView, topUpCredits,
} from "./app.ts";

// 요청 body의 items[] → MaterialItem[] (텍스트/URL/파일/이미지 다중)
const parseItems = (raw: unknown): MaterialItem[] =>
  Array.isArray(raw)
    ? raw.map((it) => ({ kind: ((it as MaterialItem)?.kind ?? "text") as Material["kind"], value: String((it as MaterialItem)?.value ?? "") }))
    : [];

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
  req.on("end", () => { handle(url, req, res, raw).catch((e) => {
    console.error("[alpha] handler error:", e);
    send(res, 500, { error: "server error" });   // 절대 프로세스를 죽이지 않는다
  }); });
});

async function handle(url: string, req: import("node:http").IncomingMessage, res: import("node:http").ServerResponse, raw: string) {
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
        const taskId = String(b.taskId ?? ""), infoKey = String(b.infoKey ?? ""), note = b.note as string | undefined;
        // items[] 있으면 다중, 없으면 단일(하위호환)
        const items = Array.isArray(b.items) ? parseItems(b.items) : [{ kind: (b.kind as Material["kind"]) ?? "text", value: String(b.value ?? "") }];
        const t = provideMaterials(store, taskId, infoKey, items, note);
        if (!t) { send(res, 404, { error: "no task" }); return; }
        reply({ task: taskView(store, t) }); return;
      }
      case "/api/execute": {
        const t = await executeTask(store, String(b.taskId ?? ""));
        if (!t) { send(res, 404, { error: "no task" }); return; }
        reply({ task: taskView(store, t) }); return;
      }
      case "/api/proceed": {   // 일부 자료 미제공 — "이대로 진행하기"
        const t = await proceedWithPartial(store, String(b.taskId ?? ""));
        if (!t) { send(res, 404, { error: "no task" }); return; }
        reply({ task: taskView(store, t) }); return;
      }
      case "/api/vault/add": {   // 자료 탭 직접 추가 (업무와 무관, 다중 지원)
        const category = (b.category as MaterialCategory) ?? "etc";
        const note = b.note as string | undefined, infoKey = b.infoKey as string | undefined;
        const items = Array.isArray(b.items) ? parseItems(b.items) : [{ kind: (b.kind as Material["kind"]) ?? "text", value: String(b.value ?? "") }];
        const created = addVaultMaterials(store, category, items, note, infoKey);
        if (!created.length) { send(res, 400, { error: "empty" }); return; }
        reply(); return;
      }
      case "/api/vault/edit": {   // 자료 카드 수정 (카테고리·값·메모)
        const v = editVaultItem(store, String(b.id ?? ""), {
          category: b.category as MaterialCategory | undefined,
          value: b.value as string | undefined, note: b.note as string | undefined,
        });
        if (!v) { send(res, 404, { error: "no item" }); return; }
        reply(); return;
      }
      case "/api/vault/hide": {   // 자료 카드 숨김(삭제 아님)
        const ok = hideVaultItem(store, String(b.id ?? ""));
        send(res, ok ? 200 : 404, { ok, dashboard: dashboard(store) }); return;
      }
      case "/api/image-choice": {   // 이미지 진행 방식 선택 (designer/credit/brief)
        const t = setImageChoice(store, String(b.taskId ?? ""), (b.choice as ImageChoice) ?? "brief");
        if (!t) { send(res, 404, { error: "no task" }); return; }
        reply({ task: taskView(store, t) }); return;
      }
      case "/api/credits/topup": {   // 크레딧 충전 (Placeholder — 실결제 없음)
        const credits = topUpCredits(store);
        reply({ credits }); return;
      }
      case "/api/hire": { hire(store, b.roleFamily as RoleFamily, b.persona as string | undefined); reply(); return; }
      case "/api/hide": {   // 카드 숨기기(삭제 아님)
        const ok = hideTask(store, String(b.taskId ?? ""));
        send(res, ok ? 200 : 404, { ok, dashboard: dashboard(store) }); return;
      }
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
