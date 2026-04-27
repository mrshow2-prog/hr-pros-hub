import { Link } from "react-router-dom";
import { HERO_STATS } from "@/data/business";

export default function BusinessHero() {
  return (
    <section
      className="min-h-screen flex flex-col justify-center pt-32 pb-20 px-6 md:px-20 relative overflow-hidden bg-paper"
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent 0%, transparent 58%, hsl(var(--clay) / 0.55) 100%)" }}
      />

      <div className="max-w-4xl relative z-10 mx-auto md:mx-0">
        <span className="font-dm font-bold text-xs uppercase block mb-7 text-terracotta" style={{ letterSpacing: "0.18em" }}>
          HR Advisory · UAE & GCC
        </span>
        <h1
          className="font-serif font-normal leading-[0.98] mb-7 text-ink"
          style={{ fontSize: "clamp(3rem, 7vw, 6rem)" }}
        >
          Your HR is probably broken.
          <br />
          <em className="text-terracotta" style={{ fontStyle: "italic" }}>Let's fix it.</em>
        </h1>
        <p className="font-dm mb-10 max-w-xl leading-relaxed text-ink/70" style={{ fontSize: "1.1rem", fontWeight: 300 }}>
          Most UAE SMEs are one labour claim away from a serious problem. We find the gaps before they cost you.
        </p>

        <div className="flex flex-wrap gap-4 mb-20">
          <a
            href="#diagnostic"
            className="font-dm font-bold text-sm uppercase px-8 py-4 rounded-sm transition-colors duration-200 bg-terracotta hover:bg-terracotta-deep text-cream"
            style={{ letterSpacing: "0.06em" }}
          >
            Run the Free Diagnostic →
          </a>
          <Link
            to="/tools"
            className="font-dm font-bold text-sm uppercase px-8 py-4 rounded-sm transition-colors duration-200 text-terracotta hover:bg-ink hover:text-paper"
            style={{ letterSpacing: "0.06em", border: "1px solid hsl(var(--terracotta) / 0.35)" }}
          >
            Free HR Tools
          </Link>
        </div>

        <div className="flex flex-col md:flex-row" style={{ borderTop: "1px solid hsl(var(--ink) / 0.1)" }}>
          {HERO_STATS.map((s, i) => (
            <div
              key={i}
              className="flex-1 py-8 md:pr-8"
              style={{ borderRight: i < HERO_STATS.length - 1 ? "1px solid hsl(var(--ink) / 0.1)" : "none" }}
            >
              <div className="font-serif font-bold mb-2 text-terracotta" style={{ fontSize: "2rem", letterSpacing: "-0.02em" }}>
                {s.value}
              </div>
              <div className="font-dm text-sm text-ink/50" style={{ fontWeight: 300 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
