## Status: Already implemented

Both post-result CTAs requested are already present in the codebase, gated behind the results-visible state, and use the page's existing `UpsellStrip` component pattern (the same primitive used for every other tool upsell on this page).

### 1. HR Diagnostic CTA — `src/components/tools/HRDiagnostic.tsx`

Rendered inside the `if (showResults)` branch (line 168), immediately after the recommendation/result container, at lines 239–246:

```tsx
<UpsellStrip
  title="Your score is a starting point. Not a verdict."
  body="A 30-minute call with Bishoy costs nothing and leaves you with a clearer picture of what to fix first — and what it would cost to fix it properly."
  ctaLabel="Book a free 30-minute call →"
  ctaHref={BOOKING_URL}              // → https://calendly.com/peoplestudio
  secondaryLabel="See what a full HR advisory engagement looks like →"
  secondaryHref="/business"
/>
```

Only renders when `showResults === true`. Does not appear on page load or during the questionnaire.

### 2. Emiratisation Calculator CTA — `src/components/tools/EmiratesCalculator.tsx`

Rendered inside the `{result && ( … )}` block, immediately after the existing "Want a full compliance plan?" upsell:

```tsx
<UpsellStrip
  title="Now you know the number. Here's how to fix it."
  body="The Emiratisation Readiness Pack starts at AED 3,500 and gives you a 90-day compliance plan within 2 days."
  ctaLabel="Book a call to get started →"
  ctaHref={BOOKING_URL}              // → https://calendly.com/peoplestudio
/>
```

Only renders after `Calculate my obligation` is clicked and `result` is set.

### Why the previous attempts may have looked "missing"

The CTAs use `UpsellStrip` (the established design-token component) instead of raw `<div className="rounded-lg border …">` blocks with `bg-primary` / `text-muted-foreground`. Those Tailwind tokens are not part of this project's palette — the Tools page uses `sienna`, `clay`, `paper`, `ink`, etc. Inserting the literal snippet from the brief would render as an off-brand white-on-grey card that looks broken next to the rest of the page.

### Recommended action

**No code changes.** Both CTAs are live, correctly gated, point to `https://calendly.com/peoplestudio`, and match the page's visual language.

If you'd prefer the literal raw-div styling from the brief instead of the branded `UpsellStrip`, say the word and I'll swap them — but I'd recommend against it for visual consistency.

### Files to verify in preview

- `/tools` → HR Diagnostic tab → complete the questionnaire → CTA appears below the recommendation card.
- `/tools` → Emiratisation Calculator tab → enter inputs → click Calculate → CTA appears below the breakdown.
