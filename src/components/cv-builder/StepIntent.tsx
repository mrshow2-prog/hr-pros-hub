import { useState, KeyboardEvent } from "react";
import { X } from "lucide-react";
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

const FUNCTIONS = [
  "HR & People",
  "Finance",
  "Marketing",
  "Communications & PR",
  "Operations",
  "Legal",
  "Technology",
  "Sales",
  "General Management",
  "Other",
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

const MAX_ROLES = 5;

export default function StepIntent() {
  const { state, patchIntent, setStep } = useCVBuilder();
  const f = state.intentForm;
  const [roleInput, setRoleInput] = useState("");

  const addRole = (raw: string) => {
    const v = raw.trim().replace(/,$/, "").trim();
    if (!v) return;
    if (f.targetRoles.includes(v)) return;
    if (f.targetRoles.length >= MAX_ROLES) return;
    patchIntent({ targetRoles: [...f.targetRoles, v] });
    setRoleInput("");
  };

  const removeRole = (r: string) => {
    patchIntent({ targetRoles: f.targetRoles.filter((x) => x !== r) });
  };

  const onRoleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addRole(roleInput);
    } else if (e.key === "Backspace" && !roleInput && f.targetRoles.length) {
      removeRole(f.targetRoles[f.targetRoles.length - 1]);
    }
  };

  const toggleAgnostic = () => {
    const next = !f.industryAgnostic;
    patchIntent({
      industryAgnostic: next,
      targetIndustry: next ? null : "",
    });
  };

  const industryOk = f.industryAgnostic || (f.targetIndustry ?? "").trim().length > 0;
  const ready =
    f.targetRoles.length > 0 &&
    f.functionArea.length > 0 &&
    industryOk &&
    f.seniority &&
    f.cvType &&
    f.tone;

  return (
    <>
      <StepHeader
        eyebrow="Step 2 · Intent"
        title="Tell us where this CV is going"
        subtitle="A CV reads differently for a Director of Operations than for a Product Designer. These answers shape every choice the builder makes."
      />

      <div className="space-y-10">
        {/* Target roles */}
        <div>
          <label className="mb-2 block font-dm text-xs uppercase tracking-wider2 text-ink/55">
            Target roles <span className="lowercase text-ink/40">· up to {MAX_ROLES}</span>
          </label>
          <div
            className={cn(
              "flex flex-wrap items-center gap-2 rounded-md border border-ink/15 bg-paper px-3 py-2 focus-within:border-sienna",
            )}
          >
            {f.targetRoles.map((r) => (
              <span
                key={r}
                className="inline-flex items-center gap-1.5 rounded-full bg-sienna/10 px-3 py-1 font-dm text-sm text-sienna"
              >
                {r}
                <button
                  type="button"
                  onClick={() => removeRole(r)}
                  aria-label={`Remove ${r}`}
                  className="text-sienna/70 hover:text-sienna"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
            {f.targetRoles.length < MAX_ROLES && (
              <input
                value={roleInput}
                onChange={(e) => setRoleInput(e.target.value)}
                onKeyDown={onRoleKey}
                onBlur={() => roleInput && addRole(roleInput)}
                placeholder={
                  f.targetRoles.length === 0
                    ? "e.g. HR Director — press Enter to add"
                    : "Add another role"
                }
                className="min-w-[200px] flex-1 bg-transparent px-1 py-1 font-dm text-sm text-ink placeholder:text-ink/40 focus:outline-none"
              />
            )}
          </div>
        </div>

        {/* Function */}
        <div>
          <p className="font-dm text-xs uppercase tracking-wider2 text-ink/55">Function</p>
          <p className="mb-3 font-dm text-xs text-ink/45">
            The professional discipline your role sits in
          </p>
          <div className="flex flex-wrap gap-2">
            {FUNCTIONS.map((fn) => (
              <button
                key={fn}
                type="button"
                onClick={() => patchIntent({ functionArea: fn })}
                className={cn(
                  "rounded-full border px-4 py-2 font-dm text-sm transition-colors",
                  f.functionArea === fn
                    ? "border-sienna bg-sienna text-paper"
                    : "border-ink/20 bg-paper text-ink/70 hover:border-ink/40",
                )}
              >
                {fn}
              </button>
            ))}
          </div>
        </div>

        {/* Industry */}
        <div>
          <label className="mb-2 block font-dm text-xs uppercase tracking-wider2 text-ink/55">
            Target industry <span className="lowercase text-ink/40">· optional</span>
          </label>
          <input
            value={f.targetIndustry ?? ""}
            disabled={f.industryAgnostic}
            onChange={(e) => patchIntent({ targetIndustry: e.target.value })}
            placeholder="e.g. Hospitality, SaaS, Healthcare"
            className="w-full rounded-md border border-ink/15 bg-paper px-4 py-3 font-dm text-sm text-ink placeholder:text-ink/40 focus:border-sienna focus:outline-none disabled:bg-ink/5 disabled:text-ink/40"
          />
          <label className="mt-3 inline-flex cursor-pointer items-center gap-2 font-dm text-sm text-ink/70">
            <input
              type="checkbox"
              checked={f.industryAgnostic}
              onChange={toggleAgnostic}
              className="h-4 w-4 accent-sienna"
            />
            Not industry-specific — apply broadly
          </label>
        </div>

        {/* Seniority */}
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
