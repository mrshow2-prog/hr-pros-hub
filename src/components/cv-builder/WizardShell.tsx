import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Lock } from "lucide-react";
import { useCVBuilder } from "@/contexts/CVBuilderContext";
import { cn } from "@/lib/utils";

const STEPS = [
  { n: 1, label: "Upload", tier: "Free" },
  { n: 2, label: "Intent", tier: "Free" },
  { n: 3, label: "Gaps", tier: "Free" },
  { n: 4, label: "Unlock", tier: "Free" },
  { n: 5, label: "Template", tier: "Paid" },
  { n: 6, label: "Draft", tier: "Paid" },
  { n: 7, label: "Export", tier: "Paid" },
] as const;

interface Props {
  children: ReactNode;
  stepKey: number;
}

export default function WizardShell({ children, stepKey }: Props) {
  const { state } = useCVBuilder();
  const paid = state.paymentStatus === "paid";

  return (
    <div className="min-h-screen bg-paper text-ink">
      {/* Sticky progress */}
      <header className="sticky top-0 z-30 border-b border-ink/10 bg-paper/85 backdrop-blur">
        <div className="mx-auto max-w-5xl px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center justify-between">
            <p className="font-syne text-sm tracking-wide text-ink">CV Builder</p>
            <p className="font-dm text-[11px] uppercase tracking-wider2 text-ink/55">
              Step {state.currentStep} of 7
            </p>
          </div>

          <ol className="mt-3 flex items-center gap-1.5 sm:gap-2">
            {STEPS.map((s) => {
              const done = state.currentStep > s.n;
              const active = state.currentStep === s.n;
              const locked = s.tier === "Paid" && !paid;
              return (
                <li key={s.n} className="flex-1">
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[10px] font-medium",
                        done && "border-sienna bg-sienna text-paper",
                        active && !done && "border-sienna bg-paper text-sienna",
                        !done && !active && "border-ink/20 bg-paper text-ink/45",
                      )}
                    >
                      {done ? <Check size={12} /> : locked ? <Lock size={10} /> : s.n}
                    </div>
                    <div className="hidden min-w-0 sm:block">
                      <p
                        className={cn(
                          "truncate font-dm text-xs",
                          active ? "text-ink" : "text-ink/55",
                        )}
                      >
                        {s.label}
                      </p>
                      <p className="font-dm text-[9px] uppercase tracking-wider2 text-ink/40">
                        {s.tier}
                      </p>
                    </div>
                  </div>
                  <div
                    className={cn(
                      "mt-2 h-0.5 w-full rounded-full",
                      done || active ? "bg-sienna" : "bg-ink/10",
                    )}
                  />
                </li>
              );
            })}
          </ol>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        <AnimatePresence mode="wait">
          <motion.div
            key={stepKey}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

export function StepHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-8 max-w-2xl">
      <p className="font-dm text-[11px] uppercase tracking-widest2 text-sienna">{eyebrow}</p>
      <h1 className="mt-3 font-syne text-3xl leading-tight text-ink sm:text-4xl">{title}</h1>
      {subtitle && <p className="mt-3 text-base leading-relaxed text-ink/65">{subtitle}</p>}
    </div>
  );
}

export function StepFooter({
  onBack,
  onNext,
  nextLabel = "Continue",
  nextDisabled,
  nextLoading,
  hideBack,
}: {
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  nextLoading?: boolean;
  hideBack?: boolean;
}) {
  return (
    <div className="mt-10 flex items-center justify-between border-t border-ink/10 pt-6">
      <button
        type="button"
        onClick={onBack}
        disabled={hideBack || !onBack}
        className="font-dm text-sm text-ink/60 transition-colors hover:text-ink disabled:invisible"
      >
        ← Back
      </button>
      {onNext && (
        <button
          type="button"
          onClick={onNext}
          disabled={nextDisabled || nextLoading}
          className="inline-flex items-center gap-2 rounded-sm bg-sienna px-6 py-3 font-dm text-sm font-medium text-paper transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {nextLoading ? "Working…" : nextLabel}
        </button>
      )}
    </div>
  );
}
