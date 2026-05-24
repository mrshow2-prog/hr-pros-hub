import type { GeneratedCV, TemplateId } from "@/contexts/CVBuilderContext";
import {
  contactItems, isHidden, periodOf, visibleBullets,
} from "@/components/cv-builder/pdf/shared";
import { getTemplateConfig } from "@/lib/cvTemplateConfig";
import {
  createBuilder, urlToDataUrl, textHeightMm, ptToMm,
  INK, SUBINK, MUTED, HAIRLINE, PAGE_W,
} from "./core";

/* ============================================================
 * Per-template pdfme exporters that mirror the original
 * react-pdf templates (PdfModern / PdfClassic / PdfExecutive /
 * PdfCompact / PdfSkillsFirst).
 * ============================================================ */

interface Ctx {
  cv: GeneratedCV;
  primary: string;
  b: ReturnType<typeof createBuilder>;
}

/* ------------ shared building blocks ------------ */

function periodRow(
  ctx: Ctx,
  left: string,
  right: string,
  opts: { leftFs: number; rightFs?: number; leftColor?: string; rightColor?: string; spaceAfter?: number },
) {
  const { b } = ctx;
  const leftFs = opts.leftFs;
  const rightFs = opts.rightFs ?? 8.8;
  const periodW = 50;
  const leftW = b.contentW - periodW;
  const h = Math.max(ptToMm(leftFs) * 1.25, textHeightMm(left, leftW, leftFs, 1.25));
  b.ensure(h + 1);
  const py = b.cursorY;
  b.addText({ value: left, x: b.margin, y: py, width: leftW, fontSize: leftFs, color: opts.leftColor ?? INK });
  if (right) {
    b.addText({
      value: right, x: b.margin + leftW, y: py, width: periodW,
      fontSize: rightFs, color: opts.rightColor ?? MUTED, align: "right",
    });
  }
  b.cursorY = py + h + (opts.spaceAfter ?? 0.5);
}

function bullet(ctx: Ctx, glyph: string, text: string, opts: { fs?: number; glyphColor?: string; textColor?: string; lh?: number } = {}) {
  const { b } = ctx;
  const fs = opts.fs ?? 9.7;
  const lh = opts.lh ?? 1.5;
  const gw = 4.2;
  const tw = b.contentW - gw;
  const h = Math.max(ptToMm(fs) * lh, textHeightMm(text, tw, fs, lh));
  b.ensure(h + 0.5);
  const py = b.cursorY;
  b.addText({ value: glyph, x: b.margin, y: py, width: gw, fontSize: fs, color: opts.glyphColor ?? ctx.primary, lineHeight: lh });
  b.addText({ value: text, x: b.margin + gw, y: py, width: tw, fontSize: fs, color: opts.textColor ?? SUBINK, lineHeight: lh });
  b.cursorY = py + h + 0.8;
}

function contactLine(cv: GeneratedCV) {
  const items = contactItems(cv);
  return items.join("   ·   ");
}

