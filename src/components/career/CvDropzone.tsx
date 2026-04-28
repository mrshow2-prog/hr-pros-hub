import { DragEvent, ReactNode, useRef, useState } from "react";
import { AlertTriangle, Edit3, FileText, UploadCloud } from "lucide-react";

type Variant = "ats" | "contact";

interface Props {
  file: File | null;
  onFile: (f: File | null) => void;
  onError: (msg: string) => void;
  error?: string;
  accept: string;
  allowedExt: string[];
  maxBytes?: number;
  variant?: Variant;
  required?: boolean;
  footerNote?: ReactNode;
}

const DEFAULT_MAX = 2 * 1024 * 1024;

const palette = {
  ats: {
    border: "border-career-sky/35",
    borderActive: "border-career-sky/70",
    bg: "bg-career-sky/5",
    bgActive: "bg-career-sky/15",
    accent: "text-career-sky",
    selectedBorder: "border-career-sky/25",
    selectedBg: "bg-career-sky/10",
    helper: "text-paper/45",
    body: "text-paper/70",
    sub: "text-paper/50",
  },
  contact: {
    border: "border-paper/30",
    borderActive: "border-paper/70",
    bg: "bg-paper/10",
    bgActive: "bg-paper/20",
    accent: "text-paper",
    selectedBorder: "border-paper/30",
    selectedBg: "bg-paper/15",
    helper: "text-paper/55",
    body: "text-paper/85",
    sub: "text-paper/65",
  },
} as const;

export default function CvDropzone({
  file,
  onFile,
  onError,
  error,
  accept,
  allowedExt,
  maxBytes = DEFAULT_MAX,
  variant = "ats",
  required,
  footerNote,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const c = palette[variant];

  const acceptedLabel = allowedExt.map((e) => e.toUpperCase()).join(", ");
  const maxLabel = `${Math.round(maxBytes / (1024 * 1024))}MB`;

  const validate = (f: File): string | null => {
    const ext = f.name.split(".").pop()?.toLowerCase() ?? "";
    if (!allowedExt.includes(ext)) return `Unsupported file type. Use ${acceptedLabel}.`;
    if (f.size > maxBytes) return `File is larger than ${maxLabel}. Please upload a smaller file.`;
    return null;
  };

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const f = files[0];
    const err = validate(f);
    if (err) {
      onError(err);
      onFile(null);
      return;
    }
    onError("");
    onFile(f);
  };

  const onDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };
  const onDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  if (file) {
    return (
      <div>
        <div className={`mb-2 flex min-h-20 items-center justify-between gap-4 border ${c.selectedBorder} ${c.selectedBg} px-4 py-4`}>
          <div className="flex min-w-0 items-center gap-3">
            <FileText className={`shrink-0 ${c.accent}`} size={20} />
            <span className={`truncate text-sm ${c.body}`}>{file.name}</span>
          </div>
          <label className={`inline-flex shrink-0 cursor-pointer items-center gap-2 font-dm text-[10px] font-bold uppercase tracking-wider2 ${c.accent}`}>
            <Edit3 size={14} /> Replace
            <input
              ref={inputRef}
              type="file"
              accept={accept}
              onChange={(e) => handleFiles(e.target.files)}
              className="sr-only"
            />
          </label>
        </div>
        <p className={`font-dm text-[11px] ${c.helper}`}>{acceptedLabel} — max {maxLabel}</p>
        {error && <DropzoneError msg={error} />}
      </div>
    );
  }

  return (
    <div>
      <label
        onDragOver={onDragOver}
        onDragEnter={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`flex min-h-36 cursor-pointer flex-col items-center justify-center border border-dashed px-4 py-6 text-center transition-colors ${
          isDragging ? `${c.borderActive} ${c.bgActive}` : `${c.border} ${c.bg}`
        }`}
      >
        <UploadCloud className={`mb-3 ${c.accent}`} size={26} />
        <span className={`font-dm text-sm font-medium ${c.body}`}>Drag your CV here</span>
        <span className={`mt-1 font-dm text-xs ${c.sub}`}>or click to browse files</span>
        <input
          ref={inputRef}
          required={required}
          type="file"
          accept={accept}
          onChange={(e) => handleFiles(e.target.files)}
          className="sr-only"
        />
      </label>
      <p className={`mt-2 font-dm text-[11px] ${c.helper}`}>{acceptedLabel} — max {maxLabel}</p>
      {error && <DropzoneError msg={error} />}
    </div>
  );
}

function DropzoneError({ msg }: { msg: string }) {
  return (
    <div className="mt-3 flex gap-3 border-l-2 border-amber-400/70 bg-amber-400/10 px-4 py-3">
      <AlertTriangle className="mt-0.5 shrink-0 text-amber-300" size={16} />
      <p className="text-xs leading-6 text-amber-100/90">
        <span className="font-bold uppercase tracking-wider2 text-amber-200">File issue · </span>
        {msg}
      </p>
    </div>
  );
}
