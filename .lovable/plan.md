
# Plan — Rebuild `/chef-m-khalil` faithfully on the new dynamic architecture

Goal: Recreate the uploaded `index-2.html` as a pixel-faithful React page served from `/chef-m-khalil`, backed by `profiles_content`, with an admin editor that lets you change all text and manage the dish/photo/certificate galleries (add, remove, reorder, upload). Layout, fonts, colors, hero parallax, lightbox and animations stay code-driven.

Bishoy's profile is **out of scope** for this round — we'll do it the same way once you upload his HTML.

---

## What you'll do (one action only)

Reply to this plan with a ZIP of the three image folders from the original site:
- `photos/` (~17 files)
- `dishes/` (~25 files)
- `certificates/` (~18 files)

Keep the **exact same filenames** as referenced in the HTML — I'll match them when seeding.

Everything else is automatic.

---

## What I'll build

### 1. Storage import (one-time)
- Unpack the ZIP, upload all images to the existing `profile-images` bucket under:
  - `chef-m-khalil/photos/...`
  - `chef-m-khalil/dishes/...`
  - `chef-m-khalil/certificates/...`
- Generate the public URL list and embed it into the seed.

### 2. Database seed (data only — no schema change)
The existing `profiles_content.content` JSONB column is already flexible enough. I'll overwrite the `chef-m-khalil` row with a structured payload covering every section:

```text
content = {
  hero:        { eyebrow, name_first, name_last, tagline, ctas[], stats[] },
  about:       { headline, paragraphs[], portrait_url, signature_quote, mini_stats[] },
  specialties: [ { title, description, icon } x5 ],
  experience:  [ { years, role, company, location, bullets[] } ... ],   // timeline
  dishes:      [ { url, name } ... ],                                   // gallery
  photos:      [ { url, tall, wide } ... ],                             // masonry
  awards:      [ { year, title, body } ... ],
  certificates:[ { url, name } ... ],
  skills:      [ { group, items: [{ label, level }] } ... ],            // bars
  education:   [ { year, title, institution, detail } ... ],
  contact:     { email, phone, whatsapp, linkedin, location, form_recipient }
}
```

All copy from your HTML is pre-loaded.

### 3. The page — `src/pages/profiles/ChefMKhalilPage.tsx` (full rewrite)
A faithful port of the HTML, broken into small section components under `src/pages/profiles/chef-m-khalil/`:
- `Nav.tsx` — sticky scroll-aware nav with mobile hamburger
- `Hero.tsx` — full-bleed background image, parallax on scroll, eyebrow + display name + italic tagline + CTAs + stats row
- `About.tsx` — two-column with portrait
- `Specialties.tsx` — 5-card grid
- `ExperienceTimeline.tsx` — vertical timeline
- `DishGallery.tsx` — 4-col grid + lightbox trigger
- `ChefPhotos.tsx` — masonry honoring `tall`/`wide` flags
- `Awards.tsx`
- `Certificates.tsx` — thumb grid + lightbox trigger
- `Skills.tsx` — animated bars (width fills on intersection)
- `Education.tsx`
- `Contact.tsx` — form posts to existing `send-contact-enquiry` edge function (already in repo)
- `Lightbox.tsx` — shared lightbox with arrow-key + click-outside, used by all three galleries
- `Footer.tsx`
- `useFadeIn.ts` — IntersectionObserver hook replacing the inline script
- `theme.css` — scoped CSS (CSS variables `--gold`, `--cream`, etc.) imported only by this page so the warm palette doesn't leak into the rest of the site

The page reads from `useProfileContent('chef-m-khalil')` and renders sections only if their data is present. Fonts (Playfair Display, Lato, Cormorant Garamond) get added to `index.html` `<head>`.

SEO: existing `<SEO>` component already handles title/description/og — kept as-is.

### 4. Admin editor — `AdminProfileEditor.tsx` (rewrite)
The current generic editor is replaced with a tabbed editor when `slug === 'chef-m-khalil'`. Tabs:

1. **SEO & visibility** — title, description, OG image, published toggle
2. **Hero** — eyebrow, first/last name, tagline, CTA buttons, stats (repeater)
3. **About** — paragraphs (textarea per paragraph, add/remove), portrait upload
4. **Specialties** — 5 cards (title, description)
5. **Experience** — timeline entries (add/remove/reorder, role, company, years, bullets)
6. **Dishes** — repeater of `{ image upload, name }` with drag-to-reorder + delete
7. **Photos** — repeater of `{ image upload, tall, wide }` with reorder + delete
8. **Awards** — repeater
9. **Certificates** — repeater of `{ image upload, name }`
10. **Skills** — group + items with 0–100 slider
11. **Education** — repeater
12. **Contact** — email, phone, WhatsApp, LinkedIn, location

Reusable bits:
- `<RepeaterField>` — generic add/remove/reorder list
- `<ImageUploadField>` — single-image upload to `profile-images/chef-m-khalil/<section>/<timestamp>.ext`, returns public URL
- All edits stay client-side until **Save** → one `update` of the `content` JSONB

Bishoy and any future profile keeps using the simple form until we port them.

### 5. Routing & cleanup
- `ProfileRouter.tsx` — already dispatches by slug, no change.
- `App.tsx` — no change.
- The currently-rendered simplified `ChefMKhalilPage` and the matching seed get fully replaced.

---

## Technical notes (skip if you don't care)

- **No schema migration.** `content jsonb` already accepts the richer shape. RLS already allows admin write + public read of published rows.
- **Image URLs.** Stored as fully-qualified public URLs in JSON, so the page just renders `<img src={...}>` — no client-side URL building.
- **Lightbox** is one component reused by all three galleries via a shared context (`useLightbox`).
- **Parallax** uses `requestAnimationFrame` + `transform: translateY()` and is disabled on `prefers-reduced-motion`.
- **Bundle impact.** The page-scoped CSS keeps the rest of the site untouched. No new npm dependencies — Tailwind + plain CSS variables only.
- **Contact form** wires into the existing `send-contact-enquiry` edge function with the editable recipient email.
- **Fallbacks.** If a section's data is empty in the DB, that section is skipped — so the page is never broken by an in-progress edit.

---

## After implementation

1. Visit `/chef-m-khalil` — full faithful design with all imported images.
2. Visit `/admin/chef-m-khalil` — use the tabbed editor to tweak any section, reorder the gallery, etc.
3. When ready, send Bishoy's HTML and we'll repeat for `/bishoy-mesiha`.

Reply with the ZIP and approve, and I'll execute end-to-end.
