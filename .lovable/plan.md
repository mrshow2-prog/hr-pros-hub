Add the missing Open Graph and Twitter Card meta tags to the shared `SEO` component so every route emits a complete rich-link preview.

## What's already in place
- `src/components/seo/SEO.tsx` already injects per-route `og:title`, `og:description`, `og:url`, `twitter:title`, `twitter:description`, plus `<title>`, description and canonical.
- All five pages (Index, Business, Career, Tools, Profile) already render `<SEO />` with their unique title + description.
- `index.html` carries `og:image` / `twitter:image` pointing at a Lovable-hosted placeholder card and `twitter:site="@Lovable"`.

## What's missing on per-route renders
- `og:type`, `og:site_name`, `og:locale`
- `twitter:card`, `twitter:site` (with the correct `@peoplestudioae` handle)
- `og:image`, `twitter:image` (per-route, so they survive when React Helmet rewrites the head)

## Changes

### 1. `src/components/seo/SEO.tsx`
- Add a `DEFAULT_OG_IMAGE` constant near `BASE_URL`. Use the existing placeholder URL already in `index.html` (`https://storage.googleapis.com/.../c1c94bce-cab3-4e13-9216-06ef8f51ff27`) so previews keep working until a proper 1200×630 brand card is designed. Add a `// TODO: replace with branded 1200×630 OG card` comment.
- Extend `SEOProps` with an optional `image?: string` prop so individual pages can override later (e.g. Profile/Career hero).
- Inside the `<Helmet>` block, add:
  - `<meta property="og:type" content="website" />`
  - `<meta property="og:site_name" content="People.Studio" />`
  - `<meta property="og:locale" content="en_AE" />`
  - `<meta property="og:image" content={image ?? DEFAULT_OG_IMAGE} />`
  - `<meta name="twitter:card" content="summary_large_image" />`
  - `<meta name="twitter:site" content="@peoplestudioae" />`
  - `<meta name="twitter:image" content={image ?? DEFAULT_OG_IMAGE} />`

### 2. `index.html`
- Update the static `twitter:site` from `@Lovable` to `@peoplestudioae` so the initial server-rendered HTML matches the runtime tags (avoids stale value being scraped before Helmet hydrates).
- Leave the existing static `og:image` / `twitter:image` placeholder URLs as-is — they act as the same fallback the component now references.

No page-level changes are needed: every route already calls `<SEO />` with the correct title + description, and the shared component will now emit the full OG/Twitter set automatically.

## Files
- Edited: `src/components/seo/SEO.tsx`
- Edited: `index.html`
