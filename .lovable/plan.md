## Why they disappeared

The static folders are still on disk (`public/chef-m-khalil/index.html`, `public/bishoy-mesiha/index.html`). What broke is the URL routing:

- Lovable hosting (and Vite's dev preview) has an automatic **SPA fallback**: any URL **without a file extension** that doesn't map to an exact file is rewritten to the React app's root `index.html`.
- `/chef-m-khalil` has no extension → SPA fallback → React loads → no matching route → catch-all `*` renders `NotFound`.
- The static `public/chef-m-khalil/index.html` is never reached.

So Option A from the previous plan only half-works:
- `/chef-m-khalil/index.html` → works (extension present, served directly).
- `/chef-m-khalil/` (trailing slash) → *sometimes* works depending on the host's directory-index behavior.
- `/chef-m-khalil` (clean, no slash) → never works on this hosting model.

Your ask — "clean URLs like `/career` or `/business`" — is fundamentally incompatible with serving raw static HTML on Lovable hosting, because clean URLs are exactly what the SPA fallback claims for React. There's no per-route hosting config we can add (no `_redirects`, no `vercel.json`, no `netlify.toml` — Lovable ignores them).

## The two viable paths

### Path 1 — Keep static HTML, link with trailing slash

Lowest-effort, keeps your hand-crafted HTML untouched.

- Link to `/chef-m-khalil/` and `/bishoy-mesiha/` (trailing slash) everywhere in the React app.
- Add a tiny Vite dev-server middleware so `/chef-m-khalil` (no slash) **redirects** to `/chef-m-khalil/` in local preview. Production Lovable hosting already does this for directory URLs.
- Trade-off: the URL bar will show the trailing slash (`/chef-m-khalil/`), not bare `/chef-m-khalil`. That's the closest you can get to "clean" while keeping standalone HTML.

```text
public/
  chef-m-khalil/index.html   ← unchanged
  bishoy-mesiha/index.html   ← unchanged
src/App.tsx                  ← unchanged
vite.config.ts               ← add small middleware: redirect /<slug> → /<slug>/
```

### Path 2 — Port profiles into React (clean URLs, scales to thousands)

This is what your `/career` and `/business` pages already do, and it's the only way to get a truly extensionless URL like `/chef-m-khalil`.

- Add one dynamic route in `App.tsx`: `<Route path="/:slug" element={<ProfilePage />} />` (placed above `*`).
- `ProfilePage` reads the slug, looks up profile data from a record (`src/data/profiles/<slug>.ts` — you already have `src/data/bishoy.ts` as a starting point), and renders a shared React template.
- Each new profile = drop a data file, no HTML, no folder. Scales cleanly.
- One-time cost: convert the two existing HTML pages into the shared template + two data files. Images stay in `public/<slug>/...`.
- SEO: `react-helmet-async` (already installed) sets per-profile title/description/OG tags.

```text
src/
  pages/ProfilePage.tsx          ← new shared template
  data/profiles/
    chef-m-khalil.ts             ← bio, photos[], dishes[], certs[], contact
    bishoy-mesiha.ts
  App.tsx                        ← + <Route path="/:slug" element={<ProfilePage/>}/>
public/
  chef-m-khalil/                 ← keep folder for image assets only
  bishoy-mesiha/
```

## Recommendation

If you only ever need a handful of profiles and want zero React work: **Path 1** (accept the trailing slash).

If profiles will grow, you want true `/chef-m-khalil` URLs, consistent header/footer, and proper SEO: **Path 2**. It's a one-time port that pays back forever.

## Decision needed

Tell me which path to implement, and for Path 2 whether to start by porting just one profile (Chef M. Khalil) so you can review the template before the second one is migrated.
