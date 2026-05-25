## Goal
Add two new high-quality CV templates (built with pdfme) and rebrand the existing five with a coherent naming scheme — total **7 templates**, all wired through preview, PDF export, and DOCX export.

## New templates

**1. "Riyadh" — Sidebar (dark accent rail)**
The most common style across MyPerfectCV and CV Elevator that we currently don't have. A 30% dark sienna left sidebar carrying photo, contact details, skills, and languages; main column holds summary, experience, education. Strong visual identity, still ATS-safe (single text flow exported as ordered blocks).

**2. "Geneva" — Editorial timeline**
Premium serif-style headline, generous whitespace, and a vertical timeline gutter (dot + line) running through the experience section. Distinct from everything we have; competes with MyPerfectCV's "modern" templates.

## Renamed lineup (city naming, matches competitor pattern)

| Old ID | New ID | New display name | Badge |
|---|---|---|---|
| modern | `dubai` | Dubai | Most picked |
| classic | `london` | London | Recruiter favourite |
| executive | `zurich` | Zurich | Executive |
| compact | `singapore` | Singapore | Information-dense |
| skills-first | `berlin` | Berlin | Career change |
| — | `riyadh` | Riyadh | New · Bold |
| — | `geneva` | Geneva | New · Premium |

## Backwards compatibility

Saved sessions in `cv_builder_sessions` store the old IDs. Add `normalizeTemplateId(id)` that maps `modern → dubai`, `classic → london`, `executive → zurich`, `compact → singapore`, `skills-first → berlin`. Call it inside `hydrateGeneratedCV` and at every read site (PDF exporter, DOCX router, CVRenderer) so old data keeps working.

## Files to change

### Types & config
- `src/contexts/CVBuilderContext.tsx` — update `TemplateId` union; add `normalizeTemplateId` helper; call it in `hydrateGeneratedCV` and wherever a template is consumed.
- `src/lib/cvTemplateConfig.ts` — replace the 5 old keys with the 7 new ones (keep brand sienna primary across all).

### pdfme (PDF + live preview)
- `src/lib/cv/pdfme/exportModernPdfme.ts` — rename internal `buildModern → buildDubai`, `buildClassic → buildLondon`, etc.; add `buildRiyadh` (sidebar) and `buildGeneva` (timeline); update `generateCvPdfmeBlob` switch.
- `src/lib/cv/pdfme/core.ts` — add a small `addRect`-based sidebar helper if needed (already has rect support).

### DOCX
- `src/lib/docx/router.ts` — route 7 IDs to their builders, with legacy-ID fallthrough via `normalizeTemplateId`.
- `src/lib/docx/singleColumn.ts` — rename existing builders, keep their `buildFlowingDoc` configs.
- `src/lib/docx/sidebar.ts` (new) — builds Riyadh: two-column table, dark-fill left cell (`shading: { fill: "9C5643", type: ShadingType.CLEAR }`) with white text for photo/contact/skills/languages, right cell with summary/experience/education.
- `src/lib/docx/timeline.ts` (new) — builds Geneva: section headings in serif (Georgia), each experience entry preceded by a small filled circle (Unicode `●`) acting as a timeline marker, with a left paragraph indent that simulates the vertical line.

### React preview cards (used only in template picker)
- `src/components/cv-builder/templates/TemplateRiyadh.tsx` (new) — visual approximation for the selector card.
- `src/components/cv-builder/templates/TemplateGeneva.tsx` (new) — visual approximation for the selector card.
- `src/components/cv-builder/templates/CVRenderer.tsx` — add both to the switch + alias the renamed IDs.
- The existing 5 React files (`TemplateModern`, `TemplateClassic`, etc.) stay as-is and are re-exported under new names — no need to rename files since `CVRenderer` is the single import point.

### Template picker UI
- `src/components/cv-builder/StepTemplate.tsx` — replace `TEMPLATES` array with the 7-entry city lineup, each with refreshed copy, badge, and ATS score. Order: Dubai (default/most-picked), London, Zurich, Singapore, Berlin, Riyadh (New), Geneva (New).

### Defaults
- Anywhere the default template is `"modern"`, change to `"dubai"`.

## Out of scope
- Re-architecting the wizard, payment flow, or section editors.
- Adding sidebar layout support for the existing 5 templates (only Riyadh uses it).
- DOCX preview parity beyond what the current Word builders already produce.

## Risk / verification
- After implementation, manually verify in preview that all 7 templates render in `PdfmePreview` without overflow, and that the picker grid shows 7 cards in 3 columns (last row will have 1 card on `lg`).
- Spot-check `exportCVToPdf` and `exportCVToDocx` for one old ID (`modern`) and one new ID (`riyadh`) to confirm the alias + new builder both work end-to-end.
