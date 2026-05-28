## Fix wrapped lines of competency clusters in PDF

**Problem:** In the PDF exports, when a cluster's items overflow to a second line, the wrapped line currently starts at the same indented x as the items (right of the title), instead of returning to the left margin.

**Cause:** `inlineCluster()` in `src/lib/cv/pdfme/exportModernPdfme.ts` pre-wraps the items text using a single narrow width (`contentW - titleW`) and renders every wrapped line at the indented `itemsX`. So lines 2+ stay indented.

**Fix:** Make `inlineCluster()` use two wrap widths:
1. Take the first visual line at width `contentW - titleW` (rendered at `x = margin + titleW`, next to the title).
2. Take the remainder of the items string and re-wrap it at the full `contentW`, rendering each subsequent line at `x = margin` with full width.

Height becomes `(1 + remainderLines.length) * lineStep`. Page-break `ensure()` uses that height. No changes needed to the React previews — inline `<span>` already wraps to the left edge of the `<p>` naturally.

**Files changed:**
- `src/lib/cv/pdfme/exportModernPdfme.ts` — update `inlineCluster()` only.