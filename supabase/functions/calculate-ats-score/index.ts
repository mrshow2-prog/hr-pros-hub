import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

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
    const generatedCVText =
      body.generatedCVText ?? cvToText(body.generatedCV) ?? body.parsedText ?? "";

    const userMessage = `CV: ${generatedCVText}
TARGET ROLES: ${JSON.stringify(intent.targetRoles ?? intent.targetRole ?? "")}
FUNCTION: ${intent.function ?? ""}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);

    const resp = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: "user", parts: [{ text: userMessage }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.3 },
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

    let aiScore: any;
    try {
      aiScore = JSON.parse(stripFences(raw));
    } catch {
      console.error("Failed to parse Gemini response:", raw);
      return new Response(JSON.stringify({ error: "Failed to parse AI response" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
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
