import { normalizeTemplateId, type GeneratedCV, type SectionKey, type TemplateId } from "@/contexts/CVBuilderContext";
import {
  contactItems, contactLinkItems, isHidden, periodOf, visibleBullets, stripUrlPrefix, withScheme,
  getSectionOrder, shouldRender,
} from "./helpers";
import {
  createBuilder, urlToDataUrl, textHeightMm, textWidthMm, ptToMm, wrapLines,
  INK, SUBINK, MUTED, HAIRLINE, SIENNA, PAGE_W,
  type PdfmeBuilder,
} from "./core";
import { shadeHex, mixHex } from "@/lib/cv/palettes";
import {
  getSidebarKeys as resolveSidebarKeys,
  type SidebarPlacementMap,
} from "@/lib/cv/sidebarPlacement";


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

/* ------------ contact icon helpers ------------ */

const ICON_SVGS = {
  mapPin: `<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>`,
  phone: `<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>`,
  mail: `<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 5L2 7"/>`,
  linkedin: `<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>`,
  globe: `<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>`,
};

async function svgToPngDataUrl(inner: string, color = "#f5f0e8", sizePx = 64): Promise<string> {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${sizePx}" height="${sizePx}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
  const url = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = reject;
    i.src = url;
  });
  const canvas = document.createElement("canvas");
  canvas.width = sizePx;
  canvas.height = sizePx;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No 2d context");
  ctx.drawImage(img, 0, 0, sizePx, sizePx);
  return canvas.toDataURL("image/png");
}

/* ------------ shared building blocks ------------ */


function contactLine(cv: GeneratedCV) {
  return contactItems(cv).join("   ·   ");
}

function addContactLinks(
  b: PdfmeBuilder,
  runs: { label: string; uri?: string }[],
  opts: { x: number; y: number; width: number; fontSize: number; lineHeight: number; separator?: string },
) {
  const separator = opts.separator ?? "   ·   ";
  const display = runs.map((r) => r.label).join(separator);
  for (let i = 0; i < runs.length; i += 1) {
    const run = runs[i];
    if (!run.uri) continue;
    const before = runs.slice(0, i).map((r) => r.label).join(separator) + (i > 0 ? separator : "");
    const linkX = opts.x + textWidthMm(before, opts.fontSize);
    const linkW = Math.min(textWidthMm(run.label, opts.fontSize), opts.x + opts.width - linkX);
    if (linkX >= opts.x && linkW > 1 && textWidthMm(display, opts.fontSize) <= opts.width + 0.5) {
      b.addLink({ x: linkX, y: opts.y, width: linkW, height: ptToMm(opts.fontSize) * opts.lineHeight, uri: withScheme(run.uri) });
    }
  }
}

/**
 * A role-on-left, period-on-right row. Uses the same deterministic
 * line-by-line layout as bullets: we pre-wrap with wrapLines() and emit
 * one single-line addText() per visual line at an exact Y. This eliminates
 * the phantom-blank-line gap (and overlap risk) that came from letting
 * pdfme re-wrap a multi-line text block while our cursor advanced from a
 * separate estimate.
 */
function periodRow(
  ctx: Ctx,
  left: string,
  right: string,
  opts: { leftFs: number; rightFs?: number; leftColor?: string; rightColor?: string; bold?: boolean; spaceAfter?: number; periodW?: number; glyph?: string; glyphColor?: string; glyphW?: number },
) {
  const { b } = ctx;
  const leftFs = opts.leftFs;
  const rightFs = opts.rightFs ?? 8.8;
  const glyph = opts.glyph;
  const glyphW = glyph ? (opts.glyphW ?? 3.2) : 0;
  // Reserve only what the date string actually needs (+ small padding) so the
  // job title gets the rest of the line instead of wrapping into 3 narrow rows.
  const measuredRightW = right
    ? Math.min(b.contentW * 0.45, Math.ceil(estimatedRightWidthMm(right, rightFs)) + 2)
    : 0;
  const periodW = opts.periodW ?? measuredRightW;
  const leftW = b.contentW - glyphW - periodW - (periodW ? 2 : 0);
  const lineStep = ptToMm(leftFs) * 1.25;
  const leftLines = wrapLines(left || "", leftW, leftFs, { bold: opts.bold });
  const lineCount = Math.max(1, leftLines.length);
  const blockH = lineCount * lineStep;
  b.ensure(blockH);
  const py = b.cursorY;
  if (glyph) {
    b.addText({
      value: glyph,
      x: b.margin,
      y: py,
      width: glyphW,
      fontSize: leftFs,
      color: opts.glyphColor ?? ctx.primary,
      bold: true,
      lineHeight: 1.25,
    });
  }
  for (let i = 0; i < leftLines.length; i++) {
    b.addText({
      value: leftLines[i],
      x: b.margin + glyphW,
      y: py + i * lineStep,
      width: leftW,
      fontSize: leftFs,
      color: opts.leftColor ?? INK,
      bold: opts.bold,
      lineHeight: 1.25,
    });
  }
  if (right) {
    b.addText({
      value: right,
      x: b.margin + glyphW + leftW + 2,
      y: py,
      width: periodW,
      fontSize: rightFs,
      color: opts.rightColor ?? MUTED,
      align: "right",
      lineHeight: 1.25,
    });
  }
  b.cursorY = py + blockH + (opts.spaceAfter ?? 0.5);
}

/** Width estimate for the right-aligned date string (mm). */
function estimatedRightWidthMm(text: string, fontSizePt: number) {
  const PT_PER_MM_LOCAL = 2.8346;
  const units = Array.from(text).reduce((s, ch) => {
    if (ch === " ") return s + 0.30;
    if (/[0-9]/.test(ch)) return s + 0.55;
    if (/[A-Z]/.test(ch)) return s + 0.60;
    if (/[a-z]/.test(ch)) return s + 0.50;
    if (/[-–—]/.test(ch)) return s + 0.40;
    return s + 0.45;
  }, 0);
  return (fontSizePt * units) / PT_PER_MM_LOCAL * 1.05;
}

/**
 * Render the languages list as one bullet per line with a bold glyph
 * (distinct from experience bullets). Pairs with bullet() but lets us
 * style each language entry the same way for languages sections.
 */
function langBulletList(
  ctx: Ctx,
  opts: { fs: number; color?: string; glyph?: string; glyphColor?: string; lh?: number } = { fs: 9.8 },
) {
  const { b, cv } = ctx;
  if (!cv.languages.length) return;
  const glyph = opts.glyph ?? "»";
  const value = cv.languages
    .map((l) => {
      const display = l.level?.trim() ? `${l.name} (${l.level.trim()})` : l.name;
      return `${glyph} ${display}`;
    })
    .join("    ");
  b.addText({
    value,
    fontSize: opts.fs,
    color: opts.color ?? SUBINK,
    lineHeight: opts.lh ?? 1.4,
    spaceAfter: 2,
  });
}


