import { Link } from "react-router-dom";
import { HERO_STATS } from "@/data/business";

export default function BusinessHero() {
  return (
    <section
      className="min-h-screen flex flex-col justify-center pt-32 pb-20 px-6 md:px-20 relative overflow-hidden bg-paper"
    >
      {/* Layered backdrop */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {/* Warm radial wash + diagonal gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,hsl(var(--clay)/0.85),transparent_42%),radial-gradient(circle_at_12%_88%,hsl(var(--terracotta)/0.10),transparent_38%),linear-gradient(135deg,hsl(var(--paper))_0%,hsl(var(--paper))_55%,hsl(var(--clay)/0.55)_100%)]" />

        {/* Floating document cards (HR artifacts) */}
        <div className="absolute right-[6%] top-[14%] h-44 w-32 rotate-[8deg] border border-ink/10 bg-paper shadow-[0_24px_60px_-30px_hsl(var(--ink)/0.35)] md:h-64 md:w-48">
          <div className="mx-3 mt-4 h-1.5 w-10 bg-terracotta/70" />
          <div className="mx-3 mt-3 space-y-1.5">
            <div className="h-px bg-ink/15" />
            <div className="h-px w-5/6 bg-ink/15" />
            <div className="h-px w-2/3 bg-ink/15" />
            <div className="h-px w-4/5 bg-ink/15" />
            <div className="h-px w-3/5 bg-ink/15" />
          </div>
        </div>
        <div className="absolute right-[22%] top-[8%] h-40 w-28 rotate-[-6deg] border border-ink/10 bg-clay/60 backdrop-blur-sm md:h-56 md:w-40">
          <div className="mx-3 mt-4 h-1.5 w-8 bg-ink/30" />
          <div className="mx-3 mt-3 space-y-1.5">
            <div className="h-px bg-ink/15" />
            <div className="h-px w-3/4 bg-ink/15" />
            <div className="h-px w-5/6 bg-ink/15" />
          </div>
        </div>
        <div className="absolute right-[38%] top-[26%] hidden h-32 w-44 rotate-[3deg] border border-ink/10 bg-paper/80 backdrop-blur-sm md:block md:h-40 md:w-56">
          <div className="mx-3 mt-3 h-1 w-12 bg-terracotta/60" />
          <div className="mx-3 mt-3 grid grid-cols-3 gap-1.5">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="h-1.5 bg-ink/10" />
            ))}
          </div>
        </div>

        {/* Faint dotted grid (structure) */}
        <div className="absolute inset-0 [background-image:radial-gradient(hsl(var(--ink)/0.12)_1px,transparent_1px)] [background-size:28px_28px] [mask-image:radial-gradient(ellipse_70%_60%_at_75%_30%,black_30%,transparent_75%)]" />

        {/* Org-chart "broken → fixed" SVG */}
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1200 800" fill="none" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <path d="M180 560 L 320 560 L 320 660 L 460 660" stroke="hsl(var(--ink) / 0.18)" strokeWidth="1" strokeDasharray="4 8" />
          <path d="M180 560 L 320 560 L 320 460 L 480 460" stroke="hsl(var(--terracotta))" strokeWidth="1.4" />
          <circle cx="180" cy="560" r="3.5" fill="hsl(var(--terracotta))" />
          <circle cx="320" cy="460" r="3" fill="hsl(var(--terracotta))" />
          <circle cx="480" cy="460" r="4" fill="hsl(var(--terracotta))" />
          <circle cx="320" cy="660" r="2.5" fill="hsl(var(--ink) / 0.25)" />
          <circle cx="460" cy="660" r="2.5" fill="hsl(var(--ink) / 0.25)" />
          <path d="M470 452 l 6 6 l 12 -14" stroke="hsl(var(--terracotta))" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>

        {/* Bottom fade so content stays readable */}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-paper to-transparent" />
      </div>

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
