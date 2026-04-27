# Index Page — Layout & Alignment Refit

Refactor `src/pages/Index.tsx` so the two halves (HR Advisory / Career Studio) read as a single, perfectly aligned spread that fills exactly one viewport on desktop and tablet, and stacks vertically (scrollable) on mobile.

---

## 1. Row-aligned two-column layout (desktop & tablet)

Replace the current "each side is its own flex column with min-heights" approach with a **shared CSS grid of named rows** that both columns participate in. Each row is sized so its tallest cell governs both sides — guaranteeing the eyebrow, title, paragraph, pills, CTAs, and bottom stat strip line up exactly across the divider.

Structure (conceptual):

```text
┌──────────────── header (absolute, ~88px) ───────────────┐
│ HR Advisory                  │  Career Studio            │
├──────────────────────────────┼──────────────────────────-┤
│ 01 · HR Advisory             │  02 · Career Studio       │  ← eyebrow row
│ Practical HR, honestly said. │  Your career, considered. │  ← title row
│ For founders, GMs…           │  For HR and people pros…  │  ← lede row
│ [pills]                      │  [pills]                  │  ← pills row
│ [Enter HR Advisory] [Tools]  │  [Enter Career Studio]    │  ← CTA row
│ 16 · Years exec HR           │  11 · Markets MENAT       │  ← stat row
└──────────── footer (sticky to bottom) ──────────────────┘
```

Implementation approach:

- Convert `<main>` to a single `grid` with `grid-template-columns: 1fr 1fr` and `grid-template-rows: auto auto auto auto auto auto` on `md+`.
- Each side becomes 6 grid cells (eyebrow, title, lede, pills, CTAs, stat), placed in matching rows via `grid-row` so heights auto-equalise.
- Background colors (`bg-paper` left, `bg-olive` right) are applied via two absolutely positioned column backdrops or via the cells themselves spanning all rows with `grid-column`.
- Drop the current `min-h-[12rem]`, `min-h-[8rem]`, `min-h-[8.5rem]` ad-hoc spacers — alignment is now structural, not numeric.
- Keep the centre divider and the rotating "Choose one · or the other" badge centred on the column gutter.

---

## 2. Replace "See services" with a Free Tools CTA

In the HR Advisory CTA row:

- Remove `<Link to="/business#services">See services</Link>`.
- Replace with `<Link to="/tools">Free HR Business Tools →</Link>` styled as the existing secondary text-link (underline-on-hover, `text-ink/60`).
- Career Studio side keeps its single `Enter Career Studio` button (no secondary link), so the CTA row aligns by using the primary button as the row's height anchor.

---

## 3. Remove footer Free Tools link

In the `<footer>`:

- Remove the `<div className="flex gap-5"><Link to="/tools">Free Tools</Link></div>` block entirely.
- Keep `© People.Studio` and re-balance the footer to a single justified line (e.g. left: small wordmark or empty spacer, right: copyright) so it still reads as a finished bar.

---

## 4. One-viewport on desktop/tablet, stacked & scrollable on mobile

Page-level behaviour:

- Wrap the page in `h-[100svh] overflow-hidden` on `md+` so the split spread is locked to the viewport with no scroll.
- Header becomes `absolute top-0` (already is), footer becomes `absolute bottom-0` (already is) — `<main>` fills the space between with `h-full` and internal padding tuned so the 6 rows fit within the available height at common tablet/desktop sizes (down to ~768×1024 portrait tablet and ~1024×768 landscape).
- Reduce vertical padding (`pt-28 pb-24` → `pt-24 pb-20` or use `clamp()` based padding) and tighten row gaps so content fits without clipping at 768px tall viewports.
- Long content safety: cap the lede paragraph and pills row with `overflow-hidden` is not needed if copy is fixed; current copy fits, but we'll verify at 1280×720 and 1024×768.

Mobile behaviour (`< md`, ~767px and below, including portrait phones):

- Switch to single column: `grid-cols-1`, remove `h-[100svh] overflow-hidden`, allow normal page scroll.
- HR Advisory section renders first (full viewport min-height), Career Studio stacks below it.
- Footer becomes a normal in-flow element at the very bottom (not absolute) on mobile, so it appears after Career Studio when the user scrolls to the end.
- Centre divider and rotating badge are hidden on mobile (`hidden md:block` already in place — keep).

---

## Technical notes

- File touched: `src/pages/Index.tsx` only. No data or routing changes.
- Use Tailwind's `md:` breakpoint (768px) as the desktop/tablet vs mobile boundary, matching the existing `useIsMobile` hook convention.
- Use `100svh` (small viewport height) rather than `100vh` to avoid mobile browser chrome issues — already used for the section heights and will be reused for the page wrapper.
- Footer positioning: `md:absolute md:bottom-0 md:inset-x-0` on desktop/tablet; default static flow on mobile.
- Header: stays `absolute top-0` on all breakpoints (unchanged).
- The rotating "Choose one · or the other" SVG badge: keep as-is, hidden on mobile.
- No changes to `BusinessFreeToolsPromo`, `business.ts`, or any other component.

## Verification checklist

After implementation, visually confirm:
- 1920×1080, 1366×768, 1280×720, 1024×768 (landscape tablet), 820×1180 (portrait tablet): no scroll, all 6 rows aligned across the divider, footer pinned to bottom.
- 414×896 / 390×844 (portrait phone): HR Advisory full-screen on top, Career Studio below, footer at end of scroll, no horizontal overflow.
- "Free HR Business Tools" link navigates to `/tools`.
- Footer no longer contains a Free Tools link.
