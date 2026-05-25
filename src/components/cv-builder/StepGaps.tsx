import { useCallback, useEffect, useState } from "react";
import { Lock, RefreshCw, Check, X as XIcon, MessageSquarePlus } from "lucide-react";
import { useCVBuilder, type GapResponse } from "@/contexts/CVBuilderContext";
import { supabase } from "@/integrations/supabase/client";
import { StepFooter, StepHeader } from "./WizardShell";
import { cn } from "@/lib/utils";

function isAnswered(r: GapResponse | undefined): boolean {
  if (!r) return false;
  if (typeof r === "string") return r.trim().length > 8;
  return r.confirm === "yes" || r.confirm === "no";
}

export default function StepGaps() {
  const { state, setGaps, setGapResponse, setStep } = useCVBuilder();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runAnalysis = useCallback(async (provider: "gemini" | "nvidia" | "lovable" = "gemini") => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("analyze-cv-gaps", {
        body: {
          parsedText: state.parsedText,
          intentForm: state.intentForm,
          uploadedFiles: state.uploadedFiles.map((f) => ({ path: f.path, name: f.name })),
          provider,
        },
      });
      if (fnError) throw fnError;
      if (data?.error) throw new Error(`${data.error}${data.details ? ` — ${data.details}` : ""}`);
      if (data?.gaps) setGaps(data.gaps);
    } catch (err) {
      console.error("Gap analysis failed", err);
      setError((err as Error).message ?? "unknown error");
    } finally {
      setLoading(false);
    }
  }, [state.parsedText, state.intentForm, state.uploadedFiles, setGaps]);

  useEffect(() => {
    if (state.gapAnalysis.gaps.length > 0) return;
    runAnalysis("gemini");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const gaps = state.gapAnalysis.gaps;
  const answered = gaps.filter((g) => isAnswered(state.gapAnalysis.responses[g.id])).length;

  return (
    <>
      <StepHeader
        eyebrow="Step 3 · Gaps"
        title="A few things your CV doesn't quite say yet"
        subtitle="Answer what's relevant. Writing gaps need detail; role-expectation gaps can be answered Yes or No."
      />

      <div className="mb-6 flex items-center justify-between">
        <p className="font-dm text-sm text-ink/65">
          {loading ? "Reading your CV…" : `${answered} of ${gaps.length} answered`}
        </p>
        {!loading && gaps.length > 0 && (
          <div className="h-1 w-32 overflow-hidden rounded-full bg-ink/10">
            <div className="h-full bg-sienna transition-all" style={{ width: `${(answered / gaps.length) * 100}%` }} />
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
            <p className="font-medium text-ink">We're experiencing high demand right now.</p>
            <p className="mt-2">Our AI couldn't analyse your CV after several attempts. Try another model.</p>
            <p className="mt-3 text-xs text-ink/50">Details: {error}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" onClick={() => runAnalysis("gemini")} className="inline-flex items-center gap-2 rounded-sm bg-sienna px-4 py-2 font-dm text-sm font-medium text-paper hover:opacity-90"><RefreshCw size={14} /> Retry with Gemini</button>
              <button type="button" onClick={() => runAnalysis("nvidia")} className="inline-flex items-center gap-2 rounded-sm border border-ink/20 px-4 py-2 font-dm text-sm text-ink hover:border-ink/40"><RefreshCw size={14} /> Try with Nvidia</button>
              <button type="button" onClick={() => runAnalysis("lovable")} className="inline-flex items-center gap-2 rounded-sm border border-ink/20 px-4 py-2 font-dm text-sm text-ink hover:border-ink/40"><RefreshCw size={14} /> Try with Lovable AI</button>
            </div>
          </div>
        )}
        {gaps.length > 0 && (() => {
          const writingGaps = gaps.filter((g) => (g.layer ?? "writing") === "writing");
          const expectationGaps = gaps.filter((g) => g.layer === "expectation");

          const renderWriting = (g: typeof gaps[number]) => {
            const raw = state.gapAnalysis.responses[g.id];
            const value = typeof raw === "string" ? raw : "";
            const incomplete = value.trim().length < 9;
            return (
              <article key={g.id} className={cn("rounded-md border bg-paper p-5 transition-colors sm:p-6", incomplete ? "border-ink/10" : "border-sienna/40")}>
                <span className="inline-block rounded-full bg-sienna/10 px-3 py-1 font-dm text-[11px] uppercase tracking-wider2 text-sienna">{g.category}</span>
                <blockquote className="mt-4 border-l-2 border-ink/20 pl-4 font-serif text-base italic text-ink/70">"{g.example}"</blockquote>
                <p className="mt-4 font-dm text-sm text-ink">{g.question}</p>
                <textarea value={value} onChange={(e) => setGapResponse(g.id, e.target.value)} placeholder="Your answer — specifics welcome" className="mt-3 min-h-24 w-full resize-y rounded border border-ink/15 bg-paper p-3 font-dm text-sm text-ink placeholder:text-ink/40 focus:border-sienna focus:outline-none" />
              </article>
            );
          };

          const renderExpectation = (g: typeof gaps[number]) => {
            const raw = state.gapAnalysis.responses[g.id];
            const obj: { confirm?: "yes" | "no"; details?: string } =
              raw && typeof raw === "object" ? raw : {};
            const answered = obj.confirm === "yes" || obj.confirm === "no";
            const [showDetails, setShowDetails] = [
              !!obj.details || obj.confirm === "yes",
              (v: boolean) => setGapResponse(g.id, { ...(obj as any), details: v ? (obj.details ?? "") : undefined } as GapResponse),
            ];
            return (
              <article key={g.id} className={cn("rounded-md border bg-paper p-5 transition-colors sm:p-6", answered ? "border-sienna/40" : "border-ink/10")}>
                <span className="inline-block rounded-full bg-sienna/10 px-3 py-1 font-dm text-[11px] uppercase tracking-wider2 text-sienna">{g.category}</span>
                <p className="mt-4 font-dm text-sm text-ink">{g.question}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button type="button" onClick={() => setGapResponse(g.id, { confirm: "yes", details: obj.details })}
                    className={cn("inline-flex items-center gap-1.5 rounded-sm border px-3 py-1.5 font-dm text-sm", obj.confirm === "yes" ? "border-olive bg-olive/10 text-olive" : "border-ink/15 text-ink/70 hover:border-ink/40")}>
                    <Check size={13} /> Yes, add to my CV
                  </button>
                  <button type="button" onClick={() => setGapResponse(g.id, { confirm: "no" })}
                    className={cn("inline-flex items-center gap-1.5 rounded-sm border px-3 py-1.5 font-dm text-sm", obj.confirm === "no" ? "border-ink bg-ink/5 text-ink" : "border-ink/15 text-ink/70 hover:border-ink/40")}>
                    <XIcon size={13} /> No, skip
                  </button>
                  {obj.confirm === "yes" && (
                    <button type="button" onClick={() => setShowDetails(!showDetails)}
                      className="inline-flex items-center gap-1.5 rounded-sm border border-ink/15 px-3 py-1.5 font-dm text-sm text-ink/70 hover:border-ink/40">
                      <MessageSquarePlus size={13} /> Add specifics
                    </button>
                  )}
                </div>
                {obj.confirm === "yes" && showDetails && (
                  <textarea
                    value={obj.details ?? ""}
                    onChange={(e) => setGapResponse(g.id, { confirm: "yes", details: e.target.value })}
                    placeholder="Optional: any scope, scale, or numbers we should mention"
                    className="mt-3 min-h-20 w-full resize-y rounded border border-ink/15 bg-paper p-3 font-dm text-sm text-ink placeholder:text-ink/40 focus:border-sienna focus:outline-none"
                  />
                )}
              </article>
            );
          };

          return (
            <div className="space-y-10">
              {writingGaps.length > 0 && (
                <section className="space-y-5">
                  <header>
                    <h3 className="font-syne text-lg text-ink">Strengthen what's there</h3>
                    <p className="mt-1 font-dm text-sm text-ink/60">Tighten wording, add metrics, and sharpen claims that already exist in your CV.</p>
                  </header>
                  {writingGaps.map(renderWriting)}
                </section>
              )}
              {expectationGaps.length > 0 && (
                <section className="space-y-5">
                  <header>
                    <h3 className="font-syne text-lg text-ink">Confirm what's typical for this role</h3>
                    <p className="mt-1 font-dm text-sm text-ink/60">Quick yes/no questions about responsibilities a strong candidate for your target role usually owns. Anything you confirm gets added to your CV.</p>
                  </header>
                  {expectationGaps.map(renderExpectation)}
                </section>
              )}
            </div>
          );
        })()}
      </div>


      <StepFooter onBack={() => setStep(2)} onNext={() => setStep(4)} nextLabel="Continue" />
    </>
  );
}
