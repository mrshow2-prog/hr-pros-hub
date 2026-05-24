import { saveAs } from "file-saver";
import { asBlob } from "html-docx-js-typescript";
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

  const result = await asBlob(html, {
    orientation: "portrait",
    margins: { top: 0, right: 0, bottom: 0, left: 0 },
  });
  const blob = result instanceof Blob ? result : new Blob([result as BlobPart]);
  saveAs(blob, fileName);
}
