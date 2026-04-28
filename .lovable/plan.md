# Career hero — coded background cards

Replace the three placeholder floating shapes currently sitting behind the hero text with **two** purpose-built decorative cards built entirely in CSS/SVG. Keep the dot grid texture and SVG path lines exactly as they are.

## What changes

In `src/pages/Career.tsx`, inside the hero `<section>` (lines 328–338), the wrapper div containing the three placeholder cards keeps the texture grid and SVG paths but the three card divs (current lines 329–331) are replaced with two new card components.

Everything else — headline, subline, CTAs, stats, nav, marquee, all other sections — is untouched.

## The two cards

**Card 1 — "The old way"** (back, left-of-centre, lifeless)
- ~260×340 px, rotated −6°, positioned slightly left and slightly lower than Card 2, behind it (lower z-index)
- Surface: warm light gray `#E8E3DB` at ~28% opacity
- Header band: ~40px tall across the top, slightly darker gray (~15% opacity)
- 9 horizontal "text line" bars below: 4px tall, 2px radius, ~20% opacity warm gray, evenly spaced, widths varied between 60% and 95% of card width (e.g. 92, 78, 88, 65, 95, 70, 84, 60, 76 %) so it feels organic
- No shadow, no border glow — flat and forgettable

**Card 2 — "The new way"** (front, right-of-centre, alive)
- ~300×380 px, rotated +2°, positioned right-of-centre and slightly higher, in front of Card 1 (higher z-index)
- Surface: deep navy `#0D1B26` at ~60% opacity (uses `hsl(var(--career-deep)/0.6)` to stay on-token)
- Box shadow: `0 20px 60px rgba(0,0,0,0.3)` — gives it dimension
- Contents:
  - **Profile circle**: 48px, ring-only border in `career-sky` at ~30% opacity, no fill, near top-left
  - **Name bar**: ~70% width × 12px, radius 2, cream/`paper` at 35% opacity
  - **Title bar**: ~45% width × 6px, `paper` at 20% opacity, just below name bar
  - **Concentric arcs** (lower-right): inline SVG, three quarter-circles (radii ~40, 60, 80), stroke-only, `career-sky` at 10–15% opacity each — echoes the Signature CV orbital motif
  - **Two stat blocks** near bottom: each ~60×40, slightly lighter navy than the card surface (e.g. `paper/8`), arranged side-by-side, no labels

## Entrance animation

- Both cards: fade in + translateY 12px → 0, **0.9s ease-out**, runs once
- Card 1 delay 0.4s, Card 2 delay 0.7s
- No looping animation after entrance

Implemented with a small inline `@keyframes` block in a `<style>` tag inside the hero section (or via a Tailwind arbitrary `animate-[...]` utility referencing existing `fade-up` keyframes — `fade-up` already exists in `tailwind.config.ts` with the right shape, so I'll use `animate-[fade-up_0.9s_ease-out_0.4s_both]` and `...0.7s_both` to avoid touching the config).

## Responsive

- Wrap the cards in a container with `hidden md:block` so they disappear entirely below 768px
- The hero text falls back to the existing solid background (gradient + dot grid stay; cards just don't render)

## Preserved

- The dot grid mask overlay (current line 332) — kept
- The SVG dashed path lines (current lines 333–337) — kept
- Hero text, CTAs, stats, nav, marquee, every other section — unchanged

## Files

- `src/pages/Career.tsx` — edit the hero section's decorative-cards container only (lines 328–338); replace the three card divs with the two new cards described above.
