# Spin CV Builder out into its own Lovable project

## Strategy

Use **Remix** to fork this project. A remix copies the entire codebase and git/version history into a brand-new Lovable project. Two things do NOT carry over and you should know up front:

- **Chat history** stays with the original project (this one). The remix starts with an empty chat. Since you're keeping peoplestudiohr.com here, the CV‑builder chat history stays here too — readable any time, even after the code is removed.
- **Cloud backend (database, storage, auth users, edge functions, secrets)** is fresh in the remix. Per your choice, we start clean — no data migration. You will re-seed the `abanoub` user via the `cv-seed-user` edge function after deploy.

After the remix exists, we do two clean-up passes in parallel (one per project) so neither side carries dead code.

---

## Step 1 — You create the remix (manual, ~30 seconds)

In this project's sidebar, three‑dot menu → **Remix**. Name it e.g. `cv-builder` / `peoplestudio-cv`. Open the new project once so Lovable provisions its Cloud backend, then come back here and tell me the new project name so I can reference it via `@mention` if needed.

---

## Step 2 — Clean THIS project (remove CV Builder)

Files to delete:
- `src/pages/CvBuilder.tsx`
- `src/pages/cv-builder/` (CvBuilderLogin.tsx, MyCvs.tsx)
- `src/components/cv-builder/` (all 9 files + `pdf/` + `templates/` subfolders)
- `src/contexts/CVBuilderContext.tsx`
- `src/lib/cv/` (exportCompactDocx.ts, exportCompactPdf.ts, templates/)
- `src/lib/docx/` (compact.ts, flow.ts, router.ts, shared.ts, singleColumn.ts)
- `src/lib/cvExport.ts`
- `src/lib/cvTemplateConfig.ts`
- `src/lib/brandedPdf.ts` (verify it isn't used by Profile/Tools first)
- Edge functions: `supabase/functions/cv-seed-user/`, `generate-cv/`, `generate-cv-section/`, `analyze-cv-gaps/`, `calculate-ats-score/`

Code edits:
- `src/App.tsx` — remove the 4 CV‑builder imports (lines 15‑18) and the 4 routes (`/career-studio/cv-builder*`, `/ar/career-studio/cv-builder`, `/career-studio/cv-builder/login`, `/career-studio/cv-builder/my-cvs`).
- `src/pages/Career.tsx` — replace any "Open CV Builder" CTA with an outbound link to the new app's URL (placeholder until the new app is published, then real URL / custom subdomain).
- Remove any nav/footer/menu links that point at `/career-studio/cv-builder`.

Database migration (this project):
- DROP TABLE `cv_builder_sessions`.
- Delete storage bucket `cv-builder-uploads`.
- Leave `user_roles`, `profiles_content`, `tools_leads`, `tools_usage` untouched.
- Leave secrets untouched (LOVABLE_API_KEY, GEMINI_API_KEY, etc. are shared/general).

Bun packages to remove from this project (CV‑only):
- `html-docx-js-typescript`, `docx`, `@react-pdf/renderer`, `file-saver`, `pdfjs-dist`, `mammoth` (verify each isn't used elsewhere before removing — I'll grep first).

---

## Step 3 — Clean the REMIX project (keep only CV Builder)

Switch into the new project and remove everything unrelated:
- All pages except `CvBuilder.tsx`, `cv-builder/*`, `NotFound.tsx`, and a minimal `Index.tsx` redirecting to `/cv-builder`.
- All components/lib/edge‑functions tied to: Profiles, Tools, Career marketing, Business, admin, site-assistant, send-contact-enquiry, send-tool-email, generate-jd, generate-policy.
- Drop unrelated tables in the new Cloud: `profiles_content`, `tools_leads`, `tools_usage`. Keep `user_roles` (CV builder uses auth). Re‑create `cv_builder_sessions` table + `cv-builder-uploads` storage bucket (migration will be auto‑generated from the existing schema files).
- Re‑add secrets the CV builder needs (LOVABLE_API_KEY for Gemini, etc.).
- Trigger `cv-seed-user` edge function to recreate the `abanoub@…` test user.
- Simplify routes: serve CV builder at `/` (or `/cv-builder`) in the new app instead of `/career-studio/cv-builder`.

---

## Step 4 — Wire it back to peoplestudiohr.com

Two options (pick later when ready):
1. **Subdomain** — point `cv.peoplestudiohr.com` at the new Lovable project via Project Settings → Domains. Career page CTA links to `https://cv.peoplestudiohr.com`.
2. **External link** — Career page CTA links to the new project's `.lovable.app` URL or custom domain.

Either way, this project's marketing pages just open the new app in a new tab — no shared state needed.

---

## What I will do in this conversation

Right now I'll only handle **Step 2** (cleanup of this project). Steps 1, 3, 4 happen outside this chat:
- Step 1 is your manual click.
- Step 3 happens in the new project's own chat (you can paste this same plan there, or `@mention` this project so the new project's agent can read these files).
- Step 4 is a domain/UI tweak once the new app is live.

Approve and I'll execute Step 2: delete the CV files, prune `App.tsx`, drop the table + bucket, and remove unused packages. Marketing site, profiles, tools, admin, auth, contact, and assistant features all stay intact.
