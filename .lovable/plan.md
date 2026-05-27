# Sidebar Placement Controls

Add a small UI control that lets the user choose, per section, whether **Skills**, **Education**, **Languages**, and **Certifications** render in the left sidebar/banner or in the main body. Applies only to multi-column templates (currently **Bold** and **Vibrant**). Single-column templates are unaffected.

## UX

In the editor (StepDraft), each of the four sections (Skills, Education, Languages, Certifications) gets a small "Sidebar / Main" toggle next to its section header (similar to the existing case toggle). The control is only visible when a multi-column template is selected; otherwise it stays hidden.

Defaults preserve today's behaviour: Skills, Education, Languages → sidebar; Certifications → main.

The choice is saved in the CV builder state and applied live in the preview, the PDF export, and the DOCX export.

## Technical details

1. **State** — add `sidebarPlacement: Partial<Record<SectionKey, "sidebar" | "main">>` to `IntentForm` in `src/contexts/CVBuilderContext.tsx`, plus a `patchIntent`-friendly default. Persisted with the rest of the draft.

2. **Helper** — new `src/lib/cv/sidebarPlacement.ts` exporting:
   - `MULTI_COLUMN_TEMPLATES: TemplateId[] = ["bold", "vibrant"]`
   - `isMultiColumn(template)`
   - `getSidebarKeys(cv, intent, template)` returning the effective sidebar key list, merging defaults with user overrides.

3. **Previews** — replace the hard-coded `SIDEBAR_KEYS` arrays in `TemplateRiyadh.tsx` and `TemplateCasablanca.tsx` with the helper, reading overrides via a new optional `sidebarKeys?: SectionKey[]` prop threaded through `CVRenderer`.

4. **PDF export** — `src/lib/cv/pdfme/exportModernPdfme.ts` already partitions sections for bold/vibrant; pass the same effective sidebar keys (from intent) instead of a hard-coded list.

5. **DOCX export** — `src/lib/docx/sidebar.ts` (`buildRiyadhDoc`) and the vibrant route in `src/lib/docx/router.ts` similarly read from the effective sidebar keys. Thread the option through `buildDocxByTemplate` opts.

6. **Editor UI** — in `src/components/cv-builder/StepDraft.tsx`, add a tiny segmented toggle ("Sidebar | Main") rendered via `headerAction` on the `CollapsibleSection` for the four sections, gated by `isMultiColumn(selectedTemplate)`. Reuse the existing toggle styling used by the case toggle for visual consistency.

No changes to single-column templates, AI prompts, or data model beyond the new intent field.
