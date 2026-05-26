import type { GeneratedCV, CVExperience, SectionKey } from "@/contexts/CVBuilderContext";

/** Strip protocol + leading "www." for compact display. */
export function stripUrlPrefix(value: string | null | undefined): string {
  if (!value) return "";
  return value.trim().replace(/^https?:\/\//i, "").replace(/^www\./i, "").replace(/\/+$/, "");
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
