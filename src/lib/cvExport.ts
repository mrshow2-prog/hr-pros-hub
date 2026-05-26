import { Packer } from "docx";
import { saveAs } from "file-saver";
import type { GeneratedCV, TemplateId } from "@/contexts/CVBuilderContext";
import { buildDocxByTemplate } from "@/lib/docx/router";
import { exportCompactDocx } from "@/lib/cv/exportCompactDocx";
import { exportCvPdfme } from "@/lib/cv/pdfme/exportModernPdfme";

export function slugify(name: string, fallback = "cv") {
  const s = (name || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return s || fallback;
}

/* =========================================================
 * PDF
 * ========================================================= */
export async function exportCVToPdf(
  cv: GeneratedCV,
  template: TemplateId,
  photoUrl: string | null,
  fileName: string,
  opts?: { accentHex?: string | null; photoShape?: "circle" | "square" | "none" },
) {
  return exportCvPdfme(cv, photoUrl, template, fileName, opts);
}

/** Back-compat shim — no longer used by Step 7 export flow. */
export async function exportNodeToPdf(_node: HTMLElement, fileName: string) {
  console.warn("exportNodeToPdf is deprecated; use exportCVToPdf instead.");
  const { default: jsPDF } = await import("jspdf");
  const pdfDoc = new jsPDF();
  pdfDoc.text("Please re-export from the new flow.", 20, 20);
  pdfDoc.save(fileName);
}

/* =========================================================
 * DOCX — delegated to per-template renderers in src/lib/docx/
 * ========================================================= */
export async function exportCVToDocx(
  cv: GeneratedCV,
  fileName: string,
  template: TemplateId = "simple",
  photoUrl: string | null = null,
) {
  if (template === "detailed") {
    return exportCompactDocx(cv, photoUrl, fileName);
  }
  const doc = await buildDocxByTemplate(cv, template, photoUrl);
  const blob = await Packer.toBlob(doc);
  saveAs(blob, fileName);
}
