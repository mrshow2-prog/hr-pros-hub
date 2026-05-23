import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const GEMINI_MODELS = ["gemini-2.5-flash-lite"];
const RETRY_STATUSES = new Set([429, 500, 502, 503, 504]);

const SYSTEM_PROMPT = `You are an expert CV writer. You rewrite content (bullets or summaries) for a specific job role/candidate.

Rules:
- Use ONLY information from the inputs provided — never invent facts, metrics, responsibilities, or qualifications not present
- Return ONLY a JSON object as instructed; no markdown, no code fences, no explanation
- Calibrate tone and depth to the seniority level provided`;

function stripFences(text: string): string {
  return text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
}

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs = 20000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try { return await fetch(url, { ...init, signal: controller.signal }); }
  finally { clearTimeout(timeout); }
}

async function callGemini(apiKey: string, payload: unknown, timeoutMs = 20000) {
  let lastErr: { status?: number; details: string } = { details: "Unknown error" };
  for (let attempt = 0; attempt < 2; attempt++) {
    const model = GEMINI_MODELS[0];
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    try {
      const resp = await fetchWithTimeout(url, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }, timeoutMs);
      if (resp.ok) return resp;
      const text = await resp.text();
      lastErr = { status: resp.status, details: text };
      if (!RETRY_STATUSES.has(resp.status)) break;
    } catch (e) { lastErr = { details: (e as Error).message }; }
    if (attempt < 1) await new Promise((r) => setTimeout(r, 500));
  }
  return { error: lastErr } as { error: { status?: number; details: string } };
}

async function callOpenAICompat(url: string, key: string, model: string, system: string, user: string) {
  try {
    const resp = await fetchWithTimeout(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model,
        messages: [{ role: "system", content: system }, { role: "user", content: user }],
        temperature: 0.5,
      }),
    }, 20000);
    if (!resp.ok) return { error: { status: resp.status, details: await resp.text() } };
    const data = await resp.json();
    return { text: data?.choices?.[0]?.message?.content ?? "" };
  } catch (e) { return { error: { details: (e as Error).message } }; }
}

async function runChain(system: string, user: string): Promise<{ text: string } | { error: { status?: number; details: string } }> {
  const geminiKey = Deno.env.get("GEMINI_API_KEY");
  if (geminiKey) {
    const r = await callGemini(geminiKey, {
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: "user", parts: [{ text: user }] }],
      generationConfig: { responseMimeType: "application/json", temperature: 0.5 },
    });
    if (r instanceof Response) {
      const data = await r.json();
      const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
      if (text) return { text };
    }
  }
  const lovKey = Deno.env.get("LOVABLE_API_KEY");
  if (lovKey) {
    const r = await callOpenAICompat("https://ai.gateway.lovable.dev/v1/chat/completions", lovKey, "google/gemini-3-flash-preview", system, user);
    if ("text" in r && r.text) return r;
  }
  const nvKey = Deno.env.get("Nvidia_API");
  if (nvKey) {
    const r = await callOpenAICompat("https://integrate.api.nvidia.com/v1/chat/completions", nvKey, "meta/llama-3.3-70b-instruct", system, user);
    if ("text" in r && r.text) return r;
  }
  return { error: { details: "All providers failed" } };
}

function buildBulletsMessage(action: string, jobTitle: string, company: string, currentBullets: string[], originalBullets: string[], intent: any) {
  const cur = currentBullets.map((b, i) => `${i + 1}. ${b}`).join("\n");
  const orig = originalBullets.length ? originalBullets.map((b, i) => `${i + 1}. ${b}`).join("\n") : "(none)";
  const targetRoles = Array.isArray(intent?.targetRoles) ? intent.targetRoles.join(", ") : "";
  const seniority = intent?.seniority ?? "";
  const tone = intent?.tone ?? "";
  const industry = intent?.industry ?? intent?.targetIndustry ?? "";
  const functionArea = intent?.function ?? intent?.functionArea ?? "";

  const common = `Current bullets:\n${cur}\n\nOriginal bullets for reference:\n${orig}\n\nSeniority: ${seniority} | Tone: ${tone}\nReturn JSON: { "bullets": [string, ...] }`;

  if (action === "condense") return `Condense these bullet points for ${jobTitle} at ${company}. Merge related points; keep 3-4 strongest bullets focused on outcomes.\n\n${common}`;
  if (action === "expand") return `EXPAND these bullet points for ${jobTitle} at ${company}. Add depth, context, and scope. Aim for 6-8 detailed bullets covering every responsibility hinted in the source.\n\n${common}`;
  return `Rewrite to be optimised for ${targetRoles} in ${industry}. Function: ${functionArea}. Retain factual content but reframe emphasis and vocabulary.\n\n${common}`;
}

