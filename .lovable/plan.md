All work is in the Vibrant variant of the Riyadh builder in `src/lib/cv/pdfme/exportModernPdfme.ts`. No other templates change, no data/logic changes.

## 1. Bold ring around the sidebar photo
In the photo+contact block (around line 1325) replace the bare `addImage` with a layered draw, only when `variant === "vibrant"`:
- A filled circle (PAPER color) sized `sz + 3mm`, then the photo image on top.
- Result: a ~1.5mm cream ring around the circular portrait, matching the thumbnail.

## 2. Icon squares next to every section heading (sidebar + main)
Today, both `headingDraw` (sidebar) and `mainHeading` (main column) render only a text label + thin underline. For `variant === "vibrant"`:
- Promote the existing accent square in `mainHeading` from a plain rect to a rect + small white icon (`svgToPngDataUrl` rendered with `color = "#ffffff"`), centered inside the square.
- Add the same treatment to `headingDraw` (sidebar) — currently it has no square at all; the sidebar already paints sienna so the square uses PAPER fill + sienna icon so it reads on the dark band.
- Add a `SECTION_ICONS` map (`summary→user`, `experience→briefcase`, `education→graduationCap`, `skills→sparkles`, `languages→languages`, `certifications→badgeCheck`, `achievements→award`, `custom→fileText`). Each entry is a 24×24 lucide path string added to the existing `ICON_SVGS` constant.
- Both `headingDraw` and `mainHeading` accept an optional `iconKey` argument; their callsites pass the matching key.

## 3. Name font / treatment
Only Roboto Regular + Bold are bundled (`src/lib/cv/pdfme/core.ts`), so a true serif swap requires shipping a new TTF. Two options:

- **A. Bundle a display serif** (preferred for fidelity): add `PlayfairDisplay-Bold.ttf` (or similar) under `src/lib/cv/pdfme/fonts/`, register it in `core.ts` as `FONT_DISPLAY`, plumb an optional `fontName` through `addText`, and use it for the Vibrant name only.
- **B. Stay on Roboto** but differentiate via size/spacing: bump the name from `24pt` to `30pt`, letter-spacing `-0.8`, lineHeight `1.0`. Cheaper but won't look serif.

Recommendation: option A. Will use Playfair Display Bold (OFL-licensed) unless you prefer a different face.

## 4. Hero-area decoration (top-right circle/check)
In the Vibrant main column, before the name is drawn, paint a small decorative motif in the top-right corner of the main content area:
- A filled sienna disc (~10mm) at `(MAIN_X + MAIN_W - 14, 10)`.
- A small white check glyph (existing svg-to-png path) centered inside.
This mirrors the circled checkmark in the thumbnail without affecting layout (it sits in the existing top padding).

## 5. Short accent rule under the job title
After the job-title line in the Vibrant main column (around line 1579), draw a 14mm × 0.7mm sienna line, then advance the cursor by ~3mm before the Profile section. Mirrors the thumbnail's tiny underline beneath "SENIOR HR BUSINESS PARTNER".

## 6. Increase spacing between main-column sections
The complaint is that subsequent section headers crowd the prior section's last line. Two adjustments, both Vibrant-only:
- In `mainHeading` (vibrant branch), bump the pre-heading `b.ensure(10)` to `b.ensure(14)` and add `b.cursorY += 4` before drawing.
- Drop the trailing `b.cursorY += 3.2` after the heading underline to `2.4` so the gap is *above* the heading, not below it. Net effect: clear breathing room between sections, summary unaffected (it has its own `spaceAfter: 5`).

## Out of scope (per your message)
- No contact section heading.
- No bullet dots beside job titles / no vertical experience timeline.
- No changes to Bold variant, other templates, docx, or thumbnails.

## Question before I build
For item 3, do you want me to bundle Playfair Display Bold for the Vibrant name (option A, closer to the thumbnail) or just enlarge Roboto (option B, no new asset)?