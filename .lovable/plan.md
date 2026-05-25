## Goal
Stop the loop of fixing one symptom and reintroducing the other by replacing the fragile PDF bullet spacing heuristic with a deterministic bullet layout system.

## What I found
- The current PDF export is built with pdfme absolute-positioned text blocks.
- The overlap/gap problem is caused by predicting text wrapping manually, then advancing `cursorY` based on that estimate.
- Small changes to the width estimate swing the result between two bad states:
  - Under-estimate height: bullets overlap/cross.
  - Over-estimate height: random empty lines appear.
- The problem is not mainly caused by separate bullet text boxes in the UI. Separate boxes are fine if we sanitize and render them correctly. Changing to one large textarea can improve editing ergonomics, but it will not by itself fix PDF layout unless the PDF layout engine is corrected.

## Plan

### 1. Replace heuristic bullet rendering with an atomic bullet block renderer
Create a shared PDF helper that renders an entire job's bullet list as one controlled block instead of placing every bullet independently with guessed spacing.

For each job:
- Clean bullet text.
- Measure each bullet with a deterministic line splitter.
- Build rows as structured data:
  - bullet glyph
  - wrapped text lines
  - exact row height
  - fixed row gap
- Render each bullet row manually line-by-line so pdfme does not do its own unpredictable internal wrapping.

This means:
- A one-line bullet gets exactly one line of height.
- A two-line bullet gets exactly two line heights.
- There is one small consistent gap between bullets.
- No random blank line can appear because no empty text line is emitted.
- No overlap can happen because each rendered line has a known Y coordinate.

### 2. Add section-level page break control for job entries
Before rendering a job entry, estimate the full job block height:
- role/date row
- company/location row
- bullet rows
- job spacing

If the job mostly fits on the current page, keep it together. If it does not fit, start it on a new page before rendering. For very long jobs, allow bullets to continue on the next page only between bullet rows, never through a line of text.

This adapts the section-based idea from the provided reference, but keeps the existing pdfme system rather than switching the whole export to screenshots.

### 3. Apply the same bullet block renderer to all 7 PDF templates
Update all templates to use the new renderer:
- Dubai
- London
- Zurich
- Singapore
- Berlin
- Riyadh
- Geneva

Each template can still pass its own glyph, font size, line height, indent, and color, but the layout rules become shared and stable.

### 4. Revert the recent over-conservative spacing patches
Remove the unstable width multiplier / wrap guard changes that caused the system to bounce between overlap and empty-line issues. The new line-by-line renderer will own spacing instead.

### 5. Keep the current separate bullet UI for now, but add a safer parser path
I recommend not dropping the separate bullet boxes in this fix because that is a bigger UX/data change and is not the root PDF issue.

However, I will add the foundation for a future single-textarea option by ensuring the bullet sanitizer supports:
- pasted multi-line bullet lists
- bullets starting with `-`, `•`, `*`, `–`, `—`
- blank line removal

If you later want the UI changed to one big bullet textarea per job, we can do that cleanly after the PDF export is stable.

### 6. Validation
After implementation:
- Run a focused lint/type check on the edited files.
- Use a stress sample with long hospitality/sales bullets like your screenshots.
- Confirm the generated PDF preview has:
  - no crossed text
  - no random blank rows between bullets
  - clean page breaks between job blocks/bullet rows

## Technical approach
- Add PDF helper functions in `src/lib/cv/pdfme/core.ts` or a new `layout.ts`:
  - `measureWrappedLines(text, width, fontSize, options)`
  - `renderWrappedTextLines(...)`
  - `measureBulletList(...)`
  - `renderBulletList(...)`
- Update `src/lib/cv/pdfme/exportModernPdfme.ts` so experience rendering calls the shared bullet-list renderer instead of the current `bullet()` function.
- Preserve DOCX and preview sanitization changes already made, since those are still useful.

## Why this should stop the loop
The key change is that pdfme will no longer be asked to wrap bullet paragraphs while our code guesses how much vertical space it used. We will pre-wrap text ourselves and render each line at exact positions, so the cursor advances from known geometry rather than estimates.