/* ------------ MODERN ------------ */
async function buildModern(cv: GeneratedCV, photoUrl: string | null): Promise<ReturnType<typeof createBuilder>> {
  const cfg = getTemplateConfig("modern");
  const b = createBuilder({ margin: 16 });
  const primary = cfg.primaryColor;
  const ctx: Ctx = { cv, primary, b };

  // ----- Header -----
  if (!isHidden(cv, "contact")) {
    const photoSize = 24;
    const photoData = photoUrl ? await urlToDataUrl(photoUrl) : null;
    const hasPhoto = !!photoData && cfg.photoStyle !== "none";
    const headerY = b.cursorY;
    const textX = hasPhoto ? b.margin + photoSize + 6 : b.margin;
    const textW = hasPhoto ? b.contentW - photoSize - 6 : b.contentW;

    if (hasPhoto) b.addImage({ x: b.margin, y: headerY, w: photoSize, h: photoSize, data: photoData! });

    b.addText({ value: cv.contact.name || "Your name", x: textX, y: headerY, width: textW, fontSize: 22, color: INK, lineHeight: 1.1, letterSpacing: 0.2 });
    let hy = headerY + ptToMm(22) * 1.1 + 1;
    if (cv.contact.jobTitle) {
      b.addText({ value: cv.contact.jobTitle, x: textX, y: hy, width: textW, fontSize: 11, color: primary });
      hy += ptToMm(11) * 1.25 + 1;
    }
    const cText = contactLine(cv);
    if (cText) {
      const ch = textHeightMm(cText, textW, 8.5, 1.4);
      b.addText({ value: cText, x: textX, y: hy + 1.5, width: textW, fontSize: 8.5, color: MUTED, lineHeight: 1.4 });
      hy += ch + 1.5;
    }
    b.cursorY = Math.max(hy, headerY + (hasPhoto ? photoSize : 0)) + 4;
  }

  // ----- helpers -----
  const sectionTitle = (label: string) => {
    b.ensure(8);
    b.addLine({ x: b.margin, y: b.cursorY + 0.5, width: 1.4, height: 5.2, color: primary });
    b.addText({
      value: label, x: b.margin + 3.5, width: b.contentW - 3.5,
      fontSize: 10.5, color: INK, uppercase: true, letterSpacing: 1.1, spaceAfter: 3,
    });
  };

  // ----- Summary -----
  if (!isHidden(cv, "summary") && cv.summary) {
    sectionTitle("Professional Summary");
    b.addText({ value: cv.summary, fontSize: 9.5, color: SUBINK, lineHeight: 1.55, spaceAfter: 4 });
  }

  // ----- Experience -----
  if (!isHidden(cv, "experience") && cv.experience.length > 0) {
    sectionTitle("Work Experience");
    for (const exp of cv.experience) {
      periodRow(ctx, exp.role || "", periodOf(exp), { leftFs: 10.5 });
      const comp = [exp.company, exp.location].filter(Boolean).join(" · ");
      if (comp) b.addText({ value: comp, fontSize: 9.5, color: primary, spaceAfter: 1.5 });
      for (const bul of visibleBullets(exp)) bullet(ctx, "•", bul.rewrite || bul.original, { fs: 9.2 });
      b.cursorY += 2;
    }
  }

  // ----- Education -----
  if (!isHidden(cv, "education") && cv.education.length > 0) {
    sectionTitle("Education");
    for (const ed of cv.education) {
      periodRow(ctx, ed.qualification, ed.period, { leftFs: 10 });
      if (ed.institution) b.addText({ value: ed.institution, fontSize: 9.5, color: primary, spaceAfter: 3 });
    }
  }

  // ----- Skills (2-column grid with • bullet) -----
  if (!isHidden(cv, "skills") && cv.skills.length > 0) {
    sectionTitle("Skills & Competencies");
    renderTwoColList(b, primary, cv.skills);
  }

  // ----- Competencies -----
  if (!isHidden(cv, "competencies") && cv.competencyClusters?.length) {
    sectionTitle("Core Competencies");
    for (const cl of cv.competencyClusters) {
      b.addText({ value: cl.title, fontSize: 10, color: INK, spaceAfter: 0.5 });
      b.addText({ value: (cl.items ?? []).join(" · "), fontSize: 9.5, color: SUBINK, lineHeight: 1.5, spaceAfter: 3 });
    }
  }

  // ----- Languages -----
  if (!isHidden(cv, "languages") && cv.languages.length > 0) {
    sectionTitle("Languages");
    b.addText({
      value: cv.languages.map((l) => l.level?.trim() ? `${l.name} (${l.level.trim()})` : l.name).join("   ·   "),
      fontSize: 9.5, color: SUBINK, spaceAfter: 2,
    });
  }

  return b;
}

