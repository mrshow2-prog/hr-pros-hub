// Lovable AI-powered HR Policy generator
// Public function (no auth) — called from Policy Generator tool

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface GeneratePolicyPayload {
  companyName?: string;
  type?: string;
  sector?: string;
  size?: string;
  jurisdiction?: string;
  notes?: string;
}

const SYSTEM_PROMPT = `You are a senior UAE & GCC HR consultant with deep expertise in Federal Decree-Law No. 33 of 2021 (UAE Labour Law), Cabinet Resolution No. 1 of 2022 (Executive Regulations), and GCC employment laws. You draft practical, legally grounded HR policies for private sector companies.

Your output must be returned by calling the provided "return_policy" function. Generate a complete, ready-to-use HR policy document.

Legal grounding:
- Cite the specific UAE or GCC country Labour Law article that governs each major provision (e.g. "Per Article 29 of Federal Decree-Law No. 33 of 2021..." for annual leave; Article 9 for probation; Article 33 for notice; Article 51 for gratuity).
- If jurisdiction is UAE Free Zone, note: "This policy is drafted for mainland MoHRE-regulated entities. DIFC and ADGM operate under separate employment law frameworks — adapt accordingly."
- Where policy differs between expatriate and UAE national employees, explicitly note the distinction (UAE nationals' end-of-service is now governed by Federal Decree-Law No. 57 of 2023 on Pension and Social Security, not the gratuity framework).

Key figures to use accurately (by policy type):
- Annual leave: 30 calendar days after 1 year of service (Article 29). If the user mentioned a working-days policy in the notes, use 22 working days instead of 30 calendar days.
- Sick leave: 15 days full pay, 30 days half pay, 45 days unpaid (Article 31). Resets every year of continuous service unless the user requested otherwise in notes.
- Maternity leave: 60 days — 45 days full pay, 15 days half pay (Article 30).
- Paternity leave: 5 working days (Article 32).
- Probation: Maximum 6 months (Article 9).
- Notice period: Minimum 30 days, maximum 90 days (Article 33).
- Gratuity payment: Must be made within 14 days of termination (Article 51).
- Gratuity calculation: 21 days basic wage per year for first 5 years; 30 days per year thereafter; capped at 2 years' total salary.
- Arbitrary dismissal compensation: Up to 3 months' salary (Article 47).

Field rules for the structured output:
- purpose: 2–3 sentences stating why the policy exists.
- scope: Who this applies to and any exclusions. 1–2 sentences or short paragraph.
- provisions: 6–12 numbered, specific, practical clauses with UAE/GCC law references where applicable. Each entry is a single clause as plain text — no leading number, no leading dash. The renderer will number them.
- employeeResponsibilities, employerResponsibilities, hrResponsibilities: 3–6 bullets each. Each entry a single sentence, no leading dash.
- nonCompliance: 2–4 bullets describing consequences of non-compliance. Each entry a single sentence, no leading dash.
- relatedDocuments: 2–5 related policies or documents. Short titles, no leading dash.
- policyOwner: Always "HR Department (or its designated representative)".
- legalReference: Cite the governing law for the selected jurisdiction (default: "Federal Decree-Law No. 33 of 2021 and Cabinet Resolution No. 1 of 2022" for UAE; substitute the relevant country's labour law otherwise).
- freeZoneNote: If jurisdiction is UAE Free Zone, return the DIFC/ADGM disclaimer above. Otherwise return an empty string.

Use the user's additional context to override default policy content within the bounds of applicable laws and regulations. Use plain English. No legal jargon. Practical and appropriate for the company size. Do not add preamble or commentary outside the structured output.`;

const TOOL_SCHEMA = {
  type: "function" as const,
  function: {
    name: "return_policy",
    description: "Return the structured HR policy document.",
    parameters: {
      type: "object",
      properties: {
        purpose: { type: "string" },
        scope: { type: "string" },
        provisions: { type: "array", items: { type: "string" }, minItems: 4 },
        employeeResponsibilities: { type: "array", items: { type: "string" } },
        employerResponsibilities: { type: "array", items: { type: "string" } },
        hrResponsibilities: { type: "array", items: { type: "string" } },
        nonCompliance: { type: "array", items: { type: "string" } },
        relatedDocuments: { type: "array", items: { type: "string" } },
        policyOwner: { type: "string" },
        legalReference: { type: "string" },
        freeZoneNote: { type: "string" },
      },
      required: [
        "purpose",
        "scope",
        "provisions",
        "employeeResponsibilities",
        "employerResponsibilities",
        "hrResponsibilities",
        "nonCompliance",
        "relatedDocuments",
        "policyOwner",
        "legalReference",
        "freeZoneNote",
      ],
      additionalProperties: false,
    },
  },
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY is not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = (await req.json()) as GeneratePolicyPayload;
    const companyName = (body.companyName ?? "").trim();
    const type = (body.type ?? "").trim();
    const sector = (body.sector ?? "").trim();
    const size = (body.size ?? "").trim();
    const jur = (body.jurisdiction ?? "").trim();
    const notes = (body.notes ?? "").trim();

    if (!companyName || !type || !sector || !size || !jur) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: companyName, type, sector, size, jurisdiction." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const userPrompt = `Generate a complete, ready-to-use HR policy document for:

Company: ${companyName}
Policy type: ${type}
Company sector: ${sector}
Company size: ${size}
Jurisdiction: ${jur}
Additional context: ${notes || "None provided"} (use this to overwrite any policy content within the applicable laws and regulations for the country)`;

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        tools: [TOOL_SCHEMA],
        tool_choice: { type: "function", function: { name: "return_policy" } },
      }),
    });

    if (aiResp.status === 429) {
      return new Response(
        JSON.stringify({ error: "Too many requests. Please try again in a moment." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (aiResp.status === 402) {
      return new Response(
        JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (!aiResp.ok) {
      const errText = await aiResp.text();
      console.error("AI gateway error:", aiResp.status, errText);
      return new Response(
        JSON.stringify({ error: "AI generation failed. Please try again." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const data = await aiResp.json();
    const toolCall = data?.choices?.[0]?.message?.tool_calls?.[0];
    const argsStr = toolCall?.function?.arguments;
    if (!argsStr) {
      console.error("No tool_call in AI response:", JSON.stringify(data));
      return new Response(
        JSON.stringify({ error: "AI returned an unexpected response. Please try again." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(argsStr);
    } catch (_e) {
      console.error("Failed to parse tool_call arguments:", argsStr);
      return new Response(
        JSON.stringify({ error: "AI returned invalid JSON. Please try again." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(JSON.stringify({ policy: parsed }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-policy error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
