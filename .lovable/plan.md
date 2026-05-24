## Goal

Replace the three drifting Compact renderers (Tailwind preview + react-pdf + docx-js) with **one HTML template** that produces:
1. The on-screen preview (iframe)
2. The PDF (browser-native print — pixel-perfect, no infra)
3. The DOCX (html-to-docx with a slightly simplified variant)

The uploaded `cv-template-compact-print_2.html` becomes the canonical layout.

---

## Architecture

```text
GeneratedCV  ──►  renderCompactHtml(cv, photoDataUrl, mode)
                         │
        ┌────────────────┼────────────────┐
        ▼                ▼                ▼
   mode='preview'    mode='pdf'      mode='docx'
   (iframe in       (hidden iframe   (fed to
    StepTemplate)    → window.print)  html-to-docx)
```

One file owns the layout. Three thin adapters consume it.

---

## Files to create

1. **`src/lib/cv/templates/compact.ts`** — pure renderer
   - `renderCompactHtml(cv, photoDataUrl, mode: 'preview' | 'pdf' | 'docx'): string`
   - Returns a complete `<!DOCTYPE html>` document.
   - Maps `GeneratedCV` fields into the uploaded HTML structure:
     - `contact` → header (name, jobTitle, location, phone, email, linkedinUrl, photo)
     - `summary` → `.cv-summary`
     - `experience[]` → `.cv-job` blocks (role, period, company · location, first bullet as `.cv-job-description` optional, rest as `<ul>`)
     - `skills[]` → `.cv-skill-item` list
     - `languages[]` → `.cv-language-item` list
     - `education[]` → `.cv-edu-item` blocks
   - Honors `hiddenSections` (skip the section entirely).
   - **Two-column split heuristic**: estimate sidebar height from `skills.length * 18 + languages.length * 28 + ~140` pts; fill left cell with Summary + experiences until estimated height matches. Remainder goes into `.continuation`.
   - **Mode differences**:
     - `'pdf'` / `'preview'`: original CSS (flex header, `::before` bullets, rgba border).
     - `'docx'`: header becomes a 2-cell `<table>`, `::before` bullets replaced with inline `"• "` in HTML, all `rgba(...)` replaced with solid hex (`#C8C0B8`), `display:flex` everywhere replaced with table cells, image `width`/`height` attributes set explicitly.
   - Self-hosted font stack: `Calibri, "Carlito", Arial, sans-serif` (Carlito is the metric-compatible open replacement; no external font fetch needed — fallback to Arial is acceptable since the document is metric-stable).
   - Certifications: not in `GeneratedCV` schema yet — omit for this pilot.

2. **`src/lib/cv/exportCompactPdf.ts`** — browser-print PDF
   - Creates hidden `<iframe>`, writes the `'pdf'` HTML into it, waits for `load` + photo image `decode()`, calls `iframe.contentWindow.print()`.
   - User sees the browser print dialog → "Save as PDF" (Chrome default destination).
   - This is the lowest-friction high-fidelity path; no Puppeteer infra, no API key. (Trade-off documented below.)

3. **`src/lib/cv/exportCompactDocx.ts`** — DOCX via html-to-docx
   - `bun add html-to-docx-js-typed` (active TS-friendly fork) — or `html-to-docx` (Node) called from browser via its UMD build.
   - Feeds the `'docx'`-mode HTML, returns a Blob, `saveAs(...)`.

## Files to edit

4. **`src/components/cv-builder/templates/TemplateCompact.tsx`**
   - Replace current JSX with a sandboxed `<iframe srcDoc={renderCompactHtml(cv, photoDataUrl, 'preview')} />` scaled to fit the preview pane (`transform: scale(...)`).
   - This guarantees preview == export.

5. **`src/lib/cvExport.ts`**
   - When `template === 'compact'`, route `exportCVToPdf` → `exportCompactPdf`, `exportCVToDocx` → `exportCompactDocx`.
   - Other templates continue using existing react-pdf + docx-js paths untouched.

6. **`src/components/cv-builder/pdf/PdfRouter.tsx`** — unchanged for non-compact; compact branch becomes unused but kept for fallback (no deletions in this pass).

---

## PDF approach trade-off (please confirm)

| Option | Fidelity | Friction | Infra |
|---|---|---|---|
| **A. Browser print (proposed)** | Pixel-perfect, real selectable text, ATS-friendly | User clicks "Save" in print dialog | None |
| B. Server-side Puppeteer edge fn | Pixel-perfect, silent download | Need to ship Puppeteer to Deno edge runtime — fragile | Heavy |
| C. External HTML→PDF API (PDFShift, Doppio) | Pixel-perfect, silent download | Need API key + secret | Paid service |
| D. Client-side `html2pdf.js` (rasterized) | Blurry, not ATS-friendly | Silent download | None |

**Recommendation: A** for this pilot. If you later want silent downloads, we add C as a second step (5 min change once the key is in).

---

## Out of scope (intentionally)

- Other 4 templates — they stay on the current react-pdf + docx-js renderers until the Compact pilot is validated.
- Certifications field — needs a context/schema change; can come after.
- Adding a "Compact (continued)" section title automatically — current renderer just continues the section header naturally.

---

## Validation checklist after build

1. Preview iframe in Step 6 renders identically to the uploaded screenshot for the seeded Abanoub CV.
2. "Download PDF" → print dialog → resulting PDF matches preview exactly (header flex layout, sidebar border, sienna accents, two-column page 1, full-width continuation).
3. "Download Word" → DOCX opens in Word with: 2-column header table, full-width body table for page 1 (Summary+jobs left, Skills+Languages right), single-column continuation, solid hex colors, inline bullets, no missing elements.
4. Hiding sections in earlier steps removes them from all three outputs.
