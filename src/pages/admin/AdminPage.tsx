import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/sonner";
import SEO from "@/components/seo/SEO";
import SiteFooter from "@/components/ui/SiteFooter";

interface SessionRow {
  id: string;
  user_id: string;
  payment_status: string;
  updated_at: string;
  state: any;
}

interface UnlockRequest {
  id: string;
  session_id: string;
  user_id: string;
  user_email: string | null;
  status: string;
  notes: string | null;
  created_at: string;
}

export default function AdminPage() {
  const [paywall, setPaywall] = useState<boolean | null>(null);
  const [savingToggle, setSavingToggle] = useState(false);
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [requests, setRequests] = useState<UnlockRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [{ data: settings }, { data: ses, error: sErr }, { data: reqs, error: rErr }] =
      await Promise.all([
        supabase.from("app_settings").select("paywall_enabled").eq("id", true).maybeSingle(),
        supabase
          .from("cv_builder_sessions")
          .select("id, user_id, payment_status, updated_at, state")
          .order("updated_at", { ascending: false }),
        supabase
          .from("unlock_requests")
          .select("*")
          .order("created_at", { ascending: false }),
      ]);
    setPaywall(!!settings?.paywall_enabled);
    if (sErr) toast.error(sErr.message);
    if (rErr) toast.error(rErr.message);
    setSessions((ses as SessionRow[]) ?? []);
    setRequests((reqs as UnlockRequest[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const togglePaywall = async (next: boolean) => {
    setSavingToggle(true);
    const { error } = await supabase
      .from("app_settings")
      .update({ paywall_enabled: next, updated_at: new Date().toISOString() })
      .eq("id", true);
    setSavingToggle(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setPaywall(next);
    toast.success(next ? "Paywall enabled" : "Paywall disabled");
  };

  const setLock = async (sessionId: string, paid: boolean) => {
    const { error } = await supabase
      .from("cv_builder_sessions")
      .update({ payment_status: paid ? "paid" : "unpaid" })
      .eq("id", sessionId);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(paid ? "CV unlocked" : "CV locked");
    setSessions((rows) =>
      rows.map((r) => (r.id === sessionId ? { ...r, payment_status: paid ? "paid" : "unpaid" } : r)),
    );
  };

  const resolveRequest = async (id: string, sessionId: string, approve: boolean) => {
    if (approve) {
      await setLock(sessionId, true);
    }
    const { error } = await supabase
      .from("unlock_requests")
      .update({ status: approve ? "approved" : "declined" })
      .eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    setRequests((rs) => rs.map((r) => (r.id === id ? { ...r, status: approve ? "approved" : "declined" } : r)));
  };

  const titleOf = (s: SessionRow) => {
    const cv = s.state?.generatedCV;
    const name = cv?.contact?.name?.trim();
    const role = cv?.contact?.jobTitle?.trim();
    if (name && role) return `${name} — ${role}`;
    if (name) return name;
    return "Untitled draft";
  };

  // Group sessions by user_id
  const byUser = sessions.reduce<Record<string, SessionRow[]>>((acc, s) => {
    (acc[s.user_id] ||= []).push(s);
    return acc;
  }, {});

  const pendingRequests = requests.filter((r) => r.status === "pending");

  return (
    <div className="min-h-screen bg-paper text-ink font-dm">
      <SEO title="Admin · People.Studio" description="Manage users, CVs, and the paywall." path="/admin" />
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold">Admin</h1>
            <p className="text-sm text-ink/60 mt-1">Manage CVs, paywall, and unlock requests.</p>
          </div>
          <Link to="/my-cvs" className="text-sm text-ink/60 hover:text-ink underline">← My CVs</Link>
        </div>

        {/* Paywall master toggle */}
        <section className="border border-ink/10 rounded-lg p-5 bg-white mb-8 flex items-center justify-between">
          <div>
            <p className="font-medium">Paywall</p>
            <p className="text-sm text-ink/60 mt-1">
              {paywall
                ? "ON — users cannot self-unlock. Pay action creates an unlock request."
                : "OFF — clicking pay automatically unlocks the CV (no charge)."}
            </p>
          </div>
          <Switch
            checked={!!paywall}
            disabled={paywall === null || savingToggle}
            onCheckedChange={togglePaywall}
          />
        </section>

        {/* Unlock requests */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">
            Unlock requests {pendingRequests.length > 0 && (
              <span className="ml-2 text-xs bg-sienna text-paper px-2 py-0.5 rounded">{pendingRequests.length} pending</span>
            )}
          </h2>
          {requests.length === 0 ? (
            <p className="text-sm text-ink/55">No requests yet.</p>
          ) : (
            <ul className="space-y-2">
              {requests.map((r) => (
                <li key={r.id} className="border border-ink/10 rounded-lg p-4 bg-white flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{r.user_email ?? r.user_id}</p>
                    <p className="text-xs text-ink/55 mt-1">
                      Session {r.session_id.slice(0, 8)} · {new Date(r.created_at).toLocaleString()} · {r.status}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {r.status === "pending" && (
                      <>
                        <Button size="sm" onClick={() => resolveRequest(r.id, r.session_id, true)}>Approve & unlock</Button>
                        <Button size="sm" variant="outline" onClick={() => resolveRequest(r.id, r.session_id, false)}>Decline</Button>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Users & CVs */}
        <section>
          <h2 className="text-xl font-semibold mb-3">Users & CVs</h2>
          {loading ? (
            <p className="text-sm text-ink/55">Loading…</p>
          ) : Object.keys(byUser).length === 0 ? (
            <p className="text-sm text-ink/55">No CVs yet.</p>
          ) : (
            <div className="space-y-5">
              {Object.entries(byUser).map(([uid, list]) => (
                <div key={uid} className="border border-ink/10 rounded-lg bg-white">
                  <div className="px-4 py-3 border-b border-ink/10 text-sm text-ink/70">
                    User: <span className="font-mono">{uid}</span> · {list.length} CV{list.length === 1 ? "" : "s"}
                  </div>
                  <ul>
                    {list.map((s) => {
                      const paid = s.payment_status === "paid";
                      return (
                        <li key={s.id} className="px-4 py-3 flex items-center justify-between gap-4 border-t border-ink/5 first:border-t-0">
                          <div className="min-w-0">
                            <p className="font-medium truncate">{titleOf(s)}</p>
                            <p className="text-xs text-ink/55 mt-1">
                              Updated {new Date(s.updated_at).toLocaleString()} ·{" "}
                              <span className={paid ? "text-olive" : "text-sienna"}>{s.payment_status}</span>
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant={paid ? "outline" : "default"}
                            onClick={() => setLock(s.id, !paid)}
                          >
                            {paid ? "Lock" : "Unlock"}
                          </Button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
      <SiteFooter />
    </div>
  );
}
