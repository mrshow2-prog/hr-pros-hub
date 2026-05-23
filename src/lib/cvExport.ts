import { pdf } from "@react-pdf/renderer";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  LevelFormat,
  ImageRun,
  BorderStyle,
} from "docx";
import { saveAs } from "file-saver";
import type { GeneratedCV, TemplateId } from "@/contexts/CVBuilderContext";
import CVPdfDocument from "@/components/cv-builder/CVPdfDocument";
import { getTemplateConfig } from "@/lib/cvTemplateConfig";
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

async function urlToImageData(
  url: string,
): Promise<{ buffer: ArrayBuffer; type: "png" | "jpg" | "gif" | "bmp" } | null> {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const mime = blob.type || "";
    let type: "png" | "jpg" | "gif" | "bmp" = "png";
    if (mime.includes("jpeg") || mime.includes("jpg") || /\.jpe?g(\?|$)/i.test(url)) type = "jpg";
    else if (mime.includes("gif")) type = "gif";
    else if (mime.includes("bmp")) type = "bmp";
    return { buffer: await blob.arrayBuffer(), type };
  } catch {
    return null;
  }
}

/** Generate a real text-based PDF using @react-pdf/renderer. */
export async function exportCVToPdf(
  cv: GeneratedCV,
  template: TemplateId,
  photoUrl: string | null,
  fileName: string,
) {
  const photoDataUrl = photoUrl ? await urlToDataUrl(photoUrl) : null;
  const doc = React.createElement(CVPdfDocument, { cv, template, photoDataUrl });
  // @ts-expect-error - pdf() accepts a Document element
  const blob = await pdf(doc).toBlob();
  saveAs(blob, fileName);
}

/** Back-compat shim: old call site passed a DOM node; we now ignore it. */
export async function exportNodeToPdf(_node: HTMLElement, fileName: string) {
  console.warn("exportNodeToPdf is deprecated; use exportCVToPdf instead.");
  // Best-effort: empty placeholder to avoid breaking callers.
  const { default: jsPDF } = await import("jspdf");
  const pdfDoc = new jsPDF();
  pdfDoc.text("Please re-export from the new flow.", 20, 20);
  pdfDoc.save(fileName);
}

const bulletNumbering = {
  config: [
    {
      reference: "cv-bullets",
      levels: [
        {
          level: 0,
          format: LevelFormat.BULLET,
          text: "\u2022",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } },
        },
      ],
    },
  ],
};

const FONT_MAP: Record<string, string> = {
  "Times-Roman": "Times New Roman",
  "Times-Bold": "Times New Roman",
  "Helvetica-Bold": "Calibri",
  Helvetica: "Calibri",
};

function mapFont(f: string): string {
  return FONT_MAP[f] || "Calibri";
}

