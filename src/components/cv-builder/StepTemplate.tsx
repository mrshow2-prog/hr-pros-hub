import { Check, ShieldCheck } from "lucide-react";
import { useCVBuilder, type TemplateId, type TypeOption } from "@/contexts/CVBuilderContext";
import { StepFooter, StepHeader } from "./WizardShell";
import { cn } from "@/lib/utils";

const TEMPLATES: { id: TemplateId; name: string; desc: string }[] = [
  { id: "classic", name: "Classic", desc: "Timeless, serif headings, single column." },
  { id: "modern", name: "Modern", desc: "Clean sans-serif, generous spacing." },
  { id: "compact", name: "Compact", desc: "Dense but readable — perfect for 10+ years." },
  { id: "skills-first", name: "Skills-first", desc: "Capabilities up top, then experience." },
  { id: "executive", name: "Executive", desc: "Considered, restrained, board-ready." },
];

function Mock({ tpl, dark }: { tpl: TemplateId; dark: boolean }) {
  const bg = dark ? "bg-ink" : "bg-paper";
  const fg = dark ? "bg-paper/80" : "bg-ink/80";
  const muted = dark ? "bg-paper/30" : "bg-ink/25";
  const accent = "bg-sienna";

  if (tpl === "skills-first") {
    return (
      <div className={cn("h-44 w-full rounded border border-ink/10 p-3", bg)}>
        <div className={cn("h-2 w-1/2 rounded", fg)} />
        <div className={cn("mt-1 h-1.5 w-1/3 rounded", muted)} />
        <div className="mt-3 grid grid-cols-3 gap-1">
          <div className={cn("h-3 rounded", accent)} />
          <div className={cn("h-3 rounded", accent)} />
          <div className={cn("h-3 rounded", accent)} />
        </div>
        <div className="mt-3 space-y-1">
          <div className={cn("h-1.5 w-full rounded", muted)} />
          <div className={cn("h-1.5 w-5/6 rounded", muted)} />
          <div className={cn("h-1.5 w-4/6 rounded", muted)} />
        </div>
      </div>
    );
  }
  if (tpl === "compact") {
    return (
      <div className={cn("h-44 w-full rounded border border-ink/10 p-3", bg)}>
        <div className={cn("h-2 w-2/3 rounded", fg)} />
        <div className="mt-2 space-y-0.5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className={cn("h-1 w-full rounded", muted)} />
          ))}
        </div>
      </div>
    );
  }
  if (tpl === "executive") {
    return (
      <div className={cn("h-44 w-full rounded border border-ink/10 p-3", bg)}>
        <div className="mx-auto h-3 w-1/2 rounded bg-sienna" />
        <div className={cn("mx-auto mt-1 h-1.5 w-1/3 rounded", muted)} />
        <div className={cn("my-3 h-px w-full", muted)} />
        <div className="space-y-1">
          <div className={cn("h-1.5 w-3/4 rounded", fg)} />
          <div className={cn("h-1.5 w-full rounded", muted)} />
          <div className={cn("h-1.5 w-5/6 rounded", muted)} />
        </div>
      </div>
    );
  }
  if (tpl === "modern") {
    return (
      <div className={cn("flex h-44 w-full gap-2 rounded border border-ink/10 p-3", bg)}>
        <div className="w-1/3 space-y-1">
          <div className={cn("h-2 rounded", accent)} />
          <div className={cn("h-1.5 rounded", muted)} />
          <div className={cn("h-1.5 rounded", muted)} />
        </div>
        <div className="flex-1 space-y-1">
          <div className={cn("h-2 w-2/3 rounded", fg)} />
          <div className={cn("h-1.5 w-full rounded", muted)} />
          <div className={cn("h-1.5 w-5/6 rounded", muted)} />
          <div className={cn("h-1.5 w-4/6 rounded", muted)} />
        </div>
      </div>
    );
  }
  // classic
  return (
    <div className={cn("h-44 w-full rounded border border-ink/10 p-3", bg)}>
      <div className={cn("h-2.5 w-1/2 rounded", fg)} />
      <div className={cn("mt-1 h-1.5 w-1/3 rounded", muted)} />
      <div className={cn("my-2 h-px w-full", muted)} />
      <div className="space-y-1">
        <div className={cn("h-1.5 w-full rounded", muted)} />
        <div className={cn("h-1.5 w-5/6 rounded", muted)} />
        <div className={cn("h-1.5 w-2/3 rounded", muted)} />
      </div>
    </div>
  );
}

export default function StepTemplate() {
  const { state, setTemplate, setTypeOption, setStep } = useCVBuilder();
  const selected = state.selectedTemplate;
  const dark = state.typeOption === "dark";

  return (
    <>
      <StepHeader
        eyebrow="Step 4 · Template"
        title="Pick a layout that fits the room"
        subtitle="All five are ATS-friendly. The difference is tone and density — pick the one your reader expects."
      />

      <div className="mb-6 inline-flex rounded-md border border-ink/15 bg-paper p-1">
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TEMPLATES.map((t) => {
          const active = selected === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTemplate(t.id)}
              className={cn(
                "group relative rounded-md border bg-paper p-4 text-left transition-colors",
                active ? "border-sienna ring-2 ring-sienna/20" : "border-ink/15 hover:border-ink/30",
              )}
            >
              {active && (
                <div className="absolute right-3 top-3 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-sienna text-paper">
                  <Check size={14} />
                </div>
              )}
              <Mock tpl={t.id} dark={dark} />
              <div className="mt-3 flex items-center justify-between">
                <p className="font-syne text-base text-ink">{t.name}</p>
                <span className="inline-flex items-center gap-1 rounded-full bg-olive/10 px-2 py-0.5 font-dm text-[10px] uppercase tracking-wider2 text-olive">
                  <ShieldCheck size={10} /> ATS
                </span>
              </div>
              <p className="mt-1 font-dm text-sm text-ink/60">{t.desc}</p>
            </button>
          );
        })}
      </div>

      <StepFooter
        onBack={() => setStep(4)}
        onNext={() => setStep(6)}
        nextDisabled={!selected}
        nextLabel="Generate my CV"
      />
    </>
  );
}
