import { generate } from "@pdfme/generator";
import { text, image, line } from "@pdfme/schemas";
import type { Template, Schema } from "@pdfme/common";
import { saveAs } from "file-saver";
import type { GeneratedCV } from "@/contexts/CVBuilderContext";
import { contactItems, isHidden, periodOf, visibleBullets } from "@/components/cv-builder/pdf/shared";
import { getTemplateConfig } from "@/lib/cvTemplateConfig";

/* ============================================================
 * Modern CV → PDF via @pdfme/generator
 * ------------------------------------------------------------
 * pdfme works with absolute-positioned schemas (mm units).
 * We build the template programmatically: each block computes
 * its own height, advances the y-cursor, and starts a new page
 * when needed.
 * ============================================================ */

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 16;
const CONTENT_W = PAGE_W - MARGIN * 2;
const TOP = 16;
const BOTTOM = 16;

const PT_PER_MM = 2.8346;
const ptToMm = (pt: number) => pt / PT_PER_MM;

// Rough average character width in mm for Helvetica-ish fonts.
const charWidthMm = (fontSizePt: number) => (fontSizePt * 0.50) / PT_PER_MM;

function wrapLines(text: string, widthMm: number, fontSizePt: number): string[] {
  const lines: string[] = [];
  const cw = charWidthMm(fontSizePt);
  const maxChars = Math.max(8, Math.floor(widthMm / cw));
  for (const para of (text || "").split(/\n/)) {
    if (!para) { lines.push(""); continue; }
    const words = para.split(/\s+/);
    let cur = "";
    for (const w of words) {
      const next = cur ? cur + " " + w : w;
      if (next.length <= maxChars) cur = next;
      else {
        if (cur) lines.push(cur);
        // hard-split very long tokens
        if (w.length > maxChars) {
          let rest = w;
          while (rest.length > maxChars) {
            lines.push(rest.slice(0, maxChars));
            rest = rest.slice(maxChars);
          }
          cur = rest;
        } else cur = w;
      }
    }
    if (cur) lines.push(cur);
  }
  return lines.length ? lines : [""];
}

function textHeightMm(text: string, widthMm: number, fontSizePt: number, lineHeight = 1.25) {
  const n = wrapLines(text, widthMm, fontSizePt).length;
  return n * ptToMm(fontSizePt) * lineHeight;
}

interface Block {
  schema: Schema & { name: string };
  value: string;
}

async function urlToDataUrl(url: string): Promise<string | null> {
  try {
    const r = await fetch(url);
    const b = await r.blob();
    return await new Promise((res, rej) => {
      const fr = new FileReader();
      fr.onloadend = () => res(fr.result as string);
      fr.onerror = rej;
      fr.readAsDataURL(b);
    });
  } catch { return null; }
}

