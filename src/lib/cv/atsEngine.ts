/**
 * Deterministic ATS scoring engine — pure client-side, no LLM calls.
 *
 * Tuned for AI-generated CVs: high baseline (a fully-drafted CV with
 * reasonable bullets should land in the 80s), findings are consolidated
 * rather than emitted per-bullet, and each issue carries either a
 * deep-link (`jumpTo`) or an automated fix hook (`autoFix`).
 */
import type {
  GeneratedCV,
  IntentForm,
  AtsScore,
  AtsFinding,
} from "@/contexts/CVBuilderContext";
import { FUNCTION_KEYWORDS, GENERIC_KEYWORDS } from "./atsDictionary";

const ACTION_VERBS = new Set([
  "achieved","accelerated","architected","authored","automated","boosted","built",
  "captured","championed","closed","coached","co-led","consolidated","converted",
  "created","cut","decreased","delivered","designed","developed","directed","drove",
  "doubled","earned","engineered","enabled","established","executed","expanded",
  "facilitated","generated","grew","guided","halved","handled","headed","hired",
  "implemented","improved","increased","initiated","instituted","introduced",
  "launched","led","leveraged","managed","mentored","migrated","modernised",
  "modernized","negotiated","onboarded","optimised","optimized","orchestrated",
  "organised","organized","overhauled","oversaw","owned","partnered","pioneered",
  "planned","presented","produced","quadrupled","ran","rebuilt","reduced",
  "redesigned","refactored","resolved","restructured","retained","revamped",
  "rolled","saved","scaled","secured","shaped","shipped","slashed","sourced",
  "spearheaded","standardised","standardized","steered","streamlined",
  "structured","supervised","supported","tripled","trained","transformed",
  "translated","unified","upgraded","won",
]);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+()\-\s\d./]{7,}$/;

const wordCount = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;
const syllableCount = (word: string): number => {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (w.length <= 3) return 1;
  const cleaned = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "").replace(/^y/, "");
  const m = cleaned.match(/[aeiouy]{1,2}/g);
  return Math.max(1, m ? m.length : 1);
};

function fleschReadingEase(text: string): number {
  const sentences = (text.match(/[.!?]+/g) ?? []).length || 1;
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return 100;
  const syllables = words.reduce((s, w) => s + syllableCount(w), 0);
  return Math.max(0, Math.min(100,
    206.835 - 1.015 * (words.length / sentences) - 84.6 * (syllables / words.length),
  ));
}

