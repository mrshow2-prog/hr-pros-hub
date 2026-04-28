Add a post-result CTA strip after both the HR Diagnostic and Emiratisation Calculator results, reusing — and modestly extending — the existing `UpsellStrip` primitive in `src/components/tools/ToolPrimitives.tsx` so the visual language stays consistent with the rest of the page.

## 1. Extend `UpsellStrip` (backward-compatible)

`src/components/tools/ToolPrimitives.tsx` — extend the props so the strip can render an optional primary button and an optional secondary text link, while keeping the current "single uppercase link" mode used by JD Builder, Policy Generator, and Emirates Calculator.

```tsx
export function UpsellStrip({
  title, body,
  href, link,                         // existing single-link mode
  ctaLabel, ctaHref,                  // NEW — primary button
  secondaryLabel, secondaryHref,      // NEW — small underline link
}: {
  title: string;
  body: string;
  href?: string;
  link?: string;
  ctaLabel?: string;
  ctaHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
}) {
  return (
    <div className="mt-6 flex flex-col gap-4 border border-sienna/20 bg-sienna/10 p-5 md:flex-row md:items-center md:justify-between">
      <div className="max-w-xl">
        <strong className="mb-1 block font-medium text-ink">{title}</strong>
        <p className="font-dm text-sm leading-6 text-ink/60">{body}</p>
        {secondaryLabel && secondaryHref && (
          <a href={secondaryHref} className="mt-2 inline-block font-dm text-xs text-ink/55 underline-offset-2 hover:text-sienna hover:underline">
            {secondaryLabel}
          </a>
        )}
      </div>
      {ctaLabel && ctaHref ? (
        <a
          href={ctaHref}
          target={ctaHref.startsWith("http") ? "_blank" : undefined}
          rel={ctaHref.startsWith("http") ? "noopener noreferrer" : undefined}
          className="inline-flex shrink-0 items-center justify-center bg-sienna px-6 py-3 font-dm text-[0.72rem] font-bold uppercase tracking-wider2 text-paper transition-opacity hover:opacity-90"
        >
          {ctaLabel}
        </a>
      ) : (
        href && link && (
          <a href={href} className="whitespace-nowrap font-dm text-[0.72rem] font-bold uppercase tracking-wider2 text-sienna hover:underline">
            {link}
          </a>
        )
      )}
    </div>
  );
}
```

This preserves all four existing call-sites (they keep using `href` + `link`).

## 2. HR Diagnostic CTA strip

`src/components/tools/HRDiagnostic.tsx` — after the closing `</div>` of the "Recommended next step" block (line 236), before `</section>` (line 237), insert:

```tsx
<UpsellStrip
  title="Your score is a starting point. Not a verdict."
  body="A 30-minute call with Bishoy costs nothing and leaves you with a clearer picture of what to fix first — and what it would cost to fix it properly."
  ctaLabel="Book a free 30-minute call →"
  ctaHref={BOOKING_URL}
  secondaryLabel="See what a full HR advisory engagement looks like →"
  secondaryHref="/business"
/>
```

Add the imports at the top of the file:
- `import { UpsellStrip } from "./ToolPrimitives";`
- `import { BOOKING_URL } from "@/lib/contact";`

## 3. Emirates Calculator CTA strip

`src/components/tools/EmiratesCalculator.tsx` — `UpsellStrip` is already imported. Immediately after the existing `<UpsellStrip … link="See Emiratisation Pack →" />` on line 171 (still inside the `OutputBox`), add a second strip:

```tsx
<UpsellStrip
  title="Now you know the number. Here's how to fix it."
  body="The Emiratisation Readiness Pack starts at AED 3,500 and gives you a 90-day compliance plan within 2 days."
  ctaLabel="Book a call to get started →"
  ctaHref={BOOKING_URL}
/>
```

Add `import { BOOKING_URL } from "@/lib/contact";` at the top.

## Out of scope
- Existing UpsellStrip call-sites in JD Builder, Policy Generator, and the first Emirates Calculator strip stay unchanged (they continue to use the `href` + `link` mode).
- No layout, copy, or behaviour changes to other tools.

## Files
- Edited: `src/components/tools/ToolPrimitives.tsx`
- Edited: `src/components/tools/HRDiagnostic.tsx`
- Edited: `src/components/tools/EmiratesCalculator.tsx`
