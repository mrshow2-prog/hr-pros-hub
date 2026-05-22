import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
const LOVABLE_AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const LOVABLE_MODEL = "google/gemini-3-flash-preview";

const SYSTEM_PROMPT = `You are an expert CV consultant. Analyze the provided CV text against the candidate's target role, function, seniority, industry, and CV type. Identify 4-6 specific, actionable gaps. Return ONLY a JSON array with no markdown, no explanation, no code fences. Each gap object must have exactly these fields:
- id: string (slug, e.g. 'weak-bullets')
- category: string (e.g. 'Weak bullet points')
- example: string (a specific quote or observation from their actual CV)
- question: string (a targeted question to help them provide missing context)`;

function stripFences(text: string): string {
  return text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
}

const GAPS_TOOL_SCHEMA = {
  type: "function" as const,
  function: {
    name: "return_cv_gaps",
    description: "Return specific CV gap analysis questions.",
    parameters: {
      type: "object",
      properties: {
        gaps: {
          type: "array",
          minItems: 4,
          maxItems: 6,
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              category: { type: "string" },
              example: { type: "string" },
              question: { type: "string" },
            },
            required: ["id", "category", "example", "question"],
            additionalProperties: false,
          },
        },
      },
      required: ["gaps"],
      additionalProperties: false,
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

async function generateGapsWithLovableAI(userMessage: string) {
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
      tools: [GAPS_TOOL_SCHEMA],
      tool_choice: { type: "function", function: { name: "return_cv_gaps" } },
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
    const parsed = JSON.parse(stripFences(raw));
    return parsed.gaps ?? parsed;
  } catch (_e) {
    console.error("Failed to parse AI fallback response:", raw);
    throw new SyntaxError("Failed to parse AI response");
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
    const parsedText: string = body.parsedText ?? "";
    const intent = body.intentForm ?? {};

    const userMessage = `CV TEXT: ${parsedText}
TARGET ROLES: ${JSON.stringify(intent.targetRoles ?? intent.targetRole ?? "")}
FUNCTION: ${intent.function ?? ""}
SENIORITY: ${intent.seniority ?? ""}
INDUSTRY: ${intent.industry || "Not industry-specific"}
CV TYPE: ${intent.cvType ?? ""}`;

    const resp = await fetchWithTimeout(`${GEMINI_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: "user", parts: [{ text: userMessage }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.6 },
      }),
    });

    if (!resp.ok) {
      const t = await resp.text();
      console.error("Gemini error:", resp.status, t);
      if (resp.status === 429 || t.includes("RESOURCE_EXHAUSTED") || t.toLowerCase().includes("quota")) {
        const gaps = await generateGapsWithLovableAI(userMessage);
        return new Response(JSON.stringify({ gaps }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
      return new Response(JSON.stringify({ error: "Gemini request failed" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    const data = await resp.json();
    const raw: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    let gaps: unknown;
    try {
      gaps = JSON.parse(stripFences(raw));
    } catch (e) {
      console.error("Failed to parse Gemini response:", raw);
      return new Response(JSON.stringify({ error: "Failed to parse AI response" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    return new Response(JSON.stringify({ gaps }), {
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
