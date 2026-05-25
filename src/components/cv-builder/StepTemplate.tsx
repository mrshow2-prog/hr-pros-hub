import { Check, ShieldCheck, Sparkles } from "lucide-react";
import { useCVBuilder, type TemplateId, type TypeOption } from "@/contexts/CVBuilderContext";
import { StepFooter, StepHeader } from "./WizardShell";
import { cn } from "@/lib/utils";
import CVRenderer, { SAMPLE_CV } from "./templates/CVRenderer";
import { ScaledPreview } from "./templates/shared";

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
  {
    id: "dubai",
    name: "Dubai",
    badge: "Most picked",
    description:
      "Clean contemporary design with accent bars and generous spacing. Our best all-rounder — works for every industry from finance to creative.",
    features: [
      "Left accent bars on sections",
      "Square photo with crisp edges",
      "Generous, modern white space",
      "Strong sans-serif typography",
    ],
    ats: 96,
  },
  {
    id: "london",
    name: "London",
    badge: "Recruiter favourite",
    description:
      "Traditional single-column layout with formal serif typography. Perfect for banking, law, public sector and senior conservative roles.",
    features: [
      "Single column layout",
      "Classic serif headings",
      "Circular profile photo",
      "Underlined section titles",
    ],
    ats: 97,
  },
  {
    id: "zurich",
    name: "Zurich",
    badge: "Executive",
    description:
      "Refined design with oversized name and a featured executive summary. Designed for C-suite, board roles and senior leadership.",
    features: [
      "Display-sized name treatment",
      "Quoted executive summary",
      "Premium serif typography",
      "Authoritative, refined feel",
    ],
    ats: 96,
  },
  {
    id: "singapore",
    name: "Singapore",
    badge: "Information-dense",
    description:
      "Two-column compact layout maximising content visibility. Best for experienced professionals with long careers or technical resumes.",
    features: [
      "Two-column main layout",
      "Tighter line spacing",
      "More content per page",
      "Efficient use of space",
    ],
    ats: 94,
  },
  {
    id: "berlin",
    name: "Berlin",
    badge: "Career change",
    description:
      "Leads with skills and pill-style competency tags before experience. Perfect for career changers and skills-led applications.",
    features: [
      "Skills section placed first",
      "Pill-style competency tags",
      "Circular profile photo",
      "Modern, accessible design",
    ],
    ats: 95,
  },
  {
    id: "riyadh",
    name: "Riyadh",
    badge: "New · Bold",
    isNew: true,
    description:
      "Striking dark sidebar carrying photo, contact and skills next to a clean white main column. Stands out instantly while staying ATS-friendly.",
    features: [
      "Dark accent sidebar",
      "Photo and contact rail",
      "High visual contrast",
      "Modern recruiter-tested layout",
    ],
    ats: 93,
  },
  {
    id: "geneva",
    name: "Geneva",
    badge: "New · Premium",
    isNew: true,
    description:
      "Editorial-style layout with serif headlines and a vertical timeline for your career. Made for considered, premium personal brands.",
    features: [
      "Vertical career timeline",
      "Serif editorial headlines",
      "Numbered section eyebrows",
      "Generous magazine spacing",
    ],
    ats: 94,
  },
];

export default function StepTemplate() {
  const { state, setTemplate, setTypeOption, patchIntent, setStep } = useCVBuilder();
  const selected = state.selectedTemplate;
  const pageLimit = state.intentForm.pageLimit;

  return (
    <>
      <StepHeader
        eyebrow="Step 4 · Template"
        title="Choose your CV template"
        subtitle="Seven templates, all ATS-friendly. The difference is tone, density and the room your CV needs to walk into."
      />

      <div className="mb-6 flex flex-wrap items-center gap-6">
        <div className="inline-flex rounded-md border border-ink/15 bg-paper p-1">
          {(["light", "dark"] as TypeOption[]).map((t) => (
            <button key={t} type="button" onClick={() => setTypeOption(t)}
              className={cn("rounded px-4 py-2 font-dm text-xs uppercase tracking-wider2 capitalize",
                state.typeOption === t ? "bg-sienna text-paper" : "text-ink/65")}>
              {t}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-1">
          <span className="font-dm text-[11px] uppercase tracking-wider2 text-ink/55">Page limit</span>
          <div className="inline-flex rounded-md border border-ink/15 bg-paper p-1">
            {([
              { v: 1, label: "1 page" },
              { v: 2, label: "2 pages" },
              { v: 3, label: "3 pages" },
              { v: null, label: "No limit" },
            ] as const).map((opt) => {
              const active = pageLimit === opt.v;
              return (
                <button
                  key={String(opt.v)}
                  type="button"
                  onClick={() => patchIntent({ pageLimit: opt.v })}
                  className={cn("rounded px-3 py-2 font-dm text-xs",
                    active ? "bg-sienna text-paper" : "text-ink/65 hover:text-ink")}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
          <span className="font-dm text-[11px] text-ink/50">No limit = AI expands every responsibility into a full bullet</span>
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
                  ? "border-sienna shadow-lg"
                  : "border-transparent shadow-sm hover:-translate-y-1 hover:border-sienna/40 hover:shadow-md",
              )}
            >
              <button
                type="button"
                onClick={() => setTemplate(t.id)}
                className="relative block w-full"
                aria-label={`Preview ${t.name}`}
              >
                <ScaledPreview
                  scale={0.36}
                  visibleHeight={360}
                  className="border-b border-ink/10"
                >
                  <CVRenderer cv={SAMPLE_CV} template={t.id} photoUrl={SAMPLE_PHOTO_URL} />
                </ScaledPreview>
                {active && (
                  <div className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-sienna text-paper shadow">
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
                  <span className="inline-block rounded bg-clay px-2.5 py-1 font-dm text-[10px] font-semibold uppercase tracking-wider2 text-sienna">
                    {t.badge}
                  </span>
                  <span className="inline-flex items-center gap-1.5 whitespace-nowrap font-dm text-[11px] font-medium text-olive">
                    <ShieldCheck size={12} /> ATS {t.ats}%
                  </span>
                </div>

                <h3 className="mt-3 font-syne text-xl text-ink">{t.name}</h3>
                <p className="mt-1.5 font-dm text-[13px] font-light leading-relaxed text-ink/65">
                  {t.description}
                </p>

                <ul className="mt-4 space-y-1.5">
                  {t.features.map((f) => (
                    <li
                      key={f}
                      className="relative pl-4 font-dm text-[12.5px] font-light leading-snug text-ink/80"
                    >
                      <span className="absolute left-0 top-0 font-bold text-sienna">•</span>
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={() => setTemplate(t.id)}
                  className={cn(
                    "mt-5 w-full rounded px-5 py-3 font-dm text-sm font-semibold uppercase tracking-wider2 transition-colors",
                    active
                      ? "bg-ink text-paper"
                      : "bg-sienna text-paper hover:opacity-90",
                  )}
                >
                  {active ? "Selected" : "Use this template"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <StepFooter
        onBack={() => setStep(3)}
        onNext={() => setStep(5)}
        nextDisabled={!selected}
        nextLabel="Continue to unlock"
      />
    </>
  );
}
