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
  Table,
  TableRow,
  TableCell,
  WidthType,
  ShadingType,
  VerticalAlign,
  Footer,
  PageNumber,
} from "docx";
import { saveAs } from "file-saver";
import type { GeneratedCV, TemplateId } from "@/contexts/CVBuilderContext";
import PdfRouter from "@/components/cv-builder/pdf/PdfRouter";
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

/* =========================================================
 * PDF
 * ========================================================= */
export async function exportCVToPdf(
  cv: GeneratedCV,
  template: TemplateId,
  photoUrl: string | null,
  fileName: string,
) {
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
 * DOCX
 * ========================================================= */

const FONT_MAP: Record<string, string> = {
  "Times-Roman": "Georgia",
  "Times-Bold": "Georgia",
  "Helvetica-Bold": "Calibri",
  Helvetica: "Calibri",
};
const mapFont = (f: string) => FONT_MAP[f] || "Calibri";

const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = {
  top: noBorder, bottom: noBorder, left: noBorder, right: noBorder,
  insideHorizontal: noBorder, insideVertical: noBorder,
};

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
          style: { paragraph: { indent: { left: 360, hanging: 220 } } },
        },
      ],
    },
    {
      reference: "cv-side-bullets",
      levels: [
        {
          level: 0,
          format: LevelFormat.BULLET,
          text: "\u25AA",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 220, hanging: 180 } } },
        },
      ],
    },
  ],
};

