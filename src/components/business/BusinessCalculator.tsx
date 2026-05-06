import { useState } from "react";
import { SECTORS, SECTOR_RATES } from "@/data/business";
import { T, useTr, useLang, pick } from "@/i18n/T";

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
  const tr = useTr();
  const lang = useLang();
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
            <T en="Emiratisation Calculator" ar="حاسبة التوطين" />
          </span>
          <h2 className="font-serif font-bold mb-4 text-cream" style={{ fontSize: "clamp(2rem, 4vw, 2.8rem)", letterSpacing: "-0.02em" }}>
            <T en="What's your actual fine exposure?" ar="ما هو تعرّضك الفعلي للغرامات؟" />
          </h2>
          <p className="font-dm text-cream/50" style={{ fontWeight: 300 }}>
            <T en="No email. Instant calculation. Based on current MOHRE guidelines." ar="بلا بريد إلكتروني. حساب فوري. وفق إرشادات وزارة الموارد البشرية الحالية." />
          </p>
        </div>

        <div className="p-6 md:p-8 mb-6" style={{ background: "hsl(var(--cream) / 0.04)", border: "1px solid hsl(var(--cream) / 0.08)" }}>
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
                {val ? tr("UAE Mainland", "البر الرئيسي للإمارات") : tr("Free Zone", "المنطقة الحرة")}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {[
              { label: tr("Total Mainland Headcount", "إجمالي الموظفين في البر الرئيسي"), val: headcount, set: setHeadcount, ph: tr("e.g. 35", "مثال: 35") },
              { label: tr("Current Emirati Employees", "عدد الموظفين الإماراتيين الحالي"), val: currentEmiratis, set: setCurrent, ph: tr("e.g. 2", "مثال: 2") },
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
                  style={{ background: "hsl(var(--cream) / 0.05)", border: "1px solid hsl(var(--cream) / 0.12)", outline: "none" }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "hsl(var(--terracotta))")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "hsl(var(--cream) / 0.12)")}
                />
              </div>
            ))}
          </div>

          <div className="mb-2">
            <label className="font-dm font-bold text-xs uppercase block mb-2 text-cream/60" style={{ letterSpacing: "0.1em" }}>
              <T en="Industry Sector" ar="القطاع الصناعي" />
            </label>
            <select
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className="w-full px-4 py-3 font-dm text-sm"
              style={{ background: "hsl(var(--ink-elev))", border: "1px solid hsl(var(--cream) / 0.12)", color: sector ? "hsl(var(--cream))" : "hsl(var(--cream) / 0.35)", outline: "none" }}
            >
              <option value="">{tr("Select your sector", "اختر القطاع")}</option>
              {SECTORS.map((s) => (
                <option key={s.en} value={s.en}>
                  {pick(s, lang)}
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
          <T en="Calculate My Exposure →" ar="احسب تعرّضي ←" />
        </button>

        {result && (
          <div className="mt-6 p-6 md:p-8 animate-fade-up" style={{ background: "hsl(var(--cream) / 0.04)", border: "1px solid hsl(var(--terracotta) / 0.4)" }}>
            {result.freezone ? (
              <div>
                <p className="font-serif font-semibold text-xl text-cream mb-3"><T en="Free Zone businesses are exempt." ar="شركات المناطق الحرّة مُعفاة." /></p>
                <p className="font-dm text-sm text-cream/55" style={{ fontWeight: 300 }}>
                  <T en="Emiratisation quotas currently apply to UAE Mainland businesses only." ar="حصص التوطين تنطبق حاليًا على شركات البر الرئيسي للإمارات فقط." />
                </p>
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {[
                    { label: tr("Required", "المطلوب"), value: result.required, h: false },
                    { label: tr("Current", "الحالي"), value: result.ce, h: false },
                    { label: tr("Shortfall", "العجز"), value: result.gap, h: (result.gap ?? 0) > 0 },
                    { label: tr("Fine Exposure", "تعرّض الغرامة"), value: (result.fine ?? 0) > 0 ? `AED ${(result.fine ?? 0).toLocaleString()}` : "AED 0", h: (result.fine ?? 0) > 0 },
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
                    {result.compliant ? tr("✓ Compliant", "✓ مُمتثِل") : tr("⚠ Non-Compliant", "⚠ غير مُمتثِل")}
                  </p>
                  <p className="font-dm text-sm text-cream/65" style={{ fontWeight: 300 }}>
                    {result.compliant
                      ? lang === "ar"
                        ? `أنت تستوفي هدف ${Math.round((result.rate ?? 0) * 100)}٪ لقطاع ${result.sector}.`
                        : `You meet the ${Math.round((result.rate ?? 0) * 100)}% target for ${result.sector}.`
                      : lang === "ar"
                      ? `تحتاج ${result.gap} موظفًا إماراتيًا إضافيًا (هدف ${Math.round((result.rate ?? 0) * 100)}٪). الغرامة: 108,000 درهم لكل وظيفة شاغرة لكل ربع سنة.`
                      : `You need ${result.gap} more Emirati hire${(result.gap ?? 0) > 1 ? "s" : ""} (${Math.round((result.rate ?? 0) * 100)}% target). Fine: AED 108,000 per unfilled position per quarter.`}
                  </p>
                </div>

                {!result.compliant && (
                  <div className="flex flex-wrap gap-3">
                    <a href="#contact" className="font-dm font-bold text-xs uppercase px-6 py-3 rounded-sm bg-terracotta hover:bg-terracotta-deep text-cream transition-colors" style={{ letterSpacing: "0.1em" }}>
                      <T en="Get Emiratisation Pack → AED 3,500" ar="احصل على حزمة التوطين ← 3,500 درهم" />
                    </a>
                    <a href="#contact" className="font-dm font-bold text-xs uppercase px-6 py-3 rounded-sm text-terracotta-soft hover:text-cream transition-colors" style={{ border: "1px solid hsl(var(--terracotta) / 0.4)", letterSpacing: "0.1em" }}>
                      <T en="Schedule Free Call →" ar="احجز مكالمة مجانية ←" />
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
