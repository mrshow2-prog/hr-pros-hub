import { useCallback, useEffect, useRef, useState, ChangeEvent, KeyboardEvent } from "react";
import {
  Check,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Camera,
  RefreshCw,
  X,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Loader2,
  Pencil,
  CaseSensitive,
} from "lucide-react";
import { applyCase, nextCase, type CaseMode } from "@/lib/cv/textCase";
import {
  useCVBuilder,
  type CVBullet,
  type CVExperience,
  type CVEducation,
  type CompetencyCluster,
  type ContactInfo,
  type LanguageEntry,
  type SectionKey,
  type Certification,
  type CustomSection,
} from "@/contexts/CVBuilderContext";
import { supabase } from "@/integrations/supabase/client";
import { StepFooter, StepHeader } from "./WizardShell";
import { cn } from "@/lib/utils";
import PdfmePreview from "./templates/PdfmePreview";
import PhotoCropperDialog from "./PhotoCropperDialog";
import { getPalette } from "@/lib/cv/palettes";
import SidebarPlacementToggle from "./editor/SidebarPlacementToggle";


const LANG_LEVELS: LanguageEntry["level"][] = [
  "Basic",
  "Conversational",
  "Professional",
  "Fluent",
  "Native",
];

export default function StepDraft() {
  const { state, setGeneratedCV, setAts, setStep } = useCVBuilder();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runGeneration = useCallback(async (provider: "gemini" | "nvidia" | "lovable" = "gemini") => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("generate-cv", {
        body: {
          parsedText: state.parsedText,
          intentForm: state.intentForm,
          gapResponses: state.gapAnalysis.responses,
          template: state.selectedTemplate,
          typeOption: state.typeOption,
          uploadedFiles: state.uploadedFiles,
          pageLimit: state.intentForm.pageLimit ?? null,
          provider,
        },
      });
      if (fnError) throw fnError;
      if (data?.error) throw new Error(`${data.error}${data.details ? ` — ${data.details}` : ""}`);
      if (data?.generatedCV) {
        setGeneratedCV(data.generatedCV);
        // Try ATS with fallback chain: gemini → lovable → nvidia
        const providers: Array<"gemini" | "lovable" | "nvidia"> = ["gemini", "lovable", "nvidia"];
        for (const p of providers) {
          const ats = await supabase.functions.invoke("calculate-ats-score", {
            body: {
              generatedCV: data.generatedCV,
              intentForm: state.intentForm,
              targetRole: state.intentForm.targetRoles.join(", "),
              provider: p,
            },
          });
          if (ats.data?.atsScore) { setAts(ats.data.atsScore); break; }
        }
      }
    } catch (err) {
      console.error("CV generation failed", err);
      setError((err as Error).message ?? "unknown error");
    } finally {
      setLoading(false);
    }
  }, [
    state.parsedText, state.intentForm, state.gapAnalysis.responses,
    state.selectedTemplate, state.typeOption, state.uploadedFiles,
    setGeneratedCV, setAts,
  ]);

  useEffect(() => {
    if (state.generatedCV) return;
    runGeneration("gemini");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading || !state.generatedCV) {
    return (
      <>
        <StepHeader
          eyebrow="Step 4 · Draft"
          title="Rewriting your CV"
          subtitle="Pulling your answers into a clean draft. This usually takes 20–30 seconds."
        />
        {error ? (
          <div className="rounded-md border border-sienna/30 bg-clay/30 p-6 font-dm text-sm text-ink/70">
            <p className="font-medium text-ink">We're experiencing high demand right now.</p>
            <p className="mt-2">
              Our AI couldn't rewrite your CV after several attempts. Please wait a few minutes and try again — your progress is saved.
            </p>
            <p className="mt-3 text-xs text-ink/50">Details: {error}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => runGeneration("gemini")}
                className="inline-flex items-center gap-2 rounded-sm bg-sienna px-4 py-2 font-dm text-sm font-medium text-paper hover:opacity-90"
              >
                <RefreshCw size={14} /> Retry with Gemini
              </button>
              <button
                type="button"
                onClick={() => runGeneration("nvidia")}
                className="inline-flex items-center gap-2 rounded-sm border border-ink/20 px-4 py-2 font-dm text-sm text-ink hover:border-ink/40"
              >
                <RefreshCw size={14} /> Try with Nvidia
              </button>
              <button
                type="button"
                onClick={() => runGeneration("lovable")}
                className="inline-flex items-center gap-2 rounded-sm border border-ink/20 px-4 py-2 font-dm text-sm text-ink hover:border-ink/40"
              >
                <RefreshCw size={14} /> Try with Lovable AI
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="inline-flex items-center gap-2 rounded-sm border border-ink/20 px-4 py-2 font-dm text-sm text-ink hover:border-ink/40"
              >
                Back to gaps
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded bg-clay/40" />
            ))}
          </div>
        )}
        <StepFooter onBack={() => setStep(3)} />
      </>
    );
  }

  const cv = state.generatedCV;
  const showCompetencies =
    state.intentForm.cvType === "skills" || state.intentForm.cvType === "hybrid";

  return (
    <>
      <StepHeader
        eyebrow="Step 6 · Draft"
        title="Your CV, professionally rewritten"
        subtitle="Every section is editable. Tweak any field, add or remove entries, and rescore as you go."
      />

      <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
        <div className="space-y-10">
          <SectionShell sectionKey="contact" title="Contact">
            <ContactBlock contact={cv.contact} />
          </SectionShell>

          <SectionShell sectionKey="summary" title="Professional summary">
            <SummaryBlock summary={cv.summary} />
          </SectionShell>

          <SectionShell sectionKey="experience" title="Work experience">
            <ExperienceList experience={cv.experience} />
          </SectionShell>

          <SectionShell
            sectionKey="skills"
            title="Skills"
            headerAction={
              <div className="flex items-center gap-2">
                <SidebarPlacementToggle sectionKey="skills" />
                <SkillsCaseToggle />
              </div>
            }
          >
            <SkillsBlock skills={cv.skills} />
          </SectionShell>

          <SectionShell
            sectionKey="education"
            title="Education & certifications"
            headerAction={<SidebarPlacementToggle sectionKey="education" />}
          >
            <EducationBlock education={cv.education} />
          </SectionShell>

          {showCompetencies && (
            <SectionShell sectionKey="competencies" title="Competency clusters">
              <ClustersBlock clusters={cv.competencyClusters} />
            </SectionShell>
          )}

          <SectionShell
            sectionKey="languages"
            title="Languages"
            headerAction={<SidebarPlacementToggle sectionKey="languages" />}
          >
            <LanguagesBlock languages={cv.languages} />
          </SectionShell>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-32 lg:self-start">
          <LivePreview />
          <AtsPanel />
          <SavedIndicator />
        </aside>
      </div>

      <StepFooter onBack={() => setStep(3)} onNext={() => setStep(5)} nextLabel="Export" />
    </>
  );
}

