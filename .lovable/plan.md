## Problem

When users build a CV from scratch (no upload), `generate-cv` returns 400 with `"CV text too short or empty"`. The function was never updated for scratch mode — only `analyze-cv-gaps` was. The gap answers are sent, but the function rejects the request before calling the AI because `parsedText` is just the placeholder `"(Starting from scratch — no source CV uploaded.)"` (~50 chars), which fails the `length < 100` guard and triggers the storage re-parse path.

The user sees this as "High demand right now" because `StepDraft` (the caller) maps any non-2xx into that generic message.

## Fix

### 1. `src/components/cv-builder/StepDraft.tsx`
Pass `fromScratch: state.fromScratch` and `gaps: state.gapAnalysis.gaps` in the body of the `generate-cv` invocation so the function has the question text alongside the answers (gap IDs alone are not self-describing).

### 2. `supabase/functions/generate-cv/index.ts`
- Read `fromScratch` and `gaps` from the request body.
- When `fromScratch === true`:
  - Skip the storage re-parse branch entirely.
  - Skip the `parsedText.trim().length < 100` guard.
  - Build the user message from the gap Q&A instead of CV text: format each gap as `Q: <question>\nA: <answer>` (writing) or `<category>: yes/no [+ details]` (expectation), plus the intent form (target roles, function, industry, seniority, cvType).
  - Add a short system-prompt addendum noting the candidate is starting from scratch, so the AI should build a skills-/education-focused CV from the answers without inventing experience. Keep the existing JSON output schema unchanged so the rest of the pipeline (`StepDraft`, editor, ATS scoring) works as-is.
- Keep all existing CV-mode behavior untouched.

### 3. No changes elsewhere
`StepDraft`'s error mapping, `EditorShell`, ATS scoring, and persistence layer don't need updates — only the generation input/guard changes.

## Out of scope
- No UI changes to the gaps screen or draft screen.
- No change to provider routing (still Gemini-first per your earlier instruction).
- No change to the paid-CV lock behavior.
