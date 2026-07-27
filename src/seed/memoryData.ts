import type { DesignAnalysis } from "@/lib/types";

export type SeedMemory = {
  title: string;
  sourceType: "description";
  sourceRef: string;
  brand: string;
  industry: string;
  tags: string[];
  analysis: DesignAnalysis;
  summary: string;
  traits: string[];
  qualityScore: number;
};

const appleAnalysis: DesignAnalysis = {
  summary:
    "Apple's marketing pages achieve luxury through subtraction: enormous product-led typography, one idea per viewport, and near-monochrome palettes let photography and whitespace do the persuading. Hierarchy is so simple it is almost binary — a giant statement, a quiet sub-line, and the product itself.",
  style: "minimal luxury",
  industry: "ecommerce",
  brandPersonality: ["premium", "confident", "restrained", "aspirational"],
  spacing: {
    system: "large-block rhythm on a loose 8px base; whitespace treated as a primary material",
    baseUnit: 8,
    sectionSpacing:
      "120-160px between full-bleed sections; each section behaves as a self-contained slide",
    notes:
      "Spacing is deliberately extravagant — padding budgets that most brands would never approve are exactly what encode 'we don't need to shout'. Nothing is ever within 40px of a viewport edge.",
  },
  typography: {
    headingFont: "SF Pro Display",
    bodyFont: "SF Pro Text",
    scale:
      "extreme display scale — 56-96px headlines with tight -1.5% to -2% tracking and ~1.05 leading, dropping straight to 19-21px body with almost nothing in between",
    hierarchyNotes:
      "The two-step scale (huge vs. modest, nothing in the middle) is the whole hierarchy system. Weight stays in a narrow 500-700 band; size and space carry the structure, not boldness or color.",
  },
  hierarchy: {
    strength: "strong",
    focalPoints: [
      "single giant product statement per viewport",
      "hero product photography centered on generous negative space",
      "paired text links ('Learn more / Buy') as the only interactive accents",
    ],
    notes:
      "One idea per screenful — scroll depth substitutes for layout complexity. The user is never asked to choose what to look at; the page has already chosen.",
  },
  grid: {
    columns: 12,
    containerWidth: "980px",
    notes:
      "Narrow text measure inside effectively full-bleed sections; the classic 980px content column keeps line lengths short while imagery escapes the container edge-to-edge.",
  },
  visualRhythm:
    "Vertical slideshow cadence: statement, image, breathe, repeat. The eye moves in large certain jumps down the center axis with no lateral scanning; alternating white/black sections act as chapter breaks.",
  colors: {
    palette: [
      { hex: "#FFFFFF", role: "primary background" },
      { hex: "#000000", role: "alternate section background / display text" },
      { hex: "#1D1D1F", role: "body text on light" },
      { hex: "#F5F5F7", role: "soft neutral section background" },
      { hex: "#0071E3", role: "sole accent — links and pill CTA buttons" },
    ],
    notes:
      "Effectively monochrome with one disciplined blue accent; all chroma is delegated to product photography. Because nothing else is saturated, the product is always the most colorful object on screen.",
  },
  componentPatterns: [
    {
      category: "hero",
      description:
        "Full-viewport centered hero: product name at display scale, one-line tagline, 'Learn more / Buy' link pair, product image dominating the lower half.",
      whyItWorks:
        "Removing every competing element makes the product the unambiguous protagonist; the modest link-pair CTA signals a brand that expects desire rather than manufacturing urgency.",
    },
    {
      category: "cta",
      description:
        "Small blue pill buttons and quiet text links — never large, never repeated aggressively.",
      whyItWorks:
        "Understated CTAs read as an invitation, not a demand; scarcity of accent color makes the blue instantly findable when intent forms.",
    },
    {
      category: "cards",
      description:
        "Rounded-corner tiles (2-up bento grids) with generous internal padding, each holding one product story with its own mini-hierarchy.",
      whyItWorks:
        "Each tile is a self-contained slide; the uniform radius and padding make a heterogeneous product line feel like one family.",
    },
    {
      category: "navigation",
      description:
        "44px slim global nav, blurred translucent background, tiny 12px labels, ruthless economy of destinations.",
      whyItWorks:
        "The nav's smallness is a status move — it cedes the entire viewport to product storytelling while remaining reachable.",
    },
  ],
  animation: {
    present: true,
    style:
      "scroll-driven product reveals and slow parallax zooms; elements fade and settle with long, decelerating easings",
    notes:
      "Motion is cinematic rather than functional — it paces the story like camera moves. Nothing bounces; everything decelerates, reinforcing the calm-luxury feel.",
  },
  accessibility: {
    estimatedLevel: "AA",
    issues: [
      "thin light-gray captions on white hover near contrast minimums",
      "scroll-hijacked product sequences can frustrate keyboard and reduced-motion users",
    ],
    strengths: [
      "huge type and short line lengths make core content effortlessly legible",
      "strong focus discipline: one action per view keeps tab order trivial",
      "respects prefers-reduced-motion on most scroll sequences",
    ],
  },
  responsiveness: {
    approach:
      "aggressive art direction per breakpoint — copy shortens and images are re-cropped for mobile rather than merely reflowed",
    notes:
      "Mobile is not a squeezed desktop: display type steps down to ~40px, grids collapse to single-column slides, and the one-idea-per-viewport rule holds even harder on small screens.",
  },
  traits: [
    "large typography",
    "simple hierarchy",
    "minimal color",
    "strong whitespace",
    "luxury feel",
    "product-as-hero photography",
  ],
  lessons: [
    "Whitespace is a status signal: generous padding communicates confidence more cheaply than any copy can.",
    "A two-step type scale (huge display, modest body) creates hierarchy stronger than five intermediate sizes.",
    "Reserve all saturation for one accent and the product itself — restraint elsewhere makes the subject glow.",
    "One idea per viewport: let scroll depth carry complexity instead of layout density.",
    "Small, quiet CTAs can outperform loud ones when the surrounding design has already built desire.",
  ],
};

