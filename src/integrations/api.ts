// SafeRoute API on Google Cloud Run (server/main.ts). Replaces the Supabase client.
// Set VITE_API_URL per environment (Vercel → Settings → Environment Variables); local dev can point it at
// `deno run -A server/main.ts` on http://localhost:8080.

const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ?? "";

export type ApiResult<T> = { data: T | null; error: { message: string; status?: number } | null };

async function request<T>(path: string, init?: RequestInit): Promise<ApiResult<T>> {
  if (!API_URL) return { data: null, error: { message: "VITE_API_URL is not set" } };
  try {
    const res = await fetch(`${API_URL}${path}`, init);
    const body = await res.json().catch(() => null);
    if (!res.ok) return { data: null, error: { message: body?.error ?? res.statusText, status: res.status } };
    return { data: body as T, error: null };
  } catch (err) {
    return { data: null, error: { message: err instanceof Error ? err.message : "Network error" } };
  }
}

/** Same call shape as supabase.functions.invoke(name, { body }). */
export function invoke<T = any>(name: string, options?: { body?: unknown }): Promise<ApiResult<T>> {
  return request<T>(`/fn/${name}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(options?.body ?? {}),
  });
}

/** Alerts that started at or after `since`, optionally for one oblast (was supabase.from('alerts')). */
export function getAlerts<T = any>(since: Date, region?: string): Promise<ApiResult<T[]>> {
  const q = new URLSearchParams({ since: since.toISOString() });
  if (region && region !== "all") q.set("region", region);
  return request<T[]>(`/alerts?${q}`);
}

/** One anonymous visit row (was supabase.from('site_visits').insert). */
export function recordVisit(path: string, language: string): Promise<ApiResult<{ ok: boolean }>> {
  return request(`/visits`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path, language }),
    keepalive: true,
  });
}
