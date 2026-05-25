import { normalizeTemplateId, type GeneratedCV, type TemplateId } from "@/contexts/CVBuilderContext";
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
  const lh = opts.lh ?? 1.45;
  const gw = opts.glyphW ?? 4.4;
  const tw = b.contentW - gw;
  const lineStep = ptToMm(fs) * lh;
  const lineCount = Math.max(1, Math.ceil(textHeightMm(text, tw, fs, lh) / lineStep - 0.01));
  const wrapGuard = lineCount > 1 ? 1.2 : 0.25;
  const h = lineStep * lineCount + wrapGuard;
  b.ensure(h + 0.35);
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
  b.cursorY = py + h + 0.35;
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
        bullet(ctx, "•", bul.rewrite || bul.original, { fs: 9.4 });
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
    renderTwoColList(b, SIENNA, cv.skills, "•");
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
        bullet(ctx, "›", bul.rewrite || bul.original, { fs: 10, lh: 1.7, glyphColor: SIENNA });
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
        bullet(ctx, "›", bul.rewrite || bul.original, { fs: 9.4, lh: 1.6, glyphColor: SIENNA });
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
 *  RIYADH
 *  - Dark sienna left sidebar (full page height) with photo,
 *    contact, skills, languages. Right column flows
 *    summary/experience/education with restrained type.
 * ============================================================ */
const SIENNA_DARK = "#6e3d2f";
const PAPER = "#f5f0e8";

