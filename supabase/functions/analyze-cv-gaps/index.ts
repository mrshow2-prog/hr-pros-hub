import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { extractText, getDocumentProxy } from "npm:unpdf@0.12.1";
import mammoth from "npm:mammoth@1.8.0";

const GEMINI_MODELS = ["gemini-2.5-flash", "gemini-2.5-flash-lite"];
const RETRY_STATUSES = new Set([429, 500, 502, 503, 504]);

const SYSTEM_PROMPT = `You are a senior executive recruiter with deep knowledge of hiring standards across industries.

Analyze this CV on two levels:

LEVEL 1 — WRITING QUALITY GAPS:
Look at what IS in the CV and identify where it is weak, vague, or undersells the candidate.
Quote actual text from the CV. Flag: missing metrics, passive language, thin bullet points, weak summary, unexplained gaps.

LEVEL 2 — ROLE EXPECTATION GAPS:
Based on the target role, function, seniority, and industry, identify what a strong candidate for this role would typically demonstrate that is ABSENT from this CV.
For example:
- A Senior Hotel Sales Manager targeting Director of Sales would typically evidence: P&L ownership, revenue forecasting accuracy, RFP win rates, ADR/RevPAR contribution, budget management, cross-functional leadership. If these are absent, flag them.
- A Senior HR professional targeting CHRO would typically evidence: board-level reporting, workforce planning at scale, M&A people integration. If absent, flag them.
Use your knowledge of the target role to identify 3-4 missing expected competencies or experiences specific to THIS role and industry.

IMPORTANT RULES:
- Never fabricate quotes. Only quote actual text that appears in the CV.
- For Level 2 gaps, the 'example' field should describe what's absent, not fabricate a quote. e.g. 'No mention of P&L ownership or budget management despite targeting a Director level role'.
- Every gap must include a question that helps the user surface real information from their experience to fill the gap.

Return ONLY a JSON array (no markdown, no fences, no prose) of 6-8 gap objects (mix of Level 1 and Level 2). Each object must have fields: id, category, example, question, layer. The 'layer' field must be either 'writing' (Level 1) or 'expectation' (Level 2).`;

function stripFences(text: string): string {
  return text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
}

const GAPS_TOOL_SCHEMA = {
  type: "function" as const,
  function: {
    name: "return_cv_gaps",
    description: "Return specific CV gap analysis questions grounded in the provided CV text.",
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
      // legacy .doc not supported by mammoth — return as-is decoded
      return new TextDecoder().decode(bytes);
    }
  } catch (e) {
    console.error(`Extract failed for ${name}:`, (e as Error).message);
  }
  return "";
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
    const uploadedFiles: Array<{ path: string; name: string }> = body.uploadedFiles ?? [];

    console.log("parsedText length:", parsedText?.length ?? 0);
    console.log("parsedText preview:", parsedText?.slice(0, 200));
    console.log("uploadedFiles:", uploadedFiles.map((f) => f.name));

    // If parsedText looks like a placeholder or is empty, extract server-side from storage
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

    const targetRoles = Array.isArray(intent.targetRoles)
      ? intent.targetRoles.join(", ")
      : intent.targetRoles ?? "";
    const functionArea = intent.function ?? intent.functionArea ?? "";
    const industry = intent.industry ?? intent.targetIndustry ?? "Not industry-specific";

    const userMessage = `You are analyzing THIS SPECIFIC CV TEXT below. Do not generate generic gaps. Every gap you identify must quote an actual phrase or section from the CV text provided. If the CV already addresses something well, do not flag it as a gap.

Focus only on what is genuinely missing or weak in THIS CV for THIS target role.

CV TEXT (analyze this exactly):
---
${parsedText}
---

TARGET ROLES: ${targetRoles}
FUNCTION: ${functionArea}
SENIORITY: ${intent.seniority ?? ""}
INDUSTRY: ${industry}
CV TYPE: ${intent.cvType ?? ""}

Return ONLY a JSON array. Each object must have:
- id: string
- category: string
- example: string (must be an actual quote or specific observation from the CV text above — never fabricate a quote)
- question: string (targeted to what's actually missing from this specific CV)

Do not wrap in markdown. Do not add explanation.`;

    const result = await callGeminiWithRetry(apiKey, {
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [{ role: "user", parts: [{ text: userMessage }] }],
      generationConfig: { responseMimeType: "application/json", temperature: 0.4 },
    });

    if (!(result instanceof Response)) {
      return new Response(
        JSON.stringify({
          error: result.error.status
            ? `Gemini API error ${result.error.status}`
            : "Gemini request failed",
          status: result.error.status,
          details: result.error.details,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 502 },
      );
    }

    const data = await result.json();
    const raw: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    let gaps: unknown;
    try {
      const parsed = JSON.parse(stripFences(raw));
      gaps = Array.isArray(parsed) ? parsed : parsed.gaps ?? parsed;
    } catch (_e) {
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
