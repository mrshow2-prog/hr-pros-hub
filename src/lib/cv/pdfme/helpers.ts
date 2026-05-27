import type { GeneratedCV, CVExperience, SectionKey } from "@/contexts/CVBuilderContext";

/** Strip protocol + leading "www." for compact display. */
export function stripUrlPrefix(value: string | null | undefined): string {
  if (!value) return "";
  return value.trim().replace(/^https?:\/\//i, "").replace(/^www\./i, "").replace(/\/+$/, "");
}

/** Ensure a URL has a scheme so pdfme treats it as a valid link target. */
export function withScheme(value: string | null | undefined): string {
  if (!value) return "";
  const v = value.trim();
  if (!v) return "";
  if (/^([a-z]+:)/i.test(v)) return v; // mailto:, tel:, http(s):, etc.
  return `https://${v.replace(/^\/+/, "")}`;
}

/* Pure helpers used by pdfme builders — no react-pdf dependency. */
export function contactItems(cv: GeneratedCV): string[] {
  return [
    cv.contact.email,
    cv.contact.phone,
    cv.contact.location,
    stripUrlPrefix(cv.contact.linkedinUrl),
    stripUrlPrefix(cv.contact.website),
  ].filter(Boolean) as string[];
}

export function contactLinkItems(cv: GeneratedCV): { label: string; uri?: string }[] {
  return [
    cv.contact.email ? { label: cv.contact.email, uri: `mailto:${cv.contact.email}` } : null,
    cv.contact.phone ? { label: cv.contact.phone } : null,
    cv.contact.location ? { label: cv.contact.location } : null,
    cv.contact.linkedinUrl ? { label: stripUrlPrefix(cv.contact.linkedinUrl), uri: cv.contact.linkedinUrl } : null,
    cv.contact.website ? { label: stripUrlPrefix(cv.contact.website), uri: cv.contact.website } : null,
  ].filter(Boolean) as { label: string; uri?: string }[];
}

export function isHidden(cv: GeneratedCV, key: SectionKey) {
  return new Set<SectionKey>(cv.hiddenSections).has(key);
}

/** Re-export the shared visibility helpers so pdfme code has a single import. */
export { getSectionOrder, hasContent, shouldRender } from "@/lib/cv/sectionVisibility";

export function periodOf(exp: CVExperience) {
  return [exp.startDate, exp.endDate].filter(Boolean).join(" – ") || exp.period || "";
}

export function cleanBulletText(value: string | null | undefined) {
  return (value ?? "")
    .replace(/\r?\n+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/^[-–—•▪·*]+\s*/, "")
    .trim();
}

export function visibleBullets(exp: CVExperience) {
  return exp.bullets
    .map((b) => ({
      ...b,
      rewrite: cleanBulletText(b.rewrite),
      original: cleanBulletText(b.original),
    }))
    .filter((b) => b.status !== "reverted" && (b.rewrite || b.original));
}
