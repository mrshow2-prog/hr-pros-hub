import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import SEO from "@/components/seo/SEO";
import SiteFooter from "@/components/ui/SiteFooter";

interface Row {
  id: string;
  updated_at: string;
  payment_status: string;
  state: any;
}

const SESSION_LS = "cv_builder_session_id";

export default function MyCvs() {
  const nav = useNavigate();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [email, setEmail] = useState<string>("");

  const load = async () => {
    const { data: s } = await supabase.auth.getSession();
    setEmail(s.session?.user.email ?? "");
    const { data, error } = await supabase
      .from("cv_builder_sessions")
      .select("id, updated_at, payment_status, state")
      .order("updated_at", { ascending: false });
    if (error) {
      toast.error(error.message);
      setRows([]);
    } else {
      setRows((data as Row[]) ?? []);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const open = (id: string) => {
    localStorage.setItem(SESSION_LS, id);
    nav("/career-studio/cv-builder");
  };

  const startNew = () => {
    localStorage.removeItem(SESSION_LS);
    nav("/career-studio/cv-builder");
  };

  const logout = async () => {
    await supabase.auth.signOut();
    nav("/career-studio/cv-builder/login", { replace: true });
  };

  const titleOf = (r: Row) => {
    const cv = r.state?.generatedCV;
    const name = cv?.contact?.name?.trim();
    const role = cv?.contact?.jobTitle?.trim();
    if (name && role) return `${name} — ${role}`;
    if (name) return name;
    const files = r.state?.uploadedFiles ?? [];
    if (files[0]?.name) return files[0].name;
    return "Untitled draft";
  };

  return (
    <div className="min-h-screen bg-paper text-ink font-dm">
      <SEO title="My CVs · CV Builder" description="Your saved CV drafts." path="/career-studio/cv-builder/my-cvs" />
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-semibold">My CVs</h1>
            <p className="text-sm text-ink/60 mt-1">Signed in as {email}</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={startNew}>Start new CV</Button>
            <Button variant="outline" onClick={logout}>Log out</Button>
          </div>
        </div>

        {rows === null ? (
          <p className="text-sm text-ink/55">Loading…</p>
        ) : rows.length === 0 ? (
          <div className="border border-dashed border-ink/20 rounded-lg p-10 text-center">
            <p className="text-ink/70">No drafts yet.</p>
            <Button className="mt-4" onClick={startNew}>Create your first CV</Button>
          </div>
        ) : (
          <ul className="space-y-3">
            {rows.map((r) => (
              <li key={r.id} className="border border-ink/10 rounded-lg p-4 bg-white flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium truncate">{titleOf(r)}</p>
                  <p className="text-xs text-ink/55 mt-1">
                    Updated {new Date(r.updated_at).toLocaleString()} · {r.payment_status}
                  </p>
                </div>
                <Button variant="outline" onClick={() => open(r.id)}>Open</Button>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-8 text-sm">
          <Link to="/career" className="text-ink/60 hover:text-ink underline">← Back to Career Studio</Link>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
