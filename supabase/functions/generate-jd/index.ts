// Lovable AI-powered Job Description generator
// Public function (no auth) — called from JD Builder tool

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface GenerateJDPayload {
  companyName?: string;
  title?: string;
  level?: string;
  sector?: string;
  location?: string;
  notes?: string;
}

const SYSTEM_PROMPT = `You are a senior HR consultant and talent specialist with deep expertise in the UAE and GCC job market, UAE Federal Decree-Law No. 33 of 2021 (Labour Law), and MoHRE regulations.

Generate a professional, labor-law-compliant job description, calibrated to the selected country's current labor law.

Your output must be returned by calling the provided "return_job_description" function. Follow these rules for each field:

- mohreClassification: Only fill this with substantive content when the location is in the UAE (mainland). For non-UAE locations, return an empty string.
  When the location IS UAE, follow this MoHRE classification logic strictly and never contradict yourself:
  • Determine the role's MoHRE skill level (1–5) based on ISCO classification:
    - Levels 1–3 cover legislators, managers, professionals, technicians, and associate professionals (post-secondary qualifications, professional/managerial roles).
    - Level 4 covers clerical support workers (e.g. clerks, secretaries, data entry).
    - Level 5 covers services, sales, craft, plant/machine operators, and elementary occupations.
  • If the role falls in Levels 1–3: state the level, classify the role as "Skilled" under MoHRE, and explicitly note that it counts toward the company's Emiratisation skilled-workforce quota (subject to the additional requirements: post-secondary qualification + minimum AED 4,000/month basic salary).
  • If the role falls in Levels 4–5: state the level, classify the role as "Non-Skilled" under MoHRE, and explicitly note: "This role does not count toward the Emiratisation skilled workforce quota under MoHRE classification."
  • NEVER describe a Level 4 or Level 5 role as "Skilled". NEVER state both "Level 4" and "Skilled" in the same sentence.
  • Format as 1–2 short sentences. Example (skilled): "MoHRE Skill Level 2 — Professional. Classified as Skilled; counts toward the Emiratisation skilled-workforce quota provided the post-secondary qualification and AED 4,000+ basic salary thresholds are met." Example (non-skilled): "MoHRE Skill Level 4 — Clerical Support Worker. Classified as Non-Skilled. This role does not count toward the Emiratisation skilled workforce quota under MoHRE classification."
- aboutUs: Return an empty string. The hiring company will write its own About Us section.
- roleOverview: 2–3 sentences capturing the purpose and scope of the role. Specific to sector and seniority.
- keyResponsibilities: 8–12 action-oriented bullet points, calibrated to the seniority level. No generic filler. Each bullet is a single sentence, no leading dash or bullet character.
- requiredQualifications: Bullets covering education (with attested-qualification note where relevant for UAE visa), years of experience, and technical/functional skills. Each bullet is a single sentence, no leading dash.
- preferredQualifications: Nice-to-haves, not must-haves. Each bullet is a single sentence, no leading dash.
- coreCompetencies: 5–6 behavioural competencies appropriate for the level and role. Short phrases, no leading dash.
- whatWeOffer: 2–3 placeholder lines. Leave brackets like [Salary range] and [Benefits package] for the hiring company to fill in. Each entry a single sentence, no leading dash.

The user may provide additional context in their notes. Use it to inform the WRITING of the JD (tone, scope, focus areas). NEVER quote, echo, or print the notes as a section in the output. NEVER fabricate company facts (size, history, mission, culture) — those belong to the hiring company.

Tone: appropriate for the UAE/GCC professional market — direct, specific, ambitious but not hyperbolic. Do not add preamble or commentary outside the structured output.`;

const TOOL_SCHEMA = {
  type: "function" as const,
  function: {
    name: "return_job_description",
    description: "Return the structured job description.",
    parameters: {
      type: "object",
      properties: {
        mohreClassification: { type: "string" },
        aboutUs: { type: "string" },
        roleOverview: { type: "string" },
        keyResponsibilities: { type: "array", items: { type: "string" }, minItems: 8, maxItems: 12 },
        requiredQualifications: { type: "array", items: { type: "string" } },
        preferredQualifications: { type: "array", items: { type: "string" } },
        coreCompetencies: { type: "array", items: { type: "string" }, minItems: 5, maxItems: 6 },
        whatWeOffer: { type: "array", items: { type: "string" } },
      },
      required: [
        "mohreClassification",
        "aboutUs",
        "roleOverview",
        "keyResponsibilities",
        "requiredQualifications",
        "preferredQualifications",
        "coreCompetencies",
        "whatWeOffer",
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

    const body = (await req.json()) as GenerateJDPayload;
    const companyName = (body.companyName ?? "").trim();
    const title = (body.title ?? "").trim();
    const level = (body.level ?? "").trim();
    const sector = (body.sector ?? "").trim();
    const location = (body.location ?? "").trim();
    const notes = (body.notes ?? "").trim();

    if (!companyName || !title || !level || !sector) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: companyName, title, level, sector." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const userPrompt = `Generate a job description for the following role:

Company: ${companyName}
Role title: ${title}
Seniority: ${level}
Sector: ${sector}
Location: ${location || "Not specified"}
Additional context: ${notes || "None provided"}`;

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
        tool_choice: { type: "function", function: { name: "return_job_description" } },
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
    } catch (e) {
      console.error("Failed to parse tool_call arguments:", argsStr);
      return new Response(
        JSON.stringify({ error: "AI returned invalid JSON. Please try again." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(JSON.stringify({ jd: parsed }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-jd error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
