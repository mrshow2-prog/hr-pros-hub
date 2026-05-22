# Wire up PDF + Word downloads on Step 7

## Problem

The "Download PDF" and "Download Word" buttons in `StepExport.tsx` only call `alert("... will be generated server-side.")`. Nothing is actually exported — no edge function, no client-side generation.

## Approach

Generate both files **client-side** from the `GeneratedCV` state already in the wizard. This is the fastest, most reliable path and avoids the Supabase Edge Function timeout problems that have plagued the other CV flows.

- **PDF** — render the user's selected template (the same React component shown in Step 6 preview) into an offscreen container, snapshot it with `html2canvas`, and paginate into A4 pages with `jsPDF` (already a dep).
- **Word** — build a `.docx` from the structured `GeneratedCV` JSON using the `docx` library (headings, sections, bullet lists, contact block). Save with `file-saver`.

Both run entirely in the browser, so there's no signal-abort/timeout risk.

## Changes

1. **`package.json`** — add `html2canvas`, `docx`, `file-saver` (+ `@types/file-saver`).

2. **`src/lib/cvExport.ts`** (new) — two functions:
   - `exportCVToPdf(nodeId, fileName)` — html2canvas → jsPDF, multi-page A4.
   - `exportCVToDocx(cv, fileName)` — maps `GeneratedCV` → docx `Document` (contact header, summary, experience with bullets, skills, education, languages), saves via file-saver.

3. **`src/components/cv-builder/StepExport.tsx`** — 
   - Read `state.generatedCV`, `state.selectedTemplate`, photo URL from context.
   - Render the selected template via `CVRenderer` into a hidden, fixed-size A4 container (off-screen, `position: absolute; left: -10000px`) so html2canvas can capture it.
   - Replace `alert()` with calls to the two export helpers; show loading state on the buttons and a toast on success/error.
   - File name: `<slugified name>-cv.pdf` / `.docx`.
   - If no `generatedCV` (user landed here directly), show a disabled state with a "Go back to Step 6" hint.

## Out of scope

- No edge function, no server-side rendering, no storage upload.
- Booking-a-review section and "Start a fresh CV" button stay as-is.
- Template fidelity in `.docx` is structural (semantic Word doc), not a pixel-perfect clone of the React template — PDF is the pixel-perfect output.
