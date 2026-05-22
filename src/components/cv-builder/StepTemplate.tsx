import { Check, ShieldCheck } from "lucide-react";
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
  description: string;
  features: string[];
  ats: number;
}

const TEMPLATES: TemplateMeta[] = [
  {
    id: "classic",
    name: "Classic",
    badge: "Classic",
    description:
      "Traditional single-column layout with formal typography. Perfect for conservative industries and senior positions.",
    features: [
      "Single column layout",
      "Large name with circular photo",
      "Traditional section headers",
      "Dense, efficient use of space",
    ],
    ats: 95,
  },
  {
    id: "modern",
    name: "Modern",
    badge: "Modern",
    description:
      "Clean contemporary design with generous spacing and accent bars. Ideal for creative and tech roles.",
    features: [
      "Left accent bars on sections",
      "Square photo with rounded corners",
      "Clean, generous white space",
      "Contemporary typography",
    ],
    ats: 93,
  },
  {
    id: "compact",
    name: "Compact",
    badge: "Compact",
    description:
      "Two-column layout maximising content visibility. Best for experienced professionals with extensive backgrounds.",
    features: [
      "Two-column main layout",
      "Tighter line spacing",
      "More content per page",
      "Efficient use of space",
    ],
    ats: 92,
  },
  {
    id: "skills-first",
    name: "Skills-first",
    badge: "Skills-First",
    description:
      "Highlights competencies before experience with pill-style tags. Perfect for career changers and skills-based roles.",
    features: [
      "Skills section prominently placed",
      "Pill-style competency tags",
      "Circular profile photo",
      "Modern, accessible design",
    ],
    ats: 94,
  },
  {
    id: "executive",
    name: "Executive",
    badge: "Executive",
    description:
      "Refined design with generous white space and strong typography. Designed for C-suite and senior leadership.",
    features: [
      "Large display typography",
      "Prominent executive summary",
      "Generous white space",
      "Authoritative, refined feel",
    ],
    ats: 96,
  },
];

export default function StepTemplate() {
  const { state, setTemplate, setTypeOption, setStep } = useCVBuilder();
  const selected = state.selectedTemplate;

  return (
    <>
      <StepHeader
        eyebrow="Step 4 · Template"
        title="Choose your CV template"
        subtitle="Each template is ATS-friendly. The difference is tone, density, and the room your CV needs to walk into."
      />

      <div className="mb-8 inline-flex rounded-md border border-ink/15 bg-paper p-1">
        {(["light", "dark"] as TypeOption[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTypeOption(t)}
            className={cn(
              "rounded px-4 py-2 font-dm text-xs uppercase tracking-wider2 capitalize",
              state.typeOption === t ? "bg-sienna text-paper" : "text-ink/65",
            )}
          >
            {t}
          </button>
        ))}
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
