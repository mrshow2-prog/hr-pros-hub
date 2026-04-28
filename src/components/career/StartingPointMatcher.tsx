import { useEffect, useState } from "react";
import { ArrowRight, ArrowUpRight, Compass, RotateCcw, Sparkles } from "lucide-react";
import { BOOKING_HREF } from "@/lib/contact";

type Step = "entry" | 0 | 1 | 2 | "result";

const questions = [
  {
    title: "Where are you right now?",
    options: [
      "Employed, but actively looking for something better",
      "In between roles — currently job hunting",
      "Just made redundant — need to move quickly",
      "Exploring options, no urgency yet",
    ],
  },
  {
    title: "What's your biggest blocker?",
    options: [
      "I apply but don't get interviews",
      "I get interviews but don't get offers",
      "I don't know what I want to do next",
      "I'm underpaid and want to change that",
    ],
  },
  {
    title: "How senior is your next target role?",
    options: [
      "Individual contributor / specialist",
      "Manager or team lead",
      "Director / Head of / VP",
      "C-suite or board level",
    ],
  },
] as const;

// Service catalogue (mirrors the cards in the services grid)
const SERVICES: Record<string, { category: string; name: string; bullets: string[] }> = {
  cv: {
    category: "Foundation",
    name: "CV design & rewrite",
    bullets: [
      "Full rewrite from scratch",
      "UAE/GCC market calibration",
      "ATS-optimised and recruiter-ready",
      "Up to 2 revision rounds",
    ],
  },
  linkedin: {
    category: "Visibility",
    name: "LinkedIn profile optimisation",
    bullets: [
      "Full profile audit and rewrite",
      "Headline and summary repositioning",
      "GCC recruiter keyword strategy",
      "Content and engagement guidance",
    ],
  },
  interview: {
    category: "High impact",
    name: "Interview coaching",
    bullets: [
      "Role-specific interview simulation",
      "Competency question preparation",
      "Salary and offer negotiation",
      "Written feedback after session",
    ],
  },
  brand: {
    category: "Strategic",
    name: "Personal brand strategy",
    bullets: [
      "Brand audit and positioning",
      "Professional narrative development",
      "LinkedIn content strategy",
      "Executive bio and speaker profile",
    ],
  },
  pivot: {
    category: "Transition support",
    name: "Career pivot consulting",
    bullets: [
      "Transferable value mapping",
      "Target role and sector analysis",
      "CV and LinkedIn repositioning",
      "90-day job search action plan",
    ],
  },
  salary: {
    category: "Unique to us",
    name: "Salary negotiation coaching",
    bullets: [
      "Market rate benchmarking",
      "Negotiation script and strategy",
      "Offer evaluation framework",
      "Counter-offer coaching",
    ],
  },
};

type ServiceKey = keyof typeof SERVICES;

const insightFor = (primary: ServiceKey, redundancy: boolean): string => {
  if (primary === "pivot" && redundancy) {
    return "Speed matters now, but direction matters more. Let's get both right before you start applying.";
  }
  switch (primary) {
    case "cv":
      return "Your experience isn't the problem. Your CV isn't showing it.";
    case "interview":
      return "You're getting in the room. The gap is what happens in the room.";
    case "salary":
      return "Before you negotiate, you need leverage. Here's how to build it.";
    case "pivot":
      return "The hardest part isn't the move. It's knowing which move.";
    case "brand":
      return "At your level, the role finds you — if the market knows who you are.";
    case "linkedin":
      return "Recruiters are searching. Make sure they're finding the right version of you.";
  }
};

const recommend = (a: [number, number, number]): { primary: ServiceKey; secondary: ServiceKey; redundancy: boolean } => {
  const [q1, q2, q3] = a;

  // Primary from Q2
  const q2Map: Array<{ primary: ServiceKey; secondary: ServiceKey }> = [
    { primary: "cv", secondary: "linkedin" },         // don't get interviews
    { primary: "interview", secondary: "salary" },     // get interviews, no offers
    { primary: "pivot", secondary: "brand" },          // don't know what I want
    { primary: "salary", secondary: "linkedin" },      // underpaid
  ];
  let { primary, secondary } = q2Map[q2];

  // Q1 override: redundancy → primary becomes pivot
  const redundancy = q1 === 2;
  if (redundancy) {
    primary = "pivot";
    if (secondary === "pivot") secondary = "brand";
  }

  // Q3 override: senior → secondary becomes brand
  const senior = q3 === 2 || q3 === 3;
  if (senior) {
    if (primary === "brand") {
      secondary = "linkedin";
    } else {
      secondary = "brand";
    }
  }

  return { primary, secondary, redundancy };
};

type MatcherTrigger = { q1Index: number; nonce: number } | null;

