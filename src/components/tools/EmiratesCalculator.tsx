import { useState } from "react";
import { TARGETED_SECTORS } from "@/data/tools";
import { FieldLabel, OutputBox, ToolInput, ToolSelect, UpsellStrip, SuggestionBox } from "./ToolPrimitives";

type Breakdown = { label: string; amount: number; sublabel?: string };

type Result = {
  required: number;
  gap: number;
  exposure: number;
  exposureLabel: string;
  status: string;
  note: string;
  freezone: boolean;
  breakdown: Breakdown[];
};

const aed = (n: number) => `AED ${n.toLocaleString()}`;

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
      setResult({
        required: 0,
        gap: 0,
        exposure: 0,
        exposureLabel: "Contribution exposure",
        status: "Not applicable",
        freezone: true,
        breakdown: [],
        note: "Most UAE free zones are currently exempt from Emiratisation requirements. However, this exemption is policy-based, not statutory, and several free zones are progressively aligning with mainland standards. Verify with your free zone authority.",
      });
      return;
    }

    let required = 0;
    let exposure = 0;
    let exposureLabel = "Contribution exposure";
    let breakdown: Breakdown[] = [];
    let note = "Under 20 employees — not currently subject to mandatory quotas. Participation in Nafis is still commercially useful.";

    if (hc >= 50) {
      required = Math.ceil(hc * 0.08);
      const gap = Math.max(0, required - cur);
      const annual2025 = gap * 8000 * 12;
      exposure = annual2025;
      exposureLabel = "2025 contribution exposure";
      breakdown = gap
        ? [
            { label: "2024 rate", amount: gap * 7000 * 12, sublabel: "AED 7,000 / month per unfilled position" },
            { label: "2025 rate (current)", amount: annual2025, sublabel: "AED 8,000 / month per unfilled position" },
            { label: "2026 rate (projected)", amount: gap * 9000 * 12, sublabel: "AED 9,000 / month per unfilled position" },
          ]
        : [];
      note = "Companies with 50+ mainland employees must reach 8% Emiratisation of skilled roles in 2025, rising to 10% by 2026. The monthly contribution is AED 8,000 per unfilled position in 2025 — up from AED 7,000 in 2024 and increasing to AED 9,000 in 2026.";
    } else if (hc >= 20 && sector === "targeted") {
      required = 2;
      const gap = Math.max(0, required - cur);
      const c2024 = gap * 96000;
      const c2025 = gap * 108000;
      exposure = c2024 + c2025;
      exposureLabel = "Total exposure (2024 + 2025)";
      breakdown = gap
        ? [
            { label: "2024 contribution", amount: c2024, sublabel: "AED 96,000 per unfilled position · collected Jan 2025" },
            { label: "2025 contribution", amount: c2025, sublabel: "AED 108,000 per unfilled position · collected Jan 2026" },
          ]
        : [];
      note = "Mainland companies with 20–49 employees in MoHRE-targeted sectors must hire 2 Emiratis per year. MoHRE refers to non-compliance amounts as annual financial contributions, not fines. The 2024 contribution of AED 96,000 per unfilled position was collected in January 2025; the 2025 contribution rises to AED 108,000 per unfilled position, collectible in January 2026.";
    } else if (hc >= 20) {
      note = "Your sector is not currently in the targeted 20–49 employee categories. Scope is expanding, so proactive Nafis planning is recommended.";
    }

    const gap = Math.max(0, required - cur);
    setResult({
      required,
      gap,
      exposure,
      exposureLabel,
      status: required === 0 ? "Not applicable" : gap === 0 ? "Compliant" : "Non-compliant",
      note,
      freezone: false,
      breakdown,
    });
  };

  return (
    <section className="max-w-3xl">
      <h2 className="mb-2 font-serif text-2xl font-normal text-ink">Emiratisation calculator</h2>
      <p className="mb-8 max-w-xl font-dm text-sm leading-7 text-ink/55">Enter your headcount and sector. Get your 2025 obligation, contribution exposure in AED, and a plain-English next step.</p>

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
              [result.exposure ? aed(result.exposure) : "AED 0", result.exposureLabel, result.exposure ? "text-risk-red" : "text-ink"],
              [result.status, "Compliance status", result.status === "Compliant" ? "text-risk-green" : result.status === "Non-compliant" ? "text-risk-red" : "text-ink/70"],
            ].map(([value, label, color]) => (
              <div key={String(label)} className="border border-ink/10 bg-paper p-4">
                <div className={`font-serif text-2xl font-bold ${color}`}>{value}</div>
                <div className="mt-1 font-dm text-xs text-ink/45">{label}</div>
              </div>
            ))}
          </div>

          {result.breakdown.length > 0 && (
            <div className="mb-5 border border-ink/10 bg-paper p-5">
              <p className="mb-3 font-dm text-[11px] font-bold uppercase text-ink/55" style={{ letterSpacing: "0.12em" }}>
                Annual financial contributions — breakdown
              </p>
              <ul className="divide-y divide-ink/10">
                {result.breakdown.map((b) => (
                  <li key={b.label} className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0">
                    <div>
                      <div className="font-dm text-sm font-bold text-ink">{b.label}</div>
                      {b.sublabel && (
                        <div className="mt-0.5 font-dm text-xs text-ink/50" style={{ fontWeight: 300 }}>
                          {b.sublabel}
                        </div>
                      )}
                    </div>
                    <div className="font-serif text-lg font-bold text-sienna whitespace-nowrap">{aed(b.amount)}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="font-dm text-sm leading-7 text-ink/70">{result.note}</p>
          <p className="mt-5 border-t border-ink/10 pt-4 font-dm text-xs leading-6 text-ink/45" style={{ fontWeight: 300 }}>
            <span className="font-bold uppercase tracking-wider text-ink/55" style={{ letterSpacing: "0.08em" }}>Disclaimer · </span>
            Figures based on MoHRE Cabinet Decision (Ministerial Decision No. 455 of 2023). Last verified: April 2026. This calculator provides indicative figures only and is not legal advice. Consult a qualified UAE employment lawyer for your specific obligations.
          </p>
          <UpsellStrip title="Want a full compliance plan?" body="I’ll review your setup, calculate Nafis subsidy angles, and give you a 90-day plan." href="/business#services" link="See Emiratisation Pack →" />
        </OutputBox>
      )}

      <SuggestionBox title="Need a different compliance calculation?" subtitle="Saudisation, Omanisation, or a different regulatory question? Tell me what you need." placeholder="e.g. I need a Saudisation calculator for my KSA office..." />
    </section>
  );
}
