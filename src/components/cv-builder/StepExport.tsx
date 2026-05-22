import { useEffect, useState } from "react";
import { FileDown, FileText, Calendar, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useCVBuilder } from "@/contexts/CVBuilderContext";
import { supabase } from "@/integrations/supabase/client";
import { StepFooter, StepHeader } from "./WizardShell";
import { exportCVToDocx, exportCVToPdf, slugify } from "@/lib/cvExport";

export default function StepExport() {
  const { state, setStep, resetSession } = useCVBuilder();
  const [busy, setBusy] = useState<"pdf" | "docx" | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  const cv = state.generatedCV;
  const template = state.selectedTemplate ?? "modern";
  const baseName = slugify(cv?.contact.name || "cv");

  useEffect(() => {
    let active = true;
    (async () => {
      if (!state.photoPath) {
        setPhotoUrl(null);
        return;
      }
      const { data } = await supabase.storage
        .from("cv-builder-uploads")
        .createSignedUrl(state.photoPath, 60 * 60);
      if (active) setPhotoUrl(data?.signedUrl ?? null);
    })();
    return () => {
      active = false;
    };
  }, [state.photoPath]);

  const handlePdf = async () => {
    if (!cv || !printRef.current) return;
    setBusy("pdf");
    try {
      await exportNodeToPdf(printRef.current, `${baseName}-cv.pdf`);
      toast.success("PDF downloaded");
    } catch (e) {
      console.error(e);
      toast.error("Could not generate PDF");
    } finally {
      setBusy(null);
    }
  };

  const handleDocx = async () => {
    if (!cv) return;
    setBusy("docx");
    try {
      await exportCVToDocx(cv, `${baseName}-cv.docx`);
      toast.success("Word file downloaded");
    } catch (e) {
      console.error(e);
      toast.error("Could not generate Word file");
    } finally {
      setBusy(null);
    }
  };

  const disabled = !cv;

  return (
    <>
      <StepHeader
        eyebrow="Step 7 · Export"
        title="Your CV is ready"
        subtitle="Download it in either format. You can come back any time to tweak and re-export."
      />

      <div className="mx-auto max-w-2xl">
        {disabled && (
          <div className="mb-6 rounded-md border border-ink/15 bg-clay/40 p-4 font-dm text-sm text-ink/70">
            No CV draft found. Go back to Step 6 to generate one first.
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <button
            type="button"
            disabled={disabled || busy !== null}
            onClick={handlePdf}
            className="group flex flex-col items-center rounded-md border border-ink/15 bg-paper p-8 transition-colors hover:border-sienna disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy === "pdf" ? (
              <Loader2 className="mb-3 animate-spin text-sienna" size={36} />
            ) : (
              <FileDown className="mb-3 text-sienna" size={36} />
            )}
            <p className="font-syne text-lg text-ink">Download PDF</p>
            <p className="mt-1 font-dm text-sm text-ink/60">For applications and emails</p>
          </button>
          <button
            type="button"
            disabled={disabled || busy !== null}
            onClick={handleDocx}
            className="group flex flex-col items-center rounded-md border border-ink/15 bg-paper p-8 transition-colors hover:border-sienna disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy === "docx" ? (
              <Loader2 className="mb-3 animate-spin text-sienna" size={36} />
            ) : (
              <FileText className="mb-3 text-sienna" size={36} />
            )}
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

      {/* Offscreen full-size render used for PDF capture */}
      {cv && (
        <div
          aria-hidden
          style={{
            position: "fixed",
            left: "-10000px",
            top: 0,
            width: "794px", // ~A4 width at 96dpi
            background: "#ffffff",
            pointerEvents: "none",
          }}
        >
          <div ref={printRef}>
            <CVRenderer cv={cv} template={template} photoUrl={photoUrl} />
          </div>
        </div>
      )}

      <StepFooter onBack={() => setStep(6)} />
    </>
  );
}