function tokenize(text: string): string[] {
  return text.toLowerCase().replace(/[^a-z0-9+#./\s-]/g, " ").split(/\s+/).filter((t) => t.length > 1);
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
  const fromRoles = intent.targetRoles.flatMap((r) => tokenize(r).filter((t) => t.length > 2));
  const merged = [...fromDict, ...fromRoles, ...GENERIC_KEYWORDS];
  return Array.from(new Set(merged.map((k) => k.toLowerCase())));
}

function parseDateYear(s: string | undefined | null): number | null {
  if (!s) return null;
  const t = s.trim().toLowerCase();
  if (/^(present|now|current|ongoing)$/.test(t)) return new Date().getFullYear();
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

export function scoreCv(cv: GeneratedCV, intent: IntentForm): AtsResult {
  const findings: AtsFinding[] = [];
  const formatting: { label: string; pass: boolean }[] = [];
  const fullText = cvToFullText(cv);
  const tokens = tokenize(fullText);
  const tokenSet = new Set(tokens);

  // ── 1. Contact block ──────────────────────────────────────────────
  let contactPass = 0;
  const total = 3;
  if (cv.contact.name?.trim()) contactPass++;
  else findings.push({
    id: id("contact"), severity: "critical", label: "Name is missing",
    fix: "Add your full name in the contact block.",
    jumpTo: { section: "contact", field: "name" },
  });
  if (cv.contact.email?.trim() && EMAIL_RE.test(cv.contact.email.trim())) contactPass++;
  else findings.push({
    id: id("contact"), severity: "critical", label: "Email missing or unparseable",
    fix: "Use a clean name@domain.tld format — ATS systems reject malformed emails.",
    jumpTo: { section: "contact", field: "email" },
  });
  if (cv.contact.phone?.trim() && PHONE_RE.test(cv.contact.phone.trim())) contactPass++;
  else findings.push({
    id: id("contact"), severity: "warning", label: "Phone number missing",
    fix: "Add a phone number including country code so recruiters can reach you.",
    jumpTo: { section: "contact", field: "phone" },
  });
  if (!cv.contact.location?.trim()) {
    findings.push({
      id: id("contact"), severity: "info", label: "Location missing",
      fix: "Add at least city, country — many ATS pipelines filter on location.",
      jumpTo: { section: "contact", field: "location" },
    });
  }
  const contactScore = Math.round((contactPass / total) * 100);
  formatting.push({ label: "Contact block parseable", pass: contactPass === total });

  // ── 2. Section presence ──────────────────────────────────────────
  const hasSummary = (cv.summary?.trim().length ?? 0) >= 80;
  const hasExperience = cv.experience.length > 0;
  const hasSkills = cv.skills.length >= 5;
  const hasEducation = cv.education.length > 0;
  formatting.push({ label: "Summary present", pass: hasSummary });
  formatting.push({ label: "Experience present", pass: hasExperience });
  formatting.push({ label: "Skills (≥5) present", pass: hasSkills });
  formatting.push({ label: "Education present", pass: hasEducation });

  if (!hasSummary) findings.push({
    id: id("summary"), severity: "warning", label: "Summary too short",
    fix: "Aim for 3–5 sentences (80+ chars) framing your value to the target role.",
    jumpTo: { section: "summary" },
    autoFix: { kind: "summary", action: "expand" },
  });
  if (!hasSkills) findings.push({
    id: id("skills"), severity: "warning",
    label: "Add at least 5 skills",
    fix: "ATS keyword filters lean heavily on the Skills section.",
    jumpTo: { section: "skills" },
  });
  if (!hasEducation) findings.push({
    id: id("education"), severity: "info", label: "No education entries",
    fix: "Add at least one qualification — even short courses count.",
    jumpTo: { section: "education" },
  });

  // ── 3. Experience: dates + bullet hygiene (consolidated) ─────────
  let bulletTotal = 0, bulletQuantified = 0, bulletActionVerb = 0, bulletInRange = 0;
  const expWithWeakBullets: { expId: string; role: string; quantPct: number; verbPct: number }[] = [];

  for (const exp of cv.experience) {
    if (!exp.role?.trim() || !exp.company?.trim()) {
      findings.push({
        id: id("exp"), severity: "critical",
        label: "Experience entry missing role or company",
        fix: "Every experience row needs a clear job title and employer.",
        jumpTo: { section: "experience", expId: exp.id },
      });
    }
    const sy = parseDateYear(exp.startDate);
    const ey = parseDateYear(exp.endDate);
    const yearNow = new Date().getFullYear();
    if (!sy || !ey) {
      findings.push({
        id: id("exp"), severity: "info",
        label: `Dates unclear for ${exp.role || exp.company || "role"}`,
        fix: "Use a format like ‘Jan 2020 – Present’ so parsers can extract tenure.",
        jumpTo: { section: "experience", expId: exp.id, field: "startDate" },
      });
    } else if (sy > ey || ey > yearNow + 1) {
      findings.push({
        id: id("exp"), severity: "warning",
        label: `Date range invalid for ${exp.role || exp.company}`,
        fix: "Start date must come before end date, and dates can’t be in the future.",
        jumpTo: { section: "experience", expId: exp.id, field: "startDate" },
      });
    }

    let expBullets = 0, expQuant = 0, expVerbs = 0;
    for (const b of exp.bullets) {
      const text = b.rewrite?.trim();
      if (!text) continue;
      bulletTotal++; expBullets++;
      const wc = wordCount(text);
      if (wc >= 8 && wc <= 32) bulletInRange++;
      const firstWord = text.split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, "");
      if (firstWord && ACTION_VERBS.has(firstWord)) { bulletActionVerb++; expVerbs++; }
      if (/\d/.test(text)) { bulletQuantified++; expQuant++; }
    }
    if (expBullets >= 2) {
      const q = expQuant / expBullets, v = expVerbs / expBullets;
      if (q < 0.34 || v < 0.6) {
        expWithWeakBullets.push({ expId: exp.id, role: exp.role || exp.company, quantPct: q, verbPct: v });
      }
    }
  }

  const quantPct = bulletTotal ? bulletQuantified / bulletTotal : 1;
  const verbPct = bulletTotal ? bulletActionVerb / bulletTotal : 1;
  const lenPct = bulletTotal ? bulletInRange / bulletTotal : 1;
  formatting.push({ label: "≥30% bullets quantified", pass: quantPct >= 0.3 });
  formatting.push({ label: "≥70% bullets start with action verb", pass: verbPct >= 0.7 });

  // Consolidated: one finding per weak experience, with auto-fix
  for (const w of expWithWeakBullets) {
    const reasons: string[] = [];
    if (w.quantPct < 0.34) reasons.push(`only ${Math.round(w.quantPct * 100)}% quantified`);
    if (w.verbPct < 0.6) reasons.push(`only ${Math.round(w.verbPct * 100)}% start with an action verb`);
    findings.push({
      id: id("expbul"), severity: "warning",
      label: `Tighten bullets for ${w.role}`,
      fix: `${reasons.join("; ")}. One click rewrites them to start with strong verbs and add measurable impact.`,
      jumpTo: { section: "experience", expId: w.expId },
      autoFix: { kind: "bullets", expId: w.expId, action: "rewrite" },
    });
  }

  // ── 4. Keyword match (lenient) ───────────────────────────────────
  const keywords = pickKeywords(intent);
  const matched = keywords.filter((k) => {
    if (k.includes(" ")) return fullText.toLowerCase().includes(k);
    return tokenSet.has(k);
  });
  const rawMatch = keywords.length ? matched.length / keywords.length : 0;
  // Curve: hitting 35% of the dictionary = 100 (most CVs won't legitimately use every term).
  const keywordMatch = Math.round(Math.min(100, (rawMatch / 0.35) * 100));
  if (keywords.length && rawMatch < 0.2) {
    const missing = keywords.filter((k) => !matched.includes(k)).slice(0, 8);
    findings.push({
      id: id("kw"), severity: "warning",
      label: `Low keyword coverage`,
      fix: `Weave in role-relevant terms where genuine. Consider: ${missing.join(", ")}.`,
      jumpTo: { section: "skills" },
    });
  }

  // ── 5. Readability ────────────────────────────────────────────────
  const readingEase = fleschReadingEase(fullText);
  const readability = Math.round(Math.max(0, Math.min(100, 100 - Math.abs(readingEase - 55) * 1.1)));
  if (readingEase < 30) {
    findings.push({
      id: id("read"), severity: "info", label: "Dense, hard-to-read prose",
      fix: "Shorten sentences and prefer active voice.",
      jumpTo: { section: "summary" },
      autoFix: { kind: "summary", action: "rewrite" },
    });
  }

  // ── 6. Page-limit estimate ────────────────────────────────────────
  const totalWords = wordCount(fullText);
  const estPages = Math.max(1, Math.ceil(totalWords / 550));
  const limit = intent.pageLimit;
  if (limit && estPages > limit) {
    findings.push({
      id: id("pages"), severity: "warning",
      label: `Estimated ${estPages} pages — over ${limit}-page limit`,
      fix: "Tighten older roles to 2–3 bullets and condense the summary.",
      autoFix: { kind: "summary", action: "condense" },
    });
  }
  formatting.push({ label: limit ? `Fits ${limit}-page limit` : "No page limit set", pass: !limit || estPages <= limit });

  // ── Aggregate (lifted baselines) ─────────────────────────────────
  const summaryScore = hasSummary ? 100 : Math.min(70, Math.round((cv.summary?.length ?? 0) / 80 * 70));
  const experienceScore = hasExperience
    ? Math.round(60 + (lenPct * 0.25 + verbPct * 0.4 + quantPct * 0.35) * 40)
    : 0;
  const skillsScore = hasSkills ? 100 : Math.min(85, cv.skills.length * 17);
  const educationScore = hasEducation ? 100 : 50;

  const sectionScores = [
    { label: "Contact", score: contactScore },
    { label: "Summary", score: summaryScore },
    { label: "Experience", score: experienceScore },
    { label: "Skills", score: skillsScore },
    { label: "Education", score: educationScore },
    { label: "Keywords", score: keywordMatch },
    { label: "Readability", score: readability },
  ];

  const weights = { contact: 0.1, summary: 0.1, experience: 0.28, skills: 0.15, education: 0.05, keywords: 0.17, readability: 0.15 };
  const overall = Math.round(
    sectionScores[0].score * weights.contact +
    sectionScores[1].score * weights.summary +
    sectionScores[2].score * weights.experience +
    sectionScores[3].score * weights.skills +
    sectionScores[4].score * weights.education +
    sectionScores[5].score * weights.keywords +
    sectionScores[6].score * weights.readability,
  );

  const sev = { critical: 0, warning: 1, info: 2 } as const;
  findings.sort((a, b) => sev[a.severity] - sev[b.severity]);

  return { overall, keywordMatch, readability, formatting, findings, sectionScores };
}
