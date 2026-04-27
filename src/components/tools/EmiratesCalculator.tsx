import { useState } from "react";
import { TARGETED_SECTORS } from "@/data/tools";
import { FieldLabel, OutputBox, ToolInput, ToolSelect, UpsellStrip, SuggestionBox } from "./ToolPrimitives";

type Result = { required: number; gap: number; fine: number; status: string; note: string; freezone: boolean };

export default function EmiratesCalculator() {
  const [headcount, setHeadcount] = useState("");
  const [current, setCurrent] = useState("");
  const [sector, setSector] = useState("");
  const [companyType, setCompanyType] = useState("");
  const [result, setResult] = useState<Result | null>(null);

  const calculate = () => {
    const hc = parseInt(headcount, 10) || 0;
    const cur = parseInt(current, 10) || 0;
    if (!hc || !sector || !companyType) return;

    if (companyType === "freezone") {
      setResult({ required: 0, gap: 0, fine: 0, status: "Not applicable", freezone: true, note: "Free zone companies are currently exempt from mandatory Emiratisation quotas. If you expand to mainland, obligations may apply immediately." });
      return;
    }

    let required = 0;
    let finePerGap = 0;
    let note = "Under 20 employees — not currently subject to mandatory quotas. Participation in Nafis is still commercially useful.";

    if (hc >= 50) {
      required = Math.ceil(hc * 0.08);
      finePerGap = 84000;
      note = "Companies with 50+ mainland employees must reach 8% Emiratisation of skilled roles in 2025, rising to 10% by 2026. Fine exposure is calculated at AED 7,000 per month per unfilled position.";
    } else if (hc >= 20 && sector === "targeted") {
      required = 2;
      finePerGap = 108000;
      note = "Mainland companies with 20–49 employees in MoHRE-targeted sectors must hire 2 Emiratis by end of 2025. Fine exposure is AED 108,000 per unfilled obligation, collected in 2026.";
    } else if (hc >= 20) {
      note = "Your sector is not currently in the targeted 20–49 employee categories. Scope is expanding, so proactive Nafis planning is recommended.";
    }

    const gap = Math.max(0, required - cur);
    const fine = gap * finePerGap;
    setResult({ required, gap, fine, status: required === 0 ? "Not applicable" : gap === 0 ? "Compliant" : "Non-compliant", note, freezone: false });
  };

  return (
    <section className="max-w-3xl">
      <h2 className="mb-2 font-serif text-2xl font-normal text-ink">Emiratisation calculator</h2>
      <p className="mb-8 max-w-xl font-dm text-sm leading-7 text-ink/55">Enter your headcount and sector. Get your 2025 obligation, fine exposure in AED, and a plain-English next step.</p>

      <div className="border border-ink/10 bg-clay/35 p-6">
        <div className="grid gap-5 md:grid-cols-2">
          <div><FieldLabel>Total mainland employees</FieldLabel><ToolInput type="number" min={1} value={headcount} onChange={(e) => setHeadcount(e.target.value)} placeholder="e.g. 35" /></div>
          <div><FieldLabel>Current Emirati employees</FieldLabel><ToolInput type="number" min={0} value={current} onChange={(e) => setCurrent(e.target.value)} placeholder="e.g. 0" /></div>
          <div>
            <FieldLabel>Industry sector</FieldLabel>
            <ToolSelect value={sector} onChange={(e) => setSector(e.target.value)}>
              <option value="">Select sector</option>
              <option value="targeted">Targeted sector — 20–49 rule may apply</option>
              <option value="other">Other sector</option>
              {TARGETED_SECTORS.map((s) => <option key={s} value="targeted">{s}</option>)}
            </ToolSelect>
          </div>
          <div>
            <FieldLabel>Company type</FieldLabel>
            <ToolSelect value={companyType} onChange={(e) => setCompanyType(e.target.value)}>
              <option value="">Select type</option>
              <option value="mainland">Mainland</option>
              <option value="freezone">Free Zone</option>
            </ToolSelect>
          </div>
        </div>
        <button onClick={calculate} className="mt-6 bg-sienna px-7 py-4 font-dm text-xs font-bold uppercase tracking-wider2 text-paper transition-colors hover:bg-umber">Calculate my obligation</button>
      </div>

      {result && (
        <OutputBox label="Your Emiratisation picture — 2025">
          <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              [result.required || "N/A", "Emiratis required", "text-sienna"],
              [result.gap, "Current gap", result.gap ? "text-risk-red" : "text-risk-green"],
              [result.fine ? `AED ${result.fine.toLocaleString()}` : "AED 0", "Fine exposure", result.fine ? "text-risk-red" : "text-ink"],
              [result.status, "Compliance status", result.status === "Compliant" ? "text-risk-green" : result.status === "Non-compliant" ? "text-risk-red" : "text-ink/70"],
            ].map(([value, label, color]) => (
              <div key={String(label)} className="border border-ink/10 bg-paper p-4">
                <div className={`font-serif text-2xl font-bold ${color}`}>{value}</div>
                <div className="mt-1 font-dm text-xs text-ink/45">{label}</div>
              </div>
            ))}
          </div>
          <p className="font-dm text-sm leading-7 text-ink/70">{result.note}</p>
          <p className="mt-5 border-t border-ink/10 pt-4 font-dm text-xs leading-6 text-ink/45" style={{ fontWeight: 300 }}>
            <span className="font-bold uppercase tracking-wider text-ink/55" style={{ letterSpacing: "0.08em" }}>Disclaimer · </span>
            This calculator provides indicative figures based on publicly available MoHRE guidelines (last updated April 2026). It is not legal advice. Consult a qualified UAE employment lawyer for your specific obligations.
          </p>
          <UpsellStrip title="Want a full compliance plan?" body="I’ll review your setup, calculate Nafis subsidy angles, and give you a 90-day plan." href="/business#services" link="See Emiratisation Pack →" />
        </OutputBox>
      )}

      <SuggestionBox title="Need a different compliance calculation?" subtitle="Saudisation, Omanisation, or a different regulatory question? Tell me what you need." placeholder="e.g. I need a Saudisation calculator for my KSA office..." />
    </section>
  );
}
