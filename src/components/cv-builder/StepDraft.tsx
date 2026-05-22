import { useEffect, useRef, useState, ChangeEvent, KeyboardEvent } from "react";
import {
  Check,
  RotateCcw,
  Pencil,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Camera,
  RefreshCw,
  X,
} from "lucide-react";
import {
  useCVBuilder,
  type CVBullet,
  type CVExperience,
  type CVEducation,
  type CompetencyCluster,
  type ContactInfo,
  type LanguageEntry,
  type SectionKey,
} from "@/contexts/CVBuilderContext";
import { supabase } from "@/integrations/supabase/client";
import { StepFooter, StepHeader } from "./WizardShell";
import { cn } from "@/lib/utils";
import CVRenderer from "./templates/CVRenderer";
import { ScaledPreview } from "./templates/shared";

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

  useEffect(() => {
    if (state.generatedCV) return;
    let active = true;
    (async () => {
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
          },
        });
        if (fnError) throw fnError;
        if (active && data?.generatedCV) {
          setGeneratedCV(data.generatedCV);
          const ats = await supabase.functions.invoke("calculate-ats-score", {
            body: {
              generatedCV: data.generatedCV,
              targetRole: state.intentForm.targetRoles.join(", "),
            },
          });
          if (ats.data?.atsScore) setAts(ats.data.atsScore);
        }
      } catch (err) {
        console.error("CV generation failed", err);
        if (active) setError("We couldn't generate the CV automatically right now. Please go back and try again in a moment.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading || !state.generatedCV) {
    return (
      <>
        <StepHeader
          eyebrow="Step 6 · Draft"
          title="Rewriting your CV"
          subtitle="Pulling your answers into a clean draft. This usually takes 20–30 seconds."
        />
        {error ? (
          <div className="rounded-md border border-sienna/30 bg-clay/30 p-6 font-dm text-sm text-ink/70">
            {error}
          </div>
        ) : (
          <div className="grid gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded bg-clay/40" />
            ))}
          </div>
        )}
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

          <SectionShell sectionKey="skills" title="Skills">
            <SkillsBlock skills={cv.skills} />
          </SectionShell>

          <SectionShell sectionKey="education" title="Education & certifications">
            <EducationBlock education={cv.education} />
          </SectionShell>

          {showCompetencies && (
            <SectionShell sectionKey="competencies" title="Competency clusters">
              <ClustersBlock clusters={cv.competencyClusters} />
            </SectionShell>
          )}

          <SectionShell sectionKey="languages" title="Languages">
            <LanguagesBlock languages={cv.languages} />
          </SectionShell>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-32 lg:self-start">
          <LivePreview />
          <AtsPanel />
          <SavedIndicator />
        </aside>
      </div>

      <StepFooter onBack={() => setStep(5)} onNext={() => setStep(7)} nextLabel="Export" />
    </>
  );
}

/* ---------------- Section shell with hide toggle ---------------- */

function SectionShell({
  sectionKey,
  title,
  children,
}: {
  sectionKey: SectionKey;
  title: string;
  children: React.ReactNode;
}) {
  const { state, toggleSection } = useCVBuilder();
  const hidden = state.generatedCV?.hiddenSections.includes(sectionKey);
  return (
    <section className={cn("rounded-md", hidden && "opacity-50")}>
      <header className="mb-4 flex items-center justify-between">
        <h2 className="font-syne text-xl text-ink">{title}</h2>
        <button
          type="button"
          onClick={() => toggleSection(sectionKey)}
          className="inline-flex items-center gap-1.5 rounded border border-ink/15 px-2 py-1 font-dm text-[11px] text-ink/65 hover:border-ink/30"
          title={hidden ? "Show section in export" : "Hide section from export"}
        >
          {hidden ? <EyeOff size={12} /> : <Eye size={12} />}
          {hidden ? "Hidden" : "Visible"}
        </button>
      </header>
      {children}
    </section>
  );
}

/* ---------------- Contact ---------------- */

