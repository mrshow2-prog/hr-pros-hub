import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

interface IntentForm {
  targetRole?: string;
  targetIndustry?: string;
  seniority?: string;
  cvType?: string;
  tone?: string;
}

interface Body {
  parsedText?: string;
  intentForm?: IntentForm;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = (await req.json().catch(() => ({}))) as Body;
    const role = body.intentForm?.targetRole || "the target role";

    // Stub — real Claude/Gemini call goes here.
    const gaps = [
      {
        id: "summary-generic",
        category: "Summary too generic",
        example: "Experienced professional with a strong background…",
        question: `What is the single result you want a hiring manager for ${role} to remember about you?`,
      },
      {
        id: "metrics-missing",
        category: "Missing metrics",
        example: "Led a team and improved processes.",
        question: "What was the team size, timeframe, and measurable improvement (%, AED, hours saved)?",
      },
      {
        id: "ats-keywords",
        category: "ATS keywords missing",
        example: "No mention of core tools for the target role.",
        question: `Which tools, methods, or certifications most relevant to ${role} have you used in the last 3 years?`,
      },
      {
        id: "weak-bullets",
        category: "Weak bullet points",
        example: "Responsible for daily operations.",
        question: "Pick one project from the last 12 months — what was the outcome and your specific contribution?",
      },
    ];

    return new Response(JSON.stringify({ gaps }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
