import { Link } from "react-router-dom";
import { CAREER_PILLS, SERVICE_PILLS } from "@/data/business";
import PsLogo from "@/components/ui/PsLogo";
import SEO from "@/components/seo/SEO";
import { COMPANY_EMAIL } from "@/lib/contact";
import businessBg from "@/assets/index-business-bg.jpg";
import careerBg from "@/assets/index-career-bg.jpg";
import { T, pick, useLang } from "@/i18n/T";
import { useLocalizedPath } from "@/i18n/useLocalizedPath";
import LanguageToggle from "@/components/ui/LanguageToggle";

const Index = () => {
  const lang = useLang();
  const { localize } = useLocalizedPath();
  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-paper text-ink font-dm md:h-[100svh] md:min-h-[100svh] md:overflow-hidden">
      <SEO
        title="People.Studio — HR Advisory & Career Studio · UAE & GCC"
        description="Senior HR advisory and career coaching for UAE and GCC. Emiratisation, HR setup, org design, CV and LinkedIn — by Bishoy Mesiha."
        path="/"
      />
      {/* Header */}
      <header className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-center justify-between px-6 py-5 md:px-10 md:py-6">
        <PsLogo size="lg" className="pointer-events-auto" />
        <nav
          aria-label="Utility"
          className="pointer-events-auto flex items-center gap-5 font-dm text-[0.68rem] font-medium uppercase tracking-widest2 text-ink/65 md:gap-6"
        >
          <Link
            to={localize("/business#about")}
            className="hidden transition-colors hover:text-ink md:text-paper/70 md:hover:text-paper sm:inline"
          >
            <T en="About" ar="من نحن" />
          </Link>
          <a
            href={`mailto:${COMPANY_EMAIL}`}
            className="transition-colors hover:text-ink md:text-paper/80 md:hover:text-paper"
          >
            <T en="Contact" ar="تواصل" />
          </a>
          <LanguageToggle tone="ink" className="md:[--tw-text-opacity:0.55] md:text-paper/70 md:hover:text-paper" />
        </nav>
      </header>

      {/* Main split layout */}
      <main
        className="
          relative grid w-full
          grid-cols-1
          md:h-full md:grid-cols-2
          md:[grid-template-rows:auto_auto_auto_auto_auto_auto]
          md:pt-[5.5rem] md:pb-[3.5rem]
        "
      >
        {/* Background panels (desktop/tablet only — solid columns + subtle drifting imagery) */}
        <div className="pointer-events-none absolute inset-0 z-0 hidden md:grid md:grid-cols-2" aria-hidden="true">
          <div className="relative overflow-hidden bg-paper">
            <img
              src={businessBg}
              alt=""
              loading="lazy"
              width={1280}
              height={1600}
              className="absolute inset-0 h-full w-full object-cover opacity-[0.18] mix-blend-multiply animate-index-drift"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-paper via-paper/70 to-paper/30" />
            <div className="absolute inset-0 bg-gradient-to-b from-paper/60 via-transparent to-paper/80" />
          </div>
          <div className="relative overflow-hidden bg-olive">
            <img
              src={careerBg}
              alt=""
              loading="lazy"
              width={1280}
              height={1600}
              className="absolute inset-0 h-full w-full object-cover opacity-[0.22] mix-blend-soft-light animate-index-drift"
              style={{ animationDelay: "-13s" }}
            />
            <div className="absolute inset-0 bg-gradient-to-l from-olive via-olive/70 to-olive/30" />
            <div className="absolute inset-0 bg-gradient-to-b from-olive/60 via-transparent to-olive/80" />
          </div>
        </div>

        {/* ─────────────── HR ADVISORY (left column) ─────────────── */}

        {/* Mobile wrapper: keeps section feel on small screens */}
        <div className="contents md:contents">
          {/* Eyebrow */}
          <div className="relative z-10 bg-paper px-6 pt-28 md:bg-transparent md:px-10 md:pt-0 lg:px-24 md:[grid-column:1] md:[grid-row:1]">
            <div className="mx-auto flex max-w-xl items-center gap-3 font-dm text-[0.68rem] font-medium uppercase tracking-widest2 text-ink/65 before:block before:h-px before:w-7 before:bg-sienna md:mx-0">
              <span className="text-sienna">01</span>
              <span><T en="HR Advisory" ar="استشارات الموارد البشرية" /></span>
            </div>
          </div>

          {/* Title */}
          <div className="relative z-10 bg-paper px-6 pt-6 md:bg-transparent md:px-10 md:pt-5 lg:px-24 md:[grid-column:1] md:[grid-row:2]">
            <h1
              id="hr-head"
              className="mx-auto max-w-xl font-serif text-[clamp(2.4rem,4.6vw,4.8rem)] font-normal leading-[0.98] text-ink text-balance md:mx-0"
            >
              <T en={<>Practical HR,<br /><span className="italic text-sienna">honestly</span> said</>} ar={<>موارد بشرية عملية،<br /><span className="italic text-sienna">بصدق</span></>} />
              <span className="inline-block h-[0.14em] w-[0.14em] rounded-full bg-sienna align-baseline" aria-hidden="true" />
            </h1>
          </div>

          {/* Lede */}
          <div className="relative z-10 bg-paper px-6 pt-6 md:bg-transparent md:px-10 md:pt-5 lg:px-24 md:[grid-column:1] md:[grid-row:3]">
            <p className="mx-auto max-w-md text-[1rem] font-light leading-7 text-ink md:mx-0">
              <T en="For founders, GMs and owner-operators across the UAE and GCC. A senior HR practitioner — not a firm. No juniors, no decks, no eighty-page handbooks." ar="للمؤسسين والمدراء العامين وأصحاب الأعمال في الإمارات والخليج. ممارس موارد بشرية رفيع — لا شركة. لا متدرّبون، ولا عروض، ولا كتيّبات من ثمانين صفحة." />
            </p>
          </div>

          {/* Pills */}
          <div className="relative z-10 bg-paper px-6 pt-7 md:bg-transparent md:px-10 md:pt-6 lg:px-24 md:[grid-column:1] md:[grid-row:4]">
            <div
              className="mx-auto flex max-w-xl flex-wrap content-start gap-2 border-t border-ink/10 pt-5 md:mx-0"
              aria-label="Service areas"
            >
              <span className="mr-2 pt-1 font-dm text-[0.64rem] font-medium uppercase tracking-widest2 text-ink/65">
                <T en="Practice" ar="الممارسة" />
              </span>
              {SERVICE_PILLS.map((p) => (
                <span key={p.en} className="rounded-sm border border-ink/20 px-2.5 py-1.5 text-xs tracking-wide text-ink">
                  {pick(p, lang)}
                </span>
              ))}
            </div>
          </div>

          {/* CTAs */}
          <div className="relative z-10 bg-paper px-6 pt-7 md:bg-transparent md:px-10 md:pt-6 lg:px-24 md:[grid-column:1] md:[grid-row:5]">
            <div className="mx-auto flex max-w-xl flex-wrap items-center gap-6 md:mx-0">
              <Link
                to={localize("/business")}
                className="inline-flex min-h-12 items-center gap-2 rounded-md bg-sienna px-6 font-dm text-sm font-medium text-paper transition-colors hover:bg-umber focus:outline-none focus:ring-2 focus:ring-sienna focus:ring-offset-2 focus:ring-offset-paper"
              >
                <T en="Enter HR Advisory" ar="ادخل إلى استشارات الموارد البشرية" /> <span aria-hidden="true" className="rtl-flip">→</span>
              </Link>
              <Link
                to={localize("/tools")}
                className="border-b border-transparent py-1 text-sm font-medium tracking-wide text-ink/60 transition-colors hover:border-ink hover:text-ink"
              >
                <T en="Free HR Business Tools →" ar="أدوات موارد بشرية مجانية ←" />
              </Link>
            </div>
          </div>

          {/* Stat strip */}
          <div className="relative z-10 bg-paper px-6 pt-8 pb-24 md:bg-transparent md:px-10 md:pt-7 md:pb-0 lg:px-24 md:[grid-column:1] md:[grid-row:6]">
            <div className="mx-auto flex max-w-xl items-end justify-between gap-6 text-ink/65 md:mx-0">
              <div>
                <span className="block font-serif text-3xl italic leading-none text-ink">
                  16
                  <span className="inline-block h-[0.12em] w-[0.12em] rounded-full bg-sienna align-baseline" />
                </span>
                <span className="mt-1 block text-[0.62rem] font-medium uppercase tracking-widest2">
                  <T en="Years · executive HR · MENAT" ar="سنوات · موارد بشرية تنفيذية · الشرق الأوسط وشمال أفريقيا وتركيا" />
                </span>
              </div>
              <p className="hidden max-w-56 text-right font-serif italic leading-5 md:block">
                <T en="For SMEs of 1 to 150 staff — the sweet spot." ar="للشركات الصغيرة والمتوسطة من 1 إلى 150 موظفًا — المكان المثالي." />
              </p>
            </div>
          </div>
        </div>

        {/* ─────────────── CAREER STUDIO (right column) ─────────────── */}

        <div className="contents md:contents">
          {/* Eyebrow */}
          <div className="relative z-10 bg-olive px-6 pt-16 text-paper md:bg-transparent md:px-10 md:pt-0 lg:px-24 md:[grid-column:2] md:[grid-row:1]">
            <div className="mx-auto flex max-w-xl items-center gap-3 font-dm text-[0.68rem] font-medium uppercase tracking-widest2 text-paper/80 before:block before:h-px before:w-7 before:bg-blush md:mx-0">
              <span className="text-blush">02</span>
              <span><T en="Career Studio" ar="استوديو المسار المهني" /></span>
            </div>
          </div>

          {/* Title */}
          <div className="relative z-10 bg-olive px-6 pt-6 text-paper md:bg-transparent md:px-10 md:pt-5 lg:px-24 md:[grid-column:2] md:[grid-row:2]">
            <h2
              id="cs-head"
              className="mx-auto max-w-xl font-serif text-[clamp(2.4rem,4.6vw,4.8rem)] font-normal leading-[0.98] text-paper text-balance md:mx-0"
            >
              <T en={<>Your career,<br /><span className="italic text-blush">considered</span></>} ar={<>مسارك المهني،<br /><span className="italic text-blush">بتأنٍّ</span></>} />
              <span className="inline-block h-[0.14em] w-[0.14em] rounded-full bg-blush align-baseline" aria-hidden="true" />
            </h2>
          </div>

          {/* Lede */}
          <div className="relative z-10 bg-olive px-6 pt-6 text-paper md:bg-transparent md:px-10 md:pt-5 lg:px-24 md:[grid-column:2] md:[grid-row:3]">
            <p className="mx-auto max-w-md text-[1rem] font-light leading-7 text-paper/90 md:mx-0">
              <T en="For all professionals from anywhere who are ready to take their next step seriously. CV, LinkedIn, and coaching — written by an HR director, not a copywriter." ar="لكل المهنيّين من أي مكان المستعدّين لخطوتهم التالية بجدّية. سيرة ذاتية، ولينكدإن، وكوتشينغ — يكتبها مدير موارد بشرية، لا كاتب إعلانات." />
            </p>
          </div>

          {/* Pills */}
          <div className="relative z-10 bg-olive px-6 pt-7 text-paper md:bg-transparent md:px-10 md:pt-6 lg:px-24 md:[grid-column:2] md:[grid-row:4]">
            <div
              className="mx-auto flex max-w-xl flex-wrap content-start gap-2 border-t border-paper/15 pt-5 md:mx-0"
              aria-label="Career services"
            >
              <span className="mr-2 pt-1 font-dm text-[0.64rem] font-medium uppercase tracking-widest2 text-paper/75">
                <T en="Studio" ar="الاستوديو" />
              </span>
              {CAREER_PILLS.map((p) => (
                <span key={p.en} className="rounded-sm border border-paper/25 px-2.5 py-1.5 text-xs tracking-wide text-paper/90">
                  {pick(p, lang)}
                </span>
              ))}
            </div>
          </div>

          {/* CTAs */}
          <div className="relative z-10 bg-olive px-6 pt-7 text-paper md:bg-transparent md:px-10 md:pt-6 lg:px-24 md:[grid-column:2] md:[grid-row:5]">
            <div className="mx-auto flex max-w-xl flex-wrap items-center gap-6 md:mx-0">
              <Link
                to={localize("/career")}
                className="inline-flex min-h-12 items-center gap-2 rounded-md bg-blush px-6 font-dm text-sm font-medium text-ink transition-colors hover:bg-clay focus:outline-none focus:ring-2 focus:ring-blush focus:ring-offset-2 focus:ring-offset-olive"
              >
                <T en="Enter Career Studio" ar="ادخل إلى استوديو المسار المهني" /> <span aria-hidden="true" className="rtl-flip">→</span>
              </Link>
            </div>
          </div>

          {/* Stat strip */}
          <div className="relative z-10 bg-olive px-6 pt-8 pb-24 text-paper md:bg-transparent md:px-10 md:pt-7 md:pb-0 lg:px-24 md:[grid-column:2] md:[grid-row:6]">
            <div className="mx-auto flex max-w-xl items-end justify-between gap-6 text-paper/75 md:mx-0">
              <div>
                <span className="block font-serif text-3xl italic leading-none text-paper">
                  11
                  <span className="inline-block h-[0.12em] w-[0.12em] rounded-full bg-blush align-baseline" />
                </span>
                <span className="mt-1 block text-[0.62rem] font-medium uppercase tracking-widest2">
                  <T en="Markets · MENAT" ar="أسواق · الشرق الأوسط وشمال أفريقيا وتركيا" />
                </span>
              </div>
              <p className="hidden max-w-64 text-right font-serif italic leading-5 md:block">
                <T en="For people who know they're worth more — and want to say so, without slogans." ar="لمن يعرفون أنّهم يستحقّون أكثر — ويريدون قول ذلك دون شعارات." />
              </p>
            </div>
          </div>
        </div>

        {/* Centre divider + rotating badge (desktop/tablet only) */}
        <div
          className="pointer-events-none absolute inset-y-0 left-1/2 z-20 hidden w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-ink/15 to-transparent md:block"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 z-20 hidden h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center md:grid"
          aria-hidden="true"
        >
          <svg
            className="absolute inset-0 h-full w-full animate-[spin_28s_linear_infinite] overflow-visible"
            viewBox="0 0 112 112"
            role="img"
          >
            <defs>
              <path id="choose-circle" d="M56,56 m-34,0 a34,34 0 1,1 68,0 a34,34 0 1,1 -68,0" />
            </defs>
            <text className="fill-ink/55 font-dm text-[0.62rem] font-semibold uppercase tracking-[0.12em]">
              <textPath href="#choose-circle" startOffset="50%" textAnchor="middle">
                {lang === "ar" ? "اختر هذا · أو ذاك ·" : "Choose one · or the other ·"}
              </textPath>
            </text>
          </svg>
          <span className="h-3 w-3 rounded-full bg-sienna shadow-[0_0_0_6px_hsl(var(--paper)/0.82)]" />
        </div>
      </main>

    </div>
  );
};

export default Index;
