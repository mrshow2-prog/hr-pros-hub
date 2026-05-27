## Goal

Take the first two deferred items from the previous audit and fix them so the user's selected color palette (Sienna / Navy / Forest / Charcoal / Burgundy / Teal) actually drives the look of:

1. The **Bold** template sidebar (and its sibling Casablanca sidebar), which today renders a hard-coded brown / slate background.
2. The **skill chips/pills** across templates that currently use a hard-coded `bg-clay` (cream) background or no palette tint at all.

## 1. Bold sidebar palette

**Current behavior (bug):**
- `TemplateRiyadh.tsx` line 180: sidebar wrapper uses `style={{ backgroundColor: "#6E3D2F" }}` — a hard-coded brown, regardless of selected palette.
- `TemplateCasablanca.tsx` lines 32–33: `sidebarBg = "#1f2933"` (hard-coded slate). Accent var is honored elsewhere, but the sidebar itself is not.

**Fix:**
- Read the palette accent from the same CSS var the rest of the templates use: `var(--accent, <fallback>)`.
- For Riyadh: replace the hard-coded `#6E3D2F` with a darker derivation of the palette accent so contrast against the white text stays strong. Use `color-mix(in srgb, var(--accent, #9c5643) 78%, #0a0a0a)` (≈ palette accent shaded ~22% toward black). Fallback color stays sienna-brown so non-palette environments keep working.
- For Casablanca: same approach for the sidebar background — `color-mix(in srgb, var(--accent) 18%, #1f2933)` so the slate stays the dominant tone but takes on a subtle hue from the palette. Existing accent stripes/buttons inside the sidebar already use `--accent`, so they remain consistent.
- Apply the same palette-derived background in the **PDF builders** for these templates so download matches preview:
  - `src/lib/cv/pdfme/exportModernPdfme.ts` → Riyadh sidebar block: replace any hard-coded sidebar fill with a `shade(accentHex, 0.22)` helper.
  - `src/lib/docx/sidebar.ts` (Riyadh DOCX) → same shading applied to the sidebar cell shading hex.
- Add a tiny color helper `shade(hex, amount)` in `src/lib/cv/palettes.ts` (or a new `src/lib/cv/colorUtils.ts`) that returns a hex blended toward black/white by the given fraction. Pure function, no deps.

## 2. Skill chip palette-aware backgrounds

**Current behavior (inconsistencies):**
- `TemplateSkillsFirst.tsx` line 23: skill chips use `bg-clay` (hard-coded cream) and `border-ink/10`.
- `TemplateTokyo.tsx` already uses `color-mix(... ${accent} 8%, transparent)` — good reference.
- `TemplateMilano.tsx` uses solid accent + outline alt — already palette-driven.
- Other templates (Modern, Classic, Executive, Geneva, Riyadh, Casablanca) render skills as bullet lists, not chips — out of scope for this fix.

**Fix:**
- `TemplateSkillsFirst.tsx`: change the chip background from `bg-clay` to inline `background: color-mix(in srgb, var(--accent, #9c5643) 10%, white)` and the border to `borderColor: color-mix(in srgb, var(--accent) 35%, transparent)`. Keep text color as `text-ink`. Result: chips visually tie to the palette while staying soft.
- Verify `TemplateTokyo` chips (already accent-tinted) still look fine across all 6 palettes; if the 8% tint disappears on lighter palettes, bump to 10%.
- Mirror the change in exporters:
  - `src/lib/cv/pdfme/exportModernPdfme.ts` (SkillsFirst builder): when drawing the skill chip rectangles, fill them with `mix(accentHex, "#ffffff", 0.9)` and stroke with `mix(accentHex, "#ffffff", 0.65)`. Use the same `shade`/`mix` helper introduced above.
  - `src/lib/docx/singleColumn.ts` (Berlin = SkillsFirst DOCX) and `src/lib/docx/flow.ts` skills-pills variant: pass the same tinted hex as the cell shading for the pill cells.

## 3. Verification

- After implementing, cycle the palette picker through all 6 palettes on:
  - Step Draft preview (PdfmePreview): Bold + Skills templates.
  - Step Template selector card preview.
- Export PDF + DOCX of Bold and Skills templates with two contrasting palettes (e.g. Navy and Burgundy) and confirm:
  - Bold sidebar background visibly changes hue per palette and keeps white text readable.
  - Skill chips visibly tint per palette in preview, PDF, and DOCX.
- No regression on other templates (Modern, Classic, Executive, Geneva, Editorial, Tokyo, Milano, Casablanca main content).

## Files touched

- `src/lib/cv/palettes.ts` (or new `src/lib/cv/colorUtils.ts`) — add `mix` / `shade` hex helpers.
- `src/components/cv-builder/templates/TemplateRiyadh.tsx` — palette-driven sidebar bg.
- `src/components/cv-builder/templates/TemplateCasablanca.tsx` — palette-tinted sidebar bg.
- `src/components/cv-builder/templates/TemplateSkillsFirst.tsx` — palette-tinted chips.
- `src/components/cv-builder/templates/TemplateTokyo.tsx` — minor tint tweak if needed.
- `src/lib/cv/pdfme/exportModernPdfme.ts` — Bold sidebar fill + Skills chip fill use new helpers.
- `src/lib/docx/sidebar.ts` — Bold sidebar shading uses shaded accent.
- `src/lib/docx/singleColumn.ts` / `src/lib/docx/flow.ts` — Skills pills shading uses tinted accent.

## Out of scope (still deferred for later)

- Editorial PDF rail pagination, photo aspect-ratio for non-circle shapes, dedicated exporters for Vibrant/Gradient/Creative, Detailed DOCX pipeline migration, and the remaining items from the earlier template review.