/* Helper: two-column bulleted skill list */
function renderTwoColList(b: ReturnType<typeof createBuilder>, glyphColor: string, items: string[]) {
  const colW = (b.contentW - 6) / 2;
  const gw = 3.2;
  const tw = colW - gw;
  const fs = 9.6;
  const lh = 1.45;
  for (let i = 0; i < items.length; i += 2) {
    const left = items[i];
    const right = items[i + 1];
    const lh1 = textHeightMm(left, tw, fs, lh);
    const lh2 = right ? textHeightMm(right, tw, fs, lh) : 0;
    const rowH = Math.max(lh1, lh2, ptToMm(fs) * lh);
    b.ensure(rowH + 0.5);
    const py = b.cursorY;
    b.addText({ value: "•", x: b.margin, y: py, width: gw, fontSize: fs, color: glyphColor });
    b.addText({ value: left, x: b.margin + gw, y: py, width: tw, fontSize: fs, color: SUBINK, lineHeight: lh });
    if (right) {
      b.addText({ value: "•", x: b.margin + colW + 6, y: py, width: gw, fontSize: fs, color: glyphColor });
      b.addText({ value: right, x: b.margin + colW + 6 + gw, y: py, width: tw, fontSize: fs, color: SUBINK, lineHeight: lh });
    }
    b.cursorY = py + rowH + 0.8;
  }
  b.cursorY += 2;
}

/* ------------ CLASSIC ------------ */
async function buildClassic(cv: GeneratedCV, photoUrl: string | null) {
  const cfg = getTemplateConfig("classic");
  const b = createBuilder({ margin: 17 });
  const primary = cfg.primaryColor;
  const ctx: Ctx = { cv, primary, b };

  // Header with thick INK bottom border
  if (!isHidden(cv, "contact")) {
    const photoSize = 22;
    const photoData = photoUrl ? await urlToDataUrl(photoUrl) : null;
    const hasPhoto = !!photoData && cfg.photoStyle !== "none";
    const hy0 = b.cursorY;
    const textX = hasPhoto ? b.margin + photoSize + 6 : b.margin;
    const textW = hasPhoto ? b.contentW - photoSize - 6 : b.contentW;
    if (hasPhoto) b.addImage({ x: b.margin, y: hy0, w: photoSize, h: photoSize, data: photoData! });

    b.addText({ value: cv.contact.name || "Your name", x: textX, y: hy0, width: textW, fontSize: 24, color: INK, lineHeight: 1.05 });
    let hy = hy0 + ptToMm(24) * 1.05 + 1;
    if (cv.contact.jobTitle) {
      b.addText({ value: cv.contact.jobTitle, x: textX, y: hy, width: textW, fontSize: 11, color: primary });
      hy += ptToMm(11) * 1.25 + 1;
    }
    const cText = contactLine(cv);
    if (cText) {
      const ch = textHeightMm(cText, textW, 8.5, 1.4);
      b.addText({ value: cText, x: textX, y: hy + 1.5, width: textW, fontSize: 8.5, color: MUTED, lineHeight: 1.4 });
      hy += ch + 1.5;
    }
    const endY = Math.max(hy, hy0 + (hasPhoto ? photoSize : 0)) + 3;
    b.addLine({ x: b.margin, y: endY, width: b.contentW, height: 0.6, color: INK });
    b.cursorY = endY + 4;
  }

  const sectionTitle = (label: string) => {
    b.ensure(10);
    b.addText({ value: label, fontSize: 11, color: INK, uppercase: true, letterSpacing: 0.9, spaceAfter: 1.2 });
    b.addLine({ x: b.margin, y: b.cursorY, width: b.contentW, height: 0.3, color: "#9ca3af" });
    b.cursorY += 2.5;
  };

  if (!isHidden(cv, "summary") && cv.summary) {
    sectionTitle("Professional Summary");
    b.addText({ value: cv.summary, fontSize: 9.8, color: SUBINK, lineHeight: 1.55, spaceAfter: 4 });
  }
  if (!isHidden(cv, "experience") && cv.experience.length > 0) {
    sectionTitle("Work Experience");
    for (const exp of cv.experience) {
      periodRow(ctx, exp.role || "", periodOf(exp), { leftFs: 11 });
      const comp = [exp.company, exp.location].filter(Boolean).join(" · ");
      if (comp) b.addText({ value: comp, fontSize: 9.8, color: primary, spaceAfter: 1.5 });
      for (const bul of visibleBullets(exp)) bullet(ctx, "•", bul.rewrite || bul.original, { fs: 9.5 });
      b.cursorY += 1.5;
    }
  }
  if (!isHidden(cv, "education") && cv.education.length > 0) {
    sectionTitle("Education");
    for (const ed of cv.education) {
      periodRow(ctx, ed.qualification, ed.period, { leftFs: 10 });
      if (ed.institution) b.addText({ value: ed.institution, fontSize: 9.8, color: primary, spaceAfter: 3 });
    }
  }
  if (!isHidden(cv, "skills") && cv.skills.length > 0) {
    sectionTitle("Skills & Competencies");
    renderTwoColList(b, primary, cv.skills);
  }
  if (!isHidden(cv, "languages") && cv.languages.length > 0) {
    sectionTitle("Languages");
    b.addText({
      value: cv.languages.map((l) => l.level?.trim() ? `${l.name} (${l.level.trim()})` : l.name).join(" · "),
      fontSize: 9.8, color: SUBINK, spaceAfter: 2,
    });
  }
  return b;
}

