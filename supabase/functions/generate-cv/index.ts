import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

const SYSTEM_PROMPT = `You are an expert CV writer. Using the original CV text, the gap analysis responses, and the candidate's target details, produce a fully rewritten, ATS-optimised CV.
Rules:
- Rewrite every bullet point to lead with a strong action verb and include a measurable outcome where possible
- Calibrate language and depth to the seniority level
- Tailor the professional summary to the target roles and function
- For Skills-based or Hybrid CV type, produce competency clusters instead of or alongside chronological experience
- For each rewritten bullet, include the original text and a one-line explanation of what changed and why
Return ONLY a JSON object with no markdown, no explanation, no code fences, with this structure:
{
  summary: string,
  experience: [{
    id: string,
    jobTitle: string,
    company: string,
    location: string,
    from: string,
    to: string,
    bullets: [{
      id: string,
      original: string,
      rewritten: string,
      explanation: string
    }]
  }],
  skills: string[],
  education: [{
    id: string,
    institution: string,
    qualification: string,
    year: string
  }],
  competencyClusters: [{
    id: string,
    title: string,
    items: string[]
  }],
  languages: [{
    language: string,
    proficiency: string
  }]
}`;

function stripFences(text: string): string {
  return text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
}

function adaptToClientShape(ai: any, intent: any) {
  const role =
    intent?.targetRoles?.[0] || intent?.targetRole || "Professional";
  const experience = (ai.experience ?? []).map((e: any, i: number) => ({
    id: e.id ?? `exp-${i + 1}`,
    company: e.company ?? "",
    role: e.jobTitle ?? e.role ?? "",
    location: e.location ?? "",
    startDate: e.from ?? e.startDate ?? "",
    endDate: e.to ?? e.endDate ?? "",
    bullets: (e.bullets ?? []).map((b: any, j: number) => ({
      id: b.id ?? `b-${i + 1}-${j + 1}`,
      original: b.original ?? "",
      rewrite: b.rewritten ?? b.rewrite ?? "",
      explanation: b.explanation ?? "",
      status: "accepted" as const,
    })),
  }));
  const education = (ai.education ?? []).map((ed: any, i: number) => ({
    id: ed.id ?? `ed-${i + 1}`,
    institution: ed.institution ?? "",
    qualification: ed.qualification ?? "",
    period: ed.year ?? ed.period ?? "",
  }));
  const competencyClusters = (ai.competencyClusters ?? []).map((c: any, i: number) => ({
    id: c.id ?? `cl-${i + 1}`,
    title: c.title ?? "",
    items: c.items ?? [],
  }));
  const languages = (ai.languages ?? []).map((l: any, i: number) => ({
    id: `lang-${i + 1}`,
    name: l.language ?? l.name ?? "",
    level: l.proficiency ?? l.level ?? "",
  }));

  return {
    contact: {
      name: "",
      jobTitle: role,
      email: "",
      phone: "",
      location: "",
      linkedinUrl: "",
      photoPath: null,
    },
    summary: ai.summary ?? "",
    experience,
    skills: ai.skills ?? [],
    education,
    competencyClusters,
    languages,
    hiddenSections: [],
  };
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
    const gapResponses = body.gapResponses ?? body.gapAnalysis?.responses ?? {};

    const userMessage = `CV TEXT: ${parsedText}
TARGET ROLES: ${JSON.stringify(intent.targetRoles ?? intent.targetRole ?? "")}
FUNCTION: ${intent.function ?? ""}
SENIORITY: ${intent.seniority ?? ""}
INDUSTRY: ${intent.industry || "Not industry-specific"}
CV TYPE: ${intent.cvType ?? ""}
TONE: ${intent.tone ?? ""}
GAP RESPONSES: ${JSON.stringify(gapResponses)}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);

    const resp = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: "user", parts: [{ text: userMessage }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.7 },
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

    const generatedCV = adaptToClientShape(parsed, intent);

    return new Response(JSON.stringify({ generatedCV }), {
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
