import { useState } from "react";
import { useCVBuilder, type ScratchBasics } from "@/contexts/CVBuilderContext";
import { StepFooter, StepHeader } from "./WizardShell";

/** Compiles the collected basics into a plain-text CV-like blob so downstream
 *  AI functions (gap analysis, generate-cv) have real content to work with. */
function compileBasicsText(b: ScratchBasics): string {
  const contactLine = [b.email, b.phone, b.location, b.linkedin].filter(Boolean).join(" · ");
  return [
    b.fullName || "",
    b.targetTitle ? `Target role: ${b.targetTitle}` : "",
    contactLine,
    b.education ? `\nEDUCATION\n${b.education}` : "",
    b.experience ? `\nEXPERIENCE\n${b.experience}` : "",
    b.certifications ? `\nCERTIFICATIONS\n${b.certifications}` : "",
    b.skills ? `\nSKILLS\n${b.skills}` : "",
    b.extras ? `\nADDITIONAL\n${b.extras}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

interface FieldProps {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: "input" | "textarea";
  required?: boolean;
}

function Field({ label, hint, value, onChange, placeholder, type = "input", required }: FieldProps) {
  return (
    <label className="block">
      <span className="font-dm text-sm text-ink">
        {label}
        {required && <span className="ml-1 text-sienna">*</span>}
      </span>
      {hint && <span className="mt-0.5 block font-dm text-xs text-ink/55">{hint}</span>}
      {type === "textarea" ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="mt-2 min-h-24 w-full resize-y rounded border border-ink/15 bg-paper p-3 font-dm text-sm text-ink placeholder:text-ink/40 focus:border-sienna focus:outline-none"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="mt-2 w-full rounded border border-ink/15 bg-paper p-3 font-dm text-sm text-ink placeholder:text-ink/40 focus:border-sienna focus:outline-none"
        />
      )}
    </label>
  );
}

export default function StepScratchBasics() {
  const { state, setScratchBasics, setParsedText, setStep } = useCVBuilder();
  const b = state.scratchBasics;
  const [error, setError] = useState<string | null>(null);

  const update = (patch: Partial<ScratchBasics>) => setScratchBasics(patch);

  const requiredOk =
    b.fullName.trim().length > 1 &&
    b.email.trim().length > 3 &&
    b.targetTitle.trim().length > 1;

  const handleContinue = () => {
    if (!requiredOk) {
      setError("Please fill in at least your name, email, and target job title.");
      return;
    }
    setError(null);
    const text = compileBasicsText(b);
    setParsedText(text);
    setScratchBasics({ completed: true });
    // Stay on step 3 — the gaps view will now render because completed = true.
  };

  return (
    <>
      <StepHeader
        eyebrow="Step 3 · Basics"
        title="Let's gather the essentials first"
        subtitle="Since you don't have a CV to upload, tell us a bit about yourself. We'll turn this into a first draft, then ask a few sharper questions."
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Field label="Full name" required value={b.fullName} onChange={(v) => update({ fullName: v })} placeholder="e.g. Bishoy Samir" />
        <Field label="Target job title" required value={b.targetTitle} onChange={(v) => update({ targetTitle: v })} placeholder="e.g. Marketing Coordinator" />
        <Field label="Email" required value={b.email} onChange={(v) => update({ email: v })} placeholder="you@example.com" />
        <Field label="Phone" value={b.phone} onChange={(v) => update({ phone: v })} placeholder="+971 …" />
        <Field label="Location" value={b.location} onChange={(v) => update({ location: v })} placeholder="Dubai, UAE" />
        <Field label="LinkedIn URL" value={b.linkedin} onChange={(v) => update({ linkedin: v })} placeholder="linkedin.com/in/…" />
      </div>

      <div className="mt-6 space-y-6">
        <Field
          label="Education"
          hint="School / university, degree, dates. One per line."
          value={b.education}
          onChange={(v) => update({ education: v })}
          type="textarea"
          placeholder={"AUC — BSc Business Administration, 2021–2024"}
        />
        <Field
          label="Any experience?"
          hint="Internships, part-time jobs, volunteering, freelance work. Even short ones count."
          value={b.experience}
          onChange={(v) => update({ experience: v })}
          type="textarea"
          placeholder={"Marketing Intern — ACME Ltd (Jun–Aug 2024)\n- Helped run 3 campaigns on Instagram\n- Wrote weekly newsletters"}
        />
        <Field
          label="Certifications & trainings"
          hint="Online courses, workshops, certifications."
          value={b.certifications}
          onChange={(v) => update({ certifications: v })}
          type="textarea"
          placeholder={"Google Digital Marketing — 2024"}
        />
        <Field
          label="Skills"
          hint="Both hard skills (tools, languages, software) and soft skills."
          value={b.skills}
          onChange={(v) => update({ skills: v })}
          type="textarea"
          placeholder={"Excel, PowerPoint, Canva, Arabic (native), English (fluent), teamwork"}
        />
        <Field
          label="Anything else you'd like on your CV?"
          hint="Awards, projects, hobbies, publications — anything that shows who you are."
          value={b.extras}
          onChange={(v) => update({ extras: v })}
          type="textarea"
          placeholder="Optional"
        />
      </div>

      {error && (
        <p className="mt-4 rounded border-l-2 border-amber-500 bg-amber-50 px-3 py-2 font-dm text-sm text-amber-900">
          {error}
        </p>
      )}

      <StepFooter
        onBack={() => setStep(2)}
        onNext={handleContinue}
        nextDisabled={!requiredOk}
        nextLabel="Continue to gaps"
      />
    </>
  );
}
