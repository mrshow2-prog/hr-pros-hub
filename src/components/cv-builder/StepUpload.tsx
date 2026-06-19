import { useEffect, useRef, useState, DragEvent, ChangeEvent } from "react";
import { UploadCloud, X, FileType2, User, Camera, Pencil } from "lucide-react";
import { useCVBuilder } from "@/contexts/CVBuilderContext";
import { supabase } from "@/integrations/supabase/client";
import { StepFooter, StepHeader } from "./WizardShell";
import PhotoCropperDialog from "./PhotoCropperDialog";
import IntentFields, { isIntentReady } from "./IntentFields";

const ACCEPT = ".pdf,.doc,.docx";
const ALLOWED = ["pdf", "doc", "docx"];
const MAX_BYTES = 5 * 1024 * 1024;
const MAX_FILES = 3;
const PHOTO_TYPES = ["image/jpeg", "image/png"];
const PHOTO_HARD_MAX_BYTES = 20 * 1024 * 1024;
const PHOTO_TARGET_BYTES = 1_000_000;
const PHOTO_MAX_DIMENSION = 1600;

async function compressImage(
  file: File,
  opts: { maxBytes: number; maxDimension: number },
): Promise<File> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("Could not read image."));
      el.src = url;
    });

    let { width, height } = img;
    const scale = Math.min(1, opts.maxDimension / Math.max(width, height));
    width = Math.round(width * scale);
    height = Math.round(height * scale);

    const qualities = [0.85, 0.75, 0.65, 0.55, 0.45];
    let blob: Blob | null = null;

    for (let attempt = 0; attempt < 3; attempt++) {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas not supported.");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      for (const q of qualities) {
        blob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob((b) => resolve(b), "image/jpeg", q),
        );
        if (blob && blob.size <= opts.maxBytes) break;
      }
      if (blob && blob.size <= opts.maxBytes) break;
      width = Math.max(400, Math.round(width * 0.7));
      height = Math.max(400, Math.round(height * 0.7));
    }

    if (!blob) throw new Error("Could not compress image.");
    const base = file.name.replace(/\.[^.]+$/, "") || "photo";
    return new File([blob], `${base}.jpg`, { type: "image/jpeg" });
  } finally {
    URL.revokeObjectURL(url);
  }
}

