import { useState } from "react";
import { saveToolLead } from "@/lib/toolsTracking";
import { FieldLabel, ToolInput } from "./ToolPrimitives";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface Props {
  toolName: string;
  /** The generated output to attach to the lead record. */
  getOutputText: () => string;
}

/**
 * Optional, post-output email capture used by the JD Builder and
 * Policy Generator tools. Not required to use the tool.
 */
export default function ToolEmailCapture({ toolName, getOutputText }: Props) {
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
    const ok = await saveToolLead({
      toolName,
      outputText: output,
      userEmail: trimmed,
    });

    if (ok) {
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
