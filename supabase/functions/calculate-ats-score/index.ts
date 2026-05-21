import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    await req.json().catch(() => ({}));

    // Stub — real scoring goes here.
    const atsScore = {
      overall: 78,
      keywordMatch: 72,
      formatting: [
        { label: "Single column layout", pass: true },
        { label: "No tables", pass: true },
        { label: "No images or icons", pass: true },
        { label: "Standard section headings", pass: true },
        { label: "Selectable text (not scanned)", pass: true },
      ],
      readability: 81,
    };

    return new Response(JSON.stringify({ atsScore }), {
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
