import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import type { GeneratedCV, TemplateId } from "@/contexts/CVBuilderContext";
import { generateCvPdfmeBlob } from "@/lib/cv/pdfme/exportModernPdfme";
import type { FontStyleId } from "@/lib/cv/fontStyles";
import type { SidebarPlacementMap } from "@/lib/cv/sidebarPlacement";
import * as pdfjs from "pdfjs-dist";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.mjs?url";

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

interface Props {
  cv: GeneratedCV;
  template: TemplateId;
  photoUrl: string | null;
  pageWidth?: number;
  gap?: number;
  accentHex?: string | null;
  photoShape?: "circle" | "square" | "none";
  sidebarPlacement?: SidebarPlacementMap;
  fontStyle?: FontStyleId | null;
  onStatusChange?: (status: "loading" | "ready" | "error") => void;
}

export default function PdfmePreview({
  cv,
  template,
  photoUrl,
  pageWidth = 794,
  gap = 24,
  accentHex,
  photoShape,
  sidebarPlacement,
  fontStyle,
  onStatusChange,
}: Props) {
  const [pages, setPages] = useState<string[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    onStatusChange?.(status);
  }, [status, onStatusChange]);

  useEffect(() => {
    let cancelled = false;
    let doc: { numPages: number; getPage: (pageNumber: number) => Promise<any>; destroy: () => Promise<void> } | null = null;

    const timer = window.setTimeout(async () => {
      try {
        setStatus("loading");
        const blob = await generateCvPdfmeBlob(cv, photoUrl, template, { accentHex, photoShape, sidebarPlacement, fontStyle });
        const loadingTask = pdfjs.getDocument({ data: await blob.arrayBuffer() });
        doc = await loadingTask.promise;
        const rendered: string[] = [];

        for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber += 1) {
          if (cancelled) return;
          const page = await doc.getPage(pageNumber);
          const baseViewport = page.getViewport({ scale: 1 });
          const cssScale = pageWidth / baseViewport.width;
          const viewport = page.getViewport({ scale: cssScale });
          const outputScale = Math.min(window.devicePixelRatio || 1, 2);
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          if (!context) continue;
          canvas.width = Math.floor(viewport.width * outputScale);
          canvas.height = Math.floor(viewport.height * outputScale);
          canvas.style.width = `${viewport.width}px`;
          canvas.style.height = `${viewport.height}px`;
          await page.render({
            canvasContext: context,
            viewport,
            transform: outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : undefined,
          }).promise;
          rendered.push(canvas.toDataURL("image/png"));
        }

        if (!cancelled) {
          setPages(rendered);
          setStatus("ready");
        }
      } catch (error) {
        console.error("PDF preview render failed", error);
        if (!cancelled) setStatus("error");
      }
    }, 300);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      void doc?.destroy();
    };
  }, [cv, template, photoUrl, pageWidth, accentHex, photoShape, JSON.stringify(sidebarPlacement ?? {})]);

  const pageHeight = Math.round(pageWidth * (297 / 210));

  if (status === "loading" && pages.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-3 bg-white font-dm text-sm text-ink/60 shadow-xl ring-1 ring-ink/10"
        style={{ width: pageWidth, height: pageHeight }}
      >
        <Loader2 className="animate-spin text-sienna" size={24} />
        <span>Updating preview…</span>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div
        className="flex items-center justify-center bg-white font-dm text-sm text-ink/60 shadow-xl ring-1 ring-ink/10"
        style={{ width: pageWidth, height: pageHeight }}
      >
        Preview refresh failed. Export is still available.
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center" style={{ width: pageWidth, gap }}>
      {pages.map((src, index) => (
        <img
          key={`${template}-${index}-${src.slice(-24)}`}
          src={src}
          alt={`CV preview page ${index + 1}`}
          className="block bg-white shadow-xl ring-1 ring-ink/10"
          style={{ width: pageWidth }}
          draggable={false}
        />
      ))}
      {status === "loading" && (
        <div className="pointer-events-none absolute inset-0 flex items-start justify-center pt-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-ink/85 px-3 py-1.5 font-dm text-xs text-paper shadow-lg backdrop-blur">
            <Loader2 className="animate-spin" size={14} />
            Updating preview…
          </div>
        </div>
      )}
    </div>
  );
}