import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const GEMINI_MODELS = ["gemini-2.5-flash", "gemini-2.5-flash-lite"];
const RETRY_STATUSES = new Set([429, 500, 502, 503, 504]);

const SYSTEM_PROMPT = `You rewrite a single role's bullet points on a real person's CV. Use ONLY information present in the provided bullets and the role/intent context. Never invent companies, dates, metrics, or achievements not implied by the inputs. Keep statements truthful and specific. Return ONLY a valid JSON object with no markdown.`;

function stripFences(text: string): string {
  return text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
}

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs = 60000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

async function callGeminiWithRetry(
  apiKey: string,
  payload: unknown,
  timeoutMs = 60000,
): Promise<Response | { error: { status?: number; details: string } }> {
  let lastErr: { status?: number; details: string } = { details: "Unknown error" };
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
      if (!RETRY_STATUSES.has(resp.status)) break;
    } catch (e) {
      lastErr = { details: (e as Error).message };
      console.error(`Gemini ${model} attempt ${attempt + 1} threw:`, lastErr.details);
    }
    if (attempt < 2) await new Promise((r) => setTimeout(r, 800 * (attempt + 1)));
  }
  return { error: lastErr };
}

function instructionFor(action: string): string {
  switch (action) {
    case "condense":
      return "CONDENSE: Merge overlapping points and reduce to only the highest-impact bullets (aim for 3-5). Keep strong metrics. Remove fluff. Each bullet should be tight and outcome-led.";
    case "expand":
      return "EXPAND: Add depth and stronger framing. Strengthen verbs, surface scope, and frame outcomes with metric-style language where the inputs already suggest one. Do NOT invent numbers. Aim for 5-7 bullets.";
    case "tailor":
      return "TAILOR: Rewrite each bullet to be optimised for the target role's keywords, seniority, and expectations. Reframe responsibilities so they read as evidence for the target role. Do NOT invent experience.";
    default:
      return "Improve the bullets while preserving truth.";
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "GEMINI_API_KEY not configured" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    const body = await req.json().catch(() => ({}));
    const action: string = body.action ?? "";
    const currentBullets: string[] = Array.isArray(body.currentBullets)
      ? body.currentBullets.map((b: unknown) => String(b ?? "").trim()).filter((s: string) => s.length > 0)
      : [];
    const originalBullets: string[] = Array.isArray(body.originalBullets)
      ? body.originalBullets.map((b: unknown) => String(b ?? "").trim()).filter((s: string) => s.length > 0)
      : [];
    const intent = body.intentForm ?? {};

    if (!["condense", "expand", "tailor"].includes(action)) {
      return new Response(JSON.stringify({ error: "Invalid action" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }
    if (currentBullets.length === 0) {
      return new Response(JSON.stringify({ error: "No bullets to rewrite" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const targetRoles = Array.isArray(intent?.targetRoles) ? intent.targetRoles.join(", ") : "";
    const userMessage = `${instructionFor(action)}

TARGET ROLES: ${targetRoles}
FUNCTION: ${intent?.functionArea ?? ""}
SENIORITY: ${intent?.seniority ?? ""}
INDUSTRY: ${intent?.targetIndustry ?? ""}
TONE: ${intent?.tone ?? ""}

CURRENT BULLETS:
${currentBullets.map((b, i) => `${i + 1}. ${b}`).join("\n")}

ORIGINAL BULLETS (for reference, do not contradict):
${originalBullets.length ? originalBullets.map((b, i) => `${i + 1}. ${b}`).join("\n") : "(none)"}

Return ONLY a JSON object: { "bullets": [string, ...] }`;

    const result = await callGeminiWithRetry(apiKey, {
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [{ role: "user", parts: [{ text: userMessage }] }],
      generationConfig: { responseMimeType: "application/json", temperature: 0.5 },
    });

    if (!(result instanceof Response)) {
      return new Response(
        JSON.stringify({
          error: result.error.status
            ? `Gemini API error ${result.error.status}`
            : "Gemini request failed",
          status: result.error.status,
          details: result.error.details,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 502 },
      );
    }

    const data = await result.json();
    const raw: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    let parsed: any;
    try {
      parsed = JSON.parse(stripFences(raw));
    } catch {
      console.error("Failed to parse Gemini response:", raw);
      return new Response(JSON.stringify({ error: "Failed to parse AI response" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    const bullets = Array.isArray(parsed?.bullets)
      ? parsed.bullets.map((b: unknown) => String(b ?? "").trim()).filter((s: string) => s.length > 0)
      : [];

    if (bullets.length === 0) {
      return new Response(JSON.stringify({ error: "AI returned no bullets" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 502,
      });
    }

    return new Response(JSON.stringify({ bullets }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
