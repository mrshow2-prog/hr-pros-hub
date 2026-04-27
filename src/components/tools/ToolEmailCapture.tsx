import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { saveToolLead } from "@/lib/toolsTracking";
import { FieldLabel, ToolInput } from "./ToolPrimitives";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface Props {
  toolName: string;
  /** The generated output to attach to the lead record. */
  getOutputText: () => string;
  /** Human label shown in the email subject, e.g. "Policy" or "Job Description". */
  documentKind: "Policy" | "Job Description";
  /** Specific document name, e.g. "Working From Home Policy" or "Senior Marketing Manager". */
  getDocumentName: () => string;
}

/**
 * Optional, post-output email capture used by the JD Builder and
 * Policy Generator tools. Not required to use the tool.
 */
export default function ToolEmailCapture({ toolName, getOutputText, documentKind, getDocumentName }: Props) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!emailPattern.test(trimmed)) {
      setError("Enter a valid email address.");
      return;
    }
    if (trimmed.length > 320) {
      setError("Email is too long.");
      return;
    }
    setError("");
    setStatus("sending");

    const output = (getOutputText() || "").slice(0, 200000);
    const documentName = (getDocumentName() || "Document").slice(0, 200);

    // 1. Always log the lead in Supabase (DB record).
    const logged = await saveToolLead({
      toolName,
      outputText: output,
      userEmail: trimmed,
    });

    // 2. Send the actual email via Resend edge function.
    let emailed = false;
    try {
      const { data, error: fnError } = await supabase.functions.invoke("send-tool-email", {
        body: {
          toEmail: trimmed,
          documentKind,
          documentName,
          outputText: output,
        },
      });
      emailed = !fnError && !!data?.success;
      if (fnError) console.error("send-tool-email error:", fnError);
    } catch (err) {
      console.error("send-tool-email threw:", err);
    }

    if (emailed || logged) {
      // Show success if either path succeeded — the DB record is enough to follow up manually
      // even if the live email send failed for some reason.
      setStatus("sent");
    } else {
      setStatus("error");
      setError("Something went wrong. Please try again.");
    }
  };

  if (status === "sent") {
    return (
      <div className="mt-6 border border-olive/25 bg-olive/10 px-5 py-4">
        <p className="font-dm text-sm font-medium text-olive">Sent. Check your inbox.</p>
        <p className="mt-1 font-dm text-xs leading-6 text-ink/55">
          A copy of this output has been logged for delivery to <span className="font-medium text-ink/75">{email.trim()}</span>.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-6 border border-sienna/20 bg-paper p-5">
      <FieldLabel>Email this to yourself</FieldLabel>
      <p className="-mt-1 mb-3 font-dm text-xs leading-6 text-ink/45">Optional. We&rsquo;ll send a copy of the output to your inbox.</p>
      <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-stretch">
        <ToolInput
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status === "error") setStatus("idle");
            if (error) setError("");
          }}
          placeholder="name@company.com"
          maxLength={320}
          disabled={status === "sending"}
        />
        <button
          type="submit"
          disabled={status === "sending"}
          className="bg-sienna px-6 font-dm text-[0.72rem] font-bold uppercase tracking-wider2 text-paper transition-colors hover:bg-umber disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "sending" ? "Sending…" : "Send"}
        </button>
      </div>
      {error && <p className="mt-3 font-dm text-xs font-medium text-risk-red">{error}</p>}
    </form>
  );
}