export async function exportModernPdfme(
  cv: GeneratedCV,
  photoUrl: string | null,
  fileName: string,
) {
  const cfg = getTemplateConfig("modern");
  const primary = cfg.primaryColor;
  const ink = "#111827";
  const sub = "#374151";
  const muted = "#6b7280";

  // We'll build a list of pages, each as an array of schemas.
  const pages: Array<Array<Schema & { name: string }>> = [[]];
  const inputs: Record<string, string> = {};
  let pageIdx = 0;
  let y = TOP;
  let counter = 0;
  const uid = (p: string) => `${p}_${counter++}`;

  const newPage = () => {
    pages.push([]);
    pageIdx++;
    y = TOP;
  };
  const ensure = (h: number) => {
    if (y + h > PAGE_H - BOTTOM) newPage();
  };
  const push = (s: Schema & { name: string }, value = "") => {
    pages[pageIdx].push(s);
    inputs[s.name] = value;
  };

  const addText = (opts: {
    value: string;
    width?: number;
    x?: number;
    fontSize: number;
    color?: string;
    bold?: boolean;
    italic?: boolean;
    align?: "left" | "right" | "center";
    lineHeight?: number;
    spaceAfter?: number;
    uppercase?: boolean;
    letterSpacing?: number;
  }) => {
    const value = opts.uppercase ? opts.value.toUpperCase() : opts.value;
    const width = opts.width ?? CONTENT_W;
    const x = opts.x ?? MARGIN;
    const lh = opts.lineHeight ?? 1.25;
    const h = Math.max(ptToMm(opts.fontSize) * lh, textHeightMm(value, width, opts.fontSize, lh));
    ensure(h);
    const name = uid("t");
    push(
      {
        name,
        type: "text",
        position: { x, y },
        width,
        height: h + 0.5,
        fontSize: opts.fontSize,
        fontColor: opts.color ?? ink,
        alignment: opts.align ?? "left",
        verticalAlignment: "top",
        lineHeight: lh,
        characterSpacing: opts.letterSpacing ?? 0,

      } as Schema & { name: string },
      value,
    );
    y += h + (opts.spaceAfter ?? 1);
  };

  const sectionTitle = (label: string) => {
    ensure(8);
    // left accent bar
    const barName = uid("bar");
    push(
      {
        name: barName,
        type: "line",
        position: { x: MARGIN, y: y + 0.5 },
        width: 1.4,
        height: 5.2,
        color: primary,
      } as Schema & { name: string },
      "",
    );
    addText({
      value: label,
      x: MARGIN + 3.5,
      width: CONTENT_W - 3.5,
      fontSize: 10.5,
      color: ink,
      bold: true,
      uppercase: true,
      letterSpacing: 1.1,
      spaceAfter: 3,
    });
  };

  /* ---------------- Header ---------------- */
  if (!isHidden(cv, "contact")) {
    const photoSize = 24;
    const photoData = photoUrl ? await urlToDataUrl(photoUrl) : null;
    const hasPhoto = !!photoData && cfg.photoStyle !== "none";

    const headerTextX = hasPhoto ? MARGIN + photoSize + 6 : MARGIN;
    const headerTextW = CONTENT_W - (hasPhoto ? photoSize + 6 : 0);
    const headerStart = y;

    if (hasPhoto) {
      push(
        {
          name: uid("photo"),
          type: "image",
          position: { x: MARGIN, y: headerStart },
          width: photoSize,
          height: photoSize,
        } as Schema & { name: string },
        photoData!,
      );
    }

    // Name
    const nameSize = 22;
    const nameH = ptToMm(nameSize) * 1.1;
    push(
      {
        name: uid("name"),
        type: "text",
        position: { x: headerTextX, y: headerStart },
        width: headerTextW,
        height: nameH + 1,
        fontSize: nameSize,
        fontColor: ink,
        alignment: "left",
        verticalAlignment: "top",
        lineHeight: 1.1,
        characterSpacing: 0.2,

      } as Schema & { name: string },
      cv.contact.name || "Your name",
    );
    let hy = headerStart + nameH + 1;

    if (cv.contact.jobTitle) {
      const jh = ptToMm(11) * 1.2;
      push(
        {
          name: uid("title"),
          type: "text",
          position: { x: headerTextX, y: hy },
          width: headerTextW,
          height: jh + 1,
          fontSize: 11,
          fontColor: primary,
          alignment: "left",
          verticalAlignment: "top",
          lineHeight: 1.2,
          characterSpacing: 0,
  
        } as Schema & { name: string },
        cv.contact.jobTitle,
      );
      hy += jh + 1;
    }

    const contacts = contactItems(cv);
    if (contacts.length) {
      const cText = contacts.join("   ·   ");
      const ch = textHeightMm(cText, headerTextW, 8.5, 1.4);
      push(
        {
          name: uid("contact"),
          type: "text",
          position: { x: headerTextX, y: hy + 1.5 },
          width: headerTextW,
          height: ch + 1,
          fontSize: 8.5,
          fontColor: muted,
          alignment: "left",
          verticalAlignment: "top",
          lineHeight: 1.4,
          characterSpacing: 0,
  
        } as Schema & { name: string },
        cText,
      );
      hy += ch + 1.5;
    }

    y = Math.max(hy, headerStart + (hasPhoto ? photoSize : 0)) + 4;
  }

  /* ---------------- Summary ---------------- */
  if (!isHidden(cv, "summary") && cv.summary) {
    sectionTitle("Professional Summary");
    addText({
      value: cv.summary,
      fontSize: 9.5,
      color: sub,
      lineHeight: 1.5,
      spaceAfter: 4,
    });
  }

  /* ---------------- Experience ---------------- */
  if (!isHidden(cv, "experience") && cv.experience.length > 0) {
    sectionTitle("Work Experience");
    for (const exp of cv.experience) {
      // role + period row
      const period = periodOf(exp);
      const roleSize = 10.5;
      const roleH = ptToMm(roleSize) * 1.25;
      ensure(roleH + 6);
      push(
        {
          name: uid("role"),
          type: "text",
          position: { x: MARGIN, y },
          width: CONTENT_W - 45,
          height: roleH + 1,
          fontSize: roleSize,
          fontColor: ink,
          alignment: "left",
          verticalAlignment: "top",
          lineHeight: 1.25,
          characterSpacing: 0,
  
        } as Schema & { name: string },
        exp.role || "",
      );
      if (period) {
        push(
          {
            name: uid("period"),
            type: "text",
            position: { x: MARGIN + CONTENT_W - 45, y },
            width: 45,
            height: roleH + 1,
            fontSize: 8.5,
            fontColor: muted,
            alignment: "right",
            verticalAlignment: "top",
            lineHeight: 1.25,
            characterSpacing: 0,
    
          } as Schema & { name: string },
          period,
        );
      }
      y += roleH + 0.5;

      const compLine = [exp.company, exp.location].filter(Boolean).join(" · ");
      if (compLine) {
        addText({
          value: compLine,
          fontSize: 9.5,
          color: primary,
          spaceAfter: 1.5,
        });
      }

      for (const b of visibleBullets(exp)) {
        const txt = b.rewrite || b.original;
        const bulletFS = 9.2;
        const lh = 1.45;
        const h = Math.max(ptToMm(bulletFS) * lh, textHeightMm(txt, CONTENT_W - 4, bulletFS, lh));
        ensure(h + 0.5);
        push(
          {
            name: uid("dot"),
            type: "text",
            position: { x: MARGIN, y },
            width: 4,
            height: h,
            fontSize: bulletFS,
            fontColor: primary,
            alignment: "left",
            verticalAlignment: "top",
            lineHeight: lh,
            characterSpacing: 0,
    
          } as Schema & { name: string },
          "•",
        );
        push(
          {
            name: uid("btxt"),
            type: "text",
            position: { x: MARGIN + 4, y },
            width: CONTENT_W - 4,
            height: h + 0.5,
            fontSize: bulletFS,
            fontColor: sub,
            alignment: "left",
            verticalAlignment: "top",
            lineHeight: lh,
            characterSpacing: 0,
    
          } as Schema & { name: string },
          txt,
        );
        y += h + 0.8;
      }
      y += 2.5;
    }
  }

  /* ---------------- Education ---------------- */
  if (!isHidden(cv, "education") && cv.education.length > 0) {
    sectionTitle("Education");
    for (const ed of cv.education) {
      const titleH = ptToMm(10) * 1.25;
      ensure(titleH + 6);
      push(
        {
          name: uid("edu"),
          type: "text",
          position: { x: MARGIN, y },
          width: CONTENT_W - 45,
          height: titleH + 1,
          fontSize: 10,
          fontColor: ink,
          alignment: "left",
          verticalAlignment: "top",
          lineHeight: 1.25,
          characterSpacing: 0,
  
        } as Schema & { name: string },
        ed.qualification,
      );
      if (ed.period) {
        push(
          {
            name: uid("edup"),
            type: "text",
            position: { x: MARGIN + CONTENT_W - 45, y },
            width: 45,
            height: titleH + 1,
            fontSize: 8.5,
            fontColor: muted,
            alignment: "right",
            verticalAlignment: "top",
            lineHeight: 1.25,
            characterSpacing: 0,
    
          } as Schema & { name: string },
          ed.period,
        );
      }
      y += titleH + 0.5;
      if (ed.institution) {
        addText({
          value: ed.institution,
          fontSize: 9.5,
          color: primary,
          spaceAfter: 3,
        });
      }
    }
  }

  /* ---------------- Skills ---------------- */
  if (!isHidden(cv, "skills") && cv.skills.length > 0) {
    sectionTitle("Skills & Competencies");
    addText({
      value: cv.skills.map((s) => `• ${s}`).join("    "),
      fontSize: 9.5,
      color: sub,
      lineHeight: 1.55,
      spaceAfter: 4,
    });
  }

  /* ---------------- Competencies ---------------- */
  if (!isHidden(cv, "competencies") && cv.competencyClusters?.length) {
    sectionTitle("Core Competencies");
    for (const cl of cv.competencyClusters) {
      addText({ value: cl.title, fontSize: 10, color: ink, bold: true, spaceAfter: 0.5 });
      addText({
        value: (cl.items ?? []).join(" · "),
        fontSize: 9.5,
        color: sub,
        lineHeight: 1.5,
        spaceAfter: 3,
      });
    }
  }

  /* ---------------- Languages ---------------- */
  if (!isHidden(cv, "languages") && cv.languages.length > 0) {
    sectionTitle("Languages");
    addText({
      value: cv.languages
        .map((l) => (l.level?.trim() ? `${l.name} (${l.level.trim()})` : l.name))
        .join("   ·   "),
      fontSize: 9.5,
      color: sub,
      spaceAfter: 2,
    });
  }

  /* ---------------- Build template & generate ---------------- */
  const template: Template = {
    basePdf: {
      width: PAGE_W,
      height: PAGE_H,
      padding: [0, 0, 0, 0],
    },
    schemas: pages,
  };

  const pdf = await generate({
    template,
    inputs: [inputs],
    plugins: { text, image, line },
  });

  const blob = new Blob([pdf as unknown as BlobPart], { type: "application/pdf" });
  saveAs(blob, fileName);
}