/* ------------ EXECUTIVE ------------ */
async function buildExecutive(cv: GeneratedCV, photoUrl: string | null) {
  const cfg = getTemplateConfig("executive");
  const b = createBuilder({ margin: 19 });
  const primary = cfg.primaryColor;
  const ctx: Ctx = { cv, primary, b };

  // Header: photo on RIGHT
  if (!isHidden(cv, "contact")) {
    const photoSize = 26;
    const photoData = photoUrl ? await urlToDataUrl(photoUrl) : null;
    const hasPhoto = !!photoData && cfg.photoStyle !== "none";
    const hy0 = b.cursorY;
    const textW = hasPhoto ? b.contentW - photoSize - 8 : b.contentW;

    if (hasPhoto) b.addImage({ x: b.margin + b.contentW - photoSize, y: hy0, w: photoSize, h: photoSize, data: photoData! });

    b.addText({ value: cv.contact.name || "Your name", x: b.margin, y: hy0, width: textW, fontSize: 26, color: INK, lineHeight: 1.05, letterSpacing: -0.2 });
    let hy = hy0 + ptToMm(26) * 1.05 + 1.5;
    if (cv.contact.jobTitle) {
      b.addText({ value: cv.contact.jobTitle, x: b.margin, y: hy, width: textW, fontSize: 12, color: primary });
      hy += ptToMm(12) * 1.25 + 1;
    }
    const cText = contactLine(cv);
    if (cText) {
      const ch = textHeightMm(cText, textW, 8.5, 1.45);
      b.addText({ value: cText, x: b.margin, y: hy + 2, width: textW, fontSize: 8.5, color: MUTED, lineHeight: 1.45 });
      hy += ch + 2;
    }
    b.cursorY = Math.max(hy, hy0 + (hasPhoto ? photoSize : 0)) + 6;
  }

  const sectionTitle = (label: string) => {
    b.ensure(10);
    b.addText({ value: label, fontSize: 12, color: INK, uppercase: true, letterSpacing: 1.3, spaceAfter: 1.2 });
    b.addLine({ x: b.margin, y: b.cursorY, width: b.contentW, height: 0.4, color: primary });
    b.cursorY += 3;
  };

  if (!isHidden(cv, "summary") && cv.summary) {
    sectionTitle("Executive Summary");
    // Quote style: left bar + indent
    const fs = 10;
    const lh = 1.6;
    const indent = 4.5;
    const w = b.contentW - indent;
    const h = textHeightMm(cv.summary, w, fs, lh);
    b.ensure(h + 1);
    const py = b.cursorY;
    b.addLine({ x: b.margin, y: py, width: 0.8, height: h, color: primary });
    b.addText({ value: cv.summary, x: b.margin + indent, y: py, width: w, fontSize: fs, color: SUBINK, lineHeight: lh });
    b.cursorY = py + h + 4;
  }

  if (!isHidden(cv, "experience") && cv.experience.length > 0) {
    sectionTitle("Professional Experience");
    for (const exp of cv.experience) {
      periodRow(ctx, exp.role || "", periodOf(exp), { leftFs: 11.5 });
      const comp = [exp.company, exp.location].filter(Boolean).join(" · ");
      if (comp) b.addText({ value: comp, fontSize: 10, color: primary, spaceAfter: 2 });
      for (const bul of visibleBullets(exp)) bullet(ctx, "▸", bul.rewrite || bul.original, { fs: 9.8, lh: 1.55 });
      b.cursorY += 2;
    }
  }

  if (!isHidden(cv, "education") && cv.education.length > 0) {
    sectionTitle("Education");
    for (const ed of cv.education) {
      periodRow(ctx, ed.qualification, ed.period, { leftFs: 10.5 });
      if (ed.institution) b.addText({ value: ed.institution, fontSize: 10, color: primary, spaceAfter: 3 });
    }
  }

  // Skills as 2-col plain text (no bullets)
  if (!isHidden(cv, "skills") && cv.skills.length > 0) {
    sectionTitle("Core Competencies");
    const colW = (b.contentW - 6) / 2;
    const fs = 10;
    const lh = 1.5;
    for (let i = 0; i < cv.skills.length; i += 2) {
      const l = cv.skills[i]; const r = cv.skills[i + 1];
      const h = Math.max(textHeightMm(l, colW, fs, lh), r ? textHeightMm(r, colW, fs, lh) : 0, ptToMm(fs) * lh);
      b.ensure(h + 0.5);
      const py = b.cursorY;
      b.addText({ value: l, x: b.margin, y: py, width: colW, fontSize: fs, color: SUBINK, lineHeight: lh });
      if (r) b.addText({ value: r, x: b.margin + colW + 6, y: py, width: colW, fontSize: fs, color: SUBINK, lineHeight: lh });
      b.cursorY = py + h + 0.8;
    }
    b.cursorY += 2;
  }

  if (!isHidden(cv, "languages") && cv.languages.length > 0) {
    sectionTitle("Languages");
    b.addText({
      value: cv.languages.map((l) => l.level?.trim() ? `${l.name} (${l.level.trim()})` : l.name).join("   ·   "),
      fontSize: 10, color: SUBINK, spaceAfter: 2,
    });
  }
  return b;
}

