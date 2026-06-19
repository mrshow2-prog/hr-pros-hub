## Goal

When a user starts from scratch at the Build step (no CV uploaded), the gaps stage currently fails because there's no CV text to analyze. Switch it to a "scratch" mode that asks for the basic info needed to build a skills-focused CV for the selected target role(s).

Keep it simple — same gaps UI, same writing/expectation question structure, just sourced differently.

## Changes

### 1. Track scratch mode (`src/contexts/CVBuilderContext.tsx`)
- Add `fromScratch: boolean` to `CVBuilderState` (default `false`), persisted with the rest of the session state.
- Add a `setFromScratch(value)` setter on the context.

### 2. Flag scratch start (`src/components/cv-builder/StepUpload.tsx`)
- In `handleScratch`, call `setFromScratch(true)`.
- If the user later uploads a file or switches to paste mode, reset `fromScratch` to `false`.

### 3. Branch the gap analysis (`src/components/cv-builder/StepGaps.tsx`)
- When `state.fromScratch` is true:
  - Skip the existing `analyze-cv-gaps` call.
  - Call the same edge function with a new `mode: "scratch"` flag (no CV text needed) so the AI returns role-relevant prompts.
- Update the empty-state copy (header subtitle + loading text) to say something like "Let's gather a few basics to build your CV" when in scratch mode.

### 4. Edge function (`supabase/functions/analyze-cv-gaps/index.ts`)
Add a `mode === "scratch"` branch (placed before the "parsedText too short" guard):

- Skip the CV-text length validation and the storage download path.
- Use a dedicated system prompt for graduates / no-CV candidates that produces 6–8 questions split across two layers:
  - **writing layer** → short free-text questions covering: education (degree, institution, dates), internships, volunteering, trainings/certifications, languages, and any other notable info.
  - **expectation layer** → yes/no questions about role-relevant **skills and competencies** the user likely has, derived from `targetRoles`, `functionArea`, `seniority`, and `industry` (e.g. "Roles like Marketing Coordinator typically use Canva or Figma — do you have experience with this?"). Confirmed items will seed the skills section.
- Same JSON return shape as today (`{ gaps: [...] }`) so `StepGaps` renders without changes.

## Out of scope
- No new UI components, no new wizard step, no changes to how gap answers are later merged into the generated CV (the existing `generate-cv` flow already consumes gap responses).
- No changes to the paid-CV lock behavior added earlier.