function deterministicLine(
  ctx: Ctx,
  value: string,
  opts: { fs: number; color?: string; bold?: boolean; lh?: number; spaceAfter?: number; width?: number } = { fs: 9.8 },
) {
  const { b } = ctx;
  if (!value) return;
  const fs = opts.fs;
  const lh = opts.lh ?? 1.25;
  const width = opts.width ?? b.contentW;
  const lineStep = ptToMm(fs) * lh;
  const lines = wrapLines(value, width, fs, { bold: opts.bold });
  const blockH = Math.max(1, lines.length) * lineStep;
  b.ensure(blockH);
  const py = b.cursorY;
  for (let i = 0; i < lines.length; i += 1) {
    b.addText({
      value: lines[i],
      x: b.margin,
      y: py + i * lineStep,
      width,
      fontSize: fs,
      color: opts.color ?? INK,
      bold: opts.bold,
      lineHeight: lh,
    });
  }
  b.cursorY = py + blockH + (opts.spaceAfter ?? 1);
}

/**
 * Render a competency cluster inline: "Title: item · item · item",
 * with the title bold + accent color and items in body color. The
 * title sits on the first line; items wrap within the remaining width
 * on the right of the title, and any wrapped lines continue at that
 * same indented x so the title stays visually attached to its items.
 */
function inlineCluster(
  ctx: Ctx,
  cluster: { title?: string; items: string[] },
  opts: { titleFs: number; titleColor: string; itemsFs: number; itemsColor: string; lh?: number; spaceAfter?: number; bulletIcon?: boolean },
) {
  const { b } = ctx;
  const items = cluster.items.filter(Boolean).join(" · ");
  const lh = opts.lh ?? 1.4;
  const spaceAfter = opts.spaceAfter ?? 2;

  if (!cluster.title) {
    if (items) deterministicLine(ctx, items, { fs: opts.itemsFs, color: opts.itemsColor, lh, spaceAfter });
    return;
  }

  const bulletW = opts.bulletIcon ? 4 : 0;
  const bulletGap = opts.bulletIcon ? 1.2 : 0;
  const textX = b.margin + bulletW + bulletGap;
  const textW = b.contentW - bulletW - bulletGap;
  const titleText = `${cluster.title}: `;
  const titleW = textWidthMm(titleText, opts.titleFs, { bold: true });
  const itemsX = textX + titleW;
  const firstW = Math.max(20, textW - titleW);
  const fullW = textW;
  const lineStep = ptToMm(opts.itemsFs) * lh;

  // First line wraps to remaining width next to the title; the remainder
  // re-wraps at full content width so subsequent lines start at the margin.
  const firstWrap = items ? wrapLines(items, firstW, opts.itemsFs, {}) : [""];
  const firstLine = firstWrap[0] ?? "";
  const consumed = firstLine.length;
  const remainder = items.slice(consumed).replace(/^\s+/, "");
  const restLines = remainder ? wrapLines(remainder, fullW, opts.itemsFs, {}) : [];

  const totalLines = 1 + restLines.length;
  const blockH = totalLines * lineStep;
  b.ensure(blockH);
  const py = b.cursorY;

  if (opts.bulletIcon) {
    b.addRect({
      x: b.margin,
      y: py + 1.05,
      width: 1.8,
      height: 1.8,
      color: opts.titleColor,
      borderColor: opts.titleColor,
      borderWidth: 0,
      radius: 0.35,
    });
  }

  b.addText({
    value: titleText,
    x: textX, y: py, width: titleW + 1,
    fontSize: opts.titleFs, color: opts.titleColor, bold: true, lineHeight: lh,
  });

  if (firstLine) {
    b.addText({
      value: firstLine,
      x: itemsX, y: py, width: firstW + 1,
      fontSize: opts.itemsFs, color: opts.itemsColor, lineHeight: lh,
    });
  }

  for (let i = 0; i < restLines.length; i += 1) {
    b.addText({
      value: restLines[i],
      x: textX, y: py + (i + 1) * lineStep, width: fullW + 1,
      fontSize: opts.itemsFs, color: opts.itemsColor, lineHeight: lh,
    });
  }

  b.cursorY = py + blockH + spaceAfter;
}



/**
 * Render a single bullet row with FULLY DETERMINISTIC layout.
 *
 * The key technique: we pre-wrap the bullet text into visual lines ourselves
 * using wrapLines(), then emit ONE single-line pdfme text block per visual
 * line at an exact Y coordinate. pdfme therefore never re-wraps the text —
 * what we measure is what gets rendered — so we know with certainty that:
 *   - a 1-line bullet occupies exactly lineStep mm of vertical space,
 *   - a 2-line bullet occupies exactly 2 * lineStep mm,
 *   - no phantom empty rows can appear,
 *   - no two bullets can overlap.
 *
 * A fixed small gap (BULLET_GAP_MM) is added after each bullet.
 * Page breaks happen between bullets, never inside a bullet's own lines.
 */
const BULLET_GAP_MM = 0.6;

