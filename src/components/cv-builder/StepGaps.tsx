import { useEffect, useState } from "react";
import { Lock } from "lucide-react";
import { useCVBuilder } from "@/contexts/CVBuilderContext";
import { supabase } from "@/integrations/supabase/client";
import { StepFooter, StepHeader } from "./WizardShell";
import { cn } from "@/lib/utils";

export default function StepGaps() {
  const { state, setGaps, setGapResponse, setStep } = useCVBuilder();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (state.gapAnalysis.gaps.length > 0) return;
    let active = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: fnError } = await supabase.functions.invoke("analyze-cv-gaps", {
          body: { parsedText: state.parsedText, intentForm: state.intentForm },
        });
        if (fnError) throw fnError;
        if (active && data?.gaps) setGaps(data.gaps);
      } catch (err) {
        console.error("Gap analysis failed", err);
        if (active) setError("We couldn't analyse gaps automatically right now. You can continue and edit the draft manually.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const gaps = state.gapAnalysis.gaps;
  const answered = gaps.filter((g) => (state.gapAnalysis.responses[g.id] ?? "").trim().length > 8)
    .length;

  return (
    <>
      <StepHeader
        eyebrow="Step 3 · Gaps"
        title="A few things your CV doesn't quite say yet"
        subtitle="Your answers below become the raw material for the rewrite. Be specific — numbers, names, scope. Skip what doesn't apply."
      />

      <div className="mb-6 flex items-center justify-between">
        <p className="font-dm text-sm text-ink/65">
          {loading ? "Reading your CV…" : `${answered} of ${gaps.length} answered`}
        </p>
        {!loading && gaps.length > 0 && (
          <div className="h-1 w-32 overflow-hidden rounded-full bg-ink/10">
            <div
              className="h-full bg-sienna transition-all"
              style={{ width: `${(answered / gaps.length) * 100}%` }}
            />
          </div>
        )}
      </div>

      <div className="space-y-5">
        {loading && (
          <div className="rounded-md border border-ink/10 bg-clay/30 p-8 text-center font-dm text-sm text-ink/55">
            Pulling specifics from your CV…
          </div>
        )}
        {!loading && error && gaps.length === 0 && (
          <div className="rounded-md border border-sienna/30 bg-clay/30 p-6 font-dm text-sm text-ink/70">
            {error}
          </div>
        )}
        {gaps.map((g) => {
          const value = state.gapAnalysis.responses[g.id] ?? "";
          const incomplete = value.trim().length < 9;
          return (
            <article
              key={g.id}
              className={cn(
                "rounded-md border bg-paper p-5 transition-colors sm:p-6",
                incomplete ? "border-ink/10" : "border-sienna/40",
              )}
            >
              <span className="inline-block rounded-full bg-sienna/10 px-3 py-1 font-dm text-[11px] uppercase tracking-wider2 text-sienna">
                {g.category}
              </span>

              <blockquote className="mt-4 border-l-2 border-ink/20 pl-4 font-serif text-base italic text-ink/70">
                "{g.example}"
              </blockquote>

              <p className="mt-4 font-dm text-sm text-ink">{g.question}</p>

              <textarea
                value={value}
                onChange={(e) => setGapResponse(g.id, e.target.value)}
                placeholder="Your answer — specifics welcome"
                className="mt-3 min-h-24 w-full resize-y rounded border border-ink/15 bg-paper p-3 font-dm text-sm text-ink placeholder:text-ink/40 focus:border-sienna focus:outline-none"
              />
            </article>
          );
        })}
      </div>

      {!loading && gaps.length > 0 && (
        <div className="mt-10 rounded-md border border-sienna/30 bg-clay/40 p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sienna/15 text-sienna">
              <Lock size={18} />
            </div>
            <div className="flex-1">
              <p className="font-syne text-lg text-ink">
                Select your template, then unlock your full CV for AED 99
              </p>
              <p className="mt-1 font-dm text-sm text-ink/70">
                One payment, yours to keep. Includes the rewrite, ATS scoring, and PDF + Word export.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setStep(4)}
              className="hidden shrink-0 rounded-sm bg-sienna px-5 py-3 font-dm text-sm font-medium text-paper hover:opacity-90 sm:inline-flex"
            >
              Choose template
            </button>
          </div>
          <button
            type="button"
            onClick={() => setStep(4)}
            className="mt-4 w-full rounded-sm bg-sienna px-5 py-3 font-dm text-sm font-medium text-paper hover:opacity-90 sm:hidden"
          >
            Choose template
          </button>
        </div>
      )}

      <StepFooter onBack={() => setStep(2)} onNext={() => setStep(4)} nextLabel="Continue" />
    </>
  );
}
