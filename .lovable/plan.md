## Redesign Step 6 bullets + add role-level AI actions

### 1. New edge function: `supabase/functions/generate-cv-section/index.ts`

- Same Gemini pattern as the other functions: `GEMINI_API_KEY`, `GEMINI_MODELS = ["gemini-2.5-flash", "gemini-2.5-flash-lite"]`, `RETRY_STATUSES`, and a local `callGeminiWithRetry` helper (3 attempts, model alternation, 800/1600 ms backoff, 60 s timeout).
- CORS via `npm:@supabase/supabase-js@2/cors`.
- Body shape:
  ```
  { roleId, currentBullets: string[], originalBullets: string[],
    intentForm: { targetRoles, functionArea, targetIndustry, seniority, tone },
    action: "condense" | "expand" | "tailor" }
  ```
- Per-action instruction:
  - `condense` — merge/reduce to highest-impact (3-5 bullets).
  - `expand` — depth + stronger framing (5-7 bullets), never invent numbers.
  - `tailor` — optimise for the target role's keywords/seniority/tone.
- Gemini `responseMimeType: application/json`, parsed to `{ bullets: string[] }`. Errors surfaced as `{ error, status, details }` (same shape as other functions) so the client UI can show a "high demand" message.

### 2. Context (`src/contexts/CVBuilderContext.tsx`)

- Add `replaceBullets(experienceId, newRewrites: string[])` that overwrites a role's bullets, pairing by index to reuse existing bullet IDs (preserving the `original` reference where possible) and generating new IDs for extras. New ones get `original: ""` and `status: "edited"`.
- Expose it through the context value alongside the existing bullet mutators.

### 3. `StepDraft.tsx` — redesign the Experience block

Delete the current `BulletEditor` (old/new stacked + Accept/Edit/Revert) and rebuild as:

**Per role (`ExperienceCard`):**

```
Role fields (unchanged)

[▸ Original bullets from your CV]   ← collapsed by default
   (when expanded: read-only <ul> of muted `bullet.original` strings)

[Show changes ▢]                    ← toggle, role-local

• Bullets (primary view, always editable):
    <AutoTextarea> rewrite (autosave to context via updateBullet)
       [Rewritten | Added | Unchanged]   ← tag pill, shown only if toggle on
                                          [🗑]   ← subtle delete, right-aligned

  [+ Add bullet]

  ───────────────────────────────
  [Condense] · [Expand] · [Tailor to role]   ← subtle text buttons
     (inline spinner + "Rewriting bullets…" while busy)
     (one-line error under actions on failure)
```

Tag computation:
- has `original` and `rewrite !== original` → `Rewritten`
- no `original` → `Added`
- `rewrite === original` → `Unchanged`

Implementation notes:
- Drawer + "Show changes" use local `useState` per role. Smooth open via Tailwind transition (no new dependency).
- Delete: `Trash2` icon-only, muted, right-aligned.
- AI action handler invokes `generate-cv-section`, then calls `replaceBullets(exp.id, data.bullets)` on success. Only the active role shows the loading state — the rest of the page stays interactive. Errors render inline with the raw `details` as a `title` tooltip.
- Remove `RotateCcw` / `Check` / `Pencil` / `ActionBtn` if they become unused after the rewrite.

### Out of scope

- No template or renderer changes (rewrites are still what gets rendered/exported).
- No changes to Step 3 (Gaps), no DB / persistence schema changes (bullet shape unchanged).
- Toggle is per-role, not a global one across the whole CV.
- No undo for Condense/Expand/Tailor (originals stay in the drawer; auto-save lets users navigate back).
