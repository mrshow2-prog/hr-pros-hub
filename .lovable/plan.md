# Add Arabic Localization to the Entire Site

## Scope

**In scope (translated to Arabic):**
- Landing page (`/`)
- Business page (`/business`) and all its section components
- Career page (`/career`) and its components
- Tools page (`/tools`) and tool components
- Legal page (`/legal`)
- 404 (`/not-found`)
- Shared chrome: nav, footer, WhatsApp button, contact strings, SEO titles/descriptions
- Email templates (subject/body wording shown to UAE users)

**Out of scope (English only, as you requested):**
- All profile pages: `/khalil`, `/bishoy`, the sample profile
- Profile data files (`src/data/bishoy.ts`, `src/data/profile.ts`)
- The admin dashboard (internal only)

## Architecture

### 1. Stack
- `i18next` + `react-i18next` + `i18next-browser-languagedetector`
- One JSON file per language: `src/i18n/locales/en.json`, `src/i18n/locales/ar.json`
- Keys grouped by namespace per page/component (e.g. `business.hero.title`, `career.audience.card1.title`)

### 2. URL strategy (/ar prefix)
- Add a parallel set of routes under `/ar/*` in `App.tsx` that render the same pages
- A `LanguageSync` component reads the URL prefix on every route change → calls `i18n.changeLanguage('ar' | 'en')` and sets `<html lang dir>`
- All internal `<Link>` components use a `useLocalizedPath()` helper that prepends `/ar` when active
- Profile routes (`/:slug`) stay unprefixed — they always render in English even if the user came from `/ar/...`

### 3. RTL
- `dir="rtl"` set on `<html>` when Arabic is active
- Add `[dir="rtl"]` overrides in `src/index.css` for the few places that use directional utilities (text-right/left, ml/mr, rotated marquees, decorative arrows like `→` become `←`)
- Tailwind logical utilities (`ms-*`, `me-*`, `ps-*`, `pe-*`) used where flips are needed inside refactored components
- Arabic typography: load `Noto Naskh Arabic` (serif) + `Noto Kufi Arabic` (sans) via Google Fonts, mapped via a `[dir="rtl"]` font-family override so existing `font-serif` / `font-dm` classes stay untouched

### 4. Language switcher
- Small `EN / ع` toggle in the top-right of every nav (Index header, BusinessNav, the career header, profile/tools headers)
- Toggling navigates between `/x` and `/ar/x` preserving the path + hash

### 5. Translation generation workflow
- All copy lives in `en.json` as the source of truth
- I use the Lovable AI gateway script to translate `en.json` → `ar.json` (Gemini 2.5 Pro, professional MENA Arabic, preserves brand terms like "People.Studio", "MOHRE", "Nafis", "Emiratisation", "GPSSA", "BOT", "Fractional", "Calendly", "WhatsApp", "LinkedIn", "CV")
- A glossary at the top of the prompt locks tone (formal-modern, business-Arabic, no machine literalisms)
- **Maintenance going forward:** every time we add or change English copy, I re-run the same translation script on the new/changed keys and append to `ar.json`. I'll do this automatically as part of any future edit you ask for.

## Files I'll create

- `src/i18n/index.ts` — i18next bootstrap
- `src/i18n/locales/en.json` — extracted English source
- `src/i18n/locales/ar.json` — AI-translated Arabic
- `src/i18n/LanguageSync.tsx` — URL ↔ language binding
- `src/i18n/useLocalizedPath.ts` — path helper
- `src/components/ui/LanguageToggle.tsx` — EN / ع switcher

## Files I'll modify

- `src/main.tsx` — import i18n
- `src/App.tsx` — add `/ar/*` route tree, mount `LanguageSync`
- `src/index.css` — add `[dir="rtl"]` typographic + spacing adjustments, Arabic font import
- `src/pages/Index.tsx`, `Business.tsx`, `Career.tsx`, `Tools.tsx`, `Legal.tsx`, `NotFound.tsx` — replace literal strings with `t()`
- All `src/components/business/*`, `src/components/career/*`, `src/components/tools/*` — same
- `src/components/ui/SiteFooter.tsx`, `BookCallBanner.tsx`, `WhatsAppButton.tsx` — same
- `src/components/seo/SEO.tsx` — pass localized title/description, set `<html lang>`
- `src/data/business.ts`, `src/data/tools.ts` — convert hardcoded strings to translation keys (keep structure, swap values for keys consumed via `t()`)
- `supabase/functions/send-tool-email/index.ts` — bilingual email body (Arabic + English when triggered from Arabic site)

## Files left untouched (per your instruction)

- `src/pages/Profile.tsx`, `ProfileRouter.tsx`
- `src/pages/profiles/**`
- `src/data/profile.ts`, `src/data/bishoy.ts`
- `src/pages/admin/**`

## Validation

After build, I'll:
1. Open `/` and `/ar` to confirm both render
2. Open `/ar/business` and visually check RTL flips, switcher toggling, key Arabic phrases
3. Spot-check `/ar/career`, `/ar/tools`, `/ar/legal`
4. Confirm `/khalil` still renders English regardless of whether you came from `/ar`
5. Confirm console has no missing-key warnings

## Notes on size

This is a large refactor (~14k LOC across 117 files, but only ~30 files contain user-facing copy). I'll work in passes: infrastructure → home + nav → business → career → tools → footer/legal/404 → translation generation → RTL polish. Each pass is committed independently so the site stays functional throughout.
