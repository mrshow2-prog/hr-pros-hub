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
 * Calibrated against actual rendered output: Roboto Regular ~0.50, Bold ~0.54.
 * If set too HIGH we over-predict line count and leave phantom blank lines
 * below text blocks (we reserve more vertical space than pdfme actually
 * renders). If set too LOW, pdfme may wrap a word into the next line and
 * overflow the element (the "Sum m ary" artefact). 0.50/0.54 is the sweet
 * spot for Roboto at 9–12pt body sizes.
 */
function charWidthMm(fontSizePt: number, bold: boolean, letterSpacing = 0) {
  const ratio = bold ? 0.54 : 0.50;
  return (fontSizePt * ratio) / PT_PER_MM + letterSpacing;
}

export function wrapLines(
  text: string,
  widthMm: number,
  fontSizePt: number,
  opts: { bold?: boolean; letterSpacing?: number } = {},
): string[] {
  const lines: string[] = [];
  const cw = charWidthMm(fontSizePt, !!opts.bold, opts.letterSpacing ?? 0);
  // Tiny safety margin so we never under-predict vs pdfme's real wrapper.
  const maxChars = Math.max(4, Math.floor((widthMm - 0.3) / cw));
  for (const para of (text || "").split(/\n/)) {
    if (!para) {
      lines.push("");
      continue;
    }
    const words = para.split(/\s+/);
    let cur = "";
    for (const w of words) {
      const next = cur ? cur + " " + w : w;
      if (next.length <= maxChars) {
        cur = next;
      } else {
        if (cur) lines.push(cur);
        if (w.length > maxChars) {
          let rest = w;
          while (rest.length > maxChars) {
            lines.push(rest.slice(0, maxChars));
            rest = rest.slice(maxChars);
          }
          cur = rest;
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
