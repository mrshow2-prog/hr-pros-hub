# Plan: Font styles + fix Simple template name

## 1. Fix Simple template name font (immediate)
- In `TemplateModern.tsx` the `<h1>` inherits Page's `font-dm` because component classes win over the base `h1 { font-syne }` rule. Add `font-syne` explicitly so React preview & PDF agree on a display-sans look.
- In `buildModern` (PDF), pass `nameFontName: FONT_DISPLAY_SANS_BOLD` (new Syne font registered below) so the generated PDF matches the thumbnail.

## 2. Add 3 selectable font styles
New `fontStyle` field on `intentForm` (default `"modern"`), with three options:

| ID         | Display / Name font | Body font  | Vibe                |
|------------|--------------------|------------|---------------------|
| `modern`   | DM Sans Bold        | DM Sans / Roboto | Clean contemporary sans |
| `classic`  | Fraunces Bold       | Fraunces    | Traditional serif   |
| `editorial`| Syne ExtraBold      | DM Sans / Roboto | High-impact display sans, geometric |

### PDF fonts (`src/lib/cv/pdfme/`)
- Download into `fonts/`: `DMSans-Regular.ttf`, `DMSans-Bold.ttf`, `Syne-Bold.ttf`, `Syne-ExtraBold.ttf` (Google Fonts).
- In `core.ts` register: `FONT_SANS`, `FONT_SANS_BOLD`, `FONT_DISPLAY_SANS`, `FONT_DISPLAY_SANS_BOLD`.
- Define `FontTheme` type + `getFontTheme(style)` returning the per-style font names.
- Thread a `fontStyle` option through `PdfmeOptions`, `generateCvPdfmeBlob`, and every `build*` function. Each builder reads `theme.display` / `theme.body` instead of hard-coded `FONT_DISPLAY*`.

### React (web preview)
- Install `@fontsource/dm-sans`, `@fontsource/syne`, `@fontsource/fraunces`; import in `src/main.tsx`; add `font-display-sans` / `font-display-serif` to `tailwind.config.ts`.
- `Page` in `shared.tsx` accepts `fontStyle` (read from context) and sets the right body + heading font classes.
- Each template's name / section heading uses `font-display-*` classes resolved from the theme.

## 3. UI: expose font + palette in TemplatePickerDialog
- Add a sticky control row in the right pane (above the large preview) with:
  - **Color palette**: existing swatches (re-uses `palettes.ts`).
  - **Font style**: 3 chips (Modern / Classic / Editorial) showing a sample "Aa" in each font.
- Both write to `intentForm` via `patchIntent`, so the popup preview and the live editor update instantly.
- Existing controls on `StepTemplate` / `IntentFields` stay (mirrored).

## 4. Files touched (high-level)
- `src/lib/cv/pdfme/fonts/` — new ttf files
- `src/lib/cv/pdfme/core.ts` — register new fonts, export theme helper
- `src/lib/cv/pdfme/exportModernPdfme.ts` — thread `fontStyle`, replace FONT_DISPLAY refs, fix Simple name
- `src/contexts/CVBuilderContext.tsx` — add `fontStyle` to `IntentForm`
- `src/components/cv-builder/templates/shared.tsx` + each `Template*.tsx` — apply theme classes; fix Simple `<h1>`
- `src/components/cv-builder/editor/TemplatePickerDialog.tsx` — palette + font chips
- `src/components/cv-builder/StepExport.tsx`, `StepDraft.tsx` — pass `fontStyle` into PDF options
- `src/main.tsx`, `tailwind.config.ts` — fontsource imports + tailwind families

## 5. Defaults & migration
- `fontStyle` default = `"modern"` for new CVs; existing drafts without the field also default to `"modern"`.
- No DB migration needed (intent form is JSON on existing record).

Ready to implement on approval.