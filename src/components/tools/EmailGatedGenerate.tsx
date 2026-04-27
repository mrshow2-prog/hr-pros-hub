import { useState } from "react";
import { FieldLabel, ToolInput } from "./ToolPrimitives";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface Props {
  /** Label shown on the submit button (e.g. "Generate policy", "Build job description"). */
  buttonLabel: string;
  /** Loading-state label (e.g. "Generating…"). */
  loadingLabel: string;
  /** Whether the parent form is valid enough to enable submission (other required fields filled). */
  parentValid: boolean;
  /** Optional message shown when parent is not valid (will be passed by parent via `error`). */
  externalError?: string;
  /** Whether generation is currently in progress. */
  loading: boolean;
  /** Called with the validated email once the user clicks the button. Parent runs the generation. */
  onSubmit: (email: string) => void;
}

/**
 * Email-gated submit block. Captures a required email BEFORE generation runs,
 * so users who change their mind never trigger AI calls.
 */
export default function EmailGatedGenerate({
  buttonLabel,
  loadingLabel,
  parentValid,
  externalError,
  loading,
  onSubmit,
}: Props) {
  const [email, setEmail] = useState("");
  const [localError, setLocalError] = useState("");

  const handleClick = () => {
    const trimmed = email.trim();
    if (!emailPattern.test(trimmed)) {
      setLocalError("Enter a valid email — your document will be sent here.");
      return;
    }
    if (trimmed.length > 320) {
      setLocalError("Email is too long.");
      return;
    }
    setLocalError("");
    onSubmit(trimmed);
  };

  return (
    <div className="mt-6">
      <FieldLabel>Your email</FieldLabel>
      <p className="-mt-1 mb-3 font-dm text-xs leading-6 text-ink/55">
        Required. We&rsquo;ll email you the generated document so you have a copy on record.
      </p>
      <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-stretch">
        <ToolInput
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (localError) setLocalError("");
          }}
          placeholder="name@company.com"
          maxLength={320}
          disabled={loading}
        />
        <button
          type="button"
          onClick={handleClick}
          disabled={loading || !parentValid}
          className="bg-sienna px-7 py-4 font-dm text-xs font-bold uppercase tracking-wider2 text-paper transition-colors hover:bg-umber disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? loadingLabel : buttonLabel}
        </button>
      </div>
      {(localError || externalError) && (
        <p className="mt-3 font-dm text-xs font-medium text-risk-red">{localError || externalError}</p>
      )}
    </div>
  );
}
