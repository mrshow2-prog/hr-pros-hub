## Goal

Stop iframing the static profile pages. Serve them directly as top-level HTML so URLs are clean, navigation works correctly, SEO is intact, and the pattern scales to hundreds/thousands of profiles.

## Current state

- `public/Chef-M-Khalil/index.html` and `public/Bishoy-Mesiha/index.html` are full standalone HTML pages with their own assets.
- `src/App.tsx` defines four React routes (`/Chef-M-Khalil`, `/chef-m-khalil`, `/Bishoy-Mesiha`, `/bishoy-mesiha`) that render those files inside a full-viewport `<iframe>`.
- Internal links inside the static HTML already use root-relative paths (`/career`, `#contact`, etc.), so they don't depend on the iframe.

## Changes

### 1. Rename profile folders to lowercase slugs

So the URL path matches the file path and Lovable's static hosting serves the file directly.

- `public/Chef-M-Khalil/` → `public/chef-m-khalil/`
- `public/Bishoy-Mesiha/` → `public/bishoy-mesiha/`

All asset references inside each `index.html` are relative (`Chef-Mohamed-Khalil-CV.pdf`, `dishes/...`, `assets/...`) so they keep working after the rename. No edits to the HTML are needed.

### 2. Remove the four iframe routes from `src/App.tsx`

Delete the `StaticProfileFrame` component and the four `<Route>` entries for the profiles. Once the folders exist at the matching path, `https://site/chef-m-khalil/` is served directly by the host as static HTML — no React involvement.

### 3. Establish the convention for future profiles

Going forward, each new profile is just a folder dropped into `public/`:

```text
public/
  chef-m-khalil/
    index.html
    assets...
  bishoy-mesiha/
    index.html
    assets...
  jane-doe/
    index.html
    assets...
```

No code change required to add a new profile. This is what makes it scale to thousands.

## Notes / tradeoffs to confirm after deploy

- **Trailing slash**: `/<slug>/` will reliably serve `index.html`. `/<slug>` (no slash) usually also works on Lovable hosting via auto-redirect, but worth a quick check after deploy. If it 404s, link to the trailing-slash form everywhere.
- **Old capitalized URLs** (`/Chef-M-Khalil`) will stop working. If any external link or shared URL uses the capitalized form, we'd need to either keep duplicate folders or add a small redirect page. Let me know if that matters.
- **Shared header/logo across static pages**: each profile page currently maintains its own header HTML. At scale, you'll want a small build-time template (a 30-line Node script or a simple SSG) so updates to the shared header propagate. Out of scope for this change — we can address it once you have more than ~5 profiles.

## Technical summary

- `mv` two folders.
- Delete ~15 lines from `src/App.tsx` (the `StaticProfileFrame` component + four routes + the unused `useEffect` import if no other route uses it).
- No new dependencies, no build config changes — Lovable hosting's static-file serving handles the rest.