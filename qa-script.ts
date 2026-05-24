import fs from "node:fs";

const sampleCV = {
  contact: {
    name: "ABANOUB NABIL",
    jobTitle: "Senior Sales Manager - MICE, Corporate & Government",
    email: "abanoub.nabil18@gmail.com",
    phone: "+971-54377-9099",
    location: "Dubai, United Arab Emirates",
    linkedinUrl: "www.linkedin.com/in/abanoub-nabil-g",
  },
  summary: "Strategic hospitality leader with over 13 years of progressive experience, specializing in revenue growth and market optimization within the MICE and negotiated sales segments. Proven track record of exceeding ambitious targets, achieving 130% of goals in 2024 and 170% in 2025 through expert management of corporate, government, and DMC accounts. Recognized for leadership excellence with a Leader of the Year nomination, demonstrating a high capacity for motivating teams and enhancing account profitability.",
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

// Mock file-saver via module override using bun's require cache
import { mock } from "bun:test";
mock.module("file-saver", () => ({
  saveAs: (blob: any, name: string) => {
    const part = blob.parts?.[0] ?? blob;
    const buf = part instanceof Uint8Array ? part : new Uint8Array(part);
    fs.writeFileSync(`/tmp/${name}`, buf);
    console.log("wrote /tmp/" + name, buf.length);
  },
  default: { saveAs: () => {} },
}));

// @ts-ignore Blob polyfill (collects parts)
globalThis.Blob = class { parts: any[]; opts: any; constructor(parts: any[], opts: any) { this.parts = parts; this.opts = opts; } } as any;

const { exportCvPdfme } = await import("./src/lib/cv/pdfme/exportModernPdfme.ts");

const templates: any[] = ["modern", "classic", "executive", "compact", "skills-first"];
for (const t of templates) {
  await exportCvPdfme(sampleCV as any, null, t, `qa-${t}.pdf`);
}
console.log("done");
