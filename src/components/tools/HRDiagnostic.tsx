import { useMemo, useRef, useState } from "react";
import { DIAGNOSTIC_DIMS } from "@/data/tools";
import { downloadPdf, type PdfSection } from "@/lib/brandedPdf";
import { FieldLabel, SuggestionBox, ToolInput, ToolSelect, UpsellStrip } from "./ToolPrimitives";
import { BOOKING_URL } from "@/lib/contact";
import { T } from "@/i18n/T";

type AnswerMap = Record<string, number>;
type CompanyType = "mainland" | "freezone" | "gcc" | "other" | "";
type CompanyInfo = { name: string; employees: string; emiratis: string; type: CompanyType };

function getProfile(pct: number) {
  if (pct >= 80) return { label: "Strong HR foundation", desc: "Your HR function is performing well across most dimensions. Use advisory support to protect momentum and close remaining exposure.", color: "text-risk-green" };
  if (pct >= 60) return { label: "Developing — real gaps present", desc: "You have foundations in place, but legal, documentation, or management gaps need structured action within 30 days.", color: "text-risk-amber" };
  if (pct >= 40) return { label: "Significant gaps — act now", desc: "Multiple dimensions are under-developed. This calls for a proper rebuild plan rather than isolated templates.", color: "text-sienna" };
  return { label: "Critical exposure — urgent intervention", desc: "Your HR function has critical gaps across multiple dimensions. You need a comprehensive stabilisation plan, not a single low-cost product.", color: "text-risk-red" };
}

function getRecommendation(dimScores: Record<string, number>, overallPct: number, criticalCount: number, isUae: boolean, employees: number, emiratis: number) {
  const lowDims = Object.values(dimScores).filter((score) => score < 55).length;
  const emiratisationGap = isUae && employees >= 50 && emiratis < Math.ceil(employees * 0.08);

  if (overallPct < 45 || criticalCount >= 8 || lowDims >= 4) {
    return {
      name: "Premium HR Stabilisation + Growth Retainer",
      price: "Custom scope + monthly retainer",
      why: "The diagnostic shows broad exposure across several HR dimensions. The right next step is a comprehensive foundation rebuild, then ongoing retainer support to keep decisions, documents, and managers aligned.",
      crossSell: emiratisationGap ? "Add the Emiratisation Readiness Pack immediately because your headcount suggests possible quota exposure." : "Add a focused compliance audit first if legal/documentation scores are the weakest areas.",
    };
  }
  if (overallPct < 60 || lowDims >= 2) {
    return {
      name: "HR Foundation Pack + 90-Day Advisory Roadmap",
      price: "From AED 7,500",
      why: "Your gaps are too connected for one template. Contracts, policies, records, and manager processes should be rebuilt together so the business has one coherent HR baseline.",
      crossSell: emiratisationGap ? "Pair this with Emiratisation planning to avoid treating compliance and HR operations separately." : "Move into a light retainer after implementation to keep the new framework alive.",
    };
  }
  if ((dimScores.legal ?? 100) < 65 || (dimScores.docs ?? 100) < 65) {
    return {
      name: "HR Health Audit + Document Remediation",
      price: "From AED 4,500",
      why: "Your operating model is not broken, but legal and documentation gaps can become expensive during exits, disputes, or inspections.",
      crossSell: "Use the audit findings to decide whether you need the full HR Foundation Pack or targeted policy/document upgrades.",
    };
  }
  return {
    name: "HR Growth Retainer",
    price: "From AED 7,500/month",
    why: "Your foundations are stronger than most SMEs. A retainer gives you senior HR judgement on hiring, performance, pay, employee relations, and compliance as the business grows.",
    crossSell: "Add annual document review and market benchmarking to keep the function current.",
  };
}

