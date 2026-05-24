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

/**
 * Opens the rendered Compact HTML in a hidden iframe and triggers the
 * browser's print dialog. The user picks "Save as PDF" — output is
 * pixel-perfect because Chrome itself renders the @page CSS.
 */
export async function exportCompactPdf(
  cv: GeneratedCV,
  photoUrl: string | null,
  _fileName: string,
) {
  const photoData = photoUrl ? await urlToDataUrl(photoUrl) : null;
  const html = renderCompactHtml(cv, photoData, "pdf");

  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  document.body.appendChild(iframe);

  await new Promise<void>((resolve) => {
    iframe.onload = () => resolve();
    iframe.srcdoc = html;
  });

  // Wait for fonts + images
  const doc = iframe.contentDocument!;
  try {
    await (doc as Document & { fonts?: { ready: Promise<unknown> } }).fonts?.ready;
  } catch {
    /* ignore */
  }
  const imgs = Array.from(doc.images);
  await Promise.all(
    imgs.map((img) =>
      img.complete
        ? Promise.resolve()
        : new Promise((r) => {
            img.onload = img.onerror = () => r(null);
          }),
    ),
  );

  iframe.contentWindow!.focus();
  iframe.contentWindow!.print();

  // Leave iframe in DOM briefly so print dialog can finish reading it.
  setTimeout(() => iframe.remove(), 60_000);
}
