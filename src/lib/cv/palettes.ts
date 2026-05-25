/**
 * CV colour palettes — applied to both the web preview (via a CSS variable
 * override on the renderer root) and the PDF export (via the `accent` arg
 * passed to generateCvPdfmeBlob).
 */
export type PaletteId =
  | "sienna"
  | "navy"
  | "forest"
  | "charcoal"
  | "burgundy"
  | "teal";

export interface Palette {
  id: PaletteId;
  name: string;
  /** Tailwind/web accent — HSL triplet (no hsl() wrapper). */
  accentHsl: string;
  /** Hex equivalent used by the PDF exporter. */
  accentHex: string;
}

export const PALETTES: Palette[] = [
  { id: "sienna",   name: "Sienna",   accentHsl: "13 40% 44%",  accentHex: "#9c5643" },
  { id: "navy",     name: "Navy",     accentHsl: "215 53% 25%", accentHex: "#1e3a5f" },
  { id: "forest",   name: "Forest",   accentHsl: "140 36% 27%", accentHex: "#2d5a3d" },
  { id: "charcoal", name: "Charcoal", accentHsl: "0 0% 18%",    accentHex: "#2d2d2d" },
  { id: "burgundy", name: "Burgundy", accentHsl: "354 55% 27%", accentHex: "#6b1f2a" },
  { id: "teal",     name: "Teal",     accentHsl: "181 65% 21%", accentHex: "#14595a" },
];

export const DEFAULT_PALETTE: PaletteId = "sienna";

export function getPalette(id: PaletteId | string | null | undefined): Palette {
  return PALETTES.find((p) => p.id === id) ?? PALETTES[0];
}
