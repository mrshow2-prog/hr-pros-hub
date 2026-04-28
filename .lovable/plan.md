Add a "Professional Endorsements" strip to the Business About section, sitting beneath the existing two-column grid (left: founder copy + button, right: credential badges) so it visually follows both columns and clearly belongs to About — without disturbing the grid.

## Note on placement
The brief says "between the credentials badges and the Ready to talk? CTA". The current About section has no "Ready to talk?" CTA — the only About CTA is "About the Founder →" in the left column, and the "Ready to talk?" CTA lives in the separate Contact section further down the page. The most faithful read is therefore: place the strip at the bottom of the About section (after both columns), so it sits between the credentials and the page-level Contact CTA that follows.

## Implementation — `src/components/business/BusinessAbout.tsx`

After the closing `</div>` of the two-column grid (current line 51) and before the section's closing `</div>` (line 52), add a full-width endorsements block.

```tsx
{/* Professional endorsements — colleague quotes, NOT client testimonials */}
<div className="mt-20 border-t border-terracotta/15 pt-12">
  <span
    className="font-dm font-bold text-xs uppercase block mb-8 text-terracotta"
    style={{ letterSpacing: "0.18em" }}
  >
    Professional Endorsements
  </span>

  <div className="grid gap-10 md:grid-cols-2 md:gap-14">
    {ENDORSEMENTS.map((e, i) => (
      <figure
        key={e.attribution}
        className={
          // subtle separator between the two on mobile (top border on second),
          // and a vertical hairline between them on desktop
          i === 1
            ? "relative border-t border-terracotta/15 pt-10 md:border-t-0 md:pt-0 md:border-l md:pl-14"
            : "relative"
        }
      >
        <span
          aria-hidden="true"
          className="absolute -top-4 -left-1 font-serif text-7xl leading-none text-terracotta/20 select-none"
        >
          “
        </span>
        <blockquote
          className="font-dm leading-relaxed text-moss relative z-10"
          style={{ fontWeight: 300, fontSize: "1rem" }}
        >
          {e.quote}
        </blockquote>
        <figcaption
          className="mt-5 font-dm font-bold text-[0.7rem] uppercase text-ink/55"
          style={{ letterSpacing: "0.14em" }}
        >
          — {e.attribution}
        </figcaption>
      </figure>
    ))}
  </div>

  <p className="mt-10 font-dm text-xs text-moss/70">
    <a
      href="https://www.linkedin.com/in/bmesiha/"
      target="_blank"
      rel="noopener noreferrer"
      className="hover:text-terracotta hover:underline underline-offset-2"
    >
      Full LinkedIn recommendations →
    </a>
  </p>
</div>
```

Add the data array at the top of the file (just after the `ABOUT_CREDENTIALS` import):

```ts
const ENDORSEMENTS = [
  {
    quote:
      "His professionalism, collaborative spirit, and positive approach made a meaningful impact — and he will certainly be missed.",
    attribution: "Regional Director · MCN KSA",
  },
  {
    quote:
      "I wanted you to know how much I enjoyed working with you and to thank you for the advice you gave me.",
    attribution: "Managing Director · MCN",
  },
];
```

## Design rationale
- **Section label** uses the exact same eyebrow pattern as the "About" label above it (same colour, weight, tracking) — clearly labelled "Professional Endorsements", as the brief insists.
- **Large opening quote mark** in `text-terracotta/20` — accent colour at low opacity, positioned top-left of each quote.
- **Attribution** in muted small caps (`text-ink/55`, `0.14em` tracking) — distinct from the prominent serif used for client testimonials elsewhere.
- **Subtle separator**: top hairline divides the strip from the credentials/founder columns above; an internal hairline (top border on mobile, left border on desktop) separates the two quotes — understated, no card chrome.
- All colours use existing tokens (`terracotta`, `moss`, `ink`, `cream`).

## Files
- Edited: `src/components/business/BusinessAbout.tsx`
