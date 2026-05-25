import { Document, Paragraph, Table, TextRun, BorderStyle } from "docx";
import type { GeneratedCV } from "@/contexts/CVBuilderContext";
import {
  A4_PAGE, CONTENT_W, bulletNumbering, footerOf, getTheme,
  isHidden, periodOf, visibleBullets,
  txt, sectionHeading, roleRow, companyRow, bulletPara,
  headerTable, chipsParagraph, quoteSummary, INK_HEX,
} from "./shared";

/** Single-column flowing layout — used by Dubai, London, Zurich, Berlin, Geneva. */
export interface FlowOptions {
  headingVariant: "bar" | "underline" | "none";
  sections: Array<"summary" | "experience" | "education" | "skills" | "skills-pills" | "languages">;
  photo?: { url: string | null; size: number; shape: "circle" | "square" };
  nameSize?: number;
  /** Render summary in a sienna left-bar quote block (Zurich). */
  quoteSummary?: boolean;
  /** Header has a bottom ink rule (London, Berlin). */
  bottomRule?: boolean;
  /** Geneva-style timeline rail under experience entries. */
  timeline?: boolean;
  headingMap?: Partial<Record<"summary" | "experience" | "education" | "skills" | "languages", string>>;
}


export async function buildFlowingDoc(
  cv: GeneratedCV,
  template: Parameters<typeof getTheme>[0],
  opts: FlowOptions,
): Promise<Document> {
  const t = getTheme(template);
  const blocks: Array<Paragraph | Table> = [];
  const labelOf = (k: "summary" | "experience" | "education" | "skills" | "languages", fallback: string) =>
    opts.headingMap?.[k] ?? fallback;

  // ----- HEADER (photo + name side-by-side) -----
  if (!isHidden(cv, "contact")) {
    const headerParts = await headerTable(cv, t, {
      photoUrl: opts.photo?.url ?? null,
      photoSize: opts.photo?.size ?? 90,
      photoShape: opts.photo?.shape ?? "square",
      nameSize: opts.nameSize ?? 44,
      contentW: CONTENT_W,
      bottomRule: opts.bottomRule,
    });
    blocks.push(...headerParts);
  }

  for (const sec of opts.sections) {
    if (sec === "summary") {
      if (!isHidden(cv, "summary") && cv.summary) {
        blocks.push(sectionHeading(labelOf("summary", "Professional Summary"), t, opts.headingVariant));
        blocks.push(
          opts.quoteSummary
            ? quoteSummary(cv.summary, t)
            : txt(cv.summary, t, { size: 20, color: t.subInk, after: 120 }),
        );
      }
    } else if (sec === "experience") {
      if (!isHidden(cv, "experience") && cv.experience.length) {
        blocks.push(sectionHeading(labelOf("experience", "Work Experience"), t, opts.headingVariant));
        cv.experience.forEach((exp) => {
          blocks.push(roleRow(exp.role || "", periodOf(exp), t, CONTENT_W));
          const cr = companyRow(exp.company || "", exp.location || "", t);
          if (cr) blocks.push(cr);
          visibleBullets(exp).forEach((b) => {
            blocks.push(bulletPara(b.rewrite || b.original, t));
          });
        });
      }
    } else if (sec === "education") {
      if (!isHidden(cv, "education") && cv.education.length) {
        blocks.push(sectionHeading(labelOf("education", "Education"), t, opts.headingVariant));
        cv.education.forEach((ed) => {
          blocks.push(roleRow(ed.qualification, ed.period || "", t, CONTENT_W));
          if (ed.institution) {
            blocks.push(txt(ed.institution, t, { size: 19, color: t.primary, bold: true, after: 80 }));
          }
        });
      }
    } else if (sec === "skills") {
      if (!isHidden(cv, "skills") && cv.skills.length) {
        blocks.push(sectionHeading(labelOf("skills", "Skills & Competencies"), t, opts.headingVariant));
        cv.skills.forEach((s) => blocks.push(bulletPara(s, t)));
      }
    } else if (sec === "skills-pills") {
      if (!isHidden(cv, "skills") && cv.skills.length) {
        blocks.push(sectionHeading(labelOf("skills", "Skills & Competencies"), t, opts.headingVariant));
        blocks.push(chipsParagraph(cv.skills, t));
      }
    } else if (sec === "languages") {
      if (!isHidden(cv, "languages") && cv.languages.length) {
        blocks.push(sectionHeading(labelOf("languages", "Languages"), t, opts.headingVariant));
        blocks.push(
          txt(
            cv.languages
              .map((l) => (l.level && l.level.trim() ? `${l.name} (${l.level.trim()})` : l.name))
              .join("   ·   "),
            t,
            { size: 20, color: t.subInk, after: 80 },
          ),
        );
      }
    }
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
        children: blocks,
      },
    ],
  });
}
