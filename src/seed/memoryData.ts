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
];
