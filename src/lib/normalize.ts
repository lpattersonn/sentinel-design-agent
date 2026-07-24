/**
 * Canonicalize free-form industry strings so filters, stored rows, and seeds
 * all agree ("E-Commerce", " ecommerce " and "e-commerce" hit the same rows).
 */
const INDUSTRY_ALIASES: Record<string, string> = {
  "e-commerce": "ecommerce",
};

export function normalizeIndustry(v: string | null | undefined): string | null {
  if (v == null) return null;
  const cleaned = v.trim().toLowerCase().replace(/\s+/g, " ");
  if (!cleaned) return null;
  return INDUSTRY_ALIASES[cleaned] ?? cleaned;
}
