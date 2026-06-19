import { normalizeTemplateId, type GeneratedCV, type SectionKey, type TemplateId } from "@/contexts/CVBuilderContext";
import {
  contactItems, contactLinkItems, isHidden, periodOf, visibleBullets, stripUrlPrefix, withScheme,
  getSectionOrder, shouldRender,
} from "./helpers";
import {
  createBuilder, urlToDataUrl, textHeightMm, textWidthMm, ptToMm, wrapLines,
  INK, SUBINK, MUTED, HAIRLINE, SIENNA, PAGE_W, FONT_DISPLAY_ITALIC,
  FONT_DISPLAY_ACTIVE, FONT_DISPLAY_REGULAR_ACTIVE, FONT_BODY_ACTIVE, FONT_BODY_BOLD_ACTIVE,
  setFontTheme, type FontStyleId,
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
  user: `<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>`,
  briefcase: `<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>`,
  graduationCap: `<path d="M22 10v6"/><path d="M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>`,
  sparkles: `<path d="M12 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2z"/><path d="M19 14l1 2 2 1-2 1-1 2-1-2-2-1 2-1z"/>`,
  languages: `<path d="M5 8h10"/><path d="M9 4v4"/><path d="M5 12c2 4 5 6 8 7"/><path d="M15 21l4-10 4 10"/><path d="M16 18h6"/>`,
  badgeCheck: `<path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76z"/><path d="m9 12 2 2 4-4"/>`,
  award: `<circle cx="12" cy="8" r="6"/><path d="M15.5 13.5L17 22l-5-3-5 3 1.5-8.5"/>`,
  fileText: `<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M8 13h8"/><path d="M8 17h8"/>`,
  check: `<path d="M20 6 9 17l-5-5"/>`,
};

const SECTION_ICON: Partial<Record<SectionKey, keyof typeof ICON_SVGS>> = {
  summary: "user",
  experience: "briefcase",
  education: "graduationCap",
  skills: "sparkles",
  languages: "languages",
  certifications: "badgeCheck",
  achievements: "award",
  custom: "fileText",
};


async function svgToPngDataUrl(inner: string, color = "#f5f0e8", sizePx = 64): Promise<string> {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${sizePx}" height="${sizePx}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
  return rasterizeSvg(svg, sizePx, sizePx);
}

