import { generate } from "@pdfme/generator";
import { text, image, line, rectangle } from "@pdfme/schemas";
import type { Template, Schema, Font } from "@pdfme/common";
import { PDFDocument, PDFName, PDFString } from "@pdfme/pdf-lib";
import { saveAs } from "file-saver";
import RobotoRegularUrl from "./fonts/Roboto-Regular.ttf?url";
import RobotoBoldUrl from "./fonts/Roboto-Bold.ttf?url";
import PlayfairDisplayUrl from "./fonts/Fraunces.ttf?url";
import FrauncesBoldUrl from "./fonts/Fraunces-Bold.ttf?url";
import FrauncesItalicUrl from "./fonts/Fraunces-Italic.ttf?url";
import FrauncesBoldItalicUrl from "./fonts/Fraunces-BoldItalic.ttf?url";
import DMSansRegularUrl from "./fonts/DMSans-Regular.ttf?url";
import DMSansBoldUrl from "./fonts/DMSans-Bold.ttf?url";
import SyneBoldUrl from "./fonts/Syne-Bold.ttf?url";
import SyneExtraBoldUrl from "./fonts/Syne-ExtraBold.ttf?url";

/** Font registry for pdfme. Lazy-loaded once and cached. */
export const FONT_REGULAR = "Roboto";
export const FONT_BOLD = "Roboto-Bold";
export const FONT_DISPLAY = "PlayfairDisplay";
export const FONT_DISPLAY_BOLD = "PlayfairDisplay-Bold";
export const FONT_DISPLAY_ITALIC = "PlayfairDisplay-Italic";
export const FONT_DISPLAY_BOLD_ITALIC = "PlayfairDisplay-BoldItalic";
export const FONT_SANS = "DMSans";
export const FONT_SANS_BOLD = "DMSans-Bold";
export const FONT_DISPLAY_SANS = "Syne-Bold";
export const FONT_DISPLAY_SANS_BOLD = "Syne-ExtraBold";

/** A 'font theme' selects which display + body fonts a template uses. */
export type FontStyleId = "modern" | "classic" | "editorial";
export interface FontTheme {
  display: string;
  displayRegular: string;
  bodyBold: string;
  body: string;
  bodyItalic: string;
  serif: boolean;
}
export function getFontTheme(style: FontStyleId | null | undefined): FontTheme {
  switch (style) {
    case "classic":
      return {
        display: FONT_DISPLAY_BOLD,
        displayRegular: FONT_DISPLAY,
        bodyBold: FONT_DISPLAY_BOLD,
        body: FONT_DISPLAY,
        bodyItalic: FONT_DISPLAY_ITALIC,
        serif: true,
      };
    case "editorial":
      return {
        display: FONT_DISPLAY_SANS_BOLD,
        displayRegular: FONT_DISPLAY_SANS,
        bodyBold: FONT_SANS_BOLD,
        body: FONT_SANS,
        bodyItalic: FONT_SANS,
        serif: false,
      };
    case "modern":
    default:
      return {
        display: FONT_SANS_BOLD,
        displayRegular: FONT_SANS,
        bodyBold: FONT_SANS_BOLD,
        body: FONT_SANS,
        bodyItalic: FONT_SANS,
        serif: false,
      };
  }
}

