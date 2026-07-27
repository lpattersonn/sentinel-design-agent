/**
 * Write-path taxonomy enforcement: the brain only grows organized if every
 * write conforms to the same vocabulary agents use to read. Freeform values
 * (compound industries, synonym drift, tag noise) silently break filtering.
 */

/** The canonical industry vocabulary. Published via get_brain_index. */
export const CANONICAL_INDUSTRIES = [
  "saas",
  "ecommerce",
  "hospitality",
  "tourism",
  "healthcare",
  "real-estate",
  "fintech",
  "agency",
  "education",
  "local-services",
  "media",
  "nonprofit",
  "other",
] as const;

const INDUSTRY_SYNONYMS: Record<string, string> = {
  "e-commerce": "ecommerce",
  ecom: "ecommerce",
  retail: "ecommerce",
  shop: "ecommerce",
  store: "ecommerce",
  software: "saas",
  b2b: "saas",
  "developer tools": "saas",
  devtools: "saas",
  tech: "saas",
  "vacation rental": "hospitality",
  "vacation rentals": "hospitality",
  "short-term rental": "hospitality",
  "short term rental": "hospitality",
  hotel: "hospitality",
  hotels: "hospitality",
  restaurant: "hospitality",
  restaurants: "hospitality",
  travel: "tourism",
  medical: "healthcare",
  health: "healthcare",
  wellness: "healthcare",
  "real estate": "real-estate",
  realestate: "real-estate",
  property: "real-estate",
  finance: "fintech",
  financial: "fintech",
  banking: "fintech",
  "legal tech": "saas",
  legal: "local-services",
  salon: "local-services",
  clinic: "local-services",
  studio: "agency",
  portfolio: "agency",
  editorial: "media",
  publishing: "media",
  charity: "nonprofit",
};

/**
 * Map any freeform industry string onto the canonical vocabulary.
 * Compound values ("vacation rental / hospitality / x") resolve to the first
 * segment that maps; unmappable non-empty values pass through lowercased so
 * nothing is silently lost, but canon always wins when a mapping exists.
 */
export function normalizeIndustry(v: string | null | undefined): string | null {
  const raw = v?.trim().toLowerCase().replace(/\s+/g, " ");
  if (!raw) return null;

  const segments = raw
    .split(/[/,;|]/)
    .map((s) => s.trim())
    .filter(Boolean);

  for (const segment of segments.length > 0 ? segments : [raw]) {
    if ((CANONICAL_INDUSTRIES as readonly string[]).includes(segment)) return segment;
    if (INDUSTRY_SYNONYMS[segment]) return INDUSTRY_SYNONYMS[segment];
  }
  // Substring pass for phrases like "boutique hotel brand".
  const haystack = segments.join(" ") || raw;
  for (const [synonym, canon] of Object.entries(INDUSTRY_SYNONYMS)) {
    if (haystack.includes(synonym)) return canon;
  }
  for (const canon of CANONICAL_INDUSTRIES) {
    if (haystack.includes(canon)) return canon;
  }
  return segments[0] ?? raw;
}

/** Lowercase, trim, dedupe, and cap tags so the tag vocabulary stays searchable. */
export function normalizeTags(tags: string[] | undefined | null): string[] {
  if (!tags) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const tag of tags) {
    const t = tag.trim().toLowerCase().replace(/\s+/g, "-");
    if (t && !seen.has(t)) {
      seen.add(t);
      out.push(t);
    }
    if (out.length >= 8) break;
  }
  return out;
}

/** The canonical pattern categories (matches the seeded library). */
export const CANONICAL_CATEGORIES = [
  "hero",
  "pricing",
  "cta",
  "testimonials",
  "navigation",
  "cards",
  "forms",
  "dashboard",
  "feature-grid",
  "faq",
  "footer",
  "other",
] as const;

export function normalizeCategory(v: string): string {
  const raw = v.trim().toLowerCase().replace(/\s+/g, "-");
  return (CANONICAL_CATEGORIES as readonly string[]).includes(raw) ? raw : "other";
}
