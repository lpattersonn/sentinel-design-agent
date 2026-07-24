# Sentinel REST API

Every MCP tool has a REST mirror. Base URL: `https://YOUR-SITE.netlify.app` (or
`http://localhost:3000` in dev).

**Auth** — every route except `/api/health` requires the shared secret:

```
Authorization: Bearer YOUR_SENTINEL_API_KEY
```

(`x-api-key: YOUR_SENTINEL_API_KEY` also works.) When `SENTINEL_API_KEY` is unset,
requests are allowed only outside production (`next dev`); a production deploy without the
key rejects everything with `401`. Auth failures return `401 {"error": "..."}`; invalid
requests return `400 {"error": "..."}`; internal errors return `500 {"error": "..."}`.
All bodies are JSON.

Request/response shapes follow the engine contract in `PLAN.md` and the Zod schemas in
`src/lib/types.ts` — those files are authoritative.

| Route | Method | Purpose |
|---|---|---|
| `/api/health` | GET | Liveness/status. No auth. |
| `/api/analyze` | POST | Analyze a design → stored memory + `DesignAnalysis`. |
| `/api/patterns` | GET | List/filter reusable design patterns. |
| `/api/memories` | GET | List design memories. |
| `/api/memories/[id]` | GET | Fetch one memory (full analysis). |
| `/api/search` | GET | Semantic (or keyword-fallback) search over memories + insights. |
| `/api/best-practices` | POST | Best-practice bundle for a page type/industry. |
| `/api/prompt` | POST | Rewrite a build prompt with concrete design directives. |
| `/api/design-system` | POST | Generate a full design-system spec. |
| `/api/suggest-layout` | POST | Section-by-section layout suggestion. |
| `/api/score` | POST | Score a design on 11 dimensions. |
| `/api/learn` | POST | Record project feedback; adjust scores; distill insights. |

---

## GET /api/health

No auth. Returns `200` with a JSON status object (service up, DB configured or not).

```bash
curl https://YOUR-SITE.netlify.app/api/health
```

## POST /api/analyze

Body (`AnalyzeInputSchema`):

```json
{
  "sourceType": "url",
  "content": "https://linear.app",
  "title": "Linear homepage",
  "industry": "saas",
  "brand": "Linear",
  "tags": ["dark", "product-led"]
}
```

`sourceType`: `url` | `html` | `screenshot` (base64 PNG/JPEG in `content`) | `figma`
(public link or exported image URL) | `description`. Only `sourceType` and `content` are
required.

```bash
curl -X POST https://YOUR-SITE.netlify.app/api/analyze \
  -H "Authorization: Bearer YOUR_SENTINEL_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"sourceType":"url","content":"https://linear.app","industry":"saas"}'
```

Response: `{ "memoryId": "<uuid>", "analysis": DesignAnalysis }` — summary, style,
brandPersonality, spacing, typography, hierarchy, grid, colors, componentPatterns,
animation, accessibility, responsiveness, traits, lessons. Slow route (one full LLM
analysis): expect 20–60 s on `claude-opus-4-8`.

## GET /api/patterns

Query params (all optional): `category` (hero | pricing | cta | testimonials | navigation |
cards | forms | dashboard | feature-grid | faq | footer | other), `industry`, `query`
(free text), `limit`.

```bash
curl "https://YOUR-SITE.netlify.app/api/patterns?category=hero&industry=saas&limit=5" \
  -H "Authorization: Bearer YOUR_SENTINEL_API_KEY"
```

Response: `{ "patterns": [...] }` — each row has `id`, `slug`, `name`, `category`,
`description`, `whyItWorks`, `strengths[]`, `weaknesses[]`, `idealUseCases[]`,
`industries[]`, `complexity` (1–5), `conversionScore` (0–100, learning-adjusted), `spec`.

## GET /api/memories

Query params: `industry`, `limit` (optional).

```bash
curl "https://YOUR-SITE.netlify.app/api/memories?industry=saas&limit=10" \
  -H "Authorization: Bearer YOUR_SENTINEL_API_KEY"
```

Response: `{ "memories": [...] }` — each row has `id`, `title`, `sourceType`, `sourceRef`,
`industry`, `brand`, `tags[]`, `summary`, `traits[]`, `qualityScore`, `analysis`.

## GET /api/memories/[id]

```bash
curl https://YOUR-SITE.netlify.app/api/memories/MEMORY_UUID \
  -H "Authorization: Bearer YOUR_SENTINEL_API_KEY"
```

Response: `{ "memory": {...} }` — the memory row with the full `DesignAnalysis`;
`404 {"error": "..."}` if not found.

## GET /api/search

Query params: `q` (required, URL-encoded), `industry` (optional), `limit` (optional).
Vector search over memories + insights when `OPENAI_API_KEY` is configured, ILIKE keyword
search otherwise.