function buildSummaryMessage(action: string, currentSummary: string, intent: any) {
  const targetRoles = Array.isArray(intent?.targetRoles) ? intent.targetRoles.join(", ") : "";
  const seniority = intent?.seniority ?? "";
  const tone = intent?.tone ?? "";
  const industry = intent?.industry ?? intent?.targetIndustry ?? "";
  const functionArea = intent?.function ?? intent?.functionArea ?? "";
  const common = `Current summary:\n"""\n${currentSummary}\n"""\nTarget roles: ${targetRoles} | Function: ${functionArea} | Industry: ${industry}\nSeniority: ${seniority} | Tone: ${tone}\nReturn JSON: { "summary": string }`;

  if (action === "expand") return `EXPAND this CV professional summary into 5-7 substantive sentences (130-180 words). Add depth on the candidate's specialism, scope of responsibility, and the value they bring to their target role. Do not invent facts.\n\n${common}`;
  if (action === "condense") return `CONDENSE this CV professional summary into 2-3 punchy sentences (40-70 words) optimised for the target role.\n\n${common}`;
  return `REWRITE this CV professional summary to better position the candidate for ${targetRoles}. Keep length similar (4-6 sentences). Sharpen positioning and vocabulary; do not invent facts.\n\n${common}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const body = await req.json().catch(() => ({}));
    const action: string = body.action ?? "";
    const kind: string = body.kind ?? "bullets";

    if (!["condense", "expand", "tailor", "rewrite"].includes(action)) {
      return new Response(JSON.stringify({ error: "Invalid action" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400,
      });
    }

    if (kind === "summary") {
      const currentSummary: string = (body.currentSummary ?? "").toString();
      if (!currentSummary.trim()) {
        return new Response(JSON.stringify({ error: "No summary to rewrite" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400,
        });
      }
      const act = action === "tailor" ? "rewrite" : action;
      const user = buildSummaryMessage(act, currentSummary, body.intentForm ?? {});
      const r = await runChain(SYSTEM_PROMPT, user);
      if ("error" in r) {
        return new Response(JSON.stringify({ error: "AI request failed", details: r.error.details, status: r.error.status }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 502,
        });
      }
      try {
        const parsed = JSON.parse(stripFences(r.text));
        const summary = (parsed?.summary ?? parsed?.text ?? "").toString().trim();
        if (!summary) throw new Error("No summary returned");
        return new Response(JSON.stringify({ summary }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200,
        });
      } catch {
        return new Response(JSON.stringify({ error: "Failed to parse AI response" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500,
        });
      }
    }

    // bullets path (default)
    const jobTitle: string = body.jobTitle ?? "";
    const company: string = body.company ?? "";
    const currentBullets: string[] = Array.isArray(body.currentBullets)
      ? body.currentBullets.map((b: unknown) => String(b ?? "").trim()).filter((s: string) => s.length > 0) : [];
    const originalBullets: string[] = Array.isArray(body.originalBullets)
      ? body.originalBullets.map((b: unknown) => String(b ?? "").trim()).filter((s: string) => s.length > 0) : [];
    if (currentBullets.length === 0) {
      return new Response(JSON.stringify({ error: "No bullets to rewrite" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400,
      });
    }
    const act = action === "rewrite" ? "tailor" : action;
    const user = buildBulletsMessage(act, jobTitle, company, currentBullets, originalBullets, body.intentForm ?? {});
    const r = await runChain(SYSTEM_PROMPT, user);
    if ("error" in r) {
      return new Response(JSON.stringify({ error: "AI request failed", details: r.error.details, status: r.error.status }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 502,
      });
    }
    try {
      const parsed = JSON.parse(stripFences(r.text));
      const arr = Array.isArray(parsed) ? parsed : parsed?.bullets;
      if (!Array.isArray(arr)) throw new Error("Not an array");
      const bullets = arr.map((b: unknown) => String(b ?? "").trim()).filter((s: string) => s.length > 0);
      if (bullets.length === 0) throw new Error("Empty");
      return new Response(JSON.stringify({ bullets }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200,
      });
    } catch {
      return new Response(JSON.stringify({ error: "Failed to parse section rewrite" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500,
      });
    }
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500,
    });
  }
});
