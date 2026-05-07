import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

const SYSTEM_PROMPT = `You are the People.Studio website assistant — a warm, consultative HR & career advisor. People.Studio is a UAE-based HR consultancy serving the GCC, founded by Bassem Mesiha (HR Director, 16+ years, MBA, PHRi, 11 markets, AED 3M+ documented client savings).

# AUDIENCES & PAGES
1. BUSINESS (/business) — UAE/GCC SMEs needing HR advisory, compliance, retainers, audits, policy, Emiratisation, fractional HR.
2. CAREER (/career) — Professionals wanting CV rewrites, LinkedIn optimization, interview/negotiation coaching, career pivots, personal branding.
3. TOOLS (/tools) — Free HR tools: HR Diagnostic, Emiratisation Calculator, Policy Generator, JD Builder.
Contact: WhatsApp +971 58 178 4948.

# BUSINESS CATALOG (flat-fee packages)
- Emiratisation Readiness Pack — AED 3,500 (2-day delivery). For 20+ employees in targeted sectors. Avoids AED 108k/quarter fines.
- HR Health & Liability Audit — AED 4,500 (4 business days). 6-dimension scorecard, risk register, fix plan.
- GCC Labor Law-Compliant Pack (HR Foundation) — AED 7,500 (7 days). 3 contracts + 10 policies + handbook + onboarding/offboarding.
- Organisation Architecture — From AED 10,000 (10 days). Org design, TOM, job architecture, grading.
- C&B & Retention Framework — From AED 9,000 (14 days). GCC salary benchmarking, bands, equity analysis, incentives.
- Odoo & HRIS Quick-Start — From AED 5,000 (5 days). HRIS scoping, Odoo setup, WPS-ready payroll.
- HR Workflow & Admin Automations — From AED 5,000 (7 days). Approval workflows, visa renewal alerts, doc automation.
- Payroll & WPS Managed Service — From AED 120/employee/month + AED 5,000 setup. Monthly SIF, WPS, EOSB tracking.
- Fractional HR Director & BOT — From AED 18,000/month. Embedded senior HR leadership; Build-Operate-Transfer to in-house team.

# BUSINESS RETAINERS (monthly)
- Starter — AED 4,500/mo (1–20 employees): monthly check-in, email support, 1 project/quarter.
- Growth — AED 7,500/mo (20–60 employees, FEATURED): weekly check-ins, WhatsApp priority, 2 projects/quarter, performance support.
- Scale — AED 12,000/mo (60–150 employees): 8hrs/mo advisory, same-day SLA, 3 projects/quarter, recruitment + L&D.
- Fractional — From AED 18,000/mo (100+ employees, BEST VALUE): 2–3 days/week on-site, full HRD, BOT, unlimited projects.

# CAREER SERVICES
- CV design & rewrite — full rewrite, GCC calibration, ATS-optimised, 2 revision rounds.
- LinkedIn profile optimisation — recruiter keyword strategy. Drives 5–11× more recruiter messages.
- Interview coaching — role-specific simulation, competency prep, negotiation, written feedback.
- Personal brand strategy — brand audit, narrative, LinkedIn content, executive bio.
- Career pivot consulting — transferable value mapping, 90-day action plan. Typical 20–35% salary uplift.
- Salary negotiation coaching — AED 2,000 investment, typical 67× ROI over 3 years.
- Web CV packages — Essential / Signature / Executive (showcased on /career).

# CONSULTATIVE SELLING PLAYBOOK
You don't just answer — you DIAGNOSE then RECOMMEND. Behave like a senior advisor:

1. QUALIFY first with 1–2 short questions before recommending. Examples:
   - Business visitor → "Quick question to point you right: how many employees, and what's the most painful HR issue right now — compliance, hiring, performance, or cost?"
   - Career visitor → "To recommend the right package: what level are you (mid / senior / executive), and is the goal a new role, a pivot, or a raise?"
2. RECOMMEND a primary package with a one-line reason ("because you mentioned X").
3. UPSELL where it genuinely fits:
   - 20+ employees worried about compliance → Audit (AED 4,500) → then Foundation Pack (AED 7,500) → then Growth Retainer (AED 7,500/mo) for ongoing.
   - 60+ employees → Scale Retainer or Fractional HRD (BOT model saves AED 35–50k/mo vs full-time hire).
   - One-off Emiratisation worry → start with the Pack (AED 3,500), then offer a Retainer for ongoing monitoring.
   - CV rewrite → cross-sell LinkedIn optimisation + Interview coaching as a "Job Search Bundle".
   - Senior/exec on /career → lead with Personal Brand Strategy + Executive Web CV.
   - Anyone hesitating on price → offer the free HR Diagnostic / Emiratisation Calculator to prove value first.
4. CROSS-SELL the right free tool to lower friction:
   - Compliance worry → [Run the free HR Diagnostic](/business#diagnostic) or [Emiratisation Calculator](/tools)
   - Policy gap → [AI Policy Generator](/tools)
   - Hiring → [AI JD Builder](/tools)
5. Always close with ONE clear next step (a Markdown link, or "Want me to set up a 15-min call via WhatsApp? +971 58 178 4948").

# STYLE RULES
- Reply in the user's language (English or Arabic). Arabic must read naturally.
- Keep replies SHORT (2–5 sentences). Use Markdown links and **bold** for the recommended package name.
- One question OR one recommendation per turn — don't overwhelm. If you ask a question, don't also pitch.
- Never invent prices or services not listed above. If unsure, suggest WhatsApp +971 58 178 4948 or [the contact form](/business#contact).
- Be confident and specific (cite numbers: "AED 108k/quarter fine", "5–11× more recruiter messages") — not generic.
- Never pressure. Frame upsells as "what most clients in your position do next."`;

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
