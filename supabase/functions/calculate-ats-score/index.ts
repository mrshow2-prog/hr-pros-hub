import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const GEMINI_MODELS = ["gemini-2.5-flash", "gemini-2.5-flash-lite"];
const RETRY_STATUSES = new Set([429, 500, 502, 503, 504]);

const SYSTEM_PROMPT = `You are an ATS (Applicant Tracking System) expert.
Evaluate the provided CV text against the target role and function. Return ONLY a JSON object with no markdown, no explanation, no code fences:
{
  overall: number (0-100),
  keywordMatch: number (0-100),
  formattingCompliance: boolean,
  readabilityScore: number (0-100),
  breakdown: [{ label: string, status: 'pass'|'fail'|'warn', note: string }]
}`;

function stripFences(text: string): string {
  return text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
}

const ATS_TOOL_SCHEMA = {
  type: "function" as const,
  function: {
    name: "return_ats_score",
    description: "Return the ATS score assessment.",
    parameters: {
      type: "object",
      properties: {
        overall: { type: "number" },
        keywordMatch: { type: "number" },
        formattingCompliance: { type: "boolean" },
        readabilityScore: { type: "number" },
        breakdown: {
          type: "array",
          items: {
            type: "object",
            properties: {
              label: { type: "string" },
              status: { type: "string", enum: ["pass", "fail", "warn"] },
              note: { type: "string" },
            },
            required: ["label", "status", "note"],
            additionalProperties: false,
          },
        },
      },
      required: ["overall", "keywordMatch", "formattingCompliance", "readabilityScore", "breakdown"],
      additionalProperties: true,
    },
  },
};

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


function cvToText(cv: any): string {
  if (!cv) return "";
  if (typeof cv === "string") return cv;
  const parts: string[] = [];
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
  return parts.join("\n");
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
    const intent = body.intentForm ?? {};
    const targetRoles = intent.targetRoles ?? intent.targetRole ?? body.targetRole ?? "";
    const generatedCVText =
      body.generatedCVText ?? cvToText(body.generatedCV) ?? body.parsedText ?? "";

    const userMessage = `CV: ${generatedCVText}
TARGET ROLES: ${JSON.stringify(targetRoles)}
FUNCTION: ${intent.function ?? ""}`;

    const resp = await fetchWithTimeout(`${GEMINI_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: "user", parts: [{ text: userMessage }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.3 },
      }),
    });

    let aiScore: any;
    if (!resp.ok) {
      const t = await resp.text();
      console.error("Gemini error:", resp.status, t);
      return new Response(
        JSON.stringify({
          error: `Gemini API error ${resp.status}`,
          status: resp.status,
          details: t,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 502 },
      );
    }

    if (!aiScore) {
      const data = await resp.json();
      const raw: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
      try {
        aiScore = JSON.parse(stripFences(raw));
      } catch {
        console.error("Failed to parse Gemini response:", raw);
        return new Response(JSON.stringify({ error: "Failed to parse AI response" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        });
      }
    }

    // Adapt to client-side shape used by StepDraft (formatting checklist + readability number).
    const formatting = (aiScore.breakdown ?? []).map((b: any) => ({
      label: b.label,
      pass: b.status === "pass",
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
    };

    return new Response(JSON.stringify({ atsScore }), {
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
