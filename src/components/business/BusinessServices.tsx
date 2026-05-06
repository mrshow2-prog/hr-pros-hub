import { SERVICES } from "@/data/business";
import { BOOKING_HREF } from "@/lib/contact";

export default function BusinessServices() {
  return (
    <section id="services" className="px-6 md:px-20 py-24 bg-ink">
      <div className="max-w-6xl mx-auto">
        <div className="mb-14 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="font-dm font-bold text-xs uppercase block mb-4 text-terracotta" style={{ letterSpacing: "0.18em" }}>
              Services
            </span>
            <h2 className="font-serif font-bold text-cream" style={{ fontSize: "clamp(2rem, 4vw, 3rem)", letterSpacing: "-0.02em" }}>
              Fixed prices.
              <br />
              No surprises.
            </h2>
          </div>
          <p className="font-dm max-w-xs text-cream/45" style={{ fontWeight: 300 }}>
            Every engagement starts with a free 30-minute call to confirm scope and fit.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px" style={{ background: "hsl(var(--cream) / 0.06)" }}>
          {SERVICES.map((s, i) => (
            <div
              key={i}
              className="p-8 flex flex-col transition-colors duration-300 bg-ink"
              onMouseEnter={(e) => (e.currentTarget.style.background = "hsl(var(--terracotta) / 0.06)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "hsl(var(--ink))")}
            >
              <span className="font-dm font-bold text-xs uppercase block mb-5 text-terracotta" style={{ letterSpacing: "0.12em" }}>
                {s.tag}
              </span>
              <h3 className="font-serif font-semibold text-lg mb-3 leading-snug text-cream">{s.name}</h3>
              <div className="mb-4">
                {s.price.startsWith("From ") && (
                  <span className="font-dm text-xs mr-1.5 text-cream/35" style={{ fontWeight: 300 }}>
                    From
                  </span>
                )}
                <span className="font-serif font-bold text-2xl text-terracotta-soft" style={{ letterSpacing: "-0.02em" }}>
                  {s.price.startsWith("From ") ? s.price.slice(5) : s.price}
                </span>
                <span className="font-dm text-xs ml-2 text-cream/35" style={{ fontWeight: 300 }}>
                  {s.priceNote}
                </span>
              </div>
              <p className="font-dm text-sm mb-5 leading-relaxed flex-1 text-cream/55" style={{ fontWeight: 300 }}>
                {s.desc}
              </p>
              <ul className="space-y-2 mb-8">
                {s.deliverables.map((d, j) => (
                  <li key={j} className="font-dm text-sm flex gap-2 text-cream/65">
                    <span className="text-terracotta flex-shrink-0">→</span> {d}
                  </li>
                ))}
              </ul>
              <a
                href={BOOKING_HREF}
                target="_blank"
                rel="noopener noreferrer"
                className="font-dm font-bold text-xs uppercase px-5 py-3 text-center rounded-sm transition-colors duration-200 mt-auto text-terracotta-soft hover:bg-terracotta hover:text-cream"
                style={{ border: "1px solid hsl(var(--terracotta) / 0.35)", letterSpacing: "0.1em" }}
              >
                Book a Call →
              </a>
            </div>
          ))}
        </div>

        <div className="mt-20 pt-14 border-t border-cream/10">
          <div className="grid md:grid-cols-12 gap-10">
            <div className="md:col-span-4">
              <span className="font-dm font-bold text-xs uppercase block mb-4 text-terracotta" style={{ letterSpacing: "0.18em" }}>
                Also available
              </span>
              <h3 className="font-serif font-semibold text-cream leading-tight" style={{ fontSize: "clamp(1.5rem, 2.4vw, 2rem)", letterSpacing: "-0.02em" }}>
                We also support your business with:
              </h3>
            </div>
            <div className="md:col-span-8 grid sm:grid-cols-2 gap-px" style={{ background: "hsl(var(--cream) / 0.06)" }}>
              {[
                { name: "Saudization (Nitaqat) Readiness", desc: "Strategic tier mapping, MHRSD compliance, Hadaf (HRDF) subsidy maximization, and Qiwa/GOSI data alignment for KSA expansion." },
                { name: "Talent Mapping", desc: "Competitor intelligence and future-leader pipelining." },
                { name: "Performance Management", desc: "Transitioning teams to high-output cultures." },
                { name: "Engagement & Atmosphere", desc: "Discrete strategies for workspace transformation and custom in-office team building." },
                { name: "Employee Relations", desc: "Expert guidance on sensitive labor disputes and terminations." },
                { name: "KSA & Regional Expansion", desc: "Scaling your people operations across the GCC." },
              ].map((item, i) => (
                <div key={i} className="p-6 bg-ink flex gap-4">
                  <span className="text-terracotta font-dm flex-shrink-0">→</span>
                  <div>
                    <h4 className="font-serif font-semibold text-cream text-base mb-1.5">{item.name}</h4>
                    <p className="font-dm text-sm leading-relaxed text-cream/55" style={{ fontWeight: 300 }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
