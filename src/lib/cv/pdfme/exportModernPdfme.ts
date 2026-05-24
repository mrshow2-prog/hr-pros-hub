import type { GeneratedCV, TemplateId } from "@/contexts/CVBuilderContext";
import {
  contactItems, isHidden, periodOf, visibleBullets,
} from "./helpers";
import {
  createBuilder, urlToDataUrl, textHeightMm, ptToMm,
  INK, SUBINK, MUTED, HAIRLINE, SIENNA, PAGE_W,
  type PdfmeBuilder,
} from "./core";

/* ============================================================
 * Per-template pdfme exporters that mirror the wizard previews
 * in src/components/cv-builder/templates/Template{Modern,
 * Classic,Executive,Compact,SkillsFirst}.tsx as closely as
 * pdfme's absolute-positioning model allows.
 *
 * Colours, font sizes and accents are calibrated against those
 * previews — primary accent is the brand sienna #9c5643.
 * ============================================================ */

interface Ctx {
  cv: GeneratedCV;
  primary: string;
  b: PdfmeBuilder;
}

/* ------------ shared building blocks ------------ */

function contactLine(cv: GeneratedCV) {
  return contactItems(cv).join("   ·   ");
}

/** A role-on-left, period-on-right row that stays on one line. */
function periodRow(
  ctx: Ctx,
  left: string,
  right: string,
  opts: { leftFs: number; rightFs?: number; leftColor?: string; rightColor?: string; bold?: boolean; spaceAfter?: number },
) {
  const { b } = ctx;
  const leftFs = opts.leftFs;
  const rightFs = opts.rightFs ?? 8.8;
  const periodW = 52;
  const leftW = b.contentW - periodW - 2;
  const h = Math.max(
    ptToMm(leftFs) * 1.25,
    textHeightMm(left, leftW, leftFs, 1.25, { bold: opts.bold }),
  );
  b.ensure(h + 1);
  const py = b.cursorY;
  b.addText({
    value: left, x: b.margin, y: py, width: leftW,
    fontSize: leftFs, color: opts.leftColor ?? INK, bold: opts.bold,
  });
  if (right) {
    b.addText({
      value: right, x: b.margin + leftW + 2, y: py, width: periodW,
      fontSize: rightFs, color: opts.rightColor ?? MUTED, align: "right",
    });
  }
  b.cursorY = py + h + (opts.spaceAfter ?? 0.5);
}

function bullet(
  ctx: Ctx,
  glyph: string,
  text: string,
  opts: { fs?: number; glyphColor?: string; textColor?: string; lh?: number; glyphW?: number; glyphBold?: boolean } = {},
) {
  const { b } = ctx;
  const fs = opts.fs ?? 9.7;
  const lh = opts.lh ?? 1.55;
  const gw = opts.glyphW ?? 4.4;
  const tw = b.contentW - gw;
  const h = Math.max(ptToMm(fs) * lh, textHeightMm(text, tw, fs, lh));
  b.ensure(h + 0.6);
  const py = b.cursorY;
  b.addText({
    value: glyph, x: b.margin, y: py, width: gw,
    fontSize: fs, color: opts.glyphColor ?? ctx.primary, lineHeight: lh,
    bold: opts.glyphBold ?? true,
  });
  b.addText({
    value: text, x: b.margin + gw, y: py, width: tw,
    fontSize: fs, color: opts.textColor ?? SUBINK, lineHeight: lh,
  });
  b.cursorY = py + h + 1;
}

interface HeaderOpts {
  photoUrl: string | null;
  photoSize: number;
  photoShape: "circle" | "square" | "none";
  photoOnRight?: boolean;
  nameFs: number;
  nameBold?: boolean;
  nameLetterSpacing?: number;
  titleFs: number;
  titleColor?: string;
  titleBold?: boolean;
  contactFs?: number;
  contactColor?: string;
  /** Optional bottom rule beneath the header. */
  bottomRule?: { color: string; weight: number } | null;
  gap?: number;
  spaceAfter?: number;
}