export async function exportCVToDocx(
  cv: GeneratedCV,
  fileName: string,
  template: TemplateId = "modern",
  photoUrl: string | null = null,
) {
  const cfg = getTemplateConfig(template);
  const headingFont = mapFont(cfg.headingFont);
  const bodyFont = mapFont(cfg.bodyFont);
  const primary = cfg.primaryColor.replace("#", "");

  const children: Paragraph[] = [];

  // Photo (inline at top)
  if (photoUrl) {
    const img = await urlToImageData(photoUrl);
    if (img) {
      children.push(
        new Paragraph({
          alignment: AlignmentType.LEFT,
          spacing: { after: 120 },
          children: [
            new ImageRun({
              data: img.buffer,
              transformation: { width: 80, height: 80 },
              type: img.type,
            } as any),
          ],
        }),
      );
    }
  }

  // Name
  children.push(
    new Paragraph({
      spacing: { after: 60 },
      children: [
        new TextRun({
          text: cv.contact.name || "",
          bold: true,
          size: 40,
          font: headingFont,
          color: primary,
        }),
      ],
    }),
  );
  if (cv.contact.jobTitle) {
    children.push(
      new Paragraph({
        spacing: { after: 100 },
        children: [
          new TextRun({
            text: cv.contact.jobTitle,
            size: 24,
            font: bodyFont,
            color: primary,
          }),
        ],
      }),
    );
  }

  const contactLine = [
    cv.contact.email,
    cv.contact.phone,
    cv.contact.location,
    cv.contact.linkedinUrl,
  ]
    .filter(Boolean)
    .join("  |  ");
  if (contactLine) {
    children.push(
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun({ text: contactLine, size: 20, font: bodyFont })],
      }),
    );
  }

  // Horizontal rule
  children.push(
    new Paragraph({
      spacing: { after: 200 },
      border: {
        bottom: { style: BorderStyle.SINGLE, size: 8, color: primary, space: 1 },
      },
      children: [new TextRun({ text: "" })],
    }),
  );

  const heading = (text: string) =>
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 240, after: 120 },
      children: [
        new TextRun({
          text: cfg.headingUppercase ? text.toUpperCase() : text,
          bold: true,
          size: 26,
          font: headingFont,
          color: primary,
        }),
      ],
    });

  const para = (text: string, opts: { size?: number; bold?: boolean; italics?: boolean } = {}) =>
    new Paragraph({
      spacing: { after: 80 },
      children: [
        new TextRun({
          text,
          size: opts.size ?? 22,
          bold: opts.bold,
          italics: opts.italics,
          font: bodyFont,
        }),
      ],
    });

  const hidden = new Set(cv.hiddenSections);

  if (!hidden.has("summary") && cv.summary) {
    children.push(heading("Professional Summary"));
    children.push(para(cv.summary));
  }

  if (!hidden.has("experience") && cv.experience.length) {
    children.push(heading("Experience"));
    cv.experience.forEach((exp) => {
      const period =
        exp.period || [exp.startDate, exp.endDate].filter(Boolean).join(" – ") || "";
      children.push(
        new Paragraph({
          spacing: { before: 120, after: 40 },
          children: [
            new TextRun({ text: exp.role || "", bold: true, size: 24, font: headingFont }),
            ...(exp.company
              ? [new TextRun({ text: ` — ${exp.company}`, size: 24, font: bodyFont })]
              : []),
          ],
        }),
      );
      const sub = [exp.location, period].filter(Boolean).join(" · ");
      if (sub) children.push(para(sub, { size: 20, italics: true }));
      exp.bullets.forEach((b) => {
        const text = b.rewrite || b.original;
        if (!text || b.status === "reverted") return;
        children.push(
          new Paragraph({
            numbering: { reference: "cv-bullets", level: 0 },
            spacing: { after: 60 },
            children: [new TextRun({ text, size: 22, font: bodyFont })],
          }),
        );
      });
    });
  }

  if (!hidden.has("education") && cv.education.length) {
    children.push(heading("Education"));
    cv.education.forEach((ed) => {
      children.push(
        new Paragraph({
          spacing: { after: 40 },
          children: [
            new TextRun({ text: ed.qualification || "", bold: true, size: 22, font: headingFont }),
          ],
        }),
      );
      const sub = [ed.institution, ed.period].filter(Boolean).join(" · ");
      if (sub) children.push(para(sub, { size: 20 }));
    });
  }

  // Sidebar-style content at the bottom for Word (single column)
  if (!hidden.has("skills") && cv.skills.length) {
    children.push(heading("Skills"));
    children.push(para(cv.skills.join(" · "), { size: 22 }));
  }

  if (!hidden.has("competencies") && cv.competencyClusters.length) {
    children.push(heading("Core Competencies"));
    cv.competencyClusters.forEach((c) => {
      children.push(para(c.title, { bold: true, size: 22 }));
      if (c.items.length) children.push(para(c.items.join(" · "), { size: 22 }));
    });
  }

  if (!hidden.has("languages") && cv.languages.length) {
    children.push(heading("Languages"));
    children.push(
      para(
        cv.languages
          .map((l) => (l.level && l.level.trim() ? `${l.name} (${l.level})` : l.name))
          .join(" · "),
        { size: 22 },
      ),
    );
  }

  const doc = new Document({
    styles: { default: { document: { run: { font: bodyFont, size: 22 } } } },
    numbering: bulletNumbering,
    sections: [
      {
        properties: {
          page: { margin: { top: 1080, bottom: 1080, left: 1080, right: 1080 } },
        },
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, fileName);
}
