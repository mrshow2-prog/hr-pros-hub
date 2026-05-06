import { SERVICES } from "@/data/business";
import { BOOKING_HREF } from "@/lib/contact";
import { T, pick, useLang } from "@/i18n/T";

const ALSO = [
  { name: { en: "Saudization (Nitaqat) Readiness", ar: "جاهزية السعودة (نطاقات)" }, desc: { en: "Strategic tier mapping, MHRSD compliance, Hadaf (HRDF) subsidy maximization, and Qiwa/GOSI data alignment for KSA expansion.", ar: "رسم استراتيجي للنطاقات، الامتثال لوزارة الموارد البشرية والتنمية الاجتماعية، تعظيم دعم هدف (HRDF)، ومواءمة بيانات قوى/التأمينات للتوسّع في السعودية." } },
  { name: { en: "Talent Mapping", ar: "رسم خريطة الكفاءات" }, desc: { en: "Competitor intelligence and future-leader pipelining.", ar: "ذكاء تنافسي وبناء قاعدة من القادة المستقبليين." } },
  { name: { en: "Performance Management", ar: "إدارة الأداء" }, desc: { en: "Transitioning teams to high-output cultures.", ar: "نقل الفرق إلى ثقافة عالية الإنتاجية." } },
  { name: { en: "Engagement & Atmosphere", ar: "الإندماج وجوّ العمل" }, desc: { en: "Discrete strategies for workspace transformation and custom in-office team building.", ar: "استراتيجيات سرّية لتحويل بيئة العمل وأنشطة بناء فريق مخصّصة داخل المكتب." } },
  { name: { en: "Employee Relations", ar: "علاقات الموظفين" }, desc: { en: "Expert guidance on sensitive labor disputes and terminations.", ar: "إرشاد متخصّص في النزاعات العمالية الحسّاسة وإنهاء الخدمة." } },
  { name: { en: "KSA & Regional Expansion", ar: "التوسّع في السعودية والمنطقة" }, desc: { en: "Scaling your people operations across the GCC.", ar: "توسيع عمليات الموظفين في دول الخليج." } },
];

export default function BusinessServices() {
  const lang = useLang();
  return (
    <section id="services" className="px-6 md:px-20 py-24 bg-ink">
      <div className="max-w-6xl mx-auto">
        <div className="mb-14 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="font-dm font-bold text-xs uppercase block mb-4 text-terracotta" style={{ letterSpacing: "0.18em" }}>
              <T en="Services" ar="الخدمات" />
            </span>
            <h2 className="font-serif font-bold text-cream" style={{ fontSize: "clamp(2rem, 4vw, 3rem)", letterSpacing: "-0.02em" }}>
              <T en="Fixed prices." ar="أسعار ثابتة." />
              <br />
              <T en="No surprises." ar="بلا مفاجآت." />
            </h2>
          </div>
          <p className="font-dm max-w-xs text-cream/45" style={{ fontWeight: 300 }}>
            <T
              en="Every engagement starts with a free 30-minute call to confirm scope and fit."
              ar="كل تعاقد يبدأ بمكالمة مجانية مدّتها 30 دقيقة لتأكيد النطاق والتوافق."
            />
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px" style={{ background: "hsl(var(--cream) / 0.06)" }}>
          {SERVICES.map((s, i) => {
            const priceEn = s.price.en;
            const isFrom = priceEn.startsWith("From ");
            const priceDisplay = isFrom
              ? (lang === "ar" ? s.price.ar.replace(/^From\s*/, "") : priceEn.slice(5))
              : pick(s.price, lang);
            return (
              <div
                key={i}
                className="p-8 flex flex-col transition-colors duration-300 bg-ink"
                onMouseEnter={(e) => (e.currentTarget.style.background = "hsl(var(--terracotta) / 0.06)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "hsl(var(--ink))")}
              >
                <span className="font-dm font-bold text-xs uppercase block mb-5 text-terracotta" style={{ letterSpacing: "0.12em" }}>
                  {pick(s.tag, lang)}
                </span>
                <h3 className="font-serif font-semibold text-lg mb-3 leading-snug text-cream">{pick(s.name, lang)}</h3>
                <div className="mb-4">
                  {isFrom && (
                    <span className="font-dm text-xs mr-1.5 text-cream/35" style={{ fontWeight: 300 }}>
                      <T en="From" ar="ابتداءً من" />
                    </span>
                  )}
                  <span className="font-serif font-bold text-2xl text-terracotta-soft" style={{ letterSpacing: "-0.02em" }}>
                    {priceDisplay}
                  </span>
                  <span className="font-dm text-xs ml-2 text-cream/35" style={{ fontWeight: 300 }}>
                    {pick(s.priceNote, lang)}
                  </span>
                </div>
                <p className="font-dm text-sm mb-5 leading-relaxed flex-1 text-cream/55" style={{ fontWeight: 300 }}>
                  {pick(s.desc, lang)}
                </p>
                <ul className="space-y-2 mb-8">
                  {s.deliverables.map((d, j) => (
                    <li key={j} className="font-dm text-sm flex gap-2 text-cream/65">
                      <span className="text-terracotta flex-shrink-0 rtl-flip">→</span> {pick(d, lang)}
                    </li>
                  ))}
                </ul>
                <a
                  href={BOOKING_HREF}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-dm font-bold text-xs uppercase px-5 py-3 text-center rounded-sm transition-colors duration-200 mt-auto text-terracotta-soft hover:bg-terracotta hover:text-cream"
                  style={{ border: "1px solid hsl(var(--terracotta) / 0.35)", letterSpacing: "0.1em" }}
                >
                  <T en="Book a Call →" ar="احجز مكالمة ←" />
                </a>
              </div>
            );
          })}
        </div>

        <div className="mt-20 pt-14 border-t border-cream/10">
          <div className="grid md:grid-cols-12 gap-10">
            <div className="md:col-span-4">
              <span className="font-dm font-bold text-xs uppercase block mb-4 text-terracotta" style={{ letterSpacing: "0.18em" }}>
                <T en="Also available" ar="متوفّر أيضًا" />
              </span>
              <h3 className="font-serif font-semibold text-cream leading-tight" style={{ fontSize: "clamp(1.5rem, 2.4vw, 2rem)", letterSpacing: "-0.02em" }}>
                <T en="We also support your business with:" ar="ندعم عملك أيضًا بـ:" />
              </h3>
            </div>
            <div className="md:col-span-8 grid sm:grid-cols-2 gap-px" style={{ background: "hsl(var(--cream) / 0.06)" }}>
              {ALSO.map((item, i) => (
                <div key={i} className="p-6 bg-ink flex gap-4">
                  <span className="text-terracotta font-dm flex-shrink-0 rtl-flip">→</span>
                  <div>
                    <h4 className="font-serif font-semibold text-cream text-base mb-1.5">{pick(item.name, lang)}</h4>
                    <p className="font-dm text-sm leading-relaxed text-cream/55" style={{ fontWeight: 300 }}>{pick(item.desc, lang)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