/* ------------ COMPACT ------------ */
async function buildCompact(cv: GeneratedCV, photoUrl: string | null) {
  const cfg = getTemplateConfig("compact");
  const b = createBuilder({ margin: 14 });
  const primary = cfg.primaryColor;
  const ctx: Ctx = { cv, primary, b };

  // Header: name+title (left, with optional photo) | contact stack (right)
  if (!isHidden(cv, "contact")) {
    const photoSize = 20;
    const photoData = photoUrl ? await urlToDataUrl(photoUrl) : null;
    const hasPhoto = !!photoData && cfg.photoStyle !== "none";
    const hy0 = b.cursorY;
    const rightW = 70;
    const leftW = b.contentW - rightW - 6;
    const nameX = hasPhoto ? b.margin + photoSize + 5 : b.margin;
    const nameW = hasPhoto ? leftW - photoSize - 5 : leftW;

    if (hasPhoto) b.addImage({ x: b.margin, y: hy0, w: photoSize, h: photoSize, data: photoData! });
    b.addText({ value: cv.contact.name || "Your name", x: nameX, y: hy0, width: nameW, fontSize: 18, color: INK, lineHeight: 1.05 });
    if (cv.contact.jobTitle) {
      b.addText({
        value: cv.contact.jobTitle, x: nameX, y: hy0 + ptToMm(18) * 1.05 + 1, width: nameW,
        fontSize: 10.5, color: primary,
      });
    }
    // contact right column (stacked, right-aligned)
    const rows = [cv.contact.location, cv.contact.phone, cv.contact.email, cv.contact.linkedinUrl].filter(Boolean) as string[];
    const rfs = 8.5;
    let ry = hy0;
    for (const r of rows) {
      const rh = textHeightMm(r, rightW, rfs, 1.4);
      b.addText({ value: r, x: b.margin + b.contentW - rightW, y: ry, width: rightW, fontSize: rfs, color: MUTED, align: "right", lineHeight: 1.4 });
      ry += rh;
    }
    const leftBottom = hy0 + Math.max(hasPhoto ? photoSize : 0, ptToMm(18) * 1.05 + 1 + (cv.contact.jobTitle ? ptToMm(10.5) * 1.25 : 0));
    const endY = Math.max(leftBottom, ry) + 3;
    b.addLine({ x: b.margin, y: endY, width: b.contentW, height: 0.6, color: INK });
    b.cursorY = endY + 4;
  }

  const sectionTitle = (label: string, opts: { small?: boolean; x?: number; width?: number } = {}) => {
    const fs = opts.small ? 10 : 10.5;
    b.ensure(8);
    b.addText({
      value: label, x: opts.x, width: opts.width,
      fontSize: fs, color: INK, uppercase: true, letterSpacing: 0.9, spaceAfter: 1.2,
    });
    const w = opts.width ?? b.contentW;
    const x = opts.x ?? b.margin;
    b.addLine({ x, y: b.cursorY, width: w, height: 0.4, color: primary });
    b.cursorY += 2.5;
  };

  /* Two-column row: summary (62%) | skills + languages (38%) */
  const ratio = 0.62;
  const gap = 6;
  const leftColW = (b.contentW - gap) * ratio;
  const rightColW = b.contentW - gap - leftColW;
  const leftX = b.margin;
  const rightX = b.margin + leftColW + gap;

  // Render manually so each column has independent y
  const topY = b.cursorY;
  // LEFT — Summary
  let lY = topY;
  if (!isHidden(cv, "summary") && cv.summary) {
    // section title at custom y
    b.addText({
      value: "Summary", x: leftX, y: lY, width: leftColW,
      fontSize: 10.5, color: INK, uppercase: true, letterSpacing: 0.9,
    });
    lY += ptToMm(10.5) * 1.25 + 1.2;
    b.addLine({ x: leftX, y: lY, width: leftColW, height: 0.4, color: primary });
    lY += 2.5;
    const fs = 9.8;
    const lh = 1.55;
    const sh = textHeightMm(cv.summary, leftColW, fs, lh);
    b.addText({ value: cv.summary, x: leftX, y: lY, width: leftColW, fontSize: fs, color: SUBINK, lineHeight: lh });
    lY += sh + 4;
  }
  // RIGHT — Skills + Languages
  let rY = topY;
  if (!isHidden(cv, "skills") && cv.skills.length > 0) {
    b.addText({ value: "Skills", x: rightX, y: rY, width: rightColW, fontSize: 10, color: INK, uppercase: true, letterSpacing: 0.9 });
    rY += ptToMm(10) * 1.25 + 1.2;
    b.addLine({ x: rightX, y: rY, width: rightColW, height: 0.4, color: primary });
    rY += 2.5;
    const fs = 9.2;
    const lh = 1.45;
    const gw = 3.2;
    for (const sk of cv.skills) {
      const tw = rightColW - gw;
      const h = Math.max(ptToMm(fs) * lh, textHeightMm(sk, tw, fs, lh));
      b.addText({ value: "•", x: rightX, y: rY, width: gw, fontSize: fs, color: primary });
      b.addText({ value: sk, x: rightX + gw, y: rY, width: tw, fontSize: fs, color: SUBINK, lineHeight: lh });
      rY += h + 0.6;
    }
    rY += 3;
  }
  if (!isHidden(cv, "languages") && cv.languages.length > 0) {
    b.addText({ value: "Languages", x: rightX, y: rY, width: rightColW, fontSize: 10, color: INK, uppercase: true, letterSpacing: 0.9 });
    rY += ptToMm(10) * 1.25 + 1.2;
    b.addLine({ x: rightX, y: rY, width: rightColW, height: 0.4, color: primary });
    rY += 2.5;
    for (const l of cv.languages) {
      b.addText({ value: l.name, x: rightX, y: rY, width: rightColW, fontSize: 9.4, color: INK });
      rY += ptToMm(9.4) * 1.2;
      if (l.level?.trim()) {
        b.addText({ value: l.level.trim(), x: rightX, y: rY, width: rightColW, fontSize: 8.6, color: MUTED });
        rY += ptToMm(8.6) * 1.25;
      }
      rY += 1.2;
    }
  }
  b.cursorY = Math.max(lY, rY) + 4;

  // Full-width Experience
  if (!isHidden(cv, "experience") && cv.experience.length > 0) {
    sectionTitle("Work Experience");
    for (const exp of cv.experience) {
      periodRow(ctx, exp.role || "", periodOf(exp), { leftFs: 10.5 });
      const comp = [exp.company, exp.location].filter(Boolean).join(" · ");
      if (comp) b.addText({ value: comp, fontSize: 9.8, color: primary, spaceAfter: 1.5 });
      for (const bul of visibleBullets(exp)) bullet(ctx, "•", bul.rewrite || bul.original, { fs: 9.5 });
      b.cursorY += 1.5;
    }
  }
  if (!isHidden(cv, "education") && cv.education.length > 0) {
    sectionTitle("Education");
    for (const ed of cv.education) {
      periodRow(ctx, ed.qualification, ed.period, { leftFs: 10 });
      if (ed.institution) b.addText({ value: ed.institution, fontSize: 9.8, color: primary, spaceAfter: 3 });
    }
  }
  return b;
}

