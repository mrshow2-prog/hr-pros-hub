# CV Builder — Quality & UX overhaul

Addressing all 8 observations in a single coordinated pass across the wizard, generator, ATS edge function, and export layer.

## 1. PDF missing info vs Word (#1, #7)
The current `CVPdfDocument` only renders summary + experience in the main column and skills/languages/education in the sidebar — but the sidebar is page-1-only. Anything that doesn't fit on page 1 sidebar is silently dropped, and headlines like Skills / Languages / Education are never shown in the main column on page 2+.

Fix:
- Render Skills, Languages, Education, and Competency Clusters in the **main column** as additional sections (after Experience), with proper section headlines, when they overflow or when no sidebar is in use.
- Keep sidebar on page 1 as a *summary* (photo + contact + top skills), but always also render the full Skills/Languages/Education/Competencies sections in the main flow so nothing is lost.

## 2. ATS score missing (#2)
`calculate-ats-score` only uses Gemini and currently fails with 429 quota errors. The frontend silently swallows the failure (no toast, no panel state).

Fix:
- Add the same `provider` fallback layer to `calculate-ats-score` (gemini → nvidia → lovable).
- In `StepDraft.runGeneration`, if ATS fails, automatically retry with Nvidia then Lovable AI before giving up, and surface an inline error + manual "Recalculate ATS" button.

## 3. Summary too short + missing expand/condense/rewrite (#3)
The summary section currently only renders an `AutoTextarea`. The expand/condense/rewrite controls only exist on experience cards.

Fix:
- Extend `generate-cv-section` (or add a new branch) to accept a `kind: "summary"` action.
- In `SummaryBlock`, add Expand / Condense / Rewrite buttons identical to `ExperienceCard`, calling the same edge function with the current summary text + intent.
- Update generator prompt to produce a longer, fuller summary by default (4–6 sentences).

## 4. Bullets too few + page-limit setting (#4)
The generator's prompt does not specify bullet density or length. With Gemini 2.5 Flash Lite the default output is very terse.

Fix:
- Add `pageLimit?: number | null` to `IntentForm` (null = unlimited).
- In `StepTemplate`, add a question: "How many pages should your CV be? (1, 2, 3, or No limit)".
- Pass `pageLimit` through to `generate-cv`. Update the system prompt:
  - If `pageLimit` is null → expand every role with 5–8 detailed bullets covering all responsibilities + achievements present in source CV.
  - If a number → calibrate density to fit that page count (3–5 bullets per role for 2 pages, etc.).
- Pass `pageLimit` to per-section expand/condense edge function so individual operations stay in scope.

## 5. Word using Letter size, oversized canvas (#5)
Currently page size is `12240 x 15840 dxa` (US Letter). It should be A4 (`11906 x 16838 dxa`), and table widths must be recomputed.

Fix:
- Change `page.size` to A4 dimensions.
- Set `totalWidth` to A4 minus 1" margins (≈ 10466 dxa) and recompute sidebar (3000) + main (7466).
- Tighten margins (top/bottom 720 → 567 ≈ 1cm) so the canvas matches content density.

## 6. Page 2+ still shows empty sidebar column in Word (#6)
A single `Table` row stretches its left cell down the full page, leaving an empty colored band on continuation pages.

Fix:
- Split the document into **two sections**:
  - **Section 1**: single-row two-column table with sidebar + header + summary + first slice of experience (just one section, content can flow). Because docx tables can't auto-collapse columns, instead we render the **sidebar block as a top-of-page table** (header band + sidebar-stack-on-left + main on right), and after the sidebar's natural end we close the table and continue with **single-column paragraphs** for the remaining Experience / Skills / Languages / Education on subsequent pages.
- Practically: put all sidebar items (photo, contact, skills, languages, education) in the left cell, and only the *Header + Summary + Professional Title* in the right cell. Then **after the table**, render Experience + (any overflow sections) as single-column paragraphs. This guarantees pages 2+ have no empty sidebar.

## 7. Gaps step — confirm typical responsibilities (#8)
`analyze-cv-gaps` already supports `layer: "expectation"`. Strengthen the prompt and StepGaps UI to render expectation gaps as **Yes / No / Add detail** prompts: "As a Senior Sales Manager it is usually expected to own P&L. Do you do this? [Yes, add to CV] / [No] / [Add details]".

Fix:
- Update analyze-cv-gaps prompt to phrase expectation gaps as direct yes/no confirmations with a specific role-typical responsibility.
- In StepGaps, when `gap.layer === "expectation"`, render three buttons (Yes / No / Add detail). Store the response as a structured value `{ confirm: "yes" | "no", details?: string }`.
- generate-cv consumes confirmed responsibilities and adds them to relevant role bullets.

## Technical notes
- All edge-function changes redeploy automatically.
- `IntentForm` schema gets `pageLimit: number | null`.
- Hydration helper updated to default `pageLimit: null` so existing sessions don't break.
- ATS panel must show a loading + retry state.
- `generate-cv-section` gets new branches `summary-expand`, `summary-condense`, `summary-rewrite`.

## Out of scope
- Redesigning templates beyond what's needed for the missing-section fix.
- Changing pricing/payment flow.
