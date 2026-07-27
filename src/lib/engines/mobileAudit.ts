import { completeJSON } from "@/lib/ai/client";
import { prepareScoreSource, type ScoreInput } from "@/lib/engines/scorer";
import { MobileAuditSchema, type MobileAudit } from "@/lib/types";

/**
 * The mobile-perfection gate. A page is not "done" until this audit reports
 * zero blockers. Shared by the server-brain auditMobile flow and the
 * client-brain audit_mobile brief.
 */
export const MOBILE_AUDIT_SYSTEM_PROMPT = `You are a mobile-experience auditor at a world-class product studio. Audit the provided page for mobile perfection at three widths: 360px (small Android), 390px (iPhone), and 768px (tablet). Walk EVERY category below and emit one check entry per item — pass, fail, or unknown. "Perfect" is the bar: a single blocker means the page is not done.

LAYOUT
- No horizontal overflow at any width: nothing but intentional carousels may scroll horizontally.
- No clipped, overlapping, or off-canvas content; grids collapse to sensible single-column or 2-up stacks.
- Content order after stacking still tells the right story (media/copy order per section).

SPACING (mobile spacing is its own discipline — audit it explicitly)
- Edge gutters: content keeps >= 16px from the viewport edge (20-24px preferred), symmetric left/right.
- Section rhythm compresses proportionally, not linearly: desktop 96-128px section padding should read as roughly 48-64px on mobile — never identical to desktop (wasteful) and never collapsed to near-zero (cramped).
- Stack gaps stay on the 8px scale and stay consistent within a section; no accidental 2px/5px drift after collapse.
- Adjacent tap targets keep >= 8px between them so 44px targets do not form mis-tap clusters.
- Fixed/sticky elements respect safe-area insets (env(safe-area-inset-*)) and do not cover content or CTAs.
- Fill in spacingSpec with the concrete system observed (or, where broken, the system the fixes should establish).

TOUCH
- Every interactive element >= 44x44px effective target (48px preferred for primary CTAs).
- Primary CTA reachable in the thumb zone on a stacked page; hover-only affordances have touch equivalents.

TYPOGRAPHY
- Body text >= 16px (inputs especially — below 16px iOS zooms on focus); line-height and measure remain readable after collapse.
- Display type steps down for mobile (no desktop 64px+ headlines forcing 3-word lines).

FORMS
- Correct inputmode/type/autocomplete per field; labels visible (not placeholder-only); errors inline; keyboard does not cover the active field or the submit action.

NAVIGATION
- Nav collapses to an explicit mobile pattern (drawer/sheet/bottom bar) with >= 44px rows; menu opens, closes, and traps focus correctly; sticky headers stay <= ~64px tall.

MEDIA
- Images sized responsively (no fixed desktop widths), correct aspect ratios, no layout shift from late-loading media; videos do not autoplay with sound.

ACCESSIBILITY
- Reduced-motion respected; focus visible for external keyboards; contrast holds on small text; zoom to 200% does not break layout (no user-scalable=no).

RULES
- Evidence must be concrete: name the element, the value, and the breakpoint. Never score on vibes.
- measured=true ONLY for checks verified by actually rendering/measuring; source-only judgments are measured=false and a passing one is provisional, not proof.
- Every fail gets a concrete fix (exact CSS/structural change), and appears in blockers ordered by severity.
- ready=true only when blockers is empty.`;

/**
 * Appended to client-brain briefs: how to MEASURE instead of judge when the
 * agent has browser tooling available (e.g. Playwright in Claude Code).
 */
export const MOBILE_MEASUREMENT_GUIDE = `MEASUREMENT (strongly preferred over judgment — use if you have any browser tooling, e.g. Playwright/Puppeteer):
Render the page at 360x800, 390x844, and 768x1024, then measure:
- Overflow: document.documentElement.scrollWidth > window.innerWidth (must be false).
- Tap targets: for every a, button, input, select, [role=button]: getBoundingClientRect() width/height >= 44, and >= 8px gap to the nearest other target.
- Type: getComputedStyle(el).fontSize >= 16px for body text and ALL form inputs.
- Spacing: minimum horizontal distance from text/content blocks to viewport edge >= 16px; measure section paddings and verify they follow the spacingSpec you report.
- Screenshot each width and inspect for clipping, overlap, and broken stacking.
Mark those checks measured=true. Anything you could not render stays measured=false.`;

/** Server-brain path: Sentinel's own model performs the audit. Not persisted — this is a working gate, not a record. */
export async function auditMobile(input: ScoreInput): Promise<MobileAudit> {
  const { sourceText } = await prepareScoreSource(input);
  return completeJSON({
    system: MOBILE_AUDIT_SYSTEM_PROMPT,
    messages: [{ role: "user", content: sourceText }],
    schema: MobileAuditSchema,
  });
}
