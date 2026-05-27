import type { GeneratedCV, CVExperience, SectionKey } from "@/contexts/CVBuilderContext";

/** Strip protocol + leading "www." for compact display. */
export function stripUrlPrefix(value: string | null | undefined): string {
  if (!value) return "";
  return value.trim().replace(/^https?:\/\//i, "").replace(/^www\./i, "").replace(/\/+$/, "");
}

/** Ensure a URL has an http(s):// scheme so pdfme treats it as a valid link target. */
export function withScheme(value: string | null | undefined): string {
  if (!value) return "";
  const v = value.trim();
  if (!v) return "";
  return /^https?:\/\//i.test(v) ? v : `https://${v.replace(/^\/+/, "")}`;
}

/** Escape characters that have meaning in pdfme's inline-markdown parser. */
export function escapeMd(s: string): string {
  return (s ?? "").replace(/([\\\[\]()*_`~])/g, "\\$1");
}

/** Wrap a display label as a markdown link when uri is present. */
export function mdLink(label: string, uri: string | null | undefined): string {
  const safeLabel = escapeMd(label);
  const href = withScheme(uri || "");
  return href ? `[${safeLabel}](${href})` : safeLabel;
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

/**
 * Same items as contactItems, but URL entries are wrapped as markdown links
 * so a pdfme text schema rendered with textFormat:"inline-markdown" produces
 * a clickable URI link annotation in the exported PDF.
 *
 * Returns the joined markdown string AND the plain-text display version used
 * for width/height measurement (which must not include the URL portion).
 */
export function contactItemsMd(cv: GeneratedCV, separator = "   ·   "): { md: string; display: string } {
  const parts: { label: string; uri?: string }[] = [];
  if (cv.contact.email) parts.push({ label: cv.contact.email, uri: `mailto:${cv.contact.email}` });
  if (cv.contact.phone) parts.push({ label: cv.contact.phone });
  if (cv.contact.location) parts.push({ label: cv.contact.location });
  if (cv.contact.linkedinUrl) {
    parts.push({ label: stripUrlPrefix(cv.contact.linkedinUrl), uri: cv.contact.linkedinUrl });
  }
  if (cv.contact.website) {
    parts.push({ label: stripUrlPrefix(cv.contact.website), uri: cv.contact.website });
  }
  return {
    md: parts.map((p) => mdLink(p.label, p.uri)).join(separator),
    display: parts.map((p) => p.label).join(separator),
  };
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
