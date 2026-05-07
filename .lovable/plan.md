# AI Assistant Chat Widget (Gemini API)

A floating bilingual chat assistant on every page that guides visitors to the right service, tool, or page — powered by your own Google Gemini API key.

## Security note

You shared the API key in plain chat. I will store it as a secret (`GEMINI_API_KEY`) — never in code — but please **rotate that key in Google AI Studio** after this is wired up, since it is now exposed in this conversation history.

## What the user will see

- Floating button in the bottom corner (stacked above the WhatsApp button so they don't overlap), present on all routes.
- Click opens a compact chat panel with a bilingual greeting ("Hi! I can help you find the right service or tool…" / "مرحبًا! يمكنني مساعدتك…").
- Streaming token-by-token responses, rendered as Markdown so suggested links to `/business`, `/career`, `/tools`, etc. are clickable.
- Language and RTL follow the current site language (EN on `/*`, AR on `/ar/*`).
- Conversation persists in `localStorage`; "Clear" button resets it.

## How it works

- New edge function `supabase/functions/site-assistant/index.ts`:
  - Reads `GEMINI_API_KEY` from secrets (never exposed to the client).
  - Calls Google's Gemini API directly: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent` with SSE.
  - Curated system prompt describing People.Studio, the three audiences (Business / Career / Tools), key pages, and tone — instructs the model to reply in the user's language, keep answers short, and recommend a next step (book a call, run the diagnostic, open a tool).
  - Streams chunks back to the browser.
  - Surfaces 429 (rate limit) and quota errors as friendly toasts.

## Files to add

- `supabase/functions/site-assistant/index.ts` — streaming Gemini edge function.
- `src/components/ui/SiteAssistant.tsx` — floating button + chat panel (RTL-aware, uses existing Tailwind tokens).
- `src/components/ui/SiteAssistantMessage.tsx` — message bubble with `react-markdown`.

## Files to edit

- `src/App.tsx` — mount `<SiteAssistant />` next to `<WhatsAppButton />` so it appears on every route.
- `src/components/ui/WhatsAppButton.tsx` — small position tweak so the two buttons stack cleanly.

## Setup step

- I will trigger the secrets form to save `GEMINI_API_KEY`. You paste the key there (from Google AI Studio), and the edge function picks it up automatically.

## Out of scope (future)

- Persisting conversations to the database per visitor.
- Lead capture (email/phone) inside the chat.
- Handing off to a human via WhatsApp from inside the chat.
