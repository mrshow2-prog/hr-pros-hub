import {
  Document, Paragraph, TextRun, Table, TableRow, TableCell, WidthType,
  ShadingType, VerticalAlign, AlignmentType, BorderStyle,
} from "docx";
import type { GeneratedCV } from "@/contexts/CVBuilderContext";
import {
  A4_PAGE, CONTENT_W, bulletNumbering, footerOf, getTheme,
  isHidden, periodOf, visibleBullets, noBorders,
  blank, txt, sectionHeading, roleRow, companyRow, bulletPara,
} from "./shared";

/** Compact docx: mirrors PdfCompact
 *  Header: name+title left,  contact right (right-aligned text)
 *  Page 1 body row (in a borderless 2-col table):
 *    LEFT  = Summary
 *    RIGHT = Skills + Languages
 *  Then full-width: Work Experience, Education
 */
export async function buildCompactDoc(
  cv: GeneratedCV,
  photoUrl: string | null,
): Promise<Document> {
  const t = getTheme("compact");
  const LEFT_W = Math.round(CONTENT_W * 0.62);
  const RIGHT_W = CONTENT_W - LEFT_W;

  /* ---------- HEADER (name+title left, contact right) ---------- */
  const headerCells: TableCell[] = [];
  headerCells.push(
    new TableCell({
      width: { size: LEFT_W, type: WidthType.DXA },
      borders: noBorders,
      verticalAlign: VerticalAlign.CENTER,
      margins: { top: 0, bottom: 0, left: 0, right: 120 },
      children: [
        new Paragraph({
          spacing: { after: 40 },
          children: [
            new TextRun({
              text: cv.contact.name || "Your name",
              bold: true,
              size: 48,
              font: t.heading,
              color: "111827",
            }),
          ],
        }),
        ...(cv.contact.jobTitle
          ? [
              new Paragraph({
                spacing: { after: 0 },
                children: [
                  new TextRun({
                    text: cv.contact.jobTitle,
                    size: 22,
                    font: t.body,
                    color: t.primary,
                  }),
                ],
              }),
            ]
          : []),
      ],
    }),
  );
  const contactLines = [
    cv.contact.location,
    cv.contact.phone,
    cv.contact.email,
    cv.contact.linkedinUrl,
  ].filter(Boolean) as string[];
  headerCells.push(
    new TableCell({
      width: { size: RIGHT_W, type: WidthType.DXA },
      borders: noBorders,
      verticalAlign: VerticalAlign.CENTER,
      margins: { top: 0, bottom: 0, left: 120, right: 0 },
      children: contactLines.length
        ? contactLines.map(
            (l) =>
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                spacing: { after: 30 },
                children: [
                  new TextRun({ text: l, size: 18, color: t.muted, font: t.body }),
                ],
              }),
          )
        : [new Paragraph({ children: [new TextRun({ text: "" })] })],
    }),
  );
  const headerTable = new Table({
    width: { size: CONTENT_W, type: WidthType.DXA },
    columnWidths: [LEFT_W, RIGHT_W],
    borders: {
      ...noBorders,
      bottom: { style: BorderStyle.SINGLE, size: 12, color: "111827" },
    },
    rows: [new TableRow({ children: headerCells })],
  });

  /* ---------- BODY ROW: Summary | Skills + Languages ---------- */
  const leftCol: Paragraph[] = [];
  if (!isHidden(cv, "summary") && cv.summary) {
    leftCol.push(sectionHeading("Summary", t, "underline"));
    leftCol.push(txt(cv.summary, t, { size: 20, color: t.subInk, after: 40 }));
  }
  if (!leftCol.length) leftCol.push(new Paragraph({ children: [new TextRun({ text: "" })] }));

  const rightCol: Paragraph[] = [];
  if (!isHidden(cv, "skills") && cv.skills.length) {
    rightCol.push(sectionHeading("Skills", t, "underline"));
    cv.skills.forEach((s) => {
      rightCol.push(
        new Paragraph({
          numbering: { reference: "cv-side-bullets", level: 0 },
          spacing: { after: 30 },
          children: [new TextRun({ text: s, size: 19, font: t.body, color: t.subInk })],
        }),
      );
    });
  }
  if (!isHidden(cv, "languages") && cv.languages.length) {
    rightCol.push(sectionHeading("Languages", t, "underline"));
    cv.languages.forEach((l) => {
      rightCol.push(
        new Paragraph({
          spacing: { after: 40 },
          children: [
            new TextRun({ text: l.name, bold: true, size: 19, font: t.heading }),
            ...(l.level?.trim()
              ? [new TextRun({ text: `  ${l.level.trim()}`, size: 17, color: t.muted, font: t.body })]
              : []),
          ],
        }),
      );
    });
  }
  if (!rightCol.length) rightCol.push(new Paragraph({ children: [new TextRun({ text: "" })] }));

  const bodyTable = new Table({
    width: { size: CONTENT_W, type: WidthType.DXA },
    columnWidths: [LEFT_W, RIGHT_W],
    borders: noBorders,
    rows: [
      new TableRow({
        cantSplit: false,
        children: [
          new TableCell({
            width: { size: LEFT_W, type: WidthType.DXA },
            borders: noBorders,
            verticalAlign: VerticalAlign.TOP,
            margins: { top: 240, bottom: 120, left: 0, right: 200 },
            children: leftCol,
          }),
          new TableCell({
            width: { size: RIGHT_W, type: WidthType.DXA },
            borders: noBorders,
            verticalAlign: VerticalAlign.TOP,
            margins: { top: 240, bottom: 120, left: 200, right: 0 },
            children: rightCol,
          }),
        ],
      }),
    ],
  });

  /* ---------- FULL-WIDTH: Work Experience, Education ---------- */
  const below: Paragraph[] = [];
  if (!isHidden(cv, "experience") && cv.experience.length) {
    below.push(sectionHeading("Work Experience", t, "underline"));
    cv.experience.forEach((exp) => {
      below.push(roleRow(exp.role || "", periodOf(exp), t, CONTENT_W));
      const cr = companyRow(exp.company || "", exp.location || "", t);
      if (cr) below.push(cr);
      visibleBullets(exp).forEach((b) => below.push(bulletPara(b.rewrite || b.original, t)));
    });
  }
  if (!isHidden(cv, "education") && cv.education.length) {
    below.push(sectionHeading("Education", t, "underline"));
    cv.education.forEach((ed) => {
      below.push(roleRow(ed.qualification, ed.period || "", t, CONTENT_W));
      if (ed.institution) {
        below.push(txt(ed.institution, t, { size: 19, color: t.primary, bold: true, after: 80 }));
      }
    });
  }

  return new Document({
    creator: cv.contact.name || "CV Builder",
    title: `${cv.contact.name || "CV"} — ${cv.contact.jobTitle || ""}`.trim(),
    styles: { default: { document: { run: { font: t.body, size: 20 } } } },
    numbering: bulletNumbering,
    sections: [
      {
        properties: { page: A4_PAGE },
        footers: { default: footerOf(cv, t) },
        children: [headerTable, blank(60), bodyTable, blank(80), ...below],
      },
    ],
  });
}
