## Problem

Bishoy's live page (`BishoyMesihaPage.tsx`) renders from a **hard-coded TypeScript file** (`src/pages/profiles/bishoy-mesiha/data.ts`) — hero, marquee, achievements, testimonials, philosophy, contact, education, and all 8 specialties.

The admin editor reads/writes `profiles_content.content` (JSONB in the database), which for Bishoy currently only holds a tiny stub (`name`, `headline`, `bio`, `photo_url`, `contact_*`, `linkedin_url`, `cv_url`, `achievements`).

So:
- Editor shows the DB stub — looks "completely different" from the live page.
- Edits save fine but change nothing visible, because the page ignores `profile.content`.

Khalil's page already reads from `profile.content` correctly — that's the pattern to match.

## Plan

### 1. Seed the database with Bishoy's full content

One-time migration that takes the exact data from `src/pages/profiles/bishoy-mesiha/data.ts` and writes it into `profiles_content.content` for `slug = 'bishoy-mesiha'`, under a clean shape:

```text
content = {
  hero:         { eyebrow, nameFirst, nameLast, name, tagline, hook, photo_url, stats[] },
  marquee:      [ ... ],
  achievements: [ { number, desc } ],
  testimonials: [ { avatar, author, role, text } ],
  philosophy:   "...",
  contact:      { email, phone, linkedin, location },
  education:    [ { degree, school, year } ],
  specialties:  [ { id, label, icon, color, angle, tagline, summary,
                    metrics[], skills[], experience[], projects[], testimonials[] } ],
  cv_url:       "...",
}
```

This preserves every field the page renders today.

### 2. Refactor `BishoyMesihaPage.tsx` to read from `profile.content`

- Replace the static imports from `./bishoy-mesiha/data` with reads from `profile.content`.
- Keep the same `Specialty` / `Stat` / etc. TypeScript interfaces (move them to a `types.ts` next to the page).
- Keep `data.ts` as a **fallback default** — if a field is missing in the DB (e.g. brand-new profile), the page falls back to the static defaults so it never breaks.
- No visual / behavioural changes to the page itself.

### 3. Result

- Opening `/admin/bishoy-mesiha` → **Quick fields** tab shows the real name / headline / photo / contact already populated from the seeded JSON.
- **Content (JSON)** tab shows the full structured content (hero, specialties, testimonials, etc.) — editable and savable.
- **Preview** tab and the live `/bishoy-mesiha` page reflect saved edits immediately.

### Out of scope (next iteration)

- A friendlier section-by-section form editor for specialties (currently still JSON-edited).
- Admin UI to upload/replace the hero photo (already works via Quick fields → photo upload).

### Files touched

- `supabase/migrations/<timestamp>_seed_bishoy_content.sql` (new) — one `UPDATE profiles_content SET content = '<json>' WHERE slug='bishoy-mesiha'`.
- `src/pages/profiles/bishoy-mesiha/types.ts` (new) — extracted interfaces.
- `src/pages/profiles/bishoy-mesiha/data.ts` (kept) — re-exported as default fallbacks.
- `src/pages/profiles/BishoyMesihaPage.tsx` (edited) — reads from `profile.content` with fallback to `data.ts`.