async function renderHeader(ctx: Ctx, o: HeaderOpts) {
  const { b, cv } = ctx;
  if (isHidden(cv, "contact")) return;
  const photoData = o.photoUrl ? await urlToDataUrl(o.photoUrl) : null;
  const hasPhoto = !!photoData && o.photoShape !== "none";
  const gap = o.gap ?? 6;
  const hy0 = b.cursorY;
  const photoX = o.photoOnRight ? b.margin + b.contentW - o.photoSize : b.margin;
  const textX = o.photoOnRight
    ? b.margin
    : hasPhoto ? b.margin + o.photoSize + gap : b.margin;
  const textW = hasPhoto ? b.contentW - o.photoSize - gap : b.contentW;

  if (hasPhoto) {
    b.addImage({ x: photoX, y: hy0, w: o.photoSize, h: o.photoSize, data: photoData! });
  }

  b.addText({
    value: cv.contact.name || "Your name",
    x: textX, y: hy0, width: textW,
    fontSize: o.nameFs, color: INK, lineHeight: 1.08,
    letterSpacing: o.nameLetterSpacing, bold: o.nameBold ?? true,
  });
  let hy = hy0 + ptToMm(o.nameFs) * 1.08 + 1.4;

  if (cv.contact.jobTitle) {
    b.addText({
      value: cv.contact.jobTitle, x: textX, y: hy, width: textW,
      fontSize: o.titleFs, color: o.titleColor ?? SIENNA, bold: o.titleBold,
    });
    hy += ptToMm(o.titleFs) * 1.25 + 1.4;
  }
  const cText = contactLine(cv);
  if (cText) {
    const cFs = o.contactFs ?? 8.6;
    const ch = textHeightMm(cText, textW, cFs, 1.45);
    b.addText({
      value: cText, x: textX, y: hy + 1.4, width: textW,
      fontSize: cFs, color: o.contactColor ?? MUTED, lineHeight: 1.45,
    });
    hy += ch + 1.4;
  }
  const endY = Math.max(hy, hy0 + (hasPhoto ? o.photoSize : 0)) + (o.spaceAfter ?? 4);

  if (o.bottomRule) {
    b.addLine({
      x: b.margin, y: endY - 2, width: b.contentW,
      height: o.bottomRule.weight, color: o.bottomRule.color,
    });
  }
  b.cursorY = endY + (o.bottomRule ? 4 : 0);
}

/* ============================================================
 *  MODERN
 *  - sans display; sienna left-bar before each section title
 *  - square photo, sienna ▪ skill bullets
 * ============================================================ */
async function buildModern(cv: GeneratedCV, photoUrl: string | null) {
  const b = createBuilder({ margin: 18 });
  const ctx: Ctx = { cv, primary: SIENNA, b };

  await renderHeader(ctx, {
    photoUrl, photoSize: 28, photoShape: "square", gap: 7,
    nameFs: 26, nameLetterSpacing: -0.3, nameBold: true,
    titleFs: 12, titleColor: SIENNA,
    spaceAfter: 6,
  });

  const sectionTitle = (label: string) => {
    b.ensure(9);
    b.addLine({ x: b.margin, y: b.cursorY + 0.4, width: 1.4, height: 5, color: SIENNA });
    b.addText({
      value: label, x: b.margin + 4, width: b.contentW - 4,
      fontSize: 10.5, color: INK, uppercase: true, letterSpacing: 1.2,
      bold: true, spaceAfter: 3,
    });
  };

  if (!isHidden(cv, "summary") && cv.summary) {
    sectionTitle("Professional Summary");
    b.addText({ value: cv.summary, fontSize: 9.8, color: SUBINK, lineHeight: 1.6, spaceAfter: 5 });
  }

  if (!isHidden(cv, "experience") && cv.experience.length > 0) {
    sectionTitle("Work Experience");
    for (const exp of cv.experience) {
      periodRow(ctx, exp.role || "", periodOf(exp), { leftFs: 11, bold: true });
      const comp = [exp.company, exp.location].filter(Boolean).join(" · ");
      if (comp) b.addText({ value: comp, fontSize: 9.8, color: SIENNA, spaceAfter: 1.5 });
      for (const bul of visibleBullets(exp)) {
        bullet(ctx, "▪", bul.rewrite || bul.original, { fs: 9.4 });
      }
      b.cursorY += 2.5;
    }
  }

  if (!isHidden(cv, "education") && cv.education.length > 0) {
    sectionTitle("Education");
    for (const ed of cv.education) {
      periodRow(ctx, ed.qualification, ed.period, { leftFs: 10.5, bold: true });
      if (ed.institution) b.addText({ value: ed.institution, fontSize: 9.8, color: SIENNA, spaceAfter: 3 });
    }
  }

  if (!isHidden(cv, "skills") && cv.skills.length > 0) {
    sectionTitle("Skills & Competencies");
    renderTwoColList(b, SIENNA, cv.skills, "▪");
  }

  if (!isHidden(cv, "languages") && cv.languages.length > 0) {
    sectionTitle("Languages");
    b.addText({
      value: cv.languages.map((l) => l.level?.trim() ? `${l.name} (${l.level.trim()})` : l.name).join("   ·   "),
      fontSize: 9.8, color: SUBINK, spaceAfter: 2,
    });
  }
  return b;
}

