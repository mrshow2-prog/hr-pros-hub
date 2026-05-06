import { AUDIENCE_SEGMENTS } from "@/data/business";
import { T, pick, useLang } from "@/i18n/T";

export default function BusinessAudience() {
  const lang = useLang();
  return (
    <section id="audience" className="px-6 md:px-20 py-24 bg-cream">
      <div className="max-w-6xl mx-auto">
        <div className="mb-14">
          <span className="font-dm font-bold text-xs uppercase block mb-4 text-terracotta" style={{ letterSpacing: "0.18em" }}>
            <T en="Who This Is For" ar="لمن هذا" />
          </span>
          <h2 className="font-serif font-bold text-ink" style={{ fontSize: "clamp(2rem, 4vw, 3rem)", letterSpacing: "-0.02em", maxWidth: "16ch" }}>
            <T en="Who this is for" ar="لمن هذا" />
          </h2>
          <p className="font-serif text-ink/80 mt-6 text-lg md:text-xl leading-relaxed">
            <T en="You've probably been here before." ar="على الأرجح أنك مررت بهذا من قبل." />
            <br />
            <T en="I have too." ar="وأنا كذلك." />
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {AUDIENCE_SEGMENTS.map((s, i) => (
            <div
              key={i}
              className="p-8 transition-colors duration-300 bg-white flex flex-col"
              style={{ borderTop: "2px solid transparent" }}
              onMouseEnter={(e) => (e.currentTarget.style.borderTopColor = "hsl(var(--terracotta))")}
              onMouseLeave={(e) => (e.currentTarget.style.borderTopColor = "transparent")}
            >
              <div className="text-2xl mb-4">{s.icon}</div>
              <span className="font-dm font-bold text-xs uppercase block mb-3 text-terracotta" style={{ letterSpacing: "0.1em" }}>
                {pick(s.tag, lang)}
              </span>
              <h3 className="font-serif font-semibold text-lg mb-3 leading-snug text-ink">{pick(s.headline, lang)}</h3>
              <p className="font-dm text-sm leading-relaxed text-moss flex-1" style={{ fontWeight: 300 }}>
                {pick(s.body, lang)}
              </p>
              {s.footer && (
                <div className="mt-6 pt-4 border-t border-ink/10 font-dm text-[11px] uppercase tracking-[0.15em] text-ink/60">
                  {pick(s.footer, lang)}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
