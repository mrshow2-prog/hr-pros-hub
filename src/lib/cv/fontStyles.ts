/**
 * Font style presets shared between the React preview and the pdfme exporter.
 * Each preset maps the CSS variables `--cv-font-display` (used by `font-syne`,
 * `font-serif`, `font-display`) and `--cv-font-body` (used by `font-dm`).
 */
export type FontStyleId = "modern" | "classic" | "editorial";

export interface FontStyleMeta {
  id: FontStyleId;
  label: string;
  description: string;
  /** Sample glyph(s) shown in the picker chip. */
  sample: string;
  /** Inline style applied to the CV root. */
  vars: React.CSSProperties;
}

export const FONT_STYLES: FontStyleMeta[] = [
  {
    id: "modern",
    label: "Modern Sans",
    description: "Clean contemporary sans",
    sample: "Aa",
    vars: {
      ["--cv-font-display" as never]: '"DM Sans"',
      ["--cv-font-body" as never]: '"DM Sans"',
    },
  },
  {
    id: "classic",
    label: "Classic Serif",
    description: "Traditional editorial serif",
    sample: "Aa",
    vars: {
      ["--cv-font-display" as never]: "Fraunces",
      ["--cv-font-body" as never]: "Fraunces",
    },
  },
  {
    id: "editorial",
    label: "Editorial Display",
    description: "Geometric display sans",
    sample: "Aa",
    vars: {
      ["--cv-font-display" as never]: "Syne",
      ["--cv-font-body" as never]: '"DM Sans"',
    },
  },
];

export function getFontStyleMeta(id: FontStyleId | null | undefined): FontStyleMeta {
  return FONT_STYLES.find((f) => f.id === id) ?? FONT_STYLES[0];
}

export function getFontStyleVars(id: FontStyleId | null | undefined): React.CSSProperties {
  return getFontStyleMeta(id).vars;
}
