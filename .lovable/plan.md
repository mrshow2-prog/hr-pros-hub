## Problem

On the Index page, the right column (Career Studio) currently right-aligns its inner blocks (eyebrow, title, lede, pills, CTA, stats). This is done with `md:ml-auto md:mr-0` on each inner wrapper, which pushes those `max-w-xl` / `max-w-md` blocks against the page's right edge.

The user wants the Career Studio content to start from the **left edge of its column** — with the same inset from that left edge as the HR Advisory content has from its own left edge. Visually the two columns should mirror their inner padding, both starting flush-left within their column.

## Fix

In `src/pages/Index.tsx`, for every inner wrapper inside the Career Studio (right column) section, replace the right-aligning `md:ml-auto md:mr-0` with the same left-aligning behavior used in HR Advisory (`md:mx-0`, which keeps the block flush to the column's left padding).

The outer column wrappers already use `md:px-10 lg:px-24` — identical to the left column — so removing the `ml-auto` is enough to make the inner edges align symmetrically.

### Specific edits in `src/pages/Index.tsx`

Six inner wrappers in the Career Studio block (lines ~138, 148, 159, 167, 183, 195):

- Eyebrow row (`flex ... text-paper/65 ...`): change `md:ml-auto md:mr-0` → `md:mx-0`
- Title `<h2>`: change `md:ml-auto md:mr-0` → `md:mx-0`
- Lede `<p>`: change `md:ml-auto md:mr-0` → `md:mx-0`
- Pills row: change `md:ml-auto md:mr-0` → `md:mx-0`
- CTA row: change `md:ml-auto md:mr-0` → `md:mx-0`
- Stat strip row: change `md:ml-auto md:mr-0` → `md:mx-0`

No other files, styling tokens, or layout structure change. Mobile layout is unaffected (those classes only apply at `md` and up).

## Result

Career Studio's eyebrow "02 · Career Studio", the "Your career, considered" headline, the lede paragraph, the Studio pills, the "Enter Career Studio" button, and the "11 · Markets · MENAT" stat all align to the left edge of the right column — mirroring HR Advisory's left-edge alignment in the left column, with matching inset from each column's outer edge.
