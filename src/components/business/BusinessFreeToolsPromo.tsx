import { Link } from "react-router-dom";
import { FREE_TOOLS } from "@/data/business";
import { T, pick, useLang } from "@/i18n/T";
import { useLocalizedPath } from "@/i18n/useLocalizedPath";

export default function BusinessFreeToolsPromo() {
  const lang = useLang();
  const { localize } = useLocalizedPath();
  return (
    <section id="free-tools-promo" className="px-6 md:px-20 py-20 bg-cream-warm">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div>
            <span className="font-dm font-bold text-xs uppercase block mb-4 text-terracotta" style={{ letterSpacing: "0.18em" }}>
              <T en="Free Tools — No Signup Required" ar="أدوات مجانية — دون تسجيل" />
            </span>
            <h2 className="font-serif font-bold mb-3 text-ink" style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", letterSpacing: "-0.02em" }}>
              <T en="Try before you talk to us." ar="جرّب قبل أن تتحدّث إلينا." />
            </h2>
            <p className="font-dm max-w-lg text-ink/55" style={{ fontWeight: 300, fontSize: "1rem" }}>
              <T
                en="Generate a JD, write a policy, calculate your Emiratisation fine exposure, or run a full HR health diagnostic — all free, no email required."
                ar="أنشئ وصفًا وظيفيًا، اكتب سياسة، احسب تعرّضك لغرامات التوطين، أو شغّل تشخيصًا كاملاً لصحة الموارد البشرية — كله مجانًا وبدون بريد إلكتروني."
              />
            </p>
          </div>
          <Link to={localize("/tools")} className="font-dm font-bold text-sm uppercase px-8 py-4 rounded-sm whitespace-nowrap transition-colors duration-200 bg-terracotta hover:bg-terracotta-deep text-cream self-start md:self-auto" style={{ letterSpacing: "0.06em" }}>
            <T en="Explore All Free Tools →" ar="استكشف جميع الأدوات المجانية ←" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {FREE_TOOLS.map((t, i) => {
            const tabSlug = ["diagnostic", "calculator", "policy", "jd"][i] ?? "diagnostic";
            return (
            <Link
              to={`${localize("/tools")}#${tabSlug}`}
              key={i}
              className="p-6 block transition-colors duration-300 bg-white"
              style={{ borderTop: "2px solid transparent" }}
              onMouseEnter={(e) => (e.currentTarget.style.borderTopColor = "hsl(var(--terracotta))")}
              onMouseLeave={(e) => (e.currentTarget.style.borderTopColor = "transparent")}
            >
              <div className="text-2xl mb-3">{t.icon}</div>
              <h3 className="font-dm font-bold text-sm mb-2 text-ink">{pick(t.name, lang)}</h3>
              <p className="font-dm text-xs leading-relaxed text-ink/50" style={{ fontWeight: 300 }}>
                {pick(t.desc, lang)}
              </p>
              <span className="font-dm text-xs font-bold mt-4 block text-terracotta" style={{ letterSpacing: "0.06em" }}>
                <T en="Try Free →" ar="جرّب مجانًا ←" />
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-10 p-6 flex flex-col md:flex-row items-center justify-between gap-5 bg-ink">
          <div>
            <p className="font-serif font-semibold text-lg mb-1 text-cream"><T en="Liked what you saw?" ar="أعجبك ما رأيت؟" /></p>
            <p className="font-dm text-sm text-cream/50" style={{ fontWeight: 300 }}>
              <T en="Every free tool is a small window into how we think. A 30-minute call goes much further." ar="كل أداة مجانية هي نافذة صغيرة على طريقة تفكيرنا. مكالمة من 30 دقيقة تذهب أبعد بكثير." />
            </p>
          </div>
          <a href="#contact" className="font-dm font-bold text-xs uppercase px-7 py-3.5 rounded-sm whitespace-nowrap transition-colors duration-200 bg-terracotta hover:bg-terracotta-deep text-cream" style={{ letterSpacing: "0.08em" }}>
            <T en="Schedule Free Consultation →" ar="احجز استشارة مجانية ←" />
          </a>
        </div>
      </div>
    </section>
  );
}
