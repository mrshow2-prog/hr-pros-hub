import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

// One-off seeding endpoint. Idempotent: safe to call multiple times.
// Creates abanoub@peoplestudio.local / abanoub (email-confirmed) and
// reassigns the most recent anonymous cv_builder_sessions row to that user.

const EMAIL = "abanoub@peoplestudio.local";
const PASSWORD = "abanoub";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } },
    );

    // 1. Try to create the user. If it already exists, look it up.
    let userId: string | null = null;
    const created = await admin.auth.admin.createUser({
      email: EMAIL,
      password: PASSWORD,
      email_confirm: true,
    });

    if (created.data?.user) {
      userId = created.data.user.id;
    } else if (created.error && /already|registered|exists/i.test(created.error.message)) {
      // Find existing user by paging through admin.listUsers
      let page = 1;
      while (page < 20 && !userId) {
        const list = await admin.auth.admin.listUsers({ page, perPage: 200 });
        if (list.error) break;
        const match = list.data.users.find((u) => u.email?.toLowerCase() === EMAIL);
        if (match) userId = match.id;
        if (list.data.users.length < 200) break;
        page += 1;
      }
      // Also ensure password is what we expect
      if (userId) {
        await admin.auth.admin.updateUserById(userId, { password: PASSWORD, email_confirm: true });
      }
    } else if (created.error) {
      throw created.error;
    }

    if (!userId) throw new Error("Could not provision user");

    // 2. Claim the most recent anonymous CV session for this user.
    const { data: latest } = await admin
      .from("cv_builder_sessions")
      .select("id, updated_at")
      .is("user_id", null)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    let claimedSessionId: string | null = null;
    if (latest?.id) {
      const { error: updErr } = await admin
        .from("cv_builder_sessions")
        .update({ user_id: userId, anon_token: null })
        .eq("id", latest.id);
      if (!updErr) claimedSessionId = latest.id;
    }

    return new Response(
      JSON.stringify({
        ok: true,
        user_id: userId,
        email: EMAIL,
        claimed_session_id: claimedSessionId,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ ok: false, error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
