
## Diagnosis

The dev server logs show Vite hit pre-transform errors at 9:20:33 for all the files we deleted in Phase 1 (Index, Business, Profile, admin, i18n, WhatsAppButton, etc.) while `App.tsx` still referenced them. By 9:20:56 `App.tsx` was updated and by 9:21:34 the context file was patched — but Vite's module graph almost certainly still has poisoned entries from that window, which is why the preview at `/` is hanging.

On top of that, `/` now redirects to `/my-cvs`, which is auth-protected. With no session it bounces to `/login`. If the redirect-loop check or the stale module graph stalls, the page appears to "never load".

## Fix

1. Restart the Vite dev server to flush the stale module graph.
2. Change `/` from a `Navigate` to a real public landing page so unauthenticated visitors don't immediately hit the auth wall. For Phase 1 this is a minimal placeholder: a hero, "Sign in / Get started" CTA → `/login`, link out to peoplestudiohr.com. We will replace it with the real marketing landing in Phase 2/4.
3. After restart, navigate the preview to `/` to verify it renders, then to `/login` to confirm the auth flow works.

No DB changes, no edge-function changes, no scope expansion — just unblock the preview.
