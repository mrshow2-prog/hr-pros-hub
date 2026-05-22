## Goal

Replace the current schematic template thumbnails and the Step 6 contact-only photo block with a full **template-aware live CV renderer** that mirrors the 5 uploaded HTML references (Classic, Modern, Compact, Skills-First, Executive), and rebuild **Step 4 (Template Selection)** to use real scaled-down previews per the uploaded selector page.

The 5 reference templates are A4 single-page CV designs that differ across:
- Header layout (photo shape/size/position, contact placement)
- Section header style (uppercase + border, left accent bar, plain, display-serif, two-column)
- Body layout (single column vs 1.6fr/1fr two-column for Compact)
- Bullet markers (disc, dot, arrow `→`, dash, square `▪`)
- Skills rendering (two-col list, pill tags, vertical list, simple grid)
- Section order (Skills-First puts Skills before Experience)
- Density (Compact = tight, Executive = generous)
- Typography mix (Fraunces display headings in Classic/Executive; DM Sans elsewhere)

---

## Scope

### 1. New shared CV renderer
Create `src/components/cv-builder/templates/CVRenderer.tsx` that takes `{ cv, photoUrl, template, typeOption }` and renders the full CV using template-specific styling. Each of the 5 templates becomes a small layout component:

```
src/components/cv-builder/templates/
  CVRenderer.tsx          // dispatcher
  TemplateClassic.tsx
  TemplateModern.tsx
  TemplateCompact.tsx
  TemplateSkillsFirst.tsx
  TemplateExecutive.tsx
  shared.tsx              // small subcomponents (Section, Bullet, etc.)
```

All styling uses Tailwind + the existing semantic tokens (`bg-paper`, `text-ink`, `text-sienna`, `border-ink/...`, `bg-clay`, `font-syne`, `font-dm`). No raw hex.

Mapping from the uploaded `--ps-*` variables → existing tokens:
```
--ps-ink         → text-ink
--ps-sienna      → text-sienna / bg-sienna
--ps-fg          → text-ink/85
--ps-fg-muted    → text-ink/60
--ps-clay        → bg-clay / border-clay
--ps-stone       → border-stone
--ps-border      → border-ink/10
--ps-border-strong → border-ink/25
--ps-font-display → font-syne (Fraunces-style display)
--ps-font-body    → font-dm
```

The renderer respects `cv.hiddenSections` (existing) and `state.intentForm.cvType` (Skills-First template visually elevates Skills regardless; competency clusters still only show for skills/hybrid).

### 2. Step 4 — Template selector rebuild (`StepTemplate.tsx`)
Replace the abstract `<Mock />` schematics with **real scaled-down previews** of each template populated with sample data (same Ahmed Al-Mansouri sample from the references). Layout matches the uploaded `cv-template-selector.html`:

- Page header: "Choose your CV template" + subtitle
- Responsive 3-up grid of `template-card`s on desktop, 1-up on mobile
- Each card: 
  - Preview area (~400px tall, `bg-clay`) containing the real template at `scale(0.5)` and `pointer-events: none`, clipped with overflow hidden
  - Body: small badge, name (font-syne), short description, 4-item feature list, primary "Use this template" button, ATS-optimised % chip
- Selected card gets `border-sienna ring-2 ring-sienna/20`
- Keep the existing light/dark toggle and ATS chip
- Clicking the card selects; the button also selects + advances

Per-template metadata (badge, description, features, ATS %) is lifted verbatim from `cv-template-selector.html`.

### 3. Step 6 (Draft) — wire renderer into preview
- Keep all existing edit controls (SectionShell, Field, AutoTextarea, add/remove rows, ATS panel, autosave).
- Replace the current `ContactBlock` photo+contact card and the inline preview blocks with a **two-pane layout**:
  - **Left:** the form editors (unchanged behaviour, slightly slimmed)
  - **Right (sticky on lg):** ATS panel + a **live `<CVRenderer />` preview** that renders the actual selected template (scaled to fit), so users see their edits in the chosen template in real time.
- Photo: continue using existing `state.photoPath` + signed URL; pass the resolved `photoUrl` into `CVRenderer`. The renderer applies template-specific photo shape/size/position (per reference). Remove the duplicate `TEMPLATE_PHOTO` styling logic from `StepDraft` since the renderer owns it.

### 4. No backend / context changes
- `CVBuilderContext`, edge functions, routes, and DB schema stay as-is. `GeneratedCV` already covers every section the templates render.
- `TemplateId` and the 5 template ids (`classic | modern | compact | skills-first | executive`) are already defined and match the uploaded files.

---

## Technical notes

- Templates render at a fixed A4-ish max-width (`max-w-[794px]`); in the Step 4 selector grid and the Step 6 preview pane they're wrapped in `overflow-hidden` containers using CSS `transform: scale(...)` + `transform-origin: top left` for thumbnailing. Width compensation via `w-[200%] h-[200%]` (matches reference pattern).
- The Compact template uses CSS grid `grid-cols-[1.6fr_1fr]`; everything else is single column.
- Skills-First uses `flex flex-wrap` pills (`bg-clay border border-ink/10 rounded-full px-3.5 py-1.5`); Classic / Executive / Modern use a 2-col grid with sienna bullets; Compact uses a vertical list in the right rail.
- Email decode cruft (`__cf_email__`) and external images from the uploaded HTML are dropped — we read live data from `cv` and `photoUrl`.
- All section labels are sourced from `cv` (and existing constants), not hardcoded.

---

## Out of scope

- Changing PDF/Word export (Step 7) — that will need its own pass to render via these templates.
- Editing the existing context, edge functions, or migrations.
- Drag-to-reorder sections (already noted as MVP-optional, not in this change).

---

## Files

Created:
- `src/components/cv-builder/templates/CVRenderer.tsx`
- `src/components/cv-builder/templates/TemplateClassic.tsx`
- `src/components/cv-builder/templates/TemplateModern.tsx`
- `src/components/cv-builder/templates/TemplateCompact.tsx`
- `src/components/cv-builder/templates/TemplateSkillsFirst.tsx`
- `src/components/cv-builder/templates/TemplateExecutive.tsx`
- `src/components/cv-builder/templates/shared.tsx`

Edited:
- `src/components/cv-builder/StepTemplate.tsx` — rebuild selector with real previews + reference copy
- `src/components/cv-builder/StepDraft.tsx` — add live `<CVRenderer />` preview pane; remove duplicated photo-layout logic