async function rasterizeSvg(svg: string, wPx: number, hPx: number): Promise<string> {
  const url = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = reject;
    i.src = url;
  });
  const canvas = document.createElement("canvas");
  canvas.width = wPx;
  canvas.height = hPx;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No 2d context");
  ctx.drawImage(img, 0, 0, wPx, hPx);
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
  nameFontName?: string;
  titleFs: number;
  titleColor?: string;
  titleBold?: boolean;
  titleFontName?: string;
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
  let photoData = o.photoUrl ? await urlToDataUrl(o.photoUrl) : null;
  // Soft-round square photos so the corners aren't razor-sharp.
  if (photoData && o.photoShape === "square") {
    const { maskImageRounded } = await import("./core");
    photoData = (await maskImageRounded(photoData, 0.06)) ?? photoData;
  }
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
    fontName: o.nameFontName,
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
      lineHeight: titleLh, fontName: o.titleFontName,
    });
    hy += titleH + 1.4;
  }

  // Icon-prefixed contact row (matches the template designs).
  const c = cv.contact;
  type Row = { iconKey: keyof typeof ICON_SVGS; label: string; uri?: string };
  const rows: Row[] = [];
  if (c.location) rows.push({ iconKey: "mapPin", label: c.location });
  if (c.phone) rows.push({ iconKey: "phone", label: c.phone });
  if (c.email) rows.push({ iconKey: "mail", label: c.email, uri: `mailto:${c.email}` });
  if (c.linkedinUrl) rows.push({ iconKey: "linkedin", label: stripUrlPrefix(c.linkedinUrl), uri: c.linkedinUrl });
  if (c.website) rows.push({ iconKey: "globe", label: stripUrlPrefix(c.website), uri: c.website });

  if (rows.length) {
    const cFs = o.contactFs ?? 8.6;
    const cColor = o.contactColor ?? MUTED;
    const iconPngs = await Promise.all(rows.map((r) => svgToPngDataUrl(ICON_SVGS[r.iconKey], cColor, 64)));
    const lh = 1.45;
    const lineStep = ptToMm(cFs) * lh + 1.6;
    const iconSz = ptToMm(cFs) * 0.95;
    const iconGap = 1.4;
    const itemGap = 3.2;
    const wrapTol = 0.5;
    let curX = textX;
    let curY = hy + 1.4;
    const startY = curY;
    rows.forEach((r, i) => {
      const labelWFull = textWidthMm(r.label, cFs);
      const noWrapPad = r.iconKey === "mail" ? 14 : 2;
      const maxLabelW = Math.max(12, textW - iconSz - iconGap);
      const naturalLabelW = Math.min(maxLabelW, labelWFull + noWrapPad);
      if (curX + iconSz + iconGap + naturalLabelW > textX + textW + wrapTol && curX > textX) {
        curX = textX;
        curY += lineStep;
      }
      b.addImage({ x: curX, y: curY + (ptToMm(cFs) * lh - iconSz) / 2 - 0.2, w: iconSz, h: iconSz, data: iconPngs[i] });
      const labelX = curX + iconSz + iconGap;
      const availableLabelW = Math.max(12, textX + textW - labelX);
      const labelBoxW = r.iconKey === "mail" ? availableLabelW : Math.min(availableLabelW, naturalLabelW);
      const advance = iconSz + iconGap + labelBoxW;
      b.addText({
        value: r.label, x: labelX, y: curY, width: labelBoxW,
        fontSize: cFs, color: cColor, lineHeight: lh,
      });
      if (r.uri) {
        b.addLink({ x: labelX, y: curY, width: labelBoxW, height: ptToMm(cFs) * lh, uri: withScheme(r.uri) });
      }
      curX += advance + itemGap;
    });
    hy = curY + ptToMm(cFs) * lh + 1.4;
    void startY;
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
    nameFs: 28, nameBold: true, nameFontName: FONT_DISPLAY_ACTIVE,
    titleFs: 12, titleColor: SIENNA,
    bottomRule: { color: INK, weight: 0.6 },
  });

  const sectionTitle = (label: string) => {
    b.ensure(10);
    b.addText({
      value: label, fontSize: 11, color: INK, uppercase: true,
      letterSpacing: 0.9, bold: true, spaceAfter: 1.2,
      fontName: FONT_DISPLAY_ACTIVE,
    });
    b.addLine({ x: b.margin, y: b.cursorY, width: b.contentW, height: 0.35, color: HAIRLINE });
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
    nameFs: 32, nameLetterSpacing: -0.6, nameBold: true, nameFontName: FONT_DISPLAY_ACTIVE,
    titleFs: 14, titleColor: SIENNA,
    contactFs: 9, contactColor: MUTED,
    spaceAfter: 9,
  });

  const sectionTitle = (label: string) => {
    b.ensure(10);
    b.addText({
      value: label, fontSize: 13, color: INK, bold: true,
      letterSpacing: -0.1, spaceAfter: 3,
      fontName: FONT_DISPLAY_ACTIVE,
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

  // ---- Sidebar content ----
  // We collect each sidebar section as a "block" with an estimated height and a draw fn.
  // After the main column finishes rendering, we walk the blocks, advancing to the next
  // page when a block would overflow. Sections are kept whole — never split across pages.
  type Block = { estH: number; draw: (top: number) => number /* new sY */ };
  const blocks: Block[] = [];

  const SIDE_TOP = 14;
  const SIDE_BOTTOM_PAD = 14;

  // ---- Pre-resolve icon PNGs (vibrant only) so heading draw fns stay sync ----
  // We resolve once per build, in both colors we'll need.
  const sectionIconWhite: Partial<Record<keyof typeof ICON_SVGS, string>> = {};
  const sectionIconAccent: Partial<Record<keyof typeof ICON_SVGS, string>> = {};
  if (variant === "vibrant") {
    const keys = Object.keys(ICON_SVGS) as (keyof typeof ICON_SVGS)[];
    await Promise.all(
      keys.map(async (k) => {
        sectionIconWhite[k] = await svgToPngDataUrl(ICON_SVGS[k], "#ffffff");
        sectionIconAccent[k] = await svgToPngDataUrl(ICON_SVGS[k], SIENNA);
      }),
    );
  }

  // ---- Photo + contact block (always first, on page 1) ----
  const photoData = photoUrl ? await urlToDataUrl(photoUrl) : null;

  const headingDraw = (top: number, label: string, iconKey?: keyof typeof ICON_SVGS) => {
    let sY = top;
    if (variant === "vibrant" && iconKey && sectionIconWhite[iconKey]) {
      // Small icon mark to the left of the heading label, paper color on the sienna sidebar.
      const ico = 3.6;
      b.addImage({ x: PADX, y: sY + 0.2, w: ico, h: ico, data: sectionIconWhite[iconKey]! });
      b.addText({
        value: label.toUpperCase(), x: PADX + ico + 1.6, y: sY, width: SIDE_TW - ico - 1.6,
        fontSize: 9, color: PAPER, bold: true, letterSpacing: 1.2,
      });
    } else {
      b.addText({
        value: label.toUpperCase(), x: PADX, y: sY, width: SIDE_TW,
        fontSize: 9, color: PAPER, bold: true, letterSpacing: 1.2,
      });
    }
    sY += ptToMm(9) * 1.25 + 2.4;
    return sY;
  };
  const headingH = ptToMm(9) * 1.25 + 2.4;

  const sideRowH = (value: string) => textHeightMm(value, SIDE_TW, 8.4, 1.45) + 1.6;
  const drawSideRow = (top: number, value: string, uri?: string) => {
    const h = textHeightMm(value, SIDE_TW, 8.4, 1.45);
    b.addText({ value, x: PADX, y: top, width: SIDE_TW, fontSize: 8.4, color: PAPER, lineHeight: 1.45 });
    if (uri) b.addLink({ x: PADX, y: top, width: SIDE_TW, height: h, uri: withScheme(uri) });
    return top + h + 1.6;
  };

  // Header block — photo + contact rows. Kept together on page 1.
  if (photoData || shouldRender(cv, "contact")) {
    const ICON_MM = 3.2;
    const TEXT_X = PADX + ICON_MM + 1.8;
    const TW = SIDEBAR_W - PAD_R - TEXT_X;
    const FS = 8.4;
    type ContactRow = { iconSvg: string; value: string; uri?: string };
    const contactRows: ContactRow[] = [];
    if (shouldRender(cv, "contact")) {
      const c = cv.contact;
      if (c.location) contactRows.push({ iconSvg: ICON_SVGS.mapPin, value: c.location });
      if (c.phone) contactRows.push({ iconSvg: ICON_SVGS.phone, value: c.phone });
      if (c.email) contactRows.push({ iconSvg: ICON_SVGS.mail, value: c.email, uri: `mailto:${c.email}` });
      if (c.linkedinUrl) contactRows.push({ iconSvg: ICON_SVGS.linkedin, value: stripUrlPrefix(c.linkedinUrl), uri: c.linkedinUrl });
      if (c.website) contactRows.push({ iconSvg: ICON_SVGS.globe, value: stripUrlPrefix(c.website), uri: c.website });
    }
    // Pre-resolve icon data URLs so the draw fn stays synchronous.
    const iconData: string[] = await Promise.all(contactRows.map((r) => svgToPngDataUrl(r.iconSvg)));
    const sz = 32;
    let estH = 0;
    if (photoData) estH += sz + 8;
    for (const r of contactRows) {
      estH += Math.max(textHeightMm(r.value, TW, FS, 1.45), ICON_MM) + 1.8;
    }
    if (contactRows.length) estH += 4;

    blocks.push({
      estH,
      draw: (top) => {
        let sY = top;
        if (photoData) {

          if (variant === "vibrant") {
            // Sienna outer ring with a small gap (sidebar color) between ring and photo.
            const outerExtra = 3.0;
            const gapExtra = 1.2;
            const outerSz = sz + outerExtra * 2;
            const gapSz = sz + gapExtra * 2;
            b.addRect({
              x: (SIDEBAR_W - outerSz) / 2, y: sY - outerExtra,
              width: outerSz, height: outerSz,
              color: SIENNA, borderColor: SIENNA, borderWidth: 0, radius: outerSz / 2,
            });
            b.addRect({
              x: (SIDEBAR_W - gapSz) / 2, y: sY - gapExtra,
              width: gapSz, height: gapSz,
              color: sidebarFill, borderColor: sidebarFill, borderWidth: 0, radius: gapSz / 2,
            });
          }
          b.addImage({ x: (SIDEBAR_W - sz) / 2, y: sY, w: sz, h: sz, data: photoData });
          sY += sz + 8;
        }



        for (let i = 0; i < contactRows.length; i++) {
          const r = contactRows[i];
          b.addImage({ x: PADX, y: sY + 0.3, w: ICON_MM, h: ICON_MM, data: iconData[i] });
          const h = textHeightMm(r.value, TW, FS, 1.45);
          b.addText({ value: r.value, x: TEXT_X, y: sY, width: TW, fontSize: FS, color: PAPER, lineHeight: 1.45 });
          if (r.uri) b.addLink({ x: TEXT_X, y: sY, width: TW, height: h, uri: withScheme(r.uri) });
          sY += Math.max(h, ICON_MM) + 1.8;
        }
        if (contactRows.length) sY += 4;
        return sY;
      },
    });
  }

  const sideRenderers: Partial<Record<SectionKey, () => Block | null>> = {
    skills: () => {
      const skills = cv.skills.filter((s) => s && s.trim());
      if (!skills.length) return null;
      const levels = cv.skillLevels ?? {};
      if (variant === "vibrant") {
        const trackColor = mixHex(SIENNA, "#ffffff", 0.18);
        let estH = headingH;
        for (const sk of skills) estH += textHeightMm(sk, SIDE_TW, 8.4, 1.4) + 1.2 + 1.0 + 2.4;
        estH += 2;
        return {
          estH,
          draw: (top) => {
            let sY = headingDraw(top, "Skills", "sparkles");
            for (const sk of skills) {
              const h = textHeightMm(sk, SIDE_TW, 8.4, 1.4);
              b.addText({ value: sk, x: PADX, y: sY, width: SIDE_TW, fontSize: 8.4, color: PAPER, lineHeight: 1.4 });
              sY += h + 1.2;
              const lvl = Math.max(1, Math.min(5, Math.round(levels[sk] ?? 4)));
              b.addRect({ x: PADX, y: sY, width: SIDE_TW, height: 1.0, color: trackColor, borderColor: trackColor, borderWidth: 0, radius: 0.5 });
              const fillW = SIDE_TW * (lvl / 5);
              b.addRect({ x: PADX, y: sY, width: fillW, height: 1.0, color: SIENNA, borderColor: SIENNA, borderWidth: 0, radius: 0.5 });
              sY += 1.0 + 2.4;
            }
            return sY + 2;
          },
        };
      }
      let estH = headingH;
      for (const sk of skills) estH += textHeightMm(sk, SIDE_TW - 3, 8.6, 1.5) + 1.6;
      estH += 3;
      return {
        estH,
        draw: (top) => {
          let sY = headingDraw(top, "Skills", "sparkles");
          for (const sk of skills) {
            const tw = SIDE_TW - 3;
            const h = textHeightMm(sk, tw, 8.6, 1.5);
            b.addText({ value: "•", x: PADX, y: sY, width: 3, fontSize: 9.2, color: SIENNA, bold: true });
            b.addText({ value: sk, x: PADX + 3, y: sY, width: tw, fontSize: 8.6, color: PAPER, lineHeight: 1.5 });
            sY += h + 1.6;
          }
          return sY + 3;
        },
      };
    },
    languages: () => {
      const langs = cv.languages.filter((l) => l.name && l.name.trim());
      if (!langs.length) return null;
      if (variant === "vibrant") {
        const levelColor = mixHex(SIENNA, "#ffffff", 0.7);
        const levelW = 18;
        const nameW = SIDE_TW - levelW - 2;
        let estH = headingH;
        for (const l of langs) {
          const nh = textHeightMm(l.name, nameW, 8.4, 1.3);
          const lh = l.level ? textHeightMm(l.level, levelW, 7.6, 1.3) : 0;
          estH += Math.max(nh, lh) + 2.2;
        }
        return {
          estH: estH + 2,
          draw: (top) => {
            let sY = headingDraw(top, "Languages", "languages");
            for (const l of langs) {
              const nh = textHeightMm(l.name, nameW, 8.4, 1.3);
              const lh = l.level ? textHeightMm(l.level, levelW, 7.6, 1.3) : 0;
              const rowH = Math.max(nh, lh);
              b.addText({ value: l.name, x: PADX, y: sY, width: nameW, fontSize: 8.4, color: PAPER, bold: true, lineHeight: 1.3 });
              if (l.level) {
                b.addText({ value: l.level, x: PADX + nameW + 2, y: sY + (nh - lh), width: levelW, fontSize: 7.6, color: levelColor, lineHeight: 1.3, align: "right" });
              }
              sY += rowH + 2.2;
            }
            return sY + 2;
          },
        };
      }
      let estH = headingH;
      for (const l of langs) {
        const display = l.level?.trim() ? `${l.name} — ${l.level}` : l.name;
        estH += sideRowH(display);
      }
      return {
        estH: estH + 3,
        draw: (top) => {
          let sY = headingDraw(top, "Languages", "languages");
          for (const l of langs) {
            const display = l.level?.trim() ? `${l.name} — ${l.level}` : l.name;
            sY = drawSideRow(sY, display);
          }
          return sY + 3;
        },
      };
    },

    education: () => {
      const eds = cv.education.filter((e) => (e.qualification && e.qualification.trim()) || (e.institution && e.institution.trim()));
      if (!eds.length) return null;
      let estH = headingH;
      for (const ed of eds) {
        if (ed.qualification) estH += sideRowH(ed.qualification);
        if (ed.institution) estH += textHeightMm(ed.institution, SIDE_TW, 7.6, 1.4) + 0.6;
        estH += ed.period ? ptToMm(7) * 1.4 + 1.4 : 1.2;
      }
      return {
        estH: estH + 2,
        draw: (top) => {
          let sY = headingDraw(top, "Education", "graduationCap");
          for (const ed of eds) {
            if (ed.qualification) sY = drawSideRow(sY, ed.qualification);
            if (ed.institution) {
              const h = textHeightMm(ed.institution, SIDE_TW, 7.6, 1.4);
              b.addText({ value: ed.institution, x: PADX, y: sY, width: SIDE_TW, fontSize: 7.6, color: mixHex(SIENNA, "#ffffff", 0.7), lineHeight: 1.4 });
              sY += h + 0.6;
            }
            if (ed.period) {
              b.addText({ value: ed.period, x: PADX, y: sY, width: SIDE_TW, fontSize: 7, color: mixHex(SIENNA, "#ffffff", 0.55) });
              sY += ptToMm(7) * 1.4 + 1.4;
            } else {
              sY += 1.2;
            }
          }
          return sY + 2;
        },
      };
    },
    certifications: () => {
      const certs = cv.certifications.filter((c) => c.name && c.name.trim());
      if (!certs.length) return null;
      const buildLine = (c: { name: string; issuer?: string; date?: string }) =>
        [c.name, c.issuer, c.date].map((p) => (p || "").trim()).filter(Boolean).join(" | ");
      let estH = headingH;
      for (const c of certs) {
        estH += textHeightMm(buildLine(c), SIDE_TW, 8.2, 1.45) + 2.2;
      }
      return {
        estH: estH + 2,
        draw: (top) => {
          let sY = headingDraw(top, "Certifications", "badgeCheck");
          for (const c of certs) {
            const line = buildLine(c);
            const h = textHeightMm(line, SIDE_TW, 8.2, 1.45);
            b.addText({ value: line, x: PADX, y: sY, width: SIDE_TW, fontSize: 8.2, color: PAPER, lineHeight: 1.45 });
            sY += h + 2.2;
          }
          return sY + 2;
        },
      };
    },
    achievements: () => {
      const items = cv.achievements.filter((a) => a && a.trim());
      if (!items.length) return null;
      const tw = SIDE_TW - 3;
      let estH = headingH;
      for (const a of items) estH += textHeightMm(a, tw, 8.4, 1.45) + 1.6;
      return {
        estH: estH + 3,
        draw: (top) => {
          let sY = headingDraw(top, "Achievements", "award");
          for (const a of items) {
            const h = textHeightMm(a, tw, 8.4, 1.45);
            b.addText({ value: "•", x: PADX, y: sY, width: 3, fontSize: 9, color: PAPER, bold: true });
            b.addText({ value: a, x: PADX + 3, y: sY, width: tw, fontSize: 8.4, color: PAPER, lineHeight: 1.45 });
            sY += h + 1.6;
          }
          return sY + 3;
        },
      };
    },
    summary: () => {
      const text = (cv.summary || "").trim();
      if (!text) return null;
      const h = textHeightMm(text, SIDE_TW, 8.2, 1.5);
      return {
        estH: headingH + h + 3,
        draw: (top) => {
          let sY = headingDraw(top, "Profile", "user");
          b.addText({ value: text, x: PADX, y: sY, width: SIDE_TW, fontSize: 8.2, color: PAPER, lineHeight: 1.5 });
          return sY + h + 3;
        },
      };
    },

  };

  for (const k of (["summary", "skills", "education", "languages", "certifications", "achievements"] as SectionKey[])) {
    if (inSidebar(k) && shouldRender(cv, k)) {
      const blk = sideRenderers[k]?.();
      if (blk) blocks.push(blk);
    }
  }



  // ---- Custom sections pinned to the sidebar ----
  for (const s of cv.customSections) {
    if (s.placement !== "sidebar") continue;
    const bullets = s.bullets.filter(Boolean);
    if (!s.title?.trim() && bullets.length === 0) continue;
    const title = s.title?.trim() || "Additional";
    let estH = headingH;
    for (const it of bullets) {
      estH += textHeightMm(it, SIDE_TW - 3, 8.4, 1.45) + 1.6;
    }
    blocks.push({
      estH: estH + 3,
      draw: (top) => {
        let sY = headingDraw(top, title, "fileText");
        for (const it of bullets) {
          const tw = SIDE_TW - 3;
          const h = textHeightMm(it, tw, 8.4, 1.45);
          b.addText({ value: "•", x: PADX, y: sY, width: 3, fontSize: 9, color: PAPER, bold: true });
          b.addText({ value: it, x: PADX + 3, y: sY, width: tw, fontSize: 8.4, color: PAPER, lineHeight: 1.45 });
          sY += h + 1.6;
        }
        return sY + 3;
      },
    });
  }



  // ---- Main column ----
  b.margin = MAIN_MARGIN;
  b.contentW = MAIN_CONTENT_W;
  b.cursorY = 16;
  const ctx2: Ctx = { cv, primary: SIENNA, b };

  // Vibrant: folded-corner triangle in the top-right of the main column.
  if (variant === "vibrant") {
    const triSz = 22; // mm
    const triX = MAIN_X + MAIN_W - triSz;
    const triY = 0;
    const fill = mixHex(SIENNA, "#ffffff", 0.65);
    const stroke = mixHex(SIENNA, "#ffffff", 0.35);
    const sizePx = 256;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${sizePx}" height="${sizePx}" viewBox="0 0 100 100"><polygon points="100,0 100,100 0,0" fill="${fill}" stroke="${stroke}" stroke-width="1"/></svg>`;
    const data = await rasterizeSvg(svg, sizePx, sizePx);
    b.addImage({ x: triX, y: triY, w: triSz, h: triSz, data });
  }


  b.addText({
    value: cv.contact.name || "Your name",
    fontSize: variant === "vibrant" ? 30 : 24,
    color: INK,
    bold: true,
    letterSpacing: variant === "vibrant" ? -0.6 : -0.4,
    lineHeight: 1.05,
    spaceAfter: 1,
    fontName: variant === "vibrant" ? FONT_DISPLAY : undefined,
  });

  if (cv.contact.jobTitle) {
    if (variant === "vibrant") {
      const jt = cv.contact.jobTitle.toUpperCase();
      const ruleW = 8;
      const ruleGap = 2.5;
      const fs = 10;
      const lineH = ptToMm(fs) * 1.25;
      const textY = b.cursorY;
      // Short rule centered vertically with the text on the same line.
      b.addLine({
        x: b.margin, y: textY + lineH / 2 - 0.35,
        width: ruleW, height: 0.7, color: SIENNA,
      });
      b.addText({
        value: jt,
        x: b.margin + ruleW + ruleGap, y: textY,
        width: b.contentW - ruleW - ruleGap,
        fontSize: fs, color: SIENNA, bold: true, letterSpacing: 1.4,
      });
      b.cursorY += lineH + 3;
    } else {
      b.addText({
        value: cv.contact.jobTitle.toUpperCase(),
        fontSize: 10, color: SIENNA, bold: true, letterSpacing: 1.4,
        spaceAfter: 6,
      });
    }
  } else {
    b.cursorY += 4;
  }

  const mainHeading = (label: string, iconKey?: keyof typeof ICON_SVGS) => {
    if (variant === "vibrant") {
      b.ensure(14);
      b.cursorY += 3;
      const sq = 4.4;
      const gap = 2.6;
      const fs = 11.5;
      const labelText = label.toUpperCase();
      const labelW = textWidthMm(labelText, fs, { bold: true, letterSpacing: 1.6 });
      const yTop = b.cursorY + 0.2;
      b.addRect({ x: b.margin, y: yTop, width: sq, height: sq, color: SIENNA, borderColor: SIENNA, borderWidth: 0, radius: 0.8 });
      if (iconKey && sectionIconWhite[iconKey]) {
        const ico = sq * 0.7;
        b.addImage({
          x: b.margin + (sq - ico) / 2,
          y: yTop + (sq - ico) / 2,
          w: ico, h: ico, data: sectionIconWhite[iconKey]!,
        });
      }
      const textX = b.margin + sq + gap;
      b.addText({
        value: labelText,
        x: textX,
        y: b.cursorY + 0.4,
        width: b.contentW - sq - gap,
        fontSize: fs, color: INK, bold: true, letterSpacing: 1.6,
      });
      // Extending rule after the label, centered vertically with the text.
      const lineH = ptToMm(fs) * 1.25;
      const ruleStartX = textX + labelW + 3;
      const ruleEndX = b.margin + b.contentW;
      if (ruleEndX > ruleStartX + 2) {
        b.addLine({
          x: ruleStartX,
          y: b.cursorY + 0.4 + lineH / 2 - 0.15,
          width: ruleEndX - ruleStartX,
          height: 0.3,
          color: mixHex(SIENNA, "#ffffff", 0.55),
        });
      }
      b.cursorY += lineH + 2.6;
    } else {
      b.ensure(10);
      b.addText({
        value: label.toUpperCase(), fontSize: 11.5, color: INK, bold: true,
        letterSpacing: 1.6, spaceAfter: 1.2,
      });
      b.addLine({ x: b.margin, y: b.cursorY, width: 14, height: 0.7, color: SIENNA });
      b.cursorY += 3.4;
    }
  };


  if (shouldRender(cv, "summary") && !inSidebar("summary")) {
    mainHeading("Profile", "user");
    b.addText({ value: cv.summary, fontSize: 9.7, color: SUBINK, lineHeight: 1.65, spaceAfter: 1, align: "justify" });
  }




  const mainRenderers: Partial<Record<SectionKey, () => void>> = {
    experience: () => {
      mainHeading("Experience", "briefcase");
      for (const exp of cv.experience) {
        if (variant === "vibrant") {
          const period = periodOf(exp);
          const pillFs = 7.8;
          const pillH = ptToMm(pillFs) * 1.25 + 1.4;
          const pillW = period ? Math.ceil(estimatedRightWidthMm(period, pillFs)) + 4 : 0;
          const leftFs = 11;
          const leftW = b.contentW - pillW - (pillW ? 2.5 : 0);
          const lineStep = ptToMm(leftFs) * 1.25;
          const leftLines = wrapLines(exp.role || "", leftW, leftFs, { bold: true });
          const blockH = Math.max(leftLines.length, 1) * lineStep;
          b.ensure(Math.max(blockH, pillH));
          const py = b.cursorY;
          for (let i = 0; i < leftLines.length; i++) {
            b.addText({ value: leftLines[i], x: b.margin, y: py + i * lineStep, width: leftW, fontSize: leftFs, color: INK, bold: true, lineHeight: 1.25 });
          }
          if (period && pillW) {
            const pillX = b.margin + b.contentW - pillW;
            b.addRect({ x: pillX, y: py + 0.3, width: pillW, height: pillH, color: SIENNA, borderColor: SIENNA, borderWidth: 0, radius: pillH / 2 });
            b.addText({ value: period, x: pillX, y: py + 0.3 + 0.6, width: pillW, fontSize: pillFs, color: "#ffffff", bold: true, align: "center", lineHeight: 1.25 });
          }
          b.cursorY = py + blockH + 0.5;
        } else {
          periodRow(ctx2, exp.role || "", periodOf(exp), { leftFs: 11, bold: true });
        }
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
      mainHeading("Skills", "sparkles");
      const text = cv.skills.join(" · ");
      b.addText({ value: text, fontSize: 9.6, color: SUBINK, lineHeight: 1.6, spaceAfter: 4 });
    },
    languages: () => {
      if (!cv.languages.length) return;
      mainHeading("Languages", "languages");
      langBulletList(ctx2, { fs: 9.6, color: SUBINK, glyphColor: SIENNA });
      b.cursorY += 2;
    },
    education: () => {
      mainHeading("Education", "graduationCap");
      for (const ed of cv.education) {
        periodRow(ctx2, ed.qualification, ed.period, { leftFs: 10.5, bold: true });
        if (ed.institution) b.addText({ value: ed.institution, fontSize: 9.6, color: SIENNA, bold: true, spaceAfter: 3 });
      }
    },
    competencies: () => {
      mainHeading("Core Competencies", "sparkles");
      for (const c of cv.competencyClusters) {
        inlineCluster(ctx2, c, { titleFs: 9.6, titleColor: SIENNA, itemsFs: 9.6, itemsColor: SUBINK });
      }
    },
    achievements: () => {
      mainHeading("Achievements", "award");
      for (const a of cv.achievements.filter(Boolean)) {
        bullet(ctx2, "•", a, { fs: 9.4, glyphColor: SIENNA });
      }
      b.cursorY += 2;
    },
    certifications: () => {
      mainHeading("Certifications", "badgeCheck");
      for (const c of cv.certifications) {
        const left = c.issuer ? `${c.name} — ${c.issuer}` : c.name;
        periodRow(ctx2, left, c.date || "", { leftFs: 10, bold: false, glyph: "»", glyphColor: SIENNA });
      }
      b.cursorY += 2;
    },
    custom: () => {
      for (const s of cv.customSections) {
        if (s.placement === "sidebar") continue;
        mainHeading(s.title || "Additional", "fileText");
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

  // ---- Place sidebar blocks across pages ----
  // Main column is fully rendered, so we know how many pages exist. Walk the
  // sidebar blocks placing each one on a page where it fits whole. If a block
  // would overflow the bottom margin, push it to the next page (creating one
  // if needed). Sections are never split across pages.
  const SIDE_PAGE_BOTTOM = b.PAGE_H - SIDE_BOTTOM_PAD;
  let sidebarPage = 0;
  let sY = SIDE_TOP;
  const ensureSidebarPage = (i: number) => {
    while (i >= b.pageCount) {
      // Save main cursor state; newPage() resets it via onNewPage to MAIN.
      const prevIdx = b.pageIndex;
      b.newPage(); // appends; pageIndex becomes pageCount-1
      // newPage's onNewPage callback already redrew the sidebar bg + reset
      // cursor for the main column. We don't need that cursor anymore.
      void prevIdx;
    }
    b.setPageIndex(i);
  };
  ensureSidebarPage(0);
  for (const blk of blocks) {
    if (sY + blk.estH > SIDE_PAGE_BOTTOM && sY > SIDE_TOP) {
      sidebarPage += 1;
      ensureSidebarPage(sidebarPage);
      sY = SIDE_TOP;
    }
    sY = blk.draw(sY);
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
    const rawPhoto = photoUrl ? await urlToDataUrl(photoUrl) : null;
    // Soft-round square photos to match the editorial template's tile.
    const { maskImageRounded } = await import("./core");
    const photoData = rawPhoto ? (await maskImageRounded(rawPhoto, 0.06)) ?? rawPhoto : null;
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
      fontSize: 26, color: INK, fontName: FONT_DISPLAY_ACTIVE,
      letterSpacing: -0.6, lineHeight: 1.05,
    });
    ty += ptToMm(26) * 1.05 + 1.4;
    if (cv.contact.jobTitle) {
      b.addText({
        value: cv.contact.jobTitle, x: textX, y: ty, width: textW,
        fontSize: 11.5, color: SUBINK, fontName: FONT_DISPLAY_ITALIC,
      });
      ty += ptToMm(11.5) * 1.25 + 1.6;
    }

    // Contact pills with inline icons (mirrors ContactLine in TemplateGeneva)
    const c = cv.contact;
    type Row = { iconKey: keyof typeof ICON_SVGS; label: string; uri?: string };
    const rows: Row[] = [];
    if (c.location) rows.push({ iconKey: "mapPin", label: c.location });
    if (c.phone) rows.push({ iconKey: "phone", label: c.phone });
    if (c.email) rows.push({ iconKey: "mail", label: c.email, uri: `mailto:${c.email}` });
    if (c.linkedinUrl) rows.push({ iconKey: "linkedin", label: stripUrlPrefix(c.linkedinUrl), uri: c.linkedinUrl });
    if (c.website) rows.push({ iconKey: "globe", label: stripUrlPrefix(c.website), uri: c.website });

    if (rows.length) {
      const iconPngs = await Promise.all(rows.map((r) => svgToPngDataUrl(ICON_SVGS[r.iconKey], MUTED, 64)));
      const cFs = 8.4;
      const lh = 1.45;
      const lineStep = ptToMm(cFs) * lh + 1.6;
      const iconSz = ptToMm(cFs) * 0.95;
      const iconGap = 1.4;
      const itemGap = 3.2;
      const wrapTol = 0.5;
      let curX = textX;
      let curY = ty + 0.4;
      rows.forEach((r, i) => {
        const labelWFull = textWidthMm(r.label, cFs);
        // pdfme's real text wrapper is wider than our estimate for e-mail-like
        // strings, so reserve visible padding and advance by that same width.
        const noWrapPad = r.iconKey === "mail" ? 14 : 2;
        const maxLabelW = Math.max(12, textW - iconSz - iconGap);
        const naturalLabelW = Math.min(maxLabelW, labelWFull + noWrapPad);
        if (curX + iconSz + iconGap + naturalLabelW > textX + textW + wrapTol && curX > textX) {
          curX = textX;
          curY += lineStep;
        }
        b.addImage({ x: curX, y: curY + (ptToMm(cFs) * lh - iconSz) / 2 - 0.2, w: iconSz, h: iconSz, data: iconPngs[i] });
        const labelX = curX + iconSz + iconGap;
        const availableLabelW = Math.max(12, textX + textW - labelX);
        const labelBoxW = r.iconKey === "mail" ? availableLabelW : Math.min(availableLabelW, naturalLabelW);
        const advance = iconSz + iconGap + labelBoxW;
        b.addText({
          value: r.label, x: labelX, y: curY, width: labelBoxW,
          fontSize: cFs, color: MUTED, lineHeight: lh,
        });
        if (r.uri) {
          b.addLink({ x: labelX, y: curY, width: labelBoxW, height: ptToMm(cFs) * lh, uri: withScheme(r.uri) });
        }
        curX += advance + itemGap;
      });
      ty = curY + ptToMm(cFs) * lh + 1;
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
      fontSize: 15, color: INK, fontName: FONT_DISPLAY_ACTIVE, letterSpacing: -0.2,
    });
    b.cursorY = startY + ptToMm(15) * 1.25 + 5;
    b.addLine({ x: b.margin, y: b.cursorY - 1.4, width: b.contentW, height: 0.25, color: "#d8cfc1" });
    b.cursorY += 2;
  };

  if (shouldRender(cv, "summary")) {
    sectionTitle("Profile");
    b.addText({ value: cv.summary, fontSize: 10.2, color: SUBINK, lineHeight: 1.75, spaceAfter: 6, fontName: FONT_DISPLAY_ITALIC, align: "justify" });
  }

  const bodyRenderers: Partial<Record<SectionKey, () => void>> = {
    experience: () => {
      sectionTitle("Career Timeline");
      const railX = b.margin + 1.2;
      const indent = 6;
      const RAIL_COLOR = "#d8cfc1";
      const drawRailSegment = (startPage: number, fromY: number, endPage: number, toY: number) => {
        const savedPage = b.pageIndex;
        if (startPage === endPage) {
          b.setPageIndex(startPage);
          if (toY - fromY > 0.5) b.addLine({ x: railX, y: fromY, width: 0.3, height: toY - fromY, color: RAIL_COLOR });
        } else {
          b.setPageIndex(startPage);
          b.addLine({ x: railX, y: fromY, width: 0.3, height: b.pageBottom - fromY, color: RAIL_COLOR });
          for (let p = startPage + 1; p < endPage; p++) {
            b.setPageIndex(p);
            b.addLine({ x: railX, y: b.top, width: 0.3, height: b.pageBottom - b.top, color: RAIL_COLOR });
          }
          b.setPageIndex(endPage);
          if (toY - b.top > 0.5) b.addLine({ x: railX, y: b.top, width: 0.3, height: toY - b.top, color: RAIL_COLOR });
        }
        b.setPageIndex(savedPage);
      };
      cv.experience.forEach((exp, idx) => {
        b.ensure(8);
        const entryStartPage = b.pageIndex;
        const entryStartY = b.cursorY + 1.2;
        // dot (drawn on the page the entry starts on)
        b.addRect({
          x: railX - 1.4, y: entryStartY, width: 2.8, height: 2.8,
          color: "#ffffff", borderColor: SIENNA, borderWidth: 0.6, radius: 1.4,
        });
        const savedMargin = (b as unknown as { margin: number }).margin;
        const savedContentW = (b as unknown as { contentW: number }).contentW;
        (b as unknown as { margin: number }).margin = savedMargin + indent;
        (b as unknown as { contentW: number }).contentW = savedContentW - indent;

        periodRow({ cv, primary: SIENNA, b }, exp.role || "", periodOf(exp), { leftFs: 11.5, bold: true });
        const comp = [exp.company, exp.location].filter(Boolean).join(" · ");
        deterministicLine({ cv, primary: SIENNA, b }, comp, { fs: 9.6, color: SIENNA, bold: true, spaceAfter: 1.8 });
        for (const bul of visibleBullets(exp)) {
          bullet({ cv, primary: SIENNA, b }, "—", bul.rewrite || bul.original, { fs: 9.4, lh: 1.65, glyphColor: SIENNA, glyphW: 4 });
        }

        (b as unknown as { margin: number }).margin = savedMargin;
        (b as unknown as { contentW: number }).contentW = savedContentW;
        const entryEndPage = b.pageIndex;
        const entryEndY = b.cursorY;
        drawRailSegment(entryStartPage, entryStartY + 2.8, entryEndPage, entryEndY - 1);
        if (idx < cv.experience.length - 1) b.cursorY += 3.6;
      });
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
        bullet(ctx, "—", a, { fs: 9.4, lh: 1.65, glyphColor: SIENNA, glyphW: 4 });
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
          bullet(ctx, "—", it, { fs: 9.4, lh: 1.65, glyphColor: SIENNA, glyphW: 4 });
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
 *  MILANO (Creative)
 *  - Editorial numbered sections, two-tone display name, year
 *    column for experience, pill skills, language meter bars.
 *  - Mirrors src/components/cv-builder/templates/TemplateMilano.tsx
 * ============================================================ */
async function buildMilano(cv: GeneratedCV, photoUrl: string | null) {
  const b = createBuilder({ margin: 16, top: 16, bottom: 16 });
  const ACCENT = SIENNA;
  const ctx: Ctx = { cv, primary: ACCENT, b };

  // ---- Header ----
  if (!isHidden(cv, "contact")) {
    const photoData = photoUrl ? await urlToDataUrl(photoUrl) : null;
    const photoSize = 32;
    const hy0 = b.cursorY;
    const textX = photoData ? b.margin + photoSize + 8 : b.margin;
    const textW = photoData ? b.contentW - photoSize - 8 : b.contentW;

    if (photoData) {
      b.addImage({ x: b.margin, y: hy0, w: photoSize, h: photoSize, data: photoData });
      // Accent square offset behind the photo's bottom-right corner
      b.addRect({ x: b.margin + photoSize - 4, y: hy0 + photoSize - 4, width: 8, height: 8, color: ACCENT });
    } else {
      b.addRect({ x: b.margin, y: hy0, width: photoSize, height: photoSize, color: ACCENT });
      const initials =
        (cv.contact.name || "Y N").split(/\s+/).filter(Boolean).slice(0, 2)
          .map((s) => s[0]?.toUpperCase() ?? "").join("") || "YN";
      b.addText({
        value: initials, x: b.margin, y: hy0 + 8.5, width: photoSize,
        fontSize: 24, color: PAPER, bold: true, fontName: FONT_DISPLAY_REGULAR_ACTIVE, align: "center",
      });
    }

    b.addText({
      value: "CURRICULUM VITAE", x: textX, y: hy0 + 1, width: textW,
      fontSize: 7.4, color: ACCENT, bold: true, letterSpacing: 3,
    });

    let ty = hy0 + 6;
    const tokens = (cv.contact.name || "Your Name").trim().split(/\s+/);
    const first = tokens.length > 1 ? tokens.slice(0, -1).join(" ") : tokens[0];
    const last = tokens.length > 1 ? tokens[tokens.length - 1] : "";

    b.addText({
      value: first, x: textX, y: ty, width: textW,
      fontSize: 30, color: INK, bold: true, fontName: FONT_DISPLAY_REGULAR_ACTIVE,
      lineHeight: 1.0, letterSpacing: -0.8,
    });
    ty += ptToMm(30) * 1.0 + 0.6;
    if (last) {
      b.addText({
        value: last, x: textX, y: ty, width: textW,
        fontSize: 30, color: ACCENT, bold: true, fontName: FONT_DISPLAY_REGULAR_ACTIVE,
        lineHeight: 1.0, letterSpacing: -0.8,
      });
      ty += ptToMm(30) * 1.0 + 1.6;
    }
    if (cv.contact.jobTitle) {
      b.addText({
        value: cv.contact.jobTitle.toUpperCase(), x: textX, y: ty, width: textW,
        fontSize: 9, color: MUTED, letterSpacing: 2.4, bold: true,
      });
      ty += ptToMm(9) * 1.25 + 2;
    }

    let headEnd = Math.max(ty, hy0 + photoSize) + 4;

    // Accent bar + small ink cap (editorial rule)
    const capW = 8;
    const barW = b.contentW - capW - 2;
    b.addRect({ x: b.margin, y: headEnd, width: barW, height: 1.4, color: ACCENT });
    b.addRect({ x: b.margin + barW + 2, y: headEnd, width: capW, height: 1.4, color: INK });
    headEnd += 4;

    const contactRuns = contactLinkItems(cv);
    const contact = contactRuns.map((r) => r.label).join("   ·   ");
    if (contact) {
      b.addText({
        value: contact, x: b.margin, y: headEnd, width: b.contentW,
        fontSize: 8.6, color: SUBINK, lineHeight: 1.45,
      });
      addContactLinks(b, contactRuns, { x: b.margin, y: headEnd, width: b.contentW, fontSize: 8.6, lineHeight: 1.45 });
      headEnd += textHeightMm(contact, b.contentW, 8.6, 1.45) + 2;
    }
    b.cursorY = headEnd + 4;
  }

  // ---- Numbered section heading ----
  let n = 0;
  const sectionTitle = (label: string) => {
    n += 1;
    b.ensure(15);
    const startY = b.cursorY;
    const numStr = String(n).padStart(2, "0");
    const numW = 18;
    b.addText({
      value: numStr, x: b.margin, y: startY - 1, width: numW,
      fontSize: 24, color: ACCENT, bold: true, fontName: FONT_DISPLAY_REGULAR_ACTIVE, lineHeight: 1,
    });
    b.addText({
      value: label.toUpperCase(), x: b.margin + numW, y: startY + 2.4,
      width: b.contentW - numW, fontSize: 12.5, color: INK, bold: true, letterSpacing: 1.4,
    });
    b.addRect({ x: b.margin + numW, y: startY + 9.5, width: 14, height: 1, color: ACCENT });
    b.cursorY = startY + 13;
  };

  if (shouldRender(cv, "summary")) {
    sectionTitle("Profile");
    b.addText({
      value: `"${cv.summary}"`, fontSize: 10.2, color: SUBINK,
      lineHeight: 1.65, spaceAfter: 5, fontName: FONT_DISPLAY_REGULAR_ACTIVE, align: "justify",
    });
  }

  const renderers: Partial<Record<SectionKey, () => void>> = {
    experience: () => {
      sectionTitle("Experience");
      const yearColW = 22;
      cv.experience.forEach((exp, idx) => {
        const endYear = (exp.endDate || exp.period || "").match(/\d{4}/)?.[0] ?? null;
        const startYear = (exp.startDate || "").match(/\d{4}/)?.[0] ?? null;
        const yr = endYear ?? startYear ?? "";
        b.ensure(16);
        const py = b.cursorY;
        if (yr) {
          b.addText({
            value: yr, x: b.margin, y: py - 1, width: yearColW,
            fontSize: 18, color: ACCENT, bold: true, fontName: FONT_DISPLAY_REGULAR_ACTIVE, lineHeight: 1,
          });
          if (startYear && startYear !== yr) {
            b.addText({
              value: `from ${startYear}`, x: b.margin, y: py + 7,
              width: yearColW, fontSize: 6.4, color: MUTED, letterSpacing: 1, bold: true,
            });
          }
        }
        const bAny = b as unknown as { margin: number; contentW: number };
        const savedM = bAny.margin;
        const savedW = bAny.contentW;
        bAny.margin = savedM + yearColW + 3;
        bAny.contentW = savedW - yearColW - 3;
        b.cursorY = py;
        b.addText({
          value: exp.role || "", fontSize: 12.5, color: INK, bold: true,
          fontName: FONT_DISPLAY_REGULAR_ACTIVE, lineHeight: 1.2, spaceAfter: 0.4,
        });
        const sub = [exp.company, exp.location].filter(Boolean).join(" · ").toUpperCase();
        if (sub) {
          b.addText({
            value: sub, fontSize: 8.4, color: MUTED, bold: true,
            letterSpacing: 1.2, spaceAfter: 2,
          });
        }
        for (const bul of visibleBullets(exp)) {
          bullet(ctx, "—", bul.rewrite || bul.original, { fs: 9.4, lh: 1.55, glyphColor: ACCENT, glyphW: 3 });
        }
        bAny.margin = savedM;
        bAny.contentW = savedW;
        if (idx < cv.experience.length - 1) b.cursorY += 3;
      });
      b.cursorY += 2;
    },
    skills: () => {
      sectionTitle("Skills");
      const fs = 9;
      const padX = 3;
      const padY = 1.3;
      const gap = 2;
      const lineH = ptToMm(fs) * 1.25 + padY * 2;
      let curX = b.margin;
      let curY = b.cursorY;
      const ensureRow = () => {
        if (curY + lineH > b.PAGE_H - b.bottom) {
          b.cursorY = curY;
          b.newPage();
          curY = b.cursorY;
          curX = b.margin;
        }
      };
      cv.skills.forEach((s, i) => {
        const w = textWidthMm(s, fs) + padX * 2;
        if (curX + w > b.margin + b.contentW) {
          curX = b.margin;
          curY += lineH + gap;
          ensureRow();
        }
        const filled = i % 2 === 0;
        if (filled) {
          b.addRect({ x: curX, y: curY, width: w, height: lineH - 0.2, color: ACCENT, radius: lineH / 2 });
          b.addText({
            value: s, x: curX + padX, y: curY + padY, width: w - padX * 2,
            fontSize: fs, color: PAPER,
          });
        } else {
          b.addRect({
            x: curX, y: curY, width: w, height: lineH - 0.2,
            color: "#ffffff", borderColor: ACCENT, borderWidth: 0.4, radius: lineH / 2,
          });
          b.addText({
            value: s, x: curX + padX, y: curY + padY, width: w - padX * 2,
            fontSize: fs, color: INK,
          });
        }
        curX += w + gap;
      });
      b.cursorY = curY + lineH + 4;
    },
    competencies: () => {
      sectionTitle("Competencies");
      for (const c of cv.competencyClusters) {
        inlineCluster(ctx, c, { titleFs: 9.8, titleColor: ACCENT, itemsFs: 9.8, itemsColor: SUBINK });
      }
    },
    languages: () => {
      sectionTitle("Languages");
      const dotW = 6;
      const dotH = 2.4;
      const gap = 1.2;
      const totalBarsW = 5 * dotW + 4 * gap;
      for (const l of cv.languages) {
        b.ensure(6.5);
        const py = b.cursorY;
        const label = l.level?.trim() ? `${l.name}  (${l.level.trim()})` : l.name;
        b.addText({
          value: label, x: b.margin, y: py, width: b.contentW - totalBarsW - 4,
          fontSize: 10, color: INK, bold: true, fontName: FONT_DISPLAY_REGULAR_ACTIVE,
        });
        const lvl = (l.level || "").toLowerCase();
        const filled =
          lvl.includes("native") || lvl.includes("fluent") ? 5 :
          lvl.includes("professional") ? 4 :
          lvl.includes("conversational") ? 3 :
          lvl.includes("basic") ? 2 : 4;
        const startX = b.margin + b.contentW - totalBarsW;
        for (let j = 0; j < 5; j += 1) {
          b.addRect({
            x: startX + j * (dotW + gap), y: py + 1.6,
            width: dotW, height: dotH,
            color: j < filled ? ACCENT : "#e8dfd1",
          });
        }
        b.cursorY = py + 6;
      }
      b.cursorY += 2;
    },
    education: () => {
      sectionTitle("Education");
      for (const ed of cv.education) {
        periodRow(ctx, ed.qualification, ed.period, { leftFs: 10.5, bold: true });
        if (ed.institution) {
          b.addText({ value: ed.institution, fontSize: 9.4, color: ACCENT, bold: true, spaceAfter: 2 });
        }
        b.addLine({ x: b.margin, y: b.cursorY, width: b.contentW, height: 0.2, color: "#e8dfd1" });
        b.cursorY += 2;
      }
    },
    achievements: () => {
      sectionTitle("Achievements");
      for (const a of cv.achievements.filter(Boolean)) {
        bullet(ctx, "—", a, { fs: 9.4, lh: 1.6, glyphColor: ACCENT, glyphW: 3 });
      }
      b.cursorY += 2;
    },
    certifications: () => {
      sectionTitle("Certifications");
      for (const c of cv.certifications) {
        const left = c.issuer ? `${c.name} — ${c.issuer}` : c.name;
        periodRow(ctx, left, c.date || "", { leftFs: 10, glyph: "»", glyphColor: ACCENT });
      }
      b.cursorY += 2;
    },
    custom: () => {
      for (const s of cv.customSections) {
        sectionTitle(s.title || "Additional");
        for (const it of s.bullets.filter(Boolean)) {
          bullet(ctx, "—", it, { fs: 9.4, lh: 1.6, glyphColor: ACCENT, glyphW: 3 });
        }
        b.cursorY += 2;
      }
    },
  };

  for (const k of getSectionOrder(cv)) {
    if (shouldRender(cv, k)) renderers[k]?.();
  }
  return b;
}

/* ============================================================
 *  TOKYO (Gradient)
 *  - Bold gradient header band with circular photo, contact pills,
 *    icon-squared section headings, timeline experience, pill skills.
 *  - Mirrors src/components/cv-builder/templates/TemplateTokyo.tsx
 * ============================================================ */
async function buildTokyo(cv: GeneratedCV, photoUrl: string | null) {
  const b = createBuilder({ margin: 14, top: 14, bottom: 14 });
  const ACCENT = SIENNA;
  const ACCENT_DARK = shadeHex(ACCENT, -0.55);
  const PAPER = "#ffffff";
  const SOFT_ACCENT = mixHex(ACCENT, "#ffffff", 0.88);
  const HAIR = "#e5dfd6";
  const ctx: Ctx = { cv, primary: ACCENT, b };

  // ---------- Header band (simulated diagonal gradient) ----------
  const BAND_H = isHidden(cv, "contact") ? 0 : 62;
  if (BAND_H > 0) {
    const strips = 90;
    const stripH = BAND_H / strips;
    for (let i = 0; i < strips; i += 1) {
      // diagonal-ish feel: blend on Y but bias darker toward bottom-right
      const t = i / (strips - 1);
      b.addRect({
        x: 0,
        y: i * stripH,
        width: PAGE_W,
        height: stripH + 0.15,
        color: mixHex(ACCENT, ACCENT_DARK, t * 0.95),
      });
    }
    // Decorative soft blob top-right
    b.addRect({
      x: PAGE_W - 28, y: -8, width: 60, height: 60,
      color: mixHex(ACCENT, "#ffffff", 0.18), radius: 28,
    });
    // Decorative outlined square bottom-right
    b.addRect({
      x: PAGE_W - 52, y: BAND_H - 18, width: 14, height: 14,
      color: mixHex(ACCENT, ACCENT_DARK, 0.5),
      borderColor: mixHex("#ffffff", ACCENT, 0.65), borderWidth: 0.5,
    });

    // Photo with white ring
    const photoData = photoUrl ? await urlToDataUrl(photoUrl) : null;
    const photoSize = 30;
    const photoX = 14;
    const photoY = (BAND_H - photoSize) / 2 - 4;
    const textX = photoData ? photoX + photoSize + 8 : 14;
    const textW = PAGE_W - textX - 14;

    if (photoData) {
      // white circular plate
      b.addRect({
        x: photoX - 1.6, y: photoY - 1.6,
        width: photoSize + 3.2, height: photoSize + 3.2,
        color: PAPER, radius: (photoSize + 3.2) / 2,
      });
      b.addImage({ x: photoX, y: photoY, w: photoSize, h: photoSize, data: photoData });
    }

    // Name
    const nameY = photoY + 2;
    b.addText({
      value: cv.contact.name || "Your name",
      x: textX, y: nameY, width: textW,
      fontSize: 28, color: PAPER, bold: true, fontName: FONT_DISPLAY_REGULAR_ACTIVE,
      lineHeight: 1.05, letterSpacing: -0.6,
    });
    let cy = nameY + ptToMm(28) * 1.05 + 1.5;
    if (cv.contact.jobTitle) {
      b.addText({
        value: cv.contact.jobTitle.toUpperCase(),
        x: textX, y: cy, width: textW,
        fontSize: 9.5, color: mixHex(PAPER, ACCENT, 0.15),
        bold: true, letterSpacing: 2.4,
      });
      cy += ptToMm(9.5) * 1.25 + 3;
    }

    // Contact pills
    const runs = contactLinkItems(cv);
    if (runs.length) {
      const padX = 3;
      const padY = 1.1;
      const fs = 8.4;
      const lineH = ptToMm(fs) * 1.25 + padY * 2;
      const pillBg = mixHex(ACCENT, "#ffffff", 0.22);
      const gap = 1.8;
      let px = textX;
      let py = cy;
      for (const r of runs) {
        const tw = textWidthMm(r.label, fs) + 2.5;
        const pw = tw + padX * 2;
        if (px + pw > PAGE_W - 14) {
          px = textX;
          py += lineH + gap;
        }
        b.addRect({
          x: px, y: py, width: pw, height: lineH,
          color: pillBg, radius: lineH / 2,
        });
        b.addText({
          value: r.label, x: px + padX, y: py + padY, width: pw - padX * 2 + 10,
          fontSize: fs, color: PAPER,
        });
        if (r.uri) {
          b.addLink({ x: px, y: py, width: pw, height: lineH, uri: withScheme(r.uri) });
        }
        px += pw + gap;
      }
    }
    b.cursorY = BAND_H + 8;
  }

  // ---------- Icon section heading ----------
  const iconCache = new Map<string, string>();
  async function iconFor(key: keyof typeof ICON_SVGS | undefined): Promise<string | null> {
    if (!key) return null;
    if (!iconCache.has(key)) {
      iconCache.set(key, await svgToPngDataUrl(ICON_SVGS[key], PAPER, 64));
    }
    return iconCache.get(key)!;
  }

  async function sectionTitle(label: string, key?: keyof typeof ICON_SVGS) {
    b.ensure(10);
    const py = b.cursorY;
    const sq = 5.2;
    b.addRect({ x: b.margin, y: py, width: sq, height: sq, color: ACCENT, radius: 1.2 });
    const ico = await iconFor(key);
    if (ico) {
      b.addImage({ x: b.margin + 0.7, y: py + 0.7, w: sq - 1.4, h: sq - 1.4, data: ico });
    }
    b.addText({
      value: label, x: b.margin + sq + 2.4, y: py + 0.4,
      width: b.contentW - sq - 2.4,
      fontSize: 12, color: INK, bold: true, fontName: FONT_DISPLAY_REGULAR_ACTIVE,
      letterSpacing: -0.2,
    });
    // hairline rule on the right
    const labelW = textWidthMm(label, 12, { bold: true }) + 2;
    const ruleX = b.margin + sq + 2.4 + labelW + 2;
    const ruleEnd = b.margin + b.contentW;
    if (ruleEnd - ruleX > 6) {
      b.addLine({ x: ruleX, y: py + 3, width: ruleEnd - ruleX, height: 0.25, color: HAIR });
    }
    b.cursorY = py + sq + 3.5;
  }

  // ---------- Summary ----------
  if (shouldRender(cv, "summary")) {
    await sectionTitle("About me", "user");
    // accent vertical bar to the left of the paragraph
    const fs = 9.8;
    const lh = 1.6;
    const indent = 4;
    const lines = wrapLines(cv.summary || "", b.contentW - indent, fs, {});
    const blockH = Math.max(1, lines.length) * ptToMm(fs) * lh;
    b.ensure(blockH);
    const py = b.cursorY;
    b.addRect({ x: b.margin, y: py, width: 1.1, height: blockH, color: ACCENT, radius: 0.5 });
    for (let i = 0; i < lines.length; i += 1) {
      b.addText({
        value: lines[i], x: b.margin + indent, y: py + i * ptToMm(fs) * lh,
        width: b.contentW - indent + 10, fontSize: fs, color: SUBINK, lineHeight: lh,
      });
    }
    b.cursorY = py + blockH + 5;
  }

  // ---------- Experience (full-width with year column + timeline) ----------
  const TIMELINE_COLOR = mixHex(HAIR, ACCENT, 0.25);
  async function renderExperience() {
    await sectionTitle("Experience", "briefcase");
    const yearColW = 26;
    const lineX = b.margin + yearColW + 2;
    cv.experience.forEach((exp, idx) => {
      const yr = ((exp.startDate || "") + (exp.endDate ? " — " + exp.endDate : "")) || exp.period || "";
      b.ensure(14);
      const py = b.cursorY;
      const pageBefore = b.pageIndex;
      if (yr) {
        b.addText({
          value: yr.toUpperCase(), x: b.margin, y: py + 0.5, width: yearColW,
          fontSize: 7.8, color: ACCENT, bold: true, letterSpacing: 1.1,
        });
      }
      // timeline dot
      b.addRect({ x: lineX - 1.6, y: py + 1.2, width: 2.6, height: 2.6, color: ACCENT, radius: 1.3 });

      // shift content margin to start after the timeline
      const bAny = b as unknown as { margin: number; contentW: number };
      const savedM = bAny.margin;
      const savedW = bAny.contentW;
      const indent = yearColW + 8;
      bAny.margin = savedM + indent;
      bAny.contentW = savedW - indent;
      b.cursorY = py;

      b.addText({
        value: exp.role || "", fontSize: 11.5, color: INK, bold: true,
        fontName: FONT_DISPLAY_REGULAR_ACTIVE, lineHeight: 1.15, spaceAfter: 0.4,
      });
      const sub = [exp.company, exp.location].filter(Boolean).join(" · ");
      if (sub) {
        b.addText({ value: sub, fontSize: 9, color: MUTED, bold: true, spaceAfter: 2 });
      }
      for (const bul of visibleBullets(exp)) {
        bullet(ctx, "•", bul.rewrite || bul.original, { fs: 9.3, lh: 1.55, glyphColor: ACCENT, glyphW: 3 });
      }

      const endY = b.cursorY;
      const pageAfter = b.pageIndex;
      bAny.margin = savedM;
      bAny.contentW = savedW;

      // vertical timeline line — handle entries that span multiple pages
      const drawLine = (yStart: number, yEnd: number) => {
        const h = yEnd - yStart;
        if (h > 1) b.addLine({ x: lineX, y: yStart, width: 0.4, height: h, color: TIMELINE_COLOR });
      };
      if (pageBefore === pageAfter) {
        drawLine(py + 4, Math.max(py + 5, endY - 1));
      } else {
        const pageBottom = b.PAGE_H - b.bottom;
        b.setPageIndex(pageBefore);
        drawLine(py + 4, pageBottom);
        for (let p = pageBefore + 1; p < pageAfter; p += 1) {
          b.setPageIndex(p);
          drawLine(b.top, pageBottom);
        }
        b.setPageIndex(pageAfter);
        drawLine(b.top, Math.max(b.top + 1, endY - 1));
      }
      b.cursorY = endY;
      if (idx < cv.experience.length - 1) b.cursorY += 3.5;
    });
    b.cursorY += 3;
  }

  // ---------- Two-column compact renderers ----------
  async function renderSkills() {
    await sectionTitle("Skills", "sparkles");
    const fs = 8.8;
    const padX = 3;
    const padY = 1.1;
    const gap = 1.6;
    const lineH = ptToMm(fs) * 1.25 + padY * 2;
    let curX = b.margin;
    let curY = b.cursorY;
    cv.skills.forEach((s) => {
      const tw = textWidthMm(s, fs) + 2.5;
      const w = tw + padX * 2;
      if (curX + w > b.margin + b.contentW) {
        curX = b.margin;
        curY += lineH + gap;
      }
      if (curY + lineH > b.PAGE_H - b.bottom) {
        b.cursorY = curY; b.newPage(); curY = b.cursorY; curX = b.margin;
      }
      b.addRect({
        x: curX, y: curY, width: w, height: lineH,
        color: SOFT_ACCENT, borderColor: mixHex(ACCENT, "#ffffff", 0.6), borderWidth: 0.25, radius: 1.5,
      });
      b.addText({
        value: s, x: curX + padX, y: curY + padY, width: w - padX * 2 + 10,
        fontSize: fs, color: INK,
      });
      curX += w + gap;
    });
    b.cursorY = curY + lineH + 3;
  }

  async function renderEducation() {
    await sectionTitle("Education", "graduationCap");
    for (const ed of cv.education) {
      b.addText({ value: ed.qualification, fontSize: 10, color: INK, bold: true, fontName: FONT_DISPLAY_REGULAR_ACTIVE, spaceAfter: 0.4 });
      if (ed.institution) b.addText({ value: ed.institution, fontSize: 9, color: ACCENT, bold: true, spaceAfter: 0.4 });
      if (ed.period) b.addText({ value: ed.period, fontSize: 8.4, color: MUTED, spaceAfter: 2 });
    }
    b.cursorY += 2;
  }

  async function renderLanguages() {
    await sectionTitle("Languages", "languages");
    for (const l of cv.languages) {
      b.ensure(5);
      const py = b.cursorY;
      b.addText({ value: l.name, x: b.margin, y: py, width: b.contentW * 0.6, fontSize: 9.6, color: INK, bold: true });
      if (l.level) {
        b.addText({
          value: l.level, x: b.margin + b.contentW * 0.6, y: py,
          width: b.contentW * 0.4, fontSize: 9.6, color: MUTED, align: "right",
        });
      }
      b.cursorY = py + 5;
    }
    b.cursorY += 2;
  }

  async function renderAchievements() {
    await sectionTitle("Achievements", "award");
    for (const a of cv.achievements.filter(Boolean)) {
      bullet(ctx, "•", a, { fs: 9.3, lh: 1.55, glyphColor: ACCENT, glyphW: 3 });
    }
    b.cursorY += 2;
  }

  async function renderCertifications() {
    await sectionTitle("Certifications", "badgeCheck");
    for (const c of cv.certifications) {
      b.ensure(5);
      const py = b.cursorY;
      const left = c.name + (c.issuer ? ` — ${c.issuer}` : "");
      b.addText({ value: left, x: b.margin, y: py, width: b.contentW * 0.7, fontSize: 9.4, color: INK, bold: true });
      if (c.date) {
        b.addText({ value: c.date, x: b.margin + b.contentW * 0.7, y: py, width: b.contentW * 0.3, fontSize: 9, color: MUTED, align: "right" });
      }
      b.cursorY = py + 5;
    }
    b.cursorY += 2;
  }

  async function renderCompetencies() {
    await sectionTitle("Competencies", "fileText");
    for (const c of cv.competencyClusters) {
      inlineCluster(ctx, c, { titleFs: 9.6, titleColor: ACCENT, itemsFs: 9.6, itemsColor: SUBINK });
    }
  }

  async function renderCustom() {
    for (const s of cv.customSections) {
      await sectionTitle(s.title || "Additional", "fileText");
      for (const it of s.bullets.filter(Boolean)) {
        bullet(ctx, "•", it, { fs: 9.3, lh: 1.55, glyphColor: ACCENT, glyphW: 3 });
      }
      b.cursorY += 2;
    }
  }

  // Render in user-defined order. Experience and custom are full width;
  // the rest render at full width too (single-column flow keeps PDF predictable).
  for (const k of getSectionOrder(cv)) {
    if (!shouldRender(cv, k)) continue;
    if (k === "experience") await renderExperience();
    else if (k === "skills") await renderSkills();
    else if (k === "education") await renderEducation();
    else if (k === "languages") await renderLanguages();
    else if (k === "achievements") await renderAchievements();
    else if (k === "certifications") await renderCertifications();
    else if (k === "competencies") await renderCompetencies();
    else if (k === "custom") await renderCustom();
  }

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
  /** Selected font style (modern/classic/editorial). */
  fontStyle?: FontStyleId | null;
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
  setFontTheme(opts?.fontStyle ?? "modern");
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
    case "gradient":     b = await buildTokyo(cv, effectivePhoto); break;
    case "creative":     b = await buildMilano(cv, effectivePhoto); break;
    case "simple":
    default:             b = await buildModern(cv, effectivePhoto);
  }
  return b.toBlob();
}

void PAGE_W;

