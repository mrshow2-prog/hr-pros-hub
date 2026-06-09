import { useEffect, useState } from "react";
import { ShieldCheck, Check, Mail } from "lucide-react";
import { useCVBuilder } from "@/contexts/CVBuilderContext";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { usePaywallEnabled } from "@/hooks/usePaywallEnabled";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

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
  const paywallEnabled = usePaywallEnabled();
  const [loading, setLoading] = useState(false);
  const [requested, setRequested] = useState(false);
  const paid = state.paymentStatus === "paid";

  useEffect(() => {
    if (!open) setRequested(false);
  }, [open]);

  const handleCheckout = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    setPayment("paid");
    setLoading(false);
    onOpenChange(false);
    onPaid?.();
  };

  const handleRequest = async () => {
    setLoading(true);
    const { data: auth } = await supabase.auth.getUser();
    const user = auth.user;
    if (!user) {
      toast.error("Please sign in first.");
      setLoading(false);
      return;
    }
    const { error } = await supabase.from("unlock_requests").insert({
      session_id: state.sessionId,
      user_id: user.id,
      user_email: user.email ?? null,
      status: "pending",
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setRequested(true);
  };

  const showRequestFlow = paywallEnabled === true && !paid;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 overflow-hidden">
        <DialogTitle className="sr-only">Unlock CV Builder</DialogTitle>
        <DialogDescription className="sr-only">Unlock CV export.</DialogDescription>
        <div className="bg-paper p-8 sm:p-10">
          <div className="flex items-baseline justify-between border-b border-ink/10 pb-5">
            <p className="font-syne text-xl text-ink">CV Builder · Full access</p>
            <p className="font-syne text-3xl text-sienna">AED 99</p>
          </div>

          {showRequestFlow && requested ? (
            <div className="my-8 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-sienna/10 flex items-center justify-center mb-3">
                <Mail className="text-sienna" size={22} />
              </div>
              <p className="font-syne text-lg text-ink mb-2">Request forwarded</p>
              <p className="font-dm text-sm text-ink/70">
                Your unlock request has been sent to the admin team. You will be contacted to proceed with payment and unlock.
              </p>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="mt-6 w-full rounded-sm bg-ink py-3 font-dm text-sm font-medium text-paper hover:opacity-90"
              >
                Close
              </button>
            </div>
          ) : (
            <>
              <ul className="my-6 space-y-3">
                {INCLUDED.map((item) => (
                  <li key={item} className="flex items-start gap-3 font-dm text-sm text-ink/80">
                    <Check size={16} className="mt-1 shrink-0 text-sienna" />{item}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={showRequestFlow ? handleRequest : handleCheckout}
                disabled={loading || paid || paywallEnabled === null}
                className="w-full rounded-sm bg-sienna py-4 font-dm text-sm font-medium text-paper hover:opacity-90 disabled:opacity-50"
              >
                {paid
                  ? "Unlocked ✓"
                  : loading
                  ? showRequestFlow ? "Sending request…" : "Opening checkout…"
                  : showRequestFlow
                  ? "Request unlock"
                  : "Pay AED 99 and unlock export"}
              </button>
              {showRequestFlow && (
                <p className="mt-3 text-center font-dm text-xs text-ink/60">
                  Payments are temporarily handled manually. Click to send an unlock request to admin.
                </p>
              )}
              <div className="mt-5 flex items-center justify-center gap-2 font-dm text-xs text-ink/55">
                <ShieldCheck size={14} />Secure · One-time · No subscription
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
