# Phase 2 — Round 1: Document-first Editor + Real ATS

Scope locked: **one workstream**. Build a polished split editor and a real, deterministic ATS score that re-parses the rendered PDF. Cover letters, JD tailoring, LinkedIn, interview prep, and the job tracker are **not** in this round.

## What ships

### 1. New split editor (`/builder` step 6)
Replaces today's single-column `StepDraft` form.

```text
┌──────────────────────────────────────────────────────────────┐
│ Sticky top bar: section tabs · ATS pill · Save · Continue    │
├───────────────────────────────┬──────────────────────────────┤
│                               │                              │
│  Left: form (scroll-snap)     │  Right: live preview         │
│  Contact / Summary / Skills   │  Real template at 100% width │
│  Experience / Education /     │  Page breaks, real fonts     │
│  Languages / Competencies     │  Auto-scrolls to active      │
│                               │  section as you type         │
│  Inline AI actions per field: │                              │
│   - Rewrite bullet            │  Toggle: Light / Dark        │
│   - Quantify                  │  Toggle: Template (5)        │
│   - Shorten                   │                              │
└───────────────────────────────┴──────────────────────────────┘
```

- **Resizable split** via existing `ResizablePanelGroup` (45 / 55 default, persisted to localStorage).
- **Section tabs** in the top bar jump both panes to the active section; right pane uses `scroll-into-view` on the section node.
- **Per-field AI menu** (popover next to each bullet / summary): Rewrite, Quantify, Shorten, Revert. Calls the existing `generate-cv-section` edge function; no new function needed.
- **Auto-save** stays as-is (debounced via `CVBuilderContext`).
- **Mobile (<1024px)**: collapses to tabbed view — `Edit | Preview` segmented control, no split.

### 2. Real ATS engine (replaces stub)
Today's `calculate-ats-score` only asks an LLM for a number. New flow:

1. **Generate the PDF in-memory** using the existing `brandedPdf` / template renderer (no download, no upload).
2. **Re-parse it** server-side using `pdfjs-dist` (Deno-compatible build via `esm.sh`) → plain text + bounding-box metadata for sections.
3. Run deterministic checks against the parsed text:
   - **Parseability** (did every section survive the round-trip?)
   - **Contact block** (email + phone + location present and machine-readable)
   - **Date formats** (`MMM YYYY` consistent, no overlapping ranges, no future dates)
   - **Bullet hygiene** (length 8–28 words, starts with action verb, ≥40% contain a number)
   - **Section presence** (Summary, Experience, Skills, Education)
   - **Page count** vs intent page limit
   - **Reading level** (Flesch-Kincaid on summary + bullets)
4. **Keyword match** against `intentForm.targetRoles` + `functionArea`:
   - Pull top 50 role-relevant keywords from a small static dictionary keyed by `functionArea` (HR, Sales, Engineering, Finance, Marketing, Ops). Ship the dictionary as a JSON file in the edge function.
   - Score = covered / required, weighted by frequency in the JD-style synonym list.
5. Combine into the existing `AtsScore` shape so the UI keeps working; add a new `findings[]` array with `{ id, severity, label, fix, jumpTo }` so the editor can render a fix-it side panel and deep-link to the offending field.
6. **No LLM call** on the scoring path — fast, deterministic, free. (Optional `?withAi=true` flag kept for a future round.)

### 3. ATS findings panel
Right-side drawer on the editor:
- Score donut (overall) + sub-scores.
- Findings grouped by severity. Each finding has a **Fix** button that scrolls the left pane to the field and focuses it.
- "Re-score" button re-runs the pipeline.

### 4. Template + theme controls
Move template & dark/light toggles out of the wizard's `StepTemplate` step into a top-bar dropdown on the editor itself, so users can switch live without leaving the editor. `StepTemplate` becomes optional (kept for first-time flow).

## What I'm NOT touching this round
- Cover letters, JD-paste tailoring, LinkedIn rewrite, interview prep, job tracker — explicitly Phase 2 round 2+.
- The wizard steps 1–5 (Upload / Intent / Gaps / Template / Payment).
- Auth, billing, storage policies.
- The PDF templates themselves (just consumed, not redesigned).

## Files to add / change

**Add**
- `src/components/cv-builder/editor/EditorShell.tsx` — split layout + top bar
- `src/components/cv-builder/editor/SectionForm.tsx` — left pane, per-section blocks
- `src/components/cv-builder/editor/LivePreview.tsx` — right pane, scaled template
- `src/components/cv-builder/editor/AtsPanel.tsx` — score + findings drawer
- `src/components/cv-builder/editor/InlineAiMenu.tsx` — per-field popover
- `src/lib/cv/buildPdfBuffer.ts` — server-callable PDF buffer (reuses existing renderers)
- `supabase/functions/calculate-ats-score/dictionary.json` — function-area keywords
- `supabase/functions/calculate-ats-score/parse.ts` — pdfjs round-trip + checks

**Change**
- `src/pages/CvBuilder.tsx` — step 6 renders `EditorShell` instead of `StepDraft`
- `supabase/functions/calculate-ats-score/index.ts` — replace LLM call with deterministic pipeline; accept `{ generatedCV, intentForm, template, typeOption }`
- `src/contexts/CVBuilderContext.tsx` — extend `AtsScore` with `findings[]`; add `activeSection` UI state

**Keep / deprecate**
- `StepDraft.tsx` stays in the tree for now, no longer routed; remove next round once we're sure nothing regressed.

## Technical notes
- `pdfjs-dist` works in Deno via `https://esm.sh/pdfjs-dist@4.0.379/legacy/build/pdf.mjs` with the worker disabled (`GlobalWorkerOptions.workerSrc = ""` and `disableWorker: true`).
- For the in-memory PDF, we can't run the React-PDF renderer inside the edge function easily, so the **client** builds the PDF buffer (it already does this for download), base64-encodes it, and posts it to the function alongside the CV JSON. Function does parse + score only. This keeps the function light and reuses the exact bytes the user will export.
- Findings carry a `jumpTo` like `{ section: "experience", expId: "exp-123", bulletId: "b-7" }` so the editor can focus directly.

## Validation
- Manually walk a sample CV through: edit a bullet → re-score → finding for that bullet clears.
- Verify split layout at 1280 / 1024 / 768 widths.
- Confirm ATS score returns in <2s for a 2-page CV.

## Round 2 preview (not now)
JD tailoring + cover letter generator — both build directly on the ATS keyword engine shipped here.
