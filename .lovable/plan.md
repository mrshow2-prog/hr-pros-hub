# Interactive "Who this is for" cards → matcher hand-off

Enhance the 6 audience cards on the Career page with hover/tap reveals, and wire each card's CTA to auto-open the "Find my starting point" matcher with Q1 pre-selected.

## What changes (visible)

- Cards stay identical at rest (same icon, title, copy, tag).
- On hover (desktop) or tap (mobile), card lifts very slightly and a panel fades in below the tag (200ms) containing:
  - "Sound familiar? …" line in muted tone (matches existing `text-paper/45` body)
  - "This is for you →" inline CTA in `text-career-sky` with underline-on-hover (matches existing inline link style)
- Mobile: tap toggles open/closed; second tap closes. Tapping the CTA itself triggers the matcher hand-off.
- Clicking "This is for you →":
  1. Smooth-scrolls to the matcher section
  2. Matcher auto-advances from entry → Q1 with the mapped answer pre-selected and visible as registered
  3. After 400ms, advances to Q2 (user answers Q2 and Q3 normally)

Per-card mapping (Q1 index in `StartingPointMatcher.tsx`'s questions[0].options):
- Career-driven professionals → option 0 ("Employed, but actively looking…")
- New arrivals to the UAE → option 0
- Professionals in transition → option 2 ("Just made redundant…")
- UAE nationals entering private sector → option 3 ("Exploring options…")
- Executives and senior leaders → option 0
- HR professionals themselves → option 0

Reveal copy uses the exact strings from the brief.

## Technical changes

**1. `src/components/career/StartingPointMatcher.tsx`** — add an imperative trigger.
- Add an optional prop `trigger?: { q1Index: number; nonce: number } | null`.
- A `useEffect` watches `trigger?.nonce`. When it changes:
  - Set `answers` to `[q1Index, undefined, undefined]`
  - Set `pending = q1Index` and `step = 0` (so the user sees the chip selected on Q1)
  - After 400ms: clear `pending`, `setStep(1)` (advance to Q2)
- Existing manual flow is unchanged.

**2. `src/pages/Career.tsx`** — three edits:
- Extend the `audience` array entries with `q1: number` and `reveal: string` fields (per mapping above). Keep existing fields untouched.
- Add state: `const [matcherTrigger, setMatcherTrigger] = useState<{ q1Index: number; nonce: number } | null>(null);`
- Add a handler:
  ```ts
  const handleAudienceCta = (q1Index: number) => {
    document.getElementById("matcher")?.scrollIntoView({ behavior: "smooth" });
    setMatcherTrigger({ q1Index, nonce: Date.now() });
  };
  ```
- Replace the inline `<article>` map in the `#who` section with a new local `AudienceCard` component (defined in the same file, or inline JSX) that:
  - Wraps the existing card markup unchanged
  - Adds `group` class + `useState` `open` for mobile tap toggle
  - On click of the card body: toggles `open` (mobile only via `md:hidden` logic — actually use a single state that works for both: hover via `group-hover`, tap via `open`)
  - Renders the reveal panel with classes: `mt-5 transition-all duration-200 opacity-0 max-h-0 overflow-hidden group-hover:opacity-100 group-hover:max-h-40` plus `${open ? "opacity-100 max-h-40" : ""}` for tap-toggled state
  - The "This is for you →" is a `<button type="button">` with `onClick` calling `handleAudienceCta(q1)` (and `e.stopPropagation()` so it doesn't also toggle the card)
- Add `id="matcher"` to the `<StartingPointMatcher />` wrapper (or pass through). Since the matcher already renders its own `<section>`, simplest is to wrap the `<StartingPointMatcher />` placement in `<div id="matcher">` in `Career.tsx`.
- Pass `trigger={matcherTrigger}` to `<StartingPointMatcher />`.

**3. Visual tokens used (no new colours)**:
- Reveal "Sound familiar? …": `text-sm leading-6 text-paper/55`
- CTA: `font-dm text-xs font-bold uppercase tracking-wider2 text-career-sky underline-offset-4 hover:underline inline-flex items-center gap-1.5`
- Card hover lift: `hover:-translate-y-0.5 transition-transform` added to existing `transition-colors` on the article

## Out of scope

- No changes to section headline, subline, card copy, icons, badges, layout, services grid, or any other page element.
- No changes to matcher visual design or recommendation logic.
