import type { GeneratedCV, SectionKey } from "@/contexts/CVBuilderContext";

/**
 * Reorderable body-section keys (contact + summary are pinned at the top
 * and cannot be moved). The defaults represent the canonical render order
 * used before users started customising it.
 */
export const REORDERABLE_KEYS: SectionKey[] = [
  "experience",
  "skills",
  "education",
  "competencies",
  "languages",
  "achievements",
  "certifications",
  "custom",
];

export const DEFAULT_SECTION_ORDER: SectionKey[] = [...REORDERABLE_KEYS];

/**
 * Return the body section order to render, merging any user-defined order
 * with the canonical default. Unknown keys are dropped, missing keys are
 * appended at the bottom so new sections introduced after a user already
 * customised their order still render.
 */
export function getSectionOrder(cv: GeneratedCV | null | undefined): SectionKey[] {
  const raw = (cv?.sectionOrder ?? []).filter((k): k is SectionKey =>
    REORDERABLE_KEYS.includes(k as SectionKey),
  );
  const seen = new Set(raw);
  for (const k of DEFAULT_SECTION_ORDER) {
    if (!seen.has(k)) raw.push(k);
  }
  return raw;
}

/** True when a section has at least one piece of meaningful content. */
export function hasContent(cv: GeneratedCV, key: SectionKey): boolean {
  switch (key) {
    case "contact": {
      const c = cv.contact;
      return Boolean(
        c.name ||
          c.jobTitle ||
          c.email ||
          c.phone ||
          c.location ||
          c.linkedinUrl ||
          c.website,
      );
    }
    case "summary":
      return Boolean((cv.summary ?? "").trim());
    case "experience":
      return cv.experience.some(
        (e) =>
          (e.role || "").trim() ||
          (e.company || "").trim() ||
          e.bullets.some((b) => (b.rewrite || b.original || "").trim()),
      );
    case "skills":
      return cv.skills.some((s) => (s || "").trim());
    case "education":
      return cv.education.some(
        (e) => (e.institution || "").trim() || (e.qualification || "").trim(),
      );
    case "competencies":
      return cv.competencyClusters.some(
        (c) => c.items.some((i) => (i || "").trim()),
      );
    case "languages":
      return cv.languages.some((l) => (l.name || "").trim());
    case "achievements":
      return cv.achievements.some((a) => (a || "").trim());
    case "certifications":
      return cv.certifications.some(
        (c) => (c.name || "").trim() || (c.issuer || "").trim(),
      );
    case "custom":
      return cv.customSections.some(
        (s) => (s.title || "").trim() || s.bullets.some((b) => (b || "").trim()),
      );
    default:
      return false;
  }
}

export function isHidden(cv: GeneratedCV, key: SectionKey): boolean {
  return cv.hiddenSections.includes(key);
}

/** True when a section is both user-visible AND has content worth rendering. */
export function shouldRender(cv: GeneratedCV, key: SectionKey): boolean {
  return !isHidden(cv, key) && hasContent(cv, key);
}
