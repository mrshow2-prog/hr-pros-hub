## What I see in your files

**PDF (Compact template, page 1)**
- Left column: Summary + Work Experience render correctly.
- Right column: only the `SKILLS` heading appears — the list items themselves are missing. Root cause: the sidebar is rendered inside a `<View fixed render={pageNumber===1 ? Sidebar : null}>`. In `@react-pdf/renderer`, `fixed` views are re-evaluated on every page but their **height is unbounded and not part of normal flow**, and conditional `render` returning `null` on later pages still reserves no flow space — but more importantly the children inside a fixed view don't measure properly here, so the list collapses.
- Pages 2+ correctly fall to single-column. That part works.

**DOCX (any template)**
- Always renders the **same** sidebar-table layout (photo + contact + skills + education + languages on the left, header band + summary + experience on the right) regardless of whether the user picked Modern / Classic / Compact / Executive / Skills-First.
- Education is duplicated (sidebar **and** below the table). Header band uses colored shading that doesn't match any of the on-screen templates.
- Net effect: PDF ≠ DOCX ≠ on-screen preview.

## Goal
One template choice → two files (PDF + DOCX) that look the same as the on-screen preview.

## Plan

### 1. Fix Compact PDF's empty right column (root fix, not a workaround)
Replace the `fixed` sidebar trick with a real two-column layout on page 1:

```text
Page 1                                        Pages 2+
┌──────────── header ────────────┐            ┌──────────── header (running) ──────────┐
│ Summary │ Skills               │            │                                         │
│ Experi- │ Languages            │            │ Work Experience overflow (full width)   │
│ ence    │                      │            │                                         │
│ (start) │                      │            │ Education                               │
└─────────┴──────────────────────┘            └─────────────────────────────────────────┘
```

Implementation:
- Page 1 wrapped in a non-breaking `<View wrap={false}>` containing **two real columns** side-by-side (`flexDirection: "row"`). Left = Summary + as much Experience as fits. Right = Skills + Languages (rendered inline, not fixed).
- Remaining Experience emitted as siblings after a `<View break />`, full-width with no reserved padding.
- Education rendered once, full-width after Experience.
- Running header on pages 2+ stays in its own band with top padding so it never collides with body text.
- No `fixed` view with conditional render — this is the source of the empty column.

### 2. Build per-template DOCX renderers (mirror the PDF router)
Create `src/lib/docx/` with the same 5 templates:

```text
src/lib/docx/
  docxRouter.ts        // template → docx Document
  docxModern.ts        // single column, accent-bar headings (mirrors PdfModern)
  docxClassic.ts       // single column, serif, underline headings
  docxExecutive.ts     // single column, large display headings, optional top-right photo
  docxCompact.ts       // 2-col page-1 table (Summary+Exp | Skills+Languages), then full-width overflow — mirrors PdfCompact
  docxSkillsFirst.ts   // skills band on top, then experience
  shared.ts            // shared font map, color, helpers (bullets, period line, contact line)
```

- Each renderer **only** includes the sections that template shows, in the order it shows them, with the typography mapped from `cvTemplateConfig` (Times → Georgia, Helvetica → Calibri, primary color → heading color/accent).
- No section appears twice. Contact info shown once (in the header), not also in a sidebar.
- For Compact specifically: use a single docx `Table` with two cells for page-1 content (mirroring the PDF), then full-width paragraphs for experience overflow + education below.
- `exportCVToDocx(cv, fileName, template, photoUrl)` becomes a thin wrapper that calls `docxRouter`.
- Delete the existing monolithic DOCX builder in `cvExport.ts`.

### 3. Acceptance checklist
- Picking **Compact** and exporting → PDF page 1 has Skills + Languages populated on the right column (not just the heading). DOCX page 1 looks the same as that PDF page 1 (two-column header on top, Summary + Experience left, Skills + Languages right). Experience overflows full-width on pages 2+ in both.
- Picking **Modern / Classic / Executive / Skills-First** → both PDF and DOCX are single-column (no sidebar artifact anywhere), with the same section order and same headline styling as the on-screen preview.
- No section appears twice in either file. Contact info appears once. Headings always present where the preview shows them.

### Out of scope (will follow up if you ask)
- AI/content prompt changes (summary length, ATS scoring, gap questions) — already discussed earlier; this pass is strictly about the export pipeline.
- Adding new templates.

## Files
- **Edit**: `src/components/cv-builder/pdf/PdfCompact.tsx` (rewrite right-column logic).
- **Add**: `src/lib/docx/{docxRouter,docxModern,docxClassic,docxExecutive,docxCompact,docxSkillsFirst,shared}.ts`.
- **Edit**: `src/lib/cvExport.ts` — replace inline DOCX builder with `docxRouter`.
- No DB / no edge function changes.
