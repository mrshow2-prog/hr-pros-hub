// Stub browser globals before any imports
import { generate } from "@pdfme/generator";
import { text, image, line, rectangle } from "@pdfme/schemas";
import fs from "node:fs";

// Minimal sample CV matching GeneratedCV shape
const sampleCV = {
  contact: {
    name: "ABANOUB NABIL",
    jobTitle: "Senior Sales Manager - MICE, Corporate & Government",
    email: "abanoub.nabil18@gmail.com",
    phone: "+971-54377-9099",
    location: "Dubai, United Arab Emirates",
    linkedinUrl: "www.linkedin.com/in/abanoub-nabil-g",
  },
  summary: "Strategic hospitality leader with over 13 years of progressive experience, specializing in revenue growth and market optimization within the MICE and negotiated sales segments. Proven track record of exceeding ambitious targets, achieving 130% of goals in 2024 and 170% in 2025 through expert management of corporate, government, and DMC accounts. Recognized for leadership excellence with a Leader of the Year nomination.",
  experience: [
    {
      id: "1", role: "Senior Sales Manager", company: "FAIRMONT THE PALM", location: "Dubai, UAE",
      startDate: "Feb 2026", endDate: "Present", period: "",
      bullets: [
        { id: "b1", original: "x", rewrite: "Directed the MICE and Negotiated sales segments, providing strategic oversight to a specialized team managing key corporate and government accounts to maximize revenue and portfolio profitability.", status: "ai" },
        { id: "b2", original: "x", rewrite: "Cultivated a high-performing sales division through targeted coaching and mentorship, ensuring the consistent attainment and surpassing of quarterly revenue benchmarks.", status: "ai" },
        { id: "b3", original: "x", rewrite: "Architected and implemented comprehensive sales strategies meticulously aligned with organizational expansion goals.", status: "ai" },
      ],
    },
    {
      id: "2", role: "Sales Manager - Groups, Corporate & Government (International Market)", company: "FAIRMONT THE PALM", location: "Dubai, UAE",
      startDate: "Oct 2024", endDate: "Jan 2026", period: "",
      bullets: [
        { id: "b4", original: "x", rewrite: "Drove significant international market revenue growth across group, corporate, and government segments, achieving substantial expansion.", status: "ai" },
        { id: "b5", original: "x", rewrite: "Consistently exceeded sales targets and budgets through strategic market analysis and proactive business development.", status: "ai" },
      ],
    },
  ],
  education: [
    { id: "e1", qualification: "Bachelor of Hospitality Management", institution: "Helwan University", period: "2008 - 2012" },
  ],
  skills: [
    "Revenue Forecasting", "CRM Software (Salesforce, SAP)", "Emotional Freedom Techniques Course",
    "ICDL Training", "International Market Research Analysis", "Sales Territory Planning",
    "Contract Negotiation", "Cross-Cultural Business Development", "Cross-Cultural Communication",
    "Relationship Building", "Leadership", "Strategic Account Management",
  ],
  languages: [
    { id: "l1", name: "English", level: "Fluent" },
    { id: "l2", name: "Arabic", level: "Native" },
  ],
  competencyClusters: [],
  hiddenSections: [],
};

// Stub file-saver
process.env.NODE_ENV = "production";
const Module = await import("node:module");
const origResolve = Module.default.createRequire(import.meta.url);

// Patch global to satisfy file-saver
globalThis.Blob = class { constructor(parts, opts) { this.parts = parts; this.opts = opts; } };
globalThis.window = {
  document: { createElement: () => ({ click: () => {}, setAttribute: () => {} }) },
  URL: { createObjectURL: () => "blob:x", revokeObjectURL: () => {} },
};

// We need to override the finalize to write to disk.
// Easiest path: import the core, monkey-patch generate, then call the builders.
// But cleaner: import the builder module and let it call generate; intercept the
// PDF output by stubbing saveAs.

const fileSaver = await import("file-saver");
let lastPdf = null;
let lastName = null;
fileSaver.saveAs = (blob, name) => {
  // Blob parts contain a Uint8Array
  const part = blob.parts?.[0];
  lastPdf = part instanceof Uint8Array ? part : new Uint8Array(part);
  lastName = name;
};
// Make default export point at our stub too
fileSaver.default = fileSaver;

const { exportCvPdfme } = await import("/dev-server/src/lib/cv/pdfme/exportModernPdfme.ts");

const templates = ["modern", "classic", "executive", "compact", "skills-first"];
for (const t of templates) {
  lastPdf = null;
  await exportCvPdfme(sampleCV, null, t, `qa-${t}.pdf`);
  if (!lastPdf) { console.error("no pdf for", t); continue; }
  const out = `/tmp/qa-${t}.pdf`;
  fs.writeFileSync(out, lastPdf);
  console.log("wrote", out, lastPdf.length);
}
