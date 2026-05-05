import { Link, Navigate, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSession } from "@/hooks/useAuthSession";
import { Button } from "@/components/ui/button";
import SEO from "@/components/seo/SEO";

export default function AdminDashboard() {
  const { loading, session, isAdmin } = useAuthSession();
  const nav = useNavigate();

  const { data: profiles } = useQuery({
    queryKey: ["admin-profiles", session?.user.id],
    enabled: !!session,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles_content")
        .select("id, slug, seo_title, published, owner_user_id, updated_at")
        .order("slug");
      if (error) throw error;
      return data;
    },
  });

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading…</div>;
  if (!session) return <Navigate to="/admin/login" replace />;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO title="Admin Dashboard · People Studio" description="Edit profile pages." path="/admin" />
      <header className="border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold">Profile Editor</h1>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-muted-foreground">{session.user.email}</span>
            {isAdmin && <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-xs">admin</span>}
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                await supabase.auth.signOut();
                nav("/admin/login", { replace: true });
              }}
            >
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <h2 className="text-lg font-medium mb-4">Profiles</h2>
        {!profiles?.length && (
          <p className="text-muted-foreground">
            You don't have access to any profiles yet. {!isAdmin && "Ask an admin to grant you access."}
          </p>
        )}
        <ul className="space-y-2">
          {profiles?.map((p) => (
            <li key={p.id}>
              <Link
                to={`/admin/${p.slug}`}
                className="block border border-border rounded-md p-4 hover:bg-accent transition"
              >
                <div className="flex justify-between items-baseline">
                  <span className="font-medium">/{p.slug}</span>
                  <span className="text-xs text-muted-foreground">
                    {p.published ? "Published" : "Draft"}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground truncate">{p.seo_title}</div>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
