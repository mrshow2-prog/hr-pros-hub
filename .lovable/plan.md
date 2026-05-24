
# CV Builder — Standalone Product Plan

Goal: turn this remix into a focused, premium CV Builder hosted at **cv.peoplestudiohr.com**, deeply linked from peoplestudiohr.com. Existing wizard is a starting point only — we will raise quality to compete with Teal, Rezi, Enhancv, Kickresume.

The plan is split into 4 phases. Each phase is an approval gate — we ship phase 1 before touching phase 2.

---

## Phase 1 — Strip the remix down to CV Builder only

Goal: nothing in this project except CV Builder. Clean foundation.

**Remove from `src/`:**
- Pages: `Index`, `Business`, `Profile`, `Tools`, `Career`, `Legal`, `NotFound` (replace with CV-builder-themed one), `ProfileRouter`, `admin/*`, `profiles/*`
- Components: `business/`, `career/`, `cv/` (legacy showcase), `profiles/`, `tools/`, `ui/SiteAssistant`, `ui/WhatsAppButton`, `ui/BookCallBanner`, `ui/LanguageToggle`, `ui/PsLogo` (keep simplified), `NavLink`
- Data: `bishoy.ts`, `business.ts`, `profile.ts`, `tools.ts`
- Hooks: `useProfileContent`
- i18n: keep only if we ship Arabic in v1 (recommend: drop for now, re-add later)
- Lib: `contact.ts`, `profileRoutes.ts`, `toolsTracking.ts`, `brandedPdf.ts` (keep), `cvExport.ts` (keep), other CV libs (keep)

**Remove from `supabase/functions/`:**
`generate-jd`, `generate-policy`, `send-contact-enquiry`, `send-tool-email`, `site-assistant`, `cv-seed-user` (review).
**Keep & harden:** `analyze-cv-gaps`, `calculate-ats-score`, `generate-cv`, `generate-cv-section`.

**Database (fresh start, per your choice):**
- Drop `profiles_content`, `tools_leads`, `tools_usage` (not needed here).
- Keep `user_roles` (admin = you).
- Keep `cv_builder_sessions` but rebuild schema for the new feature set (see Phase 2).
- Storage: keep `cv-builder-uploads`, drop `profile-images` and `profile-cvs`.

**New app shell:**
- Routes: `/` (marketing landing), `/login`, `/signup`, `/dashboard` (My CVs + Jobs), `/builder/:cvId`, `/pricing`, `/account`, `/admin`.
- Branding: new identity — “People Studio CV” — distinct from main site but visually related. Editorial-luxury direction (Cormorant + Karla or Instrument Serif + Work Sans, warm paper + deep ink + single accent).
- SEO: rewrite all meta, sitemap, robots, llms.txt for the CV product.

**Wire to peoplestudiohr.com:**
- Document the link contract: from the main site’s Career section, the CTA points to `https://cv.peoplestudiohr.com/?utm_source=peoplestudiohr&utm_medium=site&utm_campaign=career`.
- Add a small “← Back to People Studio” link in the footer/header for round-trip.
- (Optional, Phase 4) Cross-domain SSO using a shared Supabase project + Lovable Cloud auth — only if you want one account across both apps. Recommend: keep auth here only for now.

**Domain setup:**
- After publish, connect `cv.peoplestudiohr.com` in Project Settings → Domains (CNAME at your DNS).

---

## Phase 2 — Rebuild the core CV product to competitive quality

The current 7-step wizard has the right bones, but quality is thin. We replace it with a **document-first editor** like Teal/Rezi, not a linear wizard.

**New core experience:**
1. **Onboarding (2 min):** Upload existing CV / LinkedIn PDF / start blank. AI parses into structured sections.
2. **Editor (the heart of the product):**
   - Left: section navigator + AI assistant panel.
   - Center: live WYSIWYG document on the chosen template.
   - Right: live **ATS Score** + **JD Match Score** + actionable issue list (missing keywords, weak verbs, quantification gaps, length, formatting risks).
   - Per-bullet AI rewrite with diff view (accept/reject), tone selector (impact, concise, leadership, technical), and metric-injection prompts (“how many people?”, “% change?”).
3. **Template gallery:** rebuild 5 → 8 truly distinct, ATS-safe templates. Each gets a hand-tuned PDF renderer and a matching DOCX flow. Real photo support, Arabic-ready layouts later.
4. **Exports:** PDF (vector, selectable text), DOCX (true Word, not HTML-to-doc), plain-text ATS version, shareable web link (`cv.peoplestudiohr.com/cv/:slug`).
5. **Versioning:** every CV has versions; users can branch “tailored for Job X”.

