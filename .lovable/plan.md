## Problem
The role/period row (`periodRow` in `src/lib/cv/pdfme/exportModernPdfme.ts`) still relies on `textHeightMm()` to estimate the role title's height, then advances `cursorY` by that estimate while letting pdfme do its own internal wrapping in the same text block. This is the exact same instability we just fixed for bullets: when the width estimator predicts a wrap that pdfme doesn't render (or vice versa), we get either an "empty line" between the role and the company line, or two roles overlap.

Because role titles are short, the swing usually lands on the over-estimate side → a phantom blank line below some titles and not others.

## Fix
Apply the same deterministic line-by-line technique to `periodRow`:

1. Pre-wrap the role text with `wrapLines(left, leftW, leftFs, { bold })`.
2. Pre-wrap the right-side period with `wrapLines(right, periodW, rightFs)` (almost always 1 line).
3. Take `lineCount = max(leftLines, rightLines)`.
4. `lineStep = ptToMm(leftFs) * 1.25`; `blockH = lineCount * lineStep`.
5. `b.ensure(blockH)`; render each line as its own single-line `addText` at exact Y = `py + i * lineStep` (left side iterates left lines, right side renders only on its first line, right-aligned).
6. Advance `b.cursorY = py + blockH + (opts.spaceAfter ?? 0.5)`.

This guarantees the company line that follows always sits exactly one consistent gap below the role text — no phantom blank line, no overlap — regardless of role length.

No other files change. `spaceAfter` defaults preserved per call site so per-template spacing stays identical for the "normal" 1-line case.

## Validation
- Lint the edited file.
- Visually confirm in the Riyadh / Geneva / Dubai exports that every job has identical role→company spacing, including for long titles like "Senior Cross-Cultural Business Development Manager".