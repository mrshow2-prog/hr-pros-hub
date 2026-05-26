import {
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  VerticalAlign,
  AlignmentType,
  LevelFormat,
  BorderStyle,
  ImageRun,
  ShadingType,
  Footer,
  PageNumber,
} from "docx";
import type { GeneratedCV, CVExperience, SectionKey } from "@/contexts/CVBuilderContext";
import { getTemplateConfig, type TemplateConfig } from "@/lib/cvTemplateConfig";
import type { TemplateId } from "@/contexts/CVBuilderContext";

/* ---------- font / color mapping (mirrors PDF / preview templates) ---------- */
const FONT_MAP: Record<string, string> = {
  "Times-Roman": "Georgia",
  "Times-Bold": "Georgia",
  "Helvetica-Bold": "Calibri",
  Helvetica: "Calibri",
};
const mapFont = (f: string) => FONT_MAP[f] || "Calibri";

/** Brand sienna — matches preview + pdfme across every template. */
export const SIENNA = "9C5643";
export const INK_HEX = "1A1714";
export const HAIRLINE = "C8C0B8";

export interface DocxTheme {
  cfg: TemplateConfig;
  heading: string;
  body: string;
  primary: string; // hex no #
  muted: string;
  subInk: string;
}

export function getTheme(template: TemplateId): DocxTheme {
  const cfg = getTemplateConfig(template);
  return {
    cfg,
    heading: mapFont(cfg.headingFont),
    body: mapFont(cfg.bodyFont),
    primary: SIENNA,
    muted: "5C5249",
    subInk: "1A1714",
  };
}

/* ---------- helpers ---------- */
export const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
export const noBorders = {
  top: noBorder, bottom: noBorder, left: noBorder, right: noBorder,
  insideHorizontal: noBorder, insideVertical: noBorder,
};

export function isHidden(cv: GeneratedCV, key: SectionKey) {
  return cv.hiddenSections.includes(key);
}

export function periodOf(exp: CVExperience) {
  return [exp.startDate, exp.endDate].filter(Boolean).join(" – ") || exp.period || "";
}

export function cleanBulletText(value: string | null | undefined) {
  return (value ?? "")
    .replace(/\r?\n+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/^[-–—•▪·*]+\s*/, "")
    .trim();
}

export function visibleBullets(exp: CVExperience) {
  return exp.bullets
    .map((b) => ({
      ...b,
      rewrite: cleanBulletText(b.rewrite),
      original: cleanBulletText(b.original),
    }))
    .filter((b) => b.status !== "reverted" && (b.rewrite || b.original));
}

export const bulletNumbering = {
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

/* ---------- paragraph builders ---------- */
export function blank(after = 60) {
  return new Paragraph({ spacing: { after }, children: [new TextRun({ text: "" })] });
}

export function txt(
  text: string,
  t: DocxTheme,
  opts: { size?: number; bold?: boolean; italics?: boolean; color?: string; font?: string; after?: number; before?: number } = {},
) {
  return new Paragraph({
    spacing: { after: opts.after ?? 60, before: opts.before ?? 0 },
    children: [
      new TextRun({
        text,
        size: opts.size ?? 20,
        bold: opts.bold,
        italics: opts.italics,
        color: opts.color,
        font: opts.font ?? t.body,
      }),
    ],
  });
}

/** Headline style — driven by template's sectionDividerStyle. */
export function sectionHeading(
  text: string,
  t: DocxTheme,
  variant: "bar" | "underline" | "none" = "underline",
) {
  const label = t.cfg.headingUppercase ? text.toUpperCase() : text;
  const run = new TextRun({
    text: label,
    bold: true,
    size: 24,
    font: t.heading,
    color: INK_HEX,
  });
  if (variant === "bar") {
    // left-accent bar: simulate with a thick left border on the paragraph
    return new Paragraph({
      spacing: { before: 240, after: 120 },
      indent: { left: 120 },
      border: { left: { style: BorderStyle.SINGLE, size: 18, color: t.primary, space: 6 } },
      children: [run],
    });
  }
  if (variant === "underline") {
    return new Paragraph({
      spacing: { before: 240, after: 120 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: t.primary, space: 4 } },
      children: [run],
    });
  }
  return new Paragraph({ spacing: { before: 240, after: 120 }, children: [run] });
}

