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

/* ---------- Hex color helpers (no deps) ---------- */

function clamp(n: number, lo = 0, hi = 255) {
  return Math.max(lo, Math.min(hi, n));
}

function parseHex(hex: string): [number, number, number] {
  const clean = hex.trim().replace(/^#/, "");
  const full = clean.length === 3
    ? clean.split("").map((c) => c + c).join("")
    : clean;
  const n = parseInt(full.slice(0, 6), 16);
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
}

function toHex(rgb: [number, number, number], withHash = true): string {
  const s = rgb
    .map((c) => clamp(Math.round(c)).toString(16).padStart(2, "0"))
    .join("");
  return withHash ? `#${s}` : s.toUpperCase();
}

/** Blend two hex colours. amount=0 → a, amount=1 → b. */
export function mixHex(a: string, b: string, amount: number, withHash = true): string {
  const [ar, ag, ab] = parseHex(a);
  const [br, bg, bb] = parseHex(b);
  const t = clamp(amount, 0, 1);
  return toHex(
    [ar + (br - ar) * t, ag + (bg - ag) * t, ab + (bb - ab) * t],
    withHash,
  );
}

/** Darken (positive) or lighten (negative) a hex colour by a 0-1 fraction. */
export function shadeHex(hex: string, amount: number, withHash = true): string {
  if (amount >= 0) return mixHex(hex, "#000000", amount, withHash);
  return mixHex(hex, "#ffffff", -amount, withHash);
}
