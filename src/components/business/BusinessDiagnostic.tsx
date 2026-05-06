import { useState } from "react";
import { DIAGNOSTIC_QUESTIONS } from "@/data/business";

interface Result {
  label: string;
  colorClass: string;
  borderColor: string;
  summary: string;
}

function getResult(score: number, max: number): Result {
  const pct = score / max;
  if (pct >= 0.8)
    return {
      label: "Solid Foundation",
      colorClass: "text-emerald-500",
      borderColor: "rgb(16 185 129)",
      summary: "Your HR basics are largely in place. A targeted audit can close remaining gaps before they become costly.",
    };
  if (pct >= 0.5)
    return {
      label: "Needs Attention",
      colorClass: "text-terracotta",
      borderColor: "hsl(var(--terracotta))",
      summary: "Material risks exist — particularly around compliance and documentation. These need addressing before you scale.",
    };
  return {
    label: "Significant Exposure",
    colorClass: "text-terracotta-deep",
    borderColor: "hsl(var(--terracotta-deep))",
    summary: "Your business has critical HR gaps. One inspection, complaint, or exit dispute could result in significant financial and reputational damage.",
  };
}

export default function BusinessDiagnostic() {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, "yes" | "no">>({});
  const [submitted, setSubmitted] = useState(false);
  const [started, setStarted] = useState(false);

  const maxScore = DIAGNOSTIC_QUESTIONS.reduce((s, q) => s + q.weight, 0);
  const score = Object.entries(answers).reduce((s, [id, val]) => {
    const q = DIAGNOSTIC_QUESTIONS.find((q) => q.id === id);
    return s + (val === "yes" ? q?.weight || 1 : 0);
  }, 0);
  const result = submitted ? getResult(score, maxScore) : null;
  const scorePct = Math.round((score / maxScore) * 100);
  const risks = DIAGNOSTIC_QUESTIONS.filter((q) => answers[q.id] === "no");

  const q = DIAGNOSTIC_QUESTIONS[currentQ];

  const handleAnswer = (val: "yes" | "no") => {
    setAnswers((p) => ({ ...p, [q.id]: val }));
    if (currentQ < DIAGNOSTIC_QUESTIONS.length - 1) {
      setTimeout(() => setCurrentQ((c) => c + 1), 250);
    } else {
      setTimeout(() => setSubmitted(true), 250);
    }
  };

  if (!started) {
    return (
      <section id="diagnostic" className="px-6 md:px-20 py-24 bg-ink">
        <div className="max-w-2xl mx-auto">
          <span className="font-dm font-bold text-xs uppercase block mb-5 text-terracotta" style={{ letterSpacing: "0.18em" }}>
            Free HR Diagnostic
          </span>
          <h2 className="font-serif font-bold mb-5 text-cream" style={{ fontSize: "clamp(2rem, 4vw, 2.8rem)", letterSpacing: "-0.02em" }}>
            Is your HR holding
            <br />
            you back — or exposing you?
          </h2>
          <p className="font-dm mb-8 text-cream/50" style={{ fontWeight: 300 }}>
            6 questions. No email. Instant score with a risk breakdown.
          </p>
          <button
            onClick={() => setStarted(true)}
            className="font-dm font-bold text-sm uppercase px-10 py-4 rounded-sm transition-colors duration-200 bg-terracotta hover:bg-terracotta-deep text-cream"
            style={{ letterSpacing: "0.08em" }}
          >
            Start the Diagnostic →
          </button>
        </div>
      </section>
    );
  }

  if (submitted && result) {
    return (
      <section id="diagnostic" className="px-6 md:px-20 py-24 bg-ink">
        <div className="max-w-2xl mx-auto">
          <span className="font-dm font-bold text-xs uppercase block mb-8 text-terracotta" style={{ letterSpacing: "0.18em" }}>
            Your Results
          </span>

          <div
            className="p-8 mb-8"
            style={{ background: "hsl(var(--cream) / 0.04)", border: `1px solid ${result.borderColor}` }}
          >
            <div className="flex items-center gap-8 mb-6 flex-wrap">
              <div className={`font-serif font-bold ${result.colorClass}`} style={{ fontSize: "4rem", lineHeight: 1 }}>
                {scorePct}
                <span className="text-2xl text-cream/30">%</span>
              </div>
              <div>
                <div className={`font-serif font-semibold text-xl mb-1 ${result.colorClass}`}>{result.label}</div>
                <p className="font-dm text-sm leading-relaxed text-cream/65" style={{ fontWeight: 300, maxWidth: "30ch" }}>
                  {result.summary}
                </p>
              </div>
            </div>

            {risks.length > 0 && (
              <div>
                <p className="font-dm font-bold text-xs uppercase mb-4 text-terracotta-soft" style={{ letterSpacing: "0.12em" }}>
                  Identified Risks & Recommendations
                </p>
                <ul className="space-y-3">
                  {risks.map((r, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="text-terracotta flex-shrink-0">⚠</span>
                      <div>
                        <p className="font-dm text-sm text-cream/65" style={{ fontWeight: 300 }}>
                          {r.risk}
                        </p>
                        <a href="#services" className="font-dm text-xs font-bold text-terracotta">
                          → Recommended: {r.service}
                        </a>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-4">
            <a
              href="#contact"
              className="font-dm font-bold text-sm uppercase px-8 py-4 rounded-sm bg-terracotta hover:bg-terracotta-deep text-cream transition-colors"
              style={{ letterSpacing: "0.06em" }}
            >
              Book Free Consultation →
            </a>
            <a
              href="/tools#diagnostic"
              className="font-dm font-bold text-sm uppercase px-8 py-4 rounded-sm text-cream/55 hover:text-cream transition-colors"
              style={{ border: "1px solid hsl(var(--cream) / 0.15)", letterSpacing: "0.06em" }}
            >
              Take the Full Diagnostic →
            </a>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="diagnostic" className="px-6 md:px-20 py-24 bg-ink">
      <div className="max-w-2xl mx-auto">
        <span className="font-dm font-bold text-xs uppercase block mb-8 text-terracotta" style={{ letterSpacing: "0.18em" }}>
          Free HR Diagnostic
        </span>

        <div className="mb-10">
          <div className="flex justify-between mb-2">
            <span className="font-dm text-xs text-cream/40">
              Question {currentQ + 1} of {DIAGNOSTIC_QUESTIONS.length}
            </span>
            <span className="font-dm text-xs text-cream/40">
              {Math.round((currentQ / DIAGNOSTIC_QUESTIONS.length) * 100)}% complete
            </span>
          </div>
          <div className="h-0.5 w-full bg-cream/10">
            <div
              className="h-0.5 transition-all duration-500 bg-terracotta"
              style={{ width: `${(currentQ / DIAGNOSTIC_QUESTIONS.length) * 100}%` }}
            />
          </div>
        </div>

        <div
          className="p-8 mb-6 animate-fade-up"
          key={q.id}
          style={{ background: "hsl(var(--cream) / 0.04)", border: "1px solid hsl(var(--cream) / 0.08)" }}
        >
          <p className="font-serif font-semibold text-xl leading-snug mb-8 text-cream">{q.text}</p>
          <div className="flex gap-4">
            <button
              onClick={() => handleAnswer("yes")}
              className="flex-1 font-dm font-bold text-sm uppercase py-4 rounded-sm bg-terracotta hover:bg-terracotta-deep text-cream transition-colors"
              style={{ letterSpacing: "0.08em" }}
            >
              ✓ Yes
            </button>
            <button
              onClick={() => handleAnswer("no")}
              className="flex-1 font-dm font-bold text-sm uppercase py-4 rounded-sm text-cream/55 hover:text-cream hover:border-terracotta transition-colors"
              style={{ border: "1px solid hsl(var(--cream) / 0.15)", letterSpacing: "0.08em" }}
            >
              ✗ No
            </button>
          </div>
        </div>

        {currentQ > 0 && (
          <button
            onClick={() => setCurrentQ((c) => c - 1)}
            className="font-dm text-sm text-cream/35 hover:text-cream transition-colors"
          >
            ← Back
          </button>
        )}
      </div>
    </section>
  );
}