/** Role + dates row using a right tab stop. */
export function roleRow(
  role: string,
  period: string,
  t: DocxTheme,
  rightTabDxa: number,
) {
  return new Paragraph({
    spacing: { before: 160, after: 20 },
    tabStops: [{ type: "right" as any, position: rightTabDxa }],
    children: [
      new TextRun({ text: role || "", bold: true, size: 22, font: t.heading }),
      ...(period
        ? [new TextRun({ text: `\t${period}`, size: 18, color: t.muted, font: t.body })]
        : []),
    ],
  });
}

export function companyRow(company: string, location: string, t: DocxTheme) {
  const sub = [company, location].filter(Boolean).join(" · ");
  if (!sub) return null;
  return new Paragraph({
    spacing: { after: 80 },
    children: [
      new TextRun({ text: sub, size: 19, color: t.primary, font: t.body, bold: true }),
    ],
  });
}

export function bulletPara(text: string, t: DocxTheme) {
  return new Paragraph({
    numbering: { reference: "cv-bullets", level: 0 },
    spacing: { after: 40 },
    children: [new TextRun({ text, size: 19, font: t.body, color: t.subInk })],
  });
}

export function nameHeader(cv: GeneratedCV, t: DocxTheme, size = 44) {
  return new Paragraph({
    spacing: { after: 40 },
    children: [
      new TextRun({
        text: cv.contact.name || "Your name",
        bold: true,
        size,
        font: t.heading,
        color: "111827",
      }),
    ],
  });
}

export function jobTitlePara(cv: GeneratedCV, t: DocxTheme) {
  if (!cv.contact.jobTitle) return null;
  return new Paragraph({
    spacing: { after: 80 },
    children: [
      new TextRun({
        text: cv.contact.jobTitle,
        size: 22,
        font: t.body,
        color: t.primary,
      }),
    ],
  });
}

