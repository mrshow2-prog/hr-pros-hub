import { useEffect, useState } from "react";
import { FileDown, FileText, Calendar, Loader2, Lock } from "lucide-react";
import { toast } from "sonner";
import { useCVBuilder } from "@/contexts/CVBuilderContext";
import { supabase } from "@/integrations/supabase/client";
import { StepFooter, StepHeader } from "./WizardShell";
import { exportCVToDocx, exportCVToPdf, slugify } from "@/lib/cvExport";
import PaymentModal from "./PaymentModal";
import { getPalette } from "@/lib/cv/palettes";

function paletteHexFor(id: string) {
  return getPalette(id).accentHex;
}

export default function StepExport() {
  const { state, setStep, resetSession } = useCVBuilder();
  const [busy, setBusy] = useState<"pdf" | "docx" | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [payOpen, setPayOpen] = useState(false);
  const [pendingFormat, setPendingFormat] = useState<"pdf" | "docx" | null>(null);

  const cv = state.generatedCV;
  const template = state.selectedTemplate ?? "simple";
  const baseName = slugify(cv?.contact.name || "cv");
  const paid = state.paymentStatus === "paid";

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

  const exportOpts = {
    accentHex: paletteHexFor(state.intentForm.colorPalette),
    photoShape: state.intentForm.photoShape,
    sidebarPlacement: state.intentForm.sidebarPlacement,
  };

  /** Re-sign the photo URL just before export so a stale/expired token never silently drops the photo. */
  const getFreshPhotoUrl = async (): Promise<string | null> => {
    if (!state.photoPath) return null;
    const { data } = await supabase.storage
      .from("cv-builder-uploads")
      .createSignedUrl(state.photoPath, 60 * 60);
    const url = data?.signedUrl ?? null;
    if (url) setPhotoUrl(url);
    return url ?? photoUrl;
  };

  const doPdf = async () => {
    if (!cv) return;
    setBusy("pdf");
    try {
      const url = await getFreshPhotoUrl();
      await exportCVToPdf(cv, template, url, `${baseName}-cv.pdf`, exportOpts);
      toast.success("PDF downloaded");
    } catch (e) {
      console.error(e); toast.error("Could not generate PDF");
    } finally { setBusy(null); }
  };

  const doDocx = async () => {
    if (!cv) return;
    setBusy("docx");
    try {
      const url = await getFreshPhotoUrl();
      await exportCVToDocx(cv, `${baseName}-cv.docx`, template, url, exportOpts);
      toast.success("Word file downloaded");
    } catch (e) {
      console.error(e); toast.error("Could not generate Word file");
    } finally { setBusy(null); }
  };

  const previewOnly = template === "vibrant" || template === "gradient" || template === "creative";

  const requestExport = (fmt: "pdf" | "docx") => {
    if (!paid) {
      setPendingFormat(fmt);
      setPayOpen(true);
      return;
    }
    if (fmt === "pdf") doPdf(); else doDocx();
  };

  const onPaid = () => {
    const fmt = pendingFormat;
    setPendingFormat(null);
    if (fmt === "pdf") doPdf();
    else if (fmt === "docx") doDocx();
  };

  const disabled = !cv;

  return (
    <>
      <StepHeader
        eyebrow="Step 5 · Export"
        title="Your CV is ready"
        subtitle={paid ? "Download it in either format. Come back anytime to tweak and re-export." : "Pick your format. You'll be prompted to unlock once before your first download."}
      />

      <div className="mx-auto max-w-2xl">
        {disabled && (
          <div className="mb-6 rounded-md border border-ink/15 bg-clay/40 p-4 font-dm text-sm text-ink/70">
            No CV draft found. Go back to the draft step to generate one first.
          </div>
        )}

        {!disabled && previewOnly && (
          <div className="mb-6 rounded-md border border-sienna/30 bg-sienna/5 p-4 font-dm text-sm text-ink/75">
            <strong className="font-semibold text-ink">Heads-up:</strong> this template's downloaded
            file uses a close-matching classic layout. The exact preview design is being prepared
            for download — switch to any other template for pixel-perfect export.
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <button
            type="button"
            disabled={disabled || busy !== null}
            onClick={() => requestExport("pdf")}
            className="group relative flex flex-col items-center rounded-md border border-ink/15 bg-paper p-8 transition-colors hover:border-sienna disabled:cursor-not-allowed disabled:opacity-50"
          >
            {!paid && (
              <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-ink/5 px-2 py-0.5 font-dm text-[10px] text-ink/55">
                <Lock size={10} /> Locked
              </span>
            )}
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
            onClick={() => requestExport("docx")}
            className="group relative flex flex-col items-center rounded-md border border-ink/15 bg-paper p-8 transition-colors hover:border-sienna disabled:cursor-not-allowed disabled:opacity-50"
          >
            {!paid && (
              <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-ink/5 px-2 py-0.5 font-dm text-[10px] text-ink/55">
                <Lock size={10} /> Locked
              </span>
            )}
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

      <PaymentModal
        open={payOpen}
        onOpenChange={(open) => {
          setPayOpen(open);
          if (!open) setPendingFormat(null);
        }}
        onPaid={onPaid}
      />

      <StepFooter onBack={() => setStep(4)} />
    </>
  );
}
