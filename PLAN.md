# Sentinel — AI Design Intelligence Agent: Build Plan

Sentinel teaches Claude Code to produce exceptional UI by learning from world-class designs,
your own work, and continuous feedback. It is a Next.js application with an integrated MCP
server, deployed on **Netlify**, backed by **Supabase** (Postgres + pgvector + Storage).

## Architecture

```
Claude Code
    │  MCP (streamable HTTP, bearer-token auth)
    ▼
Next.js app (deployed on Netlify)
    ├── /api/[transport]        MCP server (mcp-handler) → endpoint: /api/mcp
    ├── /api/*                  REST mirrors of every engine (analyze, score, search, …)
    ├── / (dashboard)           Browse memories, patterns, scores
    └── src/lib/engines/*       Core intelligence modules
            │
            ▼
Supabase Postgres (pgvector) via Drizzle ORM
```

## Tech stack (final, with deviations from the original sketch)

| Concern         | Choice                                             | Deviation & why |
|-----------------|----------------------------------------------------|-----------------|
| Frontend/API    | Next.js 15 App Router, TypeScript                  | as specced |
| MCP server      | `mcp-handler` route at `/api/mcp` (streamable HTTP, stateless) | SSE transport skipped — it requires Redis, and Netlify has no built-in Redis. Modern MCP clients (incl. Claude Code) use streamable HTTP. |
| Database        | Supabase Postgres + pgvector, Drizzle ORM, Zod     | as specced |
| AI model        | Anthropic Claude — `claude-opus-4-8` default, `SENTINEL_MODEL` env override | Spec said "GPT-5.6 / Claude / Kimi K3 configurable". v1 ships Claude only; the provider abstraction lives in `src/lib/ai/client.ts` so others can be added. |
| Embeddings      | OpenAI `text-embedding-3-small` (1536-d) when `OPENAI_API_KEY` set; keyword (ILIKE) fallback otherwise | Anthropic has no embeddings API. Retrieval degrades gracefully without the key. |
| Cache           | none in v1                                         | Redis dropped — no Netlify-native Redis; Postgres is fast enough at this scale. |
| Auth            | Bearer API key (`SENTINEL_API_KEY`) for MCP + REST; optional HTTP Basic on dashboard (`SENTINEL_DASHBOARD_PASSWORD`) | NextAuth is overkill for a single-agency internal tool; deferred. |
| Background jobs | Synchronous within request lifecycle               | Trigger.dev/Inngest deferred; analysis calls are single LLM requests. |

## Data model (`src/lib/db/schema.ts`)

- `projects` — id, name, industry, status
- `design_memories` — analyzed designs: source_type/ref, industry, brand, tags, `analysis` (jsonb DesignAnalysis), summary, traits, quality_score, `embedding vector(1536)`
- `patterns` — reusable patterns (hero, pricing, cta, …): slug, category, why_it_works, strengths/weaknesses/ideal_use_cases, industries, complexity 1-5, conversion_score 0-100, `spec` jsonb, embedding
- `design_scores` — 11-dimension score breakdown (jsonb), overall 0-100, target description, optional project ref
- `feedback_events` — outcome (accepted / revision_requested / converted / rejected), details jsonb, learned flag
- `insights` — distilled knowledge produced by the learning engine: kind, content, evidence, confidence, embedding

## Engine contract (module signatures — all agents code against these)

All engines live in `src/lib/engines/`. Shared Zod schemas/types live in `src/lib/types.ts`.
AI helpers: `completeJSON({system, messages, schema, maxTokens?})` and `completeText(...)` in
`src/lib/ai/client.ts`. Embeddings: `embed(texts): Promise<number[][] | null>`,
`embedOne(text)` in `src/lib/ai/embeddings.ts` (null = no key configured → callers fall back
to keyword search). DB: `getDb()` from `src/lib/db` (lazy — throws when DATABASE_URL unset).