export default function StepUpload() {
  const { state, setUploadedFiles, setParsedText, setStep, setPhotoPath, setFromScratch } = useCVBuilder();
  const [pasteMode, setPasteMode] = useState(false);
  const [scratchMode, setScratchMode] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState("");
  const [photoUploading, setPhotoUploading] = useState(false);
  const [cropperOpen, setCropperOpen] = useState(false);
  const [cropperSource, setCropperSource] = useState<File | string | null>(null);

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
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess.session?.user.id;
      if (!uid) {
        setError("Please sign in to upload files.");
        continue;
      }
      const safeName = f.name
        .normalize("NFKD")
        .replace(/[^\w.\-]+/g, "_")
        .replace(/_+/g, "_")
        .replace(/^_+|_+$/g, "");
      const path = `${uid}/${state.sessionId}/${Date.now()}-${safeName}`;
      const { error: upErr } = await supabase.storage
        .from("cv-builder-uploads")
        .upload(path, f, { upsert: false, contentType: f.type || "application/octet-stream" });
      if (upErr) {
        console.error("CV upload failed", upErr);
        setError(`We couldn't upload ${f.name}: ${upErr.message}`);
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

  const handlePhoto = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    setPhotoError("");
    if (!PHOTO_TYPES.includes(f.type)) {
      setPhotoError("Please upload a JPG or PNG image. (iPhone HEIC photos: re-save as JPG first.)");
      return;
    }
    if (f.size > PHOTO_HARD_MAX_BYTES) {
      setPhotoError("Photo is too large. Please choose one under 20MB.");
      return;
    }
    setCropperSource(f);
    setCropperOpen(true);
  };

  const openEditCurrent = () => {
    if (!photoUrl) return;
    setPhotoError("");
    setCropperSource(photoUrl);
    setCropperOpen(true);
  };

  const uploadCroppedFile = async (cropped: File) => {
    setCropperOpen(false);
    setPhotoUploading(true);
    let toUpload: File = cropped;
    try {
      toUpload = await compressImage(cropped, {
        maxBytes: PHOTO_TARGET_BYTES,
        maxDimension: PHOTO_MAX_DIMENSION,
      });
    } catch {
      setPhotoUploading(false);
      setPhotoError("Couldn't process this image. Try a different photo.");
      return;
    }
    const { data: sess } = await supabase.auth.getSession();
    const uid = sess.session?.user.id;
    if (!uid) {
      setPhotoUploading(false);
      setPhotoError("Please sign in to upload a photo.");
      return;
    }
    const safePhotoName = toUpload.name.normalize("NFKD").replace(/[^\w.\-]+/g, "_");
    const path = `${uid}/${state.sessionId}/photo-${Date.now()}-${safePhotoName}`;
    const { error: upErr } = await supabase.storage
      .from("cv-builder-uploads")
      .upload(path, toUpload, { upsert: true, contentType: "image/jpeg" });
    setPhotoUploading(false);
    if (upErr) {
      setPhotoError("Couldn't upload the photo. Try again.");
      return;
    }
    setPhotoPath(path);
  };

  const hasSource = pasteMode
    ? state.parsedText.trim().length > 80
    : scratchMode || state.uploadedFiles.length > 0;
  const intentReady = isIntentReady(state.intentForm);
  const canContinue = hasSource && intentReady;
  const showIntent = hasSource;

  const handleNext = () => {
    if (!pasteMode && !scratchMode && !state.parsedText) {
      setParsedText(
        state.uploadedFiles.map((f) => `[${f.name}]`).join("\n") +
          "\n\n(Parsed content will be extracted server-side.)",
      );
    }
    setStep(3);
  };

  const handleScratch = () => {
    setScratchMode(true);
    setPasteMode(false);
    if (!state.parsedText) {
      setParsedText("(Starting from scratch — no source CV uploaded.)");
    }
  };

  return (
    <>
      <StepHeader
        eyebrow="Step 2 · Build"
        title="Start with your current CV"
        subtitle="Drop your latest CV in any format. We'll read it, then ask a few targeted questions. No CV to upload? Start from scratch."
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

      {/* Photo section */}
      <section className="mt-10 border-t border-ink/10 pt-8">
        <p className="font-syne text-lg text-ink">Profile photo (optional)</p>
        <p className="mt-1 font-dm text-sm text-ink/60">
          Recommended in the UAE, GCC, and most MENA markets. JPG or PNG — any size, we'll optimize it.
        </p>

        <div className="mt-5 flex items-center gap-5">
          <button
            type="button"
            onClick={() => (photoUrl ? openEditCurrent() : photoInputRef.current?.click())}
            className="group relative h-24 w-24 shrink-0"
            aria-label={photoUrl ? "Edit profile photo" : "Upload profile photo"}
          >
            <span className="flex h-full w-full items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-ink/20 bg-clay/30 transition-colors group-hover:border-sienna">
              {photoUrl ? (
                <img src={photoUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <User size={32} className="text-ink/35 group-hover:text-sienna" />
              )}
              {photoUploading && (
                <span className="absolute inset-0 flex items-center justify-center bg-paper/75 font-dm text-[10px] text-ink/70">
                  Uploading…
                </span>
              )}
            </span>
            {!photoUploading && (
              <span className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-sienna text-paper ring-2 ring-paper">
                {photoUrl ? <Pencil size={12} /> : <Camera size={14} />}
              </span>
            )}
          </button>

          <input
            ref={photoInputRef}
            type="file"
            accept="image/jpeg,image/png"
            className="sr-only"
            onChange={handlePhoto}
          />

          <div className="flex-1">
            {photoUrl ? (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPhotoPath(null);
                    setPhotoError("");
                  }}
                  className="inline-flex items-center gap-1.5 rounded border border-ink/15 px-3 py-1.5 font-dm text-xs text-ink/55 hover:border-amber-500 hover:text-amber-700"
                >
                  <X size={12} /> Remove photo
                </button>
                <p className="basis-full font-dm text-[11px] text-ink/45">
                  Edit lets you adjust the crop or pick a different photo.
                </p>
              </div>
            ) : (
              <p className="font-dm text-xs text-ink/55">
                Click the circle to add a headshot. You&apos;ll be able to crop and zoom before saving.
              </p>
            )}
          </div>
        </div>

        {photoError && (
          <p className="mt-3 rounded border-l-2 border-amber-500 bg-amber-50 px-3 py-2 font-dm text-sm text-amber-900">
            {photoError}
          </p>
        )}
      </section>

      {showIntent && (
        <section className="mt-10 border-t border-ink/10 pt-8">
          <div className="mb-6">
            <p className="font-dm text-xs uppercase tracking-wider2 text-ink/55">A few targeted questions</p>
            <h3 className="mt-1 font-syne text-xl text-ink">Tell us where this CV is going</h3>
            <p className="mt-1 font-dm text-sm text-ink/60">
              A CV reads differently for a Director of Operations than for a Product Designer. These answers shape every choice the builder makes.
            </p>
          </div>
          <IntentFields />
        </section>
      )}

      <PhotoCropperDialog
        open={cropperOpen}
        source={cropperSource}
        onCancel={() => setCropperOpen(false)}
        onConfirm={uploadCroppedFile}
      />

      <StepFooter
        onBack={() => setStep(1)}
        onNext={handleNext}
        nextDisabled={!canContinue}
        nextLabel={showIntent && !intentReady ? "Answer the questions to continue" : "Continue to gaps"}
      />
      {!scratchMode && state.uploadedFiles.length === 0 && (
        <div className="-mt-4 text-center">
          <button
            type="button"
            onClick={handleScratch}
            className="font-dm text-xs text-ink/55 underline-offset-4 hover:text-sienna hover:underline"
          >
            No CV to upload? Start from scratch →
          </button>
        </div>
      )}
    </>
  );
}
