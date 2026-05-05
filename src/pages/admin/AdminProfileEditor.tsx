import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSession } from "@/hooks/useAuthSession";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/sonner";
import SEO from "@/components/seo/SEO";

interface FormState {
  seo_title: string;
  seo_description: string;
  og_image_url: string;
  published: boolean;
  name: string;
  headline: string;
  location: string;
  photo_url: string;
  bio: string;
  contact_email: string;
  contact_phone: string;
  linkedin_url: string;
  cv_url: string;
  achievements: string[];
}

const empty: FormState = {
  seo_title: "", seo_description: "", og_image_url: "", published: true,
  name: "", headline: "", location: "", photo_url: "", bio: "",
  contact_email: "", contact_phone: "", linkedin_url: "", cv_url: "",
  achievements: [],
};

export default function AdminProfileEditor() {
  const { slug } = useParams<{ slug: string }>();
  const { loading: authLoading, session } = useAuthSession();
  const nav = useNavigate();
  const qc = useQueryClient();
  const [form, setForm] = useState<FormState>(empty);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-profile", slug],
    enabled: !!slug && !!session,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles_content")
        .select("*")
        .eq("slug", slug!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (!data) return;
    const c = (data.content as any) || {};
    setForm({
      seo_title: data.seo_title || "",
      seo_description: data.seo_description || "",
      og_image_url: data.og_image_url || "",
      published: data.published,
      name: c.name || "",
      headline: c.headline || "",
      location: c.location || "",
      photo_url: c.photo_url || "",
      bio: c.bio || "",
      contact_email: c.contact_email || "",
      contact_phone: c.contact_phone || "",
      linkedin_url: c.linkedin_url || "",
      cv_url: c.cv_url || "",
      achievements: Array.isArray(c.achievements) ? c.achievements : [],
    });
  }, [data]);

  if (authLoading) return <div className="min-h-screen flex items-center justify-center">Loading…</div>;
  if (!session) return <Navigate to="/admin/login" replace />;

  const update = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((s) => ({ ...s, [k]: v }));

  const upload = async (file: File): Promise<string | null> => {
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${slug}/${Date.now()}.${ext}`;
    setUploading(true);
    const { error } = await supabase.storage.from("profile-images").upload(path, file, { upsert: false });
    setUploading(false);
    if (error) {
      toast.error(error.message);
      return null;
    }
    const { data } = supabase.storage.from("profile-images").getPublicUrl(path);
    return data.publicUrl;
  };

  const save = async () => {
    if (!data) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles_content")
      .update({
        seo_title: form.seo_title,
        seo_description: form.seo_description,
        og_image_url: form.og_image_url || null,
        published: form.published,
        content: {
          name: form.name,
          headline: form.headline,
          location: form.location,
          photo_url: form.photo_url,
          bio: form.bio,
          contact_email: form.contact_email,
          contact_phone: form.contact_phone,
          linkedin_url: form.linkedin_url,
          cv_url: form.cv_url,
          achievements: form.achievements.filter((a) => a.trim()),
        },
      })
      .eq("id", data.id);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Saved");
    qc.invalidateQueries({ queryKey: ["profile-content", slug] });
    qc.invalidateQueries({ queryKey: ["admin-profile", slug] });
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading…</div>;
  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p>Profile not found or you don't have access.</p>
        <Button asChild variant="outline"><Link to="/admin">Back</Link></Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO title={`Edit /${slug} · Admin`} description="Edit profile" path={`/admin/${slug}`} />
      <header className="border-b border-border sticky top-0 bg-background z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <Link to="/admin" className="text-sm text-muted-foreground hover:text-foreground">← Back</Link>
            <h1 className="text-xl font-semibold mt-1">Edit /{slug}</h1>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm"><a href={`/${slug}`} target="_blank" rel="noopener">Preview</a></Button>
            <Button onClick={save} disabled={saving} size="sm">{saving ? "Saving…" : "Save"}</Button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8 space-y-8">
        <section className="space-y-4">
          <h2 className="text-lg font-medium">Visibility</h2>
          <div className="flex items-center gap-3">
            <Switch checked={form.published} onCheckedChange={(v) => update("published", v)} id="pub" />
            <Label htmlFor="pub">Published (visible to public)</Label>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-medium">SEO</h2>
          <Field label="Page title (SEO)"><Input value={form.seo_title} onChange={(e) => update("seo_title", e.target.value)} maxLength={120} /></Field>
          <Field label="Meta description"><Textarea value={form.seo_description} onChange={(e) => update("seo_description", e.target.value)} maxLength={300} rows={2} /></Field>
          <Field label="Social share image URL"><Input value={form.og_image_url} onChange={(e) => update("og_image_url", e.target.value)} /></Field>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-medium">Profile</h2>
          <Field label="Name"><Input value={form.name} onChange={(e) => update("name", e.target.value)} /></Field>
          <Field label="Headline / tagline"><Input value={form.headline} onChange={(e) => update("headline", e.target.value)} /></Field>
          <Field label="Location"><Input value={form.location} onChange={(e) => update("location", e.target.value)} /></Field>

          <Field label="Photo">
            <div className="flex gap-2 items-start">
              <Input value={form.photo_url} onChange={(e) => update("photo_url", e.target.value)} placeholder="Image URL" />
              <label className="shrink-0">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    const url = await upload(f);
                    if (url) update("photo_url", url);
                  }}
                />
                <span className="inline-flex h-10 items-center px-4 rounded-md border border-input bg-background hover:bg-accent cursor-pointer text-sm">
                  {uploading ? "…" : "Upload"}
                </span>
              </label>
            </div>
            {form.photo_url && <img src={form.photo_url} alt="" className="mt-2 w-24 h-24 object-cover rounded" />}
          </Field>

          <Field label="Bio"><Textarea value={form.bio} onChange={(e) => update("bio", e.target.value)} rows={6} /></Field>
        </section>

        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium">Highlights / Achievements</h2>
            <Button variant="outline" size="sm" onClick={() => update("achievements", [...form.achievements, ""])}>+ Add</Button>
          </div>
          {form.achievements.map((a, i) => (
            <div key={i} className="flex gap-2">
              <Textarea
                value={a}
                rows={2}
                onChange={(e) => {
                  const next = [...form.achievements];
                  next[i] = e.target.value;
                  update("achievements", next);
                }}
              />
              <div className="flex flex-col gap-1">
                <Button variant="ghost" size="sm" disabled={i === 0} onClick={() => {
                  const next = [...form.achievements];
                  [next[i - 1], next[i]] = [next[i], next[i - 1]];
                  update("achievements", next);
                }}>↑</Button>
                <Button variant="ghost" size="sm" disabled={i === form.achievements.length - 1} onClick={() => {
                  const next = [...form.achievements];
                  [next[i + 1], next[i]] = [next[i], next[i + 1]];
                  update("achievements", next);
                }}>↓</Button>
                <Button variant="ghost" size="sm" onClick={() => update("achievements", form.achievements.filter((_, j) => j !== i))}>✕</Button>
              </div>
            </div>
          ))}
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-medium">Contact</h2>
          <Field label="Email"><Input type="email" value={form.contact_email} onChange={(e) => update("contact_email", e.target.value)} /></Field>
          <Field label="Phone"><Input value={form.contact_phone} onChange={(e) => update("contact_phone", e.target.value)} /></Field>
          <Field label="LinkedIn URL"><Input value={form.linkedin_url} onChange={(e) => update("linkedin_url", e.target.value)} /></Field>
          <Field label="CV / PDF URL"><Input value={form.cv_url} onChange={(e) => update("cv_url", e.target.value)} /></Field>
        </section>

        <div className="flex justify-end pb-12">
          <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save changes"}</Button>
        </div>
      </main>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