/* ---------------- Section shell with hide toggle ---------------- */

export function SectionShell({
  sectionKey,
  title,
  children,
  canMoveUp,
  canMoveDown,
  showEmptyHint,
  hideMoveControls,
  hideVisibilityControl,
  headerAction,
}: {
  sectionKey: SectionKey;
  title: string;
  children: React.ReactNode;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  /** When true, render a subtle hint that the section won't appear on the CV. */
  showEmptyHint?: boolean;
  /** Suppress the up/down chevrons (used when the parent renders them in its own header). */
  hideMoveControls?: boolean;
  /** Suppress the visible/hidden toggle (used when the parent renders it in its own header). */
  hideVisibilityControl?: boolean;
  /** Optional element rendered on the right of the header (before move/visibility controls). */
  headerAction?: React.ReactNode;
}) {
  const { state, toggleSection, moveSection } = useCVBuilder();
  const hidden = state.generatedCV?.hiddenSections.includes(sectionKey);
  const isReorderable = sectionKey !== "contact" && sectionKey !== "summary";
  const showArrows = isReorderable && !hideMoveControls;
  const showVis = !hideVisibilityControl;
  const showHeader = showArrows || showVis || !!headerAction;
  return (
    <section className={cn("rounded-md", hidden && "opacity-50")}>
      {showHeader && (
        <header className="mb-4 flex items-center justify-between">
          <h2 className="font-syne text-xl text-ink">{title}</h2>
          <div className="flex items-center gap-1">
            {headerAction}
            {showArrows && (
              <>
                <button
                  type="button"
                  onClick={() => moveSection(sectionKey, "up")}
                  disabled={!canMoveUp}
                  className="inline-flex h-7 w-7 items-center justify-center rounded border border-ink/15 text-ink/65 hover:border-ink/30 hover:text-ink disabled:cursor-not-allowed disabled:opacity-30"
                  title="Move section up"
                  aria-label="Move section up"
                >
                  <ChevronUp size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => moveSection(sectionKey, "down")}
                  disabled={!canMoveDown}
                  className="inline-flex h-7 w-7 items-center justify-center rounded border border-ink/15 text-ink/65 hover:border-ink/30 hover:text-ink disabled:cursor-not-allowed disabled:opacity-30"
                  title="Move section down"
                  aria-label="Move section down"
                >
                  <ChevronDown size={14} />
                </button>
              </>
            )}
            {showVis && (
              <button
                type="button"
                onClick={() => toggleSection(sectionKey)}
                className="inline-flex items-center gap-1.5 rounded border border-ink/15 px-2 py-1 font-dm text-[11px] text-ink/65 hover:border-ink/30"
                title={hidden ? "Show section in export" : "Hide section from export"}
              >
                {hidden ? <EyeOff size={12} /> : <Eye size={12} />}
                {hidden ? "Hidden" : "Visible"}
              </button>
            )}
          </div>
        </header>
      )}
      {showEmptyHint && !hidden && (
        <p className="mb-3 rounded-sm bg-ink/5 px-3 py-2 font-dm text-[11px] text-ink/60">
          This section is empty and won't appear on your CV until you add content.
        </p>
      )}
      {children}
    </section>
  );
}

/* ---------------- Contact ---------------- */