```bash
curl "https://YOUR-SITE.netlify.app/api/search?q=dark%20hero%20with%20large%20typography&limit=5" \
  -H "Authorization: Bearer YOUR_SENTINEL_API_KEY"
```

Response: `{ "hits": [...] }` — each hit is a `SearchHit`
(`{ kind: "memory"|"insight", id, title, snippet, score, data }`), highest score first.
Missing `q` returns `400 {"error": "..."}`.

## POST /api/best-practices

Body: `{ "pageType": string, "industry"?: string, "brandPersonality"?: string, "goals"?: string[] }`.

```bash
curl -X POST https://YOUR-SITE.netlify.app/api/best-practices \
  -H "Authorization: Bearer YOUR_SENTINEL_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"pageType":"landing","industry":"fintech","goals":["signups"]}'
```

Response (`BestPracticeBundle`): `hero` + `cta` recommendations (with `patternSlug`),
`typography`, `spacingRules[]`, `grid`, `colorSystem`, `components[]`,
`interactionRules[]`, `accessibilityNotes[]`, `promptEnhancement` (paste-ready directive
block), `sources[]`.

## POST /api/prompt

Body: `{ "prompt": string, "pageType"?: string, "industry"?: string }`.

```bash
curl -X POST https://YOUR-SITE.netlify.app/api/prompt \
  -H "Authorization: Bearer YOUR_SENTINEL_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"build me a pricing page","pageType":"pricing","industry":"saas"}'
```

Response (`PromptEnhancement`): `enhancedPrompt`, `designRules[]`, `inspiration[]`,
`rationale`.

## POST /api/design-system

Body: `{ "brandPersonality": string, "industry": string, "inspiration"?: string[] }`.

```bash
curl -X POST https://YOUR-SITE.netlify.app/api/design-system \
  -H "Authorization: Bearer YOUR_SENTINEL_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"brandPersonality":"premium, calm, technical","industry":"fintech","inspiration":["Stripe"]}'
```

Response (`DesignSystemSpec`): `name`, `colors[]` (token/hex/usage), `typography` (fonts +
scale), `spacing` (baseUnit + scale), `radii[]`, `shadows[]`, `motion`,
`componentGuidelines[]`, `rationale`.

## POST /api/suggest-layout

Body: `{ "pageType": string, "industry": string, "goals"?: string[] }`.

```bash
curl -X POST https://YOUR-SITE.netlify.app/api/suggest-layout \
  -H "Authorization: Bearer YOUR_SENTINEL_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"pageType":"landing","industry":"healthcare","goals":["book a demo"]}'
```

Response (`LayoutSuggestion`): ordered `sections[]` (name, `patternSlug`, description,
rationale), `grid`, `navigation`, `mobileNotes`, `conversionNotes`.

## POST /api/score

Body: `{ "html"?: string, "url"?: string, "description"?: string, "context"?: string, "projectId"?: string }`
— provide at least one of `html` / `url` / `description`.

```bash
curl -X POST https://YOUR-SITE.netlify.app/api/score \
  -H "Authorization: Bearer YOUR_SENTINEL_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://my-draft.netlify.app","context":"SaaS landing page, goal: signups"}'
```

Response: `{ "scoreId": "<uuid>", "breakdown": ScoreBreakdown }` — 11 dimensions
(`visualHierarchy`, `accessibility`, `spacing`, `consistency`, `readability`,
`conversion`, `mobile`, `performance`, `modernDesign`, `animation`, `componentQuality`),
each `{ score: 0-100, reasoning }`, plus `overall` (weighted, not an average), `verdict`,
and ordered `topImprovements[]`. Slow route (LLM scoring pass).

## POST /api/learn

Body (`LearnInputSchema`):

```json
{
  "project": "Acme redesign",
  "outcome": "revision_requested",
  "details": "Client felt the hero was too dense; simplified to one headline + one CTA and they approved.",
  "componentsChanged": ["hero"],
  "patternSlugs": ["hero-split"],
  "memoryIds": [],
  "industry": "logistics"
}
```

`outcome`: `accepted` | `revision_requested` | `converted` | `rejected`. Only `project`
and `outcome` are required.

```bash
curl -X POST https://YOUR-SITE.netlify.app/api/learn \
  -H "Authorization: Bearer YOUR_SENTINEL_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"project":"Acme redesign","outcome":"converted","details":"New hero lifted demo bookings 30%","patternSlugs":["hero-split"]}'
```

Response: `{ "feedbackId": "<uuid>", "insightId": "<uuid>|null", "adjustments": string[] }`
— `insightId` is set when the feedback was substantive enough to distill a reusable
insight; `adjustments` lists the pattern/memory score changes applied.
