import { useCVBuilder, type Seniority, type CVType, type Tone } from "@/contexts/CVBuilderContext";
import { StepFooter, StepHeader } from "./WizardShell";
import { cn } from "@/lib/utils";

const SENIORITY: { id: Seniority; label: string }[] = [
  { id: "graduate", label: "Graduate" },
  { id: "mid", label: "Mid-level" },
  { id: "senior", label: "Senior" },
  { id: "director", label: "Director" },
  { id: "executive", label: "Executive" },
];

const CV_TYPES: { id: CVType; title: string; desc: string }[] = [
  {
    id: "chronological",
    title: "Chronological",
    desc: "A clear timeline of roles. Best when your trajectory tells the story.",
  },
  {
    id: "skills",
    title: "Skills-led",
    desc: "Capabilities first, history second. Good for pivots or non-linear paths.",
  },
  {
    id: "hybrid",
    title: "Hybrid",
    desc: "A short skills summary followed by full experience. The most versatile.",
  },
];

const TONES: { id: Tone; label: string; hint: string }[] = [
  { id: "conservative", label: "Conservative", hint: "Banking, legal, public sector" },
  { id: "balanced", label: "Balanced", hint: "Most industries" },
  { id: "modern", label: "Modern", hint: "Tech, creative, startups" },
];

export default function StepIntent() {
  const { state, patchIntent, setStep } = useCVBuilder();
  const f = state.intentForm;
  const ready =
    f.targetRole.trim().length > 1 &&
    f.targetIndustry.trim().length > 1 &&
    f.seniority &&
    f.cvType &&
    f.tone;

  return (
    <>
      <StepHeader
        eyebrow="Step 2 · Intent"
        title="Tell us where this CV is going"
        subtitle="A CV reads differently for a Director of Operations than for a Product Designer. These four answers shape every choice the builder makes."
      />

      <div className="space-y-10">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block font-dm text-xs uppercase tracking-wider2 text-ink/55">
              Target role
            </label>
            <input
              value={f.targetRole}
              onChange={(e) => patchIntent({ targetRole: e.target.value })}
              placeholder="e.g. Head of People"
              className="w-full rounded-md border border-ink/15 bg-paper px-4 py-3 font-dm text-sm text-ink placeholder:text-ink/40 focus:border-sienna focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-2 block font-dm text-xs uppercase tracking-wider2 text-ink/55">
              Target industry
            </label>
            <input
              value={f.targetIndustry}
              onChange={(e) => patchIntent({ targetIndustry: e.target.value })}
              placeholder="e.g. Hospitality, SaaS, Healthcare"
              className="w-full rounded-md border border-ink/15 bg-paper px-4 py-3 font-dm text-sm text-ink placeholder:text-ink/40 focus:border-sienna focus:outline-none"
            />
          </div>
        </div>

        <div>
          <p className="mb-3 font-dm text-xs uppercase tracking-wider2 text-ink/55">Seniority</p>
          <div className="flex flex-wrap gap-2">
            {SENIORITY.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => patchIntent({ seniority: s.id })}
                className={cn(
                  "rounded-full border px-4 py-2 font-dm text-sm transition-colors",
                  f.seniority === s.id
                    ? "border-sienna bg-sienna text-paper"
                    : "border-ink/20 bg-paper text-ink/70 hover:border-ink/40",
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-3 font-dm text-xs uppercase tracking-wider2 text-ink/55">CV type</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {CV_TYPES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => patchIntent({ cvType: t.id })}
                className={cn(
                  "rounded-md border p-5 text-left transition-colors",
                  f.cvType === t.id
                    ? "border-sienna bg-clay/40"
                    : "border-ink/15 bg-paper hover:border-ink/30",
                )}
              >
                <p className="font-syne text-base text-ink">{t.title}</p>
                <p className="mt-1.5 font-dm text-sm leading-relaxed text-ink/60">{t.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-3 font-dm text-xs uppercase tracking-wider2 text-ink/55">Tone</p>
          <div className="inline-flex rounded-md border border-ink/15 bg-paper p-1">
            {TONES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => patchIntent({ tone: t.id })}
                className={cn(
                  "rounded px-4 py-2 text-left font-dm text-sm transition-colors",
                  f.tone === t.id ? "bg-sienna text-paper" : "text-ink/70 hover:text-ink",
                )}
              >
                <span className="block">{t.label}</span>
                <span
                  className={cn(
                    "block text-[10px]",
                    f.tone === t.id ? "text-paper/75" : "text-ink/45",
                  )}
                >
                  {t.hint}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <StepFooter
        onBack={() => setStep(1)}
        onNext={() => setStep(3)}
        nextDisabled={!ready}
        nextLabel="Analyse my CV"
      />
    </>
  );
}
