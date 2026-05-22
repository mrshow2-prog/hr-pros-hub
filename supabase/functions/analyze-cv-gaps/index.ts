import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { extractText, getDocumentProxy } from "npm:unpdf@0.12.1";
import mammoth from "npm:mammoth@1.8.0";

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
const LOVABLE_AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const LOVABLE_MODEL = "google/gemini-3-flash-preview";

const SYSTEM_PROMPT = `You are an expert CV consultant. You will be given the EXACT text of one candidate's CV plus their target role context. You must analyse THIS specific CV — never produce generic gaps. Every "example" field you return must be a real quote or specific observation from the CV text provided. If something is already addressed well, do NOT flag it. Return ONLY a JSON array (no markdown, no fences, no prose) of 4–6 objects with fields: id, category, example, question.`;

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

async function generateGapsWithLovableAI(userMessage: string) {
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) throw new Error("LOVABLE_API_KEY is not configured");

  const resp = await fetchWithTimeout(LOVABLE_AI_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
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
  const parsed = JSON.parse(stripFences(raw));
  return parsed.gaps ?? parsed;
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