const stripeAnalysis: DesignAnalysis = {
  summary:
    "Stripe pairs an engineering-grade information architecture with one flamboyant signature: the animated gradient. Progressive disclosure runs through everything — marketing pages layer summary, detail, and code sample; onboarding asks only for what the next step needs; the dashboard surfaces health first and depth on demand.",
  style: "polished developer-forward fintech",
  industry: "fintech",
  brandPersonality: ["technical", "trustworthy", "precise", "quietly playful"],
  spacing: {
    system: "strict 4/8px system applied with unusual consistency across marketing and product",
    baseUnit: 8,
    sectionSpacing:
      "96-128px between marketing sections; 16/24px module padding inside the dashboard",
    notes:
      "The same spacing tokens visibly govern both the marketing site and the product, which quietly argues 'the product is this well-built too'. Density increases as user intent deepens: airy landing, medium docs, compact dashboard.",
  },
  typography: {
    headingFont: "Sohne (sans-serif)",
    bodyFont: "Sohne / system fallbacks; Sohne Mono for code",
    scale:
      "moderate display (48-72px, -1% tracking) stepping through a real 5-step scale to 15px UI text; code samples at 13-14px mono",
    hierarchyNotes:
      "Headlines often set dark-on-light with a single gradient-tinted word; hierarchy relies on weight (400/500/600) and color temperature more than dramatic size jumps. Mono type is used as a legibility signal for anything machine-truthful: amounts, IDs, code.",
  },
  hierarchy: {
    strength: "strong",
    focalPoints: [
      "gradient hero headline",
      "live code sample or product screenshot at first scroll",
      "primary 'Start now' button repeated at consistent positions",
    ],
    notes:
      "Marketing pages interleave claim, then proof (code or screenshot) in strict alternation — every assertion is immediately backed by an artifact, which is itself a hierarchy of persuasion.",
  },
  grid: {
    columns: 12,
    containerWidth: "1080px",
    notes:
      "12-column grid with frequent asymmetric 7/5 splits: text column paired against a live demo column. Diagonal section dividers (skewed backgrounds) break the horizontal monotony without breaking the grid.",
  },
  visualRhythm:
    "Alternating claim/proof cadence — copy block, artifact, copy block, artifact — with the gradient reappearing at chapter boundaries. The diagonal dividers keep long pages feeling propelled rather than stacked.",
  colors: {
    palette: [
      { hex: "#635BFF", role: "primary brand blurple — CTAs and accents" },
      { hex: "#0A2540", role: "deep navy — headings and dark sections" },
      { hex: "#425466", role: "body text" },
      { hex: "#F6F9FC", role: "cool light section background" },
      { hex: "#00D4FF", role: "gradient companion cyan" },
      { hex: "#7A73FF", role: "gradient midpoint" },
    ],
    notes:
      "A restrained cool neutral system carries 95% of the interface, licensing one loud element: the animated multi-hue gradient. Because it is quarantined to heroes and accents, it stays a signature instead of noise.",
  },
  componentPatterns: [
    {
      category: "hero",
      description:
        "Left-aligned headline with gradient wordmark treatment, subhead, email-capture-to-start field, and a live product artifact (code editor or dashboard) on the right.",
      whyItWorks:
        "Pairing the promise with a working artifact in the first viewport collapses the believe/verify loop; the inline email field removes one click from activation.",
    },
    {
      category: "forms",
      description:
        "Onboarding asks for the minimum per step, defers KYC detail until required, previews the dashboard before verification completes, and validates inline.",
      whyItWorks:
        "Progressive disclosure keeps perceived effort low at every moment; showing the live dashboard early converts sunk-cost into motivation to finish activation.",
    },
    {
      category: "dashboard",
      description:
        "Home surface leads with balance and payments-volume sparklines, then recent activity; deep tables live one navigation level down. Left rail navigation, command palette, right-side detail drawers.",
      whyItWorks:
        "Answers 'is money moving?' in one glance while keeping forensic depth one click away — detail drawers preserve list context instead of navigating away.",
    },
    {
      category: "navigation",
      description:
        "Marketing: slim nav with hover mega-panels grouping ~20 products into 4 mental buckets. Product: icon+label left rail with progressive nesting.",
      whyItWorks:
        "Mega-panels chunk a sprawling product catalog into scannable groups, so breadth becomes a trust signal rather than a navigation tax.",
    },
    {
      category: "cards",
      description:
        "Docs and dashboard modules as flat white cards, 8px radius, 1px cool-gray border, almost no shadow.",
      whyItWorks:
        "Hairline borders keep high-density financial data calm; shadows are reserved for genuinely elevated surfaces like drawers and popovers, preserving a meaningful z-axis.",
    },
  ],
  animation: {
    present: true,
    style:
      "slow-shifting WebGL hero gradient; 150-250ms ease-out micro-transitions on everything interactive; animated code typing in demos",
    notes:
      "One expensive signature animation (the gradient) plus ruthlessly cheap functional motion everywhere else. Product motion never exceeds ~250ms — fast enough to feel causal, slow enough to explain state changes.",
  },
  accessibility: {
    estimatedLevel: "AA",
    issues: [
      "light gray secondary text on cool backgrounds occasionally dips below 4.5:1",
      "gradient-tinted headline words can lose contrast at certain animation frames",
    ],
    strengths: [
      "semantic structure and keyboard support are excellent, including a fully navigable dashboard and command palette",
      "focus rings are custom but always visible",
      "docs offer code samples with proper contrast in both light and dark themes",
    ],
  },
  responsiveness: {
    approach:
      "12-column marketing grid collapses asymmetric splits to stacked artifact-below-copy; dashboard is responsive down to tablet with a collapsing left rail",
    notes:
      "Code samples and tables get horizontal scroll containers on mobile rather than reflowing — honest about content that has a minimum legible width.",
  },
  traits: [
    "progressive disclosure",
    "excellent onboarding",
    "gradient identity",
    "claim-then-proof rhythm",
    "dense but calm dashboard",
    "code as first-class content",
  ],
  lessons: [
    "Quarantine one signature visual (gradient, texture, motion) to specific zones — a single loud element in a quiet system becomes a brand asset instead of noise.",
    "Alternate claim and artifact: back every marketing assertion with a screenshot, demo, or code sample in the adjacent viewport.",
    "Let density track intent: airy for visitors, medium for evaluators, compact for daily operators — using the same spacing tokens throughout.",
    "Progressive disclosure in onboarding: ask for the minimum each step needs and show the product before signup friction is fully paid.",
    "Use hairline borders, not shadows, to organize dense data surfaces; save elevation for true overlays.",
  ],
};

