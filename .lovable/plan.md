# Update hero copy on Business and Career pages

Two small, surgical copy edits. CTA buttons, layout, styling, and stats are all preserved exactly as they are. The Home page (`/`) is intentionally left untouched even though it also contains the old "Practical HR" headline — your instructions scoped this to the Business and Career pages.

## Changes

### 1. `src/components/business/BusinessHero.tsx`

Replace the `<h1>` (lines 18–25) and the sub-headline `<p>` (lines 26–28).

- **Headline:** "Your HR is probably broken. Let's fix it."
  - Line break after "broken." so it reads on two lines
  - "Let's fix it." styled as the italic terracotta accent (matching the existing `<em className="text-terracotta">` treatment used today)
- **Sub-headline:** "Most UAE SMEs are one labour claim away from a serious problem. We find the gaps before they cost you."
- Existing classes, font sizing, spacing, eyebrow tag, CTAs, and stats row left untouched.

### 2. `src/pages/Career.tsx` (line 172–173)

Replace the `<h1>` and the sub-headline `<p>` directly below it.

- **Headline:** "You're good at your job. The market doesn't know it yet."
  - Line break after "job." 
  - "The market doesn't know it yet." styled in the existing `italic text-career-sky` accent treatment (matching today's "considered." pattern), with the trailing period also in `text-career-sky` for visual consistency
- **Sub-headline:** "Career positioning, CV architecture, and interview preparation for professionals who want to move — and move well."
- All other elements on the page (eyebrow, CTAs, stats block, sections below) left untouched.

## Out of scope (intentionally untouched)

- `src/pages/Index.tsx` still uses the old "Practical HR, honestly said." headline. Tell me if you'd like that updated too — but per your instructions ("Make no other changes to these pages"), I'm leaving it alone.
