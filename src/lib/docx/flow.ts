import { Document, Paragraph, AlignmentType } from "docx";
import type { GeneratedCV } from "@/contexts/CVBuilderContext";
import {
  A4_PAGE, CONTENT_W, bulletNumbering, footerOf, getTheme,
  isHidden, periodOf, visibleBullets,
  blank, txt, sectionHeading, roleRow, companyRow, bulletPara,
  nameHeader, jobTitlePara, contactLinePara, photoParagraph,
} from "./shared";

/** Single-column flowing layout — used by Modern, Classic, Executive, SkillsFirst.
 *  Pass the heading variant + section order from each template wrapper. */
export interface FlowOptions {
  headingVariant: "bar" | "underline" | "none";
  /** Section order. "skills-pills" renders skills as inline tags. */
  sections: Array<"summary" | "experience" | "education" | "skills" | "skills-pills" | "languages">;
  /** Photo display. */
  photo?: { url: string | null; size: number; shape: "circle" | "square" };
  /** Display name size in half-points. */
  nameSize?: number;
  /** Heading override map (e.g. "Executive Summary" for executive template). */
  headingMap?: Partial<Record<"summary" | "experience" | "education" | "skills" | "languages", string>>;
}

export async function buildFlowingDoc(
  cv: GeneratedCV,
  template: Parameters<typeof getTheme>[0],
  opts: FlowOptions,
): Promise<Document> {
  const t = getTheme(template);
  const children: Paragraph[] = [];
  const labelOf = (k: "summary" | "experience" | "education" | "skills" | "languages", fallback: string) =>
    opts.headingMap?.[k] ?? fallback;

  // ----- HEADER -----
  if (!isHidden(cv, "contact")) {
    const photoPara = opts.photo ? await photoParagraph(opts.photo.url, opts.photo.size, opts.photo.shape) : null;
    if (photoPara) children.push(photoPara);
    children.push(nameHeader(cv, t, opts.nameSize ?? 44));
    const jt = jobTitlePara(cv, t);
    if (jt) children.push(jt);
    const cl = contactLinePara(cv, t);
    if (cl) children.push(cl);
  }

  for (const sec of opts.sections) {
    if (sec === "summary") {
      if (!isHidden(cv, "summary") && cv.summary) {
        children.push(sectionHeading(labelOf("summary", "Professional Summary"), t, opts.headingVariant));
        children.push(txt(cv.summary, t, { size: 20, color: t.subInk, after: 80 }));
      }
    } else if (sec === "experience") {
      if (!isHidden(cv, "experience") && cv.experience.length) {
        children.push(sectionHeading(labelOf("experience", "Work Experience"), t, opts.headingVariant));
        cv.experience.forEach((exp) => {
          children.push(roleRow(exp.role || "", periodOf(exp), t, CONTENT_W));
          const cr = companyRow(exp.company || "", exp.location || "", t);
          if (cr) children.push(cr);
          visibleBullets(exp).forEach((b) => {
            children.push(bulletPara(b.rewrite || b.original, t));
          });
        });
      }
    } else if (sec === "education") {
      if (!isHidden(cv, "education") && cv.education.length) {
        children.push(sectionHeading(labelOf("education", "Education"), t, opts.headingVariant));
        cv.education.forEach((ed) => {
          children.push(roleRow(ed.qualification, ed.period || "", t, CONTENT_W));
          if (ed.institution) {
            children.push(txt(ed.institution, t, { size: 19, color: t.primary, bold: true, after: 80 }));
          }
        });
      }
    } else if (sec === "skills") {
      if (!isHidden(cv, "skills") && cv.skills.length) {
        children.push(sectionHeading(labelOf("skills", "Skills & Competencies"), t, opts.headingVariant));
        // 2-column-ish list via bullets (works reliably across Word/Google Docs)
        cv.skills.forEach((s) => {
          children.push(bulletPara(s, t));
        });
      }
    } else if (sec === "skills-pills") {
      if (!isHidden(cv, "skills") && cv.skills.length) {
        children.push(sectionHeading(labelOf("skills", "Skills & Competencies"), t, opts.headingVariant));
        // Pills emulated as a single paragraph of separated chips
        children.push(
          txt(cv.skills.join("   ·   "), t, { size: 20, color: t.subInk, after: 120 }),
        );
      }
    } else if (sec === "languages") {
      if (!isHidden(cv, "languages") && cv.languages.length) {
        children.push(sectionHeading(labelOf("languages", "Languages"), t, opts.headingVariant));
        children.push(
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
        children,
      },
    ],
  });
}
