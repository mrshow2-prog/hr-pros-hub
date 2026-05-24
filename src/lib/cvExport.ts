import { pdf } from "@react-pdf/renderer";
import { Packer } from "docx";
import { saveAs } from "file-saver";
import type { GeneratedCV, TemplateId } from "@/contexts/CVBuilderContext";
import PdfRouter from "@/components/cv-builder/pdf/PdfRouter";
import { buildDocxByTemplate } from "@/lib/docx/router";
import { exportCompactPdf } from "@/lib/cv/exportCompactPdf";
import { exportCompactDocx } from "@/lib/cv/exportCompactDocx";
import { exportModernPdfme } from "@/lib/cv/pdfme/exportModernPdfme";
import React from "react";

export function slugify(name: string, fallback = "cv") {
  const s = (name || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return s || fallback;
}

async function urlToDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

/* =========================================================
 * PDF
 * ========================================================= */
export async function exportCVToPdf(
  cv: GeneratedCV,
  template: TemplateId,
  photoUrl: string | null,
  fileName: string,
) {
  if (template === "compact") {
    return exportCompactPdf(cv, photoUrl, fileName);
  }
  if (template === "modern") {
    return exportModernPdfme(cv, photoUrl, fileName);
  }
  const photoDataUrl = photoUrl ? await urlToDataUrl(photoUrl) : null;
  const doc = React.createElement(PdfRouter, { cv, template, photoDataUrl });
  // @ts-expect-error - pdf() accepts a Document element
  const blob = await pdf(doc).toBlob();
  saveAs(blob, fileName);
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
  template: TemplateId = "modern",
  photoUrl: string | null = null,
) {
  if (template === "compact") {
    return exportCompactDocx(cv, photoUrl, fileName);
  }
  const doc = await buildDocxByTemplate(cv, template, photoUrl);
  const blob = await Packer.toBlob(doc);
  saveAs(blob, fileName);
}
