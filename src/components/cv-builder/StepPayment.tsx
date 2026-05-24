import { useState } from "react";
import { ShieldCheck, Check } from "lucide-react";
import { useCVBuilder } from "@/contexts/CVBuilderContext";
import { StepFooter, StepHeader } from "./WizardShell";

const INCLUDED = [
  "Full AI rewrite of every section",
  "Live ATS score with breakdown",
  "Five professional templates",
  "PDF and Word export, yours to keep",
];

export default function StepPayment() {
  const { setPayment, setStep, state } = useCVBuilder();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    // Stripe checkout will be wired here. Stub: mark paid and advance.
    await new Promise((r) => setTimeout(r, 600));
    setPayment("paid");
    setStep(6);
  };

  const paid = state.paymentStatus === "paid";

  return (
    <>
      <StepHeader
        eyebrow="Step 5 · Unlock"
        title="One payment. The CV is yours."
        subtitle="No subscription, no monthly fee. You unlock the builder once and keep every export."
      />

      <div className="mx-auto max-w-xl rounded-md border border-ink/10 bg-paper p-8 shadow-sm sm:p-10">
        <div className="flex items-baseline justify-between border-b border-ink/10 pb-5">
          <p className="font-syne text-xl text-ink">CV Builder · Full access</p>
          <p className="font-syne text-3xl text-sienna">AED 99</p>
        </div>

        <ul className="my-6 space-y-3">
          {INCLUDED.map((item) => (
            <li key={item} className="flex items-start gap-3 font-dm text-sm text-ink/80">
              <Check size={16} className="mt-1 shrink-0 text-sienna" />
              {item}
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={handleCheckout}
          disabled={loading || paid}
          className="w-full rounded-sm bg-sienna py-4 font-dm text-sm font-medium text-paper transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {paid ? "Unlocked ✓" : loading ? "Opening secure checkout…" : "Pay AED 99 and continue"}
        </button>

        <div className="mt-5 flex items-center justify-center gap-2 font-dm text-xs text-ink/55">
          <ShieldCheck size={14} />
          Secure payment · One-time · No subscription
        </div>
      </div>

      <StepFooter
        onBack={() => setStep(4)}
        onNext={paid ? () => setStep(6) : undefined}
        nextLabel="Continue"
      />
    </>
  );
}
