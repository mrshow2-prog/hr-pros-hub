import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
const LOVABLE_AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const LOVABLE_MODEL = "google/gemini-3-flash-preview";

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

const CV_TOOL_SCHEMA = {
  type: "function" as const,
  function: {
    name: "return_rewritten_cv",
    description: "Return the fully rewritten CV in the requested structure.",
    parameters: {
      type: "object",
      properties: {
        summary: { type: "string" },
        experience: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              jobTitle: { type: "string" },
              company: { type: "string" },
              location: { type: "string" },
              from: { type: "string" },
              to: { type: "string" },
              bullets: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    original: { type: "string" },
                    rewritten: { type: "string" },
                    explanation: { type: "string" },
                  },
                  required: ["id", "original", "rewritten", "explanation"],
                  additionalProperties: false,
                },
              },
            },
            required: ["id", "jobTitle", "company", "location", "from", "to", "bullets"],
            additionalProperties: false,
          },
        },
        skills: { type: "array", items: { type: "string" } },
        education: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              institution: { type: "string" },
              qualification: { type: "string" },
              year: { type: "string" },
            },
            required: ["id", "institution", "qualification", "year"],
            additionalProperties: false,
          },
        },
        competencyClusters: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              title: { type: "string" },
              items: { type: "array", items: { type: "string" } },
            },
            required: ["id", "title", "items"],
            additionalProperties: false,
          },
        },
        languages: {
          type: "array",
          items: {
            type: "object",
            properties: {
              language: { type: "string" },
              proficiency: { type: "string" },
            },
            required: ["language", "proficiency"],
            additionalProperties: false,
          },
        },
      },
      required: ["summary", "experience", "skills", "education", "competencyClusters", "languages"],
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

async function generateCVWithLovableAI(userMessage: string) {
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
      tools: [CV_TOOL_SCHEMA],
      tool_choice: { type: "function", function: { name: "return_rewritten_cv" } },
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

    const resp = await fetchWithTimeout(`${GEMINI_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: "user", parts: [{ text: userMessage }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.7 },
      }),
    });

    if (!resp.ok) {
      const t = await resp.text();
      console.error("Gemini error:", resp.status, t);
      if (resp.status === 429 || t.includes("RESOURCE_EXHAUSTED") || t.toLowerCase().includes("quota")) {
        const generatedCV = adaptToClientShape(await generateCVWithLovableAI(userMessage), intent);
        return new Response(JSON.stringify({ generatedCV }), {
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