async function buildRiyadh(cv: GeneratedCV, photoUrl: string | null) {
  const b = createBuilder({ margin: 0, top: 0, bottom: 0 });
  const SIDEBAR_W = 64; // mm
  const MAIN_X = SIDEBAR_W;
  const MAIN_W = PAGE_W - SIDEBAR_W;
  const PADX = 10;
  const MAIN_MARGIN = MAIN_X + PADX + 2;
  const MAIN_CONTENT_W = MAIN_W - PADX * 2 - 2;

  // Draw sidebar background on every page.
  const drawSidebar = () => {
    b.addRect({
      x: 0, y: 0, width: SIDEBAR_W, height: b.PAGE_H,
      color: SIENNA_DARK, borderColor: SIENNA_DARK, borderWidth: 0,
    });
  };
  drawSidebar();
  b.onNewPage(() => {
    drawSidebar();
    // Subsequent pages: cursor goes back to main column top.
    b.margin = MAIN_MARGIN;
    b.contentW = MAIN_CONTENT_W;
    b.cursorY = 16;
  });

  // ---- Sidebar content (absolute positioned) ----
  let sY = 14;
  const photoData = photoUrl ? await urlToDataUrl(photoUrl) : null;
  if (photoData) {
    const sz = 32;
    b.addImage({ x: (SIDEBAR_W - sz) / 2, y: sY, w: sz, h: sz, data: photoData });
    sY += sz + 8;
  }

  const sideHeading = (label: string) => {
    b.addText({
      value: label.toUpperCase(), x: PADX, y: sY, width: SIDEBAR_W - PADX * 2,
      fontSize: 9, color: PAPER, bold: true, letterSpacing: 1.2,
    });
    sY += ptToMm(9) * 1.25 + 0.6;
    b.addLine({ x: PADX, y: sY, width: SIDEBAR_W - PADX * 2, height: 0.25, color: "#a07a6a" });
    sY += 2.4;
  };

  const sideRow = (label: string | null, value: string) => {
    if (label) {
      b.addText({
        value: label.toUpperCase(), x: PADX, y: sY, width: SIDEBAR_W - PADX * 2,
        fontSize: 6.8, color: "#e8d9c8", bold: true, letterSpacing: 1.2,
      });
      sY += ptToMm(6.8) * 1.4 + 0.2;
    }
    const h = textHeightMm(value, SIDEBAR_W - PADX * 2, 8.4, 1.45);
    b.addText({
      value, x: PADX, y: sY, width: SIDEBAR_W - PADX * 2,
      fontSize: 8.4, color: PAPER, lineHeight: 1.45,
    });
    sY += h + 1.6;
  };

  if (!isHidden(cv, "contact")) {
    sideHeading("Contact");
    if (cv.contact.location) sideRow("Location", cv.contact.location);
    if (cv.contact.phone) sideRow("Phone", cv.contact.phone);
    if (cv.contact.email) sideRow("Email", cv.contact.email);
    if (cv.contact.linkedinUrl) sideRow("LinkedIn", cv.contact.linkedinUrl);
    sY += 3;
  }

  if (!isHidden(cv, "skills") && cv.skills.length) {
    sideHeading("Skills");
    for (const sk of cv.skills) {
      const tw = SIDEBAR_W - PADX * 2 - 3;
      // Use bold:true in the height prediction as extra safety: caps-heavy
      // skill names render wider than mixed case and we'd rather over-
      // reserve a hair than overlap into the next item.
      const h = textHeightMm(sk, tw, 8.6, 1.5, { bold: true });
      b.addText({ value: "▪", x: PADX, y: sY, width: 3, fontSize: 8.6, color: SIENNA, bold: true });
      b.addText({ value: sk, x: PADX + 3, y: sY, width: tw, fontSize: 8.6, color: PAPER, lineHeight: 1.5 });
      sY += h + 1.6;
    }
    sY += 3;
  }


  if (!isHidden(cv, "languages") && cv.languages.length) {
    sideHeading("Languages");
    for (const l of cv.languages) {
      const display = l.level?.trim() ? `${l.name} — ${l.level}` : l.name;
      sideRow(null, display);
    }
  }

  // ---- Main column ----
  b.margin = MAIN_MARGIN;
  b.contentW = MAIN_CONTENT_W;
  b.cursorY = 16;
  const ctx2: Ctx = { cv, primary: SIENNA, b };

  // Name + title
  b.addText({
    value: cv.contact.name || "Your name",
    fontSize: 24, color: INK, bold: true, letterSpacing: -0.4, lineHeight: 1.05,
    spaceAfter: 1,
  });
  if (cv.contact.jobTitle) {
    b.addText({
      value: cv.contact.jobTitle.toUpperCase(),
      fontSize: 10, color: SIENNA, bold: true, letterSpacing: 1.4, spaceAfter: 6,
    });
  } else {
    b.cursorY += 4;
  }

  const mainHeading = (label: string) => {
    b.ensure(10);
    b.addText({
      value: label.toUpperCase(), fontSize: 11.5, color: INK, bold: true,
      letterSpacing: 1.6, spaceAfter: 1.2,
    });
    b.addLine({ x: b.margin, y: b.cursorY, width: 14, height: 0.7, color: SIENNA });
    b.cursorY += 3.4;
  };


  if (!isHidden(cv, "summary") && cv.summary) {
    mainHeading("Profile");
    b.addText({ value: cv.summary, fontSize: 9.7, color: SUBINK, lineHeight: 1.65, spaceAfter: 5 });
  }

  if (!isHidden(cv, "experience") && cv.experience.length) {
    mainHeading("Experience");
    for (const exp of cv.experience) {
      periodRow(ctx2, exp.role || "", periodOf(exp), { leftFs: 11, bold: true });
      const comp = [exp.company, exp.location].filter(Boolean).join(" · ");
      if (comp) b.addText({ value: comp, fontSize: 9.5, color: SIENNA, bold: true, spaceAfter: 1.5 });
      for (const bul of visibleBullets(exp)) {
        bullet(ctx2, "•", bul.rewrite || bul.original, { fs: 9.4, glyphColor: SIENNA });
      }
      b.cursorY += 2.4;
    }
  }

  if (!isHidden(cv, "education") && cv.education.length) {
    mainHeading("Education");
    for (const ed of cv.education) {
      periodRow(ctx2, ed.qualification, ed.period, { leftFs: 10.5, bold: true });
      if (ed.institution) b.addText({ value: ed.institution, fontSize: 9.6, color: SIENNA, bold: true, spaceAfter: 3 });
    }
  }

  return b;
}

/* ============================================================
 *  GENEVA
 *  - Editorial template with serif-flavour name, numbered
 *    section eyebrows, and a timeline rail for experience.
 * ============================================================ */
