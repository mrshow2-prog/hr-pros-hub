## 1. Google Search Console — verify domain + submit sitemap

The verification meta tag is already in `index.html`. The custom domain (`www.peoplestudiohr.com`) needs to be live with that tag before Google will verify.

Steps after you confirm:
1. You publish the project (so the verification tag goes live on the custom domain).
2. I call Google Search Console: verify ownership of `https://www.peoplestudiohr.com/`.
3. Register the property and submit `https://www.peoplestudiohr.com/sitemap.xml`.
4. Mark the GSC finding fixed.

No code changes needed for this step beyond what's already in.

## 2. Lighthouse performance — LCP

The likely LCP element on the Business page is the hero kintsugi image. The Index hero is text-based (already good).

Changes:
- `src/components/business/BusinessHero.tsx`: add `fetchpriority="high"` and `loading="eager"` to the hero `<img>`, keep explicit width/height (already there).
- `index.html`: add `<link rel="preload" as="image" href="/src/assets/business-hero-kintsugi.jpg" fetchpriority="high">` — actually skip this, since the asset is hashed by Vite. Use the in-component fetchpriority instead.
- Confirm Google Fonts URLs use `&display=swap` — they already do, no change needed.

## 3. Lighthouse accessibility — contrast

Audit and bump low-opacity text that fails 4.5:1 on its background. Worst offenders found:
- `text-ink/40`, `text-ink/45`, `text-ink/50`, `text-ink/55` on `bg-paper` (cream) — many spots in `BusinessNav`, `BusinessHero` stat labels, `BusinessFreeToolsPromo`, `BusinessRetainers`, `WebCvShowcase`, `Index.tsx` utility nav.
- `text-paper/45`, `text-paper/50`, `text-paper/55` on `bg-olive` — Index utility nav, WebCvShowcase dark panels.
- `placeholder:text-ink/35` on the CV chat input.

Fix approach: raise minimums to `/60` on light backgrounds and `/65` on the olive background for body/utility text. Keep tracking-widest uppercase eyebrows at `/55` only where the size is ≥12px (passes large-text 3:1). Specific files I'll touch:
- `src/pages/Index.tsx` (header/nav links, stat sublabels)
- `src/components/business/BusinessNav.tsx`
- `src/components/business/BusinessHero.tsx` (stat label)
- `src/components/business/BusinessFreeToolsPromo.tsx`
- `src/components/business/BusinessRetainers.tsx`
- `src/components/business/BusinessRealCost.tsx`
- `src/components/career/WebCvShowcase.tsx` (only the small text-ink/55 body lines, not the large display ones)

I won't touch shadcn primitives or anywhere the visual tone is intentional and already large enough.

## 4. Mark findings fixed + prompt republish

After the edits:
- Mark `lighthouse:lighthouse_performance` and `lighthouse:lighthouse_accessibility` fixed.
- Mark `http:robots`, `http:sitemap`, `gsc:gsc` per your instructions (keep custom domain; GSC handled in step 1).
- Surface the publish dialog so the changes hit the live site (Lighthouse only re-scores published code).

## Technical notes
- Sitemap and robots stay on `www.peoplestudiohr.com` — confirmed by you.
- Verification token already in `index.html` (line 5); only republish needed before I call the verification endpoint.
- No new dependencies.