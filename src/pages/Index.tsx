import { Link } from "react-router-dom";
import { CAREER_PILLS, SERVICE_PILLS } from "@/data/business";
import PsLogo from "@/components/ui/PsLogo";
import { COMPANY_EMAIL } from "@/lib/contact";

const Index = () => {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-paper text-ink font-dm">
      <header className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-center justify-between px-6 py-5 md:px-10 md:py-7">
        <PsLogo size="lg" className="pointer-events-auto" />
        <nav aria-label="Utility" className="pointer-events-auto flex items-center gap-5 font-dm text-[0.68rem] font-medium uppercase tracking-widest2 text-ink/55 md:gap-6">
          <Link to="/business#about" className="hidden transition-colors hover:text-ink md:text-paper/45 md:hover:text-paper sm:inline">About</Link>
          <a href={`mailto:${COMPANY_EMAIL}`} className="transition-colors hover:text-ink md:text-paper/65 md:hover:text-paper">Contact</a>
        </nav>
      </header>

      <main className="relative grid min-h-screen md:grid-cols-2">
        <section aria-labelledby="hr-head" className="relative flex min-h-[100svh] items-start overflow-hidden bg-paper px-6 pb-24 pt-28 md:px-10 md:pb-28 md:pt-[7.2rem] lg:px-24">
          <div className="relative z-10 flex w-full max-w-xl flex-col md:min-h-[calc(100svh-12.5rem)]">
            <div className="mb-9 flex items-center gap-3 font-dm text-[0.68rem] font-medium uppercase tracking-widest2 text-ink/55 before:block before:h-px before:w-7 before:bg-sienna">
              <span className="text-sienna">01</span>
              <span>HR Advisory</span>
            </div>

            <h1 id="hr-head" className="mb-7 max-w-xl font-serif text-[clamp(2.8rem,5.4vw,5.6rem)] font-normal leading-[0.98] text-ink text-balance md:min-h-[12rem] lg:min-h-0">
              Practical HR,<br />
              <span className="italic text-sienna">honestly</span> said<span className="inline-block h-[0.14em] w-[0.14em] rounded-full bg-sienna align-baseline" aria-hidden="true" />
            </h1>

            <p className="mb-9 max-w-md text-[1.05rem] font-light leading-8 text-ink md:min-h-[8rem] lg:min-h-0">
              For founders, GMs and owner-operators across the UAE and GCC. A senior HR practitioner — not a firm. No juniors, no decks, no eighty-page handbooks.
            </p>

            <div className="mb-11 flex min-h-[8.5rem] flex-wrap content-start gap-2 border-t border-ink/10 pt-7 md:min-h-[9.25rem] lg:min-h-0" aria-label="Service areas">
              <span className="mr-2 pt-1 font-dm text-[0.64rem] font-medium uppercase tracking-widest2 text-ink/55">Practice</span>
              {SERVICE_PILLS.map((p) => (
                <span key={p} className="rounded-sm border border-ink/20 px-2.5 py-1.5 text-xs tracking-wide text-ink">
                  {p}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-6">
              <Link to="/business" className="inline-flex min-h-12 items-center gap-2 rounded-md bg-sienna px-6 font-dm text-sm font-medium text-paper transition-colors hover:bg-umber focus:outline-none focus:ring-2 focus:ring-sienna focus:ring-offset-2 focus:ring-offset-paper">
                Enter HR Advisory <span aria-hidden="true">→</span>
              </Link>
              <Link to="/business#services" className="border-b border-transparent py-1 text-sm font-medium tracking-wide text-ink/60 transition-colors hover:border-ink hover:text-ink">
                See services
              </Link>
            </div>
          </div>

          <div className="absolute bottom-10 left-6 right-6 z-10 flex items-end justify-between gap-6 text-ink/55 md:left-16 md:right-16 lg:left-24 lg:right-24">
            <div>
              <span className="block font-serif text-3xl italic leading-none text-ink">16<span className="inline-block h-[0.12em] w-[0.12em] rounded-full bg-sienna align-baseline" /></span>
              <span className="mt-1 block text-[0.62rem] font-medium uppercase tracking-widest2">Years · executive HR · MENAT</span>
            </div>
            <p className="hidden max-w-56 text-right font-serif italic leading-5 md:block">For SMEs of 20–150 staff — the sweet spot.</p>
          </div>
        </section>

        <section aria-labelledby="cs-head" className="relative flex min-h-[100svh] items-start overflow-hidden bg-olive px-6 pb-24 pt-28 text-paper md:px-10 md:pb-28 md:pt-[7.2rem] lg:px-24">
          <div className="relative z-10 flex w-full max-w-xl flex-col md:ml-auto md:min-h-[calc(100svh-12.5rem)]">
            <div className="mb-9 flex items-center gap-3 font-dm text-[0.68rem] font-medium uppercase tracking-widest2 text-paper/65 before:block before:h-px before:w-7 before:bg-blush">
              <span className="text-blush">02</span>
              <span>Career Studio</span>
            </div>

            <h2 id="cs-head" className="mb-7 max-w-xl font-serif text-[clamp(2.8rem,5.4vw,5.6rem)] font-normal leading-[0.98] text-paper text-balance md:min-h-[12rem] lg:min-h-0">
              Your career,<br />
              <span className="italic text-blush">considered</span><span className="inline-block h-[0.14em] w-[0.14em] rounded-full bg-blush align-baseline" aria-hidden="true" />
            </h2>

            <p className="mb-9 max-w-md text-[1.05rem] font-light leading-8 text-paper/90 md:min-h-[8rem] lg:min-h-0">
              For HR and people professionals across the UAE and GCC who are ready to take their next step seriously. CV, LinkedIn, and coaching — written by an HR director, not a copywriter.
            </p>

            <div className="mb-11 flex min-h-[8.5rem] flex-wrap content-start gap-2 border-t border-paper/15 pt-7 md:min-h-[9.25rem] lg:min-h-0" aria-label="Career services">
              <span className="mr-2 pt-1 font-dm text-[0.64rem] font-medium uppercase tracking-widest2 text-paper/60">Studio</span>
              {CAREER_PILLS.map((p) => (
                <span key={p} className="rounded-sm border border-paper/25 px-2.5 py-1.5 text-xs tracking-wide text-paper/90">
                  {p}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-6">
              <Link to="/career" className="inline-flex min-h-12 items-center gap-2 rounded-md bg-blush px-6 font-dm text-sm font-medium text-ink transition-colors hover:bg-clay focus:outline-none focus:ring-2 focus:ring-blush focus:ring-offset-2 focus:ring-offset-olive">
                Enter Career Studio <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>

          <div className="absolute bottom-10 left-6 right-6 z-10 flex items-end justify-between gap-6 text-paper/60 md:left-16 md:right-16 lg:left-24 lg:right-24">
            <div>
              <span className="block font-serif text-3xl italic leading-none text-paper">11<span className="inline-block h-[0.12em] w-[0.12em] rounded-full bg-blush align-baseline" /></span>
              <span className="mt-1 block text-[0.62rem] font-medium uppercase tracking-widest2">Markets · MENAT</span>
            </div>
            <p className="hidden max-w-64 text-right font-serif italic leading-5 md:block">For people who know they're worth more — and want to say so, without slogans.</p>
          </div>
        </section>

        <div className="pointer-events-none absolute inset-y-0 left-1/2 z-20 hidden w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-ink/15 to-transparent md:block" aria-hidden="true" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-20 hidden h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center md:grid" aria-hidden="true">
          <svg className="absolute inset-0 h-full w-full animate-[spin_28s_linear_infinite] overflow-visible" viewBox="0 0 112 112" role="img">
            <defs>
              <path id="choose-circle" d="M56,56 m-34,0 a34,34 0 1,1 68,0 a34,34 0 1,1 -68,0" />
            </defs>
            <text className="fill-ink/55 font-dm text-[0.62rem] font-semibold uppercase tracking-[0.12em]">
              <textPath href="#choose-circle" startOffset="50%" textAnchor="middle">
                Choose one · or the other ·
              </textPath>
            </text>
          </svg>
          <span className="h-3 w-3 rounded-full bg-sienna shadow-[0_0_0_6px_hsl(var(--paper)/0.82)]" />
        </div>
      </main>

      <footer className="absolute inset-x-0 bottom-0 z-30 flex flex-wrap items-center justify-between gap-3 px-6 py-5 font-dm text-[0.66rem] font-medium uppercase tracking-wider2 text-ink/50 md:px-10">
        <div className="flex gap-5">
          <Link to="/tools" className="transition-colors hover:text-ink">Free Tools</Link>
        </div>
        <span className="hidden text-paper/45 md:inline">© People.Studio</span>
      </footer>
    </div>
  );
};

export default Index;
