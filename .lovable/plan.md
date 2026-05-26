# Plan: Reorderable sections + truly optional sections everywhere

## 1. Section reordering (up/down arrows)

Add a per-section order that the user controls with ▲ ▼ arrows next to each section title in the draft editor (`EditorShell.tsx` left pane, via the `SectionShell` headers in `StepDraft.tsx`).

**Scope of reordering**
- Reorderable: `experience`, `skills`, `education`, `competencies`, `languages`, `achievements`, `certifications`, `custom`
- Locked at top (not reorderable): `contact`, `summary`

**State model**
- Add `sectionOrder: SectionKey[]` to `GeneratedCV` in `CVBuilderContext.tsx`.
- `hydrateGeneratedCV` ensures a default order: `["experience","skills","education","competencies","languages","achievements","certifications","custom"]`, and migrates any existing CVs that don't have it.
- Add `moveSection(key, direction: "up"|"down")` mutator on the context.

**UI**
- In `SectionShell` header (used by every editor block), render two small icon buttons (`ChevronUp` / `ChevronDown`) to the left of the visibility toggle.
- Hide them entirely for `contact` and `summary`.
- Disable Up on the first reorderable item; disable Down on the last.
- Top tabs/anchors in `EditorShell` also follow `sectionOrder` so the navigation order matches the rendered order.

**Rendering**
- Every template (`TemplateModern`, `Classic`, `Executive`, `Compact`, `SkillsFirst`, `Riyadh`, `Geneva`, `Casablanca`, `Tokyo`, `Milano`) and every exporter (`exportModernPdfme.ts`, `docx/sidebar.ts`, `docx/singleColumn.ts`, `docx/flow.ts`, `docx/compact.ts`) iterates the reorderable body sections via `sectionOrder` instead of hard-coded order. Contact/summary keep their fixed header position.
- Sidebar-bound items in sidebar templates (Bold/Casablanca) stay in the sidebar — order only affects the main column.

## 2. Truly optional sections

Currently `achievements`, `certifications`, `customSections`, and `competencyClusters` either render empty headings or are silently dropped only in exporters. We will make them universally conditional.

**Helper**
- Add a single `hasContent(cv, sectionKey)` utility in `src/lib/cv/sectionVisibility.ts`:
  - `experience`: at least one entry with a role/company or any bullet text
  - `skills`: at least one non-empty string
  - `education`: at least one entry with institution or qualification
  - `competencies`: at least one cluster with ≥1 item
  - `languages`: at least one entry with a name
  - `achievements`: at least one non-empty string
  - `certifications`: at least one entry with a name
  - `custom`: at least one section with a title or any bullet
- Combine with `hiddenSections` check (`isVisible`) so a section is rendered only when **visible AND has content**.

**Apply everywhere**
- Every template component: replace existing `isVisible(...)` guards with `shouldRender(cv, key)`; remove any hard-coded "always render heading" blocks for these four sections.
- Every PDF exporter (`exportModernPdfme.ts`) and DOCX exporter (`flow.ts`, `sidebar.ts`, `singleColumn.ts`, `compact.ts`): add the four sections to the render pipeline, gated by `shouldRender`. They will now appear in exports when used, and stay completely absent (no heading, no spacing) when empty.
- `Paginator.tsx` page-break logic: nothing to change, sections simply don't get emitted.

**Editor affordance (small)**
- In `SectionShell`, when a section has no content and is visible, show a subtle "Won't appear on CV until you add content" hint so users understand why nothing renders in the preview.

## Technical notes

- Files touched:
  - `src/contexts/CVBuilderContext.tsx` — type + hydrator + `moveSection`
  - `src/components/cv-builder/StepDraft.tsx` — `SectionShell` arrows + empty hint
  - `src/components/cv-builder/editor/EditorShell.tsx` — ordered tabs/anchors
  - `src/lib/cv/sectionVisibility.ts` (new) — `hasContent`, `shouldRender`, ordered body-section list
  - All 10 template components under `src/components/cv-builder/templates/`
  - All exporters under `src/lib/cv/pdfme/` and `src/lib/docx/`
- No DB schema change required; `sectionOrder` lives inside the existing `generatedCV` JSON column.
- Backward compatibility: missing `sectionOrder` → default order; unknown keys ignored; new keys appended.

## Out of scope (explicitly deferred to next prompt)
- Bold sidebar hard-coded palette
- Skill-chip hard-coded background
- Editorial PDF rail pagination
- Photo aspect-ratio for non-circle shapes
- Vibrant/Gradient/Creative dedicated exporters
- Detailed DOCX pipeline migration
- All other items from the earlier template review
