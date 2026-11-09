// SafeRoute UA API on Google Cloud Run (replaces the four Supabase Edge Functions).
//
// Routes (all JSON, CORS open like the old functions):
//   POST /fn/explore-alerts-api  { endpoint }        proxy to alerts.in.ua (key stays server side)
//   POST /fn/get-mapbox-token                         { token }
//   POST /fn/get-weather-key                          { key }
//   POST /fn/sync-alerts-data                         pulls active alerts into Postgres (Cloud Scheduler + manual button)
//   GET  /alerts?since=<ISO>&region=<oblast>          rows for the analytics page (was supabase.from('alerts'))
//   POST /visits { path, language }                   one anonymous visit row (was supabase.from('site_visits'))
//   GET  /healthz
//
// Env: DATABASE_URL (postgres://…; on Cloud Run the host is the Cloud SQL socket dir /cloudsql/<instance>),
//      ALERTS_IN_UA_API_KEY, MAPBOX_ACCESS_TOKEN, OPENWEATHER_API_KEY, ALLOWED_ORIGINS (comma list, optional).

import postgres from "npm:postgres@3.4.5";

const sql = postgres(Deno.env.get("DATABASE_URL") ?? "", { max: 3, idle_timeout: 20, prepare: false });

const ALLOWED = (Deno.env.get("ALLOWED_ORIGINS") ?? "*").split(",").map((s) => s.trim()).filter(Boolean);

function cors(req: Request): Record<string, string> {
  const origin = req.headers.get("origin") ?? "";
  const allow = ALLOWED.includes("*") ? "*" : ALLOWED.includes(origin) ? origin : ALLOWED[0] ?? "";
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    Vary: "Origin",
  };
}

function json(req: Request, body: unknown, status = 200, extra: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors(req), "Content-Type": "application/json", ...extra },
  });
}

const ALERTS_BASE = "https://api.alerts.in.ua/v1";
const ALERT_ENDPOINTS: Record<string, string> = {
  regions: `${ALERTS_BASE}/regions.json`,
  status: `${ALERTS_BASE}/status.json`,
  alerts: `${ALERTS_BASE}/alerts/active.json`,
  history: `${ALERTS_BASE}/alerts/history.json`,
};

function alertsKey(): string {
  const k = Deno.env.get("ALERTS_IN_UA_API_KEY");
  if (!k) throw new Error("ALERTS_IN_UA_API_KEY not configured");
  return k;
}

function analyzeDataStructure(data: unknown): unknown {
  if (Array.isArray(data)) {
    return { type: "array", length: data.length, sampleItem: data[0] ? analyzeDataStructure(data[0]) : null };
  }
  if (typeof data === "object" && data !== null) {
    const obj = data as Record<string, unknown>;
    const structure: Record<string, unknown> = { type: "object", keys: Object.keys(obj) };
    for (const key of Object.keys(obj).slice(0, 5)) {
      const v = obj[key];
      structure[key] = {
        type: typeof v,
        isArray: Array.isArray(v),
        sampleValue: Array.isArray(v) ? `Array(${v.length})` : typeof v === "string" && v.length > 50 ? v.slice(0, 50) + "..." : v,
      };
    }
    return structure;
  }
  return { type: typeof data, value: data };
}

async function exploreAlertsApi(req: Request): Promise<Response> {
  const body = await req.json().catch(() => ({}));
  const endpoint: string = body?.endpoint ?? "regions";
  const url = ALERT_ENDPOINTS[endpoint] ?? ALERT_ENDPOINTS.regions;
  const res = await fetch(`${url}?token=${alertsKey()}`, {
    headers: { "Content-Type": "application/json", "User-Agent": "SafeRoute-UA/1.0" },
  });
  if (!res.ok) {
    const details = await res.text();
    return json(req, { error: "API request failed", status: res.status, statusText: res.statusText, details, url }, res.status);
  }
  const data = await res.json();
  return json(req, { success: true, endpoint, authMethod: "query-parameter", data, dataStructure: analyzeDataStructure(data) });
}

function mapSeverity(alertType: string): string {
  const t = alertType.toLowerCase();
  if (t.includes("urban_fights") || t.includes("artillery_shelling")) return "high";
  if (t.includes("air_raid")) return "moderate";
  return "low";
}

interface ApiAlert {
  id: number;
  location_title: string;
  started_at: string;
  finished_at?: string | null;
  alert_type: string;
  location_oblast: string;
  location_raion?: string | null;
  location_oblast_uid: number;
}

