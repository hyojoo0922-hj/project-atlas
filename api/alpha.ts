// Vercel 서버리스 엔트리 — 공용 handler.ts 재사용(단일 소스). 배포 준비용 스캐폴드.
// 서버리스 인스턴스는 휘발성이므로 영속화는 Supabase 필수: env ATLAS_DB=supabase + SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY.
// 로컬 테스트(node --test)는 이 파일을 로드하지 않는다(*.test.ts만 실행).
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { AlphaStore, normalizeData, type Persister } from "../services/alpha/src/store.ts";
import { makeSupabasePersister, supabaseConfig } from "../services/alpha/src/supabase.ts";
import { handleApi } from "../services/alpha/src/handler.ts";

const sessions = new Set<string>();
let storePromise: Promise<AlphaStore> | null = null;

// 번들에 포함된 정적 HTML을 여러 후보 경로에서 안전하게 읽음(서버리스에서 throw 금지).
function readHtml(): string {
  const candidates = [
    join(process.cwd(), "services/alpha/public/index.html"),
    `${import.meta.dirname}/../services/alpha/public/index.html`,
    join(process.cwd(), "public/index.html"),
  ];
  for (const p of candidates) { try { return readFileSync(p, "utf8"); } catch { /* try next */ } }
  return "<!doctype html><meta charset=utf-8><title>Atlas</title><p>화면 파일을 찾지 못했습니다.</p>";
}

async function getStore(): Promise<AlphaStore> {
  if (!storePromise) {
    storePromise = (async () => {
      const cfg = process.env.ATLAS_DB === "supabase" ? supabaseConfig() : null;
      if (cfg) {
        const persister = makeSupabasePersister(cfg);
        const data = (await persister.load()) ?? normalizeData(null);
        return new AlphaStore({ data, persister });
      }
      // 서버리스 기본: 읽기전용 FS에 쓰지 않도록 in-memory(noop) 영속. 영속은 Supabase 권장.
      const mem: Persister = { load: () => normalizeData(null), save: () => { /* noop */ } };
      return new AlphaStore({ data: normalizeData(null), persister: mem });
    })();
  }
  return storePromise;
}

// Vercel Node 함수 시그니처(req/res). 타입 의존 없이 동작.
export default async function handler(req: any, res: any): Promise<void> {
  const url: string = req.url ?? "/";
  if (req.method === "GET" && (url === "/" || url === "/index.html")) {
    res.setHeader("content-type", "text/html; charset=utf-8");
    res.statusCode = 200; res.end(readHtml()); return;
  }
  if (req.method !== "POST" || !url.startsWith("/api/")) {
    res.statusCode = 404; res.setHeader("content-type", "application/json"); res.end(JSON.stringify({ error: "not found" })); return;
  }
  try {
    const body = typeof req.body === "object" && req.body ? req.body : await readJson(req);
    const token = String(req.headers["x-atlas-token"] ?? "");
    const store = await getStore();
    const r = await handleApi(store, sessions, url, body, token);
    res.statusCode = r.status; res.setHeader("content-type", "application/json; charset=utf-8"); res.end(JSON.stringify(r.json));
  } catch (e) {
    console.error("[alpha] vercel handler error:", e);
    res.statusCode = 500; res.setHeader("content-type", "application/json"); res.end(JSON.stringify({ error: "server error" }));
  }
}

function readJson(req: any): Promise<Record<string, unknown>> {
  return new Promise((resolve) => {
    let raw = ""; req.on("data", (c: unknown) => { raw += c; });
    req.on("end", () => { try { resolve(raw ? JSON.parse(raw) : {}); } catch { resolve({}); } });
    req.on("error", () => resolve({}));
  });
}
