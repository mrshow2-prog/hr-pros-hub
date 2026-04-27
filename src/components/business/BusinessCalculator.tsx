import { useState } from "react";
import { SECTORS, SECTOR_RATES } from "@/data/business";

interface CalcResult {
  freezone?: boolean;
  hc?: number;
  ce?: number;
  required?: number;
  gap?: number;
  fine?: number;
  compliant?: boolean;
  sector?: string;
  rate?: number;
}

export default function BusinessCalculator() {
  const [headcount, setHeadcount] = useState("");
  const [currentEmiratis, setCurrent] = useState("");
  const [sector, setSector] = useState("");
  const [isMainland, setIsMainland] = useState(true);
  const [result, setResult] = useState<CalcResult | null>(null);

  const calculate = () => {
    if (!isMainland) {
      setResult({ freezone: true });
      return;
    }
    const hc = parseInt(headcount) || 0;
    const ce = parseInt(currentEmiratis) || 0;
    const rate = SECTOR_RATES[sector] || 0.05;
    const required = Math.ceil(hc * rate);
    const gap = Math.max(0, required - ce);
    setResult({ hc, ce, required, gap, fine: gap * 108000, compliant: gap === 0, sector, rate });
  };

  return (
    <section id="calculator" className="px-6 md:px-20 py-24 bg-ink">
      <div className="max-w-3xl mx-auto">
        <div className="mb-12">
          <span className="font-dm font-bold text-xs uppercase block mb-4 text-terracotta" style={{ letterSpacing: "0.18em" }}>
            Emiratisation Calculator
          </span>
          <h2 className="font-serif font-bold mb-4 text-cream" style={{ fontSize: "clamp(2rem, 4vw, 2.8rem)", letterSpacing: "-0.02em" }}>
            What's your actual fine exposure?
          </h2>
          <p className="font-dm text-cream/50" style={{ fontWeight: 300 }}>
            No email. Instant calculation. Based on current MOHRE guidelines.
          </p>
        </div>

        <div
          className="p-6 md:p-8 mb-6"
          style={{ background: "hsl(var(--cream) / 0.04)", border: "1px solid hsl(var(--cream) / 0.08)" }}
        >
          <div className="flex gap-3 mb-8">
            {[true, false].map((val) => (
              <button
                key={String(val)}
                onClick={() => setIsMainland(val)}
                className="font-dm font-bold text-xs uppercase px-6 py-3 rounded-sm transition-colors"
                style={{
                  letterSpacing: "0.1em",
                  background: isMainland === val ? "hsl(var(--terracotta))" : "transparent",
                  color: isMainland === val ? "hsl(var(--cream))" : "hsl(var(--cream) / 0.45)",
                  border: `1px solid ${isMainland === val ? "hsl(var(--terracotta))" : "hsl(var(--cream) / 0.15)"}`,
                }}
              >
                {val ? "UAE Mainland" : "Free Zone"}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {[
              { label: "Total Mainland Headcount", val: headcount, set: setHeadcount, ph: "e.g. 35" },
              { label: "Current Emirati Employees", val: currentEmiratis, set: setCurrent, ph: "e.g. 2" },
            ].map((f) => (
              <div key={f.label}>
                <label className="font-dm font-bold text-xs uppercase block mb-2 text-cream/60" style={{ letterSpacing: "0.1em" }}>
                  {f.label}
                </label>
                <input
                  type="number"
                  value={f.val}
                  onChange={(e) => f.set(e.target.value)}
                  placeholder={f.ph}
                  className="w-full px-4 py-3 font-dm text-sm text-cream"
                  style={{
                    background: "hsl(var(--cream) / 0.05)",
                    border: "1px solid hsl(var(--cream) / 0.12)",
                    outline: "none",
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "hsl(var(--terracotta))")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "hsl(var(--cream) / 0.12)")}
                />
              </div>
            ))}
          </div>

          <div className="mb-2">
            <label className="font-dm font-bold text-xs uppercase block mb-2 text-cream/60" style={{ letterSpacing: "0.1em" }}>
              Industry Sector
            </label>
            <select
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className="w-full px-4 py-3 font-dm text-sm"
              style={{
                background: "hsl(var(--ink-elev))",
                border: "1px solid hsl(var(--cream) / 0.12)",
                color: sector ? "hsl(var(--cream))" : "hsl(var(--cream) / 0.35)",
                outline: "none",
              }}
            >
              <option value="">Select your sector</option>
              {SECTORS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={calculate}
          className="font-dm font-bold text-sm uppercase w-full py-4 rounded-sm transition-colors bg-terracotta hover:bg-terracotta-deep text-cream"
          style={{ letterSpacing: "0.08em" }}
        >
          Calculate My Exposure →
        </button>

        {result && (
          <div className="mt-6 p-6 md:p-8 animate-fade-up" style={{ background: "hsl(var(--cream) / 0.04)", border: "1px solid hsl(var(--terracotta) / 0.4)" }}>
            {result.freezone ? (
              <div>
                <p className="font-serif font-semibold text-xl text-cream mb-3">Free Zone businesses are exempt.</p>
                <p className="font-dm text-sm text-cream/55" style={{ fontWeight: 300 }}>
                  Emiratisation quotas currently apply to UAE Mainland businesses only.
                </p>
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {[
                    { label: "Required", value: result.required, h: false },
                    { label: "Current", value: result.ce, h: false },
                    { label: "Shortfall", value: result.gap, h: (result.gap ?? 0) > 0 },
                    { label: "Fine Exposure", value: (result.fine ?? 0) > 0 ? `AED ${(result.fine ?? 0).toLocaleString()}` : "AED 0", h: (result.fine ?? 0) > 0 },
                  ].map((m) => (
                    <div key={m.label}>
                      <div className={`font-serif font-bold text-2xl ${m.h ? "text-terracotta" : "text-cream"}`}>{m.value}</div>
                      <div className="font-dm text-xs uppercase mt-1 text-cream/45" style={{ letterSpacing: "0.08em" }}>
                        {m.label}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mb-5 pb-5" style={{ borderBottom: "1px solid hsl(var(--cream) / 0.1)" }}>
                  <p className={`font-serif font-semibold text-lg mb-2 ${result.compliant ? "text-emerald-400" : "text-terracotta-soft"}`}>
                    {result.compliant ? "✓ Compliant" : "⚠ Non-Compliant"}
                  </p>
                  <p className="font-dm text-sm text-cream/65" style={{ fontWeight: 300 }}>
                    {result.compliant
                      ? `You meet the ${Math.round((result.rate ?? 0) * 100)}% target for ${result.sector}.`
                      : `You need ${result.gap} more Emirati hire${(result.gap ?? 0) > 1 ? "s" : ""} (${Math.round((result.rate ?? 0) * 100)}% target). Fine: AED 108,000 per unfilled position per quarter.`}
                  </p>
                </div>

                {!result.compliant && (
                  <div className="flex flex-wrap gap-3">
                    <a
                      href="#contact"
                      className="font-dm font-bold text-xs uppercase px-6 py-3 rounded-sm bg-terracotta hover:bg-terracotta-deep text-cream transition-colors"
                      style={{ letterSpacing: "0.1em" }}
                    >
                      Get Emiratisation Pack → AED 3,500
                    </a>
                    <a
                      href="#contact"
                      className="font-dm font-bold text-xs uppercase px-6 py-3 rounded-sm text-terracotta-soft hover:text-cream transition-colors"
                      style={{ border: "1px solid hsl(var(--terracotta) / 0.4)", letterSpacing: "0.1em" }}
                    >
                      Schedule Free Call →
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