export function stripUrlPrefix(value: string | null | undefined): string {
  if (!value) return "";
  return value.trim().replace(/^https?:\/\//i, "").replace(/^www\./i, "").replace(/\/+$/, "");
}

export function contactLinePara(cv: GeneratedCV, t: DocxTheme, alignment?: any) {
  const items = [cv.contact.location, cv.contact.phone, cv.contact.email, stripUrlPrefix(cv.contact.linkedinUrl), stripUrlPrefix(cv.contact.website)].filter(Boolean);
  if (items.length === 0) return null;
  return new Paragraph({
    spacing: { after: 120 },
    alignment,
    children: [new TextRun({ text: items.join("   ·   "), size: 18, color: t.muted, font: t.body })],
  });
}

export async function urlToImageData(
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

export async function photoParagraph(
  photoUrl: string | null,
  size: number,
  shape: "circle" | "square",
  alignment?: any,
): Promise<Paragraph | null> {
  if (!photoUrl) return null;
  const img = await urlToImageData(photoUrl);
  if (!img) return null;
  return new Paragraph({
    alignment: alignment ?? AlignmentType.LEFT,
    spacing: { after: 80 },
    children: [
      new ImageRun({
        data: img.buffer,
        transformation: { width: size, height: size },
        type: img.type,
      } as any),
    ],
  });
}

/** Photo + name/title/contact placed side-by-side via a borderless 2-col table.
 *  Mirrors the wizard previews where the photo sits to the left of the name.
 *  If `bottomRule` is set, a single ink line is drawn under the header table. */
export async function headerTable(
  cv: GeneratedCV,
  t: DocxTheme,
  opts: {
    photoUrl: string | null;
    photoSize: number; // px
    photoShape: "circle" | "square";
    nameSize?: number; // half-points
    titleSize?: number;
    contentW: number;
    bottomRule?: boolean;
  },
): Promise<Array<Table | Paragraph>> {
  const nameSize = opts.nameSize ?? 44;
  const titleSize = opts.titleSize ?? 22;
  const photoImg = opts.photoUrl ? await urlToImageData(opts.photoUrl) : null;
  const photoCellW = photoImg ? Math.round(opts.photoSize * 15) : 0; // ~15 DXA / px
  const gapW = photoImg ? 200 : 0;
  const textCellW = opts.contentW - photoCellW - gapW;

  const textChildren: Paragraph[] = [
    new Paragraph({
      spacing: { after: 40 },
      children: [
        new TextRun({
          text: cv.contact.name || "Your name",
          bold: true,
          size: nameSize,
          font: t.heading,
          color: INK_HEX,
        }),
      ],
    }),
  ];
  if (cv.contact.jobTitle) {
    textChildren.push(
      new Paragraph({
        spacing: { after: 80 },
        children: [
          new TextRun({
            text: cv.contact.jobTitle,
            size: titleSize,
            font: t.body,
            color: t.primary,
          }),
        ],
      }),
    );
  }
  const items = [
    cv.contact.location,
    cv.contact.phone,
    cv.contact.email,
    stripUrlPrefix(cv.contact.linkedinUrl),
    stripUrlPrefix(cv.contact.website),
  ].filter(Boolean) as string[];
  if (items.length) {
    textChildren.push(
      new Paragraph({
        spacing: { after: 0 },
        children: [
          new TextRun({
            text: items.join("   ·   "),
            size: 18,
            color: t.muted,
            font: t.body,
          }),
        ],
      }),
    );
  }

  const cells: TableCell[] = [];
  if (photoImg) {
    cells.push(
      new TableCell({
        width: { size: photoCellW, type: WidthType.DXA },
        borders: noBorders,
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 0, bottom: 0, left: 0, right: 100 },
        children: [
          new Paragraph({
            spacing: { after: 0 },
            children: [
              new ImageRun({
                data: photoImg.buffer,
                transformation: { width: opts.photoSize, height: opts.photoSize },
                type: photoImg.type,
              } as any),
            ],
          }),
        ],
      }),
    );
  }
  cells.push(
    new TableCell({
      width: { size: textCellW, type: WidthType.DXA },
      borders: noBorders,
      verticalAlign: VerticalAlign.CENTER,
      margins: { top: 0, bottom: 0, left: photoImg ? 100 : 0, right: 0 },
      children: textChildren,
    }),
  );

  const tbl = new Table({
    width: { size: opts.contentW, type: WidthType.DXA },
    columnWidths: photoImg ? [photoCellW, textCellW] : [opts.contentW],
    borders: opts.bottomRule
      ? { ...noBorders, bottom: { style: BorderStyle.SINGLE, size: 12, color: INK_HEX } }
      : noBorders,
    rows: [new TableRow({ children: cells })],
  });
  return [tbl, blank(120)];
}

/** Render a list of skills as visual "chips" — TextRuns with shaded backgrounds,
 *  separated by a thin gap. Mirrors the rounded pills in the Skills-First preview. */
export function chipsParagraph(items: string[], t: DocxTheme): Paragraph {
  const runs: TextRun[] = [];
  items.forEach((s, i) => {
    runs.push(
      new TextRun({
        text: ` ${s} `,
        size: 19,
        font: t.body,
        color: INK_HEX,
        shading: { type: ShadingType.CLEAR, fill: "F4EFE6", color: "auto" },
      }),
    );
    if (i < items.length - 1) {
      runs.push(new TextRun({ text: "  ", size: 19, font: t.body }));
    }
  });
  return new Paragraph({ spacing: { after: 140, line: 320 }, children: runs });
}

/** Quote-style summary block with a sienna left border (Executive template). */
export function quoteSummary(text: string, t: DocxTheme): Paragraph {
  return new Paragraph({
    spacing: { after: 200, line: 340 },
    indent: { left: 200 },
    border: {
      left: { style: BorderStyle.SINGLE, size: 18, color: t.primary, space: 8 },
    },
    children: [
      new TextRun({ text, size: 21, font: t.body, color: t.subInk, italics: false }),
    ],
  });
}

export function footerOf(cv: GeneratedCV, t: DocxTheme) {
  return new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({ text: `${cv.contact.name || ""}  ·  `, size: 16, color: "9CA3AF", font: t.body }),
          new TextRun({ children: ["Page ", PageNumber.CURRENT, " of ", PageNumber.TOTAL_PAGES], size: 16, color: "9CA3AF", font: t.body }),
        ],
      }),
    ],
  });
}

/* ---------- standard page properties for A4 ---------- */
export const A4_PAGE = {
  size: { width: 11906, height: 16838 },
  margin: { top: 720, bottom: 720, left: 800, right: 800 },
};
/** Content width inside A4 with the above margins. */
export const CONTENT_W = 11906 - 800 - 800; // 10306 DXA
