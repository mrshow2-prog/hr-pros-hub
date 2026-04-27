import { jsPDF } from "jspdf";

const brand = {
  ink: "#1A1714",
  paper: "#F4EFE6",
  clay: "#E8DFD1",
  sienna: "#9C5643",
  umber: "#6E3A2E",
  olive: "#44513C",
  stone: "#BFB09A",
};

export type PdfSection = {
  title: string;
  body: string | string[];
};

export type BrandedPdfInput = {
  title: string;
  subtitle: string;
  documentLabel: string;
  companyName: string;
  sections: PdfSection[];
  footerNote?: string;
};

const margin = 18;
const pageWidth = 210;
const pageHeight = 297;
const contentWidth = pageWidth - margin * 2;

function addLogo(doc: jsPDF, x = margin, y = 18) {
  doc.setFont("times", "italic");
  doc.setFontSize(20);
  doc.setTextColor(brand.sienna);
  doc.text("people", x, y);
  doc.setFillColor(brand.sienna);
  doc.circle(x + 21.5, y - 5.5, 1.4, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(brand.ink);
  doc.text("STUDIO", x + 26, y - 4.2);
}

function addFooter(doc: jsPDF, pageNumber: number, totalPages: number) {
  doc.setDrawColor(232, 223, 209);
  doc.line(margin, 270, pageWidth - margin, 270);
  addLogo(doc, margin, 279);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(90, 82, 73);
  doc.text("Dubai, UAE · +971 58 178 4948 · peoplestudio.ae", margin, 286);
  doc.text("Prepared as a free People.Studio tool output for general HR reference only. It is not legal advice and should be tailored before use.", margin, 291, { maxWidth: 130 });
  doc.text(`Page ${pageNumber} of ${totalPages}`, pageWidth - margin, 286, { align: "right" });
}

function ensureSpace(doc: jsPDF, y: number, needed = 24) {
  if (y + needed < 265) return y;
  doc.addPage();
  addLogo(doc);
  return 34;
}

function writeBody(doc: jsPDF, text: string, x: number, y: number, maxWidth: number) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(47, 42, 37);
  const lines = doc.splitTextToSize(text, maxWidth);
  doc.text(lines, x, y);
  return y + lines.length * 5.2 + 3;
}

export function createBrandedPdf(input: BrandedPdfInput) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  doc.setFillColor(244, 239, 230);
  doc.rect(0, 0, pageWidth, pageHeight, "F");
  addLogo(doc);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(156, 86, 67);
  doc.text("CO-BRANDED WITH", pageWidth - margin, 16, { align: "right", charSpace: 2.2 });
  doc.setFontSize(10);
  doc.setTextColor(26, 23, 20);
  doc.text(input.companyName || "Company Name", pageWidth - margin, 22, { align: "right" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(156, 86, 67);
  doc.text(input.documentLabel.toUpperCase(), margin, 46, { charSpace: 1.7 });

  doc.setFont("times", "normal");
  doc.setFontSize(27);
  doc.setTextColor(26, 23, 20);
  doc.text(doc.splitTextToSize(input.title, contentWidth), margin, 61);

  doc.setFont("times", "italic");
  doc.setFontSize(13);
  doc.setTextColor(110, 58, 46);
  doc.text(doc.splitTextToSize(input.subtitle, contentWidth), margin, 77);

  doc.setDrawColor(156, 86, 67);
  doc.line(margin, 88, pageWidth - margin, 88);

  let y = 103;
  input.sections.forEach((section, index) => {
    y = ensureSpace(doc, y, 34);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(156, 86, 67);
    doc.text(`${String(index + 1).padStart(2, "0")} ${section.title}`.toUpperCase(), margin, y, { charSpace: 0.8 });
    y += 8;

    const paragraphs = Array.isArray(section.body) ? section.body : section.body.split("\n").filter(Boolean);
    paragraphs.forEach((paragraph) => {
      y = ensureSpace(doc, y, 18);
      const isBullet = paragraph.trim().startsWith("-");
      if (isBullet) {
        doc.setFillColor(156, 86, 67);
        doc.circle(margin + 1.4, y - 1.4, 0.8, "F");
        y = writeBody(doc, paragraph.replace(/^-\s*/, ""), margin + 5, y, contentWidth - 5);
      } else {
        y = writeBody(doc, paragraph, margin, y, contentWidth);
      }
    });
    y += 3;
  });

  if (input.footerNote) {
    y = ensureSpace(doc, y, 28);
    doc.setFillColor(232, 223, 209);
    doc.rect(margin, y, contentWidth, 20, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(68, 81, 60);
    doc.text("PEOPLE.STUDIO NOTE", margin + 4, y + 6);
    writeBody(doc, input.footerNote, margin + 4, y + 12, contentWidth - 8);
  }

  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i += 1) {
    doc.setPage(i);
    addFooter(doc, i, totalPages);
  }
  return doc;
}

export function downloadPdf(input: BrandedPdfInput, fileName: string) {
  const doc = createBrandedPdf(input);
  doc.save(fileName);
}

export function buildLeadEmailHref(payload: {
  tool: string;
  email: string;
  companyName: string;
  documentTitle: string;
  summary: string;
}) {
  const subject = `People.Studio tool download — ${payload.tool} — ${payload.companyName}`;
  const body = [
    `Tool: ${payload.tool}`,
    `User email: ${payload.email}`,
    `Company: ${payload.companyName}`,
    `Document: ${payload.documentTitle}`,
    "",
    "Summary:",
    payload.summary,
  ].join("\n");
  return `mailto:bmesiha@outlook.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function openLeadEmail(payload: Parameters<typeof buildLeadEmailHref>[0]) {
  const link = document.createElement("a");
  link.href = buildLeadEmailHref(payload);
  link.target = "_blank";
  link.rel = "noreferrer";
  link.click();
}
