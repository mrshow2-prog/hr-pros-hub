import { Link } from "react-router-dom";
import { HERO_STATS } from "@/data/business";
import heroKintsugi from "@/assets/business-hero-kintsugi.jpg";
import { T, pick, useLang } from "@/i18n/T";
import { useLocalizedPath } from "@/i18n/useLocalizedPath";

export default function BusinessHero() {
  const lang = useLang();
  const { localize } = useLocalizedPath();
  return (
    <section
      className="min-h-screen flex flex-col justify-center pt-32 pb-20 px-6 md:px-20 relative overflow-hidden bg-paper"
    >
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <img src={heroKintsugi} alt="" width={1920} height={1080} className={`absolute inset-0 h-full w-full object-cover ${lang === "ar" ? "object-left -scale-x-100" : "object-right"}`} />
        <div className={`absolute inset-0 ${lang === "ar" ? "bg-[linear-gradient(225deg,hsl(var(--paper))_0%,hsl(var(--paper)/0.85)_45%,hsl(var(--paper)/0.15)_75%,transparent_100%)]" : "bg-[linear-gradient(135deg,hsl(var(--paper))_0%,hsl(var(--paper)/0.85)_45%,hsl(var(--paper)/0.15)_75%,transparent_100%)]"}`} />
        <div className={`absolute inset-y-0 w-full md:w-3/5 ${lang === "ar" ? "right-0 bg-gradient-to-l from-paper via-paper/85 to-transparent" : "left-0 bg-gradient-to-r from-paper via-paper/85 to-transparent"}`} />
        <div className="absolute inset-0 [background-image:radial-gradient(hsl(var(--ink)/0.12)_1px,transparent_1px)] [background-size:28px_28px] [mask-image:radial-gradient(ellipse_40%_50%_at_85%_15%,black_30%,transparent_75%)]" />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-paper to-transparent" />
      </div>

      <div className="max-w-4xl relative z-10 mx-auto md:mx-0">
        <span className="font-dm font-bold text-xs uppercase block mb-7 text-terracotta" style={{ letterSpacing: "0.18em" }}>
          <T en="HR Advisory · UAE & GCC" ar="استشارات الموارد البشرية · الإمارات والخليج" />
        </span>
        <h1 className="font-serif font-normal leading-[0.98] mb-7 text-ink" style={{ fontSize: "clamp(3rem, 7vw, 6rem)" }}>
          <T en="Your HR is probably broken." ar="مواردك البشرية على الأرجح مكسورة." />
          <br />
          <em className="text-terracotta" style={{ fontStyle: "italic" }}>
            <T en="Let's fix it." ar="لنُصلحها." />
          </em>
        </h1>
        <p className="font-dm mb-10 max-w-xl leading-relaxed text-ink/70" style={{ fontSize: "1.1rem", fontWeight: 300 }}>
          <T
            en="Most UAE SMEs are one labour claim away from a serious problem. We find the gaps before they cost you."
            ar="معظم الشركات الصغيرة والمتوسطة في الإمارات تبعد دعوى عمالية واحدة عن مشكلة جدّية. نكتشف الثغرات قبل أن تكلّفك."
          />
        </p>

        <div className="flex flex-wrap gap-4 mb-20">
          <a href="#diagnostic" className="font-dm font-bold text-sm uppercase px-8 py-4 rounded-sm transition-colors duration-200 bg-terracotta hover:bg-terracotta-deep text-cream" style={{ letterSpacing: "0.06em" }}>
            <T en="Run the Free Diagnostic →" ar="ابدأ التشخيص المجاني ←" />
          </a>
          <Link to={localize("/tools")} className="font-dm font-bold text-sm uppercase px-8 py-4 rounded-sm transition-colors duration-200 text-terracotta hover:bg-ink hover:text-paper" style={{ letterSpacing: "0.06em", border: "1px solid hsl(var(--terracotta) / 0.35)" }}>
            <T en="Free HR Tools" ar="أدوات موارد بشرية مجانية" />
          </Link>
        </div>

        <div className="flex flex-col md:flex-row" style={{ borderTop: "1px solid hsl(var(--ink) / 0.1)" }}>
          {HERO_STATS.map((s, i) => (
            <div key={i} className="flex-1 py-8 md:pr-8" style={{ borderRight: i < HERO_STATS.length - 1 ? "1px solid hsl(var(--ink) / 0.1)" : "none" }}>
              <div className="font-serif font-bold mb-2 text-terracotta" style={{ fontSize: "2rem", letterSpacing: "-0.02em" }}>
                {pick(s.value, lang)}
              </div>
              <div className="font-dm text-sm text-ink/50" style={{ fontWeight: 300 }}>
                {pick(s.label, lang)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