function bullet(
  ctx: Ctx,
  glyph: string,
  text: string,
  opts: { fs?: number; glyphColor?: string; textColor?: string; lh?: number; glyphW?: number; glyphBold?: boolean } = {},
) {
  const { b } = ctx;
  const fs = opts.fs ?? 9.7;
  const lh = opts.lh ?? 1.45;
  const gw = opts.glyphW ?? 2.4;
  const tw = b.contentW - gw;
  const lineStep = ptToMm(fs) * lh;

  // Pre-wrap into exact visual lines. This is the SAME function used for
  // measurement, so emitted geometry == predicted geometry.
  const lines = wrapLines(text, tw, fs, {});
  const blockH = lines.length * lineStep;

  // Page break check — keep the whole bullet together when possible. If the
  // bullet alone is taller than a page, allow line-by-line break (rare).
  b.ensure(blockH);

  const py = b.cursorY;

  // Glyph rendered as its own single-line block on the first visual line.
  b.addText({
    value: glyph,
    x: b.margin,
    y: py,
    width: gw,
    fontSize: fs,
    color: opts.glyphColor ?? ctx.primary,
    lineHeight: lh,
    bold: opts.glyphBold ?? true,
  });

  // Each pre-wrapped line is rendered as its own single-line text block at
  // an exact Y. pdfme cannot re-wrap (one line fits trivially in the box),
  // so the next bullet sits exactly lineStep mm below.
  for (let i = 0; i < lines.length; i += 1) {
    const lineY = py + i * lineStep;
    if (lineY + lineStep > b.PAGE_H - b.bottom) {
      // Extremely long bullet that spills past the page: break here, redraw
      // the glyph column-less continuation on the next page.
      b.cursorY = lineY;
      b.newPage();
      const remaining = lines.slice(i).join(" ");
      // Recursive call with the remainder — keeps the deterministic flow.
      bullet(ctx, "", remaining, { ...opts });
      return;
    }
    // Render each pre-wrapped line in a generously oversized box so pdfme
    // can never re-wrap it (which would stack 2 visual lines inside a single
    // lineStep slot and overlap with the next bullet line drawn below).
    b.addText({
      value: lines[i],
      x: b.margin + gw,
      y: lineY,
      width: tw + 20,
      fontSize: fs,
      color: opts.textColor ?? SUBINK,
      lineHeight: lh,
    });
  }

  b.cursorY = py + blockH + BULLET_GAP_MM;
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
    const titleLh = 1.25;
    const titleH = Math.max(
      ptToMm(o.titleFs) * titleLh,
      textHeightMm(cv.contact.jobTitle, textW, o.titleFs, titleLh, { bold: o.titleBold }),
    );
    b.addText({
      value: cv.contact.jobTitle, x: textX, y: hy, width: textW,
      fontSize: o.titleFs, color: o.titleColor ?? SIENNA, bold: o.titleBold,
      lineHeight: titleLh,
    });
    hy += titleH + 1.4;
  }
  const contactRuns = contactLinkItems(cv);
  const cText = contactRuns.map((r) => r.label).join("   ·   ");
  if (cText) {
    const cFs = o.contactFs ?? 8.6;
    const contactY = hy + 1.4;
    const ch = textHeightMm(cText, textW, cFs, 1.45);
    b.addText({
      value: cText,
      x: textX, y: contactY, width: textW,
      fontSize: cFs, color: o.contactColor ?? MUTED, lineHeight: 1.45,
    });
    addContactLinks(b, contactRuns, { x: textX, y: contactY, width: textW, fontSize: cFs, lineHeight: 1.45 });
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

  if (shouldRender(cv, "summary")) {
    sectionTitle("Professional Summary");
    b.addText({ value: cv.summary, fontSize: 9.8, color: SUBINK, lineHeight: 1.6, spaceAfter: 5, align: "justify" });
  }

  const bodyRenderers: Partial<Record<SectionKey, () => void>> = {
    experience: () => {
      sectionTitle("Work Experience");
      for (const exp of cv.experience) {
        periodRow(ctx, exp.role || "", periodOf(exp), { leftFs: 11, bold: true });
        const comp = [exp.company, exp.location].filter(Boolean).join(" · ");
        deterministicLine(ctx, comp, { fs: 9.8, color: SIENNA, spaceAfter: 1.5 });
        for (const bul of visibleBullets(exp)) {
          bullet(ctx, "•", bul.rewrite || bul.original, { fs: 9.4 });
        }
        b.cursorY += 2.5;
      }
    },
    education: () => {
      sectionTitle("Education");
      for (const ed of cv.education) {
        periodRow(ctx, ed.qualification, ed.period, { leftFs: 10.5, bold: true });
        if (ed.institution) b.addText({ value: ed.institution, fontSize: 9.8, color: SIENNA, spaceAfter: 3 });
      }
    },
    skills: () => {
      sectionTitle("Skills & Competencies");
      renderTwoColList(b, SIENNA, cv.skills, "•");
    },
    competencies: () => {
      sectionTitle("Core Competencies");
      for (const c of cv.competencyClusters) {
        inlineCluster(ctx, c, { titleFs: 9.8, titleColor: SIENNA, itemsFs: 9.8, itemsColor: SUBINK });
      }
    },
    languages: () => {
      sectionTitle("Languages");
      langBulletList(ctx, { fs: 9.8, color: SUBINK, glyphColor: SIENNA });
      b.cursorY += 1;
    },
    achievements: () => {
      sectionTitle("Achievements");
      for (const a of cv.achievements.filter(Boolean)) {
        bullet(ctx, "•", a, { fs: 9.4 });
      }
      b.cursorY += 2;
    },
    certifications: () => {
      sectionTitle("Certifications");
      for (const c of cv.certifications) {
        const left = c.issuer ? `${c.name} — ${c.issuer}` : c.name;
        periodRow(ctx, left, c.date || "", { leftFs: 9.8, bold: false, glyph: "»", glyphColor: SIENNA });
      }
      b.cursorY += 2;
    },
    custom: () => {
      for (const s of cv.customSections) {
        sectionTitle(s.title || "Additional");
        for (const it of s.bullets.filter(Boolean)) {
          bullet(ctx, "•", it, { fs: 9.4 });
        }
        b.cursorY += 2;
      }
    },
  };

  for (const k of getSectionOrder(cv)) {
    if (shouldRender(cv, k)) bodyRenderers[k]?.();
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

  if (shouldRender(cv, "summary")) {
    sectionTitle("Professional Summary");
    b.addText({ value: cv.summary, fontSize: 10, color: SUBINK, lineHeight: 1.65, spaceAfter: 5, align: "justify" });
  }

  const bodyRenderers: Partial<Record<SectionKey, () => void>> = {
    experience: () => {
      sectionTitle("Work Experience");
      for (const exp of cv.experience) {
        periodRow(ctx, exp.role || "", periodOf(exp), { leftFs: 11, bold: true });
        const comp = [exp.company, exp.location].filter(Boolean).join(" · ");
        deterministicLine(ctx, comp, { fs: 10, color: SIENNA, spaceAfter: 1.5 });
        for (const bul of visibleBullets(exp)) {
          bullet(ctx, "•", bul.rewrite || bul.original, { fs: 9.6, glyphColor: SIENNA });
        }
        b.cursorY += 2;
      }
    },
    education: () => {
      sectionTitle("Education");
      for (const ed of cv.education) {
        periodRow(ctx, ed.qualification, ed.period, { leftFs: 10.5, bold: true });
        if (ed.institution) b.addText({ value: ed.institution, fontSize: 10, color: SIENNA, spaceAfter: 3 });
      }
    },
    skills: () => {
      sectionTitle("Skills & Competencies");
      renderTwoColList(b, SIENNA, cv.skills, "•");
    },
    competencies: () => {
      sectionTitle("Core Competencies");
      for (const c of cv.competencyClusters) {
        inlineCluster(ctx, c, { titleFs: 10, titleColor: SIENNA, itemsFs: 10, itemsColor: SUBINK });
      }
    },
    languages: () => {
      sectionTitle("Languages");
      langBulletList(ctx, { fs: 10, color: SUBINK, glyphColor: SIENNA });
      b.cursorY += 1;
    },
    achievements: () => {
      sectionTitle("Achievements");
      for (const a of cv.achievements.filter(Boolean)) {
        bullet(ctx, "•", a, { fs: 9.6, glyphColor: SIENNA });
      }
      b.cursorY += 2;
    },
    certifications: () => {
      sectionTitle("Certifications");
      for (const c of cv.certifications) {
        const left = c.issuer ? `${c.name} — ${c.issuer}` : c.name;
        periodRow(ctx, left, c.date || "", { leftFs: 10, bold: false, glyph: "»", glyphColor: SIENNA });
      }
      b.cursorY += 2;
    },
    custom: () => {
      for (const s of cv.customSections) {
        sectionTitle(s.title || "Additional");
        for (const it of s.bullets.filter(Boolean)) {
          bullet(ctx, "•", it, { fs: 9.6, glyphColor: SIENNA });
        }
        b.cursorY += 2;
      }
    },
  };

  for (const k of getSectionOrder(cv)) {
    if (shouldRender(cv, k)) bodyRenderers[k]?.();
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
  const b = createBuilder({ margin: 18, top: 22, bottom: 22 });
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

  if (shouldRender(cv, "summary")) {
    sectionTitle("Executive Summary");
    const fs = 10.5;
    const lh = 1.75;
    const indent = 6;
    const w = b.contentW - indent;
    const h = textHeightMm(cv.summary, w, fs, lh);
    b.ensure(h + 2);
    const py = b.cursorY;
    b.addLine({ x: b.margin, y: py, width: 0.9, height: h, color: SIENNA });
    b.addText({ value: cv.summary, x: b.margin + indent, y: py, width: w, fontSize: fs, color: SUBINK, lineHeight: lh, align: "justify" });
    b.cursorY = py + h + 7;
  }

  const bodyRenderers: Partial<Record<SectionKey, () => void>> = {
    experience: () => {
      sectionTitle("Professional Experience");
      cv.experience.forEach((exp, i) => {
        periodRow(ctx, exp.role || "", periodOf(exp), { leftFs: 12.5, bold: true });
        const comp = [exp.company, exp.location].filter(Boolean).join(" · ");
        deterministicLine(ctx, comp, { fs: 10.5, color: SIENNA, spaceAfter: 2 });
        for (const bul of visibleBullets(exp)) {
          bullet(ctx, "›", bul.rewrite || bul.original, { fs: 10, lh: 1.7, glyphColor: SIENNA });
        }
        if (i < cv.experience.length - 1) b.cursorY += 4;
      });
      b.cursorY += 3;
    },
    education: () => {
      sectionTitle("Education");
      for (const ed of cv.education) {
        periodRow(ctx, ed.qualification, ed.period, { leftFs: 11.5, bold: true });
        if (ed.institution) b.addText({ value: ed.institution, fontSize: 10.5, color: SIENNA, spaceAfter: 4 });
      }
    },
    skills: () => {
      sectionTitle("Key Skills");
      const gap = 8;
      const colW = (b.contentW - gap) / 2;
      const fs = 10.5;
      const lh = 1.55;
      const glyph = "›";
      const glyphW = 4;
      const textW = colW - glyphW;
      for (let i = 0; i < cv.skills.length; i += 2) {
        const l = cv.skills[i];
        const r = cv.skills[i + 1];
        const h = Math.max(
          textHeightMm(l, textW, fs, lh),
          r ? textHeightMm(r, textW, fs, lh) : 0,
          ptToMm(fs) * lh,
        );
        b.ensure(h + 0.6);
        const py = b.cursorY;
        b.addText({ value: glyph, x: b.margin, y: py, width: glyphW, fontSize: fs, color: SIENNA, bold: true, lineHeight: lh });
        b.addText({ value: l, x: b.margin + glyphW, y: py, width: textW, fontSize: fs, color: SUBINK, lineHeight: lh });
        if (r) {
          b.addText({ value: glyph, x: b.margin + colW + gap, y: py, width: glyphW, fontSize: fs, color: SIENNA, bold: true, lineHeight: lh });
          b.addText({ value: r, x: b.margin + colW + gap + glyphW, y: py, width: textW, fontSize: fs, color: SUBINK, lineHeight: lh });
        }
        b.cursorY = py + h + 1.2;
      }
      b.cursorY += 3;
    },
    competencies: () => {
      sectionTitle("Core Competency Areas");
      for (const c of cv.competencyClusters) {
        inlineCluster(ctx, c, { titleFs: 10.5, titleColor: SIENNA, itemsFs: 10.5, itemsColor: SUBINK });
      }
      b.cursorY += 2;
    },
    languages: () => {
      sectionTitle("Languages");
      langBulletList(ctx, { fs: 10.5, color: SUBINK, glyphColor: SIENNA, lh: 1.6 });
      b.cursorY += 2;
    },
    achievements: () => {
      sectionTitle("Key Achievements");
      for (const a of cv.achievements.filter(Boolean)) {
        bullet(ctx, "›", a, { fs: 10, lh: 1.7, glyphColor: SIENNA });
      }
      b.cursorY += 3;
    },
    certifications: () => {
      sectionTitle("Certifications");
      for (const c of cv.certifications) {
        const left = c.issuer ? `${c.name} — ${c.issuer}` : c.name;
        periodRow(ctx, left, c.date || "", { leftFs: 10.5, bold: false, glyph: "»", glyphColor: SIENNA });
      }
      b.cursorY += 2;
    },
    custom: () => {
      for (const s of cv.customSections) {
        sectionTitle(s.title || "Additional");
        for (const it of s.bullets.filter(Boolean)) {
          bullet(ctx, "›", it, { fs: 10, lh: 1.7, glyphColor: SIENNA });
        }
        b.cursorY += 3;
      }
    },
  };

  for (const k of getSectionOrder(cv)) {
    if (shouldRender(cv, k)) bodyRenderers[k]?.();
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
    const rows: { display: string; uri?: string }[] = [
      ...(cv.contact.location ? [{ display: cv.contact.location }] : []),
      ...(cv.contact.phone ? [{ display: cv.contact.phone }] : []),
      ...(cv.contact.email ? [{ display: cv.contact.email, uri: `mailto:${cv.contact.email}` }] : []),
      ...(cv.contact.linkedinUrl ? [{ display: stripUrlPrefix(cv.contact.linkedinUrl), uri: cv.contact.linkedinUrl }] : []),
      ...(cv.contact.website ? [{ display: stripUrlPrefix(cv.contact.website), uri: cv.contact.website }] : []),
    ];
    const rfs = 8.6;
    let ry = hy0;
    for (const r of rows) {
      const rh = textHeightMm(r.display, rightW, rfs, 1.45);
      b.addText({ value: r.display, x: b.margin + b.contentW - rightW, y: ry, width: rightW, fontSize: rfs, color: MUTED, align: "right", lineHeight: 1.45 });
      if (r.uri) b.addLink({ x: b.margin + b.contentW - Math.min(textWidthMm(r.display, rfs), rightW), y: ry, width: Math.min(textWidthMm(r.display, rfs), rightW), height: ptToMm(rfs) * 1.45, uri: withScheme(r.uri) });
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
  if (shouldRender(cv, "summary")) {
    b.cursorY = lY;
    tinyTitle("Summary", leftX, leftColW);
    lY = b.cursorY;
    const fs = 9.8;
    const lh = 1.6;
    const sh = textHeightMm(cv.summary, leftColW, fs, lh);
    b.addText({ value: cv.summary, x: leftX, y: lY, width: leftColW, fontSize: fs, color: SUBINK, lineHeight: lh, align: "justify" });
    lY += sh + 4;
  }

  // ---- RIGHT: Skills + Languages (these stay pinned in the sidebar) ----
  let rY = topY;
  if (shouldRender(cv, "skills")) {
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
  if (shouldRender(cv, "languages")) {
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

  // ---- Full-width body (ordered) ----
  const fullWidthRenderers: Partial<Record<SectionKey, () => void>> = {
    experience: () => {
      fullSectionTitle("Work Experience");
      for (const exp of cv.experience) {
        periodRow(ctx, exp.role || "", periodOf(exp), { leftFs: 10.5, bold: true });
        const comp = [exp.company, exp.location].filter(Boolean).join(" · ");
        deterministicLine(ctx, comp, { fs: 9.8, color: SIENNA, spaceAfter: 1.5 });
        for (const bul of visibleBullets(exp)) bullet(ctx, "•", bul.rewrite || bul.original, { fs: 9.4, glyphColor: SIENNA });
        b.cursorY += 1.8;
      }
    },
    education: () => {
      fullSectionTitle("Education");
      for (const ed of cv.education) {
        periodRow(ctx, ed.qualification, ed.period, { leftFs: 10, bold: true });
        if (ed.institution) b.addText({ value: ed.institution, fontSize: 9.8, color: SIENNA, spaceAfter: 3 });
      }
    },
    competencies: () => {
      fullSectionTitle("Core Competencies");
      for (const c of cv.competencyClusters) {
        inlineCluster(ctx, c, { titleFs: 9.8, titleColor: SIENNA, itemsFs: 9.8, itemsColor: SUBINK });
      }
    },
    achievements: () => {
      fullSectionTitle("Achievements");
      for (const a of cv.achievements.filter(Boolean)) {
        bullet(ctx, "•", a, { fs: 9.4, glyphColor: SIENNA });
      }
      b.cursorY += 2;
    },
    certifications: () => {
      fullSectionTitle("Certifications");
      for (const c of cv.certifications) {
        const left = c.issuer ? `${c.name} — ${c.issuer}` : c.name;
        periodRow(ctx, left, c.date || "", { leftFs: 10, bold: false, glyph: "»", glyphColor: SIENNA });
      }
      b.cursorY += 2;
    },
    custom: () => {
      for (const s of cv.customSections) {
        fullSectionTitle(s.title || "Additional");
        for (const it of s.bullets.filter(Boolean)) {
          bullet(ctx, "•", it, { fs: 9.4, glyphColor: SIENNA });
        }
        b.cursorY += 2;
      }
    },
  };

  for (const k of getSectionOrder(cv)) {
    if (k === "skills" || k === "languages") continue; // pinned in sidebar
    if (shouldRender(cv, k)) fullWidthRenderers[k]?.();
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

  const SECTION_DIV = mixHex(INK, "#ffffff", 0.78);
  let renderedAny = false;
  const sep = () => {
    if (!renderedAny) return;
    b.ensure(6);
    b.cursorY += 2.5;
    b.addLine({ x: b.margin, y: b.cursorY, width: b.contentW, height: 0.5, color: SECTION_DIV });
    b.cursorY += 4.5;
  };
  const runSection = (fn: () => void) => {
    sep();
    fn();
    renderedAny = true;
  };

  if (shouldRender(cv, "summary")) {
    runSection(() => {
      sectionTitle("Professional Summary");
      b.addText({ value: cv.summary, fontSize: 9.8, color: SUBINK, lineHeight: 1.7, spaceAfter: 6, align: "justify" });
    });
  }

  const bodyRenderers: Partial<Record<SectionKey, () => void>> = {
    skills: () => {
      sectionTitle("Skills & Competencies");
      renderChips(b, cv.skills);
      b.cursorY += 4;
    },
    experience: () => {
      sectionTitle("Work Experience");
      cv.experience.forEach((exp, idx) => {
        periodRow(ctx, exp.role || "", periodOf(exp), { leftFs: 11.5, bold: true });
        const comp = [exp.company, exp.location].filter(Boolean).join(" · ");
        deterministicLine(ctx, comp, { fs: 9.8, color: SIENNA, spaceAfter: 1.8 });
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
    },
    education: () => {
      sectionTitle("Education");
      for (const ed of cv.education) {
        periodRow(ctx, ed.qualification, ed.period, { leftFs: 10.5, bold: true });
        if (ed.institution) b.addText({ value: ed.institution, fontSize: 9.8, color: SIENNA, spaceAfter: 3.5 });
      }
    },
    competencies: () => {
      sectionTitle("Core Competencies");
      for (const c of cv.competencyClusters) {
        inlineCluster(ctx, c, { titleFs: 9.8, titleColor: SIENNA, itemsFs: 9.8, itemsColor: SUBINK, bulletIcon: true });
      }
    },
    languages: () => {
      sectionTitle("Languages");
      langBulletList(ctx, { fs: 9.8, color: SUBINK, glyphColor: SIENNA, lh: 1.5 });
      b.cursorY += 1;
    },
    achievements: () => {
      sectionTitle("Achievements");
      for (const a of cv.achievements.filter(Boolean)) {
        bullet(ctx, "›", a, { fs: 9.4, lh: 1.6, glyphColor: SIENNA });
      }
      b.cursorY += 2;
    },
    certifications: () => {
      sectionTitle("Certifications");
      for (const c of cv.certifications) {
        const left = c.issuer ? `${c.name} — ${c.issuer}` : c.name;
        periodRow(ctx, left, c.date || "", { leftFs: 10, bold: false, glyph: "»", glyphColor: SIENNA });
      }
      b.cursorY += 2;
    },
    custom: () => {
      for (const s of cv.customSections) {
        sectionTitle(s.title || "Additional");
        for (const it of s.bullets.filter(Boolean)) {
          bullet(ctx, "›", it, { fs: 9.4, lh: 1.6, glyphColor: SIENNA });
        }
        b.cursorY += 2;
      }
    },
  };

  for (const k of getSectionOrder(cv)) {
    if (shouldRender(cv, k)) {
      const fn = bodyRenderers[k];
      if (fn) runSection(fn);
    }
  }
  return b;
}

function renderChips(b: PdfmeBuilder, items: string[]) {
  const fs = 9.2;
  const padX = 3;
  const padY = 1.6;
  const lh = 1.2;
  const lineH = ptToMm(fs) * lh;
  const singleLineH = lineH + padY * 2;
  const gap = 2;
  const singleLineBuffer = 2.4;
  let x = b.margin;
  let y = b.cursorY;
  const maxX = b.margin + b.contentW;
  b.ensure(singleLineH + 0.4);
  y = b.cursorY;

  for (const it of items) {
    const innerMax = b.contentW - padX * 2;
    // Binary search smallest inner width that still keeps the chip text on
    // a single line. Falls back to full width when the text genuinely wraps.
    let innerW = innerMax;
    const canStaySingleLine = wrapLines(it, innerMax, fs).length === 1;
    if (canStaySingleLine) {
      let lo = 4, hi = innerMax;
      while (lo < hi - 0.5) {
        const mid = (lo + hi) / 2;
        if (wrapLines(it, mid, fs).length === 1) hi = mid;
        else lo = mid;
      }
      innerW = Math.min(innerMax, hi + singleLineBuffer);
    }
    const lines = wrapLines(it, innerW, fs);
    const chipW = Math.min(b.contentW, innerW + padX * 2);
    const chipH = lineH * lines.length + padY * 2 + 0.4;

    if (x !== b.margin && x + chipW > maxX) {
      x = b.margin;
      y += singleLineH + gap;
    }
    if (y + chipH > b.PAGE_H - b.bottom) {
      b.cursorY = y;
      b.newPage();
      y = b.cursorY;
    }

    b.addRect({
      x, y, width: chipW, height: chipH,
      color: mixHex(SIENNA, "#ffffff", 0.9), borderColor: mixHex(SIENNA, "#ffffff", 0.65), borderWidth: 0.3,
      radius: singleLineH / 2,
    });
    lines.forEach((line, index) => {
      b.addText({
        value: line,
        x: x + padX,
        y: y + padY * 0.75 + index * lineH,
        width: chipW - padX * 2 - 0.6,
        fontSize: fs,
        color: INK,
        lineHeight: lh,
      });
    });
    x += chipW + gap;
    if (lines.length > 1) {
      x = b.margin;
      y += chipH + gap;
    }
  }
  b.cursorY = y + singleLineH + 1;
}

/* ============================================================
 *  RIYADH
 *  - Dark sienna left sidebar (full page height) with photo,
 *    contact, skills, languages. Right column flows
 *    summary/experience/education with restrained type.
 * ============================================================ */
const PAPER = "#f5f0e8";

async function buildRiyadh(
  cv: GeneratedCV,
  photoUrl: string | null,
  sidebarKeys: SectionKey[] = ["skills", "languages", "education"],
  variant: "bold" | "vibrant" = "bold",
) {
  const b = createBuilder({ margin: 0, top: 0, bottom: 14 });
  const SIDEBAR_W = 64; // mm
  const MAIN_X = SIDEBAR_W;
  const MAIN_W = PAGE_W - SIDEBAR_W;
  const PADX = 7;        // left padding inside sidebar
  const PAD_R = 4;       // tighter right padding so text column is wider
  const SIDE_TW = SIDEBAR_W - PADX - PAD_R; // usable sidebar text width
  const MAIN_MARGIN = MAIN_X + 10 + 2;
  const MAIN_CONTENT_W = MAIN_W - 10 * 2 - 2;
  // Sidebar fill = palette accent shaded 22% toward black so white text stays legible.
  const sidebarFill = shadeHex(SIENNA, 0.22);
  const inSidebar = (k: SectionKey) => sidebarKeys.includes(k);

  // Draw sidebar background on every page.
  const drawSidebar = () => {
    b.addRect({
      x: 0, y: 0, width: SIDEBAR_W, height: b.PAGE_H,
      color: sidebarFill, borderColor: sidebarFill, borderWidth: 0,
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
      value: label.toUpperCase(), x: PADX, y: sY, width: SIDE_TW,
      fontSize: 9, color: PAPER, bold: true, letterSpacing: 1.2,
    });
    sY += ptToMm(9) * 1.25 + 0.6;
    b.addLine({ x: PADX, y: sY, width: SIDE_TW, height: 0.25, color: mixHex(SIENNA, "#ffffff", 0.45) });
    sY += 2.4;
  };

  const sideRow = (label: string | null, value: string, uri?: string) => {
    if (label) {
      b.addText({
        value: label.toUpperCase(), x: PADX, y: sY, width: SIDE_TW,
        fontSize: 6.8, color: mixHex(SIENNA, "#ffffff", 0.8), bold: true, letterSpacing: 1.2,
      });
      sY += ptToMm(6.8) * 1.4 + 0.2;
    }
    const h = textHeightMm(value, SIDE_TW, 8.4, 1.45);
    b.addText({
      value,
      x: PADX, y: sY, width: SIDE_TW,
      fontSize: 8.4, color: PAPER, lineHeight: 1.45,
    });
    if (uri) b.addLink({ x: PADX, y: sY, width: SIDE_TW, height: h, uri: withScheme(uri) });
    sY += h + 1.6;
  };

  if (shouldRender(cv, "contact")) {
    const ICON_MM = 3.2;
    const TEXT_X = PADX + ICON_MM + 1.8;
    const TW = SIDEBAR_W - PAD_R - TEXT_X;
    const FS = 8.4;
    const contactRow = async (iconSvg: string, value: string, uri?: string) => {
      const data = await svgToPngDataUrl(iconSvg);
      b.addImage({ x: PADX, y: sY + 0.3, w: ICON_MM, h: ICON_MM, data });
      const h = textHeightMm(value, TW, FS, 1.45);
      b.addText({ value, x: TEXT_X, y: sY, width: TW, fontSize: FS, color: PAPER, lineHeight: 1.45 });
      if (uri) b.addLink({ x: TEXT_X, y: sY, width: TW, height: h, uri: withScheme(uri) });
      sY += Math.max(h, ICON_MM) + 1.8;
    };
    if (cv.contact.location) await contactRow(ICON_SVGS.mapPin, cv.contact.location);
    if (cv.contact.phone) await contactRow(ICON_SVGS.phone, cv.contact.phone);
    if (cv.contact.email) await contactRow(ICON_SVGS.mail, cv.contact.email, `mailto:${cv.contact.email}`);
    if (cv.contact.linkedinUrl) await contactRow(ICON_SVGS.linkedin, stripUrlPrefix(cv.contact.linkedinUrl), cv.contact.linkedinUrl);
    if (cv.contact.website) await contactRow(ICON_SVGS.globe, stripUrlPrefix(cv.contact.website), cv.contact.website);
    sY += 4;
  }


  const sideRenderers: Partial<Record<SectionKey, () => void>> = {
    skills: () => {
      if (!cv.skills.length) return;
      sideHeading("Skills");
      if (variant === "vibrant") {
        const widths = [92, 88, 96, 84, 90, 86, 94, 82];
        const trackColor = mixHex(SIENNA, "#ffffff", 0.18);
        for (let i = 0; i < cv.skills.length; i++) {
          const sk = cv.skills[i];
          const h = textHeightMm(sk, SIDE_TW, 8.4, 1.4);
          b.addText({ value: sk, x: PADX, y: sY, width: SIDE_TW, fontSize: 8.4, color: PAPER, lineHeight: 1.4 });
          sY += h + 1.2;
          const barY = sY;
          b.addRect({ x: PADX, y: barY, width: SIDE_TW, height: 1.0, color: trackColor, borderColor: trackColor, borderWidth: 0, radius: 0.5 });
          const fillW = (SIDE_TW * widths[i % widths.length]) / 100;
          b.addRect({ x: PADX, y: barY, width: fillW, height: 1.0, color: SIENNA, borderColor: SIENNA, borderWidth: 0, radius: 0.5 });
          sY += 1.0 + 2.4;
        }
        sY += 2;
      } else {
        for (const sk of cv.skills) {
          const tw = SIDE_TW - 3;
          const h = textHeightMm(sk, tw, 8.6, 1.5);
          b.addText({ value: "•", x: PADX, y: sY, width: 3, fontSize: 9.2, color: SIENNA, bold: true });
          b.addText({ value: sk, x: PADX + 3, y: sY, width: tw, fontSize: 8.6, color: PAPER, lineHeight: 1.5 });
          sY += h + 1.6;
        }
        sY += 3;
      }
    },
    languages: () => {
      if (!cv.languages.length) return;
      sideHeading("Languages");
      if (variant === "vibrant") {
        const dotColorOn = SIENNA;
        const dotColorOff = mixHex(SIENNA, "#ffffff", 0.22);
        for (const l of cv.languages) {
          const lvl = (l.level || "").toLowerCase();
          const filled =
            lvl.includes("native") || lvl.includes("fluent") ? 5 :
            lvl.includes("professional") ? 4 :
            lvl.includes("conversational") ? 3 :
            lvl.includes("basic") ? 2 : 4;
          const dotsW = 5 * 1.4 + 4 * 0.8;
          const labelW = SIDE_TW - dotsW - 2;
          b.addText({ value: l.name, x: PADX, y: sY, width: labelW, fontSize: 8.4, color: PAPER, bold: true, lineHeight: 1.3 });
          const dotsX = PADX + SIDE_TW - dotsW;
          for (let i = 0; i < 5; i++) {
            const cx = dotsX + i * (1.4 + 0.8);
            b.addRect({ x: cx, y: sY + 1.2, width: 1.4, height: 1.4, color: i < filled ? dotColorOn : dotColorOff, borderColor: "", borderWidth: 0, radius: 0.7 });
          }
          sY += ptToMm(8.4) * 1.3 + 0.4;
          if (l.level) {
            b.addText({ value: l.level, x: PADX, y: sY, width: SIDE_TW, fontSize: 7, color: mixHex(SIENNA, "#ffffff", 0.55), lineHeight: 1.3 });
            sY += ptToMm(7) * 1.3 + 1.4;
          } else {
            sY += 1.2;
          }
        }
        sY += 2;
      } else {
        for (const l of cv.languages) {
          const display = l.level?.trim() ? `${l.name} — ${l.level}` : l.name;
          sideRow(null, display);
        }
        sY += 3;
      }
    },
    education: () => {
      if (!cv.education.length) return;
      sideHeading("Education");
      for (const ed of cv.education) {
        if (ed.qualification) sideRow(null, ed.qualification);
        if (ed.institution) {
          const tw = SIDE_TW;
          const h = textHeightMm(ed.institution, tw, 7.6, 1.4);
          b.addText({ value: ed.institution, x: PADX, y: sY, width: tw, fontSize: 7.6, color: mixHex(SIENNA, "#ffffff", 0.7), lineHeight: 1.4 });
          sY += h + 0.6;
        }
        if (ed.period) {
          b.addText({ value: ed.period, x: PADX, y: sY, width: SIDE_TW, fontSize: 7, color: mixHex(SIENNA, "#ffffff", 0.55) });
          sY += ptToMm(7) * 1.4 + 1.4;
        } else {
          sY += 1.2;
        }
      }
      sY += 2;
    },
    certifications: () => {
      if (!cv.certifications.length) return;
      sideHeading("Certifications");
      for (const c of cv.certifications) {
        if (c.name) sideRow(null, c.name);
        if (c.issuer) {
          b.addText({ value: c.issuer, x: PADX, y: sY, width: SIDE_TW, fontSize: 7.6, color: mixHex(SIENNA, "#ffffff", 0.7), lineHeight: 1.4 });
          sY += ptToMm(7.6) * 1.4 + 0.6;
        }
        if (c.date) {
          b.addText({ value: c.date, x: PADX, y: sY, width: SIDE_TW, fontSize: 7, color: mixHex(SIENNA, "#ffffff", 0.55) });
          sY += ptToMm(7) * 1.4 + 1.4;
        } else {
          sY += 1.2;
        }
      }
      sY += 2;
    },
  };

  for (const k of (["skills", "education", "languages", "certifications"] as SectionKey[])) {
    if (inSidebar(k) && shouldRender(cv, k)) sideRenderers[k]?.();
  }

  // ---- Main column ----
  b.margin = MAIN_MARGIN;
  b.contentW = MAIN_CONTENT_W;
  b.cursorY = 16;
  const ctx2: Ctx = { cv, primary: SIENNA, b };

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
    if (variant === "vibrant") {
      const sq = 3.4;
      const gap = 2.2;
      const yTop = b.cursorY + 0.4;
      b.addRect({ x: b.margin, y: yTop, width: sq, height: sq, color: SIENNA, borderColor: SIENNA, borderWidth: 0, radius: 0.6 });
      b.addText({
        value: label.toUpperCase(),
        x: b.margin + sq + gap,
        y: b.cursorY,
        width: b.contentW - sq - gap,
        fontSize: 11.5, color: INK, bold: true, letterSpacing: 1.6,
      });
      b.cursorY += ptToMm(11.5) * 1.25 + 0.6;
      b.addLine({ x: b.margin, y: b.cursorY, width: b.contentW, height: 0.25, color: mixHex(SIENNA, "#ffffff", 0.55) });
      b.cursorY += 3.2;
    } else {
      b.addText({
        value: label.toUpperCase(), fontSize: 11.5, color: INK, bold: true,
        letterSpacing: 1.6, spaceAfter: 1.2,
      });
      b.addLine({ x: b.margin, y: b.cursorY, width: 14, height: 0.7, color: SIENNA });
      b.cursorY += 3.4;
    }
  };

  if (shouldRender(cv, "summary")) {
    mainHeading("Profile");
    b.addText({ value: cv.summary, fontSize: 9.7, color: SUBINK, lineHeight: 1.65, spaceAfter: 5, align: "justify" });
  }

  const mainRenderers: Partial<Record<SectionKey, () => void>> = {
    experience: () => {
      mainHeading("Experience");
      for (const exp of cv.experience) {
        periodRow(ctx2, exp.role || "", periodOf(exp), { leftFs: 11, bold: true });
        const comp = [exp.company, exp.location].filter(Boolean).join(" · ");
        deterministicLine(ctx2, comp, { fs: 9.5, color: SIENNA, bold: true, spaceAfter: 1.5 });
        for (const bul of visibleBullets(exp)) {
          bullet(ctx2, "•", bul.rewrite || bul.original, { fs: 9.4, glyphColor: SIENNA });
        }
        b.cursorY += 2.4;
      }
    },
    skills: () => {
      if (!cv.skills.length) return;
      mainHeading("Skills");
      const text = cv.skills.join(" · ");
      b.addText({ value: text, fontSize: 9.6, color: SUBINK, lineHeight: 1.6, spaceAfter: 4 });
    },
    languages: () => {
      if (!cv.languages.length) return;
      mainHeading("Languages");
      langBulletList(ctx2, { fs: 9.6, color: SUBINK, glyphColor: SIENNA });
      b.cursorY += 2;
    },
    education: () => {
      mainHeading("Education");
      for (const ed of cv.education) {
        periodRow(ctx2, ed.qualification, ed.period, { leftFs: 10.5, bold: true });
        if (ed.institution) b.addText({ value: ed.institution, fontSize: 9.6, color: SIENNA, bold: true, spaceAfter: 3 });
      }
    },
    competencies: () => {
      mainHeading("Core Competencies");
      for (const c of cv.competencyClusters) {
        inlineCluster(ctx2, c, { titleFs: 9.6, titleColor: SIENNA, itemsFs: 9.6, itemsColor: SUBINK });
      }
    },
    achievements: () => {
      mainHeading("Achievements");
      for (const a of cv.achievements.filter(Boolean)) {
        bullet(ctx2, "•", a, { fs: 9.4, glyphColor: SIENNA });
      }
      b.cursorY += 2;
    },
    certifications: () => {
      mainHeading("Certifications");
      for (const c of cv.certifications) {
        const left = c.issuer ? `${c.name} — ${c.issuer}` : c.name;
        periodRow(ctx2, left, c.date || "", { leftFs: 10, bold: false, glyph: "»", glyphColor: SIENNA });
      }
      b.cursorY += 2;
    },
    custom: () => {
      for (const s of cv.customSections) {
        mainHeading(s.title || "Additional");
        for (const it of s.bullets.filter(Boolean)) {
          bullet(ctx2, "•", it, { fs: 9.4, glyphColor: SIENNA });
        }
        b.cursorY += 2;
      }
    },
  };

  for (const k of getSectionOrder(cv)) {
    // Skip sections that the user has pinned in the sidebar.
    if (inSidebar(k)) continue;
    if (!shouldRender(cv, k)) continue;
    mainRenderers[k]?.();
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
    const contactRuns = contactLinkItems(cv);
    const contact = contactRuns.map((r) => r.label).join("   ·   ");
    if (contact) {
      const ch = textHeightMm(contact, textW, 8.4, 1.4);
      b.addText({ value: contact, x: textX, y: ty, width: textW, fontSize: 8.4, color: MUTED, lineHeight: 1.4 });
      addContactLinks(b, contactRuns, { x: textX, y: ty, width: textW, fontSize: 8.4, lineHeight: 1.4 });
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

  if (shouldRender(cv, "summary")) {
    sectionTitle("Profile");
    b.addText({ value: cv.summary, fontSize: 10, color: SUBINK, lineHeight: 1.75, spaceAfter: 6, align: "justify" });
  }

  const bodyRenderers: Partial<Record<SectionKey, () => void>> = {
    experience: () => {
      sectionTitle("Career Timeline");
      const railX = b.margin + 1.2;
      const indent = 6;
      const startY = b.cursorY;
      cv.experience.forEach((exp, idx) => {
        b.ensure(8);
        const dotY = b.cursorY + 1.2;
        b.addRect({
          x: railX - 1.4, y: dotY, width: 2.8, height: 2.8,
          color: PAPER, borderColor: SIENNA, borderWidth: 0.6, radius: 1.4,
        });
        const savedMargin = (b as unknown as { margin: number }).margin;
        const savedContentW = (b as unknown as { contentW: number }).contentW;
        (b as unknown as { margin: number }).margin = savedMargin + indent;
        (b as unknown as { contentW: number }).contentW = savedContentW - indent;

        periodRow({ cv, primary: SIENNA, b }, exp.role || "", periodOf(exp), { leftFs: 11.5, bold: true });
        const comp = [exp.company, exp.location].filter(Boolean).join(" · ");
        deterministicLine({ cv, primary: SIENNA, b }, comp, { fs: 9.6, color: SIENNA, bold: true, spaceAfter: 1.8 });
        for (const bul of visibleBullets(exp)) {
          bullet({ cv, primary: SIENNA, b }, "—", bul.rewrite || bul.original, { fs: 9.4, lh: 1.65, glyphColor: SIENNA });
        }

        (b as unknown as { margin: number }).margin = savedMargin;
        (b as unknown as { contentW: number }).contentW = savedContentW;
        if (idx < cv.experience.length - 1) b.cursorY += 3.6;
      });
      const endY = b.cursorY;
      b.addLine({ x: railX, y: startY + 2.6, width: 0.3, height: endY - startY - 4, color: "#d8cfc1" });
      b.cursorY += 4;
    },
    education: () => {
      sectionTitle("Education");
      for (const ed of cv.education) {
        periodRow(ctx, ed.qualification, ed.period, { leftFs: 11, bold: true });
        if (ed.institution) b.addText({ value: ed.institution, fontSize: 9.6, color: SIENNA, bold: true, spaceAfter: 3 });
      }
    },
    skills: () => {
      sectionTitle("Skills");
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
    },
    competencies: () => {
      sectionTitle("Core Competencies");
      for (const c of cv.competencyClusters) {
        inlineCluster(ctx, c, { titleFs: 9.8, titleColor: SIENNA, itemsFs: 9.8, itemsColor: SUBINK });
      }
    },
    languages: () => {
      sectionTitle("Languages");
      langBulletList(ctx, { fs: 9.8, color: SUBINK, glyphColor: SIENNA, lh: 1.5 });
      b.cursorY += 1;
    },
    achievements: () => {
      sectionTitle("Achievements");
      for (const a of cv.achievements.filter(Boolean)) {
        bullet(ctx, "—", a, { fs: 9.4, lh: 1.65, glyphColor: SIENNA });
      }
      b.cursorY += 2;
    },
    certifications: () => {
      sectionTitle("Certifications");
      for (const c of cv.certifications) {
        const left = c.issuer ? `${c.name} — ${c.issuer}` : c.name;
        periodRow(ctx, left, c.date || "", { leftFs: 10, bold: false, glyph: "»", glyphColor: SIENNA });
      }
      b.cursorY += 2;
    },
    custom: () => {
      for (const s of cv.customSections) {
        sectionTitle(s.title || "Additional");
        for (const it of s.bullets.filter(Boolean)) {
          bullet(ctx, "—", it, { fs: 9.4, lh: 1.65, glyphColor: SIENNA });
        }
        b.cursorY += 2;
      }
    },
  };

  for (const k of getSectionOrder(cv)) {
    if (shouldRender(cv, k)) bodyRenderers[k]?.();
  }
  void HAIRLINE;
  return b;
}

/* ============================================================
 * Public entry — routes to the right builder.
 * ============================================================ */
export interface PdfmeOptions {
  accentHex?: string | null;
  photoShape?: "circle" | "square" | "none";
  /** Per-section sidebar/main overrides for multi-column templates. */
  sidebarPlacement?: SidebarPlacementMap;
}

export async function exportCvPdfme(
  cv: GeneratedCV,
  photoUrl: string | null,
  templateId: TemplateId | string,
  fileName: string,
  opts?: PdfmeOptions,
) {
  const blob = await generateCvPdfmeBlob(cv, photoUrl, templateId, opts);
  const { saveAs } = await import("file-saver");
  saveAs(blob, fileName);
}

export async function generateCvPdfmeBlob(
  cv: GeneratedCV,
  photoUrl: string | null,
  templateId: TemplateId | string,
  opts?: PdfmeOptions,
) {
  const { setAccent, maskImageCircle } = await import("./core");
  setAccent(opts?.accentHex ?? null);
  let effectivePhoto = opts?.photoShape === "none" ? null : photoUrl;
  if (effectivePhoto && opts?.photoShape === "circle") {
    effectivePhoto = (await maskImageCircle(effectivePhoto)) ?? effectivePhoto;
  }
  const sidebarKeys = resolveSidebarKeys(opts?.sidebarPlacement);
  let b: PdfmeBuilder;
  switch (normalizeTemplateId(templateId)) {
    case "traditional":  b = await buildClassic(cv, effectivePhoto); break;
    case "executive":    b = await buildExecutive(cv, effectivePhoto); break;
    case "detailed":     b = await buildCompact(cv, effectivePhoto); break;
    case "skills":       b = await buildSkillsFirst(cv, effectivePhoto); break;
    case "bold":         b = await buildRiyadh(cv, effectivePhoto, sidebarKeys); break;
    case "editorial":    b = await buildGeneva(cv, effectivePhoto); break;
    // New templates currently route to the closest existing PDF builder.
    case "vibrant":      b = await buildRiyadh(cv, effectivePhoto, sidebarKeys, "vibrant"); break;
    case "gradient":     b = await buildModern(cv, effectivePhoto); break;
    case "creative":     b = await buildGeneva(cv, effectivePhoto); break;
    case "simple":
    default:             b = await buildModern(cv, effectivePhoto);
  }
  return b.toBlob();
}

void PAGE_W;

