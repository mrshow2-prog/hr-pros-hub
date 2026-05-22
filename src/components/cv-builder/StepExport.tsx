import { FileDown, FileText, Calendar } from "lucide-react";
import { useCVBuilder } from "@/contexts/CVBuilderContext";
import { StepFooter, StepHeader } from "./WizardShell";

export default function StepExport() {
  const { setStep, resetSession } = useCVBuilder();

  const handleDownload = (format: "pdf" | "docx") => {
    // Real export will be wired to a server function. For now, just notify.
    alert(`${format.toUpperCase()} export will be generated server-side.`);
  };

  return (
    <>
      <StepHeader
        eyebrow="Step 7 · Export"
        title="Your CV is ready"
        subtitle="Download it in either format. You can come back any time to tweak and re-export."
      />

      <div className="mx-auto max-w-2xl">
        <div className="grid gap-4 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => handleDownload("pdf")}
            className="group flex flex-col items-center rounded-md border border-ink/15 bg-paper p-8 transition-colors hover:border-sienna"
          >
            <FileDown className="mb-3 text-sienna" size={36} />
            <p className="font-syne text-lg text-ink">Download PDF</p>
            <p className="mt-1 font-dm text-sm text-ink/60">For applications and emails</p>
          </button>
          <button
            type="button"
            onClick={() => handleDownload("docx")}
            className="group flex flex-col items-center rounded-md border border-ink/15 bg-paper p-8 transition-colors hover:border-sienna"
          >
            <FileText className="mb-3 text-sienna" size={36} />
            <p className="font-syne text-lg text-ink">Download Word</p>
            <p className="mt-1 font-dm text-sm text-ink/60">For recruiters who ask for .docx</p>
          </button>
        </div>

        <div className="mt-10 rounded-md border border-ink/10 bg-clay/40 p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sienna/15 text-sienna">
              <Calendar size={18} />
            </div>
            <div className="flex-1">
              <p className="font-syne text-base text-ink">Want a human eye on it?</p>
              <p className="mt-1 font-dm text-sm text-ink/70">
                Book a 30-minute review with a People.Studio consultant. They'll read it through a
                hiring manager's lens and give you a short list of what to sharpen.
              </p>
            </div>
            <a
              href="https://calendly.com/peoplestudio/cv-review"
              target="_blank"
              rel="noreferrer"
              className="shrink-0 rounded-sm border border-sienna px-4 py-2 font-dm text-sm text-sienna hover:bg-sienna hover:text-paper"
            >
              Book a review
            </a>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            if (confirm("Start a fresh CV? Your current draft will be cleared.")) {
              resetSession();
            }
          }}
          className="mt-8 block w-full text-center font-dm text-sm text-ink/55 underline-offset-4 hover:text-ink hover:underline"
        >
          Start a fresh CV
        </button>
      </div>

      <StepFooter onBack={() => setStep(6)} />
    </>
  );
}
