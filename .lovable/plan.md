## Fix Compact DOCX download

### Diagnosis

- **PDF "print":** intentional in the last change — Compact PDF now opens the browser print dialog (hidden iframe → `window.print()`) so the user picks "Save as PDF". You asked to leave this for now, so no change.
- **DOCX failure:** `html-docx-js@0.3.1` is a CJS Node library. Under Vite's browser bundler, the dynamic `import("html-docx-js/dist/html-docx")` resolves to a module whose `asBlob` either throws or returns `undefined`, so nothing downloads.

### Fix

1. **Swap library** — remove `html-docx-js`, add `html-docx-js-typed` (browser-friendly fork with TS types).
2. **Update `src/lib/cv/exportCompactDocx.ts`** — replace the dynamic CJS import with a normal ESM import and call `asBlob(html, { orientation: "portrait", margins: {...} })`. Keep the rest (photo → data URL, `renderCompactHtml(cv, photo, "docx")`, `saveAs`) unchanged.
3. **Verify the docx-mode HTML is Word-friendly** — re-check `compact.ts` `mode === "docx"` branches to make sure we're not emitting anything `html-docx-js-typed` chokes on:
   - Header already uses `<table>` (good).
   - Page-1 body still uses a `<table>` with `td.page1-main` / `td.page1-sidebar` (good).
   - Sidebar border uses solid hex (good).
   - Bullets are inline `•` (good).
   - One concern: the stylesheet still contains `display: flex` rules inside the shared CSS even in docx mode (they're harmless because the docx branch uses tables, but Word's HTML importer sometimes complains). Drop the flex/`gap` declarations from the stylesheet when `mode === "docx"` to be safe.
4. **Smoke test in the preview** — open Step 7, click "Download Word", confirm a `.docx` file downloads and opens in Word/Google Docs with: header table (photo left, contact right), 2-column page-1 body, single-column continuation, bullets, and the sidebar dividing line.

### Files touched
- `package.json` / `bun.lock` — remove `html-docx-js`, add `html-docx-js-typed`
- `src/lib/cv/exportCompactDocx.ts` — switch import + call
- `src/lib/cv/templates/compact.ts` — strip flex rules from the docx stylesheet branch

### Out of scope
- PDF export behavior (keeping browser print dialog per your call).
- Other 4 templates (still on legacy react-pdf + docx-js).