/* ------------ SKILLS-FIRST ------------ */
async function buildSkillsFirst(cv: GeneratedCV, photoUrl: string | null) {
  const cfg = getTemplateConfig("skills-first");
  const b = createBuilder({ margin: 17 });
  const primary = cfg.primaryColor;
  const ctx: Ctx = { cv, primary, b };

  // Header
  if (!isHidden(cv, "contact")) {
    const photoSize = 24;
    const photoData = photoUrl ? await urlToDataUrl(photoUrl) : null;
    const hasPhoto = !!photoData && cfg.photoStyle !== "none";
    const hy0 = b.cursorY;
    const textX = hasPhoto ? b.margin + photoSize + 6 : b.margin;
    const textW = hasPhoto ? b.contentW - photoSize - 6 : b.contentW;

    if (hasPhoto) b.addImage({ x: b.margin, y: hy0, w: photoSize, h: photoSize, data: photoData! });
    b.addText({ value: cv.contact.name || "Your name", x: textX, y: hy0, width: textW, fontSize: 24, color: INK, lineHeight: 1.05 });
    let hy = hy0 + ptToMm(24) * 1.05 + 1;
    if (cv.contact.jobTitle) {
      b.addText({ value: cv.contact.jobTitle, x: textX, y: hy, width: textW, fontSize: 11, color: primary });
      hy += ptToMm(11) * 1.25 + 1;
    }
    const cText = contactLine(cv);
    if (cText) {
      const ch = textHeightMm(cText, textW, 8.5, 1.4);
      b.addText({ value: cText, x: textX, y: hy + 1.5, width: textW, fontSize: 8.5, color: MUTED, lineHeight: 1.4 });
      hy += ch + 1.5;
    }
    const endY = Math.max(hy, hy0 + (hasPhoto ? photoSize : 0)) + 3;
    b.addLine({ x: b.margin, y: endY, width: b.contentW, height: 0.3, color: HAIRLINE });
    b.cursorY = endY + 4;
  }

  const sectionTitle = (label: string) => {
    b.ensure(8);
    b.addText({ value: label, fontSize: 11.5, color: INK, spaceAfter: 2.5 });
  };

  if (!isHidden(cv, "summary") && cv.summary) {
    sectionTitle("Professional Summary");
    b.addText({ value: cv.summary, fontSize: 9.8, color: SUBINK, lineHeight: 1.55, spaceAfter: 5 });
  }

  // Skills as chips BEFORE experience
  if (!isHidden(cv, "skills") && cv.skills.length > 0) {
    sectionTitle("Skills & Competencies");
    renderChips(b, cv.skills, primary);
    b.cursorY += 3;
  }

  // Experience with hairline separators between items
  if (!isHidden(cv, "experience") && cv.experience.length > 0) {
    sectionTitle("Work Experience");
    cv.experience.forEach((exp, idx) => {
      periodRow(ctx, exp.role || "", periodOf(exp), { leftFs: 11 });
      const comp = [exp.company, exp.location].filter(Boolean).join(" · ");
      if (comp) b.addText({ value: comp, fontSize: 9.8, color: primary, spaceAfter: 1.5 });
      for (const bul of visibleBullets(exp)) bullet(ctx, "→", bul.rewrite || bul.original, { fs: 9.5, glyphColor: primary });
      b.cursorY += 1.5;
      if (idx < cv.experience.length - 1) {
        b.addLine({ x: b.margin, y: b.cursorY, width: b.contentW, height: 0.3, color: HAIRLINE });
        b.cursorY += 3;
      }
    });
  }

  if (!isHidden(cv, "education") && cv.education.length > 0) {
    sectionTitle("Education");
    for (const ed of cv.education) {
      periodRow(ctx, ed.qualification, ed.period, { leftFs: 10 });
      if (ed.institution) b.addText({ value: ed.institution, fontSize: 9.8, color: primary, spaceAfter: 3 });
    }
  }
  if (!isHidden(cv, "languages") && cv.languages.length > 0) {
    sectionTitle("Languages");
    b.addText({
      value: cv.languages.map((l) => l.level?.trim() ? `${l.name} (${l.level.trim()})` : l.name).join(" · "),
      fontSize: 9.8, color: SUBINK, spaceAfter: 2,
    });
  }
  return b;
}

