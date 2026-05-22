import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { extractText, getDocumentProxy } from "npm:unpdf@0.12.1";
import mammoth from "npm:mammoth@1.8.0";

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
const LOVABLE_AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const LOVABLE_MODEL = "google/gemini-3-flash-preview";

const SYSTEM_PROMPT = `You are rewriting a real person's CV. You must use ONLY the information provided in the CV TEXT below. Do not invent companies, job titles, dates, locations, metrics, names, or any other details. Every piece of information in your output must be traceable to the original CV text.

What you SHOULD do:
- Rewrite weak bullet points with stronger verbs and better framing
- Add metrics only where they already exist in the CV — do not invent numbers
- Write a summary grounded in the person's actual background
- Calibrate language to the seniority and target role
- Extract the actual name, contact details, companies, dates, and locations from the CV

What you must NEVER do:
- Invent company names
- Invent metrics or percentages not in the CV
- Change locations
- Change dates
- Add roles that do not exist in the CV
- Use placeholder names like 'Tech Solutions Inc'

Return ONLY a valid JSON object with no markdown and no code fences.`;

function stripFences(text: string): string {
  return text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
}

const CV_TOOL_SCHEMA = {
  type: "function" as const,
  function: {
    name: "return_rewritten_cv",
    description: "Return the fully rewritten CV grounded in the provided CV text.",
    parameters: {
      type: "object",
      properties: {
        name: { type: "string" },
        jobTitle: { type: "string" },
        email: { type: "string" },
        phone: { type: "string" },
        location: { type: "string" },
        linkedIn: { type: "string" },
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
      required: [
        "name",
        "jobTitle",
        "email",
        "phone",
        "location",
        "linkedIn",
        "summary",
        "experience",
        "skills",
        "education",
        "languages",
      ],
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

async function extractFromFile(bytes: Uint8Array, name: string): Promise<string> {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  try {
    if (ext === "pdf") {
      const pdf = await getDocumentProxy(bytes);
      const { text } = await extractText(pdf, { mergePages: true });
      return Array.isArray(text) ? text.join("\n") : text;
    }
    if (ext === "docx") {
      const { value } = await mammoth.extractRawText({ buffer: bytes });
      return value ?? "";
    }
    if (ext === "doc") {
      return new TextDecoder().decode(bytes);
    }
  } catch (e) {
    console.error(`Extract failed for ${name}:`, (e as Error).message);
  }
  return "";
}

function buildUserMessage(parsedText: string, intent: any, gapResponses: any) {
  const targetRoles = Array.isArray(intent?.targetRoles)
    ? intent.targetRoles.join(", ")
    : intent?.targetRoles ?? intent?.targetRole ?? "";
  const functionArea = intent?.function ?? intent?.functionArea ?? "";
  const industry = intent?.industry ?? intent?.targetIndustry ?? "Not industry-specific";

  return `CV TEXT (use this as your only source of truth):
---
${parsedText}
---

TARGET ROLES: ${targetRoles}
FUNCTION: ${functionArea}
SENIORITY: ${intent?.seniority ?? ""}
INDUSTRY: ${industry}
CV TYPE: ${intent?.cvType ?? ""}
TONE: ${intent?.tone ?? ""}
GAP RESPONSES: ${JSON.stringify(gapResponses ?? {})}

Return ONLY a valid JSON object, no markdown, no code fences, matching this exact structure:
{
  "name": string,
  "jobTitle": string,
  "email": string,
  "phone": string,
  "location": string,
  "linkedIn": string,
  "summary": string,
  "experience": [{
    "id": string,
    "jobTitle": string,
    "company": string,
    "location": string,
    "from": string,
    "to": string,
    "bullets": [{
      "id": string,
      "original": string,
      "rewritten": string,
      "explanation": string
    }]
  }],
  "skills": [string],
  "education": [{
    "id": string,
    "institution": string,
    "qualification": string,
    "year": string
  }],
  "competencyClusters": [{
    "id": string,
    "title": string,
    "items": [string]
  }],
  "languages": [{
    "language": string,
    "proficiency": string
  }]
}`;
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
  const fallbackRole =
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
      name: ai.name ?? "",
      jobTitle: ai.jobTitle ?? fallbackRole,
      email: ai.email ?? "",
      phone: ai.phone ?? "",
      location: ai.location ?? "",
      linkedinUrl: ai.linkedIn ?? ai.linkedinUrl ?? "",
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
    let parsedText: string = body.parsedText ?? "";
    const intent = body.intentForm ?? {};
    const gapResponses = body.gapResponses ?? body.gapAnalysis?.responses ?? {};
    const uploadedFiles: Array<{ path: string; name: string }> = body.uploadedFiles ?? [];

    console.log("generate-cv parsedText length:", parsedText?.length ?? 0);
    console.log("generate-cv parsedText preview:", parsedText?.slice(0, 300));
    console.log("generate-cv uploadedFiles:", uploadedFiles.map((f) => f.name));

    const looksPlaceholder =
      !parsedText ||
      parsedText.length < 200 ||
      /Parsed content will be extracted server-side/i.test(parsedText);

    if (looksPlaceholder && uploadedFiles.length > 0) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const admin = createClient(supabaseUrl, serviceKey);

      const chunks: string[] = [];
      for (const f of uploadedFiles) {
        const { data, error } = await admin.storage
          .from("cv-builder-uploads")
          .download(f.path);
        if (error || !data) {
          console.error("Download failed for", f.path, error);
          continue;
        }
        const bytes = new Uint8Array(await data.arrayBuffer());
        const text = await extractFromFile(bytes, f.name);
        console.log(`Extracted ${text.length} chars from ${f.name}`);
        if (text.trim().length > 0) chunks.push(text);
      }
      parsedText = chunks.join("\n\n---\n\n");
      console.log("Server-side parsedText length:", parsedText.length);
    }

    if (!parsedText || parsedText.trim().length < 100) {
      return new Response(
        JSON.stringify({
          error: "CV text too short or empty — PDF may not have parsed correctly",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 },
      );
    }

    const userMessage = buildUserMessage(parsedText, intent, gapResponses);

    const resp = await fetchWithTimeout(`${GEMINI_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: "user", parts: [{ text: userMessage }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.4 },
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
