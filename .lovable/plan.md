## Goal
Make the Professional Summary text render **justified** (full-justified, both edges aligned) in its dedicated block across every output: web preview, PDF, and DOCX, for all templates.

## Scope
Only the summary paragraph is affected. No layout, spacing, or color changes. Bullets, headings, and other body copy stay as they are.

## Changes

### 1. Web preview templates (`src/components/cv-builder/templates/`)
Add `text-justify hyphens-auto` to the `<p>` that renders `cv.summary` in:
- TemplateModern.tsx
- TemplateClassic.tsx
- TemplateExecutive.tsx
- TemplateGeneva.tsx
- TemplateMilano.tsx
- TemplateTokyo.tsx
- TemplateSkillsFirst.tsx
- TemplateRiyadh.tsx
- TemplateCasablanca.tsx
- TemplateCompact.tsx (if it renders summary)

### 2. PDF export (`src/lib/cv/pdfme/exportModernPdfme.ts`)
For each of the ~7 `b.addText({ value: cv.summary, ... })` call sites (Modern, Classic, Executive quote-block, two-column compact left col, Tokyo, Milano, etc.), add `align: "justify"`.

### 3. DOCX export
- `src/lib/docx/flow.ts` — the `txt(cv.summary, ...)` call and the `quoteSummary` branch.
- `src/lib/docx/sidebar.ts` — `renderSummary()` paragraph.
- `src/lib/docx/compact.ts` — left-column summary paragraph.
- `src/lib/docx/shared.ts` — `quoteSummary()` helper.

Pass `alignment: AlignmentType.JUSTIFIED` on each summary `Paragraph`. Optionally extend `txt()` to accept an `alignment` option so callers can opt in without a one-off paragraph.

## Notes
- Quote-style summary (Executive/Zurich) keeps its left accent bar; only the text alignment changes.
- Justified text with very short summaries (1–2 lines) looks the same as left-aligned, so no visible regression on short content.
- No font, color, or size changes.
