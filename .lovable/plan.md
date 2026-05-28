# Fix: Bold job titles + premature bullet wrap in PDF templates

## What's actually wrong

I rendered the uploaded PDF and inspected the embedded fonts:

```
pdffonts output → only "Roboto-Regular-116" is embedded
```

Two consequences are visible in the exported CV:

1. **Job titles are not bold.** "Senior Sales Manager", section labels, dates, etc. are all drawn in Roboto Regular. The exporter passes `bold: true` through to `wrapLines()` for width estimation, but the pdfme text schema never sets a bold `fontName`, and `generate()` is called without a `font` registry — so pdfme falls back to its single default face. The boldness in width math is ignored at render time.
2. **Bullet text wraps too early**, leaving a visible empty band on the right even though it mathematically reaches the same right edge as the date column. Cause: `estimatedTextWidthMm()` in `src/lib/cv/pdfme/core.ts` uses Roboto char widths that are slightly inflated (`0.50/0.54` per pt for lower/bold-lower) and then multiplies by a `1.03` safety factor. With real Roboto Regular this over-predicts width by ~5–7%, so the last word of each bullet line is bumped to the next line even though it fits.

## Fix

### A. Register a real bold font (`src/lib/cv/pdfme/core.ts`)

1. Bundle Roboto Regular + Bold as fetchable assets (use the `@pdfme/common`-style font registry shape: `{ Roboto: { data, fallback: true }, 'Roboto-Bold': { data } }`). The cleanest source is the two Google Fonts TTFs we can either:
   - import from the existing `@pdfme/common` install if it ships them, or
   - fetch once at module load from a CDN and cache as `ArrayBuffer`s, or
   - drop two TTFs under `src/lib/cv/pdfme/fonts/` and import them with `?url` + `fetch()`.
   Preferred: add `Roboto-Regular.ttf` and `Roboto-Bold.ttf` under `src/lib/cv/pdfme/fonts/`, import via `?arraybuffer`/`?url`, build the font object once, and pass it to `generate({ template, inputs, plugins, options: { font } })`.
2. In `addText()`, when `o.bold` is true, set `fontName: 'Roboto-Bold'` on the schema. Otherwise leave it as the default Roboto.
3. Keep all existing bold width-estimation paths — they were already correct for the bold face; they just weren't actually rendering bold.

### B. Tighten width estimation so bullets fill the date-aligned column

In `estimatedTextWidthMm()`:

- Reduce the safety multiplier from `* 1.03` to `* 1.01`.
- Nudge the regular per-glyph widths down to match Roboto more closely:
  - lower-case: `0.50 → 0.48` (regular), `0.54 → 0.52` (bold)
  - upper-case: `0.60 → 0.57` (regular), `0.64 → 0.61` (bold)
  - mixed/symbols: `0.53 → 0.51` (regular), `0.58 → 0.56` (bold)

These are conservative trims; combined with the safety factor still being `>1`, wrapping stays safe (no overlap) but lines reach much closer to the column right edge.

Optionally also nudge the bullet glyph column in `bullet()` from `gw = 2.8` mm to `gw = 2.4` mm, since `•` at 9.4 pt is well under 2 mm wide. This gives bullet text another ~0.4 mm of horizontal room.

### C. Verify

After build:

1. Re-export the same CV → `pdffonts` should now list both `Roboto-Regular` and `Roboto-Bold` embedded.
2. Render with `pdftoppm` and inspect:
   - Job titles, section labels, dates, and skill labels visibly heavier than body text.
   - Bullet lines reach the same right edge as the date row above them — no early breaks like "growth and / optimize…" when "optimize" clearly fits.
   - No overlapping text and no two-line bullets that became three lines (i.e. no under-prediction).
3. Spot-check Bold/Riyadh, Executive, Geneva templates too — they share the same `bullet()`/`addText()` and benefit automatically.

## Out of scope

- No template-level layout changes (margins, sidebar widths, font sizes stay the same).
- No React preview changes — the issue is PDF-only; the React previews already render real bold via the browser.
- No font swap to a different family. If after this fix bold still looks too light, we can revisit by switching the bold weight to `Roboto-Black` or by picking a different family — but Roboto Bold is normally clearly distinguishable once actually embedded.
