import { useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { BISHOY_SECTIONS, type BishoySection, type IconKey } from "@/data/bishoy";
import bishoyPortrait from "@/assets/bishoy-portrait.jpg";

// --- Inline pixel-style SVG icons for the orbit nodes -----------------------
const Icon = ({ k, color }: { k: IconKey; color: string }) => {
  const common = { width: 28, height: 28, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (k) {
    case "compass":
      return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M15 9l-2 5-5 2 2-5z" fill={color} fillOpacity={0.25} /></svg>;
    case "refresh":
      return <svg {...common}><path d="M3 12a9 9 0 0 1 15-6.7L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-15 6.7L3 16" /><path d="M3 21v-5h5" /></svg>;
    case "target":
      return <svg {...common}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.5" fill={color} /></svg>;
    case "scales":
      return <svg {...common}><path d="M12 3v18" /><path d="M5 7h14" /><path d="M5 7l-2 6a3 3 0 0 0 6 0z" /><path d="M19 7l-2 6a3 3 0 0 0 6 0z" /></svg>;
    case "diamond":
      return <svg {...common}><path d="M6 3h12l4 6-10 12L2 9z" /><path d="M2 9h20" /><path d="M12 3l-4 6 4 12 4-12z" /></svg>;
    case "robot":
      return <svg {...common}><rect x="4" y="7" width="16" height="12" rx="2" /><circle cx="9" cy="13" r="1.3" fill={color} /><circle cx="15" cy="13" r="1.3" fill={color} /><path d="M12 3v4" /><path d="M9 17h6" /></svg>;
    case "shield":
      return <svg {...common}><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" /><path d="M9 12l2 2 4-4" /></svg>;
    case "cap":
      return <svg {...common}><path d="M2 9l10-4 10 4-10 4z" /><path d="M6 11v5c2 1.5 4 2.5 6 2.5s4-1 6-2.5v-5" /></svg>;
  }
};

// --- Orbit positioning ------------------------------------------------------
// Place 8 nodes evenly on a circle, starting at the top.
function orbitPosition(index: number, total: number, radius: number) {
  const angle = (index / total) * Math.PI * 2 - Math.PI / 2;
  return { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius };
}

// --- Hash sync hook ---------------------------------------------------------
function useHashSection(): [string | null, (slug: string | null) => void] {
  const [slug, setSlug] = useState<string | null>(() =>
    typeof window === "undefined" ? null : window.location.hash.replace(/^#/, "") || null
  );

  useEffect(() => {
    const onHash = () => setSlug(window.location.hash.replace(/^#/, "") || null);
    window.addEventListener("hashchange", onHash);
    window.addEventListener("popstate", onHash);
    return () => {
      window.removeEventListener("hashchange", onHash);
      window.removeEventListener("popstate", onHash);
    };
  }, []);

  const setHash = (next: string | null) => {
    if (next) {
      window.history.pushState(null, "", `#${next}`);
    } else {
      window.history.pushState(null, "", window.location.pathname + window.location.search);
    }
    setSlug(next);
  };

  return [slug, setHash];
}

// --- Components -------------------------------------------------------------
const Topbar = () => (
  <div className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between bg-black/80 px-6 py-3 text-[0.65rem] uppercase tracking-[0.25em] text-white/70 backdrop-blur md:px-10" style={{ fontFamily: "'DM Sans', system-ui, sans-serif", letterSpacing: "0.25em" }}>
    <a href="/career" className="flex items-center gap-1 text-white transition-colors hover:text-amber-300">
      <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "1rem", letterSpacing: "-0.02em", textTransform: "lowercase" }}>people</span>
      <span className="text-amber-400">·</span>
      <span className="text-[0.55rem] tracking-[0.3em]">STUDIO</span>
    </a>
    <a href="/career" className="hidden text-white/60 transition-colors hover:text-amber-300 md:block">
      Want a profile like this? →
    </a>
    <a href="/career" className="text-white/60 transition-colors hover:text-amber-300 md:hidden">
      Get yours →
    </a>
  </div>
);

const Footer = () => (
  <section className="border-t border-white/10 bg-black px-6 py-20 text-center md:py-28" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
    <div className="mx-auto max-w-2xl">
      <span className="mb-5 inline-block text-[0.6rem] font-bold uppercase tracking-[0.3em] text-amber-400">Want a profile like this?</span>
      <h2 className="mb-5 text-3xl font-normal leading-tight text-white md:text-5xl" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
        Stand out in a way<br />recruiters <em className="not-italic text-amber-400">remember</em>.
      </h2>
      <p className="mx-auto mb-8 max-w-md text-sm leading-7 text-white/60 md:text-base">
        people·STUDIO designs and builds web profiles for senior leaders who want their experience to land — instantly.
      </p>
      <a href="/career" className="inline-block bg-amber-500 px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] text-black transition-colors hover:bg-amber-400">
        Build your profile →
      </a>
      <div className="mt-8 text-[0.65rem] uppercase tracking-[0.2em] text-white/40">
        Designed &amp; built by <a href="/career" className="text-amber-400 hover:text-amber-300">people·STUDIO</a>
      </div>
    </div>
  </section>
);

const OrbitNode = ({
  section,
  pos,
  active,
  onClick,
}: {
  section: BishoySection;
  pos: { x: number; y: number };
  active: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className="group absolute -translate-x-1/2 -translate-y-1/2 transition-transform duration-300 hover:scale-110"
    style={{ left: `calc(50% + ${pos.x}px)`, top: `calc(50% + ${pos.y}px)` }}
    aria-label={`Open ${section.label}`}
  >
    <div
      className="flex h-[110px] w-[110px] flex-col items-center justify-center rounded-full border-2 bg-black/70 backdrop-blur transition-all duration-300 md:h-[130px] md:w-[130px]"
      style={{
        borderColor: section.ringColor,
        boxShadow: active
          ? `0 0 28px ${section.ringColor}, 0 0 48px ${section.ringColor}55, inset 0 0 16px ${section.ringColor}33`
          : `0 0 14px ${section.ringColor}55`,
      }}
    >
      <div className="mb-1.5"><Icon k={section.iconKey} color={section.ringColor} /></div>
      <span
        className="px-2 text-center text-[0.62rem] font-bold uppercase tracking-[0.12em] text-white md:text-[0.68rem]"
        style={{ fontFamily: "'DM Sans', system-ui, sans-serif", lineHeight: 1.2 }}
      >
        {section.label}
      </span>
    </div>
  </button>
);

const Panel = ({ section, onClose }: { section: BishoySection; onClose: () => void }) => (
  <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/85 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose}>
    <div
      className="relative my-10 w-full max-w-3xl border bg-gradient-to-b from-black via-zinc-950 to-black p-8 md:p-12"
      style={{ borderColor: `${section.ringColor}66`, boxShadow: `0 0 40px ${section.ringColor}33` }}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={onClose}
        className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center border border-white/20 text-white/60 transition-colors hover:border-white/60 hover:text-white"
        aria-label="Close panel"
      >
        ✕
      </button>

      <div className="mb-6 flex items-center gap-4">
        <div
          className="flex h-14 w-14 items-center justify-center rounded-full border-2"
          style={{ borderColor: section.ringColor, boxShadow: `0 0 20px ${section.ringColor}66` }}
        >
          <Icon k={section.iconKey} color={section.ringColor} />
        </div>
        <div>
          <div className="text-[0.6rem] font-bold uppercase tracking-[0.3em]" style={{ color: section.ringColor, fontFamily: "'DM Sans', system-ui, sans-serif" }}>
            Service · Bishoy Mesiha
          </div>
          <h2 className="mt-1 text-2xl font-normal text-white md:text-4xl" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
            {section.heading}
          </h2>
        </div>
      </div>

      <p className="mb-5 text-base font-light italic text-white/85 md:text-lg" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
        {section.tagline}
      </p>
      <p className="mb-8 text-sm leading-7 text-white/65 md:text-base md:leading-8" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
        {section.body}
      </p>

      <div className="mb-8 flex flex-wrap gap-2">
        {section.bullets.map((b) => (
          <span
            key={b}
            className="border px-3 py-1.5 text-[0.7rem] font-medium uppercase tracking-wider text-white/80"
            style={{ borderColor: `${section.ringColor}55`, backgroundColor: `${section.ringColor}11`, fontFamily: "'DM Sans', system-ui, sans-serif" }}
          >
            {b}
          </span>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 border-t border-white/10 pt-6">
        <a
          href={`mailto:bmesiha@outlook.com?subject=${encodeURIComponent(`${section.heading} — enquiry`)}`}
          className="px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] text-black transition-opacity hover:opacity-90"
          style={{ backgroundColor: section.ringColor, fontFamily: "'DM Sans', system-ui, sans-serif" }}
        >
          Discuss this →
        </a>
        <button
          onClick={onClose}
          className="border border-white/20 px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] text-white/70 transition-colors hover:border-white/60 hover:text-white"
          style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
        >
          ← Back to profile
        </button>
      </div>
    </div>
  </div>
);

// --- Page -------------------------------------------------------------------
export default function BishoyMesiha() {
  const [hashSlug, setHashSlug] = useHashSection();
  const orbitRef = useRef<HTMLDivElement>(null);
  const [radius, setRadius] = useState(240);

  // Responsive orbit radius
  useEffect(() => {
    const recalc = () => {
      const w = window.innerWidth;
      if (w < 640) setRadius(140);
      else if (w < 1024) setRadius(210);
      else setRadius(260);
    };
    recalc();
    window.addEventListener("resize", recalc);
    return () => window.removeEventListener("resize", recalc);
  }, []);

  const activeSection = useMemo(
    () => BISHOY_SECTIONS.find((s) => s.slug === hashSlug) ?? null,
    [hashSlug]
  );

  // Lock body scroll while panel is open
  useEffect(() => {
    if (activeSection) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev; };
    }
  }, [activeSection]);

  return (
    <div className="min-h-screen bg-black text-white" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <Helmet>
        <title>Bishoy Mesiha · 360° HR Leader | people·STUDIO</title>
        <meta name="description" content="Bishoy Mesiha — senior HR leader covering strategy, OD & change, employee relations, total rewards, compliance, learning & development, and HR digital transformation across UAE, KSA and the wider GCC." />
        <link rel="canonical" href="https://people-studio.lovable.app/Bishoy-Mesiha" />
      </Helmet>

      <Topbar />

      {/* Hero / Orbit */}
      <section className="relative overflow-hidden pt-24 pb-16 md:pt-28 md:pb-24">
        {/* Background gradient + grid */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(245,158,11,0.07),_transparent_60%)]" />

        <div className="mx-auto max-w-5xl px-6 text-center">
          <div className="mb-3 text-[0.6rem] font-bold uppercase tracking-[0.35em] text-amber-400">
            Bishoy Mesiha
          </div>
          <h1 className="mb-4 text-3xl font-normal leading-tight text-white md:text-5xl" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
            <em className="not-italic text-amber-400">360°</em> HR Leader
          </h1>
          <p className="mx-auto max-w-xl text-sm leading-7 text-white/55 md:text-base">
            Senior HR across strategy, operations, compliance, rewards and transformation — UAE, KSA and the wider GCC. Tap any orbit to explore.
          </p>
        </div>

        {/* Orbit */}
        <div
          ref={orbitRef}
          className="relative mx-auto mt-12"
          style={{ width: `${(radius + 70) * 2}px`, height: `${(radius + 70) * 2}px`, maxWidth: "100%" }}
        >
          {/* Concentric rings */}
          <div className="pointer-events-none absolute inset-0">
            {[1, 0.78, 0.55, 0.32].map((r, i) => (
              <div
                key={i}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-500/15"
                style={{ width: `${(radius + 70) * 2 * r}px`, height: `${(radius + 70) * 2 * r}px` }}
              />
            ))}
            {/* Cross lines */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-amber-500/20 to-transparent" />
            <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
          </div>

          {/* Center portrait */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div
              className="flex h-[170px] w-[170px] flex-col items-center justify-end overflow-hidden rounded-full border-2 border-amber-400 bg-black md:h-[200px] md:w-[200px]"
              style={{ boxShadow: "0 0 40px rgba(245,158,11,0.4), inset 0 0 20px rgba(0,0,0,0.6)" }}
            >
              <img
                src={bishoyPortrait}
                alt="Bishoy Mesiha"
                className="absolute inset-0 h-full w-full object-cover"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              <div className="relative z-10 pb-4 text-center">
                <div className="text-base font-bold leading-tight text-white md:text-lg" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
                  Bishoy<br />Mesiha
                </div>
                <div className="mt-1 text-[0.55rem] font-bold uppercase tracking-[0.25em] text-amber-400">
                  360° HR Leader
                </div>
              </div>
            </div>
          </div>

          {/* Orbit nodes */}
          {BISHOY_SECTIONS.map((s, i) => {
            const pos = orbitPosition(i, BISHOY_SECTIONS.length, radius);
            return (
              <OrbitNode
                key={s.slug}
                section={s}
                pos={pos}
                active={hashSlug === s.slug}
                onClick={() => setHashSlug(s.slug)}
              />
            );
          })}
        </div>
      </section>

      {/* Static section list — accessible + SEO + linkable anchors */}
      <section className="border-t border-white/10 bg-zinc-950 px-6 py-20 md:py-28">
        <div className="mx-auto max-w-4xl">
          <div className="mb-10 text-center">
            <div className="mb-2 text-[0.6rem] font-bold uppercase tracking-[0.3em] text-amber-400">Capabilities</div>
            <h2 className="text-3xl font-normal text-white md:text-4xl" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
              Eight dimensions of senior HR.
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {BISHOY_SECTIONS.map((s) => (
              <button
                key={s.slug}
                onClick={() => setHashSlug(s.slug)}
                className="group flex items-start gap-4 border border-white/10 bg-black/40 p-5 text-left transition-all hover:border-white/30"
                style={{ boxShadow: `inset 3px 0 0 ${s.ringColor}` }}
              >
                <div className="mt-0.5 flex-shrink-0"><Icon k={s.iconKey} color={s.ringColor} /></div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 text-base font-bold text-white" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>{s.heading}</div>
                  <p className="text-xs leading-6 text-white/55">{s.tagline}</p>
                </div>
                <span className="flex-shrink-0 text-xs text-white/30 transition-colors group-hover:text-white/80">→</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <Footer />

      {activeSection && <Panel section={activeSection} onClose={() => setHashSlug(null)} />}
    </div>
  );
}
