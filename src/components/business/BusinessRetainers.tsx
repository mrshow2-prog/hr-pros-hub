import { RETAINER_TIERS } from "@/data/business";
import { T, pick, useLang } from "@/i18n/T";

export default function BusinessRetainers() {
  const lang = useLang();
  return (
    <section id="retainers" className="px-6 md:px-20 py-24 bg-cream">
      <div className="max-w-6xl mx-auto">
        <div className="mb-14">
          <span className="font-dm font-bold text-xs uppercase block mb-4 text-terracotta" style={{ letterSpacing: "0.18em" }}>
            <T en="Monthly Retainers" ar="العقود الشهرية" />
          </span>
          <h2 className="font-serif font-bold mb-4 text-ink" style={{ fontSize: "clamp(2rem, 4vw, 3rem)", letterSpacing: "-0.02em" }}>
            <T en="Ongoing HR. No full-time hire." ar="موارد بشرية مستمرّة. دون توظيف بدوام كامل." />
          </h2>
          <p className="font-dm text-ink/70" style={{ fontWeight: 300, maxWidth: "70ch" }}>
            <T
              en="A qualified HR Director in the UAE costs AED 35,000–50,000/month in-house. Our retainers start at AED 4,500. Same judgement. No visa. No notice period. No headcount."
              ar="مدير موارد بشرية مؤهّل في الإمارات يكلّف 35,000–50,000 درهم شهريًا داخليًا. تبدأ عقودنا الشهرية من 4,500 درهم. الخبرة نفسها. بلا تأشيرة. بلا فترة إشعار. بلا إضافة للعدد."
            />
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {RETAINER_TIERS.map((t, i) => (
            <div
              key={i}
              className={`p-8 flex flex-col relative ${t.featured ? "bg-terracotta" : "bg-white"}`}
              style={{
                outline: t.featured
                  ? "none"
                  : t.bestValue
                  ? "2px solid hsl(var(--ink))"
                  : "1px solid hsl(var(--ink) / 0.08)",
              }}
            >
              {t.featured && (
                <div className="absolute -top-3 left-8">
                  <span className="font-dm font-bold text-xs uppercase px-3 py-1 bg-ink text-cream" style={{ letterSpacing: "0.1em" }}>
                    <T en="Most Popular" ar="الأكثر طلبًا" />
                  </span>
                </div>
              )}
              {t.bestValue && (
                <div className="absolute -top-3 left-8">
                  <span className="font-dm font-bold text-xs uppercase px-3 py-1 bg-terracotta text-cream" style={{ letterSpacing: "0.1em" }}>
                    <T en="Best Value" ar="أفضل قيمة" />
                  </span>
                </div>
              )}
              <div className="mb-6">
                <span className={`font-dm font-bold text-xs uppercase block mb-3 ${t.featured ? "text-cream/60" : "text-terracotta"}`} style={{ letterSpacing: "0.12em" }}>
                  {pick(t.size, lang)}
                </span>
                <div className={`font-serif font-bold text-3xl mb-1 ${t.featured ? "text-cream" : "text-ink"}`} style={{ letterSpacing: "-0.02em" }}>
                  {pick(t.name, lang)}
                </div>
                <div className={`font-serif font-bold text-xl ${t.featured ? "text-cream/85" : "text-terracotta"}`}>
                  {pick(t.price, lang)}
                </div>
                <div className={`font-dm text-xs ${t.featured ? "text-cream/50" : "text-ink/65"}`} style={{ fontWeight: 300 }}>
                  {pick(t.per, lang)}
                </div>
              </div>
              <ul className="space-y-2.5 flex-1 mb-8">
                {t.features.map((f, j) => (
                  <li key={j} className={`font-dm text-sm flex gap-2 ${t.featured ? "text-cream/85" : "text-moss"}`} style={{ fontWeight: 300 }}>
                    <span className={`flex-shrink-0 ${t.featured ? "text-cream/50" : "text-terracotta"}`}>✓</span> {pick(f, lang)}
                  </li>
                ))}
              </ul>
              {t.featured && (
                <div className="font-dm text-xs leading-relaxed mb-6 p-4 rounded-sm text-cream/85" style={{ fontWeight: 300, border: "1px solid hsl(var(--cream) / 0.25)", background: "hsl(var(--cream) / 0.08)" }}>
                  <T
                    en="At AED 7,500/month, this retainer costs less than one wrongful termination, one labour claim, or one month of Emiratisation contributions. Most clients recover the full annual fee in the first issue we resolve."
                    ar="بسعر 7,500 درهم شهريًا، يكلّف هذا العقد أقلّ من فصل تعسّفي واحد، أو دعوى عمالية واحدة، أو شهر من اشتراكات التوطين. معظم العملاء يستردّون الرسوم السنوية كاملة من أول مشكلة نحلّها."
                  />
                </div>
              )}
              {t.bestValue && (
                <div className="font-dm text-xs leading-relaxed mb-6 p-4 rounded-sm text-ink/75" style={{ fontWeight: 300, border: "1px solid hsl(var(--ink) / 0.15)", background: "hsl(var(--terracotta) / 0.06)" }}>
                  <span className="font-bold text-ink"><T en="Best value for 100+ employees." ar="أفضل قيمة للشركات التي تضمّ 100 موظف فأكثر." /></span>{" "}
                  <T
                    en="A senior HR leader embedded in your business — covering everything in the services above (compliance, org design, C&B, systems, automation, payroll oversight) and the day-to-day judgement calls a growing team can't operate without. One engagement, one accountable owner, no full-time hire."
                    ar="قائد موارد بشرية رفيع مدمج في عملك — يغطّي كل ما في الخدمات أعلاه (الامتثال، تصميم المنظمة، التعويضات والمزايا، الأنظمة، الأتمتة، الإشراف على الرواتب) إضافة إلى القرارات اليومية التي لا يمكن لفريق متنامٍ العمل بدونها. تعاقد واحد، مالك واحد مسؤول، بلا توظيف بدوام كامل."
                  />
                </div>
              )}
              <a
                href="#contact"
                className={`font-dm font-bold text-xs uppercase px-5 py-3 text-center transition-colors duration-200 rounded-sm ${
                  t.featured ? "bg-cream text-terracotta hover:bg-ink hover:text-cream" : "text-ink hover:bg-ink hover:text-cream"
                }`}
                style={{ border: t.featured ? "none" : "1px solid hsl(var(--ink) / 0.2)", letterSpacing: "0.1em" }}
              >
                <T en="Get Started →" ar="ابدأ الآن ←" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
