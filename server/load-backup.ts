// Loads a Supabase `db dump --data-only` file into plain Postgres: runs server/schema.sql, then only the
// `INSERT INTO "public".…` statements (Supabase's auth/storage/etc. rows are skipped), then fixes sequences.
//
//   DATABASE_URL=postgres://… deno run -A server/load-backup.ts <data.sql> [--truncate]

import postgres from "npm:postgres@3.4.5";

const [file, ...flags] = Deno.args;
if (!file) {
  console.error("usage: load-backup.ts <data.sql> [--truncate]");
  Deno.exit(1);
}
const url = Deno.env.get("DATABASE_URL");
if (!url) {
  console.error("DATABASE_URL is not set");
  Deno.exit(1);
}

const sql = postgres(url, { max: 1, onnotice: () => {} });
const schema = await Deno.readTextFile(new URL("./schema.sql", import.meta.url));
const dump = await Deno.readTextFile(file);

// Each INSERT in a pg_dump file starts at the beginning of a line and ends with ");" at the end of a line.
const inserts = [...dump.matchAll(/^INSERT INTO "public"\.[\s\S]*?\);$/gm)].map((m) => m[0]);

await sql.begin(async (tx) => {
  await tx.unsafe(schema);
  if (flags.includes("--truncate")) await tx.unsafe("truncate alerts, site_visits restart identity");
  for (const stmt of inserts) await tx.unsafe(stmt);
  await tx.unsafe(
    "select setval(pg_get_serial_sequence('site_visits','id'), coalesce((select max(id) from site_visits), 0) + 1, false)",
  );
});

const [counts] = await sql`select (select count(*) from alerts)::int as alerts, (select count(*) from site_visits)::int as visits,
  (select max(start_time) from alerts) as latest_alert`;
console.log(`loaded ${inserts.length} insert statements →`, counts);
await sql.end();