const linearAnalysis: DesignAnalysis = {
  summary:
    "Linear is a masterclass in speed-as-aesthetic: a dense, dark, keyboard-first interface where every interaction lands in near-instant sub-100ms feedback and motion is short, purposeful, and physical. The marketing site sells the product by behaving like it — crisp type, dark glassy panels, and interactions that feel pre-computed.",
  style: "dark, dense, developer-native precision",
  industry: "saas",
  brandPersonality: ["fast", "technical", "opinionated", "meticulous"],
  spacing: {
    system: "tight 4px-base system; compact-but-exact rhythm",
    baseUnit: 4,
    sectionSpacing:
      "marketing sections 96-120px; in-product rows run 32-36px tall with 8-12px gutters",
    notes:
      "Density is a feature: professional users get more issues per viewport, but the 4px discipline keeps it exact rather than cramped. Alignment is obsessive — icons, checkboxes, and text share baselines to the pixel.",
  },
  typography: {
    headingFont: "Inter Display",
    bodyFont: "Inter",
    scale:
      "restrained scale — 40-64px marketing display with -2% tracking, 13-14px UI text, 12px metadata; line heights tighten as density rises",
    hierarchyNotes:
      "In-product hierarchy comes almost entirely from weight (500/600) and opacity steps (100/70/50%) rather than size — a size-quiet system that preserves row density. Marketing headlines are tight-tracked and confident, often white on near-black.",
  },
  hierarchy: {
    strength: "strong",
    focalPoints: [
      "current issue row / focused list item",
      "command palette (Cmd+K) as the interaction centerpiece",
      "marketing hero: one-sentence thesis over a live product frame",
    ],
    notes:
      "The product treats focus state as the primary hierarchy: the selected row is the brightest thing on screen. Marketing pages inherit the same logic — one glowing product frame per viewport against deep dark backgrounds.",
  },
  grid: {
    columns: 12,
    containerWidth: "1024px",
    notes:
      "Narrow marketing container keeps copy terse; the app itself is a fluid three-pane layout (nav rail, list, detail) with fixed side rails and a fluid center.",
  },
  visualRhythm:
    "Marketing: thesis, glowing product frame, thesis, frame — a metronomic pitch where the product does the talking. In-product: uniform row rhythm broken only by the focused item's highlight, so the eye tracks state changes instantly.",
  colors: {
    palette: [
      { hex: "#08090A", role: "app/base background" },
      { hex: "#101113", role: "raised panel background" },
      { hex: "#F7F8F8", role: "primary text on dark" },
      { hex: "#8A8F98", role: "secondary text / metadata" },
      { hex: "#5E6AD2", role: "brand indigo — accents, focus, selection" },
      { hex: "#26282E", role: "hairline borders and dividers" },
    ],
    notes:
      "A near-monochrome dark system with one desaturated indigo accent; status colors (amber, green, red) appear only as small dots and chips, so state reads instantly without the UI becoming carnival-colored.",
  },
  componentPatterns: [
    {
      category: "navigation",
      description:
        "Compact left rail with workspaces, views, and favorites; global Cmd+K command palette handles navigation, creation, and mutation from the keyboard.",
      whyItWorks:
        "The palette collapses the entire IA into a type-ahead — expert users never touch the mouse, and the rail exists mainly as a spatial memory aid.",
    },
    {
      category: "cards",
      description:
        "Issue rows and board cards are ultra-dense: status dot, ID in mono, title, assignee avatar, labels as tiny chips — all in a 36px row.",
      whyItWorks:
        "Every glyph is a fixed-position column, so scanning 40 issues is a single vertical eye movement; icon-encoded metadata avoids the width cost of text.",
    },
    {
      category: "hero",
      description:
        "Dark marketing hero: one-line thesis in tight-tracked display type, muted sub-line, single CTA, and a floating, subtly glowing product frame beneath.",
      whyItWorks:
        "Selling speed requires showing the actual product; the glow-on-dark treatment makes a screenshot feel like a rendered object and the terse copy mirrors the product's economy.",
    },
    {
      category: "forms",
      description:
        "Issue creation is a floating modal with keyboard-first inputs — every property settable via slash commands or shortcuts, no full-page form anywhere.",
      whyItWorks:
        "Creation cost is the core loop's friction; keeping it in an overlay preserves context, and keyboard property-setting makes entry near-free for power users.",
    },
  ],
  animation: {
    present: true,
    style:
      "100-200ms ease-out micro-motions: panels slide, popovers scale from their origin, list reorders animate positionally; nothing decorative",
    notes:
      "Motion exists to preserve object permanence during state changes, never to entertain. Because every transition is under ~200ms, the interface feels faster with the animation than without it — the rare case where motion adds speed.",
  },
  accessibility: {
    estimatedLevel: "partial-AA",
    issues: [
      "50%-opacity metadata text on dark backgrounds falls below 4.5:1 in places",
      "the keyboard-first model is excellent, but discoverability of shortcuts for assistive-tech users depends on the palette",
      "dense 36px rows offer small pointer targets by design",
    ],
    strengths: [
      "complete keyboard operability — genuinely everything is reachable without a mouse",
      "consistent, visible focus/selection states doubling as the hierarchy system",
      "reduced-motion preference respected across transitions",
    ],
  },
  responsiveness: {
    approach:
      "desktop-first professional tool; marketing site is fully responsive, the app collapses panes to a stack on small screens with a companion mobile app for triage",
    notes:
      "Honest prioritization: the dense three-pane workspace is not pretended onto phones — mobile gets a purpose-built subset instead of a degraded desktop.",
  },
  traits: [
    "fast interaction",
    "excellent motion",
    "dense information",
    "developer-focused dark UI",
    "keyboard-first",
    "opacity-based hierarchy",
  ],
  lessons: [
    "Perceived speed is a design property: sub-100ms feedback and sub-200ms motion make software feel engineered, and that feeling is the brand.",
    "On dense dark UIs, build hierarchy from weight and opacity steps instead of size — density survives, structure remains.",
    "A command palette collapses deep navigation into recall for experts while menus stay available for novices.",
    "Fixed-column row anatomy (dot, ID, title, avatar, chips) turns scanning long lists into a single eye movement.",
    "Use motion strictly for object permanence during state changes; if a transition exceeds ~250ms it is costing speed, not adding polish.",
  ],
};

