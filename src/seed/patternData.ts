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
      mobile: "stack vertically, highlighted tier first",
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
      mobile: "collapse to sheet menu below 768px, CTA stays visible outside the sheet",
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
    },
    source: "seed:curated",
  },
];
