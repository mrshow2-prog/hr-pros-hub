import { useRef, useState, DragEvent } from "react";
import { FileText, UploadCloud, X, FileType2 } from "lucide-react";
import { useCVBuilder } from "@/contexts/CVBuilderContext";
import { supabase } from "@/integrations/supabase/client";
import { StepFooter, StepHeader } from "./WizardShell";

const ACCEPT = ".pdf,.doc,.docx";
const ALLOWED = ["pdf", "doc", "docx"];
const MAX_BYTES = 5 * 1024 * 1024;
const MAX_FILES = 3;

export default function StepUpload() {
  const { state, setUploadedFiles, setParsedText, setStep } = useCVBuilder();
  const [pasteMode, setPasteMode] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validate = (f: File): string | null => {
    const ext = f.name.split(".").pop()?.toLowerCase() ?? "";
    if (!ALLOWED.includes(ext)) return `${f.name} isn't a PDF or Word file.`;
    if (f.size > MAX_BYTES) return `${f.name} is larger than 5MB.`;
    return null;
  };

  const uploadFiles = async (files: FileList | File[]) => {
    setError("");
    const list = Array.from(files);
    if (state.uploadedFiles.length + list.length > MAX_FILES) {
      setError(`You can upload up to ${MAX_FILES} files.`);
      return;
    }
    const next = [...state.uploadedFiles];
    for (let i = 0; i < list.length; i++) {
      const f = list[i];
      const err = validate(f);
      if (err) {
        setError(err);
        continue;
      }
      setProgress(Math.round(((i + 0.3) / list.length) * 100));
      const path = `${state.sessionId}/${Date.now()}-${f.name}`;
      const { error: upErr } = await supabase.storage
        .from("cv-builder-uploads")
        .upload(path, f, { upsert: false });
      if (upErr) {
        setError(`We couldn't upload ${f.name}. Try again.`);
        continue;
      }
      next.push({ path, name: f.name, size: f.size });
      setProgress(Math.round(((i + 1) / list.length) * 100));
    }
    setUploadedFiles(next);
    setTimeout(() => setProgress(null), 600);
  };

  const removeFile = (path: string) => {
    setUploadedFiles(state.uploadedFiles.filter((f) => f.path !== path));
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    uploadFiles(e.dataTransfer.files);
  };

  const canContinue = pasteMode
    ? state.parsedText.trim().length > 80
    : state.uploadedFiles.length > 0;

  const handleNext = () => {
    if (!pasteMode && !state.parsedText) {
      // Use file names as placeholder context; real parsing happens server-side later.
      setParsedText(
        state.uploadedFiles.map((f) => `[${f.name}]`).join("\n") +
          "\n\n(Parsed content will be extracted server-side.)",
      );
    }
    setStep(2);
  };

  return (
    <>
      <StepHeader
        eyebrow="Step 1 · Upload"
        title="Start with your current CV"
        subtitle="Drop your latest CV in any format. We'll read it, then ask you a few targeted questions so the rewrite reflects the work you've actually done."
      />

      {!pasteMode ? (
        <div>
          <label
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={`flex min-h-56 cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed bg-clay/30 p-10 text-center transition-colors ${
              dragging ? "border-sienna bg-clay/60" : "border-ink/15 hover:border-ink/30"
            }`}
          >
            <UploadCloud className="mb-3 text-sienna" size={32} />
            <p className="font-syne text-lg text-ink">Drop your CV here</p>
            <p className="mt-1 font-dm text-sm text-ink/60">
              or click to browse · PDF or Word · up to 5MB · max {MAX_FILES} files
            </p>
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPT}
              multiple
              className="sr-only"
              onChange={(e) => e.target.files && uploadFiles(e.target.files)}
            />
          </label>

          {progress !== null && (
            <div className="mt-4">
              <div className="h-1 w-full overflow-hidden rounded-full bg-ink/10">
                <div
                  className="h-full bg-sienna transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-2 font-dm text-xs text-ink/55">Reading your CV — {progress}%</p>
            </div>
          )}

          {state.uploadedFiles.length > 0 && (
            <ul className="mt-5 flex flex-wrap gap-2">
              {state.uploadedFiles.map((f) => (
                <li
                  key={f.path}
                  className="inline-flex items-center gap-2 rounded-full border border-ink/15 bg-paper px-3 py-1.5 text-sm text-ink"
                >
                  <FileType2 size={14} className="text-sienna" />
                  <span className="max-w-[200px] truncate">{f.name}</span>
                  <button
                    type="button"
                    onClick={() => removeFile(f.path)}
                    className="text-ink/45 hover:text-ink"
                    aria-label={`Remove ${f.name}`}
                  >
                    <X size={14} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <div>
          <textarea
            value={state.parsedText}
            onChange={(e) => setParsedText(e.target.value)}
            placeholder="Paste the full text of your CV here…"
            className="min-h-72 w-full resize-y rounded-md border border-ink/15 bg-paper p-4 font-dm text-sm text-ink placeholder:text-ink/40 focus:border-sienna focus:outline-none"
          />
          <p className="mt-2 font-dm text-xs text-ink/55">
            {state.parsedText.trim().length} characters
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={() => {
          setError("");
          setPasteMode((p) => !p);
        }}
        className="mt-5 font-dm text-sm text-sienna underline-offset-4 hover:underline"
      >
        {pasteMode ? "← Upload a file instead" : "Or paste your CV text →"}
      </button>

      {error && (
        <p className="mt-4 rounded border-l-2 border-amber-500 bg-amber-50 px-3 py-2 font-dm text-sm text-amber-900">
          {error}
        </p>
      )}

      <StepFooter
        hideBack
        onNext={handleNext}
        nextDisabled={!canContinue}
        nextLabel="Continue to intent"
      />
    </>
  );
}