function blankLine(size = 4) {
  return new Paragraph({ spacing: { after: size }, children: [new TextRun({ text: "" })] });
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
  const primary = cfg.primaryColor.replace("#", "").toUpperCase();
  const hidden = new Set(cv.hiddenSections);

  /* ---------- header band paragraphs (white text on colored shading) ---------- */
  const headerParas: Paragraph[] = [];
  headerParas.push(
    new Paragraph({
      spacing: { before: 80, after: 40 },
      shading: { type: ShadingType.CLEAR, fill: primary, color: "auto" },
      children: [
        new TextRun({
          text: (cv.contact.name || "Your name").toUpperCase(),
          bold: true,
          size: 44,
          font: headingFont,
          color: "FFFFFF",
        }),
      ],
    }),
  );
  if (cv.contact.jobTitle) {
    headerParas.push(
      new Paragraph({
        spacing: { after: 80 },
        shading: { type: ShadingType.CLEAR, fill: primary, color: "auto" },
        children: [
          new TextRun({
            text: cv.contact.jobTitle,
            size: 22,
            font: bodyFont,
            color: "FFFFFF",
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
  ].filter(Boolean).join("   ·   ");
  if (contactLine) {
    headerParas.push(
      new Paragraph({
        spacing: { after: 120 },
        shading: { type: ShadingType.CLEAR, fill: primary, color: "auto" },
        children: [new TextRun({ text: contactLine, size: 18, font: bodyFont, color: "FFFFFF" })],
      }),
    );
  }

  /* photo paragraph (placed before the header band, inline) */
  const photoParas: Paragraph[] = [];
  if (photoUrl) {
    const img = await urlToImageData(photoUrl);
    if (img) {
      photoParas.push(
        new Paragraph({
          alignment: AlignmentType.LEFT,
          spacing: { after: 80 },
          children: [
            new ImageRun({
              data: img.buffer,
              transformation: { width: 90, height: 90 },
              type: img.type,
            } as any),
          ],
        }),
      );
    }
  }

  /* ---------- helpers ---------- */
  const sideTitle = (text: string) =>
    new Paragraph({
      spacing: { before: 200, after: 80 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: primary, space: 2 } },
      children: [
        new TextRun({
          text: text.toUpperCase(),
          bold: true,
          size: 18,
          font: headingFont,
          color: primary,
        }),
      ],
    });

  const sideText = (text: string, opts: { bold?: boolean; color?: string; size?: number } = {}) =>
    new Paragraph({
      spacing: { after: 60 },
      children: [
        new TextRun({
          text,
          size: opts.size ?? 18,
          bold: opts.bold,
          color: opts.color,
          font: bodyFont,
        }),
      ],
    });

  const mainHeading = (text: string) =>
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 240, after: 100 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: primary, space: 2 } },
      children: [
        new TextRun({
          text: cfg.headingUppercase ? text.toUpperCase() : text,
          bold: true,
          size: 24,
          font: headingFont,
          color: primary,
        }),
      ],
    });

  const para = (text: string, opts: { size?: number; bold?: boolean; italics?: boolean; color?: string } = {}) =>
    new Paragraph({
      spacing: { after: 80 },
      children: [
        new TextRun({
          text,
          size: opts.size ?? 20,
          bold: opts.bold,
          italics: opts.italics,
          color: opts.color,
          font: bodyFont,
        }),
      ],
    });

  /* ---------- SIDEBAR cell contents ---------- */
  const sidebarChildren: Paragraph[] = [];
  sidebarChildren.push(...photoParas);

  if (!hidden.has("contact")) {
    sidebarChildren.push(sideTitle("Contact"));
    [cv.contact.email, cv.contact.phone, cv.contact.location, cv.contact.linkedinUrl]
      .filter(Boolean)
      .forEach((c) => sidebarChildren.push(sideText(c as string)));
  }

  if (!hidden.has("skills") && cv.skills.length) {
    sidebarChildren.push(sideTitle("Skills"));
    cv.skills.forEach((s) => {
      sidebarChildren.push(
        new Paragraph({
          numbering: { reference: "cv-side-bullets", level: 0 },
          spacing: { after: 40 },
          children: [new TextRun({ text: s, size: 18, font: bodyFont })],
        }),
      );
    });
  }

  if (!hidden.has("languages") && cv.languages.length) {
    sidebarChildren.push(sideTitle("Languages"));
    cv.languages.forEach((l) => {
      const lvl = l.level && l.level.trim() ? l.level.trim() : "";
      sidebarChildren.push(
        new Paragraph({
          spacing: { after: 40 },
          children: [
            new TextRun({ text: l.name, bold: true, size: 18, font: headingFont }),
            ...(lvl ? [new TextRun({ text: `  ${lvl}`, size: 16, color: "6B7280", font: bodyFont })] : []),
          ],
        }),
      );
    });
  }

  if (!hidden.has("education") && cv.education.length) {
    sidebarChildren.push(sideTitle("Education"));
    cv.education.forEach((ed) => {
      sidebarChildren.push(
        new Paragraph({
          spacing: { after: 20 },
          children: [new TextRun({ text: ed.qualification, bold: true, size: 18, font: headingFont })],
        }),
      );
      if (ed.institution) {
        sidebarChildren.push(
          new Paragraph({
            spacing: { after: 20 },
            children: [new TextRun({ text: ed.institution, size: 17, color: primary, font: bodyFont })],
          }),
        );
      }
      if (ed.period) {
        sidebarChildren.push(
          new Paragraph({
            spacing: { after: 120 },
            children: [new TextRun({ text: ed.period, size: 16, color: "6B7280", font: bodyFont })],
          }),
        );
      }
    });
  }

  /* ---------- MAIN cell contents ---------- */
  const mainChildren: Paragraph[] = [];
  mainChildren.push(...headerParas);

  if (!hidden.has("summary") && cv.summary) {
    mainChildren.push(mainHeading("Professional Summary"));
    mainChildren.push(para(cv.summary, { size: 20 }));
  }

  if (!hidden.has("experience") && cv.experience.length) {
    mainChildren.push(mainHeading("Work Experience"));
    cv.experience.forEach((exp, i) => {
      const period =
        [exp.startDate, exp.endDate].filter(Boolean).join(" – ") || exp.period || "";
      mainChildren.push(
        new Paragraph({
          spacing: { before: i === 0 ? 80 : 200, after: 20 },
          tabStops: [{ type: "right" as any, position: 8200 }],
          children: [
            new TextRun({ text: exp.role || "", bold: true, size: 22, font: headingFont }),
            ...(period
              ? [new TextRun({ text: `\t${period}`, size: 18, color: "6B7280", font: bodyFont })]
              : []),
          ],
        }),
      );
      const sub = [exp.company, exp.location].filter(Boolean).join(" · ");
      if (sub) {
        mainChildren.push(
          new Paragraph({
            spacing: { after: 60 },
            children: [
              new TextRun({ text: sub, size: 19, color: primary, font: bodyFont, bold: true }),
            ],
          }),
        );
      }
      exp.bullets.forEach((b) => {
        const text = b.rewrite || b.original;
        if (!text || b.status === "reverted") return;
        mainChildren.push(
          new Paragraph({
            numbering: { reference: "cv-bullets", level: 0 },
            spacing: { after: 40 },
            children: [new TextRun({ text, size: 19, font: bodyFont })],
          }),
        );
      });
    });
  }

  /* ---------- Page-1 layout table: sidebar + (header band + summary) ----------
     After the table we render Experience as full-width paragraphs so page 2+
     never shows an empty sidebar column. */
  // A4: 11906 x 16838 DXA. With 1cm (567) margins → content width 10772.
  const totalWidth = 10772;
  const sideW = 3200;
  const mainW = totalWidth - sideW;

  // Only put the header band + summary in the right cell of the table so the
  // table stays short. Experience and additional sections go BELOW as full-width.
  const tableMainChildren: Paragraph[] = [...headerParas];
  if (!hidden.has("summary") && cv.summary) {
    tableMainChildren.push(mainHeading("Professional Summary"));
    tableMainChildren.push(para(cv.summary, { size: 20 }));
  }

  const layoutTable = new Table({
    width: { size: totalWidth, type: WidthType.DXA },
    columnWidths: [sideW, mainW],
    borders: noBorders,
    rows: [
      new TableRow({
        cantSplit: false,
        children: [
          new TableCell({
            width: { size: sideW, type: WidthType.DXA },
            borders: noBorders,
            shading: { type: ShadingType.CLEAR, fill: "F7F4EF", color: "auto" },
            margins: { top: 240, bottom: 240, left: 200, right: 200 },
            verticalAlign: VerticalAlign.TOP,
            children: sidebarChildren.length ? sidebarChildren : [blankLine()],
          }),
          new TableCell({
            width: { size: mainW, type: WidthType.DXA },
            borders: noBorders,
            margins: { top: 80, bottom: 240, left: 280, right: 120 },
            verticalAlign: VerticalAlign.TOP,
            children: tableMainChildren.length ? tableMainChildren : [blankLine()],
          }),
        ],
      }),
    ],
  });

  /* ---------- Full-width content below the table (Experience + extras) ---------- */
  const belowTable: Paragraph[] = [];

  if (!hidden.has("experience") && cv.experience.length) {
    belowTable.push(mainHeading("Work Experience"));
    cv.experience.forEach((exp, i) => {
      const period = [exp.startDate, exp.endDate].filter(Boolean).join(" – ") || exp.period || "";
      belowTable.push(
        new Paragraph({
          spacing: { before: i === 0 ? 120 : 220, after: 20 },
          tabStops: [{ type: "right" as any, position: 10200 }],
          children: [
            new TextRun({ text: exp.role || "", bold: true, size: 22, font: headingFont }),
            ...(period ? [new TextRun({ text: `\t${period}`, size: 18, color: "6B7280", font: bodyFont })] : []),
          ],
        }),
      );
      const sub = [exp.company, exp.location].filter(Boolean).join(" · ");
      if (sub) {
        belowTable.push(
          new Paragraph({
            spacing: { after: 60 },
            children: [new TextRun({ text: sub, size: 19, color: primary, font: bodyFont, bold: true })],
          }),
        );
      }
      exp.bullets.forEach((b) => {
        const text = b.rewrite || b.original;
        if (!text || b.status === "reverted") return;
        belowTable.push(
          new Paragraph({
            numbering: { reference: "cv-bullets", level: 0 },
            spacing: { after: 40 },
            children: [new TextRun({ text, size: 19, font: bodyFont })],
          }),
        );
      });
    });
  }

  // Education repeated in main flow with proper headline (also in sidebar)
  if (!hidden.has("education") && cv.education.length) {
    belowTable.push(mainHeading("Education"));
    cv.education.forEach((ed) => {
      belowTable.push(new Paragraph({
        spacing: { before: 80, after: 20 },
        children: [new TextRun({ text: ed.qualification, bold: true, size: 21, font: headingFont })],
      }));
      if (ed.institution) {
        belowTable.push(new Paragraph({
          spacing: { after: 20 },
          children: [new TextRun({ text: ed.institution, size: 19, color: primary, font: bodyFont })],
        }));
      }
      if (ed.period) {
        belowTable.push(new Paragraph({
          spacing: { after: 80 },
          children: [new TextRun({ text: ed.period, size: 17, color: "6B7280", font: bodyFont })],
        }));
      }
    });
  }

  if (cv.competencyClusters?.length) {
    belowTable.push(mainHeading("Core Competencies"));
    cv.competencyClusters.forEach((cl) => {
      belowTable.push(new Paragraph({
        spacing: { before: 80, after: 20 },
        children: [new TextRun({ text: cl.title, bold: true, size: 20, font: headingFont })],
      }));
      belowTable.push(para((cl.items ?? []).join(" · "), { size: 19 }));
    });
  }

  const doc = new Document({
    creator: cv.contact.name || "CV Builder",
    title: `${cv.contact.name || "CV"} — ${cv.contact.jobTitle || ""}`.trim(),
    styles: {
      default: { document: { run: { font: bodyFont, size: 20 } } },
      paragraphStyles: [
        {
          id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal",
          quickFormat: true,
          run: { size: 24, bold: true, font: headingFont, color: primary },
          paragraph: { spacing: { before: 240, after: 100 }, outlineLevel: 1 },
        },
      ],
    },
    numbering: bulletNumbering,
    sections: [
      {
        properties: {
          page: {
            // A4: 11906 x 16838 DXA, ~1cm margins (567 DXA)
            size: { width: 11906, height: 16838 },
            margin: { top: 567, bottom: 567, left: 567, right: 567 },
          },
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: `${cv.contact.name || ""}  ·  `, size: 16, color: "9CA3AF", font: bodyFont }),
                  new TextRun({ children: ["Page ", PageNumber.CURRENT, " of ", PageNumber.TOTAL_PAGES], size: 16, color: "9CA3AF", font: bodyFont }),
                ],
              }),
            ],
          }),
        },
        children: [layoutTable, ...belowTable],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, fileName);
}
