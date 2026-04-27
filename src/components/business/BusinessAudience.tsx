import { AUDIENCE_SEGMENTS } from "@/data/business";

export default function BusinessAudience() {
  return (
    <section id="audience" className="px-6 md:px-20 py-24 bg-cream">
      <div className="max-w-6xl mx-auto">
        <div className="mb-14">
          <span className="font-dm font-bold text-xs uppercase block mb-4 text-terracotta" style={{ letterSpacing: "0.18em" }}>
            Who This Is For
          </span>
          <h2
            className="font-serif font-bold text-ink"
            style={{ fontSize: "clamp(2rem, 4vw, 3rem)", letterSpacing: "-0.02em", maxWidth: "16ch" }}
          >
            Built for businesses that can't afford to get HR wrong.
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {AUDIENCE_SEGMENTS.map((s, i) => (
            <div
              key={i}
              className="p-8 transition-colors duration-300 bg-white"
              style={{ borderTop: "2px solid transparent" }}
              onMouseEnter={(e) => (e.currentTarget.style.borderTopColor = "hsl(var(--terracotta))")}
              onMouseLeave={(e) => (e.currentTarget.style.borderTopColor = "transparent")}
            >
              <div className="text-2xl mb-4">{s.icon}</div>
              <span className="font-dm font-bold text-xs uppercase block mb-3 text-terracotta" style={{ letterSpacing: "0.1em" }}>
                {s.tag}
              </span>
              <h3 className="font-serif font-semibold text-lg mb-3 leading-snug text-ink">{s.headline}</h3>
              <p className="font-dm text-sm leading-relaxed text-moss" style={{ fontWeight: 300 }}>
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