let fontPromise: Promise<Font> | null = null;
async function loadFont(): Promise<Font> {
  if (!fontPromise) {
    fontPromise = (async () => {
      const [reg, bold, display, displayBold, displayItalic, displayBoldItalic, dmSans, dmSansBold, syneBold, syneExtraBold] = await Promise.all([
        fetch(RobotoRegularUrl).then((r) => r.arrayBuffer()),
        fetch(RobotoBoldUrl).then((r) => r.arrayBuffer()),
        fetch(PlayfairDisplayUrl).then((r) => r.arrayBuffer()),
        fetch(FrauncesBoldUrl).then((r) => r.arrayBuffer()),
        fetch(FrauncesItalicUrl).then((r) => r.arrayBuffer()),
        fetch(FrauncesBoldItalicUrl).then((r) => r.arrayBuffer()),
        fetch(DMSansRegularUrl).then((r) => r.arrayBuffer()),
        fetch(DMSansBoldUrl).then((r) => r.arrayBuffer()),
        fetch(SyneBoldUrl).then((r) => r.arrayBuffer()),
        fetch(SyneExtraBoldUrl).then((r) => r.arrayBuffer()),
      ]);
      return {
        [FONT_REGULAR]: { data: reg, fallback: true },
        [FONT_BOLD]: { data: bold },
        [FONT_DISPLAY]: { data: display },
        [FONT_DISPLAY_BOLD]: { data: displayBold },
        [FONT_DISPLAY_ITALIC]: { data: displayItalic },
        [FONT_DISPLAY_BOLD_ITALIC]: { data: displayBoldItalic },
        [FONT_SANS]: { data: dmSans },
        [FONT_SANS_BOLD]: { data: dmSansBold },
        [FONT_DISPLAY_SANS]: { data: syneBold },
        [FONT_DISPLAY_SANS_BOLD]: { data: syneExtraBold },
      };
    })();
  }
  return fontPromise;
}



/* ============================================================
 * Shared pdfme builder utilities. All units are millimetres.
 * Defaults sized for A4. The single most important property is
 * that `wrapLines` uses a slightly OVER-estimated char width so
 * pdfme never has to re-wrap mid-word (which produces the
 * "Sum m ary" artefact).
 * ============================================================ */

export const PAGE_W = 210;
export const PAGE_H = 297;
export const PT_PER_MM = 2.8346;
export const ptToMm = (pt: number) => pt / PT_PER_MM;

/* Brand palette — kept in sync with the HTML/React previews.
 * SIENNA is intentionally mutable so the wizard can override the accent
 * colour per-export via setAccent(). ES module live bindings ensure every
 * importer sees the updated value. */
export const INK = "#1a1714";
export const SUBINK = "#2f2b27";
export const MUTED = "#6b6258";
export const HAIRLINE = "#e8dfd1";
export let SIENNA = "#9c5643";
export const DEFAULT_ACCENT = "#9c5643";
export function setAccent(hex: string | null | undefined) {
  SIENNA = hex && /^#?[0-9a-f]{6}$/i.test(hex) ? (hex.startsWith("#") ? hex : `#${hex}`) : DEFAULT_ACCENT;
}

/* Active font theme — mutated by setFontTheme() before each export so all
 * builders pick up the user-selected style via ES module live bindings. */
export let FONT_DISPLAY_ACTIVE: string = FONT_SANS_BOLD;
export let FONT_DISPLAY_REGULAR_ACTIVE: string = FONT_SANS;
export let FONT_BODY_ACTIVE: string = FONT_REGULAR;
export let FONT_BODY_BOLD_ACTIVE: string = FONT_BOLD;
export let FONT_BODY_ITALIC_ACTIVE: string = FONT_DISPLAY_ITALIC;
/** Per-theme width multiplier applied by estimatedTextWidthMm so wrapping
 * stays safe when the active body font is wider than Roboto (Fraunces / Syne). */
let FONT_WIDTH_MULT = 1.0;
export function setFontTheme(style: FontStyleId | null | undefined) {
  const t = getFontTheme(style);
  FONT_DISPLAY_ACTIVE = t.display;
  FONT_DISPLAY_REGULAR_ACTIVE = t.displayRegular;
  FONT_BODY_ACTIVE = t.body;
  FONT_BODY_BOLD_ACTIVE = t.bodyBold;
  FONT_BODY_ITALIC_ACTIVE = t.bodyItalic;
  // Width safety margin per theme. Fraunces glyphs are ~8% wider than DM Sans;
  // Syne (editorial display) is much wider but only used for headings which
  // pass their own short strings.
  FONT_WIDTH_MULT = style === "classic" ? 1.09 : style === "editorial" ? 1.03 : 1.0;
}


