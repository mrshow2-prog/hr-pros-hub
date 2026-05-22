import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
const LOVABLE_AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const LOVABLE_MODEL = "google/gemini-3-flash-preview";

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

async function scoreWithLovableAI(userMessage: string) {
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) throw new Error("LOVABLE_API_KEY is not configured");

  const resp = await fetchWithTimeout(LOVABLE_AI_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: LOVABLE_MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
      tools: [ATS_TOOL_SCHEMA],
      tool_choice: { type: "function", function: { name: "return_ats_score" } },
    }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    console.error("Lovable AI fallback error:", resp.status, text);
    throw new Error("AI fallback request failed");
  }

  const data = await resp.json();
  const args = data?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
  const content = data?.choices?.[0]?.message?.content;
  const raw = args ?? content ?? "";

  try {
    return JSON.parse(stripFences(raw));
  } catch (_e) {
    console.error("Failed to parse AI fallback response:", raw);
    throw new SyntaxError("Failed to parse AI response");
  }
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
      if (resp.status === 429 || t.includes("RESOURCE_EXHAUSTED") || t.toLowerCase().includes("quota")) {
        aiScore = await scoreWithLovableAI(userMessage);
      } else {
        return new Response(JSON.stringify({ error: "Gemini request failed" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        });
      }
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
