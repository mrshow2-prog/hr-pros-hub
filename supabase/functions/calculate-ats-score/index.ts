import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const GEMINI_MODELS = ["gemini-2.5-flash-lite"];
const RETRY_STATUSES = new Set([429, 500, 502, 503, 504]);

const SYSTEM_PROMPT = `You are an ATS (Applicant Tracking System) expert.
Evaluate the provided CV text against the target role and function. Return ONLY a JSON object with no markdown, no explanation, no code fences:
{
  "overall": number (0-100),
  "keywordMatch": number (0-100),
  "formattingCompliance": boolean,
  "readabilityScore": number (0-100),
  "breakdown": [{ "label": string, "status": "pass"|"fail"|"warn", "note": string }]
}`;

function stripFences(text: string): string {
  return text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
}

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs = 25000) {
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
  timeoutMs = 25000,
): Promise<Response | { error: { status?: number; details: string } }> {
  let lastErr: { status?: number; details: string } = { details: "Unknown error" };
  for (let attempt = 0; attempt < 2; attempt++) {
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
      if (!RETRY_STATUSES.has(resp.status)) break;
    } catch (e) {
      lastErr = { details: (e as Error).message };
    }
    if (attempt < 1) await new Promise((r) => setTimeout(r, 600));
  }
  return { error: lastErr };
}

async function callOpenAICompat(
  url: string, apiKey: string, model: string, system: string, user: string, timeoutMs: number,
): Promise<{ text: string } | { error: { status?: number; details: string } }> {
  try {
    const resp = await fetchWithTimeout(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        temperature: 0.3,
      }),
    }, timeoutMs);
    if (!resp.ok) {
      const text = await resp.text();
      return { error: { status: resp.status, details: text } };
    }
    const data = await resp.json();
    const text: string = data?.choices?.[0]?.message?.content ?? "";
    return { text };
  } catch (e) {
    return { error: { details: (e as Error).message } };
  }
}

async function runProvider(
  provider: string, system: string, user: string, timeoutMs: number,
): Promise<{ text: string } | { error: { status?: number; details: string } }> {
  if (provider === "nvidia") {
    const key = Deno.env.get("Nvidia_API");
    if (!key) return { error: { details: "Nvidia_API not configured" } };
    return await callOpenAICompat(
      "https://integrate.api.nvidia.com/v1/chat/completions",
      key, "meta/llama-3.3-70b-instruct", system, user, timeoutMs,
    );
  }
  if (provider === "lovable") {
    const key = Deno.env.get("LOVABLE_API_KEY");
    if (!key) return { error: { details: "LOVABLE_API_KEY not configured" } };
    return await callOpenAICompat(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      key, "google/gemini-3-flash-preview", system, user, timeoutMs,
    );
  }
  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) return { error: { details: "GEMINI_API_KEY not configured" } };
  const result = await callGeminiWithRetry(apiKey, {
    systemInstruction: { parts: [{ text: system }] },
    contents: [{ role: "user", parts: [{ text: user }] }],
    generationConfig: { responseMimeType: "application/json", temperature: 0.3 },
  }, timeoutMs);
  if (!(result instanceof Response)) return { error: result.error };
  const data = await result.json();
  const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  return { text };
}

function cvToText(cv: any): string {
  if (!cv) return "";
  if (typeof cv === "string") return cv;
  const parts: string[] = [];
  if (cv.contact?.name) parts.push(`NAME: ${cv.contact.name}`);
  if (cv.contact?.jobTitle) parts.push(`TARGET TITLE: ${cv.contact.jobTitle}`);
  if (cv.summary) parts.push(`SUMMARY: ${cv.summary}`);
  if (Array.isArray(cv.experience)) {
    for (const e of cv.experience) {
      parts.push(`\n${e.role ?? e.jobTitle ?? ""} @ ${e.company ?? ""} (${e.startDate ?? e.from ?? ""} - ${e.endDate ?? e.to ?? ""})`);
      for (const b of e.bullets ?? []) {
        parts.push(`- ${b.rewrite ?? b.rewritten ?? b.original ?? ""}`);
      }
    }
  }
  if (Array.isArray(cv.skills)) parts.push(`\nSKILLS: ${cv.skills.join(", ")}`);
  if (Array.isArray(cv.education)) {
    parts.push("\nEDUCATION:");
    for (const ed of cv.education) parts.push(`- ${ed.qualification ?? ""} @ ${ed.institution ?? ""}`);
  }
  return parts.join("\n");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const intent = body.intentForm ?? {};
    const targetRoles = intent.targetRoles ?? intent.targetRole ?? body.targetRole ?? "";
    const generatedCVText =
      body.generatedCVText ?? cvToText(body.generatedCV) ?? body.parsedText ?? "";

    const userMessage = `CV:\n${generatedCVText}\n\nTARGET ROLES: ${JSON.stringify(targetRoles)}\nFUNCTION: ${intent.function ?? intent.functionArea ?? ""}`;

    const requested: string = body.provider ?? "auto";
    // Try a small chain: requested → fallbacks (skipping requested).
    const chain = requested === "auto"
      ? ["gemini", "lovable", "nvidia"]
      : [requested, ...["gemini", "lovable", "nvidia"].filter((p) => p !== requested)];

    let aiScore: any = null;
    let lastErr: { status?: number; details: string } | null = null;
    let usedProvider = "";
    for (const p of chain) {
      const r = await runProvider(p, SYSTEM_PROMPT, userMessage, 25000);
      if ("error" in r) { lastErr = r.error; console.log(`ats: ${p} failed`, r.error.status); continue; }
      try {
        aiScore = JSON.parse(stripFences(r.text));
        usedProvider = p;
        break;
      } catch {
        lastErr = { details: "Failed to parse AI response" };
        continue;
      }
    }

    if (!aiScore) {
      return new Response(
        JSON.stringify({
          error: lastErr?.status ? `ATS API error ${lastErr.status}` : "ATS request failed",
          status: lastErr?.status,
          details: lastErr?.details,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 502 },
      );
    }

    const formatting = (aiScore.breakdown ?? []).map((b: any) => ({
      label: b.label, pass: b.status === "pass",
    }));

    const atsScore = {
      overall: aiScore.overall ?? 0,
      keywordMatch: aiScore.keywordMatch ?? 0,
      formatting: formatting.length
        ? formatting
        : [{ label: "Formatting compliance", pass: !!aiScore.formattingCompliance }],
      readability: aiScore.readabilityScore ?? 0,
      breakdown: aiScore.breakdown ?? [],
      formattingCompliance: !!aiScore.formattingCompliance,
      provider: usedProvider,
    };

    return new Response(JSON.stringify({ atsScore }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200,
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500,
    });
  }
});
