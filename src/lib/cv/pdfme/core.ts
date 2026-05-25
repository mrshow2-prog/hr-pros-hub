import { generate } from "@pdfme/generator";
import { text, image, line, rectangle } from "@pdfme/schemas";
import type { Template, Schema } from "@pdfme/common";
import { saveAs } from "file-saver";

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

/* Brand palette — kept in sync with the HTML/React previews. */
export const INK = "#1a1714";
export const SUBINK = "#2f2b27";
export const MUTED = "#6b6258";
export const HAIRLINE = "#e8dfd1";
export const SIENNA = "#9c5643";

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
    if (ch === " ") return sum + 0.26;
    if (/[A-Z]/.test(ch)) return sum + (bold ? 0.62 : 0.58);
    if (/[a-z]/.test(ch)) return sum + (bold ? 0.51 : 0.46);
    if (/[0-9]/.test(ch)) return sum + 0.52;
    if (/[.,;:'`!|]/.test(ch)) return sum + 0.24;
    if (/[-–—/\\()]/.test(ch)) return sum + 0.34;
    return sum + (bold ? 0.56 : 0.50);
  }, 0);
  const tracking = Math.max(0, text.length - 1) * (letterSpacing / PT_PER_MM);
  return (fontSizePt * widthUnits) / PT_PER_MM + tracking;
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
          cur = parts.at(-1) ?? "";
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
  align?: "left" | "right" | "center";
  lineHeight?: number;
  spaceAfter?: number;
  uppercase?: boolean;
  letterSpacing?: number;
  bold?: boolean;
  bgColor?: string;
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
  newPage(): void;
  ensure(h: number): void;
  /** Register a callback that runs after each newPage() — useful for repeating backgrounds. */
  onNewPage(cb: (b: PdfmeBuilder) => void): void;
  /** Add a text block at the current cursor (or absolute pos); auto-advances cursor when y omitted. */
  addText(o: TextOpts): number;
  addLine(o: LineOpts): void;
  addRect(o: RectOpts): void;
  addImage(o: { x: number; y: number; w: number; h: number; data: string }): void;
  toBlob(): Promise<Blob>;
  finalize(fileName: string): Promise<void>;
}

export function createBuilder(opts: BuilderOpts = {}): PdfmeBuilder {
  const initialMargin = opts.margin ?? 16;
  const top = opts.top ?? 16;
  const bottom = opts.bottom ?? 16;

  const pages: Array<Array<Schema & { name: string }>> = [[]];
  const inputs: Record<string, string> = {};
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
    get cursorY() {
      return y;
    },
    set cursorY(v: number) {
      y = v;
    },
    newPage() {
      pages.push([]);
      pageIdx++;
      y = top;
      if (onNewPage) onNewPage(this);
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
      const h = Math.max(
        ptToMm(o.fontSize) * lh,
        textHeightMm(value, width, o.fontSize, lh, {
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
          fontColor: o.color ?? INK,
          alignment: o.align ?? "left",
          verticalAlignment: "top",
          lineHeight: lh,
          characterSpacing: o.letterSpacing ?? 0,
          backgroundColor: o.bgColor ?? "",
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
    async toBlob() {
      const template: Template = {
        basePdf: { width: PAGE_W, height: PAGE_H, padding: [0, 0, 0, 0] },
        schemas: pages,
      };
      const pdf = await generate({
        template,
        inputs: [inputs],
        plugins: { text, image, line, rectangle },
      });
      return new Blob([pdf as unknown as BlobPart], { type: "application/pdf" });
    },
    async finalize(fileName: string) {
      const blob = await this.toBlob();
      saveAs(blob, fileName);
    },
  };
  return builder;
}
