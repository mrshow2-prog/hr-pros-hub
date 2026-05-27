## What you're seeing

In the React preview templates, the role + date row uses the full content width (left edge = title, right edge = dates). The bullet list sits below that row with a left indent (`pl-4`/`pl-5`/`pl-6` on each `<li>` — about 16–24 px). The bullet text's right edge already matches the date's right edge, but the left edge is pushed in, so each bullet row is visibly narrower than the title/date row above it and wraps to a new line sooner.

The PDF exporter (`bullet()` in `src/lib/cv/pdfme/exportModernPdfme.ts`) has the same shape: glyph at the body margin, text starts at `margin + 4.4 mm`, text ends at `margin + contentW` (same right edge as dates). Right edge is fine; the left indent is the cause.

## Fix

Make each bullet row visually as wide as the title/date row by switching to a **hanging-indent** layout: the bullet glyph sits at the same left edge as the title, the text begins just to the right of the glyph, and wrapped lines hang at the glyph offset. The text's right edge already aligns with the date — that stays unchanged.

### React preview templates

For each `<li>` in the experience bullets, replace the current `relative pl-X` + absolutely positioned glyph pattern with a flex row:

```text
<li class="flex gap-2">
  <span class="shrink-0">•</span>      ← glyph column, ~10–12 px
  <span class="flex-1">…bullet text…</span>  ← text, wraps full width
</li>
```

- Files touched: `TemplateModern.tsx`, `TemplateClassic.tsx`, `TemplateExecutive.tsx`, `TemplateSkillsFirst.tsx`, `TemplateRiyadh.tsx`, `TemplateGeneva.tsx`, `TemplateCasablanca.tsx`, `TemplateTokyo.tsx`, `TemplateMilano.tsx`.
- Keep each template's existing glyph character / colour (• vs en-dash vs accent dot) so the look of each template is preserved.
- Geneva / Casablanca: the experience block keeps its `pl-7` / `pl-5` wrapper (used for the timeline rail). The bullet row spans the inner width — i.e. the same width the title/date row already uses inside that wrapper.
- Tokyo / Milano: dates live in a separate left grid column, so the bullets already use the full 1fr column. Apply the same hanging-indent change for visual consistency.

### PDF exporter

In `src/lib/cv/pdfme/exportModernPdfme.ts` `bullet()`:
- Reduce the glyph column from `4.4 mm` to ~`2.8 mm` so bullet text width becomes `contentW − 2.8` instead of `contentW − 4.4`. The right edge stays at `margin + contentW` (unchanged), the left edge moves closer to the body margin, matching the title row.
- Recompute the per-line height with the **new** text width so wrapping height stays in sync — this is the key step that prevents the two regressions you called out:
  - **No overlap**: height is measured against the actual text width used for rendering, so the next row starts below the real bottom of the wrapped text.
  - **No blank lines**: we don't add padding or force extra line breaks; we only narrow the glyph column.

### Safety checks before claiming done

- Visual check in the preview: long bullets in Modern, Bold/Riyadh, and Geneva (the three layouts most prone to wrap) — confirm right edge aligns with the date, no clipping on the left, no overlap with the next bullet or next job block.
- PDF export sanity check: regenerate a Bold and a Simple PDF with multi-line bullets and confirm wrapped lines don't overlap the next row and no spurious blank line appears between bullets.

## Out of scope

- No change to date row alignment, font sizes, section spacing, or colours.
- No change to summary / skills / education sections — only the experience bullets.
