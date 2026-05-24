import type { GeneratedCV, CVExperience, SectionKey } from "@/contexts/CVBuilderContext";

/* Pure helpers used by pdfme builders — no react-pdf dependency. */
export function contactItems(cv: GeneratedCV): string[] {
  return [
    cv.contact.email,
    cv.contact.phone,
    cv.contact.location,
    cv.contact.linkedinUrl,
  ].filter(Boolean) as string[];
}

export function isHidden(cv: GeneratedCV, key: SectionKey) {
  return new Set<SectionKey>(cv.hiddenSections).has(key);
}

export function periodOf(exp: CVExperience) {
  return [exp.startDate, exp.endDate].filter(Boolean).join(" – ") || exp.period || "";
}

export function visibleBullets(exp: CVExperience) {
  return exp.bullets.filter(
    (b) => b.status !== "reverted" && (b.rewrite || b.original),
  );
}
