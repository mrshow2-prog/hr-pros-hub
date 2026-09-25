import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const Body = z.discriminatedUnion("action", [
  z.object({ action: z.literal("list-users") }),
  z.object({ action: z.literal("send-reset"), email: z.string().email(), redirectTo: z.string().url().optional() }),
  z.object({ action: z.literal("set-password"), userId: z.string().uuid(), password: z.string().min(8).max(128) }),
  z.object({ action: z.literal("delete-user"), userId: z.string().uuid() }),
]);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
    if (!token) return json({ error: "Unauthorized" }, 401);
    const { data: u, error: uErr } = await admin.auth.getUser(token);
    if (uErr || !u.user) return json({ error: "Unauthorized" }, 401);
    const { data: role } = await admin
      .from("user_roles").select("role").eq("user_id", u.user.id).eq("role", "admin").maybeSingle();
    if (!role) return json({ error: "Forbidden" }, 403);

    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) return json({ error: parsed.error.flatten() }, 400);
    const b = parsed.data;

    if (b.action === "list-users") {
      const users: any[] = [];
      for (let page = 1; page < 50; page++) {
        const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
        if (error) throw error;
        users.push(...data.users);
        if (data.users.length < 1000) break;
      }
      const { data: roles } = await admin.from("user_roles").select("user_id, role");
      const { data: sessions } = await admin.from("cv_builder_sessions").select("user_id, payment_status");
      return json({
        users: users.map((x) => ({
          id: x.id,
          email: x.email,
          created_at: x.created_at,
          last_sign_in_at: x.last_sign_in_at,
          email_confirmed_at: x.email_confirmed_at,
          providers: x.app_metadata?.providers ?? [],
          is_admin: !!roles?.some((r) => r.user_id === x.id && r.role === "admin"),
          cv_count: sessions?.filter((s) => s.user_id === x.id).length ?? 0,
          paid_count: sessions?.filter((s) => s.user_id === x.id && s.payment_status === "paid").length ?? 0,
        })),
      });
    }
    if (b.action === "send-reset") {
      const anon = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!);
      const { error } = await anon.auth.resetPasswordForEmail(b.email, { redirectTo: b.redirectTo });
      if (error) throw error;
      return json({ ok: true });
    }
    if (b.action === "set-password") {
      const { error } = await admin.auth.admin.updateUserById(b.userId, { password: b.password });
      if (error) throw error;
      return json({ ok: true });
    }
    if (b.action === "delete-user") {
      if (b.userId === u.user.id) return json({ error: "You cannot delete yourself" }, 400);
      await admin.from("unlock_requests").delete().eq("user_id", b.userId);
      await admin.from("cv_builder_sessions").delete().eq("user_id", b.userId);
      const { error } = await admin.auth.admin.deleteUser(b.userId);
      if (error) throw error;
      return json({ ok: true });
    }
    return json({ error: "Unknown action" }, 400);
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : String(e) }, 500);
  }
});