const shopifyCheckoutAnalysis: DesignAnalysis = {
  summary:
    "Shopify's mobile checkout is conversion engineering distilled: a single-column flow that asks one decision per screen, puts express-pay wallets (Shop Pay, Apple Pay) above manual entry so most buyers never see a card form, and treats every field as a cost to be justified. The order summary collapses behind a toggle, trust signals cluster around the pay button, and inline error recovery means a typo never restarts the flow.",
  style: "utilitarian conversion-first commerce",
  industry: "ecommerce",
  brandPersonality: ["trustworthy", "efficient", "unobtrusive", "reassuring"],
  spacing: {
    system: "tight 4px-base system tuned for one-screen steps, not editorial rhythm",
    baseUnit: 4,
    sectionSpacing:
      "24-32px between checkout blocks (contact, shipping, payment); 12-16px between fields inside a block — compact enough that a whole step fits one 390px viewport",
    notes:
      "Spacing is budgeted backwards from the goal: each step's fields plus its primary button must fit a single mobile viewport with the keyboard closed. Generosity is spent only around the pay button, which gets 24px of isolation so nothing competes with the final tap.",
  },
  typography: {
    headingFont: "system stack (SF Pro / Roboto) — native rendering speed over brand voice",
    bodyFont: "system stack",
    scale:
      "quiet scale: step titles 21-24px/600, labels 14px, inputs and body 16px, legal microcopy 12-13px — no display type anywhere in the flow",
    hierarchyNotes:
      "16px inputs are a hard floor to prevent iOS auto-zoom. Hierarchy favors the transaction, not the brand: the largest, boldest elements are the order total and the pay button label, because those are the two things a buyer re-checks before committing.",
  },
  hierarchy: {
    strength: "strong",
    focalPoints: [
      "express-pay wallet buttons stacked at the very top of checkout",
      "the single primary action button pinned at the bottom of each step",
      "order total, always one toggle away and restated on the pay button itself",
    ],
    notes:
      "Each screen has exactly one decision and one primary button; everything else (edit links, return-to-cart, discount code) is a text link. The buyer never chooses between two filled buttons anywhere in the flow.",
  },
  grid: {
    columns: 1,
    containerWidth: "100% minus 16-20px gutters on mobile; ~576px single column centered on desktop",
    notes:
      "Deliberately single-column even on wide screens — multi-column checkout forms create Z-pattern eye travel and field-order ambiguity. The one exception is paired short fields (city/postcode) that share a row only when both are short-answer.",
  },
  visualRhythm:
    "A metronome of identical steps: title, a handful of fields, primary button — repeated until paid. Predictability is the rhythm; the buyer learns the pattern on step one and executes the rest on autopilot, with the collapsed order summary as a constant, quiet header presence.",
  colors: {
    palette: [
      { hex: "#FFFFFF", role: "form background" },
      { hex: "#202223", role: "primary text and input values" },
      { hex: "#6D7175", role: "labels, microcopy, secondary text" },
      { hex: "#5A31F4", role: "Shop Pay express button — the loudest element on screen" },
      { hex: "#008060", role: "merchant-configurable primary pay button (Shopify green default)" },
      { hex: "#D72C0D", role: "inline error text and error borders" },
    ],
    notes:
      "Chrome is deliberately colorless so the two colored elements — express wallet and pay button — are always the most visible things on screen. Error red appears only next to the offending field, never as a page-level banner that implies the whole attempt failed.",
  },
  componentPatterns: [
    {
      category: "forms",
      description:
        "Single-column field stack asking the minimum per step: email first, then shipping, then payment. Autocomplete attributes on every field, inputmode switching keyboards (numeric for card/postcode, email for email), address autocompletion collapsing five fields into one, 48px inputs at 16px font.",
      whyItWorks:
        "Every field is a chance to abandon, so fields are removed, auto-filled, or deferred wherever possible; correct keyboards and autocomplete cut typing — the single most error-prone act on mobile — sometimes to zero.",
    },
    {
      category: "cta",
      description:
        "Express-pay wallets (Shop Pay, Apple Pay, Google Pay) stacked above the manual form under an 'Express checkout' label, with a hairline 'OR' divider. Below, each step ends in one full-width bottom-anchored primary button that states the outcome — 'Continue to shipping', 'Pay now' — with the total restated at the point of payment.",
      whyItWorks:
        "Wallets convert a 12-field form into one biometric confirmation for returning buyers — the majority path skips manual entry entirely. Outcome-worded, bottom-anchored buttons sit in the thumb zone and tell the buyer exactly what the tap costs before they commit.",
    },
    {
      category: "cards",
      description:
        "Order summary collapsed behind a 'Show order summary' toggle with the total visible in the collapsed state; expanding reveals line items, shipping, and taxes inline without navigation.",
      whyItWorks:
        "The buyer's recurring anxiety — 'what am I paying?' — is answered in one tap without leaving the flow, while the collapsed default keeps the form, not the receipt, as the screen's job.",
    },
    {
      category: "navigation",
      description:
        "Checkout strips global chrome entirely: no site nav, no footer links, just a breadcrumb of the steps (Information > Shipping > Payment) and a quiet return link.",
      whyItWorks:
        "Every exit removed is an abandonment path closed; the breadcrumb preserves orientation and signals finite remaining effort, which keeps buyers who are two-thirds done from bailing.",
    },
    {
      category: "other",
      description:
        "Trust cluster at the commitment point: padlock icon and reassurance line adjacent to the pay button, wallet brand marks doing double duty as security signals, payment network badges near card entry.",
      whyItWorks:
        "Trust is consumed at the moment of highest perceived risk — entering payment and tapping pay — so signals are placed at that exact point instead of a distant footer the buyer never scrolls to.",
    },
  ],
  animation: {
    present: true,
    style:
      "near-none by design: 150-200ms ease transitions on the summary expand/collapse and inline error reveals; skeleton states during payment processing",
    notes:
      "Checkout is the one surface where motion is almost pure risk — anything playful reads as unserious next to a credit card field. The only essential animation is the processing state after 'Pay now', which prevents double-submission taps.",
  },
  accessibility: {
    estimatedLevel: "AA",
    issues: [
      "merchant-themed pay button colors can dip below 4.5:1 when brands override the default",
      "13px legal microcopy sits at the small end of comfortable legibility",
    ],
    strengths: [
      "labels are real elements above inputs, never placeholder-only, so context survives typing",
      "errors are announced inline, adjacent to the field, with color plus icon plus text — never color alone",
      "logical focus order and correct input types make the flow completable by screen reader and keyboard",
      "16px inputs prevent the iOS zoom-and-lose-your-place failure entirely",
    ],
  },
  responsiveness: {
    approach:
      "mobile-first in the strict sense: the phone layout is the canonical design and desktop is the adaptation — a centered single column with the order summary moving to a persistent side panel",
    notes:
      "Because most checkout traffic is mobile, the desktop view is a widened phone flow rather than the reverse; nothing essential exists on desktop that mobile lacks. The thumb-zone button placement and one-decision-per-screen structure are preserved at every width.",
  },
  traits: [
    "wallets above manual entry",
    "one decision per screen",
    "field minimization",
    "collapsed order summary",
    "trust at the point of payment",
    "inline error recovery",
  ],
  lessons: [
    "Put express-pay wallets above the manual card form: the highest-converting checkout is the one most buyers never have to type in.",
    "Ask one decision per screen on mobile funnels — a step whose fields and button fit one viewport gets finished; a wall of fields gets abandoned.",
    "Treat every form field as a cost: remove it, auto-fill it via autocomplete/address lookup, or defer it past the commitment point.",
    "Collapse the order summary behind a toggle with the total visible — answer 'what am I paying?' in one tap without surrendering the screen to the receipt.",
    "Place trust signals (padlock, guarantee, payment badges) adjacent to the pay button, where risk is felt — not in a footer nobody scrolls to.",
    "Set every input to 16px with correct inputmode and autocomplete attributes; the on-screen keyboard is part of the form's design.",
    "Recover errors inline next to the field, preserving all entered data — a page-level error that forces re-entry converts a typo into an abandonment.",
  ],
};