/**
 * Average character width per pt of font size for pdfme's default Roboto.
 * Roboto Regular ~0.50, Bold ~0.54 for mixed-case prose. ALL-CAPS strings
 * (skill names, headings) render noticeably wider — capitals average ~0.58.
 * We make the estimate content-aware so caps-heavy text reserves enough
 * vertical space (no overlap between sidebar items) while body bullets
 * don't over-reserve and leave phantom blank lines.
 */
function estimatedTextWidthMm(
  text: string,
  fontSizePt: number,
  bold: boolean,
  letterSpacing = 0,
) {
  const widthUnits = Array.from(text).reduce((sum, ch) => {
    if (ch === " ") return sum + 0.28;
    if (/[A-Z]/.test(ch)) return sum + (bold ? 0.61 : 0.57);
    if (/[a-z]/.test(ch)) return sum + (bold ? 0.52 : 0.48);
    if (/[0-9]/.test(ch)) return sum + 0.53;
    if (/[.,;:'`!|]/.test(ch)) return sum + 0.25;
    if (/[-–—/\\()]/.test(ch)) return sum + 0.34;
    return sum + (bold ? 0.56 : 0.51);
  }, 0);
  const tracking = Math.max(0, text.length - 1) * (letterSpacing / PT_PER_MM);
  // Light safety factor: enough that wrapLines never under-predicts so pdfme
  // won't re-wrap on us. Bullet rendering pre-wraps with this same function
  // and emits one block per line, so spacing stays deterministic.
  return ((fontSizePt * widthUnits) / PT_PER_MM + tracking) * 1.04;

}

export function textWidthMm(
  text: string,
  fontSizePt: number,
  opts: { bold?: boolean; letterSpacing?: number } = {},
) {
  return estimatedTextWidthMm(text, fontSizePt, !!opts.bold, opts.letterSpacing ?? 0);
}


function splitLongToken(token: string, maxWidthMm: number, fontSizePt: number, bold: boolean, letterSpacing: number) {
  const parts: string[] = [];
  let cur = "";
  for (const ch of Array.from(token)) {
    const next = cur + ch;
    if (cur && estimatedTextWidthMm(next, fontSizePt, bold, letterSpacing) > maxWidthMm) {
      parts.push(cur);
      cur = ch;
    } else {
      cur = next;
    }
  }
  if (cur) parts.push(cur);
  return parts;
}

export function wrapLines(
  text: string,
  widthMm: number,
  fontSizePt: number,
  opts: { bold?: boolean; letterSpacing?: number } = {},
): string[] {
  const lines: string[] = [];
  const bold = !!opts.bold;
  const letterSpacing = opts.letterSpacing ?? 0;
  // Tiny safety margin so we never under-predict vs pdfme's real wrapper.
  const maxWidth = Math.max(2, widthMm - 0.3);
  for (const para of (text || "").split(/\n/)) {
    const cleanPara = para.trim();
    if (!cleanPara) {
      lines.push("");
      continue;
    }
    // Split on whitespace; also allow long hyphenated tokens to break at
    // hyphens (matches pdfme's wrap behaviour and keeps "CROSS-CULTURAL
    // BUSINESS DEVELOPMENT" predictable).
    const words = cleanPara.split(/\s+/).flatMap((w) =>
      estimatedTextWidthMm(w, fontSizePt, bold, letterSpacing) > maxWidth * 0.65 && w.includes("-")
        ? w.split(/(?<=-)/)
        : [w],
    );
    let cur = "";
    for (const w of words) {
      const next = cur ? cur + " " + w : w;
      if (estimatedTextWidthMm(next, fontSizePt, bold, letterSpacing) <= maxWidth) {
        cur = next;
      } else {
        if (cur) lines.push(cur);
        if (estimatedTextWidthMm(w, fontSizePt, bold, letterSpacing) > maxWidth) {
          const parts = splitLongToken(w, maxWidth, fontSizePt, bold, letterSpacing);
          lines.push(...parts.slice(0, -1));
          cur = parts[parts.length - 1] ?? "";
        } else {
          cur = w;
        }
      }
    }
    if (cur) lines.push(cur);
  }
  return lines.length ? lines : [""];
}

export function textHeightMm(
  text: string,
  widthMm: number,
  fontSizePt: number,
  lineHeight = 1.25,
  opts: { bold?: boolean; letterSpacing?: number } = {},
) {
  const n = wrapLines(text, widthMm, fontSizePt, opts).length;
  return n * ptToMm(fontSizePt) * lineHeight;
}

export async function urlToDataUrl(url: string): Promise<string | null> {
  try {
    const r = await fetch(url);
    const b = await r.blob();
    return await new Promise((res, rej) => {
      const fr = new FileReader();
      fr.onloadend = () => res(fr.result as string);
      fr.onerror = rej;
      fr.readAsDataURL(b);
    });
  } catch {
    return null;
  }
}

/** Mask an image URL into a circular PNG data URL (transparent corners). */
export async function maskImageCircle(url: string): Promise<string | null> {
  if (typeof document === "undefined") return url;
  try {
    const dataUrl = url.startsWith("data:") ? url : await urlToDataUrl(url);
    if (!dataUrl) return null;
    const img = await new Promise<HTMLImageElement>((res, rej) => {
      const el = new Image();
      el.crossOrigin = "anonymous";
      el.onload = () => res(el);
      el.onerror = rej;
      el.src = dataUrl;
    });
    const size = Math.min(img.naturalWidth, img.naturalHeight);
    if (!size) return url;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return url;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    const sx = (img.naturalWidth - size) / 2;
    const sy = (img.naturalHeight - size) / 2;
    ctx.drawImage(img, sx, sy, size, size, 0, 0, size, size);
    return canvas.toDataURL("image/png");
  } catch {
    return url;
  }
}

/** Mask an image URL into a rounded-square PNG (slightly rounded corners). */
export async function maskImageRounded(url: string, radiusFrac = 0.1): Promise<string | null> {
  if (typeof document === "undefined") return url;
  try {
    const dataUrl = url.startsWith("data:") ? url : await urlToDataUrl(url);
    if (!dataUrl) return null;
    const img = await new Promise<HTMLImageElement>((res, rej) => {
      const el = new Image();
      el.crossOrigin = "anonymous";
      el.onload = () => res(el);
      el.onerror = rej;
      el.src = dataUrl;
    });
    const size = Math.min(img.naturalWidth, img.naturalHeight);
    if (!size) return url;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return url;
    const r = size * radiusFrac;
    ctx.beginPath();
    ctx.moveTo(r, 0);
    ctx.lineTo(size - r, 0);
    ctx.quadraticCurveTo(size, 0, size, r);
    ctx.lineTo(size, size - r);
    ctx.quadraticCurveTo(size, size, size - r, size);
    ctx.lineTo(r, size);
    ctx.quadraticCurveTo(0, size, 0, size - r);
    ctx.lineTo(0, r);
    ctx.quadraticCurveTo(0, 0, r, 0);
    ctx.closePath();
    ctx.clip();
    const sx = (img.naturalWidth - size) / 2;
    const sy = (img.naturalHeight - size) / 2;
    ctx.drawImage(img, sx, sy, size, size, 0, 0, size, size);
    return canvas.toDataURL("image/png");
  } catch {
    return url;
  }
}

export interface BuilderOpts {
  margin?: number;
  top?: number;
  bottom?: number;
}

export interface TextOpts {
  value: string;
  x?: number;
  y?: number;
  width?: number;
  fontSize: number;
  color?: string;
  align?: "left" | "right" | "center" | "justify";
  lineHeight?: number;
  spaceAfter?: number;
  uppercase?: boolean;
  letterSpacing?: number;
  bold?: boolean;
  /** Override font family (e.g. FONT_DISPLAY for a serif name treatment). */
  fontName?: string;
  bgColor?: string;
  /** When true, render text as inline-markdown so [label](https://url) becomes a clickable PDF link. */
  markdown?: boolean;
  /** Override the string used to estimate width/height (e.g. visible text when value contains markdown URLs). */
  measureValue?: string;
}

export interface LineOpts {
  x: number;
  y: number;
  width: number;
  height?: number;
  color: string;
}

export interface RectOpts {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  borderColor?: string;
  borderWidth?: number;
  radius?: number;
}

export interface LinkOpts {
  x: number;
  y: number;
  width: number;
  height: number;
  uri: string;
}

export interface PdfmeBuilder {
  PAGE_W: number;
  PAGE_H: number;
  margin: number;
  contentW: number;
  top: number;
  bottom: number;
  get cursorY(): number;
  set cursorY(v: number);
  pageBottom: number;
  pageIndex: number;
  pageCount: number;
  newPage(): void;
  setPageIndex(i: number): void;
  ensure(h: number): void;
  /** Register a callback that runs after each newPage() — useful for repeating backgrounds. */
  onNewPage(cb: (b: PdfmeBuilder) => void): void;
  /** Add a text block at the current cursor (or absolute pos); auto-advances cursor when y omitted. */
  addText(o: TextOpts): number;
  addLine(o: LineOpts): void;
  addRect(o: RectOpts): void;
  addImage(o: { x: number; y: number; w: number; h: number; data: string }): void;
  addLink(o: LinkOpts): void;
  toBlob(): Promise<Blob>;
  finalize(fileName: string): Promise<void>;
}

export function createBuilder(opts: BuilderOpts = {}): PdfmeBuilder {
  const initialMargin = opts.margin ?? 16;
  const top = opts.top ?? 16;
  const bottom = opts.bottom ?? 16;

  const pages: Array<Array<Schema & { name: string }>> = [[]];
  const inputs: Record<string, string> = {};
  const links: Array<LinkOpts & { pageIndex: number }> = [];
  let pageIdx = 0;
  let y = top;
  let counter = 0;
  const uid = (p: string) => `${p}_${counter++}`;
  let onNewPage: ((b: PdfmeBuilder) => void) | null = null;

  const push = (s: Schema & { name: string }, value = "") => {
    pages[pageIdx].push(s);
    inputs[s.name] = value;
  };

  const builder: PdfmeBuilder & { onNewPage: (cb: (b: PdfmeBuilder) => void) => void } = {
    PAGE_W,
    PAGE_H,
    margin: initialMargin,
    contentW: PAGE_W - initialMargin * 2,
    top,
    bottom,
    pageBottom: PAGE_H - bottom,
    get pageIndex() {
      return pageIdx;
    },
    get pageCount() {
      return pages.length;
    },
    get cursorY() {
      return y;
    },
    set cursorY(v: number) {
      y = v;
    },
    newPage() {
      pages.push([]);
      pageIdx = pages.length - 1;
      y = top;
      if (onNewPage) onNewPage(this);
    },
    setPageIndex(i: number) {
      if (i < 0 || i >= pages.length) throw new Error(`setPageIndex out of range: ${i}`);
      pageIdx = i;
    },
    ensure(h: number) {
      if (y + h > PAGE_H - bottom) this.newPage();
    },
    /** Register a callback invoked after each newPage() (e.g. to redraw a sidebar bg). */
    onNewPage(cb: (b: PdfmeBuilder) => void) {
      onNewPage = cb;
    },
    addText(o: TextOpts) {
      const value = o.uppercase ? o.value.toUpperCase() : o.value;
      const width = o.width ?? this.contentW;
      const x = o.x ?? this.margin;
      const lh = o.lineHeight ?? 1.25;
      const measure = o.measureValue ?? value;
      const h = Math.max(
        ptToMm(o.fontSize) * lh,
        textHeightMm(measure, width, o.fontSize, lh, {
          bold: o.bold,
          letterSpacing: o.letterSpacing,
        }),
      );
      const useCursor = o.y === undefined;
      if (useCursor) this.ensure(h);
      const py = o.y ?? y;
      push(
        {
          name: uid("t"),
          type: "text",
          position: { x, y: py },
          width,
          height: h + 0.5,
          fontSize: o.fontSize,
          fontName: o.fontName ?? (o.bold ? FONT_BODY_BOLD_ACTIVE : FONT_BODY_ACTIVE),
          fontColor: o.color ?? INK,
          alignment: o.align ?? "left",
          verticalAlignment: "top",
          lineHeight: lh,
          characterSpacing: o.letterSpacing ?? 0,
          backgroundColor: o.bgColor ?? "",
          ...(o.markdown ? { textFormat: "inline-markdown", readOnly: true } : {}),

        } as Schema & { name: string },
        value,
      );
      if (useCursor) y += h + (o.spaceAfter ?? 1);
      return h;
    },
    addLine(o: LineOpts) {
      push(
        {
          name: uid("ln"),
          type: "line",
          position: { x: o.x, y: o.y },
          width: o.width,
          height: o.height ?? 0.4,
          color: o.color,
        } as Schema & { name: string },
        "",
      );
    },
    addRect(o: RectOpts) {
      push(
        {
          name: uid("rc"),
          type: "rectangle",
          position: { x: o.x, y: o.y },
          width: o.width,
          height: o.height,
          color: o.color,
          borderColor: o.borderColor ?? "",
          borderWidth: o.borderWidth ?? 0,
          radius: o.radius ?? 0,
        } as Schema & { name: string },
        "",
      );
    },
    addImage(o) {
      push(
        {
          name: uid("img"),
          type: "image",
          position: { x: o.x, y: o.y },
          width: o.w,
          height: o.h,
        } as Schema & { name: string },
        o.data,
      );
    },
    addLink(o) {
      const uri = o.uri.trim();
      if (!uri || o.width <= 0 || o.height <= 0) return;
      links.push({ ...o, uri, pageIndex: pageIdx });
    },
    async toBlob() {
      const template: Template = {
        basePdf: { width: PAGE_W, height: PAGE_H, padding: [0, 0, 0, 0] },
        schemas: pages,
      };
      const font = await loadFont();
      const pdf = await generate({
        template,
        inputs: [inputs],
        plugins: { text, image, line, rectangle },
        options: { font },
      });

      let bytes = pdf as unknown as Uint8Array;
      if (links.length) {
        const doc = await PDFDocument.load(bytes);
        const pdfPages = doc.getPages();
        for (const link of links) {
          const page = pdfPages[link.pageIndex];
          if (!page) continue;
          const x1 = link.x * PT_PER_MM;
          const y1 = (PAGE_H - link.y - link.height) * PT_PER_MM;
          const x2 = (link.x + link.width) * PT_PER_MM;
          const y2 = (PAGE_H - link.y) * PT_PER_MM;
          const annotation = doc.context.obj({
            Type: PDFName.of("Annot"),
            Subtype: PDFName.of("Link"),
            Rect: [x1, y1, x2, y2],
            Border: [0, 0, 0],
            A: {
              Type: PDFName.of("Action"),
              S: PDFName.of("URI"),
              URI: PDFString.of(link.uri),
            },
          });
          page.node.addAnnot(doc.context.register(annotation));
        }
        bytes = await doc.save();
      }
      return new Blob([bytes as unknown as BlobPart], { type: "application/pdf" });
    },
    async finalize(fileName: string) {
      const blob = await this.toBlob();
      saveAs(blob, fileName);
    },
  };
  return builder;
}
