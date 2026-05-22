import { useEffect, useState } from "react";
import { Check, RotateCcw, Pencil } from "lucide-react";
import {
  useCVBuilder,
  type CVBullet,
  type CVExperience,
} from "@/contexts/CVBuilderContext";
import { supabase } from "@/integrations/supabase/client";
import { StepFooter, StepHeader } from "./WizardShell";
import { cn } from "@/lib/utils";

export default function StepDraft() {
  const { state, setGeneratedCV, setAts, updateBullet, setStep } = useCVBuilder();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (state.generatedCV) return;
    let active = true;
    (async () => {
      setLoading(true);
      const { data } = await supabase.functions.invoke("generate-cv", {
        body: {
          parsedText: state.parsedText,
          intentForm: state.intentForm,
          gapResponses: state.gapAnalysis.responses,
          template: state.selectedTemplate,
          typeOption: state.typeOption,
        },
      });
      if (active && data?.generatedCV) {
        setGeneratedCV(data.generatedCV);
        const ats = await supabase.functions.invoke("calculate-ats-score", {
          body: { generatedCV: data.generatedCV, targetRole: state.intentForm.targetRoles.join(", ") },
        });
        if (ats.data?.atsScore) setAts(ats.data.atsScore);
      }
      setLoading(false);
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
        <div className="grid gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded bg-clay/40" />
          ))}
        </div>
      </>
    );
  }

  const cv = state.generatedCV;
  const ats = state.atsScore;

  return (
    <>
      <StepHeader
        eyebrow="Step 6 · Draft"
        title="Your CV, professionally rewritten"
        subtitle="Each bullet shows the original and the rewrite, with a one-line note on what changed. Accept, edit, or revert anything."
      />

      <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
        <div className="space-y-8">
          <section>
            <h2 className="mb-3 font-syne text-xl text-ink">Summary</h2>
            <p className="rounded-md border border-ink/10 bg-paper p-4 font-dm text-sm leading-relaxed text-ink/85">
              {cv.summary}
            </p>
          </section>

          {cv.experience.map((exp) => (
            <ExperienceBlock key={exp.id} exp={exp} onPatch={updateBullet} />
          ))}

          <section>
            <h2 className="mb-3 font-syne text-xl text-ink">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {cv.skills.map((s) => (
                <span
                  key={s}
                  className="rounded-full border border-ink/15 bg-paper px-3 py-1 font-dm text-sm text-ink/80"
                >
                  {s}
                </span>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-3 font-syne text-xl text-ink">Education</h2>
            {cv.education.map((ed) => (
              <div key={ed.id} className="rounded-md border border-ink/10 bg-paper p-4">
                <p className="font-syne text-base text-ink">{ed.qualification}</p>
                <p className="font-dm text-sm text-ink/65">
                  {ed.institution} · {ed.period}
                </p>
              </div>
            ))}
          </section>
        </div>

        <aside className="lg:sticky lg:top-32 lg:self-start">
          <AtsPanel score={ats} />
        </aside>
      </div>

      <StepFooter onBack={() => setStep(5)} onNext={() => setStep(7)} nextLabel="Export" />
    </>
  );
}

function ExperienceBlock({
  exp,
  onPatch,
}: {
  exp: CVExperience;
  onPatch: (expId: string, bId: string, p: Partial<CVBullet>) => void;
}) {
  return (
    <section>
      <header className="mb-3">
        <h2 className="font-syne text-xl text-ink">{exp.role}</h2>
        <p className="font-dm text-sm text-ink/60">
          {exp.company} · {exp.period}
        </p>
      </header>
      <ul className="space-y-3">
        {exp.bullets.map((b) => (
          <BulletEditor key={b.id} bullet={b} onPatch={(p) => onPatch(exp.id, b.id, p)} />
        ))}
      </ul>
    </section>
  );
}

function BulletEditor({
  bullet,
  onPatch,
}: {
  bullet: CVBullet;
  onPatch: (p: Partial<CVBullet>) => void;
}) {
  const [editing, setEditing] = useState(false);
  const reverted = bullet.status === "reverted";

  return (
    <li className="rounded-md border border-ink/10 bg-paper p-4">
      <p className="font-dm text-xs text-ink/45 line-through">{bullet.original}</p>
      {editing ? (
        <textarea
          value={bullet.rewrite}
          onChange={(e) => onPatch({ rewrite: e.target.value, status: "edited" })}
          className="mt-2 min-h-16 w-full resize-y rounded border border-ink/20 bg-paper p-2 font-dm text-sm text-ink focus:border-sienna focus:outline-none"
          autoFocus
        />
      ) : (
        <p
          className={cn(
            "mt-2 font-dm text-sm text-ink",
            reverted && "line-through opacity-40",
          )}
        >
          {bullet.rewrite}
        </p>
      )}
      <p className="mt-2 font-serif text-xs italic text-ink/55">{bullet.explanation}</p>
      <div className="mt-3 flex gap-1.5">
        <ActionBtn
          icon={<Check size={12} />}
          label="Accept"
          active={bullet.status === "accepted" && !editing}
          onClick={() => {
            setEditing(false);
            onPatch({ status: "accepted" });
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
          onClick={() => onPatch({ status: "reverted" })}
        />
      </div>
    </li>
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

function AtsPanel({ score }: { score: ReturnType<typeof useCVBuilder>["state"]["atsScore"] }) {
  if (!score) return null;
  const r = 36;
  const c = 2 * Math.PI * r;
  const dash = c - (score.overall / 100) * c;
  return (
    <div className="rounded-md border border-ink/10 bg-paper p-5">
      <p className="font-dm text-xs uppercase tracking-wider2 text-ink/55">ATS Score</p>
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
            {score.overall}
          </text>
        </svg>
      </div>
      <div className="space-y-2">
        <ScoreRow label="Keyword match" value={`${score.keywordMatch}%`} />
        <ScoreRow label="Readability" value={`${score.readability}%`} />
      </div>
      <ul className="mt-4 space-y-1.5 border-t border-ink/10 pt-3">
        {score.formatting.map((f) => (
          <li key={f.label} className="flex items-center gap-2 font-dm text-xs text-ink/70">
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
