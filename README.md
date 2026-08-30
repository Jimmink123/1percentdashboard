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

- Table `leads` with columns: `id`, `first_name`, `last_name`, `source`,
  `campaign`, `ad`, `created_at`.
- Realtime enabled on the `leads` table (Database → Replication in the Supabase
  dashboard).
- Row Level Security: the dashboard reads with the **anon/public** key, so make
  sure a `SELECT` policy exists on `leads` for the `anon` role (this should
  already be in place from the website build — if the dashboard loads with no
  rows and no error, check this first).
- Free-tier projects pause after 7 days with no database activity. If the
  dashboard looks stale, check the Supabase project dashboard for a "resume"
  prompt.

## Deploying to Cloudflare Pages (via GitHub)

1. Push this repo to GitHub (see below).
2. In Cloudflare Pages: **Create a project → Connect to Git** → select this repo.
3. Build settings:
   - Framework preset: **Vite**
   - Build command: `npm run build`
   - Build output directory: `dist`
4. Under **Settings → Environment variables**, add for both Production and
   Preview:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Deploy. Cloudflare will auto-redeploy on every push to the connected branch.

No custom domain is required — the default `*.pages.dev` subdomain is enough
for this internal tool.

## Notes

- The anon key is safe to expose in client-side code (it's the public key
  Supabase's own JS client is designed to ship with) as long as Row Level
  Security policies on `leads` only allow the access you intend — never insert
  a `service_role` key into this project.
- CSV export respects whatever filters (date range / campaign) are currently
  applied, and includes the `ad` field even though it isn't shown in the table,
  since that's what's needed to match against Telegram's conversions.
