import { ABOUT_CREDENTIALS } from "@/data/business";
import { T, pick, useLang } from "@/i18n/T";

const ENDORSEMENTS = [
  {
    quote: { en: "His professionalism, collaborative spirit, and positive approach made a meaningful impact — and he will certainly be missed.", ar: "احترافيته وروحه التعاونية ونهجه الإيجابي تركوا أثرًا حقيقيًا — وسيُفتقد بكل تأكيد." },
    attribution: { en: "Regional Director · MCN KSA", ar: "المدير الإقليمي · MCN السعودية" },
  },
  {
    quote: { en: "I wanted you to know how much I enjoyed working with you and to thank you for the advice you gave me.", ar: "أردت أن تعلم كم استمتعت بالعمل معك، وأن أشكرك على النصائح التي قدّمتها لي." },
    attribution: { en: "Managing Director · MCN", ar: "العضو المنتدب · MCN" },
  },
];

export default function BusinessAbout() {
  const lang = useLang();
  return (
    <section id="about" className="px-6 md:px-20 py-24 bg-cream">
      <div className="max-w-5xl mx-auto">
        <span className="font-dm font-bold text-xs uppercase block mb-8 text-terracotta" style={{ letterSpacing: "0.18em" }}>
          <T en="About" ar="من نحن" />
        </span>
        <div className="grid md:grid-cols-2 gap-14 items-start">
          <div>
            <h2 className="font-serif font-bold mb-6 text-ink" style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.5rem)", letterSpacing: "-0.02em" }}>
              <T en="16 years of HR expertise," ar="16 عامًا من خبرة الموارد البشرية،" />
              <br />
              <em><T en="applied with purpose." ar="تُطبَّق بهدف." /></em>
            </h2>
            <p className="font-dm leading-relaxed mb-5 text-moss" style={{ fontWeight: 300, fontSize: "1rem" }}>
              <T
                en="I've spent 16 years making HR decisions that affected real people — across 11 MENAT markets, in companies from 25 to 1,300 employees, in eight industries. I've hired and let people go, restructured organisations, navigated MoHRE labour claims, built compliance frameworks from scratch, and sat in rooms where the people decisions were the hardest ones being made."
                ar="قضيت 16 عامًا في اتّخاذ قرارات موارد بشرية أثّرت في أشخاص حقيقيين — في 11 سوقًا بمنطقة الشرق الأوسط وشمال أفريقيا وتركيا، في شركات من 25 إلى 1,300 موظف، وفي ثماني صناعات. وظّفت وأنهيت خدمات، وأعدت هيكلة منظّمات، وتعاملت مع دعاوى وزارة الموارد البشرية، وبنيت أُطر امتثال من الصفر، وجلست في غرف كانت قرارات الموظفين فيها أصعب القرارات."
              />
            </p>
            <p className="font-dm leading-relaxed mb-5 text-moss" style={{ fontWeight: 300, fontSize: "1rem" }}>
              <T
                en="People Studio exists because most UAE SMEs are running without the HR infrastructure their headcount demands — and the consequences are expensive. I work directly with founders and operators to close that gap: not with reports and frameworks, but with decisions and implementations."
                ar="نشأت People Studio لأن معظم الشركات الصغيرة والمتوسطة في الإمارات تعمل دون البنية البشرية التي يتطلّبها حجم موظفيها — والعواقب مكلفة. أعمل مباشرة مع المؤسسين والمشغّلين لسدّ هذه الفجوة: ليس بالتقارير والأُطر، بل بالقرارات والتنفيذ."
              />
            </p>
            <p className="font-dm leading-relaxed mb-8 text-moss" style={{ fontWeight: 300, fontSize: "1rem" }}>
              <T en="When you work with me, you work with me. No juniors, no subcontractors, no eighty-page handbooks." ar="حين تعمل معي، تعمل معي شخصيًا. لا مساعدون مبتدئون، ولا متعاقدون من الباطن، ولا أدلة من ثمانين صفحة." />
            </p>
          </div>

          <div className="space-y-4">
            {ABOUT_CREDENTIALS.map((b, i) => (
              <div key={i} className="flex items-center gap-5 p-4 bg-white" style={{ borderLeft: "2px solid hsl(var(--terracotta) / 0.2)" }}>
                <div className="font-serif font-bold text-lg text-terracotta" style={{ minWidth: "7rem" }}>
                  {pick(b.n, lang)}
                </div>
                <div className="font-dm text-sm text-moss" style={{ fontWeight: 300 }}>
                  {pick(b.s, lang)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-20 border-t border-terracotta/15 pt-12">
          <span className="font-dm font-bold text-xs uppercase block mb-8 text-terracotta" style={{ letterSpacing: "0.18em" }}>
            <T en="Professional Endorsements" ar="توصيات مهنية" />
          </span>

          <div className="grid gap-10 md:grid-cols-2 md:gap-14">
            {ENDORSEMENTS.map((e, i) => (
              <figure key={i} className={i === 1 ? "relative border-t border-terracotta/15 pt-10 md:border-t-0 md:pt-0 md:border-l md:border-terracotta/15 md:pl-14" : "relative"}>
                <span aria-hidden="true" className="absolute -top-4 -left-1 font-serif text-7xl leading-none text-terracotta/20 select-none">&ldquo;</span>
                <blockquote className="relative z-10 font-dm leading-relaxed text-moss" style={{ fontWeight: 300, fontSize: "1rem" }}>
                  {pick(e.quote, lang)}
                </blockquote>
                <figcaption className="mt-5 font-dm font-bold text-[0.7rem] uppercase text-ink/55" style={{ letterSpacing: "0.14em" }}>
                  — {pick(e.attribution, lang)}
                </figcaption>
              </figure>
            ))}
          </div>

          <p className="mt-10 font-dm text-xs text-moss/70">
            <a href="https://www.linkedin.com/in/bmesiha/" target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:text-terracotta hover:underline">
              <T en="Full LinkedIn recommendations →" ar="كامل التوصيات على لينكدإن ←" />
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
