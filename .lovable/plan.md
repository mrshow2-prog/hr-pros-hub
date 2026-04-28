Add schema.org JSON-LD via the existing `SEO` component.

## Steps

1. **Edit `src/components/seo/SEO.tsx`**:
   - Add two exported constants: `LOCAL_BUSINESS_SCHEMA` (ProfessionalService) and `PERSON_SCHEMA` (Bishoy Mesiha) using the exact payloads supplied. The LocalBusiness `url` reuses the existing `BASE_URL` constant.
   - Add optional `jsonLd?: object[]` prop.
   - Auto-inject `LOCAL_BUSINESS_SCHEMA` on every render, then append any objects passed via `jsonLd`. Render each as `<script type="application/ld+json">` inside `<Helmet>`.

2. **Edit `src/pages/Business.tsx`** — pass `jsonLd={[PERSON_SCHEMA]}` to `<SEO />`.

3. **Edit `src/pages/Career.tsx`** — pass `jsonLd={[PERSON_SCHEMA]}` to `<SEO />`.

Pages `/`, `/tools`, `/profile` already render `<SEO />` and will pick up LocalBusiness automatically — no edits needed.

## Files

- Edited: `src/components/seo/SEO.tsx`
- Edited: `src/pages/Business.tsx`, `src/pages/Career.tsx`

## Notes

- One-line URL swap on custom-domain launch (the shared `BASE_URL` constant).
- NotFound intentionally untouched.
