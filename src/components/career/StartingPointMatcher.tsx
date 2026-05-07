import { useEffect, useState } from "react";
import { ArrowRight, ArrowUpRight, Compass, RotateCcw, Sparkles } from "lucide-react";
import { BOOKING_HREF } from "@/lib/contact";
import { T, pick, useLang } from "@/i18n/T";

type Step = "entry" | 0 | 1 | 2 | "result";
type Bi = { en: string; ar: string };

const questions: { title: Bi; options: Bi[] }[] = [
  {
    title: { en: "Where are you right now?", ar: "أين أنت الآن؟" },
    options: [
      { en: "Employed, but actively looking for something better", ar: "موظّف، لكن أبحث بنشاط عن فرصة أفضل" },
      { en: "In between roles — currently job hunting", ar: "بين وظيفتين — أبحث حاليًا عن عمل" },
      { en: "Just made redundant — need to move quickly", ar: "تمّ تسريحي — أحتاج للتحرّك بسرعة" },
      { en: "Exploring options, no urgency yet", ar: "أستكشف الخيارات، دون استعجال بعد" },
    ],
  },
  {
    title: { en: "What's your biggest blocker?", ar: "ما أكبر ما يعيقك؟" },
    options: [
      { en: "I apply but don't get interviews", ar: "أتقدّم للوظائف لكن لا أحصل على مقابلات" },
      { en: "I get interviews but don't get offers", ar: "أحصل على مقابلات لكن لا أحصل على عروض" },
      { en: "I don't know what I want to do next", ar: "لا أعرف ماذا أريد أن أفعل لاحقًا" },
      { en: "I'm underpaid and want to change that", ar: "راتبي أقلّ مما أستحقّ وأريد تغيير ذلك" },
    ],
  },
  {
    title: { en: "How senior is your next target role?", ar: "ما مستوى الوظيفة المستهدفة التالية؟" },
    options: [
      { en: "Individual contributor / specialist", ar: "مساهم فردي / متخصّص" },
      { en: "Manager or team lead", ar: "مدير أو قائد فريق" },
      { en: "Director / Head of / VP", ar: "مدير عام / رئيس قسم / نائب رئيس" },
      { en: "C-suite or board level", ar: "تنفيذي أو مستوى مجلس الإدارة" },
    ],
  },
];