function renderChips(b: ReturnType<typeof createBuilder>, items: string[], primary: string) {
  const fs = 9;
  const padX = 2.6;
  const padY = 1.4;
  const lh = 1.2;
  const chipH = ptToMm(fs) * lh + padY * 2;
  const gap = 1.8;
  const charW = (fs * 0.50) / 2.8346;
  let x = b.margin;
  let y = b.cursorY;
  const maxX = b.margin + b.contentW;
  for (const it of items) {
    const w = it.length * charW + padX * 2;
    if (x + w > maxX) {
      x = b.margin;
      y += chipH + gap;
    }
    b.ensure(chipH);
    if (b.cursorY > y) y = b.cursorY;
    b.addRect({ x, y, width: w, height: chipH, color: "#f1f5f4", borderColor: HAIRLINE, borderWidth: 0.4, radius: chipH / 2 });
    b.addText({ value: it, x: x + padX, y: y + padY * 0.6, width: w - padX * 2, fontSize: fs, color: INK, lineHeight: lh });
    x += w + gap;
  }
  b.cursorY = y + chipH + 1;
}

/* ============================================================
 * Public entry point — routes to the right builder.
 * ============================================================ */
export async function exportCvPdfme(
  cv: GeneratedCV,
  photoUrl: string | null,
  templateId: TemplateId,
  fileName: string,
) {
  let b: ReturnType<typeof createBuilder>;
  switch (templateId) {
    case "classic":      b = await buildClassic(cv, photoUrl); break;
    case "executive":    b = await buildExecutive(cv, photoUrl); break;
    case "compact":      b = await buildCompact(cv, photoUrl); break;
    case "skills-first": b = await buildSkillsFirst(cv, photoUrl); break;
    case "modern":
    default:             b = await buildModern(cv, photoUrl);
  }
  await b.finalize(fileName);
}

// Touch a hint so PAGE_W isn't reported as unused.
void PAGE_W;