export function ContactBlock({ contact }: { contact: ContactInfo }) {
  const { patchContact, state, setPhotoPath, patchIntent } = useCVBuilder();
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [err, setErr] = useState("");
  const [uploading, setUploading] = useState(false);
  const [cropperOpen, setCropperOpen] = useState(false);
  const [cropperSource, setCropperSource] = useState<File | string | null>(null);

  const photoPath = state.photoPath;

  useEffect(() => {
    let active = true;
    (async () => {
      if (!photoPath) {
        setPhotoUrl(null);
        return;
      }
      const { data } = await supabase.storage
        .from("cv-builder-uploads")
        .createSignedUrl(photoPath, 60 * 60);
      if (active) setPhotoUrl(data?.signedUrl ?? null);
    })();
    return () => {
      active = false;
    };
  }, [photoPath]);

  const handlePhoto = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    setErr("");
    if (!["image/jpeg", "image/png"].includes(f.type)) {
      setErr("Please upload a JPG or PNG.");
      return;
    }
    if (f.size > 20 * 1024 * 1024) {
      setErr("Photo is too large. Please choose one under 20MB.");
      return;
    }
    setCropperSource(f);
    setCropperOpen(true);
  };

  const openEditCurrent = () => {
    if (!photoUrl) return;
    setErr("");
    setCropperSource(photoUrl);
    setCropperOpen(true);
  };

  const uploadCropped = async (cropped: File) => {
    setCropperOpen(false);
    setUploading(true);
    const { data: sess } = await supabase.auth.getSession();
    const uid = sess.session?.user.id;
    if (!uid) {
      setUploading(false);
      setErr("Please sign in to upload a photo.");
      return;
    }
    const safeName = cropped.name.normalize("NFKD").replace(/[^\w.\-]+/g, "_");
    const path = `${uid}/${state.sessionId}/photo-${Date.now()}-${safeName}`;
    const { error } = await supabase.storage
      .from("cv-builder-uploads")
      .upload(path, cropped, { upsert: true, contentType: "image/jpeg" });
    setUploading(false);
    if (error) {
      setErr("Upload failed. Try again.");
      return;
    }
    setPhotoPath(path);
  };

  const photoShape = state.intentForm.photoShape;
  const shapeClass =
    photoShape === "square"
      ? "rounded-md"
      : photoShape === "none"
        ? "rounded-md opacity-50"
        : "rounded-full";

  const photoRow = (
    <div className="flex items-center gap-4">
      {photoUrl ? (
        <button
          type="button"
          onClick={openEditCurrent}
          className="group relative h-20 w-20 shrink-0"
          aria-label="Edit photo"
        >
          <span
            className={cn(
              "block h-full w-full overflow-hidden border border-ink/10 group-hover:ring-2 group-hover:ring-sienna/50",
              shapeClass,
            )}
          >
            <img src={photoUrl} alt="" className="h-full w-full object-cover" />
          </span>
          <span className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full bg-sienna text-paper ring-2 ring-paper">
            <Pencil size={11} />
          </span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className={cn(
            "group relative flex h-20 w-20 shrink-0 items-center justify-center border border-dashed border-ink/25 bg-clay/30 hover:border-sienna",
            shapeClass,
          )}
        >
          {uploading ? (
            <span className="font-dm text-[10px] text-ink/65">Uploading…</span>
          ) : (
            <div className="flex flex-col items-center text-ink/55 group-hover:text-sienna">
              <Camera size={16} />
              <span className="mt-0.5 font-dm text-[9px]">Add</span>
            </div>
          )}
        </button>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex items-center gap-1 rounded border border-ink/15 p-0.5">
          {(["circle", "square", "none"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => patchIntent({ photoShape: s })}
              className={cn(
                "rounded px-2 py-0.5 font-dm text-[10px] capitalize",
                photoShape === s ? "bg-sienna text-paper" : "text-ink/65 hover:text-ink",
              )}
              title={`Photo frame: ${s}`}
            >
              {s === "none" ? "Hide" : s}
            </button>
          ))}
        </div>
        {photoUrl ? (
          <button
            type="button"
            onClick={() => setPhotoPath(null)}
            className="inline-flex items-center gap-1 rounded border border-ink/15 px-2.5 py-1 font-dm text-xs text-ink/55 hover:border-amber-500 hover:text-amber-700"
          >
            <Trash2 size={11} /> Remove
          </button>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-1 rounded border border-ink/15 px-2.5 py-1 font-dm text-xs text-ink/70 hover:border-ink/40 hover:text-ink"
          >
            <Camera size={11} /> Upload photo
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="rounded-md border border-ink/10 bg-paper p-5">
      <div className="space-y-4">
        {photoRow}
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png"
          className="sr-only"
          onChange={handlePhoto}
        />

        <div className="flex items-center justify-between gap-2 pt-1">
          <p className="font-dm text-[11px] uppercase tracking-[0.12em] text-ink/55">Name &amp; headline</p>
          <CaseToggleButton
            onApply={(mode) =>
              patchContact({
                name: applyCase(contact.name || "", mode),
                jobTitle: applyCase(contact.jobTitle || "", mode),
              })
            }
          />
        </div>

        <div data-field="name">
          <Field label="Full name" value={contact.name} onChange={(v) => patchContact({ name: v })} />
        </div>
        <div data-field="jobTitle">
          <Field
            label="Job title"
            value={contact.jobTitle}
            onChange={(v) => patchContact({ jobTitle: v })}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div data-field="email">
            <Field
              label="Email"
              type="email"
              value={contact.email}
              onChange={(v) => patchContact({ email: v })}
            />
          </div>
          <div data-field="phone">
            <Field label="Phone" value={contact.phone} onChange={(v) => patchContact({ phone: v })} />
          </div>
          <div data-field="location">
            <Field
              label="Location"
              value={contact.location}
              onChange={(v) => patchContact({ location: v })}
            />
          </div>
          <div data-field="linkedinUrl">
            <Field
              label="LinkedIn URL"
              value={contact.linkedinUrl}
              onChange={(v) => patchContact({ linkedinUrl: v })}
            />
          </div>
          <div data-field="website" className="sm:col-span-2">
            <Field
              label="Personal website / portfolio (optional)"
              value={contact.website ?? ""}
              onChange={(v) => patchContact({ website: v })}
            />
          </div>
        </div>
      </div>
      {err && (
        <p className="mt-3 rounded border-l-2 border-amber-500 bg-amber-50 px-3 py-2 font-dm text-xs text-amber-900">
          {err}
        </p>
      )}
      <PhotoCropperDialog
        open={cropperOpen}
        source={cropperSource}
        onCancel={() => setCropperOpen(false)}
        onConfirm={uploadCropped}
      />
    </div>
  );
}

/* ---------------- Live preview pane ---------------- */

export function LivePreview() {
  const { state } = useCVBuilder();
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!state.photoPath) {
        setPhotoUrl(null);
        return;
      }
      const { data } = await supabase.storage
        .from("cv-builder-uploads")
        .createSignedUrl(state.photoPath, 60 * 60);
      if (active) setPhotoUrl(data?.signedUrl ?? null);
    })();
    return () => {
      active = false;
    };
  }, [state.photoPath]);

  if (!state.generatedCV || !state.selectedTemplate) return null;

  const scale = 0.36;
  const accentHex = getPalette(state.intentForm.colorPalette).accentHex;
  return (
    <div className="rounded-md border border-ink/10 bg-paper p-3">
      <p className="mb-2 font-dm text-[11px] uppercase tracking-wider2 text-ink/55">
        Live preview · {state.selectedTemplate}
      </p>
      <div className="max-h-[520px] overflow-y-auto rounded bg-clay/40 p-3">
        <div className="mx-auto" style={{ width: 794 * scale }}>
          <PdfmePreview
            cv={state.generatedCV}
            template={state.selectedTemplate}
            photoUrl={photoUrl}
            pageWidth={794 * scale}
            gap={24 * scale}
            accentHex={accentHex}
            photoShape={state.intentForm.photoShape}
            sidebarPlacement={state.intentForm.sidebarPlacement}
          />
        </div>
      </div>
    </div>
  );
}