const SERVICES: Record<string, { category: Bi; name: Bi; bullets: Bi[] }> = {
  cv: {
    category: { en: "Foundation", ar: "الأساس" },
    name: { en: "CV design & rewrite", ar: "تصميم وإعادة كتابة السيرة الذاتية" },
    bullets: [
      { en: "Full rewrite from scratch", ar: "إعادة كتابة كاملة من الصفر" },
      { en: "UAE/GCC market calibration", ar: "معايرة لسوق الإمارات والخليج" },
      { en: "ATS-optimised and recruiter-ready", ar: "محسّنة لأنظمة ATS وجاهزة للمسؤولين" },
      { en: "Up to 2 revision rounds", ar: "حتى جولتي مراجعة" },
    ],
  },
  linkedin: {
    category: { en: "Visibility", ar: "الظهور" },
    name: { en: "LinkedIn profile optimisation", ar: "تحسين ملف لينكدإن" },
    bullets: [
      { en: "Full profile audit and rewrite", ar: "تدقيق وإعادة كتابة كاملة للملف" },
      { en: "Headline and summary repositioning", ar: "إعادة تموضع العنوان والملخّص" },
      { en: "GCC recruiter keyword strategy", ar: "استراتيجية كلمات مفتاحية لمسؤولي التوظيف في الخليج" },
      { en: "Content and engagement guidance", ar: "إرشاد المحتوى والتفاعل" },
    ],
  },
  interview: {
    category: { en: "High impact", ar: "تأثير عالٍ" },
    name: { en: "Interview coaching", ar: "تدريب المقابلات" },
    bullets: [
      { en: "Role-specific interview simulation", ar: "محاكاة مقابلة لدور محدّد" },
      { en: "Competency question preparation", ar: "تحضير أسئلة الكفاءات" },
      { en: "Salary and offer negotiation", ar: "التفاوض على الراتب والعرض" },
      { en: "Written feedback after session", ar: "تغذية راجعة مكتوبة بعد الجلسة" },
    ],
  },
  brand: {
    category: { en: "Strategic", ar: "استراتيجي" },
    name: { en: "Personal brand strategy", ar: "استراتيجية العلامة الشخصية" },
    bullets: [
      { en: "Brand audit and positioning", ar: "تدقيق وتموضع العلامة" },
      { en: "Professional narrative development", ar: "تطوير السردية المهنية" },
      { en: "LinkedIn content strategy", ar: "استراتيجية محتوى لينكدإن" },
      { en: "Executive bio and speaker profile", ar: "سيرة تنفيذية وملف متحدّث" },
    ],
  },
  pivot: {
    category: { en: "Transition support", ar: "دعم الانتقال" },
    name: { en: "Career pivot consulting", ar: "استشارة التحوّل المهني" },
    bullets: [
      { en: "Transferable value mapping", ar: "تحديد القيمة القابلة للنقل" },
      { en: "Target role and sector analysis", ar: "تحليل الدور والقطاع المستهدف" },
      { en: "CV and LinkedIn repositioning", ar: "إعادة تموضع السيرة ولينكدإن" },
      { en: "90-day job search action plan", ar: "خطة عمل 90 يومًا للبحث عن عمل" },
    ],
  },
  salary: {
    category: { en: "Unique to us", ar: "حصري لنا" },
    name: { en: "Salary negotiation coaching", ar: "تدريب التفاوض على الراتب" },
    bullets: [
      { en: "Market rate benchmarking", ar: "قياس معدّلات السوق" },
      { en: "Negotiation script and strategy", ar: "نصّ واستراتيجية التفاوض" },
      { en: "Offer evaluation framework", ar: "إطار تقييم العرض" },
      { en: "Counter-offer coaching", ar: "تدريب على العرض المضاد" },
    ],
  },
};

type ServiceKey = keyof typeof SERVICES;

const insightFor = (primary: ServiceKey, redundancy: boolean): Bi => {
  if (primary === "pivot" && redundancy) {
    return { en: "Speed matters now, but direction matters more. Let's get both right before you start applying.", ar: "السرعة مهمّة الآن، لكن الاتجاه أهم. لنُتقن كليهما قبل أن تبدأ التقديم." };
  }
  switch (primary) {
    case "cv":
      return { en: "Your experience isn't the problem. Your CV isn't showing it.", ar: "خبرتك ليست المشكلة. سيرتك الذاتية لا تُظهرها." };
    case "interview":
      return { en: "You're getting in the room. The gap is what happens in the room.", ar: "أنت تصل إلى غرفة المقابلة. الفجوة فيما يحدث داخلها." };
    case "salary":
      return { en: "Before you negotiate, you need leverage. Here's how to build it.", ar: "قبل أن تتفاوض، تحتاج إلى قوّة تفاوضية. إليك كيف تبنيها." };
    case "pivot":
      return { en: "The hardest part isn't the move. It's knowing which move.", ar: "أصعب جزء ليس الانتقال، بل معرفة أيّ انتقال." };
    case "brand":
      return { en: "At your level, the role finds you — if the market knows who you are.", ar: "في مستواك، الوظيفة تأتي إليك — إن كان السوق يعرف من أنت." };
    case "linkedin":
      return { en: "Recruiters are searching. Make sure they're finding the right version of you.", ar: "مسؤولو التوظيف يبحثون. تأكّد أنهم يجدون النسخة الصحيحة منك." };
  }
};

const recommend = (a: [number, number, number]): { primary: ServiceKey; secondary: ServiceKey; redundancy: boolean } => {
  const [q1, q2, q3] = a;
  const q2Map: Array<{ primary: ServiceKey; secondary: ServiceKey }> = [
    { primary: "cv", secondary: "linkedin" },
    { primary: "interview", secondary: "salary" },
    { primary: "pivot", secondary: "brand" },
    { primary: "salary", secondary: "linkedin" },
  ];
  let { primary, secondary } = q2Map[q2];
  const redundancy = q1 === 2;
  if (redundancy) {
    primary = "pivot";
    if (secondary === "pivot") secondary = "brand";
  }
  const senior = q3 === 2 || q3 === 3;
  if (senior) {
    if (primary === "brand") secondary = "linkedin";
    else secondary = "brand";
  }
  return { primary, secondary, redundancy };
};

