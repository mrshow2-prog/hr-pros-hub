## Status check of the three SEO items

### 1. OG titles — PARTIALLY DONE
The `SEO` component already supports a per-page `ogTitle` prop and falls back to `title` when not provided. Since each page passes a unique `title`, the og:title is already unique per page — not the generic site title.

- `/business` → og:title = page title ✓
- `/career` → og:title = page title ✓
- `/` → og:title = page title ✓
- `/profile` → og:title = page title ✓
- `/tools` → explicitly overrides `ogTitle` to "Free HR Tools UAE · Emiratisation Calculator & HR Diagnostic — People.Studio" (different from spec's request to match the title tag exactly)

**Action needed:** Decide whether to keep the Tools `ogTitle` override (current shorter variant) or replace it to exactly match the title tag per the new spec.

### 2. Meta descriptions — DONE
- `/career` description already matches the requested copy (verbatim, "Written by an HR director who has made thousands of hiring decisions.").
- `/tools` description already reads "Free UAE HR tools — no signup required. HR health diagnostic, Emiratisation fine calculator, AI policy generator, and job description builder. Built for UAE and GCC businesses." — matches except "JD builder" is written out as "job description builder".

**Action needed:** None functionally; optionally tighten "job description builder" → "JD builder" if you want exact match.

### 3. Copyright year — NOT DONE on homepage; DONE on career
- `src/pages/Career.tsx` footer already uses `© {new Date().getFullYear()} People Studio — Bishoy Mesiha Advisory. Dubai, UAE.` ✓
- `src/pages/Index.tsx` (line 247) still shows static `© People.Studio` with no year. ✗

**Action needed:** Update Index footer to `© {new Date().getFullYear()} People.Studio · Dubai, UAE`.

---

## Proposed fixes

1. **`src/pages/Index.tsx` (line 247)** — replace `© People.Studio` with `© {new Date().getFullYear()} People.Studio · Dubai, UAE`.

2. **`src/pages/Tools.tsx` (line 28)** — remove the `ogTitle` override so og:title falls back to the full title tag (matches the spec exactly), OR update it to the full title string. Recommend removing the override for consistency with other pages.

3. **`src/pages/Tools.tsx` (line 26)** — optionally change "job description builder" → "JD builder" to match the spec verbatim.

No other pages need changes — all other og:titles and descriptions already match the spec.