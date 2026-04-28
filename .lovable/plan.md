Add unique per-route SEO metadata using `react-helmet-async`.

## Steps

1. Install `react-helmet-async` and wrap the app in `<HelmetProvider>` in `src/App.tsx`.
2. Create `src/components/seo/SEO.tsx` — reusable component with `title`, `description`, `path` props. Renders `<title>`, `<meta name="description">`, OG + Twitter title/description/url, and `<link rel="canonical">`. Uses a single `BASE_URL` constant set to `https://people-studio.lovable.app` (easy one-line swap when custom domain lands).
3. Add `<SEO ... />` at the top of each page with the exact copy supplied:
   - **/** — "People.Studio — HR Advisory & Career Studio · UAE & GCC"
   - **/business** — "HR Advisory UAE · Emiratisation, Compliance & Fractional HR — People.Studio"
   - **/career** — "Career Studio UAE · CV, LinkedIn & Career Coaching — People.Studio"
   - **/tools** — "Free HR Tools UAE · Diagnostic, Emiratisation Calculator & Policy Generator — People.Studio"
   - **/profile** — "Signature CV Sample · People.Studio Career Studio"
4. Trim `index.html` to a neutral fallback title/description (Helmet overrides per route).

NotFound is intentionally skipped (404s should not be indexed).

## Files

- New: `src/components/seo/SEO.tsx`
- Edited: `src/App.tsx`, `src/pages/Index.tsx`, `src/pages/Business.tsx`, `src/pages/Career.tsx`, `src/pages/Tools.tsx`, `src/pages/Profile.tsx`, `index.html`
- Dependency: `react-helmet-async`