export const seedMemories: SeedMemory[] = [
  {
    title: "Apple — marketing site design language",
    sourceType: "description",
    sourceRef: "https://www.apple.com",
    brand: "Apple",
    industry: "ecommerce",
    tags: ["minimal", "luxury", "typography", "whitespace", "product-marketing"],
    analysis: appleAnalysis,
    summary: appleAnalysis.summary,
    traits: appleAnalysis.traits,
    qualityScore: 96,
  },
  {
    title: "Stripe — marketing, onboarding and dashboard design language",
    sourceType: "description",
    sourceRef: "https://stripe.com",
    brand: "Stripe",
    industry: "fintech",
    tags: ["fintech", "gradient", "onboarding", "dashboard", "progressive-disclosure", "developer"],
    analysis: stripeAnalysis,
    summary: stripeAnalysis.summary,
    traits: stripeAnalysis.traits,
    qualityScore: 94,
  },
  {
    title: "Linear — product and marketing design language",
    sourceType: "description",
    sourceRef: "https://linear.app",
    brand: "Linear",
    industry: "saas",
    tags: ["dark-ui", "dense", "keyboard-first", "motion", "developer-tools"],
    analysis: linearAnalysis,
    summary: linearAnalysis.summary,
    traits: linearAnalysis.traits,
    qualityScore: 92,
  },
  {
    title: "Mobile commerce checkout — conversion design language",
    sourceType: "description",
    sourceRef: "https://www.shopify.com",
    brand: "Shopify",
    industry: "ecommerce",
    tags: ["mobile", "checkout", "conversion", "forms"],
    analysis: shopifyCheckoutAnalysis,
    summary: shopifyCheckoutAnalysis.summary,
    traits: shopifyCheckoutAnalysis.traits,
    qualityScore: 93,
  },
];

