## Goal
Give the user one-click control over ALL CAPS in two places of the Draft step where the AI often over-capitalizes:
1. **Contact** — Full name + Job title
2. **Skills** — every skill pill

## UX
Add a small icon button labeled **"Aa"** with a tooltip "Toggle capitalization" placed:
- Inline at the top-right of the **Contact** SectionShell header — affects `contact.name` and `contact.jobTitle` together.
- Inline at the top-right of the **Skills** SectionShell header — affects every entry in `cv.skills`.

Clicking the button cycles the affected text through three states:
1. **Title Case** (`John Doe`, `Senior Product Manager`, `Stakeholder Management`)
2. **UPPER CASE** (`JOHN DOE`, …)
3. **lower case** (`john doe`, …)

Cycle state is local to the button (not persisted) — each click just transforms the current values and advances the cycle marker. This keeps the data model unchanged (still a plain string field) and works regardless of how the AI generated the values.

## Implementation
- New tiny helper `src/lib/cv/textCase.ts` exporting `toTitleCase`, `toUpper`, `toLower`, and a `nextCase(current)` cycler.
- New component `CaseToggleButton` (in `src/components/cv-builder/StepDraft.tsx` or a sibling file) — accepts `onApply(transform: (s: string) => string)` and tracks the cycle index in local state.
- Extend `SectionShell` (already in StepDraft.tsx) to accept an optional `headerAction` ReactNode rendered on the right of the title bar. If `SectionShell` doesn't already have a header right-slot, add it.
- Wire two instances:
  - **Contact**: applies the transform to `contact.name` and `contact.jobTitle` via `patchContact`.
  - **Skills**: applies the transform to each entry in `cv.skills` via `setSkills`.

Title-case rule: split on whitespace, lowercase each word, uppercase first letter; preserve common acronyms by leaving any token already containing a digit or 2+ uppercase letters that match a small allowlist (e.g. `HR`, `CEO`, `SQL`, `AI`, `UX`, `UI`, `API`, `B2B`, `CRM`, `ERP`, `KPI`, `SaaS`, `IT`) untouched. Keep the allowlist short and inline.

## Out of scope
- No persistence of the chosen case mode across sessions.
- Summary, experience bullets, education, and other sections are unchanged.
- No styling-only/CSS `text-transform` approach — we transform the stored values so PDF/DOCX exports reflect the choice automatically.
