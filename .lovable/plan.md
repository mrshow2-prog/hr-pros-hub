Add a two-card testimonials section to `/career`, slotted between the "Who this is for" section and the `#matcher` block.

## Placement

In `src/pages/Career.tsx`, insert a new `<section id="testimonials">` between line 407 (the `#who` section) and line 409 (the `#matcher` div).

## Markup (using existing career design tokens)

```tsx
<section id="testimonials" className="bg-career-deep px-6 py-20 md:px-10">
  <div className="mx-auto max-w-6xl">
    <p className="mb-4 font-dm text-xs font-bold uppercase tracking-widest2 text-career-sky">
      What clients say
    </p>
    <h2 className="mb-12 font-serif text-4xl font-bold leading-tight text-paper md:text-5xl">
      Results speak for themselves.
    </h2>

    <div className="grid gap-6 md:grid-cols-2">
      {TESTIMONIALS.map((t) => (
        <article
          key={t.name}
          className="flex h-full flex-col border border-career-border bg-career-surface p-7"
        >
          {/* 5 star row using lucide Star, fill + color via text-career-sky */}
          <div className="mb-5 flex gap-1 text-career-sky" aria-label="5 out of 5 stars">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={16} className="fill-current" />
            ))}
          </div>

          <blockquote className="mb-6 font-light leading-8 text-paper/75">
            "{t.quote}"
          </blockquote>

          <div className="mt-auto border-t border-career-border pt-5">
            <div className="font-dm text-sm font-bold text-paper">{t.name}</div>
            {t.role && (
              <div className="mt-1 text-xs leading-5 text-paper/55">{t.role}</div>
            )}
            <div className="mt-2 font-dm text-[10px] font-bold uppercase tracking-wider2 text-career-sky/70">
              {t.service}
            </div>
            <div className="mt-1 text-[11px] text-paper/35">{t.source}</div>
          </div>
        </article>
      ))}
    </div>

    <p className="mt-8 text-sm text-paper/45">
      <a
        href="https://www.linkedin.com/in/bmesiha/"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 hover:text-career-sky"
      >
        More recommendations available on LinkedIn →
      </a>
    </p>
  </div>
</section>
```

## Data (defined at top of `Career.tsx` alongside other locals)

```ts
const TESTIMONIALS = [
  {
    quote: "Bishoy did an exceptional job on my CV. He has a keen eye for detail and a great understanding of how to present skills and experience effectively. His ability to tailor the CV to specific job applications was impressive. The end result is a professional and compelling document that truly represents my qualifications.",
    name: "Mohamed Salah",
    role: null,
    service: "CV Writing",
    source: "LinkedIn · July 2024",
  },
  {
    quote: "I highly recommend working with Bishoy. He has extensive expertise in crafting professional CVs and a real ability to generate ideas that make a profile stand out. An invaluable resource for anyone looking to enhance their professional profile.",
    name: "Abanoub Nabil",
    role: "Senior Sales Manager · Fairmont Hotels & Resorts",
    service: "Resume Review",
    source: "LinkedIn · July 2024",
  },
];
```

## Imports
Add `Star` to the existing `lucide-react` import in `Career.tsx`.

## Design notes
- Section background `bg-career-deep` to alternate from the `bg-career-surface` "Who this is for" above and the matcher below.
- Cards use `bg-career-surface` + `border-career-border` — the same surface tokens used by other cards on the page.
- Stars use `text-career-sky` (the page's accent) with `fill-current` so they read as solid filled stars.
- Source label is in `text-paper/35` muted to match other small-print muting on the page.
- Grid: stacked on mobile, side-by-side at `md:`.

## Files
- Edited: `src/pages/Career.tsx`
