## Plan

1. **Replace the broad font-width multipliers**
   - Remove the recent oversized global width multipliers that fixed overflow by over-reserving space.
   - This should eliminate the random white gaps after bold inline headings.

2. **Measure text with the actual active font**
   - Add a browser-side text measurement helper using `CanvasRenderingContext2D.measureText()` with the selected PDF font family, weight, size, and letter spacing.
   - Use it from the existing `textWidthMm`, `wrapLines`, and `textHeightMm` paths so wrapping decisions are based on the selected font rather than a Roboto-style character estimate.
   - Keep a conservative fallback only for environments where canvas is unavailable.

3. **Fix mixed bold/regular inline rows**
   - Update competency/category rows like the screenshot so the bold label width is measured with the bold display/body font only for the label, while the items are measured with the regular body font.
   - Avoid adding a large fixed safety buffer to the first text segment; use a small measured padding instead.

4. **Prevent single-line text boxes from re-wrapping**
   - For manually pre-wrapped lines, render each line in a box sized from its measured width plus a small padding, rather than using oversized boxes that can visually collide or create uneven flow.
   - Keep page-height calculations tied to the exact number of measured wrapped lines.

5. **Audit the affected templates**
   - Check the traditional/template areas that render skills/competencies, bullets, headings, contact rows, and date rows across Modern Sans, Classic Serif, and Editorial Display.
   - Verify that the displayed preview updates after font changes and that no obvious overflow or unnecessary gaps remain.