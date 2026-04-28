# Career services — interactive cards + contact handoff

Make the "What we can build together" grid feel alive on hover, show clearer grid separation, and route clicks straight to the contact form at the bottom of the page with the chosen service prefilled.

## Scope

Only edits the services grid section in `src/pages/Career.tsx` (around line 326) and the contact form's textarea binding in the same file. No changes to the matcher, ATS tool, contact submit logic, copy elsewhere, nav, or footer.

## What changes

**Grid visibility**
- Keep the current `border border-career-border bg-career-border` parent with `gap-px` between cards so each card has clean dividing lines.
- Add an outer rounded container and a subtle shadow so the whole grid reads as one structured block.
- Force `md:grid-cols-2 lg:grid-cols-3` (already set) and ensure cards stretch to equal height (`h-full flex flex-col`).

**Hover interactivity** (per card, all using existing tokens — `career-sky`, `career-blue`, `career-surface`, `paper`)
- Lift: `transition-all duration-300 hover:-translate-y-1`
- Background shift: `hover:bg-career-surface` (already there) plus a soft inner glow via `hover:ring-1 hover:ring-career-sky/40`
- Category pill: on hover, underline expands (use `after:` pseudo bar that scales from 0 → 100% width).
- Title: color shifts from `text-paper` → `text-career-sky` on hover.
- Bullets: left dash shifts from `before:text-career-sky` to brighter on group-hover (`group-hover:before:text-blush`).
- CTA row: change copy from "Pricing on call" to "Start this conversation", brighten on hover (`text-career-sky/70` → `group-hover:text-paper`), arrow translates further (`group-hover:translate-x-1.5 group-hover:-translate-y-0.5`).
- Cursor: `cursor-pointer`.
- Focus ring for keyboard users: `focus-visible:ring-2 focus-visible:ring-career-sky focus-visible:outline-none`.

**Click → contact form**
- Wrap each card as a `<button type="button">` (semantic, keyboard-accessible) instead of `<article>`. Keep the same internal markup.
- On click: set `contact.goal` to a prefilled sentence — e.g. `I'd like to learn more about: {service name}.\n\n` (preserves existing user text by appending only if `goal` is empty; otherwise prepend a new line so we don't wipe what they typed).
- Then smooth-scroll to `#contact` using `document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth', block: 'start' })`.
- After scroll, focus the goal textarea so the cursor lands ready to type. Add an `id="contact-goal"` and `ref` to the textarea.

**Mobile**
- The lift/translate effects are kept (work fine on touch via active state); add `active:bg-career-surface active:-translate-y-0.5` so tapping shows feedback.
- Cards remain full-width single column on small screens (existing behavior).

## Technical notes

- File: `src/pages/Career.tsx` only.
- Add a `handleServiceClick(name: string)` helper near the other handlers.
- The services array stays unchanged; `name` is the second tuple element.
- The textarea currently has no `id`; add `id="contact-goal"` and a `useRef<HTMLTextAreaElement>` so we can focus it after scroll (wrap focus in a ~400ms `setTimeout` so it runs after smooth scroll begins).
- No new dependencies, no design tokens added — uses `career-sky`, `career-blue`, `career-surface`, `career-border`, `paper`, `blush` already in the theme, plus existing `animate-fade-in` / Tailwind transition utilities.

## Out of scope

- The matcher block above the grid.
- ATS review form, contact form layout/submit, edge function.
- Any copy except the per-card CTA label.