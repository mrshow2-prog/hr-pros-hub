import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({} as Record<string, unknown>));
    const intent = (body.intentForm ?? {}) as {
      targetRole?: string;
      targetRoles?: string[];
      cvType?: string;
    };
    const role =
      intent.targetRoles?.[0] || intent.targetRole || "Senior Professional";
    const includeClusters = intent.cvType === "skills" || intent.cvType === "hybrid";

    const generatedCV = {
      contact: {
        name: "",
        jobTitle: role,
        email: "",
        phone: "",
        location: "",
        linkedinUrl: "",
        photoPath: null,
      },
      summary: `${role} with a record of delivering measurable outcomes across operations, people, and growth initiatives.`,
      experience: [
        {
          id: "exp-1",
          company: "Sample Company",
          role,
          location: "",
          startDate: "Jan 2022",
          endDate: "Present",
          bullets: [
            {
              id: "b-1",
              original: "Responsible for managing daily operations.",
              rewrite:
                "Owned daily operations across a 12-person team, lifting on-time delivery from 78% to 96% in 9 months.",
              explanation:
                "Replaced passive scope with ownership verb, added team size and quantified outcome.",
              status: "accepted" as const,
            },
            {
              id: "b-2",
              original: "Worked on improving customer service.",
              rewrite:
                "Redesigned the customer escalation flow, cutting average resolution time from 48h to 11h.",
              explanation: "Specified the change and the measurable impact.",
              status: "accepted" as const,
            },
          ],
        },
      ],
      skills: [
        "Operations",
        "Stakeholder management",
        "Process design",
        "Data-driven decision making",
      ],
      education: [
        {
          id: "ed-1",
          institution: "Sample University",
          qualification: "Bachelor of Business Administration",
          period: "2014 — 2018",
        },
      ],
      competencyClusters: includeClusters
        ? [
            {
              id: "cl-1",
              title: "Leadership & influence",
              items: ["Team leadership", "Executive communication", "Change management"],
            },
            {
              id: "cl-2",
              title: "Operational excellence",
              items: ["Process design", "KPI ownership", "Vendor management"],
            },
          ]
        : [],
      languages: [
        { id: "lang-1", name: "English", level: "Fluent" },
        { id: "lang-2", name: "Arabic", level: "Native" },
      ],
      hiddenSections: [],
    };

    return new Response(JSON.stringify({ generatedCV }), {
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
