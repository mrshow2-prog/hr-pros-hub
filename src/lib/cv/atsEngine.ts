/**
 * Deterministic ATS scoring engine — pure client-side, no LLM calls.
 *
 * Runs the structured `GeneratedCV` through a battery of checks designed to
 * mirror what real ATS systems (Workday, Greenhouse, Lever, iCIMS) extract:
 * parseable contact block, dated experience, keyword coverage, bullet hygiene,
 * reading level, and page-count fit. Returns an `AtsScore` with severity-tagged
 * findings the editor can deep-link to via `jumpTo`.
 */
import type {
  GeneratedCV,
  IntentForm,
  AtsScore,
  AtsFinding,
} from "@/contexts/CVBuilderContext";
import { FUNCTION_KEYWORDS, GENERIC_KEYWORDS } from "./atsDictionary";

const ACTION_VERBS = new Set([
  "achieved", "accelerated", "architected", "automated", "boosted", "built",
  "captured", "championed", "closed", "coached", "consolidated", "converted",
  "created", "cut", "delivered", "designed", "developed", "directed", "drove",
  "doubled", "earned", "engineered", "established", "executed", "expanded",
  "generated", "grew", "halved", "headed", "implemented", "improved",
  "increased", "initiated", "introduced", "launched", "led", "managed",
  "mentored", "migrated", "negotiated", "optimized", "orchestrated",
  "organized", "overhauled", "owned", "pioneered", "produced", "rebuilt",
  "reduced", "redesigned", "refactored", "restructured", "saved", "scaled",
  "secured", "shipped", "spearheaded", "standardized", "streamlined",
  "structured", "supervised", "tripled", "trained", "transformed",
  "translated", "unified", "upgraded",
]);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+()\-\s\d./]{7,}$/;
// Accept e.g. "Jan 2020", "January 2020", "2020", "Present"
const DATE_RE = /^(present|now|current|\d{4}|(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+\d{4})$/i;

const wordCount = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;
const syllableCount = (word: string): number => {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (w.length <= 3) return 1;
  const cleaned = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "")
                   .replace(/^y/, "");
  const m = cleaned.match(/[aeiouy]{1,2}/g);
  return Math.max(1, m ? m.length : 1);
};

/** Flesch reading ease — higher is more readable. 60-70 ≈ plain English. */
function fleschReadingEase(text: string): number {
  const sentences = (text.match(/[.!?]+/g) ?? []).length || 1;
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return 100;
  const syllables = words.reduce((s, w) => s + syllableCount(w), 0);
  return Math.max(
    0,
    Math.min(100, 206.835 - 1.015 * (words.length / sentences) - 84.6 * (syllables / words.length)),
  );
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+#./\s-]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1);
}

function cvToFullText(cv: GeneratedCV): string {
  const parts: string[] = [];
  parts.push(cv.summary);
  for (const e of cv.experience) {
    parts.push(`${e.role} ${e.company} ${e.location ?? ""}`);
    for (const b of e.bullets) parts.push(b.rewrite);
  }
  parts.push(cv.skills.join(" "));
  for (const c of cv.competencyClusters) parts.push(`${c.title} ${c.items.join(" ")}`);
  for (const ed of cv.education) parts.push(`${ed.qualification} ${ed.institution}`);
  return parts.join(" \n ");
}

function pickKeywords(intent: IntentForm): string[] {
  const fa = (intent.functionArea ?? "").toLowerCase().trim();
  const fromDict = FUNCTION_KEYWORDS[fa] ?? [];
  const fromRoles = intent.targetRoles.flatMap((r) =>
    tokenize(r).filter((t) => t.length > 2),
  );
  const merged = [...fromDict, ...fromRoles, ...GENERIC_KEYWORDS];
  return Array.from(new Set(merged.map((k) => k.toLowerCase())));
}

function parseDateYear(s: string | undefined | null): number | null {
  if (!s) return null;
  const t = s.trim().toLowerCase();
  if (/^(present|now|current)$/.test(t)) return new Date().getFullYear();
  const m = t.match(/(19|20)\d{2}/);
  return m ? Number(m[0]) : null;
}

