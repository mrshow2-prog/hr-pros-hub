import { Check, ShieldCheck, Sparkles, Circle, Square, Ban } from "lucide-react";
import { useCVBuilder, type TemplateId } from "@/contexts/CVBuilderContext";
import { StepFooter, StepHeader } from "./WizardShell";
import { cn } from "@/lib/utils";
import CVRenderer, { SAMPLE_CV } from "./templates/CVRenderer";
import { ScaledPreview } from "./templates/shared";
import { PALETTES, getPalette, type PaletteId } from "@/lib/cv/palettes";
import type { PhotoShape } from "@/contexts/CVBuilderContext";

const SAMPLE_PHOTO_URL =
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=faces";

interface TemplateMeta {
  id: TemplateId;
  name: string;
  badge: string;
  isNew?: boolean;
  description: string;
  features: string[];
  ats: number;
}

const TEMPLATES: TemplateMeta[] = [
  { id: "dubai", name: "Dubai", badge: "Most picked",
    description: "Clean contemporary design with accent bars and generous spacing. Best all-rounder.",
    features: ["Left accent bars", "Square photo", "Generous white space", "Strong sans-serif"], ats: 96 },
  { id: "london", name: "London", badge: "Recruiter favourite",
    description: "Traditional single-column with formal serif. Perfect for banking, law, public sector.",
    features: ["Single column", "Classic serif headings", "Circular photo", "Underlined sections"], ats: 97 },
  { id: "zurich", name: "Zurich", badge: "Executive",
    description: "Refined design with oversized name and featured summary. C-suite ready.",
    features: ["Display-sized name", "Quoted summary", "Premium serif", "Authoritative feel"], ats: 96 },
  { id: "singapore", name: "Singapore", badge: "Information-dense",
    description: "Two-column compact layout. Best for long careers or technical resumes.",
    features: ["Two-column", "Tighter spacing", "More per page", "Efficient layout"], ats: 94 },
  { id: "berlin", name: "Berlin", badge: "Career change",
    description: "Leads with skills and pill-style competency tags. Perfect for career changers.",
    features: ["Skills-first", "Pill tags", "Circular photo", "Modern, accessible"], ats: 95 },
  { id: "riyadh", name: "Riyadh", badge: "New · Bold", isNew: true,
    description: "Striking dark sidebar with photo and skills next to a clean main column.",
    features: ["Dark sidebar", "Photo rail", "High contrast", "ATS-friendly"], ats: 93 },
  { id: "geneva", name: "Geneva", badge: "New · Premium", isNew: true,
    description: "Editorial layout with serif headlines and a vertical career timeline.",
    features: ["Career timeline", "Serif headlines", "Numbered eyebrows", "Magazine spacing"], ats: 94 },
];

const PHOTO_SHAPES: { id: PhotoShape; label: string; Icon: typeof Circle }[] = [
  { id: "circle", label: "Circle", Icon: Circle },
  { id: "square", label: "Square", Icon: Square },
  { id: "none", label: "Hide photo", Icon: Ban },
];

