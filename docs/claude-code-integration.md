# Claude Code Integration

This is the doc that makes Sentinel pay off. Connect once, paste one CLAUDE.md snippet,
and Claude Code consults Sentinel automatically on every UI task.

## 1. Connect

One command (user scope — available in every project):

```bash
claude mcp add --transport http sentinel https://YOUR-SITE.netlify.app/api/mcp \
  --header "Authorization: Bearer YOUR_SENTINEL_API_KEY"
```

Or per-project via `.mcp.json` in the repo root (checked in, shared with the team):

```json
{
  "mcpServers": {
    "sentinel": {
      "type": "http",
      "url": "https://YOUR-SITE.netlify.app/api/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_SENTINEL_API_KEY"
      }
    }
  }
}
```

For local development point at `http://localhost:3000/api/mcp` (no header needed when
`SENTINEL_API_KEY` is unset). Verify with `/mcp` inside Claude Code — you should see
`sentinel` connected with 9 tools.

## 2. The tools

| Tool | Inputs | When Claude should call it |
|---|---|---|
| `retrieve_best_practices` | `pageType`, `industry?`, `brandPersonality?`, `goals?` | **Before building any page or UI.** Returns hero/CTA/typography/spacing/grid/color/interaction/accessibility recommendations plus a paste-ready `promptEnhancement` block. |
| `improve_prompt` | `prompt`, `pageType?`, `industry?` | Before executing a vague build prompt — rewrites it into concrete design directives with cited inspiration. |
| `analyze_design` | `sourceType` (url/html/screenshot/figma/description), `content`, `title?`, `industry?`, `brand?`, `tags?` | Whenever the user shares a design they admire or want to reference. Stores it as permanent memory. |
| `score_design` | `html?`, `url?`, `description?`, `context?`, `projectId?` | After completing a page — 11-dimension 0–100 breakdown with ordered improvements. Iterate until the overall score clears the bar. |
| `learn` | `project`, `outcome` (accepted/revision_requested/converted/rejected), `details?`, `patternSlugs?`, `memoryIds?`, `componentsChanged?`, `industry?` | Whenever the user reports how delivered work landed — client feedback, conversion results, rejections. |
| `search_memory` | `query`, `industry?`, `limit?` | To recall specific stored designs or insights ("that dark fintech hero we analyzed"). |
| `find_patterns` | `category?`, `industry?`, `query?`, `limit?` | To pick a proven pattern for one section (hero, pricing, cta, testimonials, navigation, cards, forms, dashboard, feature-grid, faq, footer). |
| `suggest_layout` | `pageType`, `industry`, `goals?` | When starting a page from scratch — ordered sections with pattern slugs and rationale. |
| `generate_design_system` | `brandPersonality`, `industry`, `inspiration?` | At project kickoff — full token spec: colors, type scale, spacing, radii, shadows, motion. |

Note: in **server-brain** mode (`ANTHROPIC_API_KEY` set on the server) the LLM-backed tools
(`analyze_design`, `score_design`, `retrieve_best_practices`, `generate_design_system`,
`suggest_layout`, `improve_prompt`) take 20–60 s on the default model. See
[deploy.md](deploy.md#function-timeouts) if calls time out.

### Client-brain mode (no server API key)

When the server has no `ANTHROPIC_API_KEY` (or `SENTINEL_BRAIN=client`), the six LLM-backed
tools return a **brief** instead of a finished result: prepared source material, expert
instructions, and a JSON schema for the output. The connected agent — the Claude session
you're already in — does the reasoning itself and follows the brief's `then` field. Three
extra tools persist the results, validated against Sentinel's schemas before storage:

| Tool | Persists |
|---|---|
| `save_design_analysis` | A completed `DesignAnalysis` (+ source metadata) as a design memory |
| `save_design_score` | A completed 11-dimension `ScoreBreakdown` |
| `save_insight` | A distilled lesson from a `learn` distillation brief |

Same flywheel, zero server-side LLM cost — quality tracks the connected agent's model.
`find_patterns`, `search_memory`, and `learn`'s bookkeeping behave identically in both modes.

## 3. Make it automatic — CLAUDE.md snippet

Paste this into the `CLAUDE.md` of any project where Claude Code builds UI:

```markdown
## Design intelligence (Sentinel MCP)

This project uses the Sentinel design-intelligence server. Follow this workflow strictly:

1. BEFORE building any page, component, or UI of any kind: call
   `retrieve_best_practices` with the page type, industry, and goals. Apply its
   `promptEnhancement` directives. If the build request is vague, also run it through
   `improve_prompt` first and work from the enhanced prompt.
2. When starting a full page from scratch, call `suggest_layout` and follow the section
   order it returns unless the user overrides it.
3. When the user shares a design they admire (URL, screenshot, Figma link, or
   description): call `analyze_design` to store it, then apply its `lessons` to the
   current work.
4. AFTER completing a page or significant UI change: call `score_design` on the result.
   If the overall score is below 85, apply the `topImprovements` and re-score. Repeat
   until >= 85 or the user says stop. Report the final score and what changed.
5. When the user relays feedback on delivered work (client accepted, asked for
   revisions, converted, rejected): call `learn` with the outcome, details, and the
   pattern slugs / memory IDs that were used.
6. Use `search_memory` and `find_patterns` whenever prior designs or proven section
   patterns would inform a decision. Prefer stored knowledge over generic defaults.
```

Adjust the score threshold (85) to taste. With this snippet in place there is nothing to
remember — the workflow runs itself.

## 4. The flywheel

Every project makes the next one better:

```
analyze great designs ──► memories + patterns
        ▲                        │
        │                        ▼
client feedback ◄── ship ◄── retrieve + build with best practices
        │                        ▲
        ▼                        │
      learn ──► insights + adjusted conversion/quality scores
```

- Analyzing one great reference site pays out on every future build in that industry.
- Scoring forces iteration past "looks fine" toward measurably better output.
- `learn` converts client outcomes into adjusted pattern scores and distilled insights —
  Sentinel stops recommending what gets rejected and doubles down on what converts.
- Retrieval always reflects the latest state, so the next `retrieve_best_practices` call
  already contains everything learned from the last project.

The first week Sentinel is a checklist. By the tenth project it is an opinionated design
brain trained on your wins and your clients' feedback.