/* ---------------- Summary ---------------- */

export function SummaryBlock({ summary }: { summary: string }) {
  const { patchSummary, state } = useCVBuilder();
  const [busy, setBusy] = useState<null | "expand" | "condense" | "rewrite">(null);
  const [err, setErr] = useState<string | null>(null);

  const run = async (action: "expand" | "condense" | "rewrite") => {
    setBusy(action); setErr(null);
    try {
      const { data, error } = await supabase.functions.invoke("generate-cv-section", {
        body: {
          action,
          kind: "summary",
          currentSummary: summary,
          intentForm: state.intentForm,
        },
      });
      if (error) throw new Error(error.message);
      if (data?.error) { setErr(data.error); return; }
      if (typeof data?.summary === "string" && data.summary.trim()) patchSummary(data.summary.trim());
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-3">
      <AutoTextarea value={summary} onChange={patchSummary} placeholder="A short paragraph that frames your value to the roles you're targeting." className="min-h-32" />
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-dm text-xs">
        <AiActionBtn label="Expand" busy={busy === "expand"} disabled={!!busy} onClick={() => run("expand")} />
        <span className="text-ink/25">·</span>
        <AiActionBtn label="Condense" busy={busy === "condense"} disabled={!!busy} onClick={() => run("condense")} />
        <span className="text-ink/25">·</span>
        <AiActionBtn label="Rewrite" busy={busy === "rewrite"} disabled={!!busy} onClick={() => run("rewrite")} />
        {busy && <span className="ml-2 inline-flex items-center gap-1.5 text-ink/55"><Loader2 size={12} className="animate-spin" /> Working…</span>}
      </div>
      {err && <p className="font-dm text-[11px] text-amber-700">{err}</p>}
    </div>
  );
}

/* ---------------- Experience ---------------- */

export function ExperienceList({ experience }: { experience: CVExperience[] }) {
  const { addExperience } = useCVBuilder();
  return (
    <div className="space-y-5">
      {experience.map((exp) => (
        <ExperienceCard key={exp.id} exp={exp} />
      ))}
      <button
        type="button"
        onClick={addExperience}
        className="inline-flex items-center gap-2 rounded border border-dashed border-ink/25 px-3 py-2 font-dm text-sm text-ink/70 hover:border-sienna hover:text-sienna"
      >
        <Plus size={14} /> Add work experience
      </button>
    </div>
  );
}

function ExperienceCard({ exp }: { exp: CVExperience }) {
  const { patchExperience, removeExperience, addBullet, updateBullet, removeBullet, replaceBullets, state } =
    useCVBuilder();
  const [confirming, setConfirming] = useState(false);
  const [originalsOpen, setOriginalsOpen] = useState(false);
  const [showChanges, setShowChanges] = useState(false);
  const [busy, setBusy] = useState<null | "condense" | "expand" | "tailor">(null);
  const [aiError, setAiError] = useState<{ msg: string; details?: string } | null>(null);

  const originals = exp.bullets.map((b) => b.original).filter(Boolean);

  const runAction = async (action: "condense" | "expand" | "tailor") => {
    setBusy(action);
    setAiError(null);
    try {
      const { data, error } = await supabase.functions.invoke("generate-cv-section", {
        body: {
          roleId: exp.id,
          jobTitle: exp.role ?? "",
          company: exp.company ?? "",
          currentBullets: exp.bullets.map((b) => b.rewrite).filter(Boolean),
          originalBullets: exp.bullets.map((b) => b.original).filter(Boolean),
          intentForm: state.intentForm,
          action,
        },
      });
      if (error) throw new Error(error.message);
      if (data?.error) {
        setAiError({ msg: "AI is busy right now — try again in a moment.", details: data.details ?? data.error });
      } else if (Array.isArray(data?.bullets) && data.bullets.length > 0) {
        replaceBullets(exp.id, data.bullets);
      } else {
        setAiError({ msg: "AI returned no bullets." });
      }
    } catch (e) {
      setAiError({ msg: "AI is busy right now — try again in a moment.", details: (e as Error).message });
    } finally {
      setBusy(null);
    }
  };

  return (
    <article data-exp-id={exp.id} className="rounded-md border border-ink/10 bg-paper p-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Job title" value={exp.role} onChange={(v) => patchExperience(exp.id, { role: v })} />
        <Field label="Company" value={exp.company} onChange={(v) => patchExperience(exp.id, { company: v })} />
        <div data-field="startDate">
          <Field
            label="From"
            placeholder="MMM YYYY"
            value={exp.startDate ?? ""}
            onChange={(v) => patchExperience(exp.id, { startDate: v })}
          />
        </div>
        <div data-field="endDate">
          <Field
            label="To"
            placeholder="MMM YYYY or Present"
            value={exp.endDate ?? ""}
            onChange={(v) => patchExperience(exp.id, { endDate: v })}
          />
        </div>
        <Field
          label="Location"
          value={exp.location ?? ""}
          onChange={(v) => patchExperience(exp.id, { location: v })}
        />
      </div>

      {/* Originals drawer */}
      {originals.length > 0 && (
        <div className="mt-5">
          <button
            type="button"
            onClick={() => setOriginalsOpen((o) => !o)}
            className="inline-flex items-center gap-1.5 font-dm text-[11px] uppercase tracking-wider2 text-ink/55 hover:text-ink"
          >
            <ChevronRight
              size={12}
              className={cn("transition-transform", originalsOpen && "rotate-90")}
            />
            Original bullets from your CV
          </button>
          {originalsOpen && (
            <ul className="mt-2 space-y-1.5 border-l-2 border-ink/10 pl-3">
              {originals.map((o, i) => (
                <li key={i} className="font-dm text-xs text-ink/55">
                  {o}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Bullets section */}
      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between">
          <p className="font-dm text-[11px] uppercase tracking-wider2 text-ink/55">Bullets</p>
          <label className="inline-flex cursor-pointer items-center gap-2 font-dm text-[11px] text-ink/55 hover:text-ink">
            <input
              type="checkbox"
              checked={showChanges}
              onChange={(e) => setShowChanges(e.target.checked)}
              className="h-3 w-3 accent-sienna"
            />
            Show changes
          </label>
        </div>
        <ul className="space-y-2">
          {exp.bullets.map((b) => (
            <BulletRow
              key={b.id}
              bullet={b}
              experienceId={exp.id}
              showChanges={showChanges}
              onChange={(v) => updateBullet(exp.id, b.id, { rewrite: v, status: "edited" })}
              onDelete={() => removeBullet(exp.id, b.id)}
            />
          ))}
        </ul>
        <button
          type="button"
          onClick={() => addBullet(exp.id)}
          className="mt-3 inline-flex items-center gap-1.5 font-dm text-sm text-sienna hover:underline"
        >
          <Plus size={13} /> Add bullet
        </button>

        {/* Role-level AI actions */}
        <div className="mt-4 border-t border-ink/10 pt-3">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-dm text-xs">
            <AiActionBtn label="Condense" busy={busy === "condense"} disabled={!!busy} onClick={() => runAction("condense")} />
            <span className="text-ink/25">·</span>
            <AiActionBtn label="Expand" busy={busy === "expand"} disabled={!!busy} onClick={() => runAction("expand")} />
            <span className="text-ink/25">·</span>
            <AiActionBtn label="Tailor to role" busy={busy === "tailor"} disabled={!!busy} onClick={() => runAction("tailor")} />
            {busy && (
              <span className="ml-2 inline-flex items-center gap-1.5 text-ink/55">
                <Loader2 size={12} className="animate-spin" /> Rewriting bullets…
              </span>
            )}
          </div>
          {aiError && (
            <p
              className="mt-2 font-dm text-[11px] text-amber-700"
              title={aiError.details}
            >
              {aiError.msg}
            </p>
          )}
        </div>
      </div>

      <div className="mt-5 flex justify-end border-t border-ink/10 pt-3">
        {confirming ? (
          <div className="flex items-center gap-2">
            <span className="font-dm text-xs text-ink/65">Remove this role?</span>
            <button
              type="button"
              onClick={() => removeExperience(exp.id)}
              className="rounded border border-amber-700 px-2 py-1 font-dm text-[11px] text-amber-800 hover:bg-amber-50"
            >
              Yes, remove
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="font-dm text-[11px] text-ink/55"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="inline-flex items-center gap-1.5 font-dm text-xs text-ink/55 hover:text-ink"
          >
            <Trash2 size={12} /> Remove role
          </button>
        )}
      </div>
    </article>
  );
}

function AiActionBtn({
  label,
  busy,
  disabled,
  onClick,
}: {
  label: string;
  busy: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "font-dm text-xs text-ink/55 underline-offset-4 hover:text-sienna hover:underline disabled:opacity-40 disabled:hover:no-underline",
        busy && "text-sienna",
      )}
    >
      {label}
    </button>
  );
}

function BulletRow({
  bullet,
  showChanges,
  onChange,
  onDelete,
}: {
  bullet: CVBullet;
  experienceId: string;
  showChanges: boolean;
  onChange: (v: string) => void;
  onDelete: () => void;
}) {
  let tag: { label: string; cls: string } | null = null;
  if (bullet.original && bullet.original !== bullet.rewrite) {
    tag = { label: "Rewritten", cls: "bg-clay/40 text-ink/65" };
  } else if (!bullet.original) {
    tag = { label: "Added", cls: "bg-sienna/15 text-sienna" };
  } else {
    tag = { label: "Unchanged", cls: "bg-ink/5 text-ink/45" };
  }

  return (
    <li data-bullet-id={bullet.id} className="group flex items-start gap-2">
      <div className="flex-1">
        <AutoTextarea
          value={bullet.rewrite}
          onChange={onChange}
          placeholder="Write a bullet…"
          className="min-h-12"
        />
        {showChanges && tag && (
          <span
            className={cn(
              "mt-1 inline-block rounded-full px-2 py-0.5 font-dm text-[10px]",
              tag.cls,
            )}
          >
            {tag.label}
          </span>
        )}
      </div>
      <button
        type="button"
        onClick={onDelete}
        aria-label="Delete bullet"
        className="mt-2 rounded p-1 text-ink/30 opacity-60 transition hover:bg-amber-50 hover:text-amber-700 group-hover:opacity-100"
      >
        <Trash2 size={14} />
      </button>
    </li>
  );
}


/* ---------------- Case toggle button ---------------- */

const CASE_LABEL: Record<CaseMode, string> = {
  title: "Title Case",
  upper: "UPPER CASE",
  lower: "lower case",
};

function CaseToggleButton({ onApply }: { onApply: (mode: CaseMode) => void }) {
  const [mode, setMode] = useState<CaseMode>("title");
  const handleClick = () => {
    onApply(mode);
    setMode((m) => nextCase(m));
  };
  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex items-center gap-1.5 rounded border border-ink/15 px-2 py-1 font-dm text-[11px] text-ink/65 hover:border-ink/30"
      title={`Apply ${CASE_LABEL[mode]} (click to cycle)`}
      aria-label={`Apply ${CASE_LABEL[mode]}`}
    >
      <CaseSensitive size={14} />
      Aa
    </button>
  );
}

export function ContactCaseToggle() {
  const { state, patchContact } = useCVBuilder();
  const contact = state.generatedCV?.contact;
  if (!contact) return null;
  return (
    <CaseToggleButton
      onApply={(mode) =>
        patchContact({
          name: applyCase(contact.name || "", mode),
          jobTitle: applyCase(contact.jobTitle || "", mode),
        })
      }
    />
  );
}

export function SkillsCaseToggle() {
  const { state, setSkills } = useCVBuilder();
  const skills = state.generatedCV?.skills;
  if (!skills?.length) return null;
  return (
    <CaseToggleButton
      onApply={(mode) => setSkills(skills.map((s) => applyCase(s, mode)))}
    />
  );
}

/* ---------------- Skills ---------------- */

export function SkillsBlock({ skills }: { skills: string[] }) {
  const { setSkills } = useCVBuilder();
  return <PillInput values={skills} onChange={setSkills} placeholder="Add a skill and press Enter" />;
}


/* ---------------- Education ---------------- */

export function EducationBlock({ education }: { education: CVEducation[] }) {
  const { addEducation, removeEducation, patchEducation } = useCVBuilder();
  return (
    <div className="space-y-3">
      {education.map((ed) => (
        <div key={ed.id} className="rounded-md border border-ink/10 bg-paper p-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <Field
              label="Qualification"
              value={ed.qualification}
              onChange={(v) => patchEducation(ed.id, { qualification: v })}
            />
            <Field
              label="Institution"
              value={ed.institution}
              onChange={(v) => patchEducation(ed.id, { institution: v })}
            />
            <Field
              label="Year"
              value={ed.period}
              onChange={(v) => patchEducation(ed.id, { period: v })}
            />
          </div>
          <button
            type="button"
            onClick={() => removeEducation(ed.id)}
            className="mt-3 inline-flex items-center gap-1.5 font-dm text-xs text-ink/55 hover:text-ink"
          >
            <Trash2 size={12} /> Remove
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addEducation}
        className="inline-flex items-center gap-2 rounded border border-dashed border-ink/25 px-3 py-2 font-dm text-sm text-ink/70 hover:border-sienna hover:text-sienna"
      >
        <Plus size={14} /> Add education
      </button>
    </div>
  );
}

/* ---------------- Competency clusters ---------------- */

export function ClustersBlock({ clusters }: { clusters: CompetencyCluster[] }) {
  const { addCluster, removeCluster, patchCluster } = useCVBuilder();
  return (
    <div className="space-y-3">
      {clusters.map((cl) => (
        <div key={cl.id} className="rounded-md border border-ink/10 bg-paper p-4">
          <Field
            label="Cluster title"
            value={cl.title}
            onChange={(v) => patchCluster(cl.id, { title: v })}
          />
          <div className="mt-3">
            <PillInput
              values={cl.items}
              onChange={(items) => patchCluster(cl.id, { items })}
              placeholder="Add a competency and press Enter"
            />
          </div>
          <button
            type="button"
            onClick={() => removeCluster(cl.id)}
            className="mt-3 inline-flex items-center gap-1.5 font-dm text-xs text-ink/55 hover:text-ink"
          >
            <Trash2 size={12} /> Remove cluster
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addCluster}
        className="inline-flex items-center gap-2 rounded border border-dashed border-ink/25 px-3 py-2 font-dm text-sm text-ink/70 hover:border-sienna hover:text-sienna"
      >
        <Plus size={14} /> Add cluster
      </button>
    </div>
  );
}

/* ---------------- Languages ---------------- */

export function LanguagesBlock({ languages }: { languages: LanguageEntry[] }) {
  const { setLanguages } = useCVBuilder();
  const [name, setName] = useState("");

  const add = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setLanguages([
      ...languages,
      {
        id: `lang-${Math.random().toString(36).slice(2, 9)}`,
        name: trimmed,
        level: "Professional",
      },
    ]);
    setName("");
  };

  return (
    <div className="rounded-md border border-ink/10 bg-paper p-4">
      <div className="flex flex-wrap gap-2">
        {languages.map((lang) => (
          <div
            key={lang.id}
            className="inline-flex items-center gap-2 rounded-full border border-ink/15 bg-clay/30 py-1 pl-3 pr-1 font-dm text-sm text-ink"
          >
            <span>{lang.name}</span>
            <select
              value={lang.level}
              onChange={(e) =>
                setLanguages(
                  languages.map((l) =>
                    l.id === lang.id
                      ? { ...l, level: e.target.value as LanguageEntry["level"] }
                      : l,
                  ),
                )
              }
              className="rounded border-none bg-transparent font-dm text-xs text-ink/70 focus:outline-none"
            >
              {LANG_LEVELS.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setLanguages(languages.filter((l) => l.id !== lang.id))}
              className="rounded-full p-1 text-ink/45 hover:bg-ink/10 hover:text-ink"
              aria-label={`Remove ${lang.name}`}
            >
              <X size={12} />
            </button>
          </div>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder="Language name"
          className="flex-1 rounded border border-ink/15 bg-paper px-3 py-1.5 font-dm text-sm focus:border-sienna focus:outline-none"
        />
        <button
          type="button"
          onClick={add}
          className="rounded bg-sienna px-3 py-1.5 font-dm text-sm text-paper hover:opacity-90"
        >
          Add
        </button>
      </div>
    </div>
  );
}

/* ---------------- Pill input ---------------- */

function PillInput({
  values,
  onChange,
  placeholder,
}: {
  values: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const t = draft.trim();
    if (!t || values.includes(t)) {
      setDraft("");
      return;
    }
    onChange([...values, t]);
    setDraft("");
  };
  return (
    <div className="rounded-md border border-ink/15 bg-paper p-3">
      <div className="flex flex-wrap gap-2">
        {values.map((v) => (
          <span
            key={v}
            className="inline-flex items-center gap-1 rounded-full border border-ink/15 bg-clay/30 py-1 pl-3 pr-1 font-dm text-sm text-ink"
          >
            {v}
            <button
              type="button"
              onClick={() => onChange(values.filter((x) => x !== v))}
              className="rounded-full p-1 text-ink/45 hover:bg-ink/10 hover:text-ink"
              aria-label={`Remove ${v}`}
            >
              <X size={11} />
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              add();
            } else if (e.key === "Backspace" && !draft && values.length) {
              onChange(values.slice(0, -1));
            }
          }}
          onBlur={add}
          placeholder={placeholder}
          className="min-w-32 flex-1 bg-transparent px-1 py-1 font-dm text-sm text-ink placeholder:text-ink/40 focus:outline-none"
        />
      </div>
    </div>
  );
}

/* ---------------- Primitives ---------------- */

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState(value);
  const focusedRef = useRef(false);
  useEffect(() => {
    if (!focusedRef.current) setDraft(value);
  }, [value]);
  const commit = () => {
    if (draft !== value) onChange(draft);
  };
  return (
    <label className="block">
      <span className="block font-dm text-[11px] uppercase tracking-wider2 text-ink/55">
        {label}
      </span>
      <input
        type={type}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onFocus={() => { focusedRef.current = true; }}
        onBlur={() => { focusedRef.current = false; commit(); }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && type !== "textarea") {
            e.preventDefault();
            commit();
            (e.currentTarget as HTMLInputElement).blur();
          }
        }}
        placeholder={placeholder}
        className="mt-1 w-full rounded border border-ink/15 bg-paper px-3 py-2 font-dm text-sm text-ink focus:border-sienna focus:outline-none"
      />
    </label>
  );
}

function AutoTextarea({
  value,
  onChange,
  placeholder,
  className,
  autoFocus,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [draft, setDraft] = useState(value);
  const focusedRef = useRef(false);
  useEffect(() => {
    if (!focusedRef.current) setDraft(value);
  }, [value]);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [draft]);
  return (
    <textarea
      ref={ref}
      value={draft}
      autoFocus={autoFocus}
      onChange={(e) => setDraft(e.target.value)}
      onFocus={() => { focusedRef.current = true; }}
      onBlur={() => {
        focusedRef.current = false;
        if (draft !== value) onChange(draft);
      }}
      placeholder={placeholder}
      className={cn(
        "w-full resize-none rounded border border-ink/15 bg-paper p-3 font-dm text-sm text-ink placeholder:text-ink/40 focus:border-sienna focus:outline-none",
        className,
      )}
    />
  );
}


/* ---------------- ATS panel + saved indicator ---------------- */

function AtsPanel() {
  const { state, setAts } = useCVBuilder();
  const score = state.atsScore;
  const [rescoring, setRescoring] = useState(false);

  const rescore = async () => {
    setRescoring(true);
    const providers: Array<"gemini" | "lovable" | "nvidia"> = ["gemini", "lovable", "nvidia"];
    for (const p of providers) {
      const { data } = await supabase.functions.invoke("calculate-ats-score", {
        body: {
          generatedCV: state.generatedCV,
          intentForm: state.intentForm,
          targetRole: state.intentForm.targetRoles.join(", "),
          provider: p,
        },
      });
      if (data?.atsScore) { setAts(data.atsScore); break; }
    }
    setRescoring(false);
  };

  const r = 36;
  const c = 2 * Math.PI * r;
  const dash = score ? c - (score.overall / 100) * c : c;

  return (
    <div className="rounded-md border border-ink/10 bg-paper p-5">
      <div className="flex items-center justify-between">
        <p className="font-dm text-xs uppercase tracking-wider2 text-ink/55">ATS Score</p>
        <button
          type="button"
          onClick={rescore}
          disabled={rescoring}
          className="inline-flex items-center gap-1 rounded border border-ink/15 px-2 py-1 font-dm text-[11px] text-ink/70 hover:border-sienna hover:text-sienna disabled:opacity-50"
        >
          <RefreshCw size={11} className={cn(rescoring && "animate-spin")} /> Rescore
        </button>
      </div>

      <div className="my-4 flex items-center justify-center">
        <svg width="100" height="100" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={r} className="fill-none stroke-ink/10" strokeWidth="8" />
          <circle
            cx="50"
            cy="50"
            r={r}
            className="fill-none stroke-sienna"
            strokeWidth="8"
            strokeDasharray={c}
            strokeDashoffset={dash}
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
          />
          <text
            x="50"
            y="55"
            textAnchor="middle"
            className="fill-ink font-syne"
            fontSize="22"
          >
            {score?.overall ?? "—"}
          </text>
        </svg>
      </div>

      {score && (
        <>
          <div className="space-y-2">
            <ScoreRow label="Keyword match" value={`${score.keywordMatch}%`} />
            <ScoreRow label="Readability" value={`${score.readability}%`} />
          </div>
          <ul className="mt-4 space-y-1.5 border-t border-ink/10 pt-3">
            {score.formatting.map((f) => (
              <li
                key={f.label}
                className="flex items-center gap-2 font-dm text-xs text-ink/70"
              >
                <span
                  className={cn(
                    "flex h-4 w-4 items-center justify-center rounded-full",
                    f.pass ? "bg-olive/15 text-olive" : "bg-amber-100 text-amber-700",
                  )}
                >
                  {f.pass ? <Check size={10} /> : "!"}
                </span>
                {f.label}
              </li>
            ))}
          </ul>
        </>
      )}

      {state.lastScoredAt && (
        <p className="mt-4 font-dm text-[10px] uppercase tracking-wider2 text-ink/45">
          Scored {formatRelative(state.lastScoredAt)}
        </p>
      )}
    </div>
  );
}

function ScoreRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between font-dm text-sm">
      <span className="text-ink/65">{label}</span>
      <span className="text-ink">{value}</span>
    </div>
  );
}

export function SavedIndicator() {
  const { state } = useCVBuilder();
  const [, force] = useState(0);
  useEffect(() => {
    const i = setInterval(() => force((n) => n + 1), 15000);
    return () => clearInterval(i);
  }, []);
  if (!state.lastSavedAt) return null;
  return (
    <p className="mt-3 text-center font-dm text-[11px] text-ink/45">
      ✓ Saved {formatRelative(state.lastSavedAt)}
    </p>
  );
}

function formatRelative(ts: number) {
  const diff = Math.round((Date.now() - ts) / 1000);
  if (diff < 5) return "just now";
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.round(diff / 60)}m ago`;
  return `${Math.round(diff / 3600)}h ago`;
}

/* ---------------- Achievements ---------------- */

export function AchievementsBlock({ achievements }: { achievements: string[] }) {
  const { setAchievements } = useCVBuilder();
  const update = (i: number, v: string) =>
    setAchievements(achievements.map((a, idx) => (idx === i ? v : a)));
  const remove = (i: number) =>
    setAchievements(achievements.filter((_, idx) => idx !== i));
  const add = () => setAchievements([...achievements, ""]);
  return (
    <div className="space-y-2">
      {achievements.map((a, i) => (
        <div key={i} className="flex items-start gap-2">
          <AutoTextarea
            value={a}
            onChange={(v) => update(i, v)}
            placeholder="e.g. Grew ARR from $2M to $8M in 18 months"
            className="min-h-12 flex-1"
          />
          <button
            type="button"
            onClick={() => remove(i)}
            className="mt-2 rounded p-1 text-ink/30 hover:bg-amber-50 hover:text-amber-700"
            aria-label="Remove achievement"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="inline-flex items-center gap-2 rounded border border-dashed border-ink/25 px-3 py-2 font-dm text-sm text-ink/70 hover:border-sienna hover:text-sienna"
      >
        <Plus size={14} /> Add achievement
      </button>
    </div>
  );
}

/* ---------------- Certifications ---------------- */

export function CertificationsBlock({ certifications }: { certifications: Certification[] }) {
  const { addCertification, removeCertification, patchCertification } = useCVBuilder();
  return (
    <div className="space-y-3">
      {certifications.map((c) => (
        <div key={c.id} className="rounded-md border border-ink/10 bg-paper p-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Name" value={c.name} onChange={(v) => patchCertification(c.id, { name: v })} />
            <Field label="Issuer" value={c.issuer} onChange={(v) => patchCertification(c.id, { issuer: v })} />
            <Field label="Date" value={c.date} onChange={(v) => patchCertification(c.id, { date: v })} />
          </div>
          <button
            type="button"
            onClick={() => removeCertification(c.id)}
            className="mt-3 inline-flex items-center gap-1.5 font-dm text-xs text-ink/55 hover:text-ink"
          >
            <Trash2 size={12} /> Remove
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addCertification}
        className="inline-flex items-center gap-2 rounded border border-dashed border-ink/25 px-3 py-2 font-dm text-sm text-ink/70 hover:border-sienna hover:text-sienna"
      >
        <Plus size={14} /> Add certification
      </button>
    </div>
  );
}

/* ---------------- Custom sections ---------------- */

export function CustomSectionsBlock({ sections }: { sections: CustomSection[] }) {
  const { addCustomSection, removeCustomSection, patchCustomSection } = useCVBuilder();
  return (
    <div className="space-y-4">
      <p className="font-dm text-xs text-ink/55">
        Add a custom section with a title and bullet points. You can choose whether it appears in the CV body
        or the sidebar (sidebar applies only to templates with a side column).
      </p>
      {sections.map((s) => (
        <div key={s.id} className="rounded-md border border-ink/10 bg-paper p-4 space-y-3">
          <Field
            label="Section title"
            value={s.title}
            onChange={(v) => patchCustomSection(s.id, { title: v })}
          />
          <div>
            <span className="block font-dm text-[11px] uppercase tracking-wider2 text-ink/55 mb-1">
              Placement
            </span>
            <div className="inline-flex rounded border border-ink/15 overflow-hidden">
              {(["body", "sidebar"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => patchCustomSection(s.id, { placement: p })}
                  className={cn(
                    "px-3 py-1.5 font-dm text-xs capitalize",
                    s.placement === p
                      ? "bg-ink text-paper"
                      : "bg-paper text-ink/65 hover:bg-ink/5",
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div>
            <span className="block font-dm text-[11px] uppercase tracking-wider2 text-ink/55 mb-1">
              Bullets
            </span>
            <PillInputForBullets
              values={s.bullets}
              onChange={(bullets) => patchCustomSection(s.id, { bullets })}
            />
          </div>
          <button
            type="button"
            onClick={() => removeCustomSection(s.id)}
            className="inline-flex items-center gap-1.5 font-dm text-xs text-ink/55 hover:text-ink"
          >
            <Trash2 size={12} /> Remove section
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addCustomSection}
        className="inline-flex items-center gap-2 rounded border border-dashed border-ink/25 px-3 py-2 font-dm text-sm text-ink/70 hover:border-sienna hover:text-sienna"
      >
        <Plus size={14} /> Add custom section
      </button>
    </div>
  );
}

function PillInputForBullets({
  values,
  onChange,
}: {
  values: string[];
  onChange: (v: string[]) => void;
}) {
  const update = (i: number, v: string) =>
    onChange(values.map((b, idx) => (idx === i ? v : b)));
  const remove = (i: number) => onChange(values.filter((_, idx) => idx !== i));
  return (
    <div className="space-y-2">
      {values.map((v, i) => (
        <div key={i} className="flex items-start gap-2">
          <AutoTextarea
            value={v}
            onChange={(nv) => update(i, nv)}
            placeholder="Write a bullet…"
            className="min-h-10 flex-1"
          />
          <button
            type="button"
            onClick={() => remove(i)}
            className="mt-2 rounded p-1 text-ink/30 hover:bg-amber-50 hover:text-amber-700"
            aria-label="Remove bullet"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...values, ""])}
        className="inline-flex items-center gap-1.5 font-dm text-sm text-sienna hover:underline"
      >
        <Plus size={13} /> Add bullet
      </button>
    </div>
  );
}

