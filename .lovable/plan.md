# Fix: Preview refreshes mid-typing in the Draft step

## Problem

Every keystroke in any text field (contact, summary, experience role/company/dates/location, bullets, achievements, certifications, custom sections, etc.) calls a `patchX` action on the CV state. That updates `state.generatedCV`, which is a dependency of:

- `PdfmePreview` — re-runs the PDF render effect (debounced ~300 ms, but still re-renders the full PDF on every pause).
- ATS scoring effect (debounced ~400 ms).

On long sections (Experience with many bullets, Certifications with multiple entries), this makes the UI lag and feel like the system is "hanging" while the user is still typing.

## Solution

Switch the two shared input primitives — `Field` and `AutoTextarea` in `src/components/cv-builder/StepDraft.tsx` — from **controlled-on-every-keystroke** to **local draft state, committed on blur** (and on Enter for single-line `Field`). This single change covers every text input in the draft editor without having to add Confirm buttons to each section.

Behavior after the change:

- While typing: only local component state updates. No parent re-renders, no preview refresh, no ATS rescore.
- On blur (clicking/tabbing away) or Enter (for `Field`): the value is committed via the existing `onChange` prop, which triggers a single preview refresh.
- If the parent value changes externally (AI rewrite, auto-fix, template switch), the local draft syncs to the new value as long as the field is not focused.

This matches the "commits when you move to a new field" UX the user asked for, and is consistent with how Languages already work (commit on Add).

## Technical details

Files touched:

- `src/components/cv-builder/StepDraft.tsx`
  - `Field` (line ~1248): keep a local `draft` state initialised from `value`. `onChange` updates `draft` only. Add `onBlur` and `onKeyDown` (Enter) handlers that call the prop `onChange(draft)` only if it differs. Sync `draft` from `value` via `useEffect` when the input is not focused (use a `focusedRef`).
  - `AutoTextarea` (line ~1277): same pattern — local `draft`, commit on blur. Keep the existing auto-resize effect, but drive it off `draft` so it grows live while typing. No Enter-to-commit (multiline).

No other files need to change:

- `ContactBlock`, `ExperienceList`, `SummaryBlock`, `AchievementsBlock`, `CertificationsBlock`, `CustomSectionsBlock`, education fields, etc. all already route through `Field` / `AutoTextarea`, so they inherit the new behavior.
- `PillInput`, `LanguagesBlock`, skill/competency editors already commit on Add/Enter — unchanged.
- `PdfmePreview` debounce and ATS scoring debounce stay as-is; they just receive far fewer updates.

## Out of scope

- No visual/layout changes.
- No change to AI buttons, auto-fix, template picker, or section ordering.
- No new Confirm buttons per section — the on-blur commit gives the same outcome with less UI noise. If after testing the user still wants explicit Confirm buttons on specific sections (e.g. Certifications), we can add them in a follow-up.