/** Helper: two-column bulleted list. */
function renderTwoColList(b: PdfmeBuilder, glyphColor: string, items: string[], glyph = "•") {
  const colW = (b.contentW - 8) / 2;
  const gw = 3.6;
  const tw = colW - gw;
  const fs = 9.8;
  const lh = 1.55;
  for (let i = 0; i < items.length; i += 2) {
    const left = items[i];
    const right = items[i + 1];
    const lh1 = textHeightMm(left, tw, fs, lh);
    const lh2 = right ? textHeightMm(right, tw, fs, lh) : 0;
    const rowH = Math.max(lh1, lh2, ptToMm(fs) * lh);
    b.ensure(rowH + 0.5);
    const py = b.cursorY;
    b.addText({ value: glyph, x: b.margin, y: py, width: gw, fontSize: fs, color: glyphColor, bold: true });
    b.addText({ value: left, x: b.margin + gw, y: py, width: tw, fontSize: fs, color: SUBINK, lineHeight: lh });
    if (right) {
      b.addText({ value: glyph, x: b.margin + colW + 8, y: py, width: gw, fontSize: fs, color: glyphColor, bold: true });
      b.addText({ value: right, x: b.margin + colW + 8 + gw, y: py, width: tw, fontSize: fs, color: SUBINK, lineHeight: lh });
    }
    b.cursorY = py + rowH + 1;
  }
  b.cursorY += 2;
}

/* ============================================================
 *  CLASSIC
 *  - serif-feeling traditional, circle photo, ink rule under
 *    header, gray underline under each section title
 * ============================================================ */
