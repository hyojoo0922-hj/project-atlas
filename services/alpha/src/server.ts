// Atlas Alpha — zero-dep HTTP 서버 (CEO Dashboard).
// 실행: npm run alpha  → http://localhost:4317 (같은 WiFi 핸드폰은 출력된 LAN URL로 접속)
// 텍스트 생성: 기본 mock. ATLAS_LLM=on + ANTHROPIC_API_KEY(.env) 시 실제 Claude(allowlist 유형만).
import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { networkInterfaces } from "node:os";
import { llmStatus } from "../../../packages/cost-control/src/text-gateway.ts";
import { AlphaStore, normalizeData } from "./store.ts";
import { makeSupabasePersister, supabaseConfig } from "./supabase.ts";
import { ALPHA_PASS } from "./app.ts";
import { handleApi } from "./handler.ts";

const PORT = Number(process.env.PORT ?? 4317);
const HOST = process.env.HOST ?? "0.0.0.0";   // 0.0.0.0 = 같은 WiFi의 핸드폰에서 접속 가능
const HTML = `${import.meta.dirname}/../public/index.html`;

// 영속 어댑터 선택: ATLAS_DB=supabase + env 설정 시 Supabase, 아니면 로컬 JSON.
const supaCfg = process.env.ATLAS_DB === "supabase" ? supabaseConfig() : null;
let DB_MODE = "json (.atlas-data)";
async function bootStore(): Promise<AlphaStore> {
  if (supaCfg) {
    const persister = makeSupabasePersister(supaCfg);
    const data = (await persister.load()) ?? normalizeData(null);   // 로드 실패 시 부트스트랩
    DB_MODE = `supabase (${supaCfg.table})`;
    return new AlphaStore({ data, persister });
  }
  return new AlphaStore();   // 로컬 JSON(기본)
}

/** 같은 네트워크(핸드폰)에서 접속 가능한 LAN IPv4 주소 목록 */
const lanAddresses = (): string[] => {
  const out: string[] = [];
  for (const ifaces of Object.values(networkInterfaces())) {
    for (const i of ifaces ?? []) {
      if (i.family === "IPv4" && !i.internal) out.push(i.address);
    }
  }
  return out;
};
const store = await bootStore();   // ESM top-level await
const sessions = new Set<string>();

const send = (res: import("node:http").ServerResponse, code: number, body: unknown) => {
  res.writeHead(code, { "content-type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(body));
};

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
  req.on("end", async () => {
    try {
      let b: Record<string, unknown> = {};
      try { b = raw ? JSON.parse(raw) : {}; } catch { send(res, 400, { error: "bad json" }); return; }
      const token = String(req.headers["x-atlas-token"] ?? "");
      const r = await handleApi(store, sessions, url, b, token);   // 공용 라우터(단일 소스)
      send(res, r.status, r.json);
    } catch (e) {
      console.error("[alpha] handler error:", e);
      send(res, 500, { error: "server error" });   // 절대 프로세스를 죽이지 않는다
    }
  });
});

server.listen(PORT, HOST, () => {
  const llm = llmStatus();
  console.log(`\n  🏢 Atlas Alpha (CEO Dashboard)`);
  console.log(`  ▸ 이 컴퓨터:   http://localhost:${PORT}`);
  for (const ip of lanAddresses()) {
    console.log(`  ▸ 핸드폰(같은 WiFi): http://${ip}:${PORT}`);
  }
  console.log(`  로그인: 이름 자유 / 비밀번호 "${ALPHA_PASS}"`);
  console.log(`  저장소: ${DB_MODE}`);
  // 텍스트 생성 상태 (키 값은 노출하지 않음)
  if (llm.active) console.log(`  텍스트 생성: 실제 AI ON (model=${llm.model})`);
  else if (llm.on && !llm.hasKey) console.log(`  텍스트 생성: ⚠️ ATLAS_LLM=on 이지만 ANTHROPIC_API_KEY 없음 → mock 폴백`);
  else console.log(`  텍스트 생성: mock (실제 AI OFF — 켜려면 ATLAS_LLM=on + ANTHROPIC_API_KEY)`);
  console.log("");
});