function id(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

export interface AtsResult extends AtsScore {
  findings: AtsFinding[];
  sectionScores: { label: string; score: number }[];
}

/**
 * Score a CV against the user's intent. Pure function — call freely on every
 * edit if you want live scoring.
 */
export function scoreCv(cv: GeneratedCV, intent: IntentForm): AtsResult {
  const findings: AtsFinding[] = [];
  const formatting: { label: string; pass: boolean }[] = [];
  const fullText = cvToFullText(cv);
  const tokens = tokenize(fullText);
  const tokenSet = new Set(tokens);

  // ── 1. Contact block ──────────────────────────────────────────────
  const contactChecks: Array<[keyof typeof cv.contact, RegExp, string]> = [
    ["email", EMAIL_RE, "Add a parseable email (name@domain.tld)."],
    ["phone", PHONE_RE, "Add a phone number with country code."],
  ];
  let contactPass = 0;
  for (const [field, re, fix] of contactChecks) {
    const v = cv.contact[field] as string;
    const ok = !!v && re.test(v.trim());
    if (ok) contactPass++;
    else
      findings.push({
        id: id("contact"),
        severity: "critical",
        label: `Missing or unparseable ${field}`,
        fix,
        jumpTo: { section: "contact", field },
      });
  }
  if (!cv.contact.name?.trim()) {
    findings.push({
      id: id("contact"),
      severity: "critical",
      label: "Name is missing",
      fix: "Add your full name in the contact block.",
      jumpTo: { section: "contact", field: "name" },
    });
  } else contactPass++;
  if (!cv.contact.location?.trim()) {
    findings.push({
      id: id("contact"),
      severity: "warning",
      label: "Location missing",
      fix: "Recruiters filter on location — add at least city, country.",
      jumpTo: { section: "contact", field: "location" },
    });
  }
  const contactScore = Math.round((contactPass / 3) * 100);
  formatting.push({ label: "Contact block parseable", pass: contactPass === 3 });

  // ── 2. Section presence ──────────────────────────────────────────
  const hasSummary = (cv.summary?.trim().length ?? 0) >= 80;
  const hasExperience = cv.experience.length > 0;
  const hasSkills = cv.skills.length >= 5;
  const hasEducation = cv.education.length > 0;
  formatting.push({ label: "Summary present", pass: hasSummary });
  formatting.push({ label: "Experience present", pass: hasExperience });
  formatting.push({ label: "Skills (≥5) present", pass: hasSkills });
  formatting.push({ label: "Education present", pass: hasEducation });

  if (!hasSummary)
    findings.push({
      id: id("summary"),
      severity: "warning",
      label: "Summary too short or missing",
      fix: "Aim for 3–5 sentences (80+ chars) that frame your value to the target role.",
      jumpTo: { section: "summary" },
    });
  if (!hasSkills)
    findings.push({
      id: id("skills"),
      severity: "warning",
      label: "Add at least 5 skills",
      fix: "ATS keyword filters lean heavily on the Skills section. List role-relevant hard skills.",
      jumpTo: { section: "skills" },
    });
  if (!hasEducation)
    findings.push({
      id: id("education"),
      severity: "info",
      label: "No education entries",
      fix: "Add at least one qualification, even short courses count.",
      jumpTo: { section: "education" },
    });

  // ── 3. Experience: dates + bullet hygiene ────────────────────────
  let bulletTotal = 0;
  let bulletQuantified = 0;
  let bulletActionVerb = 0;
  let bulletInRange = 0;

  for (const exp of cv.experience) {
    if (!exp.role?.trim() || !exp.company?.trim()) {
      findings.push({
        id: id("exp"),
        severity: "critical",
        label: `Experience entry missing role or company`,
        fix: "Every experience row needs a clear job title and employer.",
        jumpTo: { section: "experience", expId: exp.id },
      });
    }
    const sy = parseDateYear(exp.startDate);
    const ey = parseDateYear(exp.endDate);
    const yearNow = new Date().getFullYear();
    if (!sy || !ey) {
      findings.push({
        id: id("exp"),
        severity: "warning",
        label: `Dates unclear for ${exp.role || exp.company || "role"}`,
        fix: "Use a format like ‘Jan 2020 – Present’ so ATS parsers can extract tenure.",
        jumpTo: { section: "experience", expId: exp.id, field: "startDate" },
      });
    } else if (sy > ey || ey > yearNow + 1) {
      findings.push({
        id: id("exp"),
        severity: "warning",
        label: `Date range invalid for ${exp.role || exp.company}`,
        fix: "Start date must come before end date, and dates can’t be in the future.",
        jumpTo: { section: "experience", expId: exp.id, field: "startDate" },
      });
    }

    for (const b of exp.bullets) {
      const text = b.rewrite?.trim();
      if (!text) continue;
      bulletTotal++;
      const wc = wordCount(text);
      const inRange = wc >= 8 && wc <= 28;
      if (inRange) bulletInRange++;
      const firstWord = text.split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, "");
      const hasVerb = !!firstWord && ACTION_VERBS.has(firstWord);
      if (hasVerb) bulletActionVerb++;
      const hasNumber = /\d/.test(text);
      if (hasNumber) bulletQuantified++;

      if (!inRange) {
        findings.push({
          id: id("bul"),
          severity: wc < 6 || wc > 35 ? "warning" : "info",
          label: wc < 8 ? "Bullet too short" : "Bullet too long",
          fix: `${wc} words — aim for 8–28. Trim filler or split into two.`,
          jumpTo: { section: "experience", expId: exp.id, bulletId: b.id },
        });
      }
      if (!hasVerb) {
        findings.push({
          id: id("bul"),
          severity: "info",
          label: "Bullet doesn’t start with an action verb",
          fix: "Lead with verbs like ‘Led’, ‘Reduced’, ‘Implemented’.",
          jumpTo: { section: "experience", expId: exp.id, bulletId: b.id },
        });
      }
    }
  }

  const quantPct = bulletTotal ? bulletQuantified / bulletTotal : 0;
  const verbPct = bulletTotal ? bulletActionVerb / bulletTotal : 0;
  const lenPct = bulletTotal ? bulletInRange / bulletTotal : 0;
  formatting.push({ label: "≥40% bullets quantified", pass: quantPct >= 0.4 });
  formatting.push({ label: "≥80% bullets start with action verb", pass: verbPct >= 0.8 });

  if (bulletTotal > 0 && quantPct < 0.4) {
    findings.push({
      id: id("bul"),
      severity: "warning",
      label: `Only ${Math.round(quantPct * 100)}% of bullets are quantified`,
      fix: "Add numbers, %, currency, or scale (team size, budget) to at least 40% of bullets.",
      jumpTo: { section: "experience" },
    });
  }

  // ── 4. Keyword match ─────────────────────────────────────────────
  const keywords = pickKeywords(intent);
  const matched = keywords.filter((k) => {
    if (k.includes(" ")) return fullText.toLowerCase().includes(k);
    return tokenSet.has(k);
  });
  const keywordMatch = keywords.length
    ? Math.round((matched.length / keywords.length) * 100)
    : 0;
  if (keywords.length && matched.length / keywords.length < 0.35) {
    const missing = keywords.filter((k) => !matched.includes(k)).slice(0, 8);
    findings.push({
      id: id("kw"),
      severity: "warning",
      label: `Low keyword coverage (${keywordMatch}%)`,
      fix: `Weave in role-relevant terms where genuine. Missing high-value terms: ${missing.join(", ")}.`,
      jumpTo: { section: "skills" },
    });
  }

  // ── 5. Readability ────────────────────────────────────────────────
  const readingEase = fleschReadingEase(fullText);
  // Normalize: 50–80 is the sweet spot for CVs.
  const readability = Math.round(
    Math.max(
      0,
      Math.min(100, 100 - Math.abs(readingEase - 65) * 1.5),
    ),
  );
  if (readingEase < 40) {
    findings.push({
      id: id("read"),
      severity: "info",
      label: "Dense, hard-to-read prose",
      fix: "Shorten sentences. Replace passive voice with active verbs.",
      jumpTo: { section: "summary" },
    });
  }

  // ── 6. Page-limit estimate ────────────────────────────────────────
  // Very rough: ~550 words per A4 page in a CV template.
  const totalWords = wordCount(fullText);
  const estPages = Math.max(1, Math.ceil(totalWords / 550));
  const limit = intent.pageLimit;
  if (limit && estPages > limit) {
    findings.push({
      id: id("pages"),
      severity: "warning",
      label: `Estimated ${estPages} pages — over ${limit}-page limit`,
      fix: "Tighten older roles to 2–3 bullets, drop redundant phrasing in the summary.",
    });
  }
  formatting.push({
    label: limit ? `Fits ${limit}-page limit` : "No page limit set",
    pass: !limit || estPages <= limit,
  });

  // ── Aggregate ────────────────────────────────────────────────────
  const sectionScores = [
    { label: "Contact", score: contactScore },
    { label: "Summary", score: hasSummary ? 100 : 40 },
    {
      label: "Experience",
      score: hasExperience
        ? Math.round((lenPct * 0.3 + verbPct * 0.3 + quantPct * 0.4) * 100)
        : 0,
    },
    { label: "Skills", score: hasSkills ? 100 : Math.min(80, cv.skills.length * 16) },
    { label: "Education", score: hasEducation ? 100 : 0 },
    { label: "Keywords", score: keywordMatch },
    { label: "Readability", score: readability },
  ];

  const weights = { contact: 0.1, summary: 0.1, experience: 0.25, skills: 0.15, education: 0.05, keywords: 0.2, readability: 0.15 };
  const overall = Math.round(
    sectionScores[0].score * weights.contact +
      sectionScores[1].score * weights.summary +
      sectionScores[2].score * weights.experience +
      sectionScores[3].score * weights.skills +
      sectionScores[4].score * weights.education +
      sectionScores[5].score * weights.keywords +
      sectionScores[6].score * weights.readability,
  );

  // Stable sort: critical → warning → info
  const sev = { critical: 0, warning: 1, info: 2 } as const;
  findings.sort((a, b) => sev[a.severity] - sev[b.severity]);

  return {
    overall,
    keywordMatch,
    readability,
    formatting,
    findings,
    sectionScores,
  };
}
