## Three fixes

### 1. Make the case-toggle button actually visible
The Draft step the user sees today is the **editor view** (`EditorShell` + `CollapsibleSection`), not the legacy `SectionShell`. The `SectionShell` in that view is rendered with `hideMoveControls` and `hideVisibilityControl`, so its header is suppressed — that's why the new "Aa" button doesn't show.

Fix:
- Add an optional `headerAction?: ReactNode` prop to `CollapsibleSection` (`src/components/cv-builder/editor/EditorShell.tsx`) rendered in the right-side control row, just before the move chevrons.
- In `EditorShell` pass `headerAction={<SkillsCaseToggle />}` for the `skills` section only.
- Remove the `headerAction` from the **contact** `SectionShell` call in `StepDraft.tsx` (per the user's new requirement, the contact button should not appear at the section header).

### 2. Move the contact case-toggle to the name + headline fields only
- Inside `ContactBlock` (`StepDraft.tsx`), inject a small `CaseToggleButton` directly above the two stacked fields **Full name** and **Job title** with a label like "Fix capitalization · name & headline".
- Wire it to call `patchContact({ name: applyCase(name, mode), jobTitle: applyCase(jobTitle, mode) })`.
- This works in both the legacy `StepDraft` view and the editor view because the button lives inside the field block, not the section header.

### 3. Make LinkedIn (and Website) URLs clickable in the exported PDF
The PDF pipeline (`src/lib/cv/pdfme/exportModernPdfme.ts`) renders the contact line as a single `b.addText({ value: "loc · phone · email · linkedin.com/in/... · site" })` string. pdfme's text schema does not natively emit a PDF link annotation. Plan:

- Extend `core.ts`:
  - Add `addLinkAnnotation({ page, x, y, width, height, uri })` to the builder. Internally store `{ page, rect, uri }[]`.
  - In `toBlob()`, after `generate(...)` produces the PDF bytes, load the bytes with `PDFDocument.load` (from `@pdfme/pdf-lib`) and call the shipped helper `addUriLinkAnnotation` (`node_modules/@pdfme/schemas/dist/text/linkAnnotation.d.ts`) for each stored annotation, then `pdfDoc.save()` and wrap in a Blob.
- Add a small wrapper `b.addLinkText(opts)` that does an `addText` and registers a link annotation covering the same rect, returning the same height.
- In `exportModernPdfme.ts`, refactor the **contact line** in every template so URL tokens (`linkedinUrl`, `website`) are rendered as separate `addLinkText` runs laid out next to the rest of the line using `textWidthMm` (new helper in `core.ts` that uses pdf-lib's font width measurement, mirroring how `textHeightMm` works). This keeps the visual identical but makes only the URL token clickable.
  - Affected call sites: lines ~278, ~684, ~1085–1086, ~1246 plus any other template that builds a contact line.
- Where adding side-by-side runs is hard (e.g. multi-column templates), fall back to wrapping the entire contact line in one link annotation only when a single URL is present.

### Out of scope
- DOCX: Word already hyperlinks URL-looking text by default in most viewers; if not, that's a separate change.
- No visual changes — fonts, sizes, colours, spacing all preserved.
- The skills case button keeps the cycle Title → UPPER → lower.
