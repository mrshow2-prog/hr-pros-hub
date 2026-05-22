import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

const SYSTEM_PROMPT = `You are an expert CV consultant. Analyze the provided CV text against the candidate's target role, function, seniority, industry, and CV type. Identify 4-6 specific, actionable gaps. Return ONLY a JSON array with no markdown, no explanation, no code fences. Each gap object must have exactly these fields:
- id: string (slug, e.g. 'weak-bullets')
- category: string (e.g. 'Weak bullet points')
- example: string (a specific quote or observation from their actual CV)
- question: string (a targeted question to help them provide missing context)`;

function stripFences(text: string): string {
  return text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
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

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);

    const resp = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: "user", parts: [{ text: userMessage }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.6 },
      }),
    }).finally(() => clearTimeout(timeout));

    if (!resp.ok) {
      const t = await resp.text();
      console.error("Gemini error:", resp.status, t);
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
