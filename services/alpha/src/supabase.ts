// Supabase Persister — zero-dep PostgREST(fetch)로 AlphaData 스냅샷을 alpha_state 테이블에 영속.
// env 전용: SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY. 키는 코드에 하드코딩하지 않는다.
// 실패는 안전 처리(로드 실패→null, 저장 실패→로그). 인메모리 data가 요청 중 단일 진실.
import type { AlphaData, Persister } from "./store.ts";
import { normalizeData } from "./store.ts";

export interface SupabaseConfig { url: string; key: string; table: string; rowId: string; }

/** env에서 설정 구성. 미설정이면 null(→ JSON 폴백). */
export function supabaseConfig(): SupabaseConfig | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_KEY;
  if (!url || !key) return null;
  return {
    url: url.replace(/\/+$/, ""),
    key,
    table: process.env.ATLAS_DB_TABLE ?? "alpha_state",
    rowId: process.env.ATLAS_DB_ROW ?? "default",
  };
}

// ── 순수 빌더(테스트 가능, 키 값은 헤더에만) ──
export const restHeaders = (key: string): Record<string, string> =>
  ({ apikey: key, Authorization: `Bearer ${key}`, "content-type": "application/json" });
export const selectUrl = (c: SupabaseConfig): string =>
  `${c.url}/rest/v1/${c.table}?id=eq.${encodeURIComponent(c.rowId)}&select=data`;
export const upsertUrl = (c: SupabaseConfig): string => `${c.url}/rest/v1/${c.table}`;
export const upsertBody = (c: SupabaseConfig, data: AlphaData, now: string): string =>
  JSON.stringify({ id: c.rowId, owner_name: data.ownerName, data, updated_at: now });

/** Supabase 어댑터 생성 — 스냅샷 upsert/select. */
export function makeSupabasePersister(c: SupabaseConfig): Persister {
  return {
    load: async () => {
      try {
        const res = await fetch(selectUrl(c), { headers: restHeaders(c.key) });
        if (!res.ok) return null;
        const rows = (await res.json()) as { data?: Partial<AlphaData> }[];
        return normalizeData(rows?.[0]?.data ?? null);
      } catch {
        return null;   // 네트워크/오류 → 호출측에서 bootstrap 폴백
      }
    },
    save: async (data) => {
      try {
        await fetch(upsertUrl(c), {
          method: "POST",
          headers: { ...restHeaders(c.key), Prefer: "resolution=merge-duplicates" },
          body: upsertBody(c, data, new Date().toISOString()),
        });
      } catch (e) {
        console.error("[alpha] supabase save error:", e);
      }
    },
  };
}
