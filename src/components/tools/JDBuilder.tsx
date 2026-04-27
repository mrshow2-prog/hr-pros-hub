import { useMemo, useState } from "react";
import { BUSINESS_SECTORS, GCC_LOCATIONS } from "@/data/tools";
import { downloadPdf, type PdfSection } from "@/lib/brandedPdf";
import { recordToolUsage } from "@/lib/toolsTracking";
import { FieldLabel, SuggestionBox, ToolInput, ToolSelect, ToolTextarea, UpsellStrip } from "./ToolPrimitives";
import ToolEmailCapture from "./ToolEmailCapture";

const TOOL_NAME = "JD Builder";
const levels = ["Entry level (0–2 years)", "Mid level (3–5 years)", "Senior (6–10 years)", "Manager / Team lead", "Director / Head of", "C-suite / VP"];

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function sectionsToPlainText(sections: PdfSection[]): string {
  return sections
    .map((s) => {
      const body = Array.isArray(s.body) ? s.body.join("\n") : s.body;
      return `## ${s.title}\n${body}`;
    })
    .join("\n\n");
}

export default function JDBuilder() {
  const [companyName, setCompanyName] = useState("");
  const [title, setTitle] = useState("");
  const [level, setLevel] = useState("");
  const [sector, setSector] = useState("");
  const [location, setLocation] = useState("Dubai, UAE");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);

  const sections = useMemo<PdfSection[]>(() => [
    {
      title: "Role overview",
      body: `The ${title || "role"} is responsible for delivering clear commercial outcomes at ${companyName || "the company"} in a ${sector || "business"} environment. The role requires practical execution, stakeholder management, and the discipline to turn business priorities into measurable work.`,
    },
    {
      title: "Key responsibilities",
      body: [
        `- Own the core responsibilities of the ${title || "role"} from planning through execution.`,
        "- Translate business goals into clear priorities, timelines, and deliverables.",
        "- Work closely with internal stakeholders to remove blockers and improve execution quality.",
        "- Maintain accurate reporting, documentation, and decision records.",
        "- Identify risks early and recommend practical solutions.",
        "- Build strong working relationships across teams and external partners.",
        "- Improve processes, templates, and ways of working as the business grows.",
      ],
    },
    {
      title: "Required qualifications",
      body: [
        `- Experience appropriate for ${level || "the selected seniority level"}.`,
        "- Strong written and verbal communication skills.",
        `- Practical knowledge of the ${sector || "relevant"} market or a closely related sector.`,
        "- Ability to work in a fast-moving UAE/GCC business environment.",
        "- Strong ownership, judgement, and follow-through.",
      ],
    },
    {
      title: "Core competencies",
      body: ["- Commercial judgement", "- Ownership and accountability", "- Structured problem-solving", "- Stakeholder management", "- Clear communication", "- Execution discipline"],
    },
    {
      title: "Company context",
      body: notes || "Add reporting line, team size, travel expectations, working model, salary range, and role-specific requirements before publishing.",
    },
    {
      title: "What we offer",
      body: ["- Competitive compensation aligned to experience.", "- Clear performance expectations.", "- Direct access to decision-makers.", "- Practical growth opportunities in a focused business environment."],
    },
  ], [companyName, level, notes, sector, title]);

  const generatePdf = () => {
    if (!companyName.trim() || !title.trim() || !level || !sector) {
      setError("Please complete company name, job title, seniority level, and sector.");
      return;
    }
    setError("");
    downloadPdf({
      title,
      subtitle: `${level} · ${sector} · ${location}`,
      documentLabel: "Job Description · Sample Template",
      companyName,
      sections,
      footerNote: "Want a full role architecture? People.Studio prepares properly scoped JDs, grading frameworks, and competency profiles for UAE & GCC businesses.",
    }, `${slug(companyName)}-${slug(title)}-job-description.pdf`);
    void recordToolUsage(TOOL_NAME);
    setReady(true);
  };

  const buildOutputText = () =>
    `${title} — ${companyName}\n${level} · ${sector} · ${location}\n\n${sectionsToPlainText(sections)}`;

  return (
    <section className="max-w-3xl">
      <h2 className="mb-2 font-serif text-2xl font-normal text-ink">Job description builder</h2>
      <p className="mb-8 max-w-xl font-dm text-sm leading-7 text-ink/55">Generate a UAE-market-calibrated, branded job description PDF with responsibilities, requirements, and competencies.</p>

      <div className="border border-ink/10 bg-clay/35 p-6">
        <div className="grid gap-5 md:grid-cols-2">
          <div><FieldLabel>Company name</FieldLabel><ToolInput value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="e.g. Acme Trading LLC" /></div>
          <div><FieldLabel>Job title</FieldLabel><ToolInput value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Senior Marketing Manager" /></div>
          <div><FieldLabel>Seniority level</FieldLabel><ToolSelect value={level} onChange={(e) => setLevel(e.target.value)}><option value="">Select level</option>{levels.map((l) => <option key={l}>{l}</option>)}</ToolSelect></div>
          <div><FieldLabel>Industry / sector</FieldLabel><ToolSelect value={sector} onChange={(e) => setSector(e.target.value)}><option value="">Select sector</option>{BUSINESS_SECTORS.map((s) => <option key={s}>{s}</option>)}</ToolSelect></div>
          <div><FieldLabel>Location</FieldLabel><ToolSelect value={location} onChange={(e) => setLocation(e.target.value)}>{GCC_LOCATIONS.map((l) => <option key={l}>{l}</option>)}</ToolSelect></div>
        </div>
        <div className="mt-5"><FieldLabel>Key responsibilities or context</FieldLabel><ToolTextarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. This role leads a team of 4, manages agency relationships, and owns LinkedIn strategy..." /></div>
        {error && <p className="mt-4 text-sm font-medium text-risk-red">{error}</p>}
        <button onClick={generatePdf} className="mt-6 bg-sienna px-7 py-4 font-dm text-xs font-bold uppercase tracking-wider2 text-paper transition-colors hover:bg-umber">
          Build job description
        </button>
      </div>

      {ready && (
        <>
          <ToolEmailCapture
            toolName={TOOL_NAME}
            getOutputText={buildOutputText}
            documentKind="Job Description"
            getDocumentName={() => `${title}${companyName ? ` — ${companyName}` : ""}`}
          />
          <UpsellStrip title="Your PDF has downloaded." body="Properly scoped JDs, grading frameworks, and competency profiles can sit inside an Organisation Design engagement." href="/business#services" link="See Organisation Design →" />
        </>
      )}
      <SuggestionBox title="Need something the builder doesn’t cover?" subtitle="Tell me what role output you need — interview questions, competency framework, or assessment criteria." placeholder="e.g. I need interview questions for this role or a competency matrix for my whole team..." />
    </section>
  );
}
