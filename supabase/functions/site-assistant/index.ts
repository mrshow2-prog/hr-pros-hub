import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

const SYSTEM_PROMPT = `You are the People.Studio website assistant. People.Studio is an HR consultancy based in the UAE serving the GCC, founded by Bassem Mesiha (HR Director, 16+ years).

The site has THREE main audiences:
1. BUSINESS (/business) — UAE SMEs needing HR advisory, fractional HR, retainers, audits, policy & compliance, MOHRE/labour-law fixes. Free HR Diagnostic available on the page.
2. CAREER (/career) — Professionals globally wanting CV writing, LinkedIn optimization, interview/career coaching, ATS review, web CV (Essential/Signature/Executive packages).
3. TOOLS (/tools) — Free HR tools: JD Builder, Policy Generator, Emirates calculator (gratuity/leave), HR Diagnostic.

Other pages: / (home), /legal (privacy/terms). Contact: WhatsApp +971 58 178 4948.

YOUR JOB:
- Greet warmly, ask what they need, then point them to the right page or tool with a clickable Markdown link (e.g. [Run the free diagnostic](/business#diagnostic)).
- Keep replies SHORT (2-4 sentences). Use Markdown. Suggest one clear next step.
- Reply in the SAME language the user writes in (English or Arabic). For Arabic, write naturally in Arabic.
- If asked something off-topic, politely steer back to how People.Studio can help.
- Never invent prices, dates, or services not listed above. If unsure, suggest contacting via WhatsApp or the contact form on /business or /career.`;

type ClientMsg = { role: "user" | "assistant"; content: string };

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      return new Response(JSON.stringify({ error: "GEMINI_API_KEY is not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { messages, lang } = (await req.json()) as { messages: ClientMsg[]; lang?: string };
    if (!Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "messages must be an array" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const contents = messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: String(m.content || "").slice(0, 4000) }],
    }));

    const systemInstruction = {
      parts: [
        { text: SYSTEM_PROMPT + (lang === "ar" ? "\n\nThe user is currently browsing the Arabic version of the site — prefer Arabic unless they switch." : "") },
      ],
    };

    const body = JSON.stringify({
      systemInstruction,
      contents,
      generationConfig: { temperature: 0.7, maxOutputTokens: 600 },
    });

    // Try models in order, falling back on 503/overloaded
    const models = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-flash-latest"];
    let upstream: Response | null = null;
    let lastStatus = 0;
    let lastErr = "";
    for (const model of models) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${GEMINI_API_KEY}`;
      const r = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });
      if (r.ok && r.body) {
        upstream = r;
        break;
      }
      lastStatus = r.status;
      lastErr = await r.text().catch(() => "");
      console.error(`Gemini ${model} error`, r.status, lastErr);
      // Only fall back on transient errors
      if (r.status !== 503 && r.status !== 500 && r.status !== 429) break;
    }

    if (!upstream || !upstream.body) {
      const status = lastStatus === 429 ? 429 : 503;
      const message =
        lastStatus === 429
          ? "Rate limit hit. Please try again in a moment."
          : "The AI service is temporarily overloaded. Please try again in a few seconds.";
      return new Response(JSON.stringify({ error: message }), {
        status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Transform Gemini SSE into a simple text/event-stream of {delta} JSON chunks.
    const reader = upstream.body.getReader();
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        let buf = "";
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buf += decoder.decode(value, { stream: true });
            let idx: number;
            while ((idx = buf.indexOf("\n")) !== -1) {
              const line = buf.slice(0, idx).trim();
              buf = buf.slice(idx + 1);
              if (!line.startsWith("data:")) continue;
              const json = line.slice(5).trim();
              if (!json || json === "[DONE]") continue;
              try {
                const parsed = JSON.parse(json);
                const text = parsed?.candidates?.[0]?.content?.parts
                  ?.map((p: { text?: string }) => p.text || "")
                  .join("") || "";
                if (text) controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta: text })}\n\n`));
              } catch {
                // ignore partials
              }
            }
          }
          controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
        } catch (e) {
          console.error("stream error", e);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
    });
  } catch (e) {
    console.error("site-assistant error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
