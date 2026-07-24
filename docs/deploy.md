# Deploying Sentinel to Netlify

Sentinel is a standard Next.js 15 app. Netlify auto-detects the Next.js runtime via the
`@netlify/plugin-nextjs` plugin declared in `netlify.toml` — no adapter config needed.

## Prerequisites

- A Supabase project with the `vector` extension enabled (SQL editor:
  `create extension if not exists vector;`).
- The Supabase **transaction-pooler** `DATABASE_URL` (port **6543** — see
  [Supabase pooler notes](#supabase-pooler-notes)).
- An Anthropic API key.
- A value for `SENTINEL_API_KEY` (generate one: `openssl rand -hex 32`).

## Option A — Git-connected deploy (Netlify UI)

1. Push the repo to GitHub/GitLab/Bitbucket.
2. Netlify dashboard → **Add new site → Import an existing project** → pick the repo.
3. Build settings are read from `netlify.toml` (`npm run build`, Node 20) — accept the
   defaults. The Next.js runtime is detected automatically.
4. Before the first deploy, open **Site configuration → Environment variables** and set the
   [variables below](#environment-variables-in-netlify).
5. Deploy. Every push to the connected branch redeploys.

## Option B — Netlify CLI

```bash
npm install -g netlify-cli
netlify login
netlify init                      # link to a new or existing site (from the repo root)

# Set env vars (repeat for each; or paste them in the UI)
netlify env:set DATABASE_URL "postgresql://postgres.<ref>:<pw>@aws-0-<region>.pooler.supabase.com:6543/postgres"
netlify env:set ANTHROPIC_API_KEY "sk-ant-..."
netlify env:set SENTINEL_API_KEY "$(openssl rand -hex 32)"
netlify env:set SENTINEL_MODEL "claude-opus-4-8"          # optional
netlify env:set OPENAI_API_KEY "sk-..."                   # optional, enables vector search
netlify env:set SENTINEL_DASHBOARD_PASSWORD "..."         # optional

netlify deploy --build --prod
```

## Environment variables in Netlify

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | yes | Transaction-pooler URL, port 6543. |
| `ANTHROPIC_API_KEY` | yes | |
| `SENTINEL_API_KEY` | yes | Without it the API is **open to the internet**. Always set in production. |
| `SENTINEL_MODEL` | no | Default `claude-opus-4-8`. See [timeouts](#function-timeouts) before keeping the default. |
| `OPENAI_API_KEY` | no | Enables semantic retrieval; keyword fallback otherwise. |
| `SENTINEL_DASHBOARD_PASSWORD` | no | Basic-auth the dashboard (username `sentinel`). |

## Function timeouts

Netlify serverless functions default to a **~10 s synchronous timeout** on the free tier.
Sentinel's LLM-backed tools (`analyze_design`, `score_design`, `retrieve_best_practices`,
`generate_design_system`, …) routinely take **20–60 s** with the default `claude-opus-4-8`
model. Two ways to make this fit:

1. **Raise the function timeout** — available on paid plans / by request. Ask Netlify
   support (or use your plan's function settings) to raise the synchronous function timeout
   for the site; 60–120 s is comfortable for Sentinel.
2. **Use a faster model** — set `SENTINEL_MODEL=claude-sonnet-5` (good quality/latency
   balance) or `SENTINEL_MODEL=claude-haiku-4-5` (fastest). These usually complete within
   default limits.

If tool calls return gateway timeouts or empty responses, this is the first thing to check.

## Supabase pooler notes

- Use the **transaction-mode** pooler connection string (port **6543**), not the direct
  connection (5432). Serverless functions open many short-lived connections; the pooler is
  what keeps Postgres happy.
- Transaction-mode pgbouncer does not support prepared statements. Sentinel's DB client
  already sets `prepare: false` (`src/lib/db/index.ts`) — no action needed, just don't
  swap in a different driver config.

## Migrations and seed against production

Migrations are committed to the repo; run them from your machine pointed at the production
database. Netlify never runs migrations at build time.

```bash
# from the repo root, with the PRODUCTION pooler URL
DATABASE_URL="postgresql://postgres.<ref>:<pw>@...pooler.supabase.com:6543/postgres" npm run db:migrate
DATABASE_URL="postgresql://postgres.<ref>:<pw>@...pooler.supabase.com:6543/postgres" npm run seed
```

Seeding is idempotent for patterns (slug-keyed upserts) and computes embeddings when
`OPENAI_API_KEY` is present in the shell environment.

## Verify

```bash
curl https://YOUR-SITE.netlify.app/api/health

curl "https://YOUR-SITE.netlify.app/api/patterns?category=hero" \
  -H "Authorization: Bearer YOUR_SENTINEL_API_KEY"
```

Then connect Claude Code: [claude-code-integration.md](claude-code-integration.md).