export type SeedInsight = {
  kind: string;
  content: string;
  confidence: number;
};

export const seedInsights: SeedInsight[] = [
  {
    kind: "conversion",
    content:
      "Exactly one visually primary CTA per viewport: every additional competing action measurably splits intent. Secondary actions should be text links or ghost buttons, never a second filled button of equal weight.",
    confidence: 0.9,
  },
  {
    kind: "layout",
    content:
      "Commit to an 8px (or 4px for dense tools) spacing system and never hand-tune off-grid values — spacing drift is the fastest way for a page to feel amateur, and grid discipline is the cheapest way to feel engineered.",
    confidence: 0.92,
  },
  {
    kind: "layout",
    content:
      "Dashboards should be dense but legible: build hierarchy from type weight, tabular numerals, and 100/70/50% opacity steps rather than large size jumps, and give the screen exactly one dominant module as the eye's entry point.",
    confidence: 0.82,
  },
  {
    kind: "other",
    content:
      "Keep functional motion between 100ms and 300ms with ease-out curves, reserved for explaining state changes (where a panel came from, where an item went). Motion above 300ms reads as lag; decorative motion belongs only in marketing heroes.",
    confidence: 0.85,
  },
  {
    kind: "color",
    content:
      "Treat WCAG AA contrast (4.5:1 body, 3:1 large text) as a hard floor, not a target — muted 'aesthetic gray' text below it is the most common self-inflicted wound in otherwise polished UI. Design the muted tone by picking the closest passing value.",
    confidence: 0.95,
  },
  {
    kind: "layout",
    content:
      "Compress spacing proportionally on mobile, don't just reflow: desktop section padding of 96-128px steps down to 48-64px at 360-430px widths, and edge gutters never drop below 16px (20-24px preferred). Stay on the 8px scale while compressing — mobile is where hand-tuned off-grid values creep back in.",
    confidence: 0.9,
  },
  {
    kind: "layout",
    content:
      "Spacing between tap targets is itself a tap-target rule: keep a minimum 8px gap between adjacent interactive elements so 44-48px targets don't merge into a mis-tap cluster. A row of 44px icons with 2px gaps is functionally one unpredictable button.",
    confidence: 0.88,
  },
  {
    kind: "conversion",
    content:
      "On mobile forms, input font-size below 16px triggers iOS auto-zoom that breaks the layout mid-entry — 16px is a hard floor, not a style choice. Place the primary CTA full-width in the bottom thumb zone at 48px tall; top-corner CTAs are the hardest pixels on the screen to reach one-handed.",
    confidence: 0.9,
  },
  {
    kind: "process",
    content:
      "Horizontal overflow is the most common mobile defect: one fixed-width table, unwrapped code block, or 100vw+padding section makes the whole page wobble sideways. Audit every page at 360px — nothing except an intentional carousel or scroll container may scroll horizontally, and offenders get their own overflow-x wrapper, never the body.",
    confidence: 0.87,
  },
  {
    kind: "conversion",
    content:
      "On mobile checkout and payment flows, stack express-pay wallets (Apple Pay, Google Pay, Shop Pay) above manual card entry, not below it: a wallet collapses 12-20 typed fields into one biometric confirmation, and every field it bypasses is a field that can no longer cause abandonment. Shopify reports Shop Pay checkouts completing at roughly 1.7x the rate of regular guest checkout — the manual form should be the fallback path, never the default.",
    confidence: 0.91,
  },
  {
    kind: "conversion",
    content:
      "Ask only what fulfillment actually needs: every removed form field measurably lifts mobile completion because each field costs a keyboard round-trip, an error opportunity, and a moment to reconsider. Cutting an 11-field form to 4 has lifted conversions on the order of 100%+ in published tests; 'company', 'phone', and 'how did you hear about us' are optimization targets, not defaults — collect them after the commitment, not before it.",
    confidence: 0.92,
  },
  {
    kind: "conversion",
    content:
      "A top-of-page CTA is gone one swipe after load, but on mobile the moment of conviction usually arrives mid-page — after proof, pricing, or reviews. A bottom-fixed CTA bar (48-56px plus safe-area inset, one primary action, revealed only after the hero scrolls out) keeps conversion one thumb-tap away at every scroll depth; the delayed reveal matters, because showing it immediately doubles the hero CTA and reads as pressure instead of convenience.",
    confidence: 0.89,
  },
  {
    kind: "conversion",
    content:
      "Split mobile funnels into one decision per screen: a wall of 10+ fields reads as work and gets abandoned before the first tap, while the same fields as 3-4 short steps with a visible progress indicator ('2 of 3') routinely complete at 50%+ higher rates in multi-step form studies. Sequence cheap questions first (email before address before payment) so commitment escalates — a user two steps in finishes; a user staring at everything at once leaves.",
    confidence: 0.87,
  },
  {
    kind: "conversion",
    content:
      "For local and service businesses (clinics, restaurants, salons, trades, hotels), the highest-converting mobile CTA is a tel: link, not a form: one tap converts hot intent into a live call with zero fields, while a form costs typing plus a response delay during which intent decays — phone leads close at several times the rate of web-form leads in local-marketing studies. Make tap-to-call the filled primary action in a persistent bottom bar, use a call-tracking number to prove it, and swap it for booking outside business hours.",
    confidence: 0.88,
  },
  {
    kind: "process",
    content:
      "Treat mobile speed and layout stability as conversion features, not engineering hygiene: roughly every 100ms of added load time costs ~1% of conversions in retail studies, 53% of mobile visits abandon pages that take over 3s, and a button that shifts mid-tap converts a click into a mis-tap. Budget the hero's image+font payload to ~200KB, set explicit width/height (or aspect-ratio) on all media and embeds to reserve their space, and hold CLS under 0.1 — a fast page that jumps still loses the tap.",
    confidence: 0.88,
  },
  {
    kind: "layout",
    content:
      "At 390px width, the trust furniture that sat beside the desktop hero — logo strip, review stars, guarantee, payment badges — silently falls three viewports down. Audit mobile layouts so at least a review count with rating and one risk-reversal line ('free cancellation', 'money-back guarantee') land within the first two viewports (~1500px): a single-line trust row directly under the primary CTA costs ~40px and answers 'can I trust this?' at the moment the first tap is being considered.",
    confidence: 0.86,
  },
  {
    kind: "conversion",
    content:
      "Pre-select the recommended tier on mobile pricing: desktop users compare three cards side by side in one glance, but mobile users compare them from memory across 2-3 viewports of scroll, which amplifies choice paralysis. A pre-selected default (accent border, radio state, 'recommended' badge) plus a sticky bar restating the chosen tier and price turns open-ended comparison into a single accept-or-adjust decision — the default effect does more work on a 390px screen than anywhere else.",
    confidence: 0.86,
  },
];
