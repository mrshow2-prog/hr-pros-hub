import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/resend";

const FROM_NAME = "People.Studio Website";
const DEFAULT_FROM_EMAIL = "onboarding@resend.dev";
const ADMIN_EMAIL = "bmesiha@outlook.com";

interface RequestBody {
  source: "Business" | "Career" | string;
  name: string;
  email: string;
  phone?: string;
  linkedin?: string;
  message?: string;
  goal?: string;
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderHtml(b: Required<RequestBody>) {
  const rows: Array<[string, string]> = [
    ["Source", b.source],
    ["Name", b.name],
    ["Email", b.email],
  ];
  if (b.phone) rows.push(["Phone", b.phone]);
  if (b.linkedin) rows.push(["LinkedIn", b.linkedin]);

  const rowsHtml = rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 12px 6px 0;color:#7a7268;font-size:12px;text-transform:uppercase;letter-spacing:0.06em;font-weight:700;white-space:nowrap;vertical-align:top;">${escapeHtml(
          k,
        )}</td><td style="padding:6px 0;color:#1a1a1a;font-size:14px;">${escapeHtml(v)}</td></tr>`,
    )
    .join("");

  const messageBody = b.message || b.goal || "";

  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#f6f4ef;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <div style="max-width:640px;margin:0 auto;padding:32px 28px;background:#ffffff;">
    <p style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#a05a3c;margin:0 0 6px;font-weight:700;">New ${escapeHtml(
      b.source,
    )} enquiry — People.Studio</p>
    <h1 style="font-size:20px;margin:0 0 18px;color:#1a1a1a;font-weight:600;">${escapeHtml(b.name)}</h1>
    <table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin:0 0 18px;">${rowsHtml}</table>
    ${
      messageBody
        ? `<h3 style="font-size:13px;margin:18px 0 6px;color:#1a1a1a;text-transform:uppercase;letter-spacing:0.06em;">Message</h3>
           <p style="margin:0 0 12px;color:#333;font-size:14px;line-height:1.6;white-space:pre-wrap;">${escapeHtml(messageBody)}</p>`
        : ""
    }
    <hr style="border:none;border-top:1px solid #e8dfd1;margin:24px 0 14px;" />
    <p style="font-size:12px;color:#7a7268;line-height:1.6;margin:0;">Reply directly to this email to respond to ${escapeHtml(b.name)}.</p>
  </div>
</body></html>`;
}

function renderText(b: Required<RequestBody>) {
  return [
    `New ${b.source} enquiry — People.Studio`,
    "",
    `Name: ${b.name}`,
    `Email: ${b.email}`,
    b.phone ? `Phone: ${b.phone}` : null,
    b.linkedin ? `LinkedIn: ${b.linkedin}` : null,
    "",
    "Message:",
    b.message || b.goal || "(none)",
  ]
    .filter(Boolean)
    .join("\n");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY is not configured");

    const FROM_EMAIL = Deno.env.get("RESEND_FROM_EMAIL") || DEFAULT_FROM_EMAIL;

    const raw = (await req.json()) as Partial<RequestBody>;

    const source = (raw.source || "Website").toString().slice(0, 40);
    const name = (raw.name || "").toString().trim().slice(0, 200);
    const email = (raw.email || "").toString().trim().slice(0, 320);
    const phone = (raw.phone || "").toString().trim().slice(0, 60);
    const linkedin = (raw.linkedin || "").toString().trim().slice(0, 300);
    const message = (raw.message || "").toString().slice(0, 5000);
    const goal = (raw.goal || "").toString().slice(0, 5000);

    if (!name) {
      return new Response(JSON.stringify({ error: "Name is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(JSON.stringify({ error: "Valid email is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = { source, name, email, phone, linkedin, message, goal } as Required<RequestBody>;

    const subject = `New ${source} enquiry from ${name}`;
    const html = renderHtml(body);
    const text = renderText(body);

    const response = await fetch(`${GATEWAY_URL}/emails`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": RESEND_API_KEY,
      },
      body: JSON.stringify({
        from: `${FROM_NAME} <${FROM_EMAIL}>`,
        to: [ADMIN_EMAIL],
        subject,
        html,
        text,
        reply_to: email,
      }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      console.error("Resend send failed", response.status, data);
      return new Response(
        JSON.stringify({ error: "Email provider rejected the send", status: response.status, details: data }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(JSON.stringify({ success: true, id: data?.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("send-contact-enquiry error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