function ContactBlock({ contact }: { contact: ContactInfo }) {
  const { patchContact, state, setPhotoPath } = useCVBuilder();
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [err, setErr] = useState("");
  const [uploading, setUploading] = useState(false);

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

  const handlePhoto = async (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    setErr("");
    if (!["image/jpeg", "image/png"].includes(f.type)) {
      setErr("Please upload a JPG or PNG.");
      return;
    }
    if (f.size > 2 * 1024 * 1024) {
      setErr("Keep the photo under 2MB.");
      return;
    }
    setUploading(true);
    const path = `${state.sessionId}/photo-${Date.now()}-${f.name}`;
    const { error } = await supabase.storage
      .from("cv-builder-uploads")
      .upload(path, f, { upsert: true });
    setUploading(false);
    if (error) {
      setErr("Upload failed. Try again.");
      return;
    }
    setPhotoPath(path);
  };

  const photoNode = photoUrl ? (
    <div className="shrink-0">
      <div className="relative h-24 w-24 overflow-hidden rounded-full border border-ink/10">
        <img src={photoUrl} alt="" className="h-full w-full object-cover" />
      </div>
      <div className="mt-2 flex flex-col items-center gap-1">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="font-dm text-[10px] text-ink/55 hover:text-ink"
        >
          Replace
        </button>
        <button
          type="button"
          onClick={() => setPhotoPath(null)}
          className="font-dm text-[10px] text-ink/55 hover:text-amber-700"
        >
          Remove
        </button>
      </div>
    </div>
  ) : (
    <div className="shrink-0">
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="group relative flex h-24 w-24 items-center justify-center rounded-full border border-dashed border-ink/25 bg-clay/30 hover:border-sienna"
      >
        {uploading ? (
          <span className="font-dm text-[10px] text-ink/65">Uploading…</span>
        ) : (
          <div className="flex flex-col items-center text-ink/55 group-hover:text-sienna">
            <Camera size={16} />
            <span className="mt-1 px-2 text-center font-dm text-[9px] leading-tight">
              Add photo
            </span>
          </div>
        )}
      </button>
    </div>
  );

  return (
    <div className="rounded-md border border-ink/10 bg-paper p-5">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        {photoNode}
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png"
          className="sr-only"
          onChange={handlePhoto}
        />

        <div className="grid flex-1 gap-3 sm:grid-cols-2">
          <Field label="Full name" value={contact.name} onChange={(v) => patchContact({ name: v })} />
          <Field
            label="Job title"
            value={contact.jobTitle}
            onChange={(v) => patchContact({ jobTitle: v })}
          />
          <Field
            label="Email"
            type="email"
            value={contact.email}
            onChange={(v) => patchContact({ email: v })}
          />
          <Field label="Phone" value={contact.phone} onChange={(v) => patchContact({ phone: v })} />
          <Field
            label="Location"
            value={contact.location}
            onChange={(v) => patchContact({ location: v })}
          />
          <Field
            label="LinkedIn URL"
            value={contact.linkedinUrl}
            onChange={(v) => patchContact({ linkedinUrl: v })}
          />
        </div>
      </div>
      {err && (
        <p className="mt-3 rounded border-l-2 border-amber-500 bg-amber-50 px-3 py-2 font-dm text-xs text-amber-900">
          {err}
        </p>
      )}
    </div>
  );
}

/* ---------------- Live preview pane ---------------- */

function LivePreview() {
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

  return (
    <div className="rounded-md border border-ink/10 bg-paper p-3">
      <p className="mb-2 font-dm text-[11px] uppercase tracking-wider2 text-ink/55">
        Live preview · {state.selectedTemplate}
      </p>
      <ScaledPreview scale={0.36} className="h-[420px] rounded">
        <CVRenderer
          cv={state.generatedCV}
          template={state.selectedTemplate}
          photoUrl={photoUrl}
        />
      </ScaledPreview>
    </div>
  );
}

/* ---------------- Summary ---------------- */

function SummaryBlock({ summary }: { summary: string }) {
  const { patchSummary } = useCVBuilder();
  return (
    <AutoTextarea
      value={summary}
      onChange={patchSummary}
      placeholder="A short paragraph that frames your value to the roles you're targeting."
      className="min-h-32"
    />
  );
}

/* ---------------- Experience ---------------- */

