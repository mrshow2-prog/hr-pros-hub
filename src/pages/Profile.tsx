import { useEffect } from "react";
import { Link } from "react-router-dom";
import FadeIn from "@/components/cv/FadeIn";
import MetricsTicker from "@/components/cv/MetricsTicker";
import ExperienceMap from "@/components/cv/ExperienceMap";
import Timeline from "@/components/cv/Timeline";
import SkillBars from "@/components/cv/SkillBars";
import SEO from "@/components/seo/SEO";
import { ACHIEVEMENTS, EDUCATION, LANGUAGES, PHOTO_URL, PROFILE_STATS, PUBLICATIONS } from "@/data/profile";

const PRINT_CSS = `
@media print {
  @page { size: A4; margin: 12mm 16mm; }
  * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  .no-print, .sticky-hero, .sidebar-panel, .metrics-ticker, .map-section { display: none !important; }
  .main-layout { display: block !important; }
  .content-area { width: 100% !important; }
  body { background: #fff !important; color: #1a1714 !important; }
  section { page-break-inside: avoid; }
}`;

export default function Profile() {
  useEffect(() => {
    const el = document.createElement("style");
    el.id = "cv-print-styles";
    el.textContent = PRINT_CSS;
    document.head.appendChild(el);
    return () => {
      document.getElementById("cv-print-styles")?.remove();
    };
  }, []);

  return (
    <div className="bg-cream text-ink font-dm min-h-screen">
      <SEO
        title="Signature CV Sample · People.Studio Career Studio"
        description="See a live example of a People.Studio Signature CV — a hosted personal brand page for senior professionals across the UAE and GCC."
        path="/profile"
      />
      {/* Sample profile notice */}
      <div className="no-print sticky top-0 z-40 border-b border-ink/10 bg-blush text-ink">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-6 py-2.5 md:px-10">
          <span
            className="inline-flex shrink-0 items-center rounded-sm bg-ink px-2 py-1 font-dm text-[10px] font-bold uppercase text-paper"
            style={{ letterSpacing: "0.12em" }}
          >
            Notice
          </span>
          <p className="font-dm text-xs leading-5 text-ink/85 sm:text-sm">
            <span className="font-bold">Sample profile</span> — fictional persona for illustration only.
          </p>
        </div>
      </div>
      {/* Stable hero */}
      <section className="sticky-hero relative min-h-[100svh] overflow-hidden bg-olive text-paper">
        <div className="absolute top-0 left-0 right-0 z-10 px-6 md:px-10 py-3 flex items-center justify-between gap-4 border-b border-paper/15">
          <Link to="/career" className="font-dm text-[10px] uppercase text-paper/65 transition-colors hover:text-paper" style={{ letterSpacing: "0.14em" }}>
            ← Career Studio
          </Link>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <button
              onClick={() => window.print()}
              className="font-dm font-bold text-[10px] uppercase px-2.5 py-1.5 rounded-sm text-paper/75 hover:text-paper transition-colors sm:px-3"
              style={{ border: "1px solid hsl(var(--paper) / 0.22)", letterSpacing: "0.08em" }}
            >
              Export PDF
            </button>
            <Link
              to="/career#contact"
              className="font-dm font-bold text-[10px] uppercase px-2.5 py-1.5 rounded-sm bg-blush text-ink hover:bg-clay transition-colors sm:px-3"
              style={{ letterSpacing: "0.08em" }}
            >
              Commission yours →
            </Link>
          </div>
        </div>

        <div className="grid min-h-[100svh] md:grid-cols-2">
          <div className="relative hidden min-h-[100svh] md:block">
            <img src={PHOTO_URL} alt="Sarah Mahmoud — HR Director" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-olive" />
          </div>

          <div className="flex items-center px-6 py-28 md:px-12 lg:px-16">
            <div className="max-w-xl">
              <span className="font-dm text-[10px] uppercase text-blush mb-5 block" style={{ letterSpacing: "0.2em" }}>
                Signature CV · peoplestudio.ae/cv/sarah-mahmoud
              </span>
              <h1
                className="font-serif font-normal text-paper leading-[0.96] mb-5"
                style={{ fontSize: "clamp(3rem, 6vw, 5.4rem)" }}
              >
                Sarah
                <br />
                Mahmoud
              </h1>
              <p className="font-serif italic text-paper/90 mb-3 text-lg">HR Director · Talent Strategy · GCC & MENA</p>
              <p className="font-dm text-sm text-paper/60 mb-6">📍 Dubai, UAE</p>

              <p className="font-serif italic text-paper/80 mb-8 leading-relaxed border-l-2 border-blush/50 pl-4" style={{ fontSize: "1.05rem" }}>
                "I build the people infrastructure that makes ambitious companies possible — then I make sure it lasts."
              </p>

              <div className="grid grid-cols-2 gap-4 mb-8 sm:grid-cols-4 sm:gap-5">
                {PROFILE_STATS.map((s) => (
                  <div key={s.label} className="min-w-0">
                    <div className="font-serif font-normal text-2xl text-paper">
                      {s.value}
                    </div>
                    <div className="font-dm text-[0.62rem] text-paper/50 uppercase mt-1 leading-4" style={{ letterSpacing: "0.08em" }}>
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                <a
                  href="mailto:sarah@example.com"
                  className="font-dm font-bold text-xs uppercase px-6 py-3 rounded-sm bg-blush hover:bg-clay text-ink transition-colors"
                  style={{ letterSpacing: "0.1em" }}
                >
                  Get in touch →
                </a>
                <a
                  href="https://linkedin.com"
                  className="font-dm font-bold text-xs uppercase px-6 py-3 rounded-sm text-paper/80 hover:text-paper transition-colors"
                  style={{ border: "1px solid hsl(var(--paper) / 0.25)", letterSpacing: "0.1em" }}
                >
                  LinkedIn
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ticker */}
      <div className="metrics-ticker">
        <MetricsTicker />
      </div>

      {/* Main layout */}
      <div className="main-layout grid lg:grid-cols-[320px_1fr]">
        {/* Sticky sidebar */}
        <aside className="sidebar-panel hidden lg:block bg-navy-deep p-10 border-r border-navy-soft/15">
          <div className="sticky top-24">
            <img src={PHOTO_URL} alt="" className="w-32 h-32 rounded-full object-cover mb-6" />
            <h2 className="font-serif font-bold text-cream text-xl mb-1">Sarah Mahmoud</h2>
            <p className="font-dm text-sm text-cream/60 mb-1">HR Director · GCC & MENA</p>
            <p className="font-dm text-xs text-cream/45 mb-6">📍 Dubai, UAE</p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {PROFILE_STATS.map((s) => (
                <div key={s.label}>
                  <div className="font-serif font-bold text-lg text-cream">{s.value}</div>
                  <div className="font-dm text-[10px] text-cream/45 uppercase" style={{ letterSpacing: "0.08em" }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>

            <a href="mailto:sarah@example.com" className="font-dm text-xs text-cream/55 block mb-1 hover:text-cream transition-colors">
              sarah@example.com
            </a>
            <a href="https://linkedin.com" className="font-dm text-xs text-navy-soft block mb-4 hover:text-cream transition-colors">
              linkedin.com/in/sarah-mahmoud
            </a>

            <a
              href="mailto:sarah@example.com"
              className="font-dm font-bold text-xs uppercase block text-center px-4 py-3 rounded-sm bg-navy hover:bg-navy-soft text-cream transition-colors mb-2"
              style={{ letterSpacing: "0.08em" }}
            >
              Get in touch →
            </a>
            <button
              onClick={() => window.print()}
              className="font-dm font-bold text-xs uppercase w-full px-4 py-3 rounded-sm text-cream/70 hover:text-cream transition-colors"
              style={{ border: "1px solid hsl(var(--cream) / 0.15)", letterSpacing: "0.08em" }}
            >
              Export PDF
            </button>
          </div>
        </aside>

        {/* Scrollable content */}
        <div className="content-area">
          {/* About */}
          <FadeIn>
            <section className="px-6 md:px-14 py-16 bg-white border-b border-ink/5">
              <span className="font-dm font-bold text-xs uppercase block mb-8 text-navy" style={{ letterSpacing: "0.18em" }}>
                About
              </span>
              <div className="max-w-2xl space-y-4">
                {[
                  "With over 14 years building people functions across MENA's most demanding environments, I've learned that great HR isn't about process — it's about enabling the ambitions of the people around you.",
                  "I've built HR from scratch in 3 greenfield businesses, restructured teams across 6 markets, and advised boards on everything from succession planning to Emiratisation strategy.",
                  "Currently seeking a CHRO or VP People role with a growth-stage business in the UAE or KSA. Most effective where the stakes are high and the team is ready to move fast.",
                ].map((p, i) => (
                  <p key={i} className="font-dm text-moss leading-relaxed" style={{ fontWeight: 300 }}>
                    {p}
                  </p>
                ))}
              </div>
            </section>
          </FadeIn>

          {/* Achievements */}
          <FadeIn>
            <section className="px-6 md:px-14 py-16 bg-cream-warm border-b border-ink/5">
              <span className="font-dm font-bold text-xs uppercase block mb-8 text-navy" style={{ letterSpacing: "0.18em" }}>
                Key Achievements
              </span>
              <div className="grid sm:grid-cols-2 gap-4">
                {ACHIEVEMENTS.map((a) => (
                  <div key={a.value} className="bg-white p-6" style={{ borderTop: "2px solid hsl(var(--navy))" }}>
                    <div className="font-serif font-bold text-3xl text-navy mb-2" style={{ letterSpacing: "-0.03em" }}>
                      {a.value}
                    </div>
                    <p className="font-dm text-sm text-moss leading-relaxed" style={{ fontWeight: 300 }}>
                      {a.label}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </FadeIn>

          {/* Timeline */}
          <FadeIn>
            <section className="px-6 md:px-14 py-16 bg-white border-b border-ink/5">
              <span className="font-dm font-bold text-xs uppercase block mb-8 text-navy" style={{ letterSpacing: "0.18em" }}>
                Career Timeline
              </span>
              <Timeline />
            </section>
          </FadeIn>

          {/* Publications */}
          <FadeIn>
            <section className="px-6 md:px-14 py-16 bg-cream-warm border-b border-ink/5">
              <span className="font-dm font-bold text-xs uppercase block mb-8 text-navy" style={{ letterSpacing: "0.18em" }}>
                Publications & Thought Leadership
              </span>
              <div className="grid md:grid-cols-2 gap-4">
                {PUBLICATIONS.map((pub) => (
                  <a
                    key={pub.title}
                    href={pub.url}
                    className="bg-white p-6 block transition-colors duration-300"
                    style={{ borderTop: "2px solid hsl(var(--navy) / 0.2)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderTopColor = "hsl(var(--navy))")}
                    onMouseLeave={(e) => (e.currentTarget.style.borderTopColor = "hsl(var(--navy) / 0.2)")}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className="font-dm font-bold text-xs text-navy">{pub.source}</span>
                      <span className="font-dm text-xs text-ink/35">· {pub.date}</span>
                    </div>
                    <h3 className="font-serif font-semibold text-base text-ink mb-2 leading-snug">{pub.title}</h3>
                    <p className="font-dm text-sm text-moss leading-relaxed" style={{ fontWeight: 300 }}>
                      {pub.excerpt}
                    </p>
                    <span className="font-dm text-xs font-bold text-navy block mt-4">Read article →</span>
                  </a>
                ))}
              </div>
            </section>
          </FadeIn>

          {/* Map */}
          <FadeIn>
            <section className="map-section px-6 md:px-14 py-16 bg-white border-b border-ink/5">
              <span className="font-dm font-bold text-xs uppercase block mb-2 text-navy" style={{ letterSpacing: "0.18em" }}>
                Experience Footprint
              </span>
              <p className="font-dm text-sm text-ink/45 mb-6" style={{ fontWeight: 300 }}>
                Hover each pin to explore years of experience.
              </p>
              <ExperienceMap />
            </section>
          </FadeIn>

          {/* Skills */}
          <FadeIn>
            <section className="px-6 md:px-14 py-16 bg-cream-warm border-b border-ink/5">
              <span className="font-dm font-bold text-xs uppercase block mb-8 text-navy" style={{ letterSpacing: "0.18em" }}>
                Core Skills
              </span>
              <SkillBars />
            </section>
          </FadeIn>

          {/* Education + Languages */}
          <FadeIn>
            <section className="px-6 md:px-14 py-16 bg-white border-b border-ink/5">
              <div className="grid md:grid-cols-2 gap-12">
                <div>
                  <span className="font-dm font-bold text-xs uppercase block mb-6 text-navy" style={{ letterSpacing: "0.18em" }}>
                    Education & Certifications
                  </span>
                  {EDUCATION.map((e) => (
                    <div
                      key={e.title}
                      className="flex gap-4 items-start py-4"
                      style={{ borderTop: "1px solid hsl(var(--navy) / 0.1)" }}
                    >
                      <div className="font-serif font-bold text-sm text-navy min-w-[2.5rem]">{e.year}</div>
                      <div>
                        <div className="font-dm font-bold text-sm text-ink">{e.title}</div>
                        <div className="font-dm text-xs text-moss mt-0.5" style={{ fontWeight: 300 }}>
                          {e.school}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div>
                  <span className="font-dm font-bold text-xs uppercase block mb-6 text-navy" style={{ letterSpacing: "0.18em" }}>
                    Languages
                  </span>
                  {LANGUAGES.map((l) => (
                    <div key={l.lang} className="mb-5">
                      <div className="flex justify-between mb-2">
                        <span className="font-dm font-bold text-sm text-ink">{l.lang}</span>
                        <span className="font-dm text-xs text-moss" style={{ fontWeight: 300 }}>
                          {l.level}
                        </span>
                      </div>
                      <div className="flex gap-1.5">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className="w-2.5 h-2.5 rounded-full"
                            style={{
                              background: i < l.dots ? "hsl(var(--navy))" : "hsl(var(--navy) / 0.12)",
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </FadeIn>

          {/* Contact */}
          <section className="px-6 md:px-14 py-16 bg-navy-deep">
            <span className="font-dm font-bold text-xs uppercase block mb-6 text-navy-soft" style={{ letterSpacing: "0.18em" }}>
              Get in Touch
            </span>
            <div className="flex flex-wrap gap-x-8 gap-y-3">
              <a href="mailto:sarah@example.com" className="font-dm font-bold text-cream hover:underline">
                sarah@example.com
              </a>
              <a href="https://linkedin.com" className="font-dm font-bold text-navy-soft hover:underline">
                linkedin.com/in/sarah-mahmoud
              </a>
              <span className="font-dm font-bold text-cream/35">Dubai, UAE</span>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