type MatcherTrigger = { q1Index: number; nonce: number } | null;

export default function StartingPointMatcher({ trigger }: { trigger?: MatcherTrigger }) {
  const lang = useLang();
  const [step, setStep] = useState<Step>("entry");
  const [answers, setAnswers] = useState<[number?, number?, number?]>([undefined, undefined, undefined]);
  const [pending, setPending] = useState<number | null>(null);

  useEffect(() => {
    if (!trigger) return;
    const { q1Index } = trigger;
    setAnswers([q1Index, undefined, undefined]);
    setPending(q1Index);
    setStep(0);
    const t = window.setTimeout(() => {
      setPending(null);
      setStep(1);
    }, 400);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger?.nonce]);

  const reset = () => {
    setAnswers([undefined, undefined, undefined]);
    setPending(null);
    setStep("entry");
  };

  const choose = (qIdx: 0 | 1 | 2, optIdx: number) => {
    if (pending !== null) return;
    setPending(optIdx);
    const next: [number?, number?, number?] = [...answers] as [number?, number?, number?];
    next[qIdx] = optIdx;
    setAnswers(next);
    window.setTimeout(() => {
      setPending(null);
      if (qIdx < 2) setStep((qIdx + 1) as Step);
      else setStep("result");
    }, 300);
  };

  const scrollToServices = () => {
    document.getElementById("services")?.scrollIntoView({ behavior: "smooth" });
  };

  const isQuestion = step === 0 || step === 1 || step === 2;

  return (
    <section className="bg-career-bg px-6 pt-20 md:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="border border-career-border bg-career-surface/60 p-8 md:p-10">
          {step === "entry" && (
            <div className="flex flex-col items-start gap-5 animate-fade-in md:flex-row md:items-center md:justify-between md:gap-10">
              <div className="max-w-xl">
                <p className="mb-3 inline-flex items-center gap-2 font-dm text-xs font-bold uppercase tracking-widest2 text-career-sky">
                  <Compass size={14} /> <T en="Find your starting point" ar="حدّد نقطة انطلاقك" />
                </p>
                <h2 className="mb-3 font-serif text-3xl font-bold leading-tight text-paper md:text-4xl">
                  <T en="Not sure where to start?" ar="غير متأكّد من أين تبدأ؟" />
                </h2>
                <p className="font-light leading-7 text-paper/55">
                  <T en="Answer 3 questions. Get a recommendation in 10 seconds." ar="أجب عن 3 أسئلة. واحصل على توصية في 10 ثوانٍ." />
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStep(0)}
                className="group inline-flex min-h-12 items-center gap-2 bg-career-blue px-7 font-dm text-xs font-bold uppercase tracking-wider2 text-paper transition-colors hover:bg-career-deep"
              >
                <T en="Find my starting point" ar="حدّد نقطة انطلاقي" />
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-1 rtl-flip" />
              </button>
            </div>
          )}

          {isQuestion && (
            <div key={step} className="animate-fade-in">
              <div className="mb-6 flex items-center justify-between">
                <p className="font-dm text-xs font-bold uppercase tracking-widest2 text-career-sky">
                  <T en={`${(step as number) + 1} of 3`} ar={`${(step as number) + 1} من 3`} />
                </p>
                <div className="flex gap-1.5" aria-hidden="true">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className={`h-1 w-8 transition-colors ${i <= (step as number) ? "bg-career-sky" : "bg-career-border"}`} />
                  ))}
                </div>
              </div>
              <h3 className="mb-7 font-serif text-2xl font-bold leading-snug text-paper md:text-3xl">
                {pick(questions[step as 0 | 1 | 2].title, lang)}
              </h3>
              <div className="grid gap-3 md:grid-cols-2">
                {questions[step as 0 | 1 | 2].options.map((opt, idx) => {
                  const selected = pending === idx;
                  return (
                    <button
                      key={opt.en}
                      type="button"
                      onClick={() => choose(step as 0 | 1 | 2, idx)}
                      disabled={pending !== null}
                      className={`flex min-h-12 items-center justify-between gap-3 border px-5 py-3 text-left font-dm text-sm leading-6 transition-all ${selected ? "border-career-sky bg-career-sky/20 text-paper" : "border-career-border bg-career-bg text-paper/75 hover:border-career-sky/50 hover:bg-career-sky/10 hover:text-paper"} disabled:cursor-not-allowed`}
                    >
                      <span>{pick(opt, lang)}</span>
                      <ArrowRight size={14} className={`shrink-0 rtl-flip transition-opacity ${selected ? "text-career-sky opacity-100" : "opacity-0"}`} />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === "result" && answers[0] !== undefined && answers[1] !== undefined && answers[2] !== undefined && (
            <ResultBlock answers={answers as [number, number, number]} onReset={reset} onSeeAll={scrollToServices} lang={lang} />
          )}
        </div>
      </div>
    </section>
  );
}

function ResultBlock({ answers, onReset, onSeeAll, lang }: { answers: [number, number, number]; onReset: () => void; onSeeAll: () => void; lang: "en" | "ar" }) {
  const { primary, secondary, redundancy } = recommend(answers);
  const primaryService = SERVICES[primary];
  const secondaryService = SERVICES[secondary];
  const insight = insightFor(primary, redundancy);

  return (
    <div className="animate-fade-in">
      <p className="mb-3 inline-flex items-center gap-2 font-dm text-xs font-bold uppercase tracking-widest2 text-career-sky">
        <Sparkles size={14} /> <T en="Your starting point" ar="نقطة انطلاقك" />
      </p>
      <h3 className="mb-8 max-w-3xl font-serif text-2xl font-bold leading-snug text-paper md:text-3xl">
        {pick(insight, lang)}
      </h3>

      <article className="mb-5 border border-career-sky/60 bg-career-sky/15 p-7 shadow-[0_0_0_1px_hsl(var(--career-sky)/0.4)]">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="font-dm text-[10px] font-bold uppercase tracking-wider2 text-career-sky">
            <T en="Recommended" ar="موصى به" /> · {pick(primaryService.category, lang)}
          </p>
        </div>
        <h4 className="mb-4 font-dm text-xl font-bold leading-snug text-paper">
          {pick(primaryService.name, lang)}
        </h4>
        <ul className="mb-2 grid gap-2 md:grid-cols-2">
          {primaryService.bullets.map((b) => (
            <li key={b.en} className="text-sm leading-6 text-paper/70 before:mr-2 before:text-career-sky before:content-['—']">
              {pick(b, lang)}
            </li>
          ))}
        </ul>
      </article>

      <p className="mb-7 text-sm leading-6 text-paper/55">
        <T en="You might also benefit from:" ar="قد تستفيد أيضًا من:" />{" "}
        <span className="font-dm font-bold text-paper">{pick(secondaryService.name, lang)}</span>
      </p>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <a href={BOOKING_HREF} target="_blank" rel="noopener noreferrer" className="group inline-flex min-h-12 items-center gap-2 bg-career-blue px-7 font-dm text-xs font-bold uppercase tracking-wider2 text-paper transition-colors hover:bg-career-deep">
          <T en="Book a free 30-minute call" ar="احجز مكالمة مجانية لمدة 30 دقيقة" />
          <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-0.5" />
        </a>
        <button type="button" onClick={onSeeAll} className="font-dm text-xs font-bold uppercase tracking-wider2 text-career-sky underline-offset-4 hover:underline">
          <T en="See all services ↓" ar="اعرض كل الخدمات ↓" />
        </button>
      </div>

      <button type="button" onClick={onReset} className="mt-6 inline-flex items-center gap-2 text-xs text-paper/40 underline-offset-4 hover:text-paper/70 hover:underline">
        <RotateCcw size={12} /> <T en="Start again" ar="ابدأ من جديد" />
      </button>
    </div>
  );
}