function ExperienceList({ experience }: { experience: CVExperience[] }) {
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
  const { patchExperience, removeExperience, addBullet } = useCVBuilder();
  const [confirming, setConfirming] = useState(false);

  return (
    <article className="rounded-md border border-ink/10 bg-paper p-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field
          label="Job title"
          value={exp.role}
          onChange={(v) => patchExperience(exp.id, { role: v })}
        />
        <Field
          label="Company"
          value={exp.company}
          onChange={(v) => patchExperience(exp.id, { company: v })}
        />
        <Field
          label="From"
          placeholder="MMM YYYY"
          value={exp.startDate ?? ""}
          onChange={(v) => patchExperience(exp.id, { startDate: v })}
        />
        <Field
          label="To"
          placeholder="MMM YYYY or Present"
          value={exp.endDate ?? ""}
          onChange={(v) => patchExperience(exp.id, { endDate: v })}
        />
        <Field
          label="Location"
          value={exp.location ?? ""}
          onChange={(v) => patchExperience(exp.id, { location: v })}
        />
      </div>

      <div className="mt-5">
        <p className="mb-2 font-dm text-[11px] uppercase tracking-wider2 text-ink/55">
          Bullets
        </p>
        <ul className="space-y-3">
          {exp.bullets.map((b) => (
            <BulletEditor key={b.id} bullet={b} experienceId={exp.id} />
          ))}
        </ul>
        <button
          type="button"
          onClick={() => addBullet(exp.id)}
          className="mt-3 inline-flex items-center gap-1.5 font-dm text-sm text-sienna hover:underline"
        >
          <Plus size={13} /> Add bullet
        </button>
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

function BulletEditor({
  bullet,
  experienceId,
}: {
  bullet: CVBullet;
  experienceId: string;
}) {
  const { updateBullet, removeBullet } = useCVBuilder();
  const [editing, setEditing] = useState(false);
  const reverted = bullet.status === "reverted";

  return (
    <li className="rounded-md border border-ink/10 bg-clay/20 p-3">
      {bullet.original && (
        <p className="font-dm text-xs text-ink/45 line-through">{bullet.original}</p>
      )}
      {editing ? (
        <AutoTextarea
          value={bullet.rewrite}
          onChange={(v) => updateBullet(experienceId, bullet.id, { rewrite: v, status: "edited" })}
          className="mt-2 min-h-16"
          autoFocus
        />
      ) : (
        <p
          className={cn(
            "mt-2 font-dm text-sm text-ink",
            reverted && "line-through opacity-40",
          )}
        >
          {bullet.rewrite || <span className="italic text-ink/40">Empty bullet</span>}
        </p>
      )}
      {bullet.explanation && (
        <p className="mt-2 font-serif text-xs italic text-ink/55">{bullet.explanation}</p>
      )}
      <div className="mt-3 flex flex-wrap gap-1.5">
        <ActionBtn
          icon={<Check size={12} />}
          label="Accept"
          active={bullet.status === "accepted" && !editing}
          onClick={() => {
            setEditing(false);
            updateBullet(experienceId, bullet.id, { status: "accepted" });
          }}
        />
        <ActionBtn
          icon={<Pencil size={12} />}
          label="Edit"
          active={editing}
          onClick={() => setEditing((e) => !e)}
        />
        <ActionBtn
          icon={<RotateCcw size={12} />}
          label="Revert"
          active={reverted}
          onClick={() => updateBullet(experienceId, bullet.id, { status: "reverted" })}
        />
        <button
          type="button"
          onClick={() => removeBullet(experienceId, bullet.id)}
          className="ml-auto inline-flex items-center gap-1 rounded border border-ink/15 px-2 py-1 font-dm text-[11px] text-ink/55 hover:border-amber-500 hover:text-amber-700"
        >
          <Trash2 size={11} /> Delete
        </button>
      </div>
    </li>
  );
}

/* ---------------- Skills ---------------- */

function SkillsBlock({ skills }: { skills: string[] }) {
  const { setSkills } = useCVBuilder();
  return <PillInput values={skills} onChange={setSkills} placeholder="Add a skill and press Enter" />;
}

/* ---------------- Education ---------------- */

function EducationBlock({ education }: { education: CVEducation[] }) {
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

function ClustersBlock({ clusters }: { clusters: CompetencyCluster[] }) {
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

function LanguagesBlock({ languages }: { languages: LanguageEntry[] }) {
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
  return (
    <label className="block">
      <span className="block font-dm text-[11px] uppercase tracking-wider2 text-ink/55">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
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
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);
  return (
    <textarea
      ref={ref}
      value={value}
      autoFocus={autoFocus}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={cn(
        "w-full resize-none rounded border border-ink/15 bg-paper p-3 font-dm text-sm text-ink placeholder:text-ink/40 focus:border-sienna focus:outline-none",
        className,
      )}
    />
  );
}

function ActionBtn({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 rounded border px-2 py-1 font-dm text-[11px]",
        active
          ? "border-sienna bg-sienna/10 text-sienna"
          : "border-ink/15 text-ink/65 hover:border-ink/30",
      )}
    >
      {icon} {label}
    </button>
  );
}

/* ---------------- ATS panel + saved indicator ---------------- */

function AtsPanel() {
  const { state, setAts } = useCVBuilder();
  const score = state.atsScore;
  const [rescoring, setRescoring] = useState(false);

  const rescore = async () => {
    setRescoring(true);
    const { data } = await supabase.functions.invoke("calculate-ats-score", {
      body: {
        generatedCV: state.generatedCV,
        targetRole: state.intentForm.targetRoles.join(", "),
      },
    });
    if (data?.atsScore) setAts(data.atsScore);
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

function SavedIndicator() {
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
