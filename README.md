# Sentinel

**Design memory that compounds.** Sentinel is an AI design-intelligence service that teaches
Claude Code to produce exceptional UI. It analyzes world-class designs, stores what it learns
as searchable memory, scores your output against 11 dimensions, and distills client feedback
into reusable insights — so every project makes the next one better.

Next.js 15 (App Router) + TypeScript + Drizzle ORM + Supabase Postgres (pgvector) +
Anthropic Claude. Exposed to Claude Code as an MCP server over streamable HTTP, plus a REST
API and a browsable dashboard. Deployed on Netlify.

## Architecture

```
Claude Code
    │  MCP (streamable HTTP, bearer-token auth)
    ▼
Next.js app (Netlify)
    ├── /api/mcp                MCP server — 9 design-intelligence tools
    ├── /api/*                  REST mirrors of every engine (analyze, score, search, …)
    ├── / (dashboard)           Browse memories, patterns, scores
    └── src/lib/engines/*       Analyzer · Patterns · Retrieval · Best Practices ·
        │                       Prompt Builder · Design System · Layout · Scorer · Learning
        ▼
Supabase Postgres (pgvector) via Drizzle ORM
    projects · design_memories · patterns · design_scores · feedback_events · insights
```

## The learning loop

1. **Absorb** — `analyze_design` dissects any design (URL, HTML, screenshot, Figma link,
   description) into a structured analysis: spacing system, typography, hierarchy, grid,
   color, component patterns, accessibility. Stored as a `design_memory` with an embedding.
2. **Retrieve** — before building anything, `retrieve_best_practices` and `search_memory`
   pull the most relevant patterns, memories, and insights for the page type and industry.
3. **Direct** — `improve_prompt` rewrites a vague build prompt into concrete design
   directives ("8px grid, 64px section spacing, typography inspired by Linear").
4. **Score** — `score_design` grades the result on 11 dimensions (0–100 each) with
   reasoning and ordered improvements. Iterate until it clears the bar.
5. **Learn** — when a client accepts, requests revisions, converts, or rejects, `learn`
   records the outcome, adjusts pattern conversion scores and memory quality scores, and
   distills a new insight when the feedback carries a reusable lesson.

Insights and adjusted scores feed straight back into step 2. The memory compounds.

## Quickstart

**1. Supabase.** Create a project, then in the SQL editor run:

```sql
create extension if not exists vector;
```

Copy the **transaction-pooler** connection string (Project Settings → Database →
Connection string → "Transaction", port **6543**).

**2. Environment.**

```bash
cp .env.example .env
# fill in DATABASE_URL, ANTHROPIC_API_KEY, SENTINEL_API_KEY (and optionally the rest)
```

**3. Install, migrate, seed.** Migrations are committed — `npm run db:generate` is NOT
needed.

```bash
npm install
npm run db:migrate
npm run seed        # 11 curated patterns + 3 reference memories (Apple, Stripe, Linear) + starter insights
```

**4. Run.**

```bash
npm run dev         # dashboard at http://localhost:3000, MCP at http://localhost:3000/api/mcp
```

**5. Connect Claude Code.** See [docs/claude-code-integration.md](docs/claude-code-integration.md):

```bash
claude mcp add --transport http sentinel http://localhost:3000/api/mcp \
  --header "Authorization: Bearer YOUR_SENTINEL_API_KEY"
```

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | yes | Supabase Postgres, transaction-pooler URL (port 6543). |
| `ANTHROPIC_API_KEY` | no | Enables **server-brain** mode: Sentinel runs analysis, scoring, prompt building and insight distillation itself. Without it, Sentinel runs in **client-brain** mode — the LLM tools return briefs (prepared source + instructions + JSON schema) that the connected agent's own model completes, persisting results via the `save_design_analysis` / `save_design_score` / `save_insight` tools. |
| `SENTINEL_BRAIN` | no | `server` \| `client` \| `auto` (default). `auto` picks server when `ANTHROPIC_API_KEY` is set, client otherwise. |
| `SENTINEL_API_KEY` | production | Shared secret for MCP + REST (`Authorization: Bearer …`). Unset = open access, local dev only. |
| `SENTINEL_MODEL` | no | Model override. Default `claude-opus-4-8`; use `claude-sonnet-5` or `claude-haiku-4-5` for lower latency. |
| `OPENAI_API_KEY` | no | Enables vector (semantic) retrieval via `text-embedding-3-small`. Without it Sentinel falls back to keyword search — everything still works. |
| `SENTINEL_DASHBOARD_PASSWORD` | no | HTTP Basic auth on the dashboard (username `sentinel`). Empty = open dashboard. |

## Docs

| Doc | Contents |
|---|---|
| [docs/claude-code-integration.md](docs/claude-code-integration.md) | Connect Claude Code, the 9 MCP tools, the CLAUDE.md snippet that makes consultation automatic. |
| [docs/api.md](docs/api.md) | REST reference for every route, with curl examples. |
| [docs/deploy.md](docs/deploy.md) | Netlify deploy (UI + CLI), env vars, function timeouts, Supabase pooler, production migrations. |
| [PLAN.md](PLAN.md) | Architecture, data model, and the engine contract. |
