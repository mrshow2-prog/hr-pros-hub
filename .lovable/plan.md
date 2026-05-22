## Add retry + model fallback to Gemini edge functions

When Gemini returns a transient error (503 UNAVAILABLE, 429, 500, or network/timeout), retry up to 3 attempts total before surfacing the error. On attempts 2 and 3, alternate to `gemini-2.5-flash-lite` so we don't keep hammering an overloaded `gemini-2.5-flash`.

### Scope

Apply identical retry logic to all three Gemini edge functions:
- `supabase/functions/generate-cv/index.ts`
- `supabase/functions/analyze-cv-gaps/index.ts`
- `supabase/functions/calculate-ats-score/index.ts`

No client-side changes. No new Lovable AI fallback (per previous instruction).

### Retry behavior

Attempt sequence per request:
1. Attempt 1 → `gemini-2.5-flash`
2. Attempt 2 → `gemini-2.5-flash-lite` (wait ~800ms)
3. Attempt 3 → `gemini-2.5-flash` (wait ~1600ms)

Retry triggers (transient only):
- HTTP status: 429, 500, 502, 503, 504
- Fetch threw (timeout/abort/network)

Do NOT retry on:
- 4xx other than 429 (bad request, auth, etc.) — surface immediately
- JSON parse failure of model output — surface immediately

After 3 failed attempts, return 502 with the last error's status + details (same shape as today, so `StepGaps.tsx` keeps surfacing the message).

### Technical details

Add a shared helper inside each function file (kept local — edge functions can't share modules cleanly):

```ts
const GEMINI_MODELS = ["gemini-2.5-flash", "gemini-2.5-flash-lite"];
const RETRY_STATUSES = new Set([429, 500, 502, 503, 504]);

async function callGeminiWithRetry(apiKey: string, payload: unknown, timeoutMs: number) {
  let lastErr: { status?: number; details: string } | null = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    const model = GEMINI_MODELS[attempt % GEMINI_MODELS.length];
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    try {
      const resp = await fetchWithTimeout(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }, timeoutMs);
      if (resp.ok) return resp;
      const text = await resp.text();
      lastErr = { status: resp.status, details: text };
      console.error(`Gemini ${model} attempt ${attempt + 1} failed:`, resp.status, text);
      if (!RETRY_STATUSES.has(resp.status)) break; // non-transient
    } catch (e) {
      lastErr = { details: (e as Error).message };
      console.error(`Gemini ${model} attempt ${attempt + 1} threw:`, lastErr.details);
    }
    if (attempt < 2) await new Promise((r) => setTimeout(r, 800 * (attempt + 1)));
  }
  return { error: lastErr! };
}
```

Replace the existing single `fetchWithTimeout(GEMINI_URL, …)` block in each function with a call to this helper. The `GEMINI_URL` constant is removed (model is chosen per attempt). The error response path stays the same shape: `{ error: "Gemini API error <status>", status, details }`.

### Out of scope

- Streaming, Lovable AI gateway, model changes beyond flash/flash-lite.
- Client UI changes (the existing error surfacing in `StepGaps.tsx` already shows `details`).