async function buildGeneva(cv: GeneratedCV, photoUrl: string | null) {
  const b = createBuilder({ margin: 20, top: 22, bottom: 18 });
  const ctx: Ctx = { cv, primary: SIENNA, b };

  // ---- Header ----
  if (!isHidden(cv, "contact")) {
    const photoData = photoUrl ? await urlToDataUrl(photoUrl) : null;
    const sz = 26;
    const hy0 = b.cursorY;
    let textX = b.margin;
    let textW = b.contentW;
    if (photoData) {
      b.addImage({ x: b.margin, y: hy0, w: sz, h: sz, data: photoData });
      textX = b.margin + sz + 7;
      textW = b.contentW - sz - 7;
    }
    b.addText({
      value: "CURRICULUM VITAE", x: textX, y: hy0, width: textW,
      fontSize: 7.6, color: SIENNA, bold: true, letterSpacing: 2.2,
    });
    let ty = hy0 + ptToMm(7.6) * 1.25 + 1;
    b.addText({
      value: cv.contact.name || "Your name", x: textX, y: ty, width: textW,
      fontSize: 24, color: INK, bold: true, letterSpacing: -0.5, lineHeight: 1.05,
    });
    ty += ptToMm(24) * 1.05 + 1.2;
    if (cv.contact.jobTitle) {
      b.addText({
        value: cv.contact.jobTitle, x: textX, y: ty, width: textW,
        fontSize: 11, color: SUBINK,
      });
      ty += ptToMm(11) * 1.25 + 1.6;
    }
    const contact = contactItems(cv).join("   ·   ");
    if (contact) {
      const ch = textHeightMm(contact, textW, 8.4, 1.4);
      b.addText({ value: contact, x: textX, y: ty, width: textW, fontSize: 8.4, color: MUTED, lineHeight: 1.4 });
      ty += ch + 1;
    }
    b.cursorY = Math.max(ty, hy0 + (photoData ? sz : 0)) + 8;
  }

  let sectionNum = 0;
  const sectionTitle = (label: string) => {
    sectionNum++;
    b.ensure(11);
    const startY = b.cursorY;
    b.addText({
      value: String(sectionNum).padStart(2, "0"), x: b.margin, y: startY, width: 10,
      fontSize: 8, color: SIENNA, bold: true, letterSpacing: 2,
    });
    b.addText({
      value: label, x: b.margin, y: startY + 3.6, width: b.contentW,
      fontSize: 13, color: INK, bold: true,
    });
    b.cursorY = startY + ptToMm(13) * 1.25 + 5;
    b.addLine({ x: b.margin, y: b.cursorY - 1.4, width: b.contentW, height: 0.25, color: "#d8cfc1" });
    b.cursorY += 2;
  };

  if (!isHidden(cv, "summary") && cv.summary) {
    sectionTitle("Profile");
    b.addText({ value: cv.summary, fontSize: 10, color: SUBINK, lineHeight: 1.75, spaceAfter: 6 });
  }

  if (!isHidden(cv, "experience") && cv.experience.length) {
    sectionTitle("Career Timeline");
    const railX = b.margin + 1.2;
    const indent = 6;
    const startY = b.cursorY;
    cv.experience.forEach((exp, idx) => {
      // Dot
      b.ensure(8);
      const dotY = b.cursorY + 1.2;
      b.addRect({
        x: railX - 1.4, y: dotY, width: 2.8, height: 2.8,
        color: PAPER, borderColor: SIENNA, borderWidth: 0.6, radius: 1.4,
      });
      // Push content to the right of the rail
      const savedMargin = (b as unknown as { margin: number }).margin;
      const savedContentW = (b as unknown as { contentW: number }).contentW;
      (b as unknown as { margin: number }).margin = savedMargin + indent;
      (b as unknown as { contentW: number }).contentW = savedContentW - indent;

      periodRow({ cv, primary: SIENNA, b }, exp.role || "", periodOf(exp), { leftFs: 11.5, bold: true });
      const comp = [exp.company, exp.location].filter(Boolean).join(" · ");
      if (comp) b.addText({ value: comp, fontSize: 9.6, color: SIENNA, bold: true, spaceAfter: 1.8 });
      for (const bul of visibleBullets(exp)) {
        bullet({ cv, primary: SIENNA, b }, "—", bul.rewrite || bul.original, { fs: 9.4, lh: 1.65, glyphColor: SIENNA });
      }

      (b as unknown as { margin: number }).margin = savedMargin;
      (b as unknown as { contentW: number }).contentW = savedContentW;
      if (idx < cv.experience.length - 1) b.cursorY += 3.6;
    });
    // Draw the vertical rail spanning all experience entries
    const endY = b.cursorY;
    b.addLine({ x: railX, y: startY + 2.6, width: 0.3, height: endY - startY - 4, color: "#d8cfc1" });
    b.cursorY += 4;
  }

  if (!isHidden(cv, "education") && cv.education.length) {
    sectionTitle("Education");
    for (const ed of cv.education) {
      periodRow(ctx, ed.qualification, ed.period, { leftFs: 11, bold: true });
      if (ed.institution) b.addText({ value: ed.institution, fontSize: 9.6, color: SIENNA, bold: true, spaceAfter: 3 });
    }
  }

  if (!isHidden(cv, "skills") && cv.skills.length) {
    sectionTitle("Skills");
    // Two-column plain dot list
    const colW = (b.contentW - 8) / 2;
    const fs = 9.6;
    const lh = 1.5;
    for (let i = 0; i < cv.skills.length; i += 2) {
      const l = cv.skills[i];
      const r = cv.skills[i + 1];
      const h = Math.max(textHeightMm(l, colW, fs, lh), r ? textHeightMm(r, colW, fs, lh) : 0, ptToMm(fs) * lh);
      b.ensure(h + 0.5);
      const py = b.cursorY;
      b.addText({ value: "·", x: b.margin, y: py, width: 3, fontSize: fs, color: SIENNA, bold: true });
      b.addText({ value: l, x: b.margin + 3, y: py, width: colW - 3, fontSize: fs, color: SUBINK, lineHeight: lh });
      if (r) {
        b.addText({ value: "·", x: b.margin + colW + 8, y: py, width: 3, fontSize: fs, color: SIENNA, bold: true });
        b.addText({ value: r, x: b.margin + colW + 8 + 3, y: py, width: colW - 3, fontSize: fs, color: SUBINK, lineHeight: lh });
      }
      b.cursorY = py + h + 0.8;
    }
    b.cursorY += 3;
  }

  if (!isHidden(cv, "languages") && cv.languages.length) {
    sectionTitle("Languages");
    b.addText({
      value: cv.languages.map((l) => l.level?.trim() ? `${l.name} — ${l.level}` : l.name).join("       "),
      fontSize: 9.8, color: SUBINK,
    });
  }
  void HAIRLINE;
  return b;
}

/* ============================================================
 * Public entry — routes to the right builder.
 * ============================================================ */
export async function exportCvPdfme(
  cv: GeneratedCV,
  photoUrl: string | null,
  templateId: TemplateId | string,
  fileName: string,
) {
  const blob = await generateCvPdfmeBlob(cv, photoUrl, templateId);
  const { saveAs } = await import("file-saver");
  saveAs(blob, fileName);
}

export async function generateCvPdfmeBlob(
  cv: GeneratedCV,
  photoUrl: string | null,
  templateId: TemplateId | string,
) {
  let b: PdfmeBuilder;
  switch (normalizeTemplateId(templateId)) {
    case "london":     b = await buildClassic(cv, photoUrl); break;
    case "zurich":     b = await buildExecutive(cv, photoUrl); break;
    case "singapore":  b = await buildCompact(cv, photoUrl); break;
    case "berlin":     b = await buildSkillsFirst(cv, photoUrl); break;
    case "riyadh":     b = await buildRiyadh(cv, photoUrl); break;
    case "geneva":     b = await buildGeneva(cv, photoUrl); break;
    case "dubai":
    default:           b = await buildModern(cv, photoUrl);
  }
  return b.toBlob();
}

void PAGE_W;

