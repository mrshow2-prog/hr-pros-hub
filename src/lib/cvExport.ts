import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  LevelFormat,
} from "docx";
import { saveAs } from "file-saver";
import type { GeneratedCV } from "@/contexts/CVBuilderContext";

export function slugify(name: string, fallback = "cv") {
  const s = (name || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return s || fallback;
}

/** Render an in-DOM node into a paginated A4 PDF. */
export async function exportNodeToPdf(node: HTMLElement, fileName: string) {
  const canvas = await html2canvas(node, {
    scale: 2,
    backgroundColor: "#ffffff",
    useCORS: true,
    logging: false,
    windowWidth: node.scrollWidth,
    windowHeight: node.scrollHeight,
  });

  const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 0;
  const imgData = canvas.toDataURL("image/jpeg", 0.95);

  pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  while (heightLeft > 0) {
    position -= pageHeight;
    pdf.addPage();
    pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  pdf.save(fileName);
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

function p(text: string, opts: { bold?: boolean; size?: number; spacingAfter?: number } = {}) {
  return new Paragraph({
    spacing: { after: opts.spacingAfter ?? 80 },
    children: [new TextRun({ text, bold: opts.bold, size: opts.size })],
  });
}

function heading(text: string) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 120 },
    children: [new TextRun({ text: text.toUpperCase(), bold: true, size: 26 })],
  });
}

export async function exportCVToDocx(cv: GeneratedCV, fileName: string) {
  const children: Paragraph[] = [];

  // Header
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: [new TextRun({ text: cv.contact.name || "", bold: true, size: 40 })],
    }),
  );
  if (cv.contact.jobTitle) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
        children: [new TextRun({ text: cv.contact.jobTitle, size: 24 })],
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
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [new TextRun({ text: contactLine, size: 20 })],
      }),
    );
  }

  const hidden = new Set(cv.hiddenSections);

  if (!hidden.has("summary") && cv.summary) {
    children.push(heading("Professional Summary"));
    children.push(p(cv.summary));
  }

  if (!hidden.has("experience") && cv.experience.length) {
    children.push(heading("Experience"));
    cv.experience.forEach((exp) => {
      const period =
        exp.period ||
        [exp.startDate, exp.endDate].filter(Boolean).join(" – ") ||
        "";
      children.push(
        new Paragraph({
          spacing: { before: 120, after: 40 },
          children: [
            new TextRun({ text: exp.role || "", bold: true, size: 24 }),
            ...(exp.company ? [new TextRun({ text: ` — ${exp.company}`, size: 24 })] : []),
          ],
        }),
      );
      const sub = [exp.location, period].filter(Boolean).join(" · ");
      if (sub) {
        children.push(
          new Paragraph({
            spacing: { after: 80 },
            children: [new TextRun({ text: sub, italics: true, size: 20 })],
          }),
        );
      }
      exp.bullets.forEach((b) => {
        const text = b.rewrite || b.original;
        if (!text) return;
        children.push(
          new Paragraph({
            numbering: { reference: "cv-bullets", level: 0 },
            spacing: { after: 60 },
            children: [new TextRun({ text, size: 22 })],
          }),
        );
      });
    });
  }

  if (!hidden.has("skills") && cv.skills.length) {
    children.push(heading("Skills"));
    children.push(p(cv.skills.join(" · "), { size: 22 }));
  }

  if (!hidden.has("competencies") && cv.competencyClusters.length) {
    children.push(heading("Core Competencies"));
    cv.competencyClusters.forEach((c) => {
      children.push(p(c.title, { bold: true, size: 22, spacingAfter: 40 }));
      if (c.items.length) children.push(p(c.items.join(" · "), { size: 22 }));
    });
  }

  if (!hidden.has("education") && cv.education.length) {
    children.push(heading("Education"));
    cv.education.forEach((ed) => {
      children.push(
        new Paragraph({
          spacing: { after: 40 },
          children: [
            new TextRun({ text: ed.qualification || "", bold: true, size: 22 }),
          ],
        }),
      );
      const sub = [ed.institution, ed.period].filter(Boolean).join(" · ");
      if (sub) children.push(p(sub, { size: 20, spacingAfter: 120 }));
    });
  }

  if (!hidden.has("languages") && cv.languages.length) {
    children.push(heading("Languages"));
    children.push(
      p(cv.languages.map((l) => `${l.name} (${l.level})`).join(" · "), { size: 22 }),
    );
  }

  const doc = new Document({
    styles: { default: { document: { run: { font: "Calibri", size: 22 } } } },
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
