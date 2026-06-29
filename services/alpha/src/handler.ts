// Atlas Alpha — 공용 API 라우팅(단일 소스). node:http 서버와 Vercel 서버리스 함수가 함께 사용.
// 순수 라우팅 — 트랜스포트(req/res) 비의존. {status, json} 반환.
import { randomUUID } from "node:crypto";
import type { Material, RoleFamily } from "../../../packages/shared-types/src/index.ts";
import type { AlphaStore, ImageChoice, MaterialCategory } from "./store.ts";
import {
  addVaultMaterials, approveTask, dashboard, editVaultItem, executeTask, hideVaultItem, hire, hideTask, login,
  type MaterialItem, provideMaterials, proceedWithPartial, registerTask, reviseTask, setImageChoice, taskView, topUpCredits,
} from "./app.ts";

export interface ApiResult { status: number; json: unknown }

const parseItems = (raw: unknown): MaterialItem[] =>
  Array.isArray(raw)
    ? raw.map((it) => ({ kind: ((it as MaterialItem)?.kind ?? "text") as Material["kind"], value: String((it as MaterialItem)?.value ?? "") }))
    : [];

/** API 라우팅. token이 세션에 있으면 인증. /api/login은 토큰 발급(세션에 추가). */
export async function handleApi(
  store: AlphaStore, sessions: Set<string>, url: string, body: Record<string, unknown>, token: string,
): Promise<ApiResult> {
  const b = body ?? {};

  if (url === "/api/login") {
    const r = login(store, String(b.ownerName ?? ""), String(b.pass ?? ""));
    if (!r.ok) return { status: 401, json: r };
    const t = randomUUID(); sessions.add(t);
    return { status: 200, json: { ...r, token: t, dashboard: dashboard(store) } };
  }
  if (!sessions.has(token)) return { status: 401, json: { error: "login required" } };

  const ok = (extra: Record<string, unknown> = {}): ApiResult => ({ status: 200, json: { dashboard: dashboard(store), ...extra } });
  switch (url) {
    case "/api/dashboard": return ok();
    case "/api/register": {
      const title = String(b.title ?? "").trim();
      if (!title) return { status: 400, json: { error: "empty" } };
      const t = registerTask(store, title); return ok({ task: taskView(store, t) });
    }
    case "/api/provide": {
      const items = Array.isArray(b.items) ? parseItems(b.items) : [{ kind: (b.kind as Material["kind"]) ?? "text", value: String(b.value ?? "") }];
      const t = provideMaterials(store, String(b.taskId ?? ""), String(b.infoKey ?? ""), items, b.note as string | undefined);
      return t ? ok({ task: taskView(store, t) }) : { status: 404, json: { error: "no task" } };
    }
    case "/api/execute": {
      const t = await executeTask(store, String(b.taskId ?? ""));
      return t ? ok({ task: taskView(store, t) }) : { status: 404, json: { error: "no task" } };
    }
    case "/api/proceed": {
      const t = await proceedWithPartial(store, String(b.taskId ?? ""));
      return t ? ok({ task: taskView(store, t) }) : { status: 404, json: { error: "no task" } };
    }
    case "/api/vault/add": {
      const items = Array.isArray(b.items) ? parseItems(b.items) : [{ kind: (b.kind as Material["kind"]) ?? "text", value: String(b.value ?? "") }];
      const created = addVaultMaterials(store, (b.category as MaterialCategory) ?? "etc", items, b.note as string | undefined, b.infoKey as string | undefined);
      return created.length ? ok() : { status: 400, json: { error: "empty" } };
    }
    case "/api/vault/edit": {
      const v = editVaultItem(store, String(b.id ?? ""), { category: b.category as MaterialCategory | undefined, value: b.value as string | undefined, note: b.note as string | undefined });
      return v ? ok() : { status: 404, json: { error: "no item" } };
    }
    case "/api/vault/hide": {
      const done = hideVaultItem(store, String(b.id ?? ""));
      return { status: done ? 200 : 404, json: { ok: done, dashboard: dashboard(store) } };
    }
    case "/api/image-choice": {
      const t = setImageChoice(store, String(b.taskId ?? ""), (b.choice as ImageChoice) ?? "brief");
      return t ? ok({ task: taskView(store, t) }) : { status: 404, json: { error: "no task" } };
    }
    case "/api/credits/topup": return ok({ credits: topUpCredits(store) });
    case "/api/hire": { hire(store, b.roleFamily as RoleFamily, b.persona as string | undefined); return ok(); }
    case "/api/hide": {
      const done = hideTask(store, String(b.taskId ?? ""));
      return { status: done ? 200 : 404, json: { ok: done, dashboard: dashboard(store) } };
    }
    case "/api/approve": {
      const done = approveTask(store, String(b.taskId ?? ""), b.overall ? { overall: Number(b.overall), comment: b.comment as string } : undefined);
      return { status: done ? 200 : 404, json: { ok: done, dashboard: dashboard(store) } };
    }
    case "/api/revise": {
      const t = reviseTask(store, String(b.taskId ?? ""), String(b.note ?? ""));
      return t ? ok({ task: taskView(store, t) }) : { status: 404, json: { error: "no task" } };
    }
    default: return { status: 404, json: { error: "not found" } };
  }
}
