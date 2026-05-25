import { useState } from "react";
import { ShieldCheck, Check } from "lucide-react";
import { useCVBuilder } from "@/contexts/CVBuilderContext";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const INCLUDED = [
  "Full AI rewrite of every section",
  "Live ATS score with breakdown",
  "Seven professional templates",
  "PDF and Word export, yours to keep",
];

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onPaid?: () => void;
}

export default function PaymentModal({ open, onOpenChange, onPaid }: Props) {
  const { setPayment, state } = useCVBuilder();
  const [loading, setLoading] = useState(false);
  const paid = state.paymentStatus === "paid";

  const handleCheckout = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setPayment("paid");
    setLoading(false);
    onOpenChange(false);
    onPaid?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 overflow-hidden">
        <DialogTitle className="sr-only">Unlock CV Builder</DialogTitle>
        <DialogDescription className="sr-only">One-time payment unlocks export.</DialogDescription>
        <div className="bg-paper p-8 sm:p-10">
          <div className="flex items-baseline justify-between border-b border-ink/10 pb-5">
            <p className="font-syne text-xl text-ink">CV Builder · Full access</p>
            <p className="font-syne text-3xl text-sienna">AED 99</p>
          </div>
          <ul className="my-6 space-y-3">
            {INCLUDED.map((item) => (
              <li key={item} className="flex items-start gap-3 font-dm text-sm text-ink/80">
                <Check size={16} className="mt-1 shrink-0 text-sienna" />{item}
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={handleCheckout}
            disabled={loading || paid}
            className="w-full rounded-sm bg-sienna py-4 font-dm text-sm font-medium text-paper hover:opacity-90 disabled:opacity-50"
          >
            {paid ? "Unlocked ✓" : loading ? "Opening checkout…" : "Pay AED 99 and unlock export"}
          </button>
          <div className="mt-5 flex items-center justify-center gap-2 font-dm text-xs text-ink/55">
            <ShieldCheck size={14} />Secure payment · One-time · No subscription
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