export default function HRDiagnostic() {
  const topRef = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);
  const [company, setCompany] = useState<CompanyInfo>({ name: "", employees: "", emiratis: "", type: "" });
  const [currentDim, setCurrentDim] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState("");

  const isUae = company.type === "mainland" || company.type === "freezone";
  const activeDims = useMemo(() => DIAGNOSTIC_DIMS.map((d) => ({
    ...d,
    questions: d.questions.filter((q) => isUae || !q.text.toLowerCase().includes("emiratisation")),
  })).filter((d) => d.questions.length > 0), [isUae]);
  const dim = activeDims[currentDim];
  const totalQuestions = activeDims.reduce((sum, d) => sum + d.questions.length, 0);
  const answeredCount = Object.keys(answers).filter((key) => activeDims.some((d) => d.questions.some((_, i) => key === `${d.id}-${i}`))).length;
  const dimComplete = dim.questions.every((_, i) => answers[`${dim.id}-${i}`] !== undefined);

  const results = useMemo(() => {
    let total = 0;
    let max = 0;
    const dimScores: Record<string, number> = {};
    const risks: { dim: string; risk: string; why: string; colorClass: string; severity: "critical" | "high" }[] = [];

    activeDims.forEach((d) => {
      let dTotal = 0;
      let dMax = 0;
      d.questions.forEach((q, qi) => {
        const score = answers[`${d.id}-${qi}`] ?? 0;
        dTotal += score * q.weight;
        dMax += 3 * q.weight;
        if (score <= 1) risks.push({ dim: d.label, risk: q.risk, why: q.why, colorClass: d.colorClass, severity: score === 0 ? "critical" : "high" });
      });
      dimScores[d.id] = Math.round((dTotal / dMax) * 100);
      total += dTotal;
      max += dMax;
    });

    const overallPct = Math.round((total / max) * 100);
    return { overallPct, dimScores, risks };
  }, [activeDims, answers]);

  const start = () => {
    if (!company.name.trim() || !company.employees || !company.type || (isUae && company.emiratis === "")) {
      setError("Please complete company name, employee count, company type, and Emirati employee count where applicable.");
      return;
    }
    setError("");
    setStarted(true);
    window.setTimeout(() => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
  };

  const goNext = () => {
    if (currentDim < activeDims.length - 1) {
      setCurrentDim((v) => v + 1);
      window.setTimeout(() => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
    } else {
      setShowResults(true);
      window.setTimeout(() => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
    }
  };

  const reset = () => {
    setStarted(false);
    setCurrentDim(0);
    setAnswers({});
    setShowResults(false);
    setError("");
  };

  const downloadReport = () => {
    const profile = getProfile(results.overallPct);
    const recommendation = getRecommendation(results.dimScores, results.overallPct, results.risks.filter((r) => r.severity === "critical").length, isUae, Number(company.employees), Number(company.emiratis));
    const sections: PdfSection[] = [
      { title: "Company snapshot", body: [`Company: ${company.name}`, `Employees: ${company.employees}`, `Emirati employees: ${isUae ? company.emiratis || "0" : "Not applicable"}`, `Company type: ${company.type}`] },
      { title: "Overall result", body: `${results.overallPct}/100 — ${profile.label}. ${profile.desc}` },
      { title: "Scores by dimension", body: activeDims.map((d) => `- ${d.label}: ${results.dimScores[d.id]}%`) },
      { title: "Priority findings", body: results.risks.length ? [...results.risks].sort((a, b) => (a.severity === "critical" ? -1 : 1)).slice(0, 12).map((r) => `- ${r.dim}: ${r.risk} ${r.why}`) : "No critical or high-priority risks identified." },
      { title: "Recommended next step", body: `${recommendation.name} (${recommendation.price}). ${recommendation.why} ${recommendation.crossSell}` },
    ];
    downloadPdf({ title: "HR Health Diagnostic Report", subtitle: `${company.name} · ${results.overallPct}/100`, documentLabel: "HR Diagnostic · Free Report", companyName: company.name, sections, footerNote: "For a tailored version of this report, People.Studio can review evidence, quantify exposure, and build a practical 90-day HR roadmap." }, `${company.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-hr-diagnostic.pdf`);
  };

  if (!started) {
    return (
      <section ref={topRef} className="max-w-3xl">
        <div className="py-8 md:py-12">
          <div className="mb-5 flex items-center gap-3 font-dm text-[0.68rem] font-bold uppercase tracking-widest2 text-sienna before:h-px before:w-5 before:bg-sienna">
            People.Studio · Free Tool
          </div>
          <h2 className="mb-4 font-serif text-4xl font-normal leading-tight text-ink md:text-5xl">
            How healthy is<br />your HR, <em className="text-sienna">really?</em>
          </h2>
          <p className="mb-8 max-w-xl font-dm text-base font-light leading-8 text-ink/60">
            A practical diagnostic across HR compliance, documentation, talent, performance, compensation, and operations. Start with your company profile so the recommendations are relevant.
          </p>
          <div className="border border-ink/10 bg-clay/35 p-6">
            <div className="grid gap-5 md:grid-cols-2">
              <div><FieldLabel>Company name</FieldLabel><ToolInput value={company.name} onChange={(e) => setCompany((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. Acme Trading LLC" /></div>
              <div><FieldLabel>Number of employees</FieldLabel><ToolInput type="number" min={1} value={company.employees} onChange={(e) => setCompany((p) => ({ ...p, employees: e.target.value }))} placeholder="e.g. 75" /></div>
              <div><FieldLabel>Company type</FieldLabel><ToolSelect value={company.type} onChange={(e) => setCompany((p) => ({ ...p, type: e.target.value as CompanyType }))}><option value="">Select type</option><option value="mainland">UAE Mainland</option><option value="freezone">UAE Free Zone</option><option value="gcc">GCC — non UAE</option><option value="other">Other / outside GCC</option></ToolSelect></div>
              {isUae && <div><FieldLabel>Number of Emirati employees</FieldLabel><ToolInput type="number" min={0} value={company.emiratis} onChange={(e) => setCompany((p) => ({ ...p, emiratis: e.target.value }))} placeholder="e.g. 2" /></div>}
            </div>
            {error && <p className="mt-4 text-sm font-medium text-risk-red">{error}</p>}
            <button onClick={start} className="mt-6 bg-sienna px-9 py-4 font-dm text-sm font-bold uppercase tracking-wider2 text-paper transition-colors hover:bg-umber">
              Start the diagnostic →
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (showResults) {
    const profile = getProfile(results.overallPct);
    const sortedRisks = [...results.risks].sort((a, b) => (a.severity === b.severity ? 0 : a.severity === "critical" ? -1 : 1));
    const recommendation = getRecommendation(results.dimScores, results.overallPct, sortedRisks.filter((r) => r.severity === "critical").length, isUae, Number(company.employees), Number(company.emiratis));

    return (
      <section ref={topRef} className="max-w-3xl animate-fade-up">
        <div className="border-b border-ink/10 py-10 text-center">
          <div className="mb-5 font-dm text-[0.68rem] font-bold uppercase tracking-widest2 text-sienna">People.Studio · {company.name}</div>
          <h2 className="mb-6 font-serif text-4xl font-normal text-ink">Your HR Health Report</h2>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <div className={`font-serif text-7xl font-normal leading-none ${profile.color}`}>{results.overallPct}<span className="text-3xl text-ink/30">/100</span></div>
            <div className="max-w-sm text-left max-md:text-center">
              <div className={`mb-2 font-serif text-xl font-bold ${profile.color}`}>{profile.label}</div>
              <p className="font-dm text-sm leading-7 text-ink/60">{profile.desc}</p>
            </div>
          </div>
        </div>

        <div className="py-8">
          <h3 className="mb-4 font-dm text-xs font-bold uppercase tracking-wider2 text-ink/45">Scores by dimension</h3>
          <div className="space-y-1">
            {activeDims.map((d) => {
              const pct = results.dimScores[d.id];
              return (
                <div key={d.id} className="flex items-center gap-4 border-b border-ink/8 py-4">
                  <div className={`h-9 w-9 ${d.bgClass}`} />
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <span className="font-dm text-sm font-bold text-ink">{d.label}</span>
                      <span className={`font-dm text-sm font-bold ${d.colorClass}`}>{pct}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden bg-ink/10"><div className={`h-full ${d.bgClass.replace('/10','')}`} style={{ width: `${pct}%` }} /></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="pb-8">
          <h3 className="mb-3 font-dm text-xs font-bold uppercase tracking-wider2 text-ink/45">{sortedRisks.length} priority finding{sortedRisks.length === 1 ? "" : "s"}</h3>
          {sortedRisks.length ? sortedRisks.slice(0, 10).map((r, i) => (
            <div key={`${r.risk}-${i}`} className="flex gap-4 border-b border-ink/8 py-4">
              <div className={`w-1 flex-shrink-0 ${r.severity === "critical" ? "bg-risk-red" : "bg-risk-amber"}`} />
              <div>
                <div className={`mb-1 font-dm text-[0.68rem] font-bold uppercase tracking-wider2 ${r.colorClass}`}>{r.dim} · {r.severity}</div>
                <p className="mb-1 font-dm text-sm font-medium text-ink/85">{r.risk}</p>
                <p className="font-dm text-sm leading-6 text-ink/55">{r.why}</p>
              </div>
            </div>
          )) : <p className="border border-ink/10 bg-clay/35 p-5 font-dm text-sm text-ink/60">No critical or high-priority risks identified.</p>}
        </div>

        <div className="bg-clay/50 p-6">
          <h3 className="mb-2 font-serif text-xl font-bold text-ink">Recommended next step</h3>
          <p className="mb-5 font-dm text-sm leading-7 text-ink/60">The recommendation is based on the severity, spread, and type of gaps in your answers.</p>
          <div className="border border-sienna/25 bg-sienna/10 p-5">
            <div className="mb-2 font-dm text-[0.65rem] font-bold uppercase tracking-wider2 text-sienna">Upsell path</div>
            <div className="mb-1 font-serif text-base font-bold text-ink">{recommendation.name}</div>
            <p className="mb-3 font-dm text-sm leading-6 text-ink/65">{recommendation.why}</p>
            <p className="mb-3 font-dm text-sm leading-6 text-ink/65"><strong>Cross-sell:</strong> {recommendation.crossSell}</p>
            <div className="font-serif text-xl font-bold text-sienna">{recommendation.price}</div>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button onClick={downloadReport} className="bg-sienna px-6 py-3 font-dm text-xs font-bold uppercase tracking-wider2 text-paper hover:bg-umber">Download PDF report</button>
            <a href={`mailto:bmesiha@outlook.com?subject=HR Diagnostic — ${company.name} — ${results.overallPct}/100`} className="border border-sienna/25 px-6 py-3 font-dm text-xs font-bold uppercase tracking-wider2 text-sienna hover:bg-sienna/10">Book a free call</a>
            <button onClick={reset} className="border border-ink/15 px-6 py-3 font-dm text-xs font-bold uppercase tracking-wider2 text-ink/55 hover:text-ink">Retake</button>
          </div>
        </div>

        <UpsellStrip
          title="Your score is a starting point. Not a verdict."
          body="A 30-minute call with Bishoy costs nothing and leaves you with a clearer picture of what to fix first — and what it would cost to fix it properly."
          ctaLabel="Book a free 30-minute call →"
          ctaHref={BOOKING_URL}
          secondaryLabel="See what a full HR advisory engagement looks like →"
          secondaryHref="/business"
        />
      </section>
    );
  }

  return (
    <section ref={topRef} className="max-w-3xl">
      <div className="sticky top-[73px] z-20 mb-8 border border-ink/10 bg-paper/95 p-5 shadow-sm">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <span className={`font-dm text-xs font-bold uppercase tracking-wider2 ${dim.colorClass}`}>{dim.label} · Dimension {currentDim + 1} of {activeDims.length}</span>
          <span className="font-dm text-xs text-ink/45">{answeredCount} / {totalQuestions} answered</span>
        </div>
        <div className="mb-3 h-1 overflow-hidden bg-ink/10"><div className="h-full bg-sienna transition-all" style={{ width: `${(answeredCount / totalQuestions) * 100}%` }} /></div>
        <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${activeDims.length}, minmax(0, 1fr))` }}>{activeDims.map((d, i) => <div key={d.id} className={`h-1 ${i <= currentDim ? d.bgClass.replace('/10','') : 'bg-ink/10'}`} />)}</div>
      </div>

      <div className="mb-6 flex gap-5 border border-ink/10 bg-clay/35 p-6">
        <div className={`h-11 w-11 flex-shrink-0 ${dim.bgClass}`} />
        <div>
          <h2 className={`mb-2 font-serif text-lg font-bold ${dim.colorClass}`}>{dim.label}</h2>
          <p className="font-dm text-sm leading-7 text-ink/60">{dim.intro}</p>
        </div>
      </div>

      <div className="space-y-4">
        {dim.questions.map((q, qi) => {
          const selected = answers[`${dim.id}-${qi}`];
          return (
            <div key={q.text} className={`border p-6 transition-colors ${selected !== undefined ? 'border-sienna/30 bg-sienna/5' : 'border-ink/10 bg-paper'}`}>
              <div className={`mb-3 font-dm text-[0.68rem] font-bold uppercase tracking-wider2 ${dim.colorClass}`}>{dim.label} · Q{qi + 1}</div>
              <p className="mb-4 font-dm text-base font-medium leading-7 text-ink">{q.text}</p>
              <p className="mb-5 border-l-2 border-ink/15 bg-clay/35 px-4 py-3 font-dm text-sm leading-6 text-ink/55">{q.context}</p>
              <div className="grid gap-2 md:grid-cols-2">
                {q.options.map((opt) => (
                  <button
                    key={opt.label}
                    onClick={() => setAnswers((prev) => ({ ...prev, [`${dim.id}-${qi}`]: opt.score }))}
                    className={`border p-4 text-left transition-colors ${selected === opt.score ? 'border-sienna bg-sienna/10' : 'border-ink/10 bg-clay/20 hover:border-sienna/60'}`}
                  >
                    <span className="mb-1 block font-dm text-[0.62rem] font-bold uppercase tracking-wider2 text-sienna">{opt.rating}</span>
                    <span className="block font-dm text-sm leading-6 text-ink/70">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex items-center justify-between border-t border-ink/10 pt-6">
        <button onClick={() => { setCurrentDim((v) => Math.max(0, v - 1)); window.setTimeout(() => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 60); }} className="font-dm text-xs font-bold uppercase tracking-wider2 text-ink/45 hover:text-ink" style={{ visibility: currentDim === 0 ? 'hidden' : 'visible' }}>← Back</button>
        <div className="flex items-center gap-4">
          <span className="font-dm text-xs text-ink/45">{dimComplete ? "All answered" : "Complete this section"}</span>
          <button disabled={!dimComplete} onClick={goNext} className="bg-sienna px-6 py-3 font-dm text-xs font-bold uppercase tracking-wider2 text-paper transition-opacity hover:bg-umber disabled:cursor-not-allowed disabled:opacity-40">
            {currentDim < activeDims.length - 1 ? `Next: ${activeDims[currentDim + 1].label}` : "View my results"}
          </button>
        </div>
      </div>
      <SuggestionBox title="Want a different diagnostic?" subtitle="Tell me what you’re dealing with and I’ll build the right tool — or answer directly." placeholder="e.g. I want to check if my offboarding process is legally compliant..." />
    </section>
  );
}
