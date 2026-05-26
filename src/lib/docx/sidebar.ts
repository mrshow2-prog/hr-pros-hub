import {
  Document, Paragraph, TextRun, Table, TableRow, TableCell,
  WidthType, VerticalAlign, BorderStyle, ShadingType, ImageRun, AlignmentType,
} from "docx";
import type { GeneratedCV, SectionKey } from "@/contexts/CVBuilderContext";
import {
  A4_PAGE, CONTENT_W, bulletNumbering, footerOf, getTheme,
  isHidden, periodOf, visibleBullets, noBorders, urlToImageData, stripUrlPrefix,
  INK_HEX, shouldRender, getSectionOrder,
  achievementsBlock, certificationsBlock, competenciesBlock, customSectionsBlock,
  bulletPara, txt,
} from "./shared";


/** Riyadh — dark sienna left rail with photo, contact, skills, languages.
 *  Right column flows summary → experience → education. */
export async function buildRiyadhDoc(
  cv: GeneratedCV,
  photoUrl: string | null,
): Promise<Document> {
  const t = getTheme("bold");
  const SIDEBAR_W = Math.round(CONTENT_W * 0.32);
  const MAIN_W = CONTENT_W - SIDEBAR_W;
  const SIENNA_HEX = "9C5643";
  const SIENNA_DARK = "6E3D2F";
  const PAPER = "F5F0E8";

  // ---------- Sidebar children ----------
  const sidebar: Paragraph[] = [];

  const photoImg = photoUrl ? await urlToImageData(photoUrl) : null;
  if (photoImg) {
    sidebar.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        new ImageRun({
          data: photoImg.buffer,
          transformation: { width: 110, height: 110 },
          type: photoImg.type,
        } as any),
      ],
    }));
  }

  const sideHeading = (label: string) =>
    new Paragraph({
      spacing: { before: 160, after: 100 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: PAPER, space: 4 } },
      children: [new TextRun({
        text: label.toUpperCase(), size: 18, bold: true,
        color: PAPER, font: t.heading, characterSpacing: 30,
      })],
    });

  const sideLine = (text: string, opts: { bold?: boolean; size?: number; after?: number } = {}) =>
    new Paragraph({
      spacing: { after: opts.after ?? 40, line: 260 },
      children: [new TextRun({
        text, size: opts.size ?? 17,
        bold: opts.bold, color: PAPER, font: t.body,
      })],
    });

  if (!isHidden(cv, "contact")) {
    sidebar.push(sideHeading("Contact"));
    const contactRows: Array<[string, string]> = [
      ["Location", cv.contact.location],
      ["Phone", cv.contact.phone],
      ["Email", cv.contact.email],
      ["LinkedIn", stripUrlPrefix(cv.contact.linkedinUrl)],
      ["Website", stripUrlPrefix(cv.contact.website)],
    ];
    contactRows.forEach(([k, v], i) => {
      if (!v) return;
      sidebar.push(sideLine(k.toUpperCase(), { size: 14, bold: true }));
      sidebar.push(sideLine(v, { size: 16, after: i === contactRows.length - 1 ? 120 : 80 }));
    });
  }

  if (!isHidden(cv, "skills") && cv.skills.length) {
    sidebar.push(sideHeading("Skills"));
    cv.skills.forEach((s) => sidebar.push(
      new Paragraph({
        spacing: { after: 60, line: 260 },
        indent: { left: 160, hanging: 160 },
        children: [
          new TextRun({ text: "▪  ", size: 17, color: SIENNA_HEX, bold: true, font: t.body }),
          new TextRun({ text: s, size: 17, color: PAPER, font: t.body }),
        ],
      }),
    ));
  }

  if (!isHidden(cv, "languages") && cv.languages.length) {
    sidebar.push(sideHeading("Languages"));
    cv.languages.forEach((l) => sidebar.push(sideLine(
      l.level?.trim() ? `${l.name} — ${l.level}` : l.name,
      { size: 17, after: 60 },
    )));
  }

  // ---------- Main children ----------
  const main: Paragraph[] = [];

  // Name + title block
  main.push(new Paragraph({
    spacing: { after: 40 },
    children: [new TextRun({
      text: cv.contact.name || "Your name",
      bold: true, size: 56, font: t.heading, color: INK_HEX,
    })],
  }));
  if (cv.contact.jobTitle) {
    main.push(new Paragraph({
      spacing: { after: 240 },
      children: [new TextRun({
        text: cv.contact.jobTitle, size: 24, font: t.body, color: SIENNA_HEX, bold: true,
      })],
    }));
  } else {
    main.push(new Paragraph({ spacing: { after: 200 }, children: [new TextRun("")] }));
  }

  const mainHeading = (label: string) =>
    new Paragraph({
      spacing: { before: 240, after: 100 },
      children: [new TextRun({
        text: label.toUpperCase(), size: 22, bold: true,
        color: INK_HEX, font: t.heading, characterSpacing: 40,
      })],
    });

  const subRule = () =>
    new Paragraph({
      spacing: { after: 120 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: SIENNA_HEX, space: 1 } },
      children: [new TextRun({ text: "" })],
    });

  // Sidebar-only sections are pinned in the sidebar and excluded from the main reorder loop.
  const SIDEBAR_KEYS = new Set<SectionKey>(["skills", "languages"]);

  const renderSummary = () => {
    main.push(mainHeading("Profile"));
    main.push(subRule());
    main.push(new Paragraph({
      spacing: { after: 200, line: 320 },
      children: [new TextRun({ text: cv.summary, size: 20, color: INK_HEX, font: t.body })],
    }));
  };

  if (shouldRender(cv, "summary")) renderSummary();

  // Heading helper for plug-in block renderers (achievements/certs/competencies/custom).
  const blockHeading = (label: string) => {
    // Push the rule under the heading by returning the heading; caller handles flow.
    return mainHeading(label);
  };

  const mainRenderers: Partial<Record<SectionKey, () => void>> = {
    experience: () => {
      main.push(mainHeading("Experience"));
      main.push(subRule());
      cv.experience.forEach((exp) => {
        main.push(new Paragraph({
          spacing: { before: 80, after: 20 },
          tabStops: [{ type: "right" as any, position: MAIN_W - 200 }],
          children: [
            new TextRun({ text: exp.role || "", bold: true, size: 22, font: t.heading, color: INK_HEX }),
            ...(periodOf(exp) ? [new TextRun({ text: `\t${periodOf(exp)}`, size: 18, color: "5C5249", font: t.body })] : []),
          ],
        }));
        const sub = [exp.company, exp.location].filter(Boolean).join(" · ");
        if (sub) main.push(new Paragraph({
          spacing: { after: 80 },
          children: [new TextRun({ text: sub, size: 19, color: SIENNA_HEX, bold: true, font: t.body })],
        }));
        visibleBullets(exp).forEach((b) => main.push(new Paragraph({
          numbering: { reference: "cv-bullets", level: 0 },
          spacing: { after: 40, line: 280 },
          children: [new TextRun({ text: b.rewrite || b.original, size: 19, font: t.body, color: INK_HEX })],
        })));
      });
    },
    education: () => {
      main.push(mainHeading("Education"));
      main.push(subRule());
      cv.education.forEach((ed) => {
        main.push(new Paragraph({
          spacing: { before: 60, after: 20 },
          tabStops: [{ type: "right" as any, position: MAIN_W - 200 }],
          children: [
            new TextRun({ text: ed.qualification, bold: true, size: 21, font: t.heading, color: INK_HEX }),
            ...(ed.period ? [new TextRun({ text: `\t${ed.period}`, size: 18, color: "5C5249", font: t.body })] : []),
          ],
        }));
        if (ed.institution) main.push(new Paragraph({
          spacing: { after: 80 },
          children: [new TextRun({ text: ed.institution, size: 19, color: SIENNA_HEX, bold: true, font: t.body })],
        }));
      });
    },
    achievements: () => {
      const parts = achievementsBlock(cv, t, blockHeading);
      if (parts.length) { parts.splice(1, 0, subRule()); parts.forEach((p) => main.push(p)); }
    },
    certifications: () => {
      const parts = certificationsBlock(cv, t, blockHeading, MAIN_W);
      if (parts.length) { parts.splice(1, 0, subRule()); parts.forEach((p) => main.push(p)); }
    },
    competencies: () => {
      const parts = competenciesBlock(cv, t, blockHeading);
      if (parts.length) { parts.splice(1, 0, subRule()); parts.forEach((p) => main.push(p)); }
    },
    custom: () => {
      const parts = customSectionsBlock(cv, t, blockHeading);
      // customSectionsBlock emits multiple heading+body groups; insert a rule after each heading.
      parts.forEach((p) => main.push(p));
      void subRule; // (rule omitted for custom to keep groups tight)
    },
  };

  for (const key of getSectionOrder(cv)) {
    if (SIDEBAR_KEYS.has(key)) continue;
    if (!shouldRender(cv, key)) continue;
    mainRenderers[key]?.();
  }

  // Reference exports so the linter doesn't complain about unused imports.
  void bulletPara; void txt;


  // ---------- Sidebar + main table ----------
  const sidebarCell = new TableCell({
    width: { size: SIDEBAR_W, type: WidthType.DXA },
    shading: { type: ShadingType.CLEAR, fill: SIENNA_DARK, color: "auto" },
    borders: noBorders,
    verticalAlign: VerticalAlign.TOP,
    margins: { top: 360, bottom: 360, left: 260, right: 260 },
    children: sidebar.length ? sidebar : [new Paragraph({ children: [new TextRun("")] })],
  });
  const mainCell = new TableCell({
    width: { size: MAIN_W, type: WidthType.DXA },
    borders: noBorders,
    verticalAlign: VerticalAlign.TOP,
    margins: { top: 360, bottom: 360, left: 360, right: 200 },
    children: main,
  });

  const layout = new Table({
    width: { size: CONTENT_W, type: WidthType.DXA },
    columnWidths: [SIDEBAR_W, MAIN_W],
    borders: noBorders,
    rows: [new TableRow({ children: [sidebarCell, mainCell] })],
  });

  return new Document({
    creator: cv.contact.name || "CV Builder",
    title: `${cv.contact.name || "CV"} — ${cv.contact.jobTitle || ""}`.trim(),
    styles: { default: { document: { run: { font: t.body, size: 20 } } } },
    numbering: bulletNumbering,
    sections: [{
      properties: { page: { ...A4_PAGE, margin: { top: 0, bottom: 0, left: 0, right: 0 } } },
      footers: { default: footerOf(cv, t) },
      children: [layout],
    }],
  });
}
