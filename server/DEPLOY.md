# SafeRoute API: deploy to Google Cloud

Replaces Supabase project `qiupznnfixzimxmovuei` (4 Edge Functions plus the `alerts` and `site_visits` tables).
Target: project "Emerge Labs Apps" (`project-c53b682b-4b03-43a3-91e`, AXR's project), region `us-west1`, Cloud SQL
instance `emerge-apps-db` (database `saferoute`, its own login), Cloud Run service `saferoute-api`.

The site stays on Vercel. Its only change is the `VITE_API_URL` env.

## What's in this folder
- `main.ts`: the API. Routes are listed at the top of the file. It runs on Deno.
- `schema.sql`: tables and indexes for plain Postgres.
- `load-backup.ts`: loads a Supabase `db dump --data-only` file (`DATABASE_URL=… deno run -A load-backup.ts data.sql --truncate`).
- `Dockerfile`: the Cloud Run image.

## Tested locally (Nov 8, 2026)
- The backup loaded into Postgres with counts matching Supabase: 34,836 alerts and 53 visits.
- Every route was checked: alerts (all and per region), visits, map and weather keys, the alerts.in.ua proxy, sync (repeat runs make no changes), CORS and 404.
- The built site's Statistics tab rendered from the new API.

## Steps (P = project-c53b682b-4b03-43a3-91e)
1. Make sure the database server is running: `gcloud sql instances patch emerge-apps-db --activation-policy ALWAYS --project P`.
2. Create a database and login: `gcloud sql databases create saferoute --instance emerge-apps-db`, plus user `saferoute_api` with a generated password stored in Secret Manager as `saferoute-database-url`.
3. Create the secrets `saferoute-alerts-key`, `saferoute-mapbox-token` and `saferoute-openweather-key`. Imran enters the values himself:
   `printf %s "<value>" | gcloud secrets create <name> --data-file=-`
4. Create a service account `saferoute-api@P.iam.gserviceaccount.com` with Cloud SQL Client and Secret Accessor on those 4 secrets only. Imran runs the IAM commands.
5. Deploy:
   `gcloud run deploy saferoute-api --source server --region us-west1 --service-account saferoute-api@… --add-cloudsql-instances P:us-west1:emerge-apps-db --set-secrets DATABASE_URL=saferoute-database-url:latest,ALERTS_IN_UA_API_KEY=saferoute-alerts-key:latest,MAPBOX_ACCESS_TOKEN=saferoute-mapbox-token:latest,OPENWEATHER_API_KEY=saferoute-openweather-key:latest --set-env-vars ALLOWED_ORIGINS=https://saferouteua.vercel.app,https://saferouteua.sheikhimran.com --max-instances 1 --allow-unauthenticated --labels app=saferoute`
6. Load the data: take a fresh `supabase db dump --data-only` and run `load-backup.ts --truncate` through the Cloud SQL Auth Proxy.
7. Schedule the hourly sync, matching Supabase's on-the-hour job:
   `gcloud scheduler jobs create http saferoute-sync --schedule "0 * * * *" --uri <url>/fn/sync-alerts-data --http-method POST --location us-west1`.
   This is the 4th scheduler job on the account, which costs about $0.10 a month.
8. Vercel: set `VITE_API_URL=<url>` for Production and Preview, deploy, then check the map, alerts, statistics and sync button.
9. After a week with no problems: turn off Supabase's cron, delete the Supabase project, and replace the alerts.in.ua key. The old key is hard-coded in `supabase/functions/explore-alerts-api` in git history.
