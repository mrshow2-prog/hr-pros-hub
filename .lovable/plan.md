
# Landing page overhaul — adapt competitor wins

The current `src/pages/Landing.tsx` is 40 lines: headline, sub, two buttons, footer. Both competitors win on the landing because they **show the product, prove trust, and surface pricing**. This plan adapts the highest-impact items from the earlier review while keeping the People Studio voice and the MENA/GCC wedge.

## Scope (in)

Rebuild `src/pages/Landing.tsx` into a sectioned page:

1. **Hero with live CV preview**
   - Left: existing headline + sub + CTAs, plus a new "ATS 92 · UAE-ready" badge row.
   - Right: floating CV card mock (real typography from the Dubai template, subtle shadow, slight tilt). Static SVG/JSX — no PDF render on landing, keeps it fast.
   - Below CTAs: small "Trusted by candidates hired at …" logo strip (greyscale wordmarks; placeholders until real logos are confirmed).

2. **Live activity strip** (borrowed from MyPerfectCV's counter)
   - One-line band under hero: "Built on People Studio HR's recruiting practice — thousands of CVs reviewed."
   - No fake live counter. Uses parent-brand trust instead of a number we can't verify.

3. **How it works — 3 steps**
   - Upload → Rewrite & score → Export ATS-ready PDF/DOCX.
   - Icon + 1-line copy each, in a 3-column grid.

4. **Template gallery**
   - 6 of the 7 templates as cards (Dubai, London, Zurich, Singapore, Berlin, Riyadh — Geneva linked from "See all").
   - Each card: template thumbnail (reuse the `Template*.tsx` selector visuals scaled down), name, one-line tag ("Most picked", "Recruiter favourite", etc.), hover lift.
   - CTA below: "Browse all templates →" deep-links into the builder template step.

5. **Why People Studio CV — GCC/MENA wedge**
   - 3-up feature grid: ATS-tuned for regional formats, UAE/GCC photo guidance, Arabic-name handling.
   - This is the differentiator neither competitor touches.

6. **Pricing strip**
   - Single transparent band: "Free draft · Pay once per export · No subscription" (final wording to confirm with you — see open question).
   - Money-back / refund link to existing `/refunds` route.

7. **FAQ**
   - 6 questions in an accordion (shadcn `Accordion`): ATS compatibility, file formats, data privacy, regional fit, refunds, cover letters.
   - SEO body content — directly addresses the "MyPerfectCV ranks because of content depth" gap.

8. **Final CTA band + existing `SiteFooter`**.

## Scope (out, deferred)

- New regional landing routes (`/cv-builder-uae`, `/cv-builder-gcc`). Mentioned as a follow-up; not in this pass.
- Real testimonial collection. Will use 3 short, generic, honestly-attributed quotes ("HR consultant, Dubai" etc.) as placeholders you can swap. Won't fabricate named people.
- Free TXT taster export.
- Mobile app badges.
- Any builder/template/PDF code — this is landing-only.

## Files

- **Edit** `src/pages/Landing.tsx` — full rebuild, sectioned.
- **New** `src/components/landing/HeroCvPreview.tsx` — static JSX CV card.
- **New** `src/components/landing/HowItWorks.tsx`
- **New** `src/components/landing/TemplateGallery.tsx` — reuses existing `Template*.tsx` thumbs from `src/components/cv-builder/templates/`.
- **New** `src/components/landing/Faq.tsx` — shadcn Accordion.
- **New** `src/components/landing/PricingStrip.tsx`
- **New** `src/components/landing/TrustStrip.tsx`
- Update `SEO` title/desc on `Landing.tsx` to include "UAE / GCC" keywords.

No changes to routing, auth, builder, PDF/DOCX, or backend.

## Design notes

Uses existing tokens only: `bg-paper`, `text-ink`, `text-sienna`, `font-syne`, `font-dm`, `tracking-wider2`. Sections separated by `border-ink/10` hairlines, generous vertical rhythm (`py-20 md:py-28`), single accent (sienna) consistent with current header CTA. No new colors, no gradient, no new fonts.

## Two quick questions before I build

1. **Pricing model wording** — what should the pricing strip actually say? "Free draft · Pay per export"? "$X one-time"? Subscription? I don't want to invent numbers.
2. **Logo strip** — okay to ship with 4–5 greyscale placeholder wordmarks ("Emirates", "ADNOC", "Majid Al Futtaim", "Etisalat", "Aramco") behind a small "Candidates we've helped land roles at" caption, or leave the strip out until you provide real ones?
