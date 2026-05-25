
# CV Builder overhaul

Nine asks, grouped by where they land. I'll keep changes additive where possible — no template or PDF rewrites beyond what's listed.

## 1. New wizard flow & step bar

New order (visible numbered steps):

```
1 Template   →   2 Build (Upload OR Start from scratch + intent)   →   3 Gaps   →   4 Draft (multi-section)   →   5 Export
```

- Unlock/payment becomes a **modal**, not a step. Triggered the moment the user clicks **Export** if `paymentStatus !== "paid"`. After successful payment, export proceeds.
- Step bar removes the "Free / Paid" tier labels and the Unlock pill entirely.
- "Start from scratch" on step 2 skips file upload, seeds an empty `parsedText`/empty `GeneratedCV`, and still collects intent answers.
- On step 2, intent questions appear **inline below** the upload zone the moment a file finishes uploading (or immediately if "Start from scratch" is chosen). No more separate intent step.

## 2. Split Draft (current step 6) into a section-by-section sub-wizard

Step 4 (Draft) becomes its own mini-wizard with a left rail of sections and Next/Prev between them. One section visible at a time, live preview stays on the right.

Order:

1. **Hero** — name, job title, contact details, photo (re-uses `ContactBlock`)
2. **Work experience**
3. **Education**
4. **Skills**
5. **Achievements** *(new optional section)*
6. **Certifications & courses** *(new optional section, split off from education)*
7. **Languages**
8. **Summary** — last, with an "Write with AI" button that uses everything above + the parsed CV
9. **Custom sections** — user can add titled free-form sections (title + bullets)

Implementation:
- Extract each existing block from `StepDraft.tsx` (`ContactBlock`, `ExperienceList`, `EducationBlock`, `SkillsBlock`, `LanguagesBlock`, `SummaryBlock`) into a new `src/components/cv-builder/draft/` directory, one file per section.
- New `DraftWizard.tsx` orchestrates them with a sticky sub-step rail, Next/Prev footer, and the existing `LivePreview` + `AtsPanel` aside.
- Add `achievements: string[]`, `certifications: { id; name; issuer; date }[]`, `customSections: { id; title; bullets: string[] }[]` to `GeneratedCV`. Hydrator gets defaults. PDF/DOCX exporters render them after Languages.
- Generation prompt (`generate-cv` edge function) updated to also populate `achievements` and `certifications` when found in source; `customSections` stays empty by default.

## 3. Template step changes

- **Remove the Light/Dark toggle** entirely (drop `typeOption` from the UI, keep the field in state for back-compat but ignore it).
- **Photo shape picker**: 3 options — Circle · Square · Hide photo. Lives next to the page-limit control. Persisted as `intentForm.photoShape: "circle" | "square" | "none"`.
- **Colour palette picker**: 6 curated presets, each a single accent + ink + paper trio. Renders as a row of swatch chips. Persisted as `intentForm.colorPalette: PaletteId`.

Presets (sienna stays default):

| id | name | accent | ink |
|---|---|---|---|
| sienna | Sienna (default) | #9c5643 | #1a1a1a |
| navy | Navy | #1e3a5f | #0f1b3d |
| forest | Forest | #2d5a3d | #1a2e1f |
| charcoal | Charcoal | #2d2d2d | #0d0d0d |
| burgundy | Burgundy | #6b1f2a | #2a0d11 |
| teal | Teal | #14595a | #0a2a2b |

`getTemplateConfig()` is extended to read `intentForm.colorPalette` and override `primaryColor` (and a new `headingColor`) so the wizard preview, PDF export, and DOCX export all stay in sync.

## 4. Job title polish

In every template renderer (`Template*.tsx`) and the pdfme export (`exportModernPdfme.ts`):
- Role line: bump weight to `Helvetica-Bold` / `font-bold` (where it isn't already), nudge size +0.5pt, and colour with the active palette's accent (`headingColor`).
- Add a small `2pt` top margin above each role block so it doesn't read as a continuation of the previous bullet list.

## 5. State / context changes

- `IntentForm` gains `photoShape` and `colorPalette` with defaults `"circle"` and `"sienna"`.
- `GeneratedCV` gains `achievements`, `certifications`, `customSections`.
- `CVBuilderState.currentStep` shrinks to `1 | 2 | 3 | 4 | 5` (Template, Build, Gaps, Draft, Export). A simple migration in `hydrateGeneratedCV` / state hydration maps the old 1–7 steps to the new 1–5 so in-flight sessions don't break.
- `WizardShell` STEPS array updated; tier labels removed; unlock no longer rendered.

## 6. Files touched

**New:**
- `src/components/cv-builder/draft/DraftWizard.tsx`
- `src/components/cv-builder/draft/HeroSection.tsx`
- `src/components/cv-builder/draft/ExperienceSection.tsx`
- `src/components/cv-builder/draft/EducationSection.tsx`
- `src/components/cv-builder/draft/SkillsSection.tsx`
- `src/components/cv-builder/draft/AchievementsSection.tsx`
- `src/components/cv-builder/draft/CertificationsSection.tsx`
- `src/components/cv-builder/draft/LanguagesSection.tsx`
- `src/components/cv-builder/draft/SummarySection.tsx`
- `src/components/cv-builder/draft/CustomSections.tsx`
- `src/components/cv-builder/PaymentModal.tsx` (extracted from StepPayment)
- `src/lib/cv/palettes.ts`

**Edited:**
- `src/contexts/CVBuilderContext.tsx` — new fields, step type, step migration
- `src/components/cv-builder/WizardShell.tsx` — new STEPS, no tiers, no unlock
- `src/components/cv-builder/StepTemplate.tsx` — remove light/dark, add photo-shape + palette pickers
- `src/components/cv-builder/StepUpload.tsx` — becomes "Build" step: upload OR scratch + inline intent
- `src/components/cv-builder/StepDraft.tsx` — collapsed into thin wrapper around `DraftWizard`
- `src/components/cv-builder/StepExport.tsx` — gate on `paymentStatus`, open `PaymentModal` if unpaid
- `src/pages/CvBuilder.tsx` — re-route steps to new IDs (Template=1, Build=2, Gaps=3, Draft=4, Export=5)
- `src/lib/cvTemplateConfig.ts` — palette-aware `primaryColor` / `headingColor`
- All `src/components/cv-builder/templates/Template*.tsx` — bolder role, accent colour, top margin
- `src/lib/cv/pdfme/exportModernPdfme.ts` — same job-title treatment + palette accent
- `src/lib/docx/*` — palette accent for headings/role
- `supabase/functions/generate-cv/index.ts` — emit `achievements` / `certifications` when detected

## 7. Out of scope (call out explicitly)

- No new payment provider work — existing `StepPayment` logic is just relocated into a modal.
- I'm **not** rewriting the PDF templates beyond the job-title and palette changes.
- "Start from scratch" produces an empty `GeneratedCV` skeleton; gap analysis is skipped (auto-advance through step 3) since there's no source CV to compare against.
- Custom sections render as a simple titled list with bullets in PDF/DOCX — no per-section styling controls in this pass.

Two quick confirmations before I start:

1. For **"Start from scratch"**, OK to skip the Gaps step entirely (since there's nothing to analyse)?
2. For the **payment modal**, OK to keep the existing Stripe flow exactly as-is — just rendered inside a `Dialog` instead of as its own page?
