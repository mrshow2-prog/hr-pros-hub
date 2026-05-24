import { saveAs } from "file-saver";
import type { GeneratedCV } from "@/contexts/CVBuilderContext";
import { renderCompactHtml } from "./templates/compact";

async function urlToDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return await new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onloadend = () => resolve(r.result as string);
      r.onerror = reject;
      r.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export async function exportCompactDocx(
  cv: GeneratedCV,
  photoUrl: string | null,
  fileName: string,
) {
  const photoData = photoUrl ? await urlToDataUrl(photoUrl) : null;
  const html = renderCompactHtml(cv, photoData, "docx");

  // html-docx-js is CJS without types — dynamic import to keep tree small
  const mod: any = await import("html-docx-js/dist/html-docx");
  const lib = mod.default ?? mod;
  const blob: Blob = lib.asBlob(html, {
    orientation: "portrait",
    margins: { top: 0, right: 0, bottom: 0, left: 0 },
  });
  saveAs(blob, fileName);
}
