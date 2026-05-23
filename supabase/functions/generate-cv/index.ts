import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { extractText, getDocumentProxy } from "npm:unpdf@0.12.1";
import mammoth from "npm:mammoth@1.8.0";

const GEMINI_MODELS = ["gemini-2.5-flash-lite"];
const RETRY_STATUSES = new Set([429, 500, 502, 503, 504]);

const SYSTEM_PROMPT = `You are rewriting a real person's CV. You must use ONLY the information provided in the CV TEXT below. Do not invent companies, job titles, dates, locations, metrics, names, or any other details. Every piece of information in your output must be traceable to the original CV text or the user's gap responses.

What you SHOULD do:
- Rewrite weak bullet points with stronger verbs and better framing
- Add metrics only where they already exist in the CV or gap responses — do not invent numbers
- Write a substantive professional summary (4–6 sentences, 80–130 words) grounded in the person's actual background, target role, seniority, and industry. Do NOT write a 1–2 sentence summary.
- For EACH role, produce DETAILED bullet points covering responsibilities AND achievements present in the source CV. Default to EXPANDING content rather than condensing it. If a role mentions 6 responsibilities, write 6 bullets — do not collapse them into 1–2.
- If the user provided gap responses confirming additional responsibilities ("Yes" answers), INCORPORATE those into the relevant role's bullets as new bullets.
- Calibrate language to the seniority and target role
- Extract the actual name, contact details, companies, dates, and locations from the CV

PAGE LIMIT CALIBRATION:
- If pageLimit is null/"unlimited": expand fully. Aim for 5–8 detailed bullets per role. Do not omit responsibilities.
- If pageLimit is 1: aim for 2–3 high-impact bullets per role and a 2–3 sentence summary.
- If pageLimit is 2: aim for 4–5 bullets per role and a 4-sentence summary.
- If pageLimit is 3+: aim for 6–8 bullets per role with full responsibility coverage.

What you must NEVER do:
- Invent company names, metrics, percentages, locations, dates, or roles
- Use placeholder names like 'Tech Solutions Inc'
- Truncate a role to fewer bullets than the source CV provides unless pageLimit forces it

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

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs = 90000) {
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
  timeoutMs = 90000,
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

async function callOpenAICompat(
  url: string,
  apiKey: string,
  model: string,
  system: string,
  user: string,
  timeoutMs: number,
): Promise<{ text: string } | { error: { status?: number; details: string } }> {
  try {
    const resp = await fetchWithTimeout(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        temperature: 0.4,
      }),
    }, timeoutMs);
    if (!resp.ok) {
      const text = await resp.text();
      console.error(`${model} call failed:`, resp.status, text);
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
  provider: string,
  system: string,
  user: string,
  timeoutMs: number,
): Promise<{ text: string } | { error: { status?: number; details: string } }> {
  if (provider === "nvidia") {
    const key = Deno.env.get("Nvidia_API");
    if (!key) return { error: { details: "Nvidia_API not configured" } };
    return await callOpenAICompat(
      "https://integrate.api.nvidia.com/v1/chat/completions",
      key,
      "meta/llama-3.3-70b-instruct",
      system,
      user,
      timeoutMs,
    );
  }
  if (provider === "lovable") {
    const key = Deno.env.get("LOVABLE_API_KEY");
    if (!key) return { error: { details: "LOVABLE_API_KEY not configured" } };
    return await callOpenAICompat(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      key,
      "google/gemini-3-flash-preview",
      system,
      user,
      timeoutMs,
    );
  }
  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) return { error: { details: "GEMINI_API_KEY not configured" } };
  const result = await callGeminiWithRetry(apiKey, {
    systemInstruction: { parts: [{ text: system }] },
    contents: [{ role: "user", parts: [{ text: user }] }],
    generationConfig: { responseMimeType: "application/json", temperature: 0.4 },
  }, timeoutMs);
  if (!(result instanceof Response)) return { error: result.error };
  const data = await result.json();
  const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  return { text };
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

function buildUserMessage(parsedText: string, intent: any, gapResponses: any, pageLimit: number | null) {
  const targetRoles = Array.isArray(intent?.targetRoles)
    ? intent.targetRoles.join(", ")
    : intent?.targetRoles ?? intent?.targetRole ?? "";
  const functionArea = intent?.function ?? intent?.functionArea ?? "";
  const industry = intent?.industry ?? intent?.targetIndustry ?? "Not industry-specific";

  const gapsPretty = (() => {
    if (!gapResponses || typeof gapResponses !== "object") return "(none)";
    const lines: string[] = [];
    for (const [k, v] of Object.entries(gapResponses)) {
      if (v && typeof v === "object") {
        const o = v as any;
        lines.push(`- ${k}: confirm=${o.confirm ?? ""}${o.details ? ` | details: ${o.details}` : ""}`);
      } else if (v) {
        lines.push(`- ${k}: ${v}`);
      }
    }
    return lines.length ? lines.join("\n") : "(none)";
  })();

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
PAGE LIMIT: ${pageLimit === null || pageLimit === undefined ? "unlimited (expand fully)" : `${pageLimit} page(s)`}

GAP RESPONSES (incorporate confirmed responsibilities into the appropriate role bullets; ignore "no" answers):
${gapsPretty}

Return ONLY a valid JSON object, no markdown, no code fences, matching this exact structure:
{
  "name": string,
  "jobTitle": string,
  "email": string,
  "phone": string,
  "location": string,
  "linkedIn": string,
  "summary": string,
  "experience": [{ "id": string, "jobTitle": string, "company": string, "location": string, "from": string, "to": string, "bullets": [{ "id": string, "original": string, "rewritten": string, "explanation": string }] }],
  "skills": [string],
  "education": [{ "id": string, "institution": string, "qualification": string, "year": string }],
  "competencyClusters": [{ "id": string, "title": string, "items": [string] }],
  "languages": [{ "language": string, "proficiency": string }]
}`;
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
    // Provider key validation happens inside runProvider


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

    const pageLimit: number | null =
      typeof body.pageLimit === "number" ? body.pageLimit
        : (intent?.pageLimit ?? null);
    const userMessage = buildUserMessage(parsedText, intent, gapResponses, pageLimit);

    const provider: string = body.provider ?? "gemini";
    console.log("generate-cv provider:", provider);

    const result = await runProvider(provider, SYSTEM_PROMPT, userMessage, 90000);

    if ("error" in result) {
      return new Response(
        JSON.stringify({
          error: result.error.status
            ? `${provider} API error ${result.error.status}`
            : `${provider} request failed`,
          status: result.error.status,
          provider,
          details: result.error.details,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 502 },
      );
    }

    const raw: string = result.text;

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
