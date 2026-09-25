import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/sonner";
import SEO from "@/components/seo/SEO";
import SiteFooter from "@/components/ui/SiteFooter";
import BrandMark from "@/components/brand/BrandMark";

interface SessionRow { id: string; user_id: string; payment_status: string; updated_at: string; created_at: string; state: any; }
interface UnlockRequest { id: string; session_id: string; user_id: string; user_email: string | null; status: string; notes: string | null; created_at: string; }
interface AdminUser {
  id: string; email: string | null; created_at: string; last_sign_in_at: string | null;
  email_confirmed_at: string | null; providers: string[]; is_admin: boolean; cv_count: number; paid_count: number;
}

const SESSION_LS = "cv_builder_session_id";
const fmt = (d?: string | null) => (d ? new Date(d).toLocaleString() : "—");

async function callAdmin<T = any>(body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke("admin-users", { body });
  if (error) {
    let msg = error.message;
    try { const j = await (error as any).context?.json?.(); if (j?.error) msg = typeof j.error === "string" ? j.error : JSON.stringify(j.error); } catch { /* ignore */ }
    throw new Error(msg);
  }
  if (data?.error) throw new Error(typeof data.error === "string" ? data.error : JSON.stringify(data.error));
  return data as T;
}

export default function AdminPage() {
  const nav = useNavigate();
  const [paywall, setPaywall] = useState<boolean | null>(null);
  const [savingToggle, setSavingToggle] = useState(false);
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [requests, setRequests] = useState<UnlockRequest[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [userQuery, setUserQuery] = useState("");
  const [cvQuery, setCvQuery] = useState("");
  const [cvFilter, setCvFilter] = useState<"all" | "paid" | "unpaid">("all");
  const [cvUserFilter, setCvUserFilter] = useState<string | null>(null);
  const [pwUser, setPwUser] = useState<AdminUser | null>(null);
  const [newPw, setNewPw] = useState("");
  const [confirm, setConfirm] = useState<{ title: string; body: string; run: () => Promise<void> } | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    const [{ data: settings }, { data: ses, error: sErr }, { data: reqs, error: rErr }] = await Promise.all([
      supabase.from("app_settings").select("paywall_enabled").eq("id", true).maybeSingle(),
      supabase.from("cv_builder_sessions").select("id, user_id, payment_status, updated_at, created_at, state").order("updated_at", { ascending: false }),
      supabase.from("unlock_requests").select("*").order("created_at", { ascending: false }),
    ]);
    setPaywall(!!settings?.paywall_enabled);
    if (sErr) toast.error(sErr.message);
    if (rErr) toast.error(rErr.message);
    setSessions((ses as SessionRow[]) ?? []);
    setRequests((reqs as UnlockRequest[]) ?? []);
    try {
      const res = await callAdmin<{ users: AdminUser[] }>({ action: "list-users" });
      setUsers(res.users);
    } catch (e: any) { toast.error(`Users: ${e.message}`); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const emailOf = (uid: string) => users.find((u) => u.id === uid)?.email ?? uid.slice(0, 8);

  const togglePaywall = async (next: boolean) => {
    setSavingToggle(true);
    const { error } = await supabase.from("app_settings").update({ paywall_enabled: next, updated_at: new Date().toISOString() }).eq("id", true);
    setSavingToggle(false);
    if (error) return toast.error(error.message);
    setPaywall(next);
    toast.success(next ? "Paywall enabled" : "Paywall disabled");
  };

  const setLock = async (sessionId: string, paid: boolean) => {
    const { error } = await supabase.from("cv_builder_sessions").update({ payment_status: paid ? "paid" : "unpaid" }).eq("id", sessionId);
    if (error) return toast.error(error.message);
    toast.success(paid ? "CV unlocked" : "CV locked");
    setSessions((rows) => rows.map((r) => (r.id === sessionId ? { ...r, payment_status: paid ? "paid" : "unpaid" } : r)));
  };

  const deleteCv = async (id: string) => {
    await supabase.from("unlock_requests").delete().eq("session_id", id);
    const { error } = await supabase.from("cv_builder_sessions").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setSessions((r) => r.filter((s) => s.id !== id));
    setRequests((r) => r.filter((x) => x.session_id !== id));
    toast.success("CV deleted");
  };

  const openCv = (id: string) => { localStorage.setItem(SESSION_LS, id); nav("/builder"); };

  const resolveRequest = async (id: string, sessionId: string, approve: boolean) => {
    if (approve) await setLock(sessionId, true);
    const { error } = await supabase.from("unlock_requests").update({ status: approve ? "approved" : "declined" }).eq("id", id);
    if (error) return toast.error(error.message);
    setRequests((rs) => rs.map((r) => (r.id === id ? { ...r, status: approve ? "approved" : "declined" } : r)));
  };

  const sendReset = async (u: AdminUser) => {
    if (!u.email) return;
    try {
      await callAdmin({ action: "send-reset", email: u.email, redirectTo: `${window.location.origin}/login` });
      toast.success(`Reset email sent to ${u.email}`);
    } catch (e: any) { toast.error(e.message); }
  };

  const savePassword = async () => {
    if (!pwUser) return;
    if (newPw.length < 8) return toast.error("Password must be at least 8 characters");
    setBusy(true);
    try {
      await callAdmin({ action: "set-password", userId: pwUser.id, password: newPw });
      toast.success("Password updated");
      setPwUser(null); setNewPw("");
    } catch (e: any) { toast.error(e.message); }
    setBusy(false);
  };

  const deleteUser = async (u: AdminUser) => {
    await callAdmin({ action: "delete-user", userId: u.id });
    setUsers((x) => x.filter((y) => y.id !== u.id));
    setSessions((x) => x.filter((s) => s.user_id !== u.id));
    setRequests((x) => x.filter((r) => r.user_id !== u.id));
    toast.success("User deleted");
  };

  const titleOf = (s: SessionRow) => {
    const cv = s.state?.generatedCV;
    const name = cv?.contact?.name?.trim();
    const role = cv?.contact?.jobTitle?.trim();
    if (name && role) return `${name} — ${role}`;
    return name || "Untitled draft";
  };

  const filteredUsers = useMemo(() => {
    const q = userQuery.trim().toLowerCase();
    return users.filter((u) => !q || (u.email ?? "").toLowerCase().includes(q) || u.id.includes(q));
  }, [users, userQuery]);

  const filteredCvs = useMemo(() => {
    const q = cvQuery.trim().toLowerCase();
    return sessions.filter((s) => {
      if (cvFilter !== "all" && (s.payment_status === "paid") !== (cvFilter === "paid")) return false;
      if (cvUserFilter && s.user_id !== cvUserFilter) return false;
      if (!q) return true;
      return titleOf(s).toLowerCase().includes(q) || emailOf(s.user_id).toLowerCase().includes(q);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessions, cvQuery, cvFilter, cvUserFilter, users]);

  const pending = requests.filter((r) => r.status === "pending");
  const stats = [
    { label: "Users", value: users.length },
    { label: "CVs", value: sessions.length },
    { label: "Unlocked", value: sessions.filter((s) => s.payment_status === "paid").length },
    { label: "Pending requests", value: pending.length },
  ];

  return (
    <div className="min-h-screen bg-paper text-ink font-dm">
      <SEO title="Admin · People.Studio" description="Manage users, CVs, and the paywall." path="/admin" />
      <header className="border-b border-ink/10 bg-paper">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <BrandMark to="/" />
          <Link to="/my-cvs" className="text-sm text-ink/60 hover:text-ink underline">← My CVs</Link>
        </div>
      </header>
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">Admin</h1>
            <p className="text-sm text-ink/60 mt-1">Manage users, CVs, unlock requests and settings.</p>
          </div>
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>{loading ? "Loading…" : "Refresh"}</Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {stats.map((s) => (
            <div key={s.label} className="border border-ink/10 rounded-lg bg-card p-4">
              <p className="text-xs text-ink/55">{s.label}</p>
              <p className="text-2xl font-semibold mt-1">{s.value}</p>
            </div>
          ))}
        </div>

        <Tabs defaultValue="users">
          <TabsList className="mb-4 flex-wrap h-auto">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="cvs">CV projects</TabsTrigger>
            <TabsTrigger value="requests">Unlock requests{pending.length > 0 && ` (${pending.length})`}</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Input placeholder="Search by email…" value={userQuery} onChange={(e) => setUserQuery(e.target.value)} className="mb-4 max-w-sm" />
            {filteredUsers.length === 0 ? (
              <p className="text-sm text-ink/55">{loading ? "Loading…" : "No users found."}</p>
            ) : (
              <ul className="space-y-2">
                {filteredUsers.map((u) => (
                  <li key={u.id} className="border border-ink/10 rounded-lg p-4 bg-card flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium truncate">
                        {u.email ?? "(no email)"}
                        {u.is_admin && <span className="ml-2 text-xs bg-sienna text-paper px-2 py-0.5 rounded">admin</span>}
                      </p>
                      <p className="text-xs text-ink/55 mt-1">
                        Joined {fmt(u.created_at)} · Last sign-in {fmt(u.last_sign_in_at)} · {u.providers.join(", ") || "email"}
                        {!u.email_confirmed_at && " · unconfirmed"}
                      </p>
                      <p className="text-xs text-ink/55">{u.cv_count} CV{u.cv_count === 1 ? "" : "s"} · {u.paid_count} unlocked</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" onClick={() => setCvUserFilter(u.id)} disabled={!u.cv_count}
                        asChild={false}>
                        <span onClick={() => (document.querySelector('[role="tab"][id$="cvs"]') as HTMLElement)?.click()}>View CVs</span>
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => sendReset(u)} disabled={!u.email}>Send reset email</Button>
                      <Button size="sm" variant="outline" onClick={() => { setPwUser(u); setNewPw(""); }}>Set password</Button>
                      {!u.is_admin && (
                        <Button size="sm" variant="destructive" onClick={() => setConfirm({
                          title: "Delete user?",
                          body: `This permanently deletes ${u.email} and all their CVs.`,
                          run: () => deleteUser(u),
                        })}>Delete</Button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>

          <TabsContent value="cvs">
            <div className="flex flex-wrap gap-2 mb-4 items-center">
              <Input placeholder="Search by name or email…" value={cvQuery} onChange={(e) => setCvQuery(e.target.value)} className="max-w-sm" />
              {(["all", "paid", "unpaid"] as const).map((f) => (
                <Button key={f} size="sm" variant={cvFilter === f ? "default" : "outline"} onClick={() => setCvFilter(f)}>
                  {f === "all" ? "All" : f === "paid" ? "Unlocked" : "Locked"}
                </Button>
              ))}
              {cvUserFilter && (
                <Button size="sm" variant="ghost" onClick={() => setCvUserFilter(null)}>User: {emailOf(cvUserFilter)} ✕</Button>
              )}
            </div>
            {filteredCvs.length === 0 ? (
              <p className="text-sm text-ink/55">{loading ? "Loading…" : "No CVs found."}</p>
            ) : (
              <ul className="space-y-2">
                {filteredCvs.map((s) => {
                  const paid = s.payment_status === "paid";
                  return (
                    <li key={s.id} className="border border-ink/10 rounded-lg p-4 bg-card flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium truncate">{titleOf(s)}</p>
                        <p className="text-xs text-ink/55 mt-1">
                          {emailOf(s.user_id)} · Updated {fmt(s.updated_at)} · Template {s.state?.selectedTemplate ?? "—"} ·{" "}
                          <span className={paid ? "text-olive" : "text-sienna"}>{paid ? "unlocked" : "locked"}</span>
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="outline" onClick={() => openCv(s.id)}>Open / edit</Button>
                        <Button size="sm" variant={paid ? "outline" : "default"} onClick={() => setLock(s.id, !paid)}>{paid ? "Lock" : "Unlock"}</Button>
                        <Button size="sm" variant="destructive" onClick={() => setConfirm({
                          title: "Delete CV?", body: `This permanently deletes "${titleOf(s)}".`, run: () => deleteCv(s.id),
                        })}>Delete</Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </TabsContent>

          <TabsContent value="requests">
            {requests.length === 0 ? (
              <p className="text-sm text-ink/55">No requests yet.</p>
            ) : (
              <ul className="space-y-2">
                {requests.map((r) => (
                  <li key={r.id} className="border border-ink/10 rounded-lg p-4 bg-card flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-medium truncate">{r.user_email ?? emailOf(r.user_id)}</p>
                      <p className="text-xs text-ink/55 mt-1">Session {r.session_id.slice(0, 8)} · {fmt(r.created_at)} · {r.status}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => openCv(r.session_id)}>Open</Button>
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
          </TabsContent>

          <TabsContent value="settings">
            <section className="border border-ink/10 rounded-lg p-5 bg-card flex items-center justify-between">
              <div>
                <p className="font-medium">Paywall</p>
                <p className="text-sm text-ink/60 mt-1">
                  {paywall ? "ON — users cannot self-unlock. Pay action creates an unlock request." : "OFF — clicking pay automatically unlocks the CV (no charge)."}
                </p>
              </div>
              <Switch checked={!!paywall} disabled={paywall === null || savingToggle} onCheckedChange={togglePaywall} />
            </section>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={!!pwUser} onOpenChange={(o) => !o && setPwUser(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Set new password</DialogTitle></DialogHeader>
          <p className="text-sm text-ink/60">For {pwUser?.email}. Minimum 8 characters.</p>
          <Input type="text" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="New password" />
          <DialogFooter>
            <Button variant="outline" onClick={() => setPwUser(null)}>Cancel</Button>
            <Button onClick={savePassword} disabled={busy}>{busy ? "Saving…" : "Save password"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{confirm?.title}</DialogTitle></DialogHeader>
          <p className="text-sm text-ink/60">{confirm?.body}</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirm(null)}>Cancel</Button>
            <Button variant="destructive" disabled={busy} onClick={async () => {
              if (!confirm) return;
              setBusy(true);
              try { await confirm.run(); } catch (e: any) { toast.error(e.message); }
              setBusy(false); setConfirm(null);
            }}>{busy ? "Working…" : "Delete"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <SiteFooter />
    </div>
  );
}
