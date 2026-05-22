import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const GEMINI_MODELS = ["gemini-2.5-flash", "gemini-2.5-flash-lite"];
const RETRY_STATUSES = new Set([429, 500, 502, 503, 504]);

const SYSTEM_PROMPT = `You are an expert CV writer. You will rewrite a set of bullet points for a specific job role according to the action requested.

Rules:
- Use ONLY information from currentBullets and originalBullets — never invent facts, metrics, or responsibilities not present in those inputs
- Return ONLY a JSON array of strings (the new bullets), no markdown, no explanation, no code fences
- Calibrate language and depth to the seniority level provided`;

function stripFences(text: string): string {
  return text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
}

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs = 20000) {
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
  timeoutMs = 20000,
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

function buildUserMessage(
  action: string,
  jobTitle: string,
  company: string,
  currentBullets: string[],
  originalBullets: string[],
  intent: any,
): string {
  const cur = currentBullets.map((b, i) => `${i + 1}. ${b}`).join("\n");
  const orig = originalBullets.length
    ? originalBullets.map((b, i) => `${i + 1}. ${b}`).join("\n")
    : "(none)";
  const targetRoles = Array.isArray(intent?.targetRoles) ? intent.targetRoles.join(", ") : "";
  const seniority = intent?.seniority ?? "";
  const tone = intent?.tone ?? "";
  const industry = intent?.industry ?? intent?.targetIndustry ?? "";
  const functionArea = intent?.function ?? intent?.functionArea ?? "";

  if (action === "condense") {
    return `Condense these bullet points for the role of ${jobTitle} at ${company}. Merge related points, remove low-impact or generic responsibilities, and keep only the strongest 3-4 bullets. Prioritise specificity and measurable outcomes.

Current bullets:
${cur}

Original bullets for reference:
${orig}

Seniority: ${seniority} | Tone: ${tone}`;
  }
  if (action === "expand") {
    return `Expand and strengthen these bullet points for the role of ${jobTitle} at ${company}. Add depth, context, and stronger framing. Where the original bullets hint at metrics or scope, draw that out. Aim for 5-6 strong bullets.

Current bullets:
${cur}

Original bullets for reference:
${orig}

Seniority: ${seniority} | Tone: ${tone}`;
  }
  return `Rewrite these bullet points to be optimised for someone targeting: ${targetRoles} in ${industry}. Emphasise competencies, language, and outcomes that are most relevant to that target role. Retain the factual content but reframe the emphasis and vocabulary.

Current bullets:
${cur}

Original bullets for reference:
${orig}

Target roles: ${targetRoles} | Function: ${functionArea}
Seniority: ${seniority} | Industry: ${industry}`;
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
    const roleId: string = body.roleId ?? "";
    const jobTitle: string = body.jobTitle ?? "";
    const company: string = body.company ?? "";
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

    console.log(`generate-cv-section: action=${action} roleId=${roleId} bullets=${currentBullets.length}`);

    const userMessage = buildUserMessage(action, jobTitle, company, currentBullets, originalBullets, intent);

    const result = await callGeminiWithRetry(apiKey, {
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [{ role: "user", parts: [{ text: userMessage }] }],
      generationConfig: { responseMimeType: "application/json", temperature: 0.5 },
    }, 20000);

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

    let bullets: string[] = [];
    try {
      const parsed = JSON.parse(stripFences(raw));
      const arr = Array.isArray(parsed) ? parsed : parsed?.bullets;
      if (!Array.isArray(arr)) throw new Error("Not an array");
      bullets = arr.map((b: unknown) => String(b ?? "").trim()).filter((s: string) => s.length > 0);
    } catch {
      console.error("Failed to parse section rewrite. Raw response:", raw);
      return new Response(JSON.stringify({ error: "Failed to parse section rewrite" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

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
