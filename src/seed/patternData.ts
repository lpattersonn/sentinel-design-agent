import type { NewPattern } from "@/lib/db/schema";

/**
 * Curated seed patterns — one per category. conversionScore is a calibrated
 * starting prior (learning adjusts it later): direct-response surfaces (hero,
 * forms, pricing) score high; structural chrome (footer, nav) scores lower.
 */
export const seedPatterns: NewPattern[] = [
  {
    slug: "centered-hero",
    name: "Centered Hero with Single CTA",
    category: "hero",
    description:
      "A vertically generous hero with headline, supporting line, and one primary button, all center-aligned over a calm background. The headline states the outcome the visitor gets, not the product's name, and nothing else competes above the fold.",
    whyItWorks:
      "Center alignment puts the value proposition on the natural first fixation point, and offering exactly one action removes choice paralysis (Hick's law) at the moment attention is highest. The whitespace budget signals confidence: the page is not begging, which raises perceived brand quality before a single word is read.",
    strengths: [
      "Zero ambiguity about the next step — one button, one message",
      "Scales cleanly from 320px to 4K without layout gymnastics",
      "Whitespace-heavy framing reads as premium across industries",
      "Fastest hero variant to build and A/B test copy against",
    ],
    weaknesses: [
      "Wastes the opportunity to show the product itself — weak for visual products without a supporting screenshot section",
      "Center-aligned body text caps how much explanatory copy you can add before readability degrades",
    ],
    idealUseCases: [
      "SaaS landing page with a single sign-up goal",
      "Pre-launch waitlist page",
      "Agency or consultancy homepage leading to a contact CTA",
      "Product announcement page",
    ],
    industries: ["saas", "agency", "fintech"],
    complexity: 2,
    conversionScore: 84,
    spec: {
      containerWidth: "1200px",
      contentMaxWidth: "720px",
      spacingTop: "128px",
      spacingBottom: "96px",
      typography: "display 64/68 -2% tracking, subhead 20/30 at 60% opacity",
      ctaPlacement: "above fold, 24px below subhead",
      cta: "primary button 48px tall, 24px horizontal padding, 8-10px radius",
      background: "solid or <4% luminance gradient — never a busy image behind text",
      mobile: {
        stack: "single column, center-aligned: headline, subhead, CTA — no side art above the fold",
        sectionPaddingPx: 64,
        edgeGutterPx: 24,
        stackGapPx: 16,
        tapTargets: "full-width primary CTA, 48px height, 24px below subhead",
        notes:
          "Display type steps down 64 -> 36-40px with the same -2% tracking; subhead 20 -> 17px. 64px top / 56px bottom padding (~50% of desktop 128/96) keeps the hero airy without pushing the CTA below the fold on 360px screens.",
      },
    },
    source: "seed:curated",
  },
  {
    slug: "three-tier-pricing",
    name: "Three-Tier Pricing with Highlighted Middle",
    category: "pricing",
    description:
      "Three side-by-side plan cards where the recommended middle tier is visually elevated — accent border, subtle scale-up, and a 'Most popular' badge. Feature lists are short and differentiated rather than exhaustive checklists.",
    whyItWorks:
      "Three options trigger anchoring and the compromise effect: the expensive tier makes the middle look reasonable, the cheap tier makes it look complete. The highlight exploits the default effect — most buyers take the visually pre-selected choice, letting you steer average revenue per user without hiding options.",
    strengths: [
      "Compromise effect reliably lifts selection of the target tier",
      "Badge + elevation gives scanners a decision in under 2 seconds",
      "Short differentiated feature lists keep comparison cognitively cheap",
      "Annual/monthly toggle slots in without redesign",
    ],
    weaknesses: [
      "Falls apart with more than ~6 feature rows per card — becomes a comparison-table problem",
      "Poor fit for usage-based or custom pricing where tiers are artificial",
      "Middle-tier steering can feel manipulative to sophisticated technical buyers",
    ],
    idealUseCases: [
      "Self-serve SaaS with good/better/best plans",
      "Membership or subscription products",
      "Hosting and infrastructure tiers",
    ],
    industries: ["saas", "fintech", "ecommerce", "hospitality"],
    complexity: 3,
    conversionScore: 82,
    spec: {
      containerWidth: "1140px",
      grid: "3-col, 24px gap; middle card scale(1.05) with 2px accent border",
      cardPadding: "32px",
      typography: "price 48/48 700, plan name 18/24 600, features 15/24",
      badge: "'Most popular' pill, top -12px centered",
      ctaPlacement: "one full-width button per card, 16px above feature list",
      mobile: {
        stack: "stack vertically, highlighted tier first — the scale(1.05) elevation is dropped, the accent border and badge carry the emphasis",
        sectionPaddingPx: 48,
        edgeGutterPx: 20,
        stackGapPx: 16,
        tapTargets: "full-width CTA per card, 48px height; whole card header tappable to expand collapsed feature lists",
        notes:
          "Card padding compresses 32 -> 24px; price 48 -> 36px. Alternative for 4+ tiers: horizontal snap-scroll cards at 85vw width with 16px gap and visible next-card peek.",
      },
    },
    source: "seed:curated",
  },
  {
    slug: "full-width-cta-band",
    name: "Full-Width CTA Band",
    category: "cta",
    description:
      "A high-contrast horizontal band placed between content sections and again before the footer: one-line headline, optional reassurance microcopy, and a single button. Background inverts or uses the brand accent so it breaks the page rhythm.",
    whyItWorks:
      "The abrupt contrast change is a pattern interrupt — the eye cannot scroll past it on autopilot. Placing it after value has been demonstrated (post-features, post-testimonials) times the ask to the moment of highest belief, and the reassurance line ('free, no card required') pre-empts the dominant objection at click time.",
    strengths: [
      "Catches scrollers who skipped the hero CTA",
      "Trivial to reuse at multiple scroll depths",
      "Contrast inversion doubles as visual pacing between long sections",
    ],
    weaknesses: [
      "Repeated more than twice it reads as desperate and trains banner blindness",
      "A weak headline makes the band pure noise — it lives or dies on copy",
    ],
    idealUseCases: [
      "Long-scroll marketing pages, placed after proof sections",
      "Blog posts and docs pages funneling to sign-up",
      "Pre-footer final ask on any landing page",
    ],
    industries: ["saas", "agency", "ecommerce", "tourism", "hospitality"],
    complexity: 1,
    conversionScore: 76,
    spec: {
      containerWidth: "100% band, inner content 800px centered",
      spacingTop: "80px",
      spacingBottom: "80px",
      typography: "headline 36/44 -1%, microcopy 14/20 at 70% opacity below button",
      ctaPlacement: "single button centered, 32px below headline",
      background: "inverted (dark on light site) or brand accent, AA contrast against button",
      mobile: {
        stack: "single column, centered: headline, button, microcopy",
        sectionPaddingPx: 48,
        edgeGutterPx: 20,
        stackGapPx: 24,
        tapTargets: "full-width CTA, 48px height — the band is effectively one giant tap region, so nothing else interactive inside it",
        notes:
          "Headline steps 36 -> 26px; 48px vertical padding (60% of desktop 80px) keeps the band punchy — a CTA band that fills the whole mobile viewport stops reading as an interrupt and starts reading as a wall.",
      },
    },
    source: "seed:curated",
  },
  {
    slug: "spotlight-testimonial",
    name: "Spotlight Testimonial with Logo Strip",
    category: "testimonials",
    description:
      "One large, specific customer quote with photo, name, role, and company, set above a single row of grayscale customer logos. The quote states a measurable result rather than generic praise.",
    whyItWorks:
      "A face plus full attribution makes the claim verifiable, which is what converts skeptics — anonymous praise is discounted to zero. One spotlight quote gets read; a carousel of six gets skipped. The grayscale logo row transfers institutional trust without stealing chroma from the page's CTAs.",
    strengths: [
      "Full attribution (photo, name, role, company) maximizes credibility",
      "Specific numbers in the quote do double duty as a benefits claim",
      "Grayscale logos add authority without visual noise",
      "No carousel JS — static, fast, accessible",
    ],
    weaknesses: [
      "Requires a genuinely strong quote and permission to use identity — content-bottlenecked",
      "A single voice cannot cover multiple buyer personas",
    ],
    idealUseCases: [
      "B2B SaaS with one flagship customer story",
      "Agency portfolios leading with a marquee client",
      "Fintech products where trust is the primary objection",
      "Healthcare services needing named practitioner endorsements",
    ],
    industries: ["saas", "agency", "fintech", "healthcare"],
    complexity: 2,
    conversionScore: 73,
    spec: {
      containerWidth: "960px",
      spacingTop: "96px",
      quoteTypography: "28/40 400, quotation marks as 96px decorative glyph at 8% opacity",
      attribution: "48px round avatar, name 16/24 600, role 14/20 at 60% opacity",
      logoStrip: "5-7 logos, 32px tall, grayscale 40% opacity, 48px gap, 64px below quote",
      mobile: {
        stack: "single column: quote first, attribution row below, logo strip last",
        sectionPaddingPx: 56,
        edgeGutterPx: 20,
        stackGapPx: 24,
        tapTargets: "non-interactive section — if the quote links to a case study, make the whole quote block the target, min 48px tall",
        notes:
          "Quote steps 28/40 -> 21/32; avatar stays 48px with name/role inline beside it. Logo strip wraps to two rows of 3 at 24px logo height, 24px gaps, 40px below the quote — never horizontal-scroll a trust signal.",
      },
    },
    source: "seed:curated",
  },
  {
    slug: "sticky-slim-nav",
    name: "Sticky Slim Navigation",
    category: "navigation",
    description:
      "A 64px header that sticks on scroll, shrinking to 56px with a backdrop blur and hairline border once the page moves. Logo left, 4-5 text links center or right, one visually distinct CTA button at the far right.",
    whyItWorks:
      "Keeping the primary CTA persistently reachable removes the cost of deciding late — the moment of conviction can happen at any scroll depth. The shrink-on-scroll transition preserves content real estate while the blur maintains legibility over any section, and capping links at five keeps the F-pattern scan under one second.",
    strengths: [
      "CTA is one click away at every scroll position",
      "Blur + hairline reads as modern with near-zero performance cost",
      "Five-link cap forces information architecture discipline",
    ],
    weaknesses: [
      "Sticky chrome permanently taxes small laptop viewports",
      "Does not scale to deep IA — needs a mega-menu or sidebar beyond ~6 destinations",
    ],
    idealUseCases: [
      "Marketing sites with a single conversion goal",
      "SaaS product sites with shallow IA",
      "Portfolio and agency sites",
    ],
    industries: ["saas", "agency", "fintech", "real-estate"],
    complexity: 2,
    conversionScore: 64,
    spec: {
      height: "64px at top, 56px scrolled, 200ms ease transition",
      containerWidth: "1280px",
      background: "rgba(bg, 0.8) + backdrop-blur(12px), 1px bottom hairline at 8% opacity",
      links: "max 5, 15/20 500, 32px gap",
      ctaPlacement: "far right, filled button 40px tall — the only filled element in the bar",
      mobile: {
        stack: "collapse to sheet menu below 768px: 56px fixed bar with logo left, CTA + hamburger right; links move into a full-height drawer",
        sectionPaddingPx: 12,
        edgeGutterPx: 16,
        stackGapPx: 8,
        tapTargets: "44x44px hamburger, drawer link rows 48px tall full-width, compact 40px CTA stays visible outside the sheet",
        notes:
          "sectionPaddingPx is the bar's vertical padding (12px inside the 56px bar); the drawer itself gets 24px inner padding with 8px gaps between 48px rows. The persistent CTA in the bar — not buried in the drawer — is the whole point of the pattern on mobile.",
      },
    },
    source: "seed:curated",
  },
  {
    slug: "bordered-hover-cards",
    name: "Bordered Cards with Hover Lift",
    category: "cards",
    description:
      "Content cards defined by a 1px border and generous padding instead of drop shadows, arranged in a uniform grid. On hover the card lifts 2-4px, the border sharpens, and an arrow affordance appears — signaling the whole card is clickable.",
    whyItWorks:
      "Borders define the tap target with less visual weight than shadows, so a grid of ten cards still reads as calm — shadow grids compound into muddiness. The hover lift plus arrow resolves the classic 'is this clickable?' ambiguity, and making the entire card the link obeys Fitts's law instead of hiding a small 'Read more' target.",
    strengths: [
      "Stays visually quiet at high card counts where shadows turn muddy",
      "Whole-card click target maximizes clickthrough per Fitts's law",
      "Identical card anatomy makes grids scannable at a glance",
      "Works in dark mode without shadow-on-dark hacks",
    ],
    weaknesses: [
      "Hover affordances are invisible on touch devices — the arrow must be visible by default on mobile",
      "Uniform anatomy demands uniform content; one long title breaks the grid's rhythm",
    ],
    idealUseCases: [
      "Blog and resource indexes",
      "Feature or integration galleries",
      "Property or product listing grids",
    ],
    industries: ["saas", "real-estate", "ecommerce", "agency", "tourism"],
    complexity: 2,
    conversionScore: 67,
    spec: {
      grid: "3-col desktop / 2-col tablet / 1-col mobile, 24px gap",
      cardPadding: "24px",
      border: "1px at 10% opacity, hover 20% opacity + translateY(-3px), 150ms ease-out",
      radius: "12px",
      typography: "card title 18/26 600, body 15/24 at 70% opacity, max 3 lines clamped",
      media: "16:9 image top with matching 12px top radius, or 40px icon",
      mobile: {
        stack: "single column, full-width cards, image above copy inside each card",
        sectionPaddingPx: 48,
        edgeGutterPx: 20,
        stackGapPx: 16,
        tapTargets: "entire card is the tap target (min 88px tall); the hover arrow affordance is rendered visible by default since touch has no hover",
        notes:
          "Card padding compresses 24 -> 20px, gap 24 -> 16px. Cap the visible list at 6 cards with a 'View all' link — an unbounded single-column card stack is the top cause of 10,000px-tall mobile pages.",
      },
    },
    source: "seed:curated",
  },
  {
    slug: "single-column-progressive-form",
    name: "Single-Column Progressive Form",
    category: "forms",
    description:
      "A single-column form that asks for the minimum viable fields (often just email) up front and defers everything else to a second step or post-signup. Labels sit above inputs, validation is inline on blur, and the submit button states the outcome ('Start free trial'), not 'Submit'.",
    whyItWorks:
      "Every removed field measurably lifts completion — commitment escalates, so asking for the cheap thing first and the expensive details after the user is invested inverts the abandonment curve. Single-column layouts eliminate the Z-pattern eye travel of multi-column forms, and inline on-blur validation fixes errors at the moment of typing instead of punishing users at submit.",
    strengths: [
      "Field minimization is the single most reliable conversion lever in UI design",
      "Single column is fastest to complete and natively mobile-correct",
      "Outcome-labeled buttons lift clicks over generic 'Submit'",
      "Inline validation cuts error-recovery abandonment",
    ],
    weaknesses: [
      "Deferred fields shift friction downstream — onboarding must actually collect them or data quality suffers",
      "Ill-suited to forms that are legally long (KYC, medical intake) without a stepper",
    ],
    idealUseCases: [
      "Sign-up and trial-start flows",
      "Lead capture on landing pages",
      "Booking and enquiry forms",
      "Newsletter and waitlist capture",
    ],
    industries: ["saas", "fintech", "healthcare", "hospitality", "real-estate"],
    complexity: 3,
    conversionScore: 86,
    spec: {
      formWidth: "400px",
      layout: "single column, labels above inputs, 20px between fields",
      inputs: "48px tall, 12px radius, 16px font to prevent iOS zoom",
      validation: "inline on blur, error 13/18 below field in semantic red + icon",
      ctaPlacement: "full-width primary button, 24px below last field, outcome-worded",
      microcopy: "trust line ('No credit card required') 13/18 centered below button",
      mobile: {
        stack: "already single column — form goes full-width (100% minus gutters) instead of 400px",
        sectionPaddingPx: 48,
        edgeGutterPx: 24,
        stackGapPx: 20,
        tapTargets: "48px inputs and full-width 48px submit; 16px input font-size is non-negotiable to prevent iOS auto-zoom",
        notes:
          "20px field gaps are kept, not compressed — cramped fields raise mis-taps and error rates more than they save scroll. Use correct inputmode/autocomplete attributes; on-screen keyboard choice is part of the form's mobile design.",
      },
    },
    source: "seed:curated",
  },
  {
    slug: "kpi-grid-dashboard",
    name: "KPI Grid Dashboard",
    category: "dashboard",
    description:
      "A dashboard opening with a row of 4 stat tiles (value, label, delta vs. previous period), followed by one dominant time-series chart and a two-column band of secondary modules on a 12-column grid. Density is high but every number has one job.",
    whyItWorks:
      "The tile row answers 'am I okay?' in the first second — value hierarchy (32px number, 13px label) means the eye reads figures before words. One deliberately dominant chart establishes an entry point, preventing the pinball scanning that equal-weight dashboard grids cause. Deltas with direction and color encode trend without forcing chart-reading.",
    strengths: [
      "Glanceable health check in under 2 seconds",
      "Clear visual entry point prevents scan fatigue",
      "12-column grid lets modules reflow without redesign",
      "Delta chips communicate trend even to non-analytical users",
    ],
    weaknesses: [
      "Encourages metric sprawl — every stakeholder wants a fifth tile, and six tiles kill the glanceability",
      "High density punishes weak spacing discipline; 4px drift compounds into visual noise",
      "Needs real data hierarchy decisions up front — defaults to vanity metrics if unowned",
    ],
    idealUseCases: [
      "SaaS analytics and admin panels",
      "Fintech account and portfolio overviews",
      "Operations monitoring screens",
    ],
    industries: ["saas", "fintech", "healthcare", "ecommerce"],
    complexity: 4,
    conversionScore: 60,
    spec: {
      grid: "12-col, 24px gap, 1440px container, 24px page padding",
      statTiles: "4-up (3 cols each), value 32/36 600 tabular-nums, label 13/16 at 60% opacity, delta chip 12/16 with arrow",
      primaryChart: "8 cols wide, 320px tall; secondary modules 4 cols",
      cardChrome: "1px border at 8% opacity, 12px radius, 20px padding — no shadows at this density",
      spacing: "strict 8px system; section gaps 32px",
      mobile: {
        stack: "stat tiles collapse 4-up -> 2x2 grid (never 1-col — the glanceable row is the pattern's job), then full-width primary chart, then secondary modules stacked",
        sectionPaddingPx: 16,
        edgeGutterPx: 16,
        stackGapPx: 12,
        tapTargets: "each tile is a 44px+ tap target drilling into its metric; chart range toggles as 40px segmented control",
        notes:
          "Page padding compresses 24 -> 16px and section gaps 32 -> 24px; tile values step 32 -> 24px. Primary chart drops to 240px tall with thinned axis labels. Tables inside cards get their own overflow-x scroll containers — the page itself must never scroll horizontally.",
      },
    },
    source: "seed:curated",
  },
  {
    slug: "three-col-feature-grid",
    name: "Three-Column Feature Grid",
    category: "feature-grid",
    description:
      "Six features in a 3x2 grid, each cell an icon, a 3-5 word bold title, and two lines of body copy. A section headline above frames the grid around a single theme rather than a feature dump.",
    whyItWorks:
      "Three columns matches the eye's comfortable horizontal span at desktop widths, and the icon-title-body anatomy creates a fixed scan template — after the first cell, the reader parses the rest in title-only mode, so six features cost about eight seconds of attention. Capping body copy at two lines forces benefit-first editing.",
    strengths: [
      "Fixed cell anatomy makes six features scannable in seconds",
      "Icons give pre-verbal category hints that speed comprehension",
      "Degrades gracefully: 3-col to 2-col to 1-col needs no redesign",
    ],
    weaknesses: [
      "Uniform weight implies all features matter equally — wrong when one capability is the actual differentiator",
      "Generic icon sets make the whole product feel templated",
    ],
    idealUseCases: [
      "SaaS capability overview sections",
      "Service menus for agencies and hospitality",
      "Benefit summaries on product detail pages",
    ],
    industries: ["saas", "agency", "hospitality", "tourism", "ecommerce"],
    complexity: 2,
    conversionScore: 71,
    spec: {
      containerWidth: "1140px",
      grid: "3-col, 32px column gap, 48px row gap",
      spacingTop: "96px",
      cellAnatomy: "40px icon in 48px rounded container, 16px below: title 18/26 600, 8px below: body 15/24 at 70% opacity, max 2 lines",
      sectionHeader: "headline 40/48 -1% centered, max 640px, 64px above grid",
      mobile: {
        stack: "single column of six cells, icon left of title (icon-inline anatomy) to halve each cell's height versus stacked-icon",
        sectionPaddingPx: 48,
        edgeGutterPx: 20,
        stackGapPx: 32,
        tapTargets: "cells are usually non-interactive; if linked, whole cell is the target, min 48px tall",
        notes:
          "Section header steps 40 -> 28px with 40px above the grid; row gap compresses 48 -> 32px. Six stacked cells at full desktop anatomy cost ~2.5 viewports of scroll — the inline-icon variant plus tighter gaps brings it under 1.5.",
      },
    },
    source: "seed:curated",
  },
  {
    slug: "accordion-faq",
    name: "Accordion FAQ",
    category: "faq",
    description:
      "A single-column list of 6-10 questions that expand in place, first question open by default, using real customer language for the questions. Chevron rotation and a 200ms height ease signal state.",
    whyItWorks:
      "FAQ visitors arrive with one specific objection; a scannable question list is a self-service index that gets them to their answer in two fixations. Collapsing answers keeps 10 objections handled in one viewport of vertical space. Opening the first item teaches the interaction and lets you place the highest-value objection rebuttal where everyone reads it.",
    strengths: [
      "Handles many objections in minimal vertical space",
      "Question-as-headline structure matches how users actually search",
      "Native details/summary version is accessible with zero JS",
      "FAQ schema markup earns rich results in search",
    ],
    weaknesses: [
      "Hidden content is unread content — critical persuasion must not live only inside collapsed answers",
      "Becomes a dumping ground for product complexity that should have been designed away",
    ],
    idealUseCases: [
      "Pricing page objection handling",
      "Booking policies for hospitality and tourism",
      "Compliance and security questions for fintech and healthcare",
    ],
    industries: ["saas", "hospitality", "tourism", "fintech", "healthcare", "ecommerce"],
    complexity: 1,
    conversionScore: 66,
    spec: {
      containerWidth: "760px",
      rowAnatomy: "question 17/26 600, 20px vertical padding, chevron right rotating 180deg",
      answer: "15/26 at 75% opacity, 16px bottom padding, max ~120 words",
      divider: "1px hairline at 8% opacity between rows",
      motion: "200ms ease height + chevron; first item open by default",
      spacingTop: "96px",
      mobile: {
        stack: "already single column — list goes full-width minus gutters",
        sectionPaddingPx: 48,
        edgeGutterPx: 20,
        stackGapPx: 0,
        tapTargets: "entire question row is the tap target (min 48px tall via 16px vertical padding), never just the chevron; 8px inset so text never touches the gutter edge",
        notes:
          "Rows are separated by the 1px hairline, not gaps (stackGapPx 0 is intentional). Question type steps 17 -> 16px; section padding compresses 96 -> 48px. Keep only the first item open — auto-expanding all answers on mobile buries questions 4-10 below the fold.",
      },
    },
    source: "seed:curated",
  },
  {
    slug: "mega-footer",
    name: "Mega Footer with Sitemap Columns",
    category: "footer",
    description:
      "A four-to-five column footer: brand block with one-line mission and social icons on the left, then grouped link columns (Product, Company, Resources, Legal), closed by a hairline-separated bottom bar with copyright and locale switcher. Often the last chance to catch an undecided visitor.",
    whyItWorks:
      "Users who reach the footer are either lost or diligent — both groups are looking for a specific link, so an exhaustive grouped sitemap converts dead ends into continued sessions. Group labels let the eye binary-search columns instead of reading every link, and burying legal links here keeps them findable without polluting primary navigation.",
    strengths: [
      "Recovers dead-end sessions with a full sitemap",
      "Grouped columns make 25+ links scannable",
      "Natural home for trust signals: certifications, badges, locale",
    ],
    weaknesses: [
      "Easily becomes a link graveyard nobody audits — dead links here erode trust silently",
      "Heavy footers on short pages can outweigh the page content itself",
    ],
    idealUseCases: [
      "Multi-product SaaS sites with deep IA",
      "E-commerce sites surfacing policy and support links",
      "Hotel and tourism sites with locations, policies, and language switching",
    ],
    industries: ["saas", "ecommerce", "hospitality", "tourism", "fintech"],
    complexity: 2,
    conversionScore: 56,
    spec: {
      containerWidth: "1280px",
      grid: "brand block 4 cols + 4 link columns of 2 cols each, 32px gap",
      spacingTop: "80px",
      spacingBottom: "40px",
      typography: "column label 13/16 600 uppercase 4% tracking at 50% opacity, links 15/32 at 70% opacity",
      bottomBar: "1px hairline above, 24px padding, copyright 13/16 left, locale + social right",
      background: "one step darker than page background to signal terminal section",
      mobile: {
        stack: "brand block first, then each link column collapses into an accordion group (label + chevron); bottom bar stacks copyright under locale/social",
        sectionPaddingPx: 48,
        edgeGutterPx: 20,
        stackGapPx: 24,
        tapTargets: "48px accordion group headers, expanded link rows 44px tall full-width, social icons 44x44px",
        notes:
          "Section padding compresses 80 -> 48px top and 40 -> 24px bottom. Four open columns stacked would run ~1,500px tall, so accordions are the honest default; with 12 or fewer total links, skip accordions and use a plain 2-column link grid with 32px row height.",
      },
    },
    source: "seed:curated",
  },
  {
    slug: "sticky-mobile-cta-bar",
    name: "Sticky Mobile CTA Bar",
    category: "cta",
    description:
      "A bottom-fixed conversion bar that appears on mobile once the visitor scrolls past the hero: 48-56px tall, safe-area aware, holding exactly one primary action with optional one-line context (price, availability) beside it. Hidden on desktop, where inline CTAs and the sticky nav already cover reachability.",
    whyItWorks:
      "On mobile the moment of conviction can arrive at any scroll depth, but every inline CTA is gone two swipes later — the sticky bar keeps the conversion action inside the thumb zone at all times without interrupting reading. Deferring its appearance until the hero scrolls out avoids doubling the hero CTA and times the persistent ask to a demonstrated intent signal: the user chose to keep going.",
    strengths: [
      "Conversion is one thumb-tap away at every scroll depth — no scroll-back to act",
      "Scroll-triggered reveal reads as helpful, not pushy, because it never stacks with the hero CTA",
      "Context text (price, 'free trial') answers the pre-click question at the moment of tap",
      "Bolts onto any long-scroll page without redesigning sections",
    ],
    weaknesses: [
      "Permanently taxes 48-56px of an already small viewport — content and footer links can hide behind it",
      "Sits in the browser's bottom gesture zone, inviting accidental taps without safe-area insets",
      "Stacks badly with other bottom chrome (cookie banners, chat widgets, open keyboards) — it must yield or hide",
      "A weak or generic label ('Learn more') wastes the most valuable persistent pixels on the page",
    ],
    idealUseCases: [
      "Long-scroll SaaS and product landing pages with one sign-up goal",
      "E-commerce product pages (persistent add-to-cart with price)",
      "Booking and reservation pages for hotels, tours, and clinics",
      "Event and webinar registration pages",
    ],
    industries: ["saas", "ecommerce", "hospitality", "tourism", "healthcare"],
    complexity: 2,
    conversionScore: 80,
    spec: {
      desktop: "hidden at ≥768px — inline CTAs and the sticky nav CTA cover desktop reachability",
      trigger: "reveals after the hero CTA leaves the viewport (IntersectionObserver), 200ms slide-up ease-out",
      barHeight: "48-56px content height + env(safe-area-inset-bottom) padding",
      layout: "context text left (optional, one line), primary button right; or a single full-width button",
      cta: "filled primary button, outcome-worded, min 48px tall",
      background: "page background at 95% opacity + backdrop-blur(8px), 1px top hairline at 8% opacity",
      mobile: {
        stack: "single fixed row: optional context text (price/reassurance) left, primary CTA right — never more than one filled action",
        sectionPaddingPx: 8,
        edgeGutterPx: 16,
        stackGapPx: 12,
        tapTargets:
          "CTA min 48px tall and min 50% of bar width; nothing else interactive in the bar, so mis-taps have only one outcome",
        notes:
          "sectionPaddingPx is the bar's internal vertical padding around the 48px button. Pad the bottom with env(safe-area-inset-bottom) so the button clears the iOS home indicator. Hide the bar while the keyboard is open or a bottom sheet is up, and give the page matching bottom padding so the bar never covers the final section or footer links.",
      },
    },
    source: "seed:curated",
  },
  {
    slug: "bottom-sheet-lead-form",
    name: "Bottom-Sheet Lead Form",
    category: "forms",
    description:
      "The page CTA opens a bottom sheet containing a 1-3 field form (often just name and email or phone) instead of navigating to a separate form page. The page stays visible, dimmed, behind the sheet; further fields are progressively disclosed in a second step only after the first commit. On desktop the same form renders as a centered modal or inline section.",
    whyItWorks:
      "Navigating to a form page is a context reset — the persuading content disappears, a page load is paid, and the back button becomes the easiest tap on screen. A bottom sheet keeps the page (and the reason to convert) visible behind the scrim, places fields and submit directly in the thumb zone, and its 1-3 field first step exploits commitment escalation: once the cheap answer is given, finishing step two is psychologically cheaper than abandoning it.",
    strengths: [
      "Zero navigation cost — context and scroll position survive the entire conversion",
      "Fields and submit sit thumb-native at the bottom, exactly where the keyboard leaves room",
      "Progressive disclosure converts a scary 8-field ask into a trivial 2-field one",
      "Drag-to-dismiss feels native, so trying the form is low-commitment",
    ],
    weaknesses: [
      "Demands real focus management — focus trap, aria-modal, focus return on close — or it is an accessibility failure",
      "Open keyboard plus sheet can exceed small viewports; the sheet must resize instead of hiding its own submit button",
      "iOS Safari's dynamic toolbar and viewport units make naive height math break — needs dvh/VisualViewport handling",
      "Form exists only behind an interaction — no scannable fallback for crawlers or users who block scripts",
    ],
    idealUseCases: [
      "Lead capture on service and agency landing pages",
      "Quote, viewing, or consultation requests in real estate and healthcare",
      "Waitlist and early-access sign-ups",
      "Callback-request flows where a phone number is the only real requirement",
    ],
    industries: ["saas", "agency", "real-estate", "healthcare", "fintech"],
    complexity: 3,
    conversionScore: 78,
    spec: {
      desktop: "≥768px renders as a 480px centered modal or an inline form section — sheets are a mobile gesture idiom",
      sheet: "max 85dvh tall, 16-20px top radius, 32px drag handle centered, scrim at 40% black",
      fieldsStepOne: "1-3 fields max, labels above inputs, 48px input height, 16px font",
      progression: "step two slides in within the same sheet after step-one submit; progress shown as '1 of 2'",
      ctaPlacement: "full-width submit pinned inside the sheet bottom, outcome-worded",
      motion: "sheet slides up 250ms ease-out; drag-to-dismiss with velocity threshold",
      mobile: {
        stack: "sheet anatomy top-down: drag handle, one-line headline, 1-3 fields, full-width submit, one-line trust microcopy",
        sectionPaddingPx: 24,
        edgeGutterPx: 20,
        stackGapPx: 16,
        tapTargets:
          "48px inputs, full-width 48px submit, 44x44px close target; drag handle zone min 24px tall across the sheet's full width",
        notes:
          "16px input font is non-negotiable (iOS zoom inside a sheet is disorienting). Track the keyboard with VisualViewport and keep the submit button visible above it. Trap focus while open, return focus to the triggering CTA on close, and respect prefers-reduced-motion by fading instead of sliding.",
      },
    },
    source: "seed:curated",
  },
  {
    slug: "thumb-zone-pricing-select",
    name: "Thumb-Zone Pricing Selector",
    category: "pricing",
    description:
      "Mobile pricing rendered as stacked selectable cards rather than three competing buttons: the recommended tier arrives pre-selected (accent border, badge, radio state), each card shows price plus its top 3 differentiators with the full feature list behind an expander, and a sticky bottom bar mirrors the current selection with one continue CTA.",
    whyItWorks:
      "Desktop pricing is compared side by side in one glance; on mobile the same three tiers are compared from memory across two or three viewports of scroll, which amplifies choice paralysis. Pre-selecting the recommended tier exploits the default effect so browsing collapses into a single accept-or-adjust decision, and the sticky selection bar keeps price and action visible during comparison — the user can read tier three while the buy button for tier two stays one tap away.",
    strengths: [
      "Default effect steers tier choice even harder on mobile than desktop, without hiding alternatives",
      "One continue CTA replaces three competing per-card buttons — no intent splitting",
      "Sticky selection bar means comparison scroll never strands the user away from the action",
      "Expanders keep three full tiers inside ~1.5 viewports instead of 4+",
    ],
    weaknesses: [
      "Select-then-continue costs one extra tap versus direct per-card CTAs — a bad trade for single-tier or impulse products",
      "Collapsed feature lists hide differentiators; the 3 visible bullets per card must genuinely separate the tiers or the choice becomes price-only",
      "Sticky selection bar competes with any other bottom chrome for the same pixels",
      "Pre-selection reads as manipulative to sophisticated buyers if the recommended tier is transparently the most expensive",
    ],
    idealUseCases: [
      "Self-serve SaaS plan selection on mobile",
      "Membership and subscription tier choice",
      "Hotel room-type or package selection in booking flows",
      "Insurance or service-level selection in quote funnels",
    ],
    industries: ["saas", "fintech", "hospitality", "ecommerce"],
    complexity: 3,
    conversionScore: 74,
    spec: {
      desktop: "≥768px reverts to the classic 3-col highlighted-middle grid — the selector model is a small-screen adaptation",
      cardAnatomy: "radio state + plan name + badge row, price 32/36 700, top-3 differentiators 15/24, 'See everything' expander",
      selectionState: "2px accent border + subtle accent tint on the selected card; unselected cards 1px 10% border",
      stickyBar: "56px + safe-area, selected tier + price left, continue CTA right, appears once the pricing section enters view",
      expanders: "collapsed by default, chevron row 48px tall, full feature list 15/24 inside",
      mobile: {
        stack: "stacked cards, recommended tier first and pre-selected; sticky selection bar pinned to the bottom while the section is in view",
        sectionPaddingPx: 48,
        edgeGutterPx: 20,
        stackGapPx: 12,
        tapTargets:
          "entire card is the select target (min 88px tall collapsed); expander row 48px tall full-width; continue CTA min 48px tall and ≥50% of bar width",
        notes:
          "Card padding 20px, price 32px (down from desktop 48). Selecting a card must never auto-scroll or auto-expand — selection and reading are separate acts. The sticky bar restates the chosen tier and monthly price so the continue tap is made with the number in view, not from memory.",
      },
    },
    source: "seed:curated",
  },
  {
    slug: "tap-to-act-bar",
    name: "Tap-to-Act Bar",
    category: "cta",
    description:
      "A persistent bottom action bar for local and service businesses: tap-to-call (tel:), directions (maps deep link), and book, with call as the visually primary action. Two or three actions maximum, each an OS-level intent rather than an in-page form. Desktop swaps it for a visible phone number and inline booking CTA.",
    whyItWorks:
      "On mobile the phone IS the conversion device — a tel: link turns intent into a live call in one tap with zero fields, while a form costs typing, a submit, and a response delay during which intent decays. Local intent is time-sensitive ('open now', 'near me'), so removing every step between wanting and calling captures conversions at their hottest moment; directions and booking cover the two other terminal actions a local visitor actually wants.",
    strengths: [
      "Zero-form conversion: one tap to a ringing phone beats any lead form on completion cost",
      "Matches dominant local-mobile intent — call, go there, or book covers nearly every visit's goal",
      "Calls are measurable with call-tracking numbers, so the bar's conversion impact is provable",
      "Trivial to implement: three intent links and a fixed bar — highest ROI per hour of build time",
    ],
    weaknesses: [
      "Every added action dilutes the primary one — call must stay the single filled button or the bar becomes a nav strip",
      "Tap-to-call outside business hours rings into voicemail and burns the hottest intent — the bar should swap call for book/hours state after close",
      "Same viewport tax and bottom-chrome stacking problems as any fixed bar",
      "Meaningless on desktop — tel: links there are broken promises; requires a real desktop fallback",
    ],
    idealUseCases: [
      "Restaurants, clinics, salons, and repair services — any call-to-book business",
      "Hotel and tour operator pages where phone still closes the booking",
      "Real-estate agent and property pages (call agent / directions to viewing)",
      "Emergency and same-day services where speed to contact is the whole sale",
    ],
    industries: ["healthcare", "hospitality", "tourism", "real-estate"],
    complexity: 2,
    conversionScore: 86,
    spec: {
      desktop: "hidden ≥768px — replaced by a header phone number in text and an inline booking CTA",
      barHeight: "56px content + env(safe-area-inset-bottom)",
      actions: "max 3: call (filled primary), directions (ghost, maps deep link), book (ghost or second step)",
      links: "tel:+<E.164 number>, geo:/maps universal link, booking URL — OS intents, no in-page handlers",
      hoursAwareness: "after closing time the call slot swaps to 'Book for tomorrow' or shows 'Opens 9am' state",
      background: "solid page background, 1px top hairline at 8% opacity — no blur needed over content this bar outranks",
      mobile: {
        stack: "single fixed row of 2-3 equal-width action slots; call is the only filled button, icon + short label per slot",
        sectionPaddingPx: 8,
        edgeGutterPx: 16,
        stackGapPx: 8,
        tapTargets:
          "each action slot min 48px tall and min 96px wide (icon 20px + 12px label); 8px gap between slots so adjacent intents never merge into one mis-tap",
        notes:
          "sectionPaddingPx is the bar's internal vertical padding. Use a call-tracking number in the tel: link to attribute conversions. Keep labels to one word (Call, Directions, Book) — two-line labels break the 56px bar. Page content gets matching bottom padding so the bar never covers the address or footer hours.",
      },
    },
    source: "seed:curated",
  },
];