async function buildClassic(cv: GeneratedCV, photoUrl: string | null) {
  const b = createBuilder({ margin: 18 });
  const ctx: Ctx = { cv, primary: SIENNA, b };

  await renderHeader(ctx, {
    photoUrl, photoSize: 26, photoShape: "circle", gap: 7,
    nameFs: 28, nameBold: true,
    titleFs: 12, titleColor: SIENNA,
    bottomRule: { color: INK, weight: 0.6 },
  });

  const sectionTitle = (label: string) => {
    b.ensure(10);
    b.addText({
      value: label, fontSize: 11, color: INK, uppercase: true,
      letterSpacing: 0.9, bold: true, spaceAfter: 1.2,
    });
    b.addLine({ x: b.margin, y: b.cursorY, width: b.contentW, height: 0.35, color: "#3a342e" });
    b.cursorY += 3;
  };

  if (!isHidden(cv, "summary") && cv.summary) {
    sectionTitle("Professional Summary");
    b.addText({ value: cv.summary, fontSize: 10, color: SUBINK, lineHeight: 1.65, spaceAfter: 5 });
  }

  if (!isHidden(cv, "experience") && cv.experience.length > 0) {
    sectionTitle("Work Experience");
    for (const exp of cv.experience) {
      periodRow(ctx, exp.role || "", periodOf(exp), { leftFs: 11, bold: true });
      const comp = [exp.company, exp.location].filter(Boolean).join(" · ");
      if (comp) b.addText({ value: comp, fontSize: 10, color: SIENNA, spaceAfter: 1.5 });
      for (const bul of visibleBullets(exp)) {
        bullet(ctx, "•", bul.rewrite || bul.original, { fs: 9.6, glyphColor: SIENNA });
      }
      b.cursorY += 2;
    }
  }

  if (!isHidden(cv, "education") && cv.education.length > 0) {
    sectionTitle("Education");
    for (const ed of cv.education) {
      periodRow(ctx, ed.qualification, ed.period, { leftFs: 10.5, bold: true });
      if (ed.institution) b.addText({ value: ed.institution, fontSize: 10, color: SIENNA, spaceAfter: 3 });
    }
  }

  if (!isHidden(cv, "skills") && cv.skills.length > 0) {
    sectionTitle("Skills & Competencies");
    renderTwoColList(b, SIENNA, cv.skills, "•");
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

/* ============================================================
 *  EXECUTIVE
 *  - oversized name, square photo right, summary in a sienna
 *    left-bar quote, short underline under each section title
 *    in sienna, ▸ bullets
 * ============================================================ */
async function buildExecutive(cv: GeneratedCV, photoUrl: string | null) {
  const b = createBuilder({ margin: 22, top: 22, bottom: 22 });
  const ctx: Ctx = { cv, primary: SIENNA, b };

  await renderHeader(ctx, {
    photoUrl, photoSize: 32, photoShape: "square", photoOnRight: false, gap: 10,
    nameFs: 32, nameLetterSpacing: -0.6, nameBold: true,
    titleFs: 14, titleColor: SIENNA,
    contactFs: 9, contactColor: MUTED,
    spaceAfter: 9,
  });

  const sectionTitle = (label: string) => {
    b.ensure(10);
    b.addText({
      value: label, fontSize: 13, color: INK, bold: true,
      letterSpacing: -0.1, spaceAfter: 3,
    });
  };

  if (!isHidden(cv, "summary") && cv.summary) {
    sectionTitle("Executive Summary");
    const fs = 10.5;
    const lh = 1.75;
    const indent = 6;
    const w = b.contentW - indent;
    const h = textHeightMm(cv.summary, w, fs, lh);
    b.ensure(h + 2);
    const py = b.cursorY;
    b.addLine({ x: b.margin, y: py, width: 0.9, height: h, color: SIENNA });
    b.addText({ value: cv.summary, x: b.margin + indent, y: py, width: w, fontSize: fs, color: SUBINK, lineHeight: lh });
    b.cursorY = py + h + 7;
  }

  if (!isHidden(cv, "experience") && cv.experience.length > 0) {
    sectionTitle("Professional Experience");
    cv.experience.forEach((exp, i) => {
      periodRow(ctx, exp.role || "", periodOf(exp), { leftFs: 12.5, bold: true });
      const comp = [exp.company, exp.location].filter(Boolean).join(" · ");
      if (comp) b.addText({ value: comp, fontSize: 10.5, color: SIENNA, spaceAfter: 2 });
      for (const bul of visibleBullets(exp)) {
        bullet(ctx, "▸", bul.rewrite || bul.original, { fs: 10, lh: 1.7, glyphColor: SIENNA });
      }
      if (i < cv.experience.length - 1) b.cursorY += 4;
    });
    b.cursorY += 3;
  }

  if (!isHidden(cv, "education") && cv.education.length > 0) {
    sectionTitle("Education");
    for (const ed of cv.education) {
      periodRow(ctx, ed.qualification, ed.period, { leftFs: 11.5, bold: true });
      if (ed.institution) b.addText({ value: ed.institution, fontSize: 10.5, color: SIENNA, spaceAfter: 4 });
    }
  }

  if (!isHidden(cv, "skills") && cv.skills.length > 0) {
    sectionTitle("Core Competencies");
    // 2-col plain (no bullets) to match preview
    const colW = (b.contentW - 8) / 2;
    const fs = 10.5;
    const lh = 1.55;
    for (let i = 0; i < cv.skills.length; i += 2) {
      const l = cv.skills[i];
      const r = cv.skills[i + 1];
      const h = Math.max(
        textHeightMm(l, colW, fs, lh),
        r ? textHeightMm(r, colW, fs, lh) : 0,
        ptToMm(fs) * lh,
      );
      b.ensure(h + 0.6);
      const py = b.cursorY;
      b.addText({ value: l, x: b.margin, y: py, width: colW, fontSize: fs, color: SUBINK, lineHeight: lh });
      if (r) b.addText({ value: r, x: b.margin + colW + 8, y: py, width: colW, fontSize: fs, color: SUBINK, lineHeight: lh });
      b.cursorY = py + h + 1.2;
    }
    b.cursorY += 3;
  }

  if (!isHidden(cv, "languages") && cv.languages.length > 0) {
    sectionTitle("Languages");
    b.addText({
      value: cv.languages.map((l) => l.level?.trim() ? `${l.name} (${l.level.trim()})` : l.name).join("       "),
      fontSize: 10.5, color: SUBINK, spaceAfter: 2,
    });
  }
  return b;
}

/* ============================================================
 *  COMPACT
 *  - tight margins; right-aligned contact stack; ink hairline;
 *    two-column row (summary 62% | skills+languages 38%)
 * ============================================================ */
async function buildCompact(cv: GeneratedCV, photoUrl: string | null) {
  const b = createBuilder({ margin: 14, top: 14, bottom: 14 });
  const ctx: Ctx = { cv, primary: SIENNA, b };

  // Header — name+title (left, optional photo) | contact stack (right)
  if (!isHidden(cv, "contact")) {
    const photoSize = 22;
    const photoData = photoUrl ? await urlToDataUrl(photoUrl) : null;
    const hasPhoto = !!photoData;
    const hy0 = b.cursorY;
    const rightW = 72;
    const leftW = b.contentW - rightW - 6;
    const nameX = hasPhoto ? b.margin + photoSize + 5 : b.margin;
    const nameW = hasPhoto ? leftW - photoSize - 5 : leftW;

    if (hasPhoto) b.addImage({ x: b.margin, y: hy0, w: photoSize, h: photoSize, data: photoData! });
    b.addText({ value: cv.contact.name || "Your name", x: nameX, y: hy0, width: nameW, fontSize: 20, color: INK, lineHeight: 1.05, bold: true });
    if (cv.contact.jobTitle) {
      b.addText({
        value: cv.contact.jobTitle, x: nameX, y: hy0 + ptToMm(20) * 1.05 + 1.2, width: nameW,
        fontSize: 11, color: SIENNA,
      });
    }
    const rows = [cv.contact.location, cv.contact.phone, cv.contact.email, cv.contact.linkedinUrl].filter(Boolean) as string[];
    const rfs = 8.6;
    let ry = hy0;
    for (const r of rows) {
      const rh = textHeightMm(r, rightW, rfs, 1.45);
      b.addText({ value: r, x: b.margin + b.contentW - rightW, y: ry, width: rightW, fontSize: rfs, color: MUTED, align: "right", lineHeight: 1.45 });
      ry += rh + 0.4;
    }
    const leftBottom = hy0 + Math.max(
      hasPhoto ? photoSize : 0,
      ptToMm(20) * 1.05 + 1.2 + (cv.contact.jobTitle ? ptToMm(11) * 1.25 : 0),
    );
    const endY = Math.max(leftBottom, ry) + 3;
    b.addLine({ x: b.margin, y: endY, width: b.contentW, height: 0.6, color: INK });
    b.cursorY = endY + 4;
  }

  const tinyTitle = (label: string, x: number, w: number) => {
    b.addText({
      value: label, x, y: b.cursorY, width: w,
      fontSize: 10, color: INK, uppercase: true, letterSpacing: 0.9, bold: true,
    });
    b.cursorY += ptToMm(10) * 1.25 + 1;
    b.addLine({ x, y: b.cursorY, width: w, height: 0.35, color: SIENNA });
    b.cursorY += 2.4;
  };
  const fullSectionTitle = (label: string) => {
    b.ensure(9);
    const startY = b.cursorY;
    b.addText({
      value: label, fontSize: 10.5, color: INK, uppercase: true,
      letterSpacing: 0.9, bold: true,
    });
    b.addLine({ x: b.margin, y: b.cursorY, width: b.contentW, height: 0.35, color: SIENNA });
    b.cursorY += 2.6;
    void startY;
  };

  // Two-column row
  const ratio = 0.62;
  const gap = 8;
  const leftColW = (b.contentW - gap) * ratio;
  const rightColW = b.contentW - gap - leftColW;
  const leftX = b.margin;
  const rightX = b.margin + leftColW + gap;
  const topY = b.cursorY;

  // ---- LEFT: Summary ----
  let lY = topY;
  if (!isHidden(cv, "summary") && cv.summary) {
    b.cursorY = lY;
    tinyTitle("Summary", leftX, leftColW);
    lY = b.cursorY;
    const fs = 9.8;
    const lh = 1.6;
    const sh = textHeightMm(cv.summary, leftColW, fs, lh);
    b.addText({ value: cv.summary, x: leftX, y: lY, width: leftColW, fontSize: fs, color: SUBINK, lineHeight: lh });
    lY += sh + 4;
  }

  // ---- RIGHT: Skills + Languages ----
  let rY = topY;
  if (!isHidden(cv, "skills") && cv.skills.length > 0) {
    b.cursorY = rY;
    tinyTitle("Skills", rightX, rightColW);
    rY = b.cursorY;
    const fs = 9.4;
    const lh = 1.5;
    const gw = 3.4;
    for (const sk of cv.skills) {
      const tw = rightColW - gw;
      const h = Math.max(ptToMm(fs) * lh, textHeightMm(sk, tw, fs, lh));
      b.addText({ value: "•", x: rightX, y: rY, width: gw, fontSize: fs, color: SIENNA, bold: true });
      b.addText({ value: sk, x: rightX + gw, y: rY, width: tw, fontSize: fs, color: SUBINK, lineHeight: lh });
      rY += h + 0.8;
    }
    rY += 3;
  }
  if (!isHidden(cv, "languages") && cv.languages.length > 0) {
    b.cursorY = rY;
    tinyTitle("Languages", rightX, rightColW);
    rY = b.cursorY;
    for (const l of cv.languages) {
      const display = l.level?.trim() ? `${l.name} (${l.level.trim()})` : l.name;
      b.addText({ value: display, x: rightX, y: rY, width: rightColW, fontSize: 9.4, color: SUBINK });
      rY += ptToMm(9.4) * 1.45;
    }
  }

  b.cursorY = Math.max(lY, rY) + 5;

  // ---- Full-width Experience ----
  if (!isHidden(cv, "experience") && cv.experience.length > 0) {
    fullSectionTitle("Work Experience");
    for (const exp of cv.experience) {
      periodRow(ctx, exp.role || "", periodOf(exp), { leftFs: 10.5, bold: true });
      const comp = [exp.company, exp.location].filter(Boolean).join(" · ");
      if (comp) b.addText({ value: comp, fontSize: 9.8, color: SIENNA, spaceAfter: 1.5 });
      for (const bul of visibleBullets(exp)) bullet(ctx, "•", bul.rewrite || bul.original, { fs: 9.4, glyphColor: SIENNA });
      b.cursorY += 1.8;
    }
  }
  if (!isHidden(cv, "education") && cv.education.length > 0) {
    fullSectionTitle("Education");
    for (const ed of cv.education) {
      periodRow(ctx, ed.qualification, ed.period, { leftFs: 10, bold: true });
      if (ed.institution) b.addText({ value: ed.institution, fontSize: 9.8, color: SIENNA, spaceAfter: 3 });
    }
  }
  return b;
}

/* ============================================================
 *  SKILLS-FIRST
 *  - circle photo, hairline under header (no section dividers),
 *    skill chips BEFORE experience, → bullets, hairline between
 *    experience items
 * ============================================================ */
async function buildSkillsFirst(cv: GeneratedCV, photoUrl: string | null) {
  const b = createBuilder({ margin: 18 });
  const ctx: Ctx = { cv, primary: SIENNA, b };

  await renderHeader(ctx, {
    photoUrl, photoSize: 26, photoShape: "circle", gap: 7,
    nameFs: 26, nameLetterSpacing: -0.4, nameBold: true,
    titleFs: 12, titleColor: SIENNA,
    bottomRule: { color: HAIRLINE, weight: 0.3 },
  });

  const sectionTitle = (label: string) => {
    b.ensure(8);
    b.addText({
      value: label, fontSize: 12, color: INK, bold: true,
      letterSpacing: -0.1, spaceAfter: 2.8,
    });
  };

  if (!isHidden(cv, "summary") && cv.summary) {
    sectionTitle("Professional Summary");
    b.addText({ value: cv.summary, fontSize: 9.8, color: SUBINK, lineHeight: 1.7, spaceAfter: 6 });
  }

  if (!isHidden(cv, "skills") && cv.skills.length > 0) {
    sectionTitle("Skills & Competencies");
    renderChips(b, cv.skills);
    b.cursorY += 4;
  }

  if (!isHidden(cv, "experience") && cv.experience.length > 0) {
    sectionTitle("Work Experience");
    cv.experience.forEach((exp, idx) => {
      periodRow(ctx, exp.role || "", periodOf(exp), { leftFs: 11.5, bold: true });
      const comp = [exp.company, exp.location].filter(Boolean).join(" · ");
      if (comp) b.addText({ value: comp, fontSize: 9.8, color: SIENNA, spaceAfter: 1.8 });
      for (const bul of visibleBullets(exp)) {
        bullet(ctx, "→", bul.rewrite || bul.original, { fs: 9.4, lh: 1.6, glyphColor: SIENNA });
      }
      b.cursorY += 2;
      if (idx < cv.experience.length - 1) {
        b.ensure(4);
        b.addLine({ x: b.margin, y: b.cursorY, width: b.contentW, height: 0.3, color: HAIRLINE });
        b.cursorY += 4;
      }
    });
    b.cursorY += 2;
  }

  if (!isHidden(cv, "education") && cv.education.length > 0) {
    sectionTitle("Education");
    for (const ed of cv.education) {
      periodRow(ctx, ed.qualification, ed.period, { leftFs: 10.5, bold: true });
      if (ed.institution) b.addText({ value: ed.institution, fontSize: 9.8, color: SIENNA, spaceAfter: 3.5 });
    }
  }
  if (!isHidden(cv, "languages") && cv.languages.length > 0) {
    sectionTitle("Languages");
    b.addText({
      value: cv.languages.map((l) => l.level?.trim() ? `${l.name} (${l.level.trim()})` : l.name).join("     "),
      fontSize: 9.8, color: SUBINK, spaceAfter: 2,
    });
  }
  return b;
}

function renderChips(b: PdfmeBuilder, items: string[]) {
  const fs = 9.2;
  const padX = 3;
  const padY = 1.6;
  const lh = 1.2;
  const chipH = ptToMm(fs) * lh + padY * 2;
  const gap = 2;
  // Bold-ish width estimate for chip widths to avoid overflow
  const cwPerChar = (fs * 0.58) / 2.8346;
  let x = b.margin;
  let y = b.cursorY;
  const maxX = b.margin + b.contentW;
  b.ensure(chipH + 0.4);
  y = b.cursorY;
  for (const it of items) {
    const w = Math.min(b.contentW, it.length * cwPerChar + padX * 2);
    if (x + w > maxX) {
      x = b.margin;
      y += chipH + gap;
      if (y + chipH > b.PAGE_H - b.bottom) {
        b.cursorY = y;
        b.newPage();
        y = b.cursorY;
      }
    }
    b.addRect({
      x, y, width: w, height: chipH,
      color: "#f4efe6", borderColor: HAIRLINE, borderWidth: 0.3,
      radius: chipH / 2,
    });
    b.addText({
      value: it, x: x + padX, y: y + padY * 0.65, width: w - padX * 2,
      fontSize: fs, color: INK, lineHeight: lh,
    });
    x += w + gap;
  }
  b.cursorY = y + chipH + 1;
}

/* ============================================================
 * Public entry — routes to the right builder.
 * ============================================================ */
export async function exportCvPdfme(
  cv: GeneratedCV,
  photoUrl: string | null,
  templateId: TemplateId,
  fileName: string,
) {
  let b: PdfmeBuilder;
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

void PAGE_W;
