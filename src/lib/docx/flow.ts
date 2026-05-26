import { Document, Paragraph, Table, TextRun, BorderStyle } from "docx";
import type { GeneratedCV, SectionKey } from "@/contexts/CVBuilderContext";
import {
  A4_PAGE, CONTENT_W, bulletNumbering, footerOf, getTheme,
  isHidden, periodOf, visibleBullets,
  txt, sectionHeading, roleRow, companyRow, bulletPara,
  headerTable, chipsParagraph, quoteSummary, INK_HEX,
  shouldRender, getSectionOrder,
  achievementsBlock, certificationsBlock, competenciesBlock, customSectionsBlock,
} from "./shared";

type FlowLabelKey =
  | "summary" | "experience" | "education" | "skills" | "languages"
  | "achievements" | "certifications" | "competencies";

/** Single-column flowing layout — used by Dubai, London, Zurich, Berlin, Geneva. */
export interface FlowOptions {
  headingVariant: "bar" | "underline" | "none";
  photo?: { url: string | null; size: number; shape: "circle" | "square" };
  nameSize?: number;
  /** Render summary in a sienna left-bar quote block (Zurich). */
  quoteSummary?: boolean;
  /** Header has a bottom ink rule (London, Berlin). */
  bottomRule?: boolean;
  /** Geneva-style timeline rail under experience entries. */
  timeline?: boolean;
  /** Skills rendered as pills (Berlin) instead of a bullet list. */
  skillsVariant?: "bullets" | "pills";
  headingMap?: Partial<Record<FlowLabelKey, string>>;
}

export async function buildFlowingDoc(
  cv: GeneratedCV,
  template: Parameters<typeof getTheme>[0],
  opts: FlowOptions,
): Promise<Document> {
  const t = getTheme(template);
  const blocks: Array<Paragraph | Table> = [];
  const labelOf = (k: FlowLabelKey, fallback: string) =>
    opts.headingMap?.[k] ?? fallback;
  const heading = (label: string) => sectionHeading(label, t, opts.headingVariant);

  // ----- HEADER -----
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

  // ----- SUMMARY (pinned at top) -----
  if (shouldRender(cv, "summary")) {
    blocks.push(heading(labelOf("summary", "Professional Summary")));
    blocks.push(
      opts.quoteSummary
        ? quoteSummary(cv.summary, t)
        : txt(cv.summary, t, { size: 20, color: t.subInk, after: 120 }),
    );
  }

  // ----- REORDERABLE BODY SECTIONS -----
  const renderers: Partial<Record<SectionKey, () => void>> = {
    experience: () => {
      blocks.push(heading(labelOf("experience", "Work Experience")));
      cv.experience.forEach((exp, idx) => {
        if (opts.timeline) {
          blocks.push(new Paragraph({
            spacing: { before: idx === 0 ? 60 : 180, after: 20 },
            children: [new TextRun({ text: "●", size: 18, color: t.primary, font: t.body, bold: true })],
          }));
        }
        blocks.push(roleRow(exp.role || "", periodOf(exp), t, CONTENT_W));
        const cr = companyRow(exp.company || "", exp.location || "", t);
        if (cr) blocks.push(cr);
        visibleBullets(exp).forEach((b) => {
          blocks.push(bulletPara(b.rewrite || b.original, t));
        });
      });
      void BorderStyle; void INK_HEX;
    },
    education: () => {
      blocks.push(heading(labelOf("education", "Education")));
      cv.education.forEach((ed) => {
        blocks.push(roleRow(ed.qualification, ed.period || "", t, CONTENT_W));
        if (ed.institution) {
          blocks.push(txt(ed.institution, t, { size: 19, color: t.primary, bold: true, after: 80 }));
        }
      });
    },
    skills: () => {
      const label = labelOf("skills", "Skills & Competencies");
      blocks.push(heading(label));
      if (opts.skillsVariant === "pills") {
        blocks.push(chipsParagraph(cv.skills, t));
      } else {
        cv.skills.forEach((s) => blocks.push(bulletPara(s, t)));
      }
    },
    languages: () => {
      blocks.push(heading(labelOf("languages", "Languages")));
      blocks.push(
        txt(
          cv.languages
            .map((l) => (l.level && l.level.trim() ? `${l.name} (${l.level.trim()})` : l.name))
            .join("   ·   "),
          t,
          { size: 20, color: t.subInk, after: 80 },
        ),
      );
    },
    achievements: () => {
      achievementsBlock(cv, t, heading, labelOf("achievements", "Key Achievements"))
        .forEach((p) => blocks.push(p));
    },
    certifications: () => {
      certificationsBlock(cv, t, heading, CONTENT_W, labelOf("certifications", "Certifications"))
        .forEach((p) => blocks.push(p));
    },
    competencies: () => {
      competenciesBlock(cv, t, heading, labelOf("competencies", "Core Competencies"))
        .forEach((p) => blocks.push(p));
    },
    custom: () => {
      customSectionsBlock(cv, t, heading).forEach((p) => blocks.push(p));
    },
  };

  for (const key of getSectionOrder(cv)) {
    if (!shouldRender(cv, key)) continue;
    renderers[key]?.();
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
