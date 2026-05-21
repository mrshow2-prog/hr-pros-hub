# CV Builder — Architecture Scaffold

Wire up the foundation for the AI-powered CV Builder. No UI yet — just route, state, edge function stubs, storage, and persistence.

## 1. Route

Add to `src/App.tsx`:
- `/career-studio/cv-builder` → new `CvBuilder` page
- `/ar/career-studio/cv-builder` → same page (Arabic mirror, consistent with existing pattern)

## 2. Placeholder page

`src/pages/CvBuilder.tsx` — minimal page wrapped in `CVBuilderProvider`. Shows a confirmation card listing:
- Current step (from context)
- Wired sub-systems (context ✓, storage ✓, edge functions ✓, persistence ✓)
- "UI coming next" note

Uses existing `SEO`, `SiteFooter`, brand tokens (`bg-paper`, `text-ink`, `font-syne`).

## 3. State — `CVBuilderContext`

`src/contexts/CVBuilderContext.tsx` — single provider holding the full wizard state:

```ts
type CVBuilderState = {
  sessionId: string;                    // uuid, used for persistence + storage paths
  currentStep: 1|2|3|4|5|6|7;
  uploadedFiles: { path: string; name: string; size: number }[];
  parsedText: string;
  intentForm: {
    targetRole: string;
    targetIndustry: string;
    seniority: "graduate"|"mid"|"senior"|"director"|"executive" | "";
    cvType: "chronological"|"skills"|"hybrid" | "";
    tone: "conservative"|"balanced"|"modern" | "";
  };
  gapAnalysis: {
    gaps: { id: string; category: string; example: string; question: string }[];
    responses: Record<string, string>;
  };
  paymentStatus: "unpaid"|"pending"|"paid";
  selectedTemplate: "classic"|"modern"|"compact"|"skills-first"|"executive" | null;
  typeOption: "light"|"dark";
  generatedCV: {
    summary: string;
    experience: { id: string; company: string; role: string; period: string;
      bullets: { id: string; original: string; rewrite: string; explanation: string; status: "accepted"|"edited"|"reverted" }[] }[];
    skills: string[];
    education: { id: string; institution: string; qualification: string; period: string }[];
    competencyClusters?: { id: string; title: string; items: string[] }[];
  } | null;
  atsScore: {
    overall: number;
    keywordMatch: number;
    formatting: { label: string; pass: boolean }[];
    readability: number;
  } | null;
};
```

Exposed actions: `setStep`, `patchIntent`, `setGaps`, `setGapResponse`, `setPayment`, `setTemplate`, `setTypeOption`, `setGeneratedCV`, `updateBullet`, `setAts`, `resetSession`.

Persistence: debounced (1s) upsert into `cv_builder_sessions` keyed by `sessionId`. On mount, hydrate from Supabase if a `cv_builder_session_id` is found in `localStorage`; otherwise create a new uuid.

## 4. Database — persistence table

Migration creating `public.cv_builder_sessions`:

| column | type | notes |
|---|---|---|
| `id` | uuid PK | matches `sessionId` |
| `user_id` | uuid nullable | `auth.uid()` when signed in, null for anon |
| `anon_token` | text nullable | for anonymous resume — random token stored in localStorage |
| `state` | jsonb | full state blob |
| `payment_status` | text | mirrored for fast lookup |
| `stripe_session_id` | text nullable | for webhook reconciliation later |
| timestamps |  | standard |

RLS:
- Anonymous users: select/insert/update rows where `anon_token` matches a header/value sent from client (using a `select_by_token` RPC). Simplest first pass: allow anon select/insert/update with `anon_token IS NOT NULL` and require the client to filter by id. We can tighten later when auth is added.
- Authenticated users: full access to their own rows (`user_id = auth.uid()`).

## 5. Storage

Create bucket `cv-builder-uploads` (private). RLS policy: anyone can insert into a folder named after their `sessionId`; reads restricted to owners / edge functions (service role).

## 6. Edge function stubs

All three follow the existing `supabase/functions/*` pattern (Deno, CORS headers, JWT-optional). Each returns a typed mock payload now, real logic later.

- `analyze-cv-gaps/index.ts` — input: `{ parsedText, intentForm }`. Output: `{ gaps: Gap[] }`. Stub returns 3–4 hardcoded gaps.
- `generate-cv/index.ts` — input: `{ parsedText, intentForm, gapResponses, template, typeOption }`. Output: structured `generatedCV` shape above. Stub returns a small mock CV.
- `calculate-ats-score/index.ts` — input: `{ generatedCV, targetRole }`. Output: `atsScore` shape. Stub returns a fixed 78/100 sample.

`supabase/config.toml`: add `verify_jwt = false` blocks for the three new functions (consistent with other public-facing functions in this project).

## 7. Out of scope (this task)

- Any wizard UI / step components
- Real Claude/Gemini calls (functions are stubs)
- Stripe integration (payment gate)
- PDF parsing (`parsedText` left empty for now — Step 1 UI will fill it)
- Export to PDF/DOCX

## Technical notes

- Edge functions use `npm:@supabase/supabase-js@2/cors` for `corsHeaders` per project convention.
- Context split into reducer + provider to keep re-renders narrow; selectors via small hooks (`useCvStep`, `useCvIntent`, etc.).
- All new files use brand tokens only — no raw colors.

## Files to create

- `src/contexts/CVBuilderContext.tsx`
- `src/pages/CvBuilder.tsx`
- `supabase/functions/analyze-cv-gaps/index.ts`
- `supabase/functions/generate-cv/index.ts`
- `supabase/functions/calculate-ats-score/index.ts`
- Migration: `cv_builder_sessions` table + `cv-builder-uploads` bucket + RLS

## Files to edit

- `src/App.tsx` — add route (EN + AR)
- `supabase/config.toml` — add function blocks
