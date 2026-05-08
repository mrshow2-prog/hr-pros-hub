import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSession } from "@/hooks/useAuthSession";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/sonner";
import SEO from "@/components/seo/SEO";

interface FormState {
  seo_title: string;
  seo_description: string;
  og_image_url: string;
  published: boolean;
  assistant_enabled: boolean;
  assistant_context: string;
  contentJson: string;            // raw JSON string (source of truth)
}

const empty: FormState = {
  seo_title: "", seo_description: "", og_image_url: "",
  published: true, assistant_enabled: false, assistant_context: "",
  contentJson: "{}",
};

/** Common shallow fields we surface in "Quick fields". They map onto
 *  whatever the profile actually uses (Khalil = c.hero.*, Bishoy = c.hero.*). */
type QuickKey =
  | "name" | "headline" | "tagline" | "location"
  | "photo_url" | "email" | "phone" | "linkedin";

const QUICK_LABELS: Record<QuickKey, string> = {
  name: "Display name",
  headline: "Headline / job title",
  tagline: "Tagline / sub-headline",
  location: "Location",
  photo_url: "Profile photo URL",
  email: "Contact email",
  phone: "Contact phone",
  linkedin: "LinkedIn URL",
};

/** Best-effort getters that work for both Khalil & Bishoy shapes. */
function readQuick(c: any, k: QuickKey): string {
  if (!c || typeof c !== "object") return "";
  switch (k) {
    case "name":
      return c.name || c.hero?.name || c.hero?.full_name ||
        [c.hero?.nameFirst, c.hero?.nameLast].filter(Boolean).join(" ") || "";
    case "headline":  return c.headline || c.hero?.headline || c.hero?.title || "";
    case "tagline":   return c.tagline || c.hero?.tagline || c.hero?.subtitle || "";
    case "location":  return c.location || c.hero?.location || c.contact?.location || "";
    case "photo_url": return c.photo_url || c.hero?.photo_url || c.hero?.photo || "";
    case "email":     return c.contact?.email || c.contact_email || "";
    case "phone":     return c.contact?.phone || c.contact_phone || "";
    case "linkedin":  return c.contact?.linkedin || c.linkedin_url || c.contact?.linkedin_url || "";
  }
}

/** Write a quick field back into c without disturbing other shape fields.
 *  Mirrors writes into both top-level and `hero`/`contact` so both renderers see it. */
function writeQuick(c: any, k: QuickKey, v: string): any {
  const next = { ...(c || {}) };
  next.hero = { ...(next.hero || {}) };
  next.contact = { ...(next.contact || {}) };
  switch (k) {
    case "name":      next.name = v; next.hero.name = v; break;
    case "headline":  next.headline = v; next.hero.headline = v; break;
    case "tagline":   next.tagline = v; next.hero.tagline = v; break;
    case "location":  next.location = v; next.hero.location = v; next.contact.location = v; break;
    case "photo_url": next.photo_url = v; next.hero.photo_url = v; break;
    case "email":     next.contact.email = v; next.contact_email = v; break;
    case "phone":     next.contact.phone = v; next.contact_phone = v; break;
    case "linkedin":  next.contact.linkedin = v; next.linkedin_url = v; break;
  }
  return next;
}