```ts
// analyzer.ts
analyzeDesign(input: AnalyzeInput): Promise<AnalyzeResult>
//   AnalyzeInput { sourceType: "url"|"html"|"screenshot"|"figma"|"description",
//                  content: string, title?, industry?, tags?: string[] }
//   Fetches URL content when sourceType==="url" (truncate HTML sensibly); screenshot =
//   base64 image sent as an image block; runs Claude → DesignAnalysis; stores a
//   design_memories row (embedding of summary+traits when available); returns { memoryId, analysis }.

// patterns.ts
findPatterns(filters: { category?: string; industry?: string; query?: string; limit?: number }): Promise<PatternRow[]>
upsertPattern(input: NewPattern): Promise<PatternRow>          // used by seeds + learning

// memory.ts
saveMemory(row: NewDesignMemory): Promise<DesignMemoryRow>
listMemories(filters: { industry?: string; limit?: number }): Promise<DesignMemoryRow[]>
getMemory(id: string): Promise<DesignMemoryRow | null>

// retrieval.ts
searchMemory(query: string, opts?: { industry?: string; limit?: number }): Promise<SearchHit[]>
//   Vector search over design_memories + insights when embeddings available; ILIKE fallback.
//   SearchHit { kind: "memory"|"insight", id, title, snippet, score, data }

// bestPractices.ts
retrieveBestPractices(input: { pageType: string; industry?: string; brandPersonality?: string; goals?: string[] }): Promise<BestPracticeBundle>
//   Pulls top patterns per category + relevant memories/insights, then one Claude call to
//   assemble the bundle (hero/cta/typography/spacing/grid/colors/interaction/accessibility
//   recommendations + promptEnhancement) citing sources.

// promptBuilder.ts
improvePrompt(input: { prompt: string; pageType?: string; industry?: string }): Promise<PromptEnhancement>

// designSystem.ts
generateDesignSystem(input: { brandPersonality: string; industry: string; inspiration?: string[] }): Promise<DesignSystemSpec>

// layout.ts
suggestLayout(input: { pageType: string; industry: string; goals?: string[] }): Promise<LayoutSuggestion>

// scorer.ts
scoreDesign(input: { html?: string; url?: string; description?: string; context?: string; projectId?: string }): Promise<ScoreResult>
//   Claude scores 11 dimensions (visualHierarchy, accessibility, spacing, consistency,
//   readability, conversion, mobile, performance, modernDesign, animation,
//   componentQuality) each 0-100 with reasoning; stores design_scores row.

// learning.ts
learn(input: LearnInput): Promise<LearnResult>
//   Records feedback_events; adjusts pattern conversion_score / memory quality_score for
//   referenced items; distills a new `insights` row via Claude when details are substantive.
```

## Surfaces

**MCP tools** (`src/app/api/[transport]/route.ts`, endpoint `/api/mcp`):
`analyze_design`, `find_patterns`, `retrieve_best_practices`, `score_design`,
`improve_prompt`, `learn`, `search_memory`, `suggest_layout`, `generate_design_system`.
Each tool wraps the matching engine; auth = `Authorization: Bearer $SENTINEL_API_KEY`.

**REST routes** (same auth): `/api/health` (open), `/api/analyze`, `/api/patterns`,
`/api/memories`, `/api/search`, `/api/best-practices`, `/api/prompt`, `/api/design-system`,
`/api/suggest-layout`, `/api/score`, `/api/learn`.

**Dashboard** (server components, `force-dynamic`, degrade gracefully when DB unconfigured):
`/` overview · `/memories` + `/memories/[id]` · `/patterns` + `/patterns/[id]` · `/scores`.

**Seeds** (`npm run seed`): 11 curated patterns (hero, pricing, cta, testimonials,
navigation, cards, forms, dashboard, feature-grid, faq, footer) + 3 reference memories
(Apple, Stripe, Linear) + starter insights. Embeddings computed at seed time when key present.

## Build phases

1. **Foundation** (this repo scaffold): configs, schema, types, AI client, auth — done inline.
2. **Modules** — parallel agents: analyzer / patterns+seeds / memory+retrieval /
   prompt-builder+design-system+layout+best-practices / scorer+learning / dashboard / docs.
3. **MCP route** — after engines exist.
4. **Integration** — `drizzle-kit generate` (+ `CREATE EXTENSION vector`), `tsc --noEmit`,
   `next build`, fix errors.

## Deploy plan (documented in README)

1. Supabase: create project → enable `vector` extension → grab pooler `DATABASE_URL`
   (port 6543, transaction mode) → `npm run db:migrate` → `npm run seed`.
2. Netlify: connect repo (or `netlify deploy`) → Next.js runtime auto-detected → set env vars
   (`DATABASE_URL`, `ANTHROPIC_API_KEY`, `SENTINEL_API_KEY`, optional `OPENAI_API_KEY`,
   `SENTINEL_MODEL`, `SENTINEL_DASHBOARD_PASSWORD`).
3. Claude Code: `claude mcp add --transport http sentinel https://<site>.netlify.app/api/mcp --header "Authorization: Bearer <key>"`,
   plus the CLAUDE.md snippet in `docs/claude-code-integration.md` so Claude consults
   Sentinel before building any page.

## Future vision hooks

- The `learn` loop + `insights` table is the "agency design brain" seed: every project's
  feedback compounds. Automatic consultation is delivered via the CLAUDE.md snippet today;
  a Claude Code hook (`PreToolUse` on Write/Edit of UI files) is a documented next step.
