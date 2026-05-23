## Goal
Make the exported PDF visually match the selected on-screen template, and eliminate duplicated content, empty sidebars on later pages, and missing/duplicated headlines.

## Root cause
- `CVPdfDocument.tsx` renders **one** fixed layout (colored header band + page-1 sidebar + main column) regardless of which template the user picked in `StepTemplate`.
- The page-level `paddingLeft: SIDEBAR_WIDTH + GUTTER` reserves the sidebar column on **every** page, so pages 2+ show a wide empty band on the left.
- Skills, Education, Languages are rendered **both** in the sidebar **and** repeated in the main column, producing duplication (e.g. Skills appearing on page 4 again with the running header "Abanoub Nabil Page 4" bleeding into it).
- Contact info is duplicated in the header band **and** the sidebar.

## Plan

### 1. Per-template PDF renderers
Replace the single `CVPdfDocument` with a router that picks one of 5 PDF layouts, one per template:

```text
src/components/cv-builder/pdf/
  PdfRouter.tsx               // switch on template -> picks PDF below
  PdfModern.tsx               // single-column, sienna section-bar headings
  PdfClassic.tsx              // single-column, serif heads, divider lines
  PdfExecutive.tsx            // single-column, large display headings
  PdfCompact.tsx              // two-column body (left: Summary/Exp/Edu, right: Skills/Languages) — matches user screenshot
  PdfSkillsFirst.tsx          // skills band on top, then experience
  shared.tsx                  // common <Page>, contact line helper, makeBaseStyles
```

`cvExport.ts` keeps generating the PDF the same way; only the rendered Document changes.

### 2. Fix the duplication & empty-sidebar problems
- Render each section exactly once. No more "sidebar + repeat in main column".
- For two-column templates (Compact, SkillsFirst): use a real two-column layout **only on page 1**; on subsequent pages the work-experience overflow runs full-width. Implemented by:
  - Page 1 wrapped in a non-wrapping `<View>` that contains the two columns and as much experience as fits.
  - Remaining experience emitted as a separate flowing block after a `<View break />`, with no left padding reserved.
- For single-column templates (Modern, Classic, Executive): no sidebar at all — straight flowing content.
- Page-level `paddingLeft` is removed; sidebars (when used) are rendered inline in the page-1 wrapper, not as `fixed` absolute panels.

### 3. Keep all sections + headlines on the right page
Every section (Summary, Work Experience, Skills, Education, Languages, Core Competencies) is rendered exactly once, with its heading, in the order the matching preview template uses. Long sections wrap correctly across pages without losing their heading (use `wrap` with `minPresenceAhead`).

### 4. Header / contact rules
- Header shows: name, job title, contact line (and photo if template supports it).
- Contact is NOT repeated elsewhere.
- Running header on pages 2+ stays (name + page #), but lives in its own band with a small top padding so it never overlaps body content (current "Abanoub Nabil Page 4" overlapping Skills bug is fixed).

### 5. Wire up the router
`StepExport`/`cvExport.ts` already pass `template` into `CVPdfDocument`. Change the export to `<PdfRouter cv={cv} template={template} photoDataUrl={photoDataUrl} />`. Delete the old `CVPdfDocument.tsx`.

## Files to add / edit
- **Add**: `src/components/cv-builder/pdf/{PdfRouter,PdfModern,PdfClassic,PdfExecutive,PdfCompact,PdfSkillsFirst,shared}.tsx`
- **Edit**: `src/lib/cvExport.ts` — import `PdfRouter` instead of `CVPdfDocument`.
- **Edit**: any `StepExport` / preview spots that import `CVPdfDocument` — point them at `PdfRouter`.
- **Delete**: `src/components/cv-builder/CVPdfDocument.tsx`.

## Out of scope
- DOCX export changes (only PDF in this pass — happy to follow up).
- AI content/prompt changes.
- Adding new templates.

## Acceptance
- Picking **Compact** in `StepTemplate` and exporting gives a PDF that matches the uploaded screenshot (header on top, two-column body on page 1, single-column overflow on pages 2+).
- Picking **Modern/Classic/Executive** gives a single-column PDF (no sidebar, no empty space on later pages).
- No section appears twice. No empty left band on pages 2+. Running header never overlaps body text.