export default function AdminProfileEditor() {
  const { slug } = useParams<{ slug: string }>();
  const { loading: authLoading, session } = useAuthSession();
  const qc = useQueryClient();
  const [form, setForm] = useState<FormState>(empty);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [jsonError, setJsonError] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-profile", slug],
    enabled: !!slug && !!session,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles_content").select("*").eq("slug", slug!).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (!data) return;
    setForm({
      seo_title: data.seo_title || "",
      seo_description: data.seo_description || "",
      og_image_url: data.og_image_url || "",
      published: data.published,
      assistant_enabled: (data as any).assistant_enabled ?? false,
      assistant_context: (data as any).assistant_context ?? "",
      contentJson: JSON.stringify(data.content || {}, null, 2),
    });
    setJsonError(null);
  }, [data]);

  // Parsed content (from textarea) — single source of truth
  const parsed = useMemo(() => {
    try {
      const v = JSON.parse(form.contentJson || "{}");
      return { ok: true as const, value: v };
    } catch (e: any) {
      return { ok: false as const, message: e.message };
    }
  }, [form.contentJson]);

  if (authLoading) return <div className="min-h-screen flex items-center justify-center">Loading…</div>;
  if (!session) return <Navigate to="/admin/login" replace />;
  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading…</div>;
  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p>Profile not found or you don't have access.</p>
        <Button asChild variant="outline"><Link to="/admin">Back</Link></Button>
      </div>
    );
  }

  const update = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((s) => ({ ...s, [k]: v }));

  const setQuick = (k: QuickKey, v: string) => {
    if (!parsed.ok) { toast.error("Fix JSON before editing quick fields"); return; }
    const next = writeQuick(parsed.value, k, v);
    update("contentJson", JSON.stringify(next, null, 2));
  };

  const upload = async (file: File): Promise<string | null> => {
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${slug}/${Date.now()}.${ext}`;
    setUploading(true);
    const { error } = await supabase.storage.from("profile-images")
      .upload(path, file, { upsert: false });
    setUploading(false);
    if (error) { toast.error(error.message); return null; }
    return supabase.storage.from("profile-images").getPublicUrl(path).data.publicUrl;
  };

  const formatJson = () => {
    if (!parsed.ok) { setJsonError(parsed.message); toast.error("Invalid JSON"); return; }
    update("contentJson", JSON.stringify(parsed.value, null, 2));
    setJsonError(null);
    toast.success("JSON formatted");
  };

  const save = async () => {
    if (!parsed.ok) {
      setJsonError(parsed.message);
      toast.error("Cannot save — fix JSON syntax first");
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("profiles_content")
      .update({
        seo_title: form.seo_title,
        seo_description: form.seo_description,
        og_image_url: form.og_image_url || null,
        published: form.published,
        assistant_enabled: form.assistant_enabled,
        assistant_context: form.assistant_context,
        content: parsed.value,
      } as any)
      .eq("id", data.id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Saved");
    qc.invalidateQueries({ queryKey: ["profile-content", slug] });
    qc.invalidateQueries({ queryKey: ["admin-profile", slug] });
  };

  const c = parsed.ok ? parsed.value : {};

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO title={`Edit /${slug} · Admin`} description="Edit profile" path={`/admin/${slug}`} />
      <header className="border-b border-border sticky top-0 bg-background z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <Link to="/admin" className="text-sm text-muted-foreground hover:text-foreground">← Back</Link>
            <h1 className="text-xl font-semibold mt-1">Edit /{slug}</h1>
          </div>
          <div className="flex gap-2 items-center">
            {!parsed.ok && (
              <span className="text-xs text-destructive">JSON error</span>
            )}
            <Button asChild variant="outline" size="sm">
              <a href={`/${slug}`} target="_blank" rel="noopener">Preview</a>
            </Button>
            <Button onClick={save} disabled={saving || !parsed.ok} size="sm">
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <Tabs defaultValue="seo" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="seo">Visibility & SEO</TabsTrigger>
            <TabsTrigger value="quick">Quick fields</TabsTrigger>
            <TabsTrigger value="content">Content (JSON)</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          {/* ---------------- VISIBILITY & SEO ---------------- */}
          <TabsContent value="seo" className="space-y-6 max-w-2xl">
            <section className="space-y-3">
              <h2 className="text-lg font-medium">Visibility</h2>
              <div className="flex items-center gap-3">
                <Switch checked={form.published}
                        onCheckedChange={(v) => update("published", v)} id="pub" />
                <Label htmlFor="pub">Published (visible to public)</Label>
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-medium">Profile assistant (chatbot)</h2>
              <div className="flex items-center gap-3">
                <Switch
                  id="asst"
                  checked={form.assistant_enabled}
                  onCheckedChange={(v) => update("assistant_enabled", v)}
                />
                <Label htmlFor="asst">
                  Enable on-page assistant for /{slug}
                </Label>
              </div>
              <p className="text-xs text-muted-foreground">
                When on, a chat widget appears on this profile page and only answers
                questions about this person — using the page content plus any extra
                background you paste below (CV text, bio, project notes, FAQs).
              </p>
              <Field label="Extra background for the assistant (private — not shown on page)">
                <Textarea
                  value={form.assistant_context}
                  onChange={(e) => update("assistant_context", e.target.value)}
                  rows={10}
                  placeholder="Paste full CV text, additional bio, FAQs, references, or anything the chatbot should be able to answer about. Visible only to the assistant."
                />
              </Field>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-medium">SEO</h2>
              <Field label="Page title (≤120 chars)">
                <Input value={form.seo_title}
                       onChange={(e) => update("seo_title", e.target.value)}
                       maxLength={120} />
              </Field>
              <Field label="Meta description (≤300 chars)">
                <Textarea value={form.seo_description}
                          onChange={(e) => update("seo_description", e.target.value)}
                          maxLength={300} rows={3} />
              </Field>
              <Field label="Social share image URL (og:image)">
                <Input value={form.og_image_url}
                       onChange={(e) => update("og_image_url", e.target.value)} />
              </Field>
            </section>
          </TabsContent>

          {/* ---------------- QUICK FIELDS ---------------- */}
          <TabsContent value="quick" className="space-y-4 max-w-2xl">
            <p className="text-sm text-muted-foreground">
              Common fields shared by every profile. Edits here update the underlying JSON.
              For section-specific content (hero stats, specialties, achievements, etc.)
              use the <strong>Content (JSON)</strong> tab.
            </p>
            {(Object.keys(QUICK_LABELS) as QuickKey[]).map((k) => (
              <Field key={k} label={QUICK_LABELS[k]}>
                {k === "photo_url" ? (
                  <div className="space-y-2">
                    <div className="flex gap-2 items-start">
                      <Input value={readQuick(c, k)}
                             onChange={(e) => setQuick(k, e.target.value)}
                             placeholder="https://… or upload" />
                      <label className="shrink-0">
                        <input type="file" accept="image/*" className="hidden"
                          onChange={async (e) => {
                            const f = e.target.files?.[0]; if (!f) return;
                            const url = await upload(f);
                            if (url) setQuick(k, url);
                          }} />
                        <span className="inline-flex h-10 items-center px-4 rounded-md border border-input bg-background hover:bg-accent cursor-pointer text-sm">
                          {uploading ? "…" : "Upload"}
                        </span>
                      </label>
                    </div>
                    {readQuick(c, k) && (
                      <img src={readQuick(c, k)} alt=""
                           className="w-24 h-24 object-cover rounded border border-border" />
                    )}
                  </div>
                ) : (
                  <Input value={readQuick(c, k)}
                         onChange={(e) => setQuick(k, e.target.value)} />
                )}
              </Field>
            ))}
          </TabsContent>

          {/* ---------------- CONTENT JSON ---------------- */}
          <TabsContent value="content" className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Full <code>content</code> JSONB. This is the source of truth for the page —
                edit any structured field (hero, sections, specialties, etc.).
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={formatJson}>Format</Button>
                <Button variant="ghost" size="sm" onClick={() => {
                  update("contentJson", JSON.stringify(data.content || {}, null, 2));
                  setJsonError(null);
                }}>Reset to saved</Button>
              </div>
            </div>
            <Textarea
              value={form.contentJson}
              onChange={(e) => { update("contentJson", e.target.value); setJsonError(null); }}
              rows={32}
              spellCheck={false}
              className="font-mono text-xs leading-relaxed"
            />
            {(!parsed.ok || jsonError) && (
              <div className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded p-3">
                {jsonError || (!parsed.ok && parsed.message)}
              </div>
            )}
            {parsed.ok && (
              <p className="text-xs text-muted-foreground">
                ✓ Valid JSON · {Object.keys(parsed.value || {}).length} top-level keys
              </p>
            )}
          </TabsContent>

          {/* ---------------- PREVIEW ---------------- */}
          <TabsContent value="preview">
            <div className="rounded-lg border border-border overflow-hidden bg-muted/30">
              <div className="px-4 py-2 border-b border-border text-xs text-muted-foreground flex justify-between">
                <span>Live preview · /{slug}</span>
                <a href={`/${slug}`} target="_blank" rel="noopener"
                   className="hover:text-foreground">Open in new tab ↗</a>
              </div>
              <iframe
                src={`/${slug}`}
                title={`Preview ${slug}`}
                className="w-full"
                style={{ height: "75vh", background: "white" }}
              />
              <p className="px-4 py-2 text-xs text-muted-foreground border-t border-border">
                Preview reflects the last <strong>saved</strong> version. Save to see changes.
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end pt-8 pb-12">
          <Button onClick={save} disabled={saving || !parsed.ok}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
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