export default function StartingPointMatcher({ trigger }: { trigger?: MatcherTrigger }) {
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
      if (qIdx < 2) {
        setStep((qIdx + 1) as Step);
      } else {
        setStep("result");
      }
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
                  <Compass size={14} /> Find your starting point
                </p>
                <h2 className="mb-3 font-serif text-3xl font-bold leading-tight text-paper md:text-4xl">
                  Not sure where to start?
                </h2>
                <p className="font-light leading-7 text-paper/55">
                  Answer 3 questions. Get a recommendation in 10 seconds.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStep(0)}
                className="group inline-flex min-h-12 items-center gap-2 bg-career-blue px-7 font-dm text-xs font-bold uppercase tracking-wider2 text-paper transition-colors hover:bg-career-deep"
              >
                Find my starting point
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          )}

          {isQuestion && (
            <div key={step} className="animate-fade-in">
              <div className="mb-6 flex items-center justify-between">
                <p className="font-dm text-xs font-bold uppercase tracking-widest2 text-career-sky">
                  {(step as number) + 1} of 3
                </p>
                <div className="flex gap-1.5" aria-hidden="true">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className={`h-1 w-8 transition-colors ${
                        i <= (step as number) ? "bg-career-sky" : "bg-career-border"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <h3 className="mb-7 font-serif text-2xl font-bold leading-snug text-paper md:text-3xl">
                {questions[step as 0 | 1 | 2].title}
              </h3>
              <div className="grid gap-3 md:grid-cols-2">
                {questions[step as 0 | 1 | 2].options.map((opt, idx) => {
                  const selected = pending === idx;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => choose(step as 0 | 1 | 2, idx)}
                      disabled={pending !== null}
                      className={`flex min-h-12 items-center justify-between gap-3 border px-5 py-3 text-left font-dm text-sm leading-6 transition-all ${
                        selected
                          ? "border-career-sky bg-career-sky/20 text-paper"
                          : "border-career-border bg-career-bg text-paper/75 hover:border-career-sky/50 hover:bg-career-sky/10 hover:text-paper"
                      } disabled:cursor-not-allowed`}
                    >
                      <span>{opt}</span>
                      <ArrowRight
                        size={14}
                        className={`shrink-0 transition-opacity ${selected ? "text-career-sky opacity-100" : "opacity-0"}`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === "result" && answers[0] !== undefined && answers[1] !== undefined && answers[2] !== undefined && (
            <ResultBlock
              answers={answers as [number, number, number]}
              onReset={reset}
              onSeeAll={scrollToServices}
            />
          )}
        </div>
      </div>
    </section>
  );
}

function ResultBlock({
  answers,
  onReset,
  onSeeAll,
}: {
  answers: [number, number, number];
  onReset: () => void;
  onSeeAll: () => void;
}) {
  const { primary, secondary, redundancy } = recommend(answers);
  const primaryService = SERVICES[primary];
  const secondaryService = SERVICES[secondary];
  const insight = insightFor(primary, redundancy);

  return (
    <div className="animate-fade-in">
      <p className="mb-3 inline-flex items-center gap-2 font-dm text-xs font-bold uppercase tracking-widest2 text-career-sky">
        <Sparkles size={14} /> Your starting point
      </p>
      <h3 className="mb-8 max-w-3xl font-serif text-2xl font-bold leading-snug text-paper md:text-3xl">
        {insight}
      </h3>

      <article className="mb-5 border border-career-sky/60 bg-career-sky/15 p-7 shadow-[0_0_0_1px_hsl(var(--career-sky)/0.4)]">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="font-dm text-[10px] font-bold uppercase tracking-wider2 text-career-sky">
            Recommended · {primaryService.category}
          </p>
        </div>
        <h4 className="mb-4 font-dm text-xl font-bold leading-snug text-paper">
          {primaryService.name}
        </h4>
        <ul className="mb-2 grid gap-2 md:grid-cols-2">
          {primaryService.bullets.map((b) => (
            <li
              key={b}
              className="text-sm leading-6 text-paper/70 before:mr-2 before:text-career-sky before:content-['—']"
            >
              {b}
            </li>
          ))}
        </ul>
      </article>

      <p className="mb-7 text-sm leading-6 text-paper/55">
        You might also benefit from:{" "}
        <span className="font-dm font-bold text-paper">{secondaryService.name}</span>
      </p>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <a
          href={BOOKING_HREF}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex min-h-12 items-center gap-2 bg-career-blue px-7 font-dm text-xs font-bold uppercase tracking-wider2 text-paper transition-colors hover:bg-career-deep"
        >
          Book a free 30-minute call
          <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-0.5" />
        </a>
        <button
          type="button"
          onClick={onSeeAll}
          className="font-dm text-xs font-bold uppercase tracking-wider2 text-career-sky underline-offset-4 hover:underline"
        >
          See all services ↓
        </button>
      </div>

      <button
        type="button"
        onClick={onReset}
        className="mt-6 inline-flex items-center gap-2 text-xs text-paper/40 underline-offset-4 hover:text-paper/70 hover:underline"
      >
        <RotateCcw size={12} /> Start again
      </button>
    </div>
  );
}
