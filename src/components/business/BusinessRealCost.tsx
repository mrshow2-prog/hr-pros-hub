import { T, pick, useLang } from "@/i18n/T";

const COSTS = [
  { value: { en: "AED 130k+", ar: "+130 ألف درهم" }, label: { en: "Average cost of one bad hire", ar: "متوسط تكلفة تعيين خاطئ واحد" } },
  { value: { en: "AED 80k+", ar: "+80 ألف درهم" }, label: { en: "Average MoHRE labour claim cost", ar: "متوسط تكلفة دعوى عمالية لدى وزارة الموارد البشرية" } },
  { value: { en: "AED 200k+", ar: "+200 ألف درهم" }, label: { en: "Two-year Emiratisation gap exposure", ar: "تعرّض فجوة التوطين لعامين" } },
  { value: { en: "AED 90k", ar: "90 ألف درهم" }, label: { en: "One full year of Growth Retainer", ar: "سنة كاملة من عقد النمو الشهري" } },
];

export default function BusinessRealCost() {
  const lang = useLang();
  return (
    <section className="py-24 px-6 md:px-20 bg-paper">
      <div className="max-w-6xl mx-auto">
        <span className="font-dm font-bold text-xs uppercase block mb-5 text-terracotta" style={{ letterSpacing: "0.18em" }}>
          <T en="THE REAL COST" ar="التكلفة الحقيقية" />
        </span>
        <h2 className="font-serif font-normal leading-[1.05] mb-12 text-ink" style={{ fontSize: "clamp(2rem, 4.5vw, 3.5rem)" }}>
          <T en="One avoided mistake " ar="خطأ واحد متجنَّب " />
          <em className="text-terracotta" style={{ fontStyle: "italic" }}>
            <T en="pays for years of getting it right." ar="يدفع تكلفة سنوات من العمل الصحيح." />
          </em>
        </h2>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {COSTS.map((c, i) => (
            <div key={i} className="bg-ink text-cream p-8 rounded-sm flex flex-col justify-between min-h-[180px]">
              <div className="font-serif font-bold mb-4 text-cream" style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)", letterSpacing: "-0.02em" }}>
                {pick(c.value, lang)}
              </div>
              <div className="font-dm text-sm text-cream/70" style={{ fontWeight: 300 }}>
                {pick(c.label, lang)}
              </div>
            </div>
          ))}
        </div>

        <p className="font-dm text-sm md:text-base text-ink/60 max-w-3xl" style={{ fontWeight: 300 }}>
          <T
            en="One engagement protects you from all three. Most clients recover the full annual fee in the first avoided incident."
            ar="تعاقد واحد يحميك من الثلاثة. معظم العملاء يستردّون الرسوم السنوية كاملة من أول حادثة متجنَّبة."
          />
        </p>
      </div>
    </section>
  );
}
