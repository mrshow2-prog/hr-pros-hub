# Wire JD Builder to Lovable AI

The JD Builder currently uses a static template — there is no existing AI prompt to swap. We'll add a Lovable AI edge function that runs the upgraded prompt and feeds its output into the existing branded PDF.

## What changes

### 1. New edge function: `supabase/functions/generate-jd/index.ts`
- Accepts `{ companyName, title, level, sector, location, notes }`
- Calls Lovable AI Gateway (`google/gemini-3-flash-preview` default) with `LOVABLE_API_KEY`
- Uses a **structured output** (tool-calling) schema so we get back clean JSON ready for the PDF:
  ```
  {
    mohreClassification: string,        // one-line, only filled when location is UAE mainland
    aboutUs: string,
    roleOverview: string,
    keyResponsibilities: string[],      // 8–12 bullets
    requiredQualifications: string[],
    preferredQualifications: string[],
    coreCompetencies: string[],         // 5–6 bullets
    whatWeOffer: string[]
  }
  ```
- System prompt = the upgraded senior-HR-consultant prompt provided, with `${...}` slots filled from the request
- Handles 429 (rate limit) and 402 (credits) and returns clear JSON errors
- CORS enabled, `verify_jwt = false` (public, like other tool functions)

### 2. `src/components/tools/JDBuilder.tsx`
- Remove the static `useMemo` template
- On "Build job description":
  1. Validate fields (existing logic)
  2. Show loading state on the button ("Generating…", disabled)
  3. `supabase.functions.invoke('generate-jd', { body: {...} })`
  4. Map the returned JSON into `PdfSection[]`:
     - Optional "MoHRE Classification" section (only if returned & non-empty)
     - "About us"
     - "Role overview"
     - "Key responsibilities"
     - "Required qualifications"
     - "Preferred qualifications"
     - "Core competencies"
     - "Company context" (still uses user's `notes` verbatim, kept for editor handoff)
     - "What we offer"
  5. `downloadPdf(...)` (unchanged branded PDF) and `recordToolUsage(TOOL_NAME)`
  6. Set `ready = true` so the existing `ToolEmailCapture` + upsell strip render as today
- Error handling: toast/inline error for 402 ("Add credits to keep using this tool"), 429 ("Too many requests, try again in a moment"), and generic failure
- `buildOutputText()` uses the AI sections so the email capture sends the AI-generated JD

### 3. No DB migration, no new client files needed.

## Technical notes
- Default model: `google/gemini-3-flash-preview` (fast + cheap, good for this length).
- Tool-calling guarantees parseable structure — no regex on free-text.
- `LOVABLE_API_KEY`, `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` are already configured.
- PolicyGenerator is **not** touched in this change (you only asked about JD Builder). Happy to mirror the same pattern there next if you want.

## Files
- `supabase/functions/generate-jd/index.ts` (new)
- `src/components/tools/JDBuilder.tsx` (edited)
