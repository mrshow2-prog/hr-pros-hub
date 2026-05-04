# Restore section anchors on `/Bishoy-Mesiha`

## What you noticed (and why it currently doesn't work)

The base44 site is a single-page app. There are no real subpages — the 8 orbit items (HR Strategy, OD & Change, HR Consultancy, Employee Relations, Total Rewards, HR Digital Transform., HR Compliance, Learning & Dev.) all live on `/`. Clicking one calls `history.pushState` to a hash like `/#hr-strategy` and swaps a panel in/out without a page reload. That's why URLs look like `/#hr-strategy` instead of `/hr-strategy`.

Our current mirror at `/Bishoy-Mesiha` only contains the empty SPA shell plus our injected branding — the orbit, the panels, and the JS that wires hash → panel were never captured. So `/Bishoy-Mesiha#hr-strategy` does nothing today.

## What I'll build

A working orbit + panel system on `/Bishoy-Mesiha` that mirrors the base44 UX, with hash-based section navigation:

- `/Bishoy-Mesiha#hr-strategy`
- `/Bishoy-Mesiha#od-change`
- `/Bishoy-Mesiha#hr-consultancy`
- `/Bishoy-Mesiha#employee-relations`
- `/Bishoy-Mesiha#total-rewards`
- `/Bishoy-Mesiha#hr-digital-transform`
- `/Bishoy-Mesiha#hr-compliance`
- `/Bishoy-Mesiha#learning-development`

Behavior:
- Click an orbit node → URL updates to `#<slug>`, the corresponding panel scrolls/fades in, the rest stays in place.
- Land directly on a `#<slug>` URL → the matching panel is opened automatically on load.
- Browser back/forward navigates between sections via `popstate` (matches base44).
- Topbar + footer branding (people·STUDIO, link to `/career`) stays as it is now.

## Visual approach

Two viable directions — pick one in the question below:

1. **Faithful recreation** of the dark 360° orbit visual (black background, glowing rings, circular nodes around the portrait, neon ring colors per item). Built fresh in our codebase, no base44 JS.
2. **People.Studio-branded version**: same orbit concept and same hash routing, but restyled to match the Chef Khalil page (paper/clay/sienna palette, serif headings, DM Sans body) so the two profile pages feel like siblings.

## Where the section copy comes from

base44 renders panel content from JS, so I can't scrape it. For each of the 8 sections I'll need a short content block:
- Heading
- 1–2 sentence description
- 4–6 bullet points / services
- (optional) a CTA (book call / email)

Three options for sourcing this — pick one in the question below.

## Technical details

- Convert `public/Bishoy-Mesiha/index.html` from a static iframe-loaded snapshot into a real React route (`/Bishoy-Mesiha` and `/bishoy-mesiha`) under a new `src/pages/BishoyMesiha.tsx`, so we get hash routing, SEO, and code reuse for free.
- Drop `StaticProfileFrame` for Bishoy in `src/App.tsx`; keep it for Chef Khalil.
- Section data lives in `src/data/bishoy.ts` as a typed array `{ slug, label, icon, color, heading, description, bullets, cta }`.
- Hash ↔ panel sync via `useLocation()` + `window.history.replaceState` (no full reloads).
- Topbar and footer reuse the same components/markup as the Chef page for consistency.
- Old static files (`public/Bishoy-Mesiha/index.html`, `assets/index.css`) get removed; the portrait `images/bishoy.jpg` stays and is imported into the new page.

## Out of scope

- The original 3D drag-to-rotate orbit interaction, particle effects, and chatbot. We'll do a clean 2D circular layout with hover/active states — much faster to render and good enough for a portfolio profile.
