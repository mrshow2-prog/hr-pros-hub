import type { GeneratedCV, SectionKey } from "@/contexts/CVBuilderContext";

export type CompactMode = "preview" | "pdf" | "docx";

const esc = (s: string) =>
  (s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const hidden = (cv: GeneratedCV, k: SectionKey) =>
  (cv.hiddenSections || []).includes(k);

const period = (e: { startDate?: string; endDate?: string; period?: string }) =>
  [e.startDate, e.endDate].filter(Boolean).join(" – ") || e.period || "";

const cleanBulletText = (value: string | null | undefined) =>
  (value ?? "")
    .replace(/\r?\n+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/^[-–—•▪·*]+\s*/, "")
    .trim();

const visibleBullets = (e: GeneratedCV["experience"][number]) =>
  e.bullets
    .map((b) => ({
      ...b,
      rewrite: cleanBulletText(b.rewrite),
      original: cleanBulletText(b.original),
    }))
    .filter((b) => b.status !== "reverted" && (b.rewrite || b.original));

/* ─── Heuristic: how many experiences fit beside the sidebar ───
 * Sidebar ≈ skills * 18pt + 28 (header) + languages * 28pt + 28 (header) + ~30 padding.
 * Each experience block ≈ 70pt + bullets * 16pt.
 * Summary ≈ 30 + ceil(chars/85) * 14pt.
 */
function splitForPage1(cv: GeneratedCV) {
  const sidebarH =
    (hidden(cv, "skills") ? 0 : cv.skills.length * 18 + 30) +
    (hidden(cv, "languages") ? 0 : cv.languages.length * 28 + 30);

  const summaryH =
    !hidden(cv, "summary") && cv.summary
      ? 30 + Math.ceil(cv.summary.length / 85) * 14
      : 0;

  let used = summaryH;
  const onPage1: GeneratedCV["experience"] = [];
  const rest: GeneratedCV["experience"] = [];

  if (!hidden(cv, "experience")) {
    for (const e of cv.experience) {
      const h = 70 + visibleBullets(e).length * 16;
      if (used + h <= sidebarH + 60) {
        onPage1.push(e);
        used += h;
      } else {
        rest.push(e);
      }
    }
    // Always keep at least one job alongside the sidebar if any exist
    if (onPage1.length === 0 && rest.length > 0) {
      onPage1.push(rest.shift()!);
    }
  }
  return { onPage1, rest };
}

/* ─── Section renderers ─── */
function renderSummary(cv: GeneratedCV) {
  if (hidden(cv, "summary") || !cv.summary) return "";
  return `
    <div class="cv-section">
      <h2 class="cv-section-header">Summary</h2>
      <p class="cv-summary">${esc(cv.summary)}</p>
    </div>`;
}

function renderExperienceBlock(
  list: GeneratedCV["experience"],
  title = "Work Experience",
) {
  if (!list.length) return "";
  const jobs = list
    .map((e) => {
      const bullets = visibleBullets(e);
      const ul = bullets.length
        ? `<ul class="cv-job-achievements">${bullets
            .map((b) => `<li>${esc(b.rewrite || b.original)}</li>`)
            .join("")}</ul>`
        : "";
      const company = [e.company, e.location].filter(Boolean).join(" · ");
      return `
        <div class="cv-job">
          <div class="cv-job-header">
            <div class="cv-job-title">${esc(e.role || "")}</div>
            <div class="cv-job-date">${esc(period(e))}</div>
          </div>
          ${company ? `<div class="cv-job-company">${esc(company)}</div>` : ""}
          ${ul}
        </div>`;
    })
    .join("");
  return `
    <div class="cv-section">
      <h2 class="cv-section-header">${esc(title)}</h2>
      ${jobs}
    </div>`;
}

function renderEducation(cv: GeneratedCV) {
  if (hidden(cv, "education") || !cv.education.length) return "";
  const items = cv.education
    .map(
      (ed) => `
      <div class="cv-edu-item">
        <div class="cv-edu-header">
          <div class="cv-degree">${esc(ed.qualification)}</div>
          <div class="cv-job-date">${esc(ed.period || "")}</div>
        </div>
        ${ed.institution ? `<div class="cv-school">${esc(ed.institution)}</div>` : ""}
      </div>`,
    )
    .join("");
  return `
    <div class="cv-section">
      <h2 class="cv-section-header">Education</h2>
      ${items}
    </div>`;
}

function renderSkills(cv: GeneratedCV, mode: CompactMode) {
  if (hidden(cv, "skills") || !cv.skills.length) return "";
  const items = cv.skills
    .map((s) =>
      mode === "docx"
        ? `<div class="cv-skill-item"><span class="cv-skill-dot">• </span>${esc(s)}</div>`
        : `<div class="cv-skill-item">${esc(s)}</div>`,
    )
    .join("");
  return `
    <div class="cv-section">
      <h2 class="cv-section-header">Skills</h2>
      <div class="cv-skills-list">${items}</div>
    </div>`;
}

function renderLanguages(cv: GeneratedCV) {
  if (hidden(cv, "languages") || !cv.languages.length) return "";
  const items = cv.languages
    .map(
      (l) => `
      <div class="cv-language-item">
        <span class="cv-language-name">${esc(l.name)}</span>
        <span class="cv-language-level">${esc(l.level || "")}</span>
      </div>`,
    )
    .join("");
  return `
    <div class="cv-section">
      <h2 class="cv-section-header">Languages</h2>
      <div class="cv-languages">${items}</div>
    </div>`;
}

/* ─── Header (PDF/preview uses flex, DOCX uses table) ─── */
function renderHeader(
  cv: GeneratedCV,
  photoDataUrl: string | null,
  mode: CompactMode,
) {
  if (hidden(cv, "contact")) return "";
  const photo =
    photoDataUrl
      ? `<img src="${esc(photoDataUrl)}" alt="" class="cv-photo" width="90" height="90">`
      : "";
  const contactLines = [
    cv.contact.location,
    cv.contact.phone,
    cv.contact.email,
    cv.contact.linkedinUrl,
  ]
    .filter(Boolean)
    .map((l) => esc(l as string))
    .join("<br>");

  if (mode === "docx") {
    return `
      <table class="cv-header-table" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td class="cv-header-left-cell" valign="top" width="62%">
            <table cellpadding="0" cellspacing="0"><tr>
              ${photo ? `<td valign="middle" style="padding-right:12pt;">${photo}</td>` : ""}
              <td valign="middle">
                <div class="cv-name">${esc(cv.contact.name || "Your name")}</div>
                ${cv.contact.jobTitle ? `<div class="cv-job-title-header">${esc(cv.contact.jobTitle)}</div>` : ""}
              </td>
            </tr></table>
          </td>
          <td class="cv-header-right-cell" valign="middle" align="right" width="38%">
            <div class="cv-header-right">${contactLines}</div>
          </td>
        </tr>
      </table>
      <div class="cv-header-rule"></div>`;
  }

  return `
    <div class="cv-header">
      <div class="cv-header-left">
        ${photo}
        <div>
          <h1 class="cv-name">${esc(cv.contact.name || "Your name")}</h1>
          ${cv.contact.jobTitle ? `<div class="cv-job-title-header">${esc(cv.contact.jobTitle)}</div>` : ""}
        </div>
      </div>
      <div class="cv-header-right">${contactLines}</div>
    </div>`;
}

/* ─── Stylesheet ─── */
function styles(mode: CompactMode) {
  const sidebarBorder =
    mode === "docx"
      ? "1pt solid #C8C0B8"
      : "1pt solid rgba(26, 23, 20, 0.18)";

  const headerCss =
    mode === "docx"
      ? `
    .cv-header-table { margin-bottom: 9pt; }
    .cv-header-rule { border-bottom: 2pt solid #1A1714; margin-bottom: 12pt; }
    .cv-photo { border-radius: 3pt; }
    .cv-name { font-size: 21pt; font-weight: 700; line-height: 1.1; color: #1A1714; }
    .cv-job-title-header { font-size: 11.5pt; font-weight: 500; color: #9C5643; margin-top: 3pt; }
    .cv-header-right { text-align: right; font-size: 9pt; color: #5C5249; line-height: 1.5; }
    .cv-skill-dot { color: #9C5643; font-weight: bold; }
    `
      : `
    .cv-header {
      display: flex; justify-content: space-between; align-items: flex-start;
      margin-bottom: 12pt; padding-bottom: 9pt;
      border-bottom: 2pt solid #1A1714; break-inside: avoid;
    }
    .cv-header-left { display: flex; gap: 12pt; align-items: center; flex: 1; }
    .cv-photo { width: 68pt; height: 68pt; border-radius: 3pt; object-fit: cover; flex-shrink: 0; }
    .cv-name { font-size: 21pt; font-weight: 700; line-height: 1.1; color: #1A1714; margin-bottom: 3pt; letter-spacing: -0.01em; }
    .cv-job-title-header { font-size: 11.5pt; font-weight: 500; color: #9C5643;
      print-color-adjust: exact; -webkit-print-color-adjust: exact; }
    .cv-header-right { text-align: right; font-size: 9pt; color: #5C5249; line-height: 1.5; }
    .cv-skill-item::before { content: "• "; color: #9C5643; font-weight: bold;
      print-color-adjust: exact; -webkit-print-color-adjust: exact; }
    `;

  return `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    @page { size: A4; margin: 0; }
    body {
      font-family: Calibri, Carlito, Arial, sans-serif;
      font-size: 11pt; line-height: 1.4; color: #1A1714; background: white;
      padding: ${mode === "preview" ? "0 15mm" : "14mm 15mm"};
      print-color-adjust: exact; -webkit-print-color-adjust: exact;
    }
    ${headerCss}

    .page1-table { width: 100%; border-collapse: collapse; table-layout: fixed; }
    .page1-main { width: 62%; vertical-align: top; padding-right: 14pt; }
    .page1-sidebar {
      width: 38%; vertical-align: top; padding-left: 14pt;
      border-left: ${sidebarBorder};
      print-color-adjust: exact; -webkit-print-color-adjust: exact;
    }
    .continuation { width: 100%; margin-top: 4pt; }

    .cv-section { margin-bottom: 13pt; break-inside: avoid; page-break-inside: avoid; }
    .cv-section:last-child { margin-bottom: 0; }
    .cv-section-header {
      font-size: 10.5pt; font-weight: 700; color: #1A1714;
      margin-bottom: 7pt; padding-bottom: 3pt;
      text-transform: uppercase; letter-spacing: 0.1em;
      border-bottom: 1pt solid #9C5643;
      print-color-adjust: exact; -webkit-print-color-adjust: exact;
    }

    .cv-summary { font-size: 9.5pt; line-height: 1.55; color: #1A1714; }

    .cv-job { margin-bottom: 11pt; break-inside: avoid; page-break-inside: avoid; }
    .cv-job:last-child { margin-bottom: 0; }
    .cv-job-header {
      ${mode === "docx" ? "" : "display: flex; justify-content: space-between; align-items: baseline; gap: 8pt;"}
      margin-bottom: 1pt;
    }
    .cv-job-title { font-size: 10.5pt; font-weight: 700; color: #1A1714; line-height: 1.3; }
    .cv-job-date { font-size: 8.5pt; color: #5C5249; white-space: nowrap; ${mode === "docx" ? "float: right;" : "flex-shrink: 0;"} }
    .cv-job-company {
      font-size: 9.5pt; font-weight: 600; color: #9C5643; margin-bottom: 3pt;
      print-color-adjust: exact; -webkit-print-color-adjust: exact;
    }
    .cv-job-achievements { list-style: disc; margin-left: 13pt; padding-left: 0; }
    .cv-job-achievements li { font-size: 9pt; line-height: 1.45; color: #1A1714; margin-bottom: 2pt; }

    .cv-edu-item { margin-bottom: 9pt; break-inside: avoid; page-break-inside: avoid; }
    .cv-edu-item:last-child { margin-bottom: 0; }
    .cv-edu-header {
      ${mode === "docx" ? "" : "display: flex; justify-content: space-between; align-items: baseline; gap: 8pt;"}
      margin-bottom: 1pt;
    }
    .cv-degree { font-size: 10pt; font-weight: 700; color: #1A1714; line-height: 1.3; }
    .cv-school {
      font-size: 9.5pt; font-weight: 600; color: #9C5643; margin-bottom: 2pt;
      print-color-adjust: exact; -webkit-print-color-adjust: exact;
    }

    .cv-skills-list { ${mode === "docx" ? "" : "display: flex; flex-direction: column; gap: 3pt;"} }
    .cv-skill-item { font-size: 9pt; color: #1A1714; padding: 1pt 0; line-height: 1.3; }

    .cv-languages { ${mode === "docx" ? "" : "display: flex; flex-direction: column; gap: 5pt;"} }
    .cv-language-item { font-size: 9pt; color: #1A1714; line-height: 1.3; margin-bottom: 4pt; }
    .cv-language-name { font-weight: 700; color: #1A1714; display: block; }
    .cv-language-level { color: #5C5249; }
  `;
}

/* ─── Main entry ─── */
export function renderCompactHtml(
  cv: GeneratedCV,
  photoDataUrl: string | null,
  mode: CompactMode,
): string {
  const { onPage1, rest } = splitForPage1(cv);

  const leftPage1 =
    renderSummary(cv) + renderExperienceBlock(onPage1, "Work Experience");

  const sidebar = renderSkills(cv, mode) + renderLanguages(cv);

  const continuationParts: string[] = [];
  if (rest.length) {
    continuationParts.push(
      renderExperienceBlock(
        rest,
        onPage1.length ? "Work Experience (continued)" : "Work Experience",
      ),
    );
  }
  continuationParts.push(renderEducation(cv));
  const continuation = continuationParts.filter(Boolean).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${esc(cv.contact.name || "CV")} — CV</title>
<style>${styles(mode)}</style>
</head>
<body>
${renderHeader(cv, photoDataUrl, mode)}
<table class="page1-table"><tr>
  <td class="page1-main">${leftPage1}</td>
  <td class="page1-sidebar">${sidebar}</td>
</tr></table>
<div class="continuation">${continuation}</div>
</body>
</html>`;
}
