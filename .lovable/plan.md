# Find my starting point — Career matcher

## Contradiction check (none blocking)

I checked the existing Career page against the spec. Everything lines up:

- The 6 service names in the recommendation logic (CV Design & Rewrite, LinkedIn Profile Optimisation, Interview Coaching, Salary Negotiation Coaching, Career Pivot Consulting, Personal Brand Strategy) all match the existing `services` array in `Career.tsx` exactly — we can map results straight to those cards.
- A booking link already exists site-wide as `BOOKING_HREF` (Calendly). The result CTA will reuse it — no new link needed.
- Design tokens already used on this page (`career-bg`, `career-surface`, `career-border`, `career-sky`, `career-blue`, `career-deep`, `paper`, `blush`, `font-dm`, `font-serif`, `tracking-widest2`) cover everything the matcher needs — no new tokens.
- Animation utilities (`animate-fade-in`, `animate-scale-in`) are available globally — no new keyframes.

One small thing worth confirming, but I'll proceed with a sensible default unless you say otherwise:

- **"See all services ↓" target**: the services grid is `<section id="services">`. I'll smooth-scroll to that anchor.
- **Reset behaviour**: "Start again" returns to the entry state (button visible), not back to question 1 mid-flow. Cleaner.

If either of those is wrong, tell me before I build.

## What gets built

A new section inserted in `src/pages/Career.tsx` immediately above the existing `<section id="services">` block. The services grid itself, the page header, nav, footer, and every other section stay untouched.

The matcher is a single self-contained client component with three states driven by local React state — no modal, no drawer, no route change.

```text
┌──────────────────────────────────────────────┐
│ ENTRY                                        │
│  Not sure where to start?                    │
│  Answer 3 questions. ~10 seconds.            │
│  [ Find my starting point → ]                │
└──────────────────────────────────────────────┘
        ↓ click
┌──────────────────────────────────────────────┐
│ QUESTIONS  (1 of 3 · 2 of 3 · 3 of 3)        │
│  Question text                               │
│  [ Option ]                                  │
│  [ Option ]    ← click highlights, then      │
│  [ Option ]      300ms later advances        │
│  [ Option ]                                  │
└──────────────────────────────────────────────┘
        ↓ after Q3
┌──────────────────────────────────────────────┐
│ RESULT                                       │
│  Personalised 1–2 sentence insight           │
│  ┌──────────────────────────────────────┐    │
│  │ PRIMARY service card (highlighted)   │    │
│  └──────────────────────────────────────┘    │
│  You might also benefit from: Secondary      │
│  [ Book a free 30-minute call → ]            │
│  See all services ↓                          │
│  Start again                                 │
└──────────────────────────────────────────────┘
```

## Recommendation logic (resolved)

Order of precedence, applied in this exact order:

1. **Primary** = derived from Q2:
   - "don't get interviews" → CV design & rewrite (secondary: LinkedIn profile optimisation)
   - "get interviews but don't get offers" → Interview coaching (secondary: Salary negotiation coaching)
   - "don't know what I want" → Career pivot consulting (secondary: Personal brand strategy)
   - "underpaid" → Salary negotiation coaching (secondary: LinkedIn profile optimisation)
2. **Q1 override**: if Q1 = "Just made redundant" → primary becomes Career pivot consulting (secondary kept from Q2 mapping, unless that secondary is already Career pivot consulting, in which case secondary falls back to Personal brand strategy).
3. **Q3 override**: if Q3 = "Director / Head of / VP" or "C-suite or board level" → secondary becomes Personal brand strategy (replacing whatever was there). If primary already = Personal brand strategy, secondary falls back to LinkedIn profile optimisation.

## Personalised insight headlines (one per primary outcome)

- CV design & rewrite → "Your experience isn't the problem. Your CV isn't showing it."
- Interview coaching → "You're getting in the room. The gap is what happens in the room."
- Salary negotiation coaching → "Before you negotiate, you need leverage. Here's how to build it."
- Career pivot consulting → "The hardest part isn't the move. It's knowing which move."
- Career pivot consulting (when triggered by redundancy) → "Speed matters now, but direction matters more. Let's get both right."
- Personal brand strategy (only if it ever becomes primary via fallback) → "At your level, the role finds you — if the market knows who you are."

## Behaviour details

- Selecting an answer instantly highlights it (border + bg shift in `career-sky`), waits 300ms, then advances with a fade/slide transition (`animate-fade-in`).
- Progress indicator: small "1 of 3" text in `font-dm uppercase tracking-widest2 text-career-sky`.
- Mobile: options stack full-width, `min-h-12` (48px) tap targets.
- "See all services ↓" → `document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })`.
- "Start again" → resets state to entry; small muted `text-paper/45 underline-offset-4 hover:underline`.
- Result CTA reuses `BOOKING_HREF` with the same styling as other primary buttons on the page (`bg-career-blue text-paper`).
- The primary service card in the result reuses the visual language of the existing service cards but with an elevated treatment: `border-career-sky/60 bg-career-sky/15 shadow-[0_0_0_1px_hsl(var(--career-sky)/0.4)]`.

## Technical implementation

- New file: `src/components/career/StartingPointMatcher.tsx` — self-contained, no props, manages its own state (`step: 'entry' | 0 | 1 | 2 | 'result'`, `answers: [number?, number?, number?]`).
- Edit: `src/pages/Career.tsx` — import the component and render `<StartingPointMatcher />` as a new `<section className="bg-career-bg px-6 pt-20 md:px-10">` block placed immediately before the existing `<section id="services">`. The services section keeps its existing top padding so the spacing reads naturally.
- No changes to `services` array, no new data files, no edge functions, no DB.
- Pure client-side; no analytics added unless you want them (let me know).

## Out of scope (explicitly not touched)

Services grid contents and styling, page header, nav, footer, ATS checker, Web CV section, About section, contact form.
