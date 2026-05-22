# Fix generate-cv hallucination — ground output in real CV text

## Root cause

`StepUpload` never extracts PDF/DOCX text on the client. It stores a placeholder string ("(Parsed content will be extracted server-side.)") into `parsedText`. The `analyze-cv-gaps` function was already patched to detect that placeholder and re-extract server-side from storage, but `generate-cv` was never given the same treatment — so it sends a near-empty CV to Gemini and the model fabricates everything (name, companies, locations, metrics).

A secondary issue: the current `adaptToClientShape` in `generate-cv` hard-codes the contact block to empty strings, so even if Gemini returned name/email/phone/location/linkedIn, those would never reach Step 6's editor.

## What to change

### 1. `supabase/functions/generate-cv/index.ts`

- Mirror the server-side extraction pattern from `analyze-cv-gaps`:
  - Read `uploadedFiles` from the request body.
  - Add `console.log` for incoming `parsedText` length and preview (first 300 chars).
  - If `parsedText` is missing, shorter than 200 chars, or matches the "extracted server-side" placeholder, download each uploaded file from the `cv-builder-uploads` bucket using the service-role client and extract text with `unpdf` (PDF) / `mammoth` (DOCX). Log per-file char counts and the final length.
  - If after extraction the text is still under 100 chars, return `400 { error: "CV text too short or empty — PDF may not have parsed correctly" }`.
- Replace the system prompt + user message with the new strict, grounding prompt that:
  - Forbids inventing companies, metrics, dates, locations, names, placeholder names.
  - Requires `name`, `jobTitle`, `email`, `phone`, `location`, `linkedIn` at the top level of the JSON.
  - Includes the full extracted CV text between `---` fences as the only source of truth.
- Update `CV_TOOL_SCHEMA` (Lovable AI fallback) so the same six top-level contact fields are required.
- Update `adaptToClientShape` so `contact.name/email/phone/location/linkedinUrl` come from the AI output instead of being blanked. `jobTitle` should prefer the AI value and fall back to the first target role.
- Keep the existing Gemini → Lovable AI quota fallback and the 25s timeout.

### 2. `src/components/cv-builder/StepDraft.tsx`

- Pass `uploadedFiles: state.uploadedFiles` in the `generate-cv` invoke body so the edge function can fetch and re-extract the original files when needed.

## Out of scope

- No changes to `CVBuilderContext` shape — `parsedText` continues to flow through as today; server extraction is the source of truth.
- No client-side PDF parsing rewrite.
- No changes to other edge functions, templates, or storage policies.

## Verification

After deploying, the user can re-run the flow on Abanoub's CV and we will check `generate-cv` edge logs for:
- `parsedText length` (client value, expected small/placeholder)
- `Extracted N chars from <file>` (server extraction)
- `Server-side parsedText length` (expected several thousand chars)

Then confirm in Step 6 that the name "Abanoub Nabil", company "Fairmont The Palm", and location "Dubai" appear, and that the contact fields (name/email/phone/location/LinkedIn) are pre-populated.