**Premium add-ons (the moat):**
- **JD-tailored CV**: paste JD → AI produces a tailored variant with diff view + match-score delta.
- **Cover letter generator**: tied to a CV + JD, multi-tone, editable, exports PDF/DOCX.
- **Real ATS scoring**: scoring rubric (formatting, keywords, action verbs, quantification, length, contact info, section coverage). We compute deterministic parts in-app, use Gemini for semantic parts. Score is reproducible, not theatrical.
- **LinkedIn import**: PDF export upload + parser (no scraping — ToS-safe). Also: AI-generated LinkedIn headline + About rewrites from the same source CV.
- **Interview prep**: from CV + JD, generate role-specific Q&A, STAR-method drills, and a 10-question mock interview with feedback.
- **Job tracker**: kanban (Saved → Applied → Interview → Offer → Closed). Each card links to its tailored CV + cover letter + interview prep set. Add reminders, notes, salary, contact.

**Database (rebuild fresh, per your choice):**
- `profiles` (user_id, name, headline, locale, plan)
- `cvs` (id, user_id, title, base_data jsonb, template_id, updated_at)
- `cv_versions` (id, cv_id, label, data jsonb, ats_score, created_at)
- `jobs` (id, user_id, company, role, jd_text, status, salary, notes)
- `job_cvs` (job_id, cv_version_id, cover_letter_id, ats_match_score)
- `cover_letters` (id, user_id, cv_version_id, job_id, body, tone)
- `interview_sessions` (id, user_id, job_id, questions jsonb, answers jsonb, feedback jsonb)
- `subscriptions` (id, user_id, status, plan, current_period_end, provider_id)
- `purchases` (id, user_id, kind, amount, provider_id, created_at)
- RLS: owner-only on every table.

**AI stack:**
- Default `google/gemini-3-flash-preview` for editor (cheap/fast), `google/gemini-2.5-pro` for tailoring + cover letters + ATS rubric (quality), `openai/gpt-5-mini` as fallback. All via Lovable AI Gateway — no user keys.
- Strict JSON schemas + Zod validation in every edge function.

---

## Phase 3 — Monetization (hybrid)

Per your choice: one-time + premium subscription.

**Pricing:**
- **Free**: 1 CV, basic template, no export.
- **One-time CV unlock (AED 99)**: unlock 1 CV with PDF + DOCX export forever, all templates.
- **Pro Subscription (AED 39 / month or AED 299 / year)**: unlimited CVs, JD tailoring, cover letters, LinkedIn rewrites, interview prep, job tracker, premium templates, priority AI.

**Provider:** run `recommend_payment_provider` first. Digital service → likely Stripe (managed_payments for tax). If eligible, Paddle is also an option. I’ll surface the recommendation before we enable, then create products via `batch_create_product`.

**Edge functions:** `create-checkout`, `customer-portal`, `check-subscription`, `stripe-webhook`. Entitlements stored in `subscriptions` and checked in every premium edge function.

---

## Phase 4 — Launch, integration, ops

- **Wire main site**: send you the exact CTA snippet + utm scheme for peoplestudiohr.com. Remove CV builder from the main project last, after this app is live and stable.
- **Email**: use Resend (already connected). Transactional templates: welcome, purchase receipt, subscription renewed, password reset, “your tailored CV is ready”.
- **Analytics**: Plausible or PostHog (free tier) for funnel — landing → signup → upload → export → paid.
- **SEO**: dedicated landing pages for “AI CV Builder UAE”, “ATS resume checker”, “cover letter generator”, “LinkedIn rewrite”. Use connected Google Search Console + Firecrawl for content ops.
- **Admin**: simple `/admin` to view users, sessions, refund, comp a Pro account.
- **Legal**: Terms + Privacy + Refund policy pages (template, you finalize).

---

## Technical Section (for reference)

```text
src/
  pages/
    Landing.tsx
    Pricing.tsx
    Login.tsx  Signup.tsx  ResetPassword.tsx
    Dashboard.tsx              # tabs: CVs | Jobs
    Builder.tsx                # /builder/:cvId
    CoverLetter.tsx            # /letter/:id
    InterviewPrep.tsx          # /prep/:jobId
    Account.tsx
    Admin.tsx
  components/builder/
    Editor/  Sidebar/  AtsPanel/  AiAssistant/  TemplatePicker/  Exports/
  components/jobs/   components/letters/   components/prep/
  lib/cv/   lib/ats/   lib/parsers/   lib/payments/
supabase/functions/
  parse-cv/        # PDF/DOCX/LinkedIn -> structured JSON
  generate-cv/     # full or section rewrite
  tailor-cv/       # CV + JD -> tailored version + diff
  ats-score/       # deterministic + semantic scoring
  cover-letter/
  linkedin-rewrite/
  interview-generate/   interview-feedback/
  create-checkout/  customer-portal/  check-subscription/  stripe-webhook/
```

Order of execution after you approve: Phase 1 cleanup → schema reset → new shell + landing → Phase 2 editor rebuild (iteratively, one capability at a time) → Phase 3 payments → Phase 4 launch.

---

## What I need from you to start Phase 1

1. Approval to **delete** the listed pages/components/edge functions and **drop** `profiles_content`, `tools_leads`, `tools_usage`, `profile-images`, `profile-cvs`.
2. Confirm the product name (default: **People Studio CV**).
3. Confirm you’ll point `cv.peoplestudiohr.com` DNS after we publish (CNAME).
4. Anything you specifically want to keep from the current build (e.g. a template you love, a piece of copy).
