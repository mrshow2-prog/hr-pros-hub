
# Plan — Rebuild `/bishoy-mesiha` faithfully (360° HR Leader)

Same approach as Chef Khalil: code-driven structure + JSONB content. No image assets this round — we'll wire `A1.jpg` references to a placeholder portrait and you can swap later via admin/upload.

After this lands, I'll move on to the unified tabbed admin editor.

---

## What I'll build

### 1. Data shape (overwrite `profiles_content` row for `bishoy-mesiha`)
The HTML has 8 specialty "lenses" plus a rich landing page. Schema:

```text
content = {
  hero: {
    eyebrow, name_first, name_last, tagline, hook (multiline),
    photo_url, stats[4]: { value, label }
  },
  marquee_items: string[],            // award strip
  orbit_center: { name, title, photo_url },
  achievements: [{ number, desc }],   // 10 cards
  testimonials: [{ text, author, role, avatar_letter }],
  philosophy: { quote, attribution },
  contact: { email, phone, linkedin, location },
  footer_cta: { heading, body },
  specialties: [                       // 8 entries
    {
      id, label, icon, color, angle,
      tagline, summary,
      metrics:    [{ val, label }],
      skills:     string[],
      experience: [{ company, role, period, heading, bullets[] }],
      projects:   [{ title, desc, result }],
      testimonials: [{ text, author }]
    }
  ]
}
```

All text from your HTML pre-loaded (employee-relations, total-rewards, talent-acquisition, hr-operations, learning-development, hr-tech-ai, culture-engagement, strategic-business-partner — extracted from the file).

### 2. Routing
- `ProfileRouter` already maps `bishoy-mesiha` → `BishoyMesihaPage`. Keep it.
- New nested view: `/bishoy-mesiha/:specialtyId` (in-page state, no extra route entry needed — we'll use a query param or hash so Lovable's router stays untouched). Default = landing.

### 3. Page — full rewrite of `src/pages/profiles/BishoyMesihaPage.tsx`
Broken into section components under `src/pages/profiles/bishoy-mesiha/`:
- `theme.css` — scoped CSS variables (`--ink`, `--cream`, `--gold`, `--rust`, `--slate`, `--mist`), keyframes, all classes from the original `<style>` block. Imported only here.
- `Cursor.tsx` — custom dot + follower (disabled on touch / `prefers-reduced-motion`).
- `Hero.tsx` — eyebrow, photo ring, name with italic last name, tagline, hook, 4 stats, scroll hint, animated bg orbs.
- `Marquee.tsx` — looping award strip.
- `Orbit.tsx` — 3 rings + 8 nodes positioned by `angle`, click → opens specialty page.
- `Achievements.tsx` — 10-card grid.
- `Testimonials.tsx` — 5 cards + LinkedIn CTA card.
- `Philosophy.tsx` — full-bleed quote.
- `FooterCTA.tsx` — email / phone / linkedin links.
- `SpecialtyPage.tsx` — back button, hero (title/summary/metrics), skills tags, experience list, projects grid, testimonials, share bar (copy URL).
- `useFadeIn.ts` — reused intersection-observer.

Fonts (`Playfair Display`, `DM Sans`, `Space Mono`) added once to `index.html` `<head>` (Khalil's fonts kept).

### 4. Things explicitly **dropped** vs original HTML
- `localStorage` admin overlay → replaced by your real `/admin/bishoy-mesiha` (deferred until tabbed editor exists; the simple form will keep working but won't expose the rich shape, same warning as Khalil).
- `cursor: none` global → kept on desktop only, off on touch / reduced-motion.
- `A1.jpg` references → `content.hero.photo_url` (a placeholder, swap later).

### 5. SEO
- Landing: existing `<SEO>` with Person JSON-LD (name, jobTitle, location, sameAs).
- Specialty subview: dynamic title `${specialty.label} — Bishoy Mesiha` and description from `specialty.summary`.

### 6. Files
- **Create**: `src/pages/profiles/bishoy-mesiha/{theme.css, Cursor.tsx, Hero.tsx, Marquee.tsx, Orbit.tsx, Achievements.tsx, Testimonials.tsx, Philosophy.tsx, FooterCTA.tsx, SpecialtyPage.tsx, useFadeIn.ts}`
- **Rewrite**: `src/pages/profiles/BishoyMesihaPage.tsx`
- **Edit**: `index.html` (add DM Sans + Space Mono if missing)
- **DB**: one `UPDATE` to `profiles_content` for slug `bishoy-mesiha`

No schema migration. No new dependencies.

---

## After this

- `/bishoy-mesiha` renders the full 360° landing.
- Click any orbit node → slides into that specialty's full CV view.
- Same "don't save via /admin" warning until I build the unified tabbed editor next round.

Reply **approve** and I'll execute end-to-end.
