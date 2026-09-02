# T Marz — Leads Dashboard

A single-page dashboard that reads the `leads` table (written by the T Marz landing
page) from Supabase and shows which Meta ads are actually converting into Telegram
joins. Live updates via Supabase Realtime — no refresh needed.

## Stack

- Vite + React + TypeScript
- Tailwind CSS
- Recharts (campaign chart)
- `@supabase/supabase-js` (data fetch + Realtime subscription)

## Local development

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local` and fill in the Supabase project URL and
   anon/public API key (from the website build):

   ```bash
   cp .env.example .env.local
   ```

3. Run the dev server:

   ```bash
   npm run dev
   ```

## Supabase requirements

For a fresh Supabase project, run [`supabase/schema.sql`](supabase/schema.sql)
once in **SQL Editor** — it creates the `leads` table, both RLS policies
(anon read for the dashboard, anon insert for the landing page popup), and
enables Realtime, in one shot.

If the table already exists elsewhere, it just needs:

- Table `leads` with columns: `id`, `first_name`, `last_name`, `source`,
  `campaign`, `ad`, `created_at`.
- Realtime enabled on the `leads` table (Database → Replication in the Supabase
  dashboard).
- Row Level Security: the dashboard reads with the **anon/public** key, so make
  sure a `SELECT` policy exists on `leads` for the `anon` role — if the
  dashboard loads with no rows and no error, check this first.
- Free-tier projects pause after 7 days with no database activity. If the
  dashboard looks stale, check the Supabase project dashboard for a "resume"
  prompt.

## Deploying to Cloudflare (via GitHub)

Depending on how the project is created, Cloudflare either sets this up as a
classic Pages project or (currently the default for new projects) as a
Workers project deploying static assets via `wrangler deploy`. Either way:

1. Push this repo to GitHub (see below).
2. In the Cloudflare dashboard: **Workers & Pages → Create → Connect to Git**
   → select this repo.
3. If it's set up as a Workers project (deploy command `npx wrangler deploy`,
   no separate build command needed — wrangler's Vite integration builds and
   deploys in one step), add the two env vars under **Settings → Builds →
   Variables and secrets** (this is the *build-time* slot; the separate
   "Runtime variables and secrets" card further up is disabled for a
   static-assets-only Worker and isn't the one you want):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. If it's a classic Pages project instead, set build command `npm run build`,
   output directory `dist`, and add the same two vars under
   **Settings → Environment variables** for both Production and Preview.
5. Deploy (or push a commit) to trigger a build. Cloudflare auto-redeploys on
   every push to the connected branch after that.

Because these are `VITE_`-prefixed, Vite inlines them into the built JS at
build time — saving/changing them only takes effect on the *next* build, not
retroactively on an already-deployed bundle.

No custom domain is required — the default `*.pages.dev` / `*.workers.dev`
subdomain is enough for this internal tool.

## Notes

- The anon key is safe to expose in client-side code (it's the public key
  Supabase's own JS client is designed to ship with) as long as Row Level
  Security policies on `leads` only allow the access you intend — never insert
  a `service_role` key into this project.
- CSV export respects whatever filters (date range / campaign) are currently
  applied, and includes the `ad` field even though it isn't shown in the table,
  since that's what's needed to match against Telegram's conversions.
