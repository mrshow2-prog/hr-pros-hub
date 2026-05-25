import { useCallback, useEffect, useRef, useState } from "react";
import Cropper, { Area } from "react-easy-crop";
import { Camera, RotateCw, X, Check } from "lucide-react";

interface Props {
  open: boolean;
  /** Initial image: either a freshly-picked File, or an https URL to an existing photo to re-crop. */
  source: File | string | null;
  /** Square output size in px. */
  outputSize?: number;
  onCancel: () => void;
  onConfirm: (file: File) => void;
}

async function urlToImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not load image."));
    img.src = src;
  });
}

async function cropToFile(
  src: string,
  area: Area,
  rotation: number,
  size: number,
  fileName: string,
): Promise<File> {
  const img = await urlToImage(src);
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported.");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, size, size);

  // Rotate around image center, then draw the cropped area
  const rad = (rotation * Math.PI) / 180;
  // Use an intermediate canvas to apply rotation
  const tmp = document.createElement("canvas");
  const tctx = tmp.getContext("2d");
  if (!tctx) throw new Error("Canvas not supported.");
  // Bounding box for rotated image
  const sin = Math.abs(Math.sin(rad));
  const cos = Math.abs(Math.cos(rad));
  tmp.width = img.width * cos + img.height * sin;
  tmp.height = img.width * sin + img.height * cos;
  tctx.translate(tmp.width / 2, tmp.height / 2);
  tctx.rotate(rad);
  tctx.drawImage(img, -img.width / 2, -img.height / 2);

  // Area is in original (unrotated) image coords from react-easy-crop, but with rotation
  // react-easy-crop returns area relative to the *displayed* (rotated) media, so use tmp.
  ctx.drawImage(
    tmp,
    area.x,
    area.y,
    area.width,
    area.height,
    0,
    0,
    size,
    size,
  );

  const blob: Blob = await new Promise((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Could not export image."))),
      "image/jpeg",
      0.88,
    ),
  );
  const base = fileName.replace(/\.[^.]+$/, "") || "photo";
  return new File([blob], `${base}.jpg`, { type: "image/jpeg" });
}

export default function PhotoCropperDialog({
  open,
  source,
  outputSize = 800,
  onCancel,
  onConfirm,
}: Props) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState("photo");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [busy, setBusy] = useState(false);
  const areaRef = useRef<Area | null>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const createdUrlRef = useRef<string | null>(null);

  const loadSource = useCallback(async (src: File | string) => {
    if (createdUrlRef.current) {
      URL.revokeObjectURL(createdUrlRef.current);
      createdUrlRef.current = null;
    }
    if (typeof src === "string") {
      // Fetch as blob to avoid canvas taint when exporting.
      try {
        const res = await fetch(src, { mode: "cors" });
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        createdUrlRef.current = url;
        setImageSrc(url);
        setFileName("photo");
      } catch {
        // Fallback to direct URL; export may fail if CORS blocks.
        setImageSrc(src);
        setFileName("photo");
      }
    } else {
      const url = URL.createObjectURL(src);
      createdUrlRef.current = url;
      setImageSrc(url);
      setFileName(src.name || "photo");
    }
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
  }, []);

  useEffect(() => {
    if (!open || !source) return;
    void loadSource(source);
    return () => {
      if (createdUrlRef.current) {
        URL.revokeObjectURL(createdUrlRef.current);
        createdUrlRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, source]);

  const handleReplace = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (!["image/jpeg", "image/png"].includes(f.type)) return;
    void loadSource(f);
  };

  const handleConfirm = async () => {
    if (!imageSrc || !areaRef.current) return;
    setBusy(true);
    try {
      const file = await cropToFile(
        imageSrc,
        areaRef.current,
        rotation,
        outputSize,
        fileName,
      );
      onConfirm(file);
    } catch (err) {
      console.error(err);
    } finally {
      setBusy(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Edit photo"
    >
      <div className="relative w-full max-w-md rounded-md bg-paper shadow-xl">
        <div className="flex items-center justify-between border-b border-ink/10 px-5 py-3">
          <p className="font-syne text-base text-ink">Adjust photo</p>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close"
            className="rounded p-1 text-ink/55 hover:bg-ink/5 hover:text-ink"
          >
            <X size={16} />
          </button>
        </div>

        <div className="relative h-72 w-full bg-ink/90">
          {imageSrc && (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onRotationChange={setRotation}
              onCropComplete={(_, areaPixels) => {
                areaRef.current = areaPixels;
              }}
            />
          )}
        </div>

        <div className="space-y-4 px-5 py-4">
          <div>
            <label className="flex items-center justify-between font-dm text-xs text-ink/65">
              <span>Zoom</span>
              <span className="tabular-nums">{zoom.toFixed(1)}×</span>
            </label>
            <input
              type="range"
              min={1}
              max={4}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="mt-1 w-full accent-sienna"
            />
          </div>

          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setRotation((r) => (r + 90) % 360)}
              className="inline-flex items-center gap-1.5 rounded border border-ink/15 px-3 py-1.5 font-dm text-xs text-ink/70 hover:border-ink/40 hover:text-ink"
            >
              <RotateCw size={12} /> Rotate 90°
            </button>

            <button
              type="button"
              onClick={() => replaceInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded border border-ink/15 px-3 py-1.5 font-dm text-xs text-ink/70 hover:border-ink/40 hover:text-ink"
            >
              <Camera size={12} /> Replace photo
            </button>
            <input
              ref={replaceInputRef}
              type="file"
              accept="image/jpeg,image/png"
              className="sr-only"
              onChange={handleReplace}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-ink/10 px-5 py-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded border border-ink/15 px-3 py-1.5 font-dm text-xs text-ink/70 hover:border-ink/40 hover:text-ink"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={busy || !imageSrc}
            className="inline-flex items-center gap-1.5 rounded bg-sienna px-3 py-1.5 font-dm text-xs text-paper hover:opacity-90 disabled:opacity-60"
          >
            <Check size={12} /> {busy ? "Saving…" : "Save photo"}
          </button>
        </div>
      </div>
    </div>
  );
}