// Same behaviour as the old sync-alerts-data function: insert new alerts, update end_time when it changed,
// delete alerts that started more than 90 days ago. Done in three set-based statements instead of one
// round trip per alert.
async function syncAlertsData(req: Request): Promise<Response> {
  const res = await fetch(`${ALERTS_BASE}/alerts/active.json?token=${alertsKey()}`);
  if (!res.ok) throw new Error(`API request failed: ${res.status}`);
  const alerts: ApiAlert[] = (await res.json())?.alerts ?? [];

  const rows = alerts.map((a) => ({
    alert_id: String(a.id),
    start_time: a.started_at,
    end_time: a.finished_at ?? null,
    location_name: a.location_title,
    location_oblast: a.location_oblast,
    location_raion: a.location_raion ?? null,
    alert_type: a.alert_type,
    region_id: String(a.location_oblast_uid),
    severity: mapSeverity(a.alert_type),
  }));

  let inserted = 0;
  let updated = 0;
  let deleted = 0;
  await sql.begin(async (tx) => {
    if (rows.length) {
      const incoming = tx.json(rows);
      const ins = await tx`
        insert into alerts (alert_id, start_time, end_time, location_name, location_oblast, location_raion,
                            alert_type, region_id, severity)
        select r.alert_id, r.start_time, r.end_time, r.location_name, r.location_oblast, r.location_raion,
               r.alert_type, r.region_id, r.severity
        from jsonb_to_recordset(${incoming}::jsonb) as r(
          alert_id text, start_time timestamptz, end_time timestamptz, location_name text, location_oblast text,
          location_raion text, alert_type text, region_id text, severity text)
        where not exists (select 1 from alerts a where a.alert_id = r.alert_id)
          -- alerts that started over 90 days ago (permanent ones since 2022) would be deleted below anyway
          and r.start_time >= now() - interval '90 days'`;
      inserted = ins.count;
      const upd = await tx`
        update alerts a set end_time = r.end_time, updated_at = now()
        from jsonb_to_recordset(${incoming}::jsonb) as r(alert_id text, end_time timestamptz)
        where a.alert_id = r.alert_id and a.end_time is distinct from r.end_time`;
      updated = upd.count;
    }
    const del = await tx`delete from alerts where start_time < now() - interval '90 days'`;
    deleted = del.count;
  });

  const result = { success: true, processed: alerts.length, inserted, updated, deleted, timestamp: new Date().toISOString() };
  console.log("sync", JSON.stringify(result));
  return json(req, result);
}

async function listAlerts(req: Request, url: URL): Promise<Response> {
  const sinceParam = url.searchParams.get("since");
  const since = sinceParam && !Number.isNaN(Date.parse(sinceParam)) ? new Date(sinceParam) : new Date(Date.now() - 7 * 864e5);
  const region = url.searchParams.get("region");
  const rows = region && region !== "all"
    ? await sql`select * from alerts where start_time >= ${since} and location_oblast = ${region} order by start_time`
    : await sql`select * from alerts where start_time >= ${since} order by start_time`;
  return json(req, rows, 200, { "Cache-Control": "public, max-age=60" });
}

async function recordVisit(req: Request): Promise<Response> {
  const body = await req.json().catch(() => ({}));
  const path = typeof body?.path === "string" ? body.path.slice(0, 300) : null;
  const language = typeof body?.language === "string" ? body.language.slice(0, 35) : null;
  await sql`insert into site_visits (path, language) values (${path}, ${language})`;
  return json(req, { ok: true }, 201);
}

function keyResponse(req: Request, envName: string, field: string, label: string): Response {
  const v = Deno.env.get(envName);
  if (!v) return json(req, { error: `${label} not configured` }, 500);
  return json(req, { [field]: v });
}

export async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors(req) });
  const url = new URL(req.url);
  try {
    switch (`${req.method} ${url.pathname}`) {
      case "GET /healthz":
        return json(req, { ok: true });
      case "POST /fn/explore-alerts-api":
        return await exploreAlertsApi(req);
      case "POST /fn/get-mapbox-token":
        return keyResponse(req, "MAPBOX_ACCESS_TOKEN", "token", "Mapbox token");
      case "POST /fn/get-weather-key":
        return keyResponse(req, "OPENWEATHER_API_KEY", "key", "OpenWeather API key");
      case "POST /fn/sync-alerts-data":
        return await syncAlertsData(req);
      case "GET /alerts":
        return await listAlerts(req, url);
      case "POST /visits":
        return await recordVisit(req);
      default:
        return json(req, { error: "Not found" }, 404);
    }
  } catch (err) {
    console.error(url.pathname, err);
    return json(req, { error: err instanceof Error ? err.message : "Internal error" }, 500);
  }
}

if (import.meta.main) {
  Deno.serve({ port: Number(Deno.env.get("PORT") ?? 8080) }, handler);
}
