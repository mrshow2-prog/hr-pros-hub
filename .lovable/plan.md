# Interactive Web CV Showcase

Replace the current static Web CV section on the Career page with a three-column interactive layout: a left intro column, a center browser-framed live preview, and a right column of 3 hover-able package cards (Essential / Signature / Executive). Hovering or tapping a package card swaps the CV mockup shown inside the browser frame. Existing fonts (Fraunces serif + DM Sans) and existing `career-*` color tokens are preserved — no new fonts introduced.

## Layout

```text
┌──────────────────────────────────────────────────────────────────┐
│  Personal brand web-CV                                           │
│  ┌──────────┐  ┌──────────────────────┐  ┌────────────────────┐  │
│  │ EYEBROW  │  │ ●●●  url/sarah-...★★★│  │ Essential   ★★★    │  │
│  │ Headline │  │ ┌──────────────────┐ │  │ desc...            │  │
│  │ Subline  │  │ │  CV PREVIEW      │ │  ├────────────────────┤  │
│  │          │  │ │  (swaps on hover)│ │  │ Signature  ★★★★    │  │
│  │ [CTA →]  │  │ │                  │ │  │ desc...            │  │
│  │          │  │ └──────────────────┘ │  ├────────────────────┤  │
│  │          │  │                      │  │ Executive ★★★★★ ◀  │  │
│  │          │  └──────────────────────┘  │ desc...            │  │
│  └──────────┘                            └────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

Mobile (< lg): stacks to a single column — copy → browser preview → packages.

## Behaviour

1. **Default state**: Executive package is active, Executive CV mockup visible, URL bar shows `peoplestudio.ae/cv/sarah-executive ★★★★★`.
2. **Hover/tap a package card** (desktop hover, mobile tap): the active state moves to that card; the CV mockup inside the browser frame cross-fades (200ms opacity) to the matching design; URL slug + star count update.
3. **Mouse leaves the package list**: stays on whichever was last hovered (sticky), so users can read the preview without it snapping back.
4. **Active card styling**: subtle background tint using `career-sky/10`, left ring/border in `career-sky/40`, stars become fully opaque + colored, "Get started →" CTA reveals.
5. **Inactive cards**: muted text, faded stars, hidden CTA — all reveal on hover.
6. **Click on any package card or its CTA**: smooth-scrolls to the existing contact form (same behaviour as service cards).
7. **Existing left CTA "View sample CV page"** keeps linking to `/profile`.

## CV preview designs (3 mockups)

Each mockup is a self-contained scaled-down "page" rendered inside the browser viewport. Built with existing fonts (`font-serif` = Fraunces, `font-dm` = DM Sans) and career palette only — no Sienna/Olive/Blush colors from the upload, mapped instead to:
- paper background → `career-light` / off-white
- accent (was sienna/blush) → `career-blue`
- muted text → `career-deep/60`

**Essential** — single-page CV: clay-tinted hero with photo + name + title + contact row; Profile paragraph; Career Highlights list (4 rows); Education line.

**Signature** — richer profile: olive-tinted hero with portrait, eyebrow, name, title; 4-up metrics strip (Years / Markets / C-suite / PHRi); narrow scrolling ticker of expertise tags; two-column body with Narrative + Career Timeline (with dot-and-line) on the left, Skill bars + Contact card on the right; "Download PDF" pill.

**Executive** — personal-brand site: dark nav strip with name watermark + section links; "Latest" press ticker; large hero with display name (italic accent on surname) + positioning line + portrait; quote band with attribution; two-column body — Executive bio + Speaking/Thought-leadership list on the left, Media tags + "Work with Sarah" contact card with "Book a conversation" button on the right.

All three use the existing portrait `PHOTO_URL` from `src/data/profile.ts`.

The mockups are rendered at a fixed design width (~720px) and CSS-scaled (`transform: scale(...)`) to fit the browser viewport area, so they read like real screenshots regardless of column width. Reuse the previous `sampleWebCvPreview` import is no longer needed and gets removed.

## Browser frame

- Dark chrome bar (`career-deep`), three traffic-light dots (red / amber / green), pill-shaped URL bar showing `peoplestudio.ae/cv/<slug>` with a trailing star rating that matches the active tier.
- Viewport area is a fixed-aspect container (~`aspect-[4/5]` on desktop) with `overflow: hidden`, paper-cream background, and the three CV previews absolutely positioned inside, cross-fading on tier change.
- Outer frame: rounded corners, subtle drop shadow + 1px hairline ring in `career-sky/15` so it lifts off the dark `career-deep` section background.

## Package cards

- Stacked vertically, 2px gap between cards.
- Each card: package name in italic Fraunces, star row (3 / 4 / 5 lit stars in `career-sky`), 2-line description in DM Sans, hidden "Get started →" CTA that reveals on hover/active.
- Hover/active treatment uses opacity transitions on stars + description for the same "lights up on focus" feel as the reference.

## Files to edit

- **`src/pages/Career.tsx`** — Replace the existing `#web-cv` section markup. Remove the `sampleWebCvPreview` import and the `webCvLevels` array (no longer needed in this shape). Insert a new `<WebCvShowcase />` section component (defined in the same file or a new file).
- **New component `src/components/career/WebCvShowcase.tsx`** — Encapsulates: state for active tier, three CV mockup sub-components (`EssentialCv`, `SignatureCv`, `ExecutiveCv`), browser frame, package list, and the scroll-to-contact handler. Pure presentational, no new dependencies.
- **No changes** to fonts, tailwind config, color tokens, or any other section.

## Out of scope (intentionally skipped from the reference)

- The "AI chat widget" floating bubble inside the Executive preview.
- Counting-up number animations and per-element scroll-reveal on the Signature/Executive previews (kept simple — preview just swaps in).
- The marquee tickers inside the CV mockups will be static text strips (no animation) to keep the section calm and the implementation lean. Can be animated in a follow-up if desired.
