## Goal

Convert `/chef-m-khalil` and `/bishoy-mesiha` from static HTML folders into clean React routes (`/chef-m-khalil`, `/bishoy-mesiha`, no trailing slash, no `/index.html`), with content stored in the database and edited through an in-app `/admin` UI.

Each profile keeps its **own React component file** so designs stay fully unique per person. The shared piece is the **editor**, not the layout.

---

## URL model

```text
/<slug>         → public profile page (React route)
/admin          → login + list of profiles the signed-in user can edit
/admin/<slug>   → edit form for one profile
```

Old static folders `public/chef-m-khalil/` and `public/bishoy-mesiha/` are removed (images move to `src/assets/` or stay in `public/<slug>/` for asset-only use). The Vite middleware redirect added earlier is removed.

---

## Data model (Lovable Cloud)

**`profiles_content`** — one row per profile
- `slug` (text, unique) — e.g. `bishoy-mesiha`
- `owner_user_id` (uuid, nullable) — the user allowed to edit this profile
- `seo_title`, `seo_description` (text)
- `og_image_url` (text)
- `content` (jsonb) — structured fields the template reads (name, headline, bio paragraphs, achievements[], contact, photo_url, etc.). Each profile component decides which keys it uses.
- `published` (bool)

**`user_roles`** — standard pattern (enum `app_role` with `admin`, `user`)
- Admins can edit any profile
- Profile owners can edit only their own row (matched by `owner_user_id`)

**RLS**
- Public `SELECT` on `profiles_content` where `published = true`
- `UPDATE` allowed if `has_role(auth.uid(),'admin')` OR `auth.uid() = owner_user_id`
- `INSERT` / `DELETE` admin-only

Initial seed: two rows (`chef-m-khalil`, `bishoy-mesiha`) populated by porting the existing HTML content into the `content` jsonb.

---

## Routing & components

`src/App.tsx` additions (above the `*` route):
```text
/admin              → AdminLogin / AdminDashboard
/admin/:slug        → AdminProfileEditor
/:slug              → ProfileRouter (looks up slug → renders the right component)
```

`ProfileRouter` is a thin dispatcher:
- `chef-m-khalil` → `<ChefMKhalilPage data={...} />`
- `bishoy-mesiha` → `<BishoyMesihaPage data={...} />`
- unknown slug → `NotFound`

Each profile page is its own file under `src/pages/profiles/` with its own JSX, styling, and SEO via the existing `<SEO>` component. Layouts are NOT shared — only the data shape is.

Adding a future profile = create one component file + add one row in DB + add one line in `ProfileRouter`.

---

## Editor (Tier 1: structured fields)

`/admin` flow:
1. `/admin` — email/password + Google sign-in (via Lovable Cloud auth, defaults).
2. After sign-in: list of profiles the user is allowed to edit.
3. `/admin/:slug` — form with fields matching that profile's `content` schema:
   - Text inputs (name, headline, contact)
   - Textareas (bio, paragraphs)
   - Repeatable lists (achievements, sections) with add/remove/reorder
   - Image URL field + upload to Lovable Cloud storage bucket `profile-images`
   - SEO title / description / OG image
   - Published toggle
4. Save → `UPDATE profiles_content` → public page reflects changes immediately (React Query invalidation).

No rich-text editor in Tier 1 — plain text only. Bold/links/headings come in a future Tier 2 if needed.

Validation with `zod` on both the form and (lightly) on the server side via column constraints.

---

## SEO

- Each profile page renders `<SEO>` with `seo_title`, `seo_description`, `og_image_url` from the DB row.
- Per-profile JSON-LD (Person schema) generated from the same data.
- Canonical URL = `https://people-studio.lovable.app/<slug>`.
- Caveat already discussed: meta is JS-injected, not in initial HTML. Modern crawlers (Google, Bing, LinkedIn, Twitter, Facebook) handle this; some niche scrapers won't.

---

## Migration steps

1. **DB**: create `profiles_content`, `user_roles`, `app_role` enum, `has_role()` function, RLS policies.
2. **Auth**: enable email/password + Google (Lovable Cloud managed). Add `/admin` login page. Seed the first admin user.
3. **Port content**: read existing `public/chef-m-khalil/index.html` and `public/bishoy-mesiha/index.html`, extract text/images into the two seed rows.
4. **Build profile components**: `ChefMKhalilPage.tsx`, `BishoyMesihaPage.tsx` — JSX mirroring the original designs, reading from `data` prop.
5. **Add routes**: `/:slug`, `/admin`, `/admin/:slug` in `App.tsx`.
6. **Build editor**: `AdminDashboard`, `AdminProfileEditor` with field forms + image upload.
7. **Cleanup**: delete `public/chef-m-khalil/` and `public/bishoy-mesiha/` HTML files (keep image subfolders if still referenced); revert the trailing-slash middleware in `vite.config.ts`.
8. **Verify**: `/chef-m-khalil` and `/bishoy-mesiha` render in published build with no slash and no 404; `/admin` login works; edit → save → public page updates.

---

## Out of scope (can come later)

- Rich-text editor (Tier 2)
- Visual drag-and-drop block editor (Tier 3)
- Per-profile custom domains
- Versioning / draft vs published diff
- Owner self-signup (admin invites owners for now)

---

## Decisions needed before build

1. **Who is the first admin?** Your email (so I can grant the `admin` role on seed).
2. **Owner accounts now or later?** Option A: only you (admin) edit everything for now. Option B: also create owner accounts for Khalil & Bishoy on day one.
3. **Image hosting:** OK to create a public Lovable Cloud storage bucket `profile-images` for uploads? (Recommended.)
