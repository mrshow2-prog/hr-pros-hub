/** Text case helpers used by the Draft step "Aa" toggle buttons. */

export type CaseMode = "title" | "upper" | "lower";

/** Acronyms preserved as-is when title-casing. */
const ACRONYMS = new Set([
  "HR", "CEO", "CFO", "COO", "CTO", "CIO",
  "SQL", "AI", "ML", "UX", "UI", "API",
  "B2B", "B2C", "CRM", "ERP", "KPI", "ROI",
  "SAAS", "IT", "QA", "PR", "PM", "VP",
  "USA", "UAE", "UK", "EU", "MENA",
]);

const SMALL_WORDS = new Set([
  "a", "an", "and", "as", "at", "but", "by", "for", "in", "nor", "of", "on", "or", "the", "to", "up", "yet",
]);

function titleWord(word: string, isFirst: boolean): string {
  if (!word) return word;
  // Preserve hyphenated / slashed compounds
  if (word.includes("-")) return word.split("-").map((w, i) => titleWord(w, isFirst && i === 0)).join("-");
  if (word.includes("/")) return word.split("/").map((w, i) => titleWord(w, isFirst && i === 0)).join("/");

  const bare = word.replace(/[^\p{L}\p{N}]/gu, "");
  if (ACRONYMS.has(bare.toUpperCase())) return word.replace(bare, bare.toUpperCase());

  const lower = word.toLowerCase();
  if (!isFirst && SMALL_WORDS.has(lower)) return lower;
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

export function toTitleCase(s: string): string {
  if (!s) return s;
  return s
    .split(/(\s+)/)
    .map((tok, i) => (/^\s+$/.test(tok) ? tok : titleWord(tok, i === 0)))
    .join("");
}

export const toUpper = (s: string) => (s ?? "").toUpperCase();
export const toLower = (s: string) => (s ?? "").toLowerCase();

export const nextCase = (m: CaseMode): CaseMode =>
  m === "title" ? "upper" : m === "upper" ? "lower" : "title";

export function applyCase(s: string, mode: CaseMode): string {
  if (mode === "upper") return toUpper(s);
  if (mode === "lower") return toLower(s);
  return toTitleCase(s);
}