export default function StepTemplate() {
  const { state, setTemplate, patchIntent, setStep } = useCVBuilder();
  const selected = state.selectedTemplate;
  const pageLimit = state.intentForm.pageLimit;
  const palette = getPalette(state.intentForm.colorPalette);
  const photoShape = state.intentForm.photoShape;
  const previewPhoto = photoShape === "none" ? null : SAMPLE_PHOTO_URL;

  return (
    <>
      <StepHeader
        eyebrow="Step 1 · Template"
        title="Pick a template, palette and look"
        subtitle="Seven ATS-friendly layouts. Choose a colour palette and how your photo should appear — everything updates live."
      />

      <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Palette */}
        <div className="flex flex-col gap-2">
          <span className="font-dm text-[11px] uppercase tracking-wider2 text-ink/55">Colour palette</span>
          <div className="flex flex-wrap gap-2">
            {PALETTES.map((p) => {
              const active = state.intentForm.colorPalette === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => patchIntent({ colorPalette: p.id as PaletteId })}
                  className={cn(
                    "flex items-center gap-2 rounded-full border px-3 py-1.5 font-dm text-xs transition-colors",
                    active ? "border-ink bg-ink/5 text-ink" : "border-ink/15 text-ink/70 hover:border-ink/30",
                  )}
                  title={p.name}
                >
                  <span className="h-4 w-4 rounded-full border border-ink/10" style={{ background: p.accentHex }} />
                  {p.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Photo shape */}
        <div className="flex flex-col gap-2">
          <span className="font-dm text-[11px] uppercase tracking-wider2 text-ink/55">Photo shape</span>
          <div className="inline-flex rounded-md border border-ink/15 bg-paper p-1 w-fit">
            {PHOTO_SHAPES.map(({ id, label, Icon }) => {
              const active = photoShape === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => patchIntent({ photoShape: id })}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded px-3 py-2 font-dm text-xs",
                    active ? "text-paper" : "text-ink/65 hover:text-ink",
                  )}
                  style={active ? { background: palette.accentHex } : undefined}
                >
                  <Icon size={12} />
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Page limit */}
        <div className="flex flex-col gap-2">
          <span className="font-dm text-[11px] uppercase tracking-wider2 text-ink/55">Page limit</span>
          <div className="inline-flex rounded-md border border-ink/15 bg-paper p-1 w-fit">
            {([
              { v: 1, label: "1" },
              { v: 2, label: "2" },
              { v: 3, label: "3" },
              { v: null, label: "No limit" },
            ] as const).map((opt) => {
              const active = pageLimit === opt.v;
              return (
                <button
                  key={String(opt.v)}
                  type="button"
                  onClick={() => patchIntent({ pageLimit: opt.v })}
                  className={cn("rounded px-3 py-2 font-dm text-xs", active ? "text-paper" : "text-ink/65 hover:text-ink")}
                  style={active ? { background: palette.accentHex } : undefined}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
        {TEMPLATES.map((t) => {
          const active = selected === t.id;
          return (
            <div
              key={t.id}
              className={cn(
                "group flex flex-col overflow-hidden rounded-lg border-2 bg-paper transition-all",
                active
                  ? "shadow-lg"
                  : "border-transparent shadow-sm hover:-translate-y-1 hover:shadow-md",
              )}
              style={active ? { borderColor: palette.accentHex } : undefined}
            >
              <button
                type="button"
                onClick={() => setTemplate(t.id)}
                className="relative block w-full"
                aria-label={`Preview ${t.name}`}
              >
                <ScaledPreview scale={0.36} visibleHeight={360} className="border-b border-ink/10">
                  <div style={{ ['--accent' as never]: palette.accentHex } as React.CSSProperties}>
                    <CVRenderer cv={SAMPLE_CV} template={t.id} photoUrl={previewPhoto} />
                  </div>
                </ScaledPreview>
                {active && (
                  <div
                    className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full text-paper shadow"
                    style={{ background: palette.accentHex }}
                  >
                    <Check size={14} />
                  </div>
                )}
                {t.isNew && !active && (
                  <div className="absolute left-3 top-3 z-10 inline-flex items-center gap-1 rounded-full bg-ink px-2.5 py-1 font-dm text-[10px] font-semibold uppercase tracking-wider2 text-paper shadow">
                    <Sparkles size={11} /> New
                  </div>
                )}
              </button>

              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <span
                    className="inline-block rounded bg-clay px-2.5 py-1 font-dm text-[10px] font-semibold uppercase tracking-wider2"
                    style={{ color: palette.accentHex }}
                  >
                    {t.badge}
                  </span>
                  <span className="inline-flex items-center gap-1.5 whitespace-nowrap font-dm text-[11px] font-medium text-olive">
                    <ShieldCheck size={12} /> ATS {t.ats}%
                  </span>
                </div>

                <h3 className="mt-3 font-syne text-xl text-ink">{t.name}</h3>
                <p className="mt-1.5 font-dm text-[13px] font-light leading-relaxed text-ink/65">{t.description}</p>

                <ul className="mt-4 space-y-1.5">
                  {t.features.map((f) => (
                    <li key={f} className="relative pl-4 font-dm text-[12.5px] font-light leading-snug text-ink/80">
                      <span className="absolute left-0 top-0 font-bold" style={{ color: palette.accentHex }}>•</span>
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={() => setTemplate(t.id)}
                  className="mt-5 w-full rounded px-5 py-3 font-dm text-sm font-semibold uppercase tracking-wider2 text-paper transition-opacity hover:opacity-90"
                  style={{ background: active ? "#1a1714" : palette.accentHex }}
                >
                  {active ? "Selected" : "Use this template"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <StepFooter
        hideBack
        onNext={() => setStep(2)}
        nextDisabled={!selected}
        nextLabel="Continue to upload"
      />
    </>
  );
}
