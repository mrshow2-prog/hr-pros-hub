import { useMemo, useState } from "react";
import { BUSINESS_SECTORS, POLICY_TYPES } from "@/data/tools";
import { downloadPdf, type PdfSection } from "@/lib/brandedPdf";
import { recordToolUsage } from "@/lib/toolsTracking";
import { FieldLabel, SuggestionBox, ToolInput, ToolSelect, ToolTextarea, UpsellStrip } from "./ToolPrimitives";
import ToolEmailCapture from "./ToolEmailCapture";

const TOOL_NAME = "Policy Generator";
const sizes = ["1–20 employees", "20–60 employees", "60–150 employees", "150+ employees"];
const jurisdictions = ["UAE Mainland", "UAE Free Zone", "KSA", "Qatar", "Kuwait", "Bahrain", "Jordan", "Egypt"];

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

export default function PolicyGenerator() {
  const [companyName, setCompanyName] = useState("");
  const [type, setType] = useState("");
  const [sector, setSector] = useState("");
  const [size, setSize] = useState("");
  const [jurisdiction, setJurisdiction] = useState("UAE Mainland");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);

  const sections = useMemo<PdfSection[]>(() => [
    {
      title: "Purpose",
      body: `This ${type || "HR policy"} sets a clear, practical standard for how ${type ? type.toLowerCase() : "this area"} is handled at ${companyName || "the company"}. It is designed for a ${size || "growing"} ${sector || "business"} operating in ${jurisdiction}.`,
    },
    {
      title: "Scope",
      body: `This policy applies to all employees, managers, contractors where applicable, and anyone acting on behalf of ${companyName || "the company"}. It should be applied consistently across locations and departments, subject to local legal requirements.`,
    },
    {
      title: "Policy provisions",
      body: [
        "- The company will apply this policy consistently, fairly, and in line with applicable employment law and internal approvals.",
        "- Managers are responsible for explaining expectations before enforcing consequences.",
        "- Employees are responsible for reading, understanding, and following the policy.",
        "- Any exception must be documented and approved by the business owner or authorised manager.",
        "- Records related to this policy must be stored securely in the employee file or HR system.",
      ],
    },
    {
      title: "Manager responsibilities",
      body: [
        "- Apply the policy consistently.",
        "- Keep written records of decisions and approvals.",
        "- Escalate high-risk cases before action is taken.",
        "- Treat employee information confidentially.",
      ],
    },
    {
      title: "Company-specific context",
      body: notes || "No additional company-specific context was provided. Add operational rules, approval levels, timelines, and local legal references before issuing.",
    },
    {
      title: "Implementation notes",
      body: [
        "- Add the policy owner, approval authority, and effective date.",
        "- Attach any forms, templates, or acknowledgement pages.",
        "- Circulate the final version and collect signed employee acknowledgements.",
        "- Review at least annually or when relevant employment law changes.",
      ],
    },
  ], [companyName, jurisdiction, notes, sector, size, type]);

  const generatePdf = () => {
    if (!companyName.trim() || !type || !sector || !size) {
      setError("Please complete company name, policy type, sector, and company size.");
      return;
    }
    setError("");
    downloadPdf({
      title: type,
      subtitle: `A starter HR policy framework for ${companyName}.`,
      documentLabel: "HR Policy · Sample Template",
      companyName,
      sections,
      footerNote: "Want a version tailored to your organisation? People.Studio prepares policies, handbooks, and job descriptions specific to your business, your people, and the UAE & GCC regulatory context — not generic templates.",
    }, `${slug(companyName)}-${slug(type)}.pdf`);
    void recordToolUsage(TOOL_NAME);
    setReady(true);
  };

  const buildOutputText = () =>
    `${type} — ${companyName}\n${sector} · ${size} · ${jurisdiction}\n\n${sectionsToPlainText(sections)}`;

  return (
    <section className="max-w-3xl">
      <h2 className="mb-2 font-serif text-2xl font-normal text-ink">Policy generator</h2>
      <p className="mb-8 max-w-xl font-dm text-sm leading-7 text-ink/55">Generate a branded UAE/GCC-appropriate starter HR policy as a downloadable PDF.</p>

      <div className="border border-ink/10 bg-clay/35 p-6">
        <div className="grid gap-5 md:grid-cols-2">
          <div><FieldLabel>Company name</FieldLabel><ToolInput value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="e.g. Acme Trading LLC" /></div>
          <div><FieldLabel>Policy type</FieldLabel><ToolSelect value={type} onChange={(e) => setType(e.target.value)}><option value="">Select policy</option>{POLICY_TYPES.map((p) => <option key={p}>{p}</option>)}</ToolSelect></div>
          <div><FieldLabel>Company type / sector</FieldLabel><ToolSelect value={sector} onChange={(e) => setSector(e.target.value)}><option value="">Select sector</option>{BUSINESS_SECTORS.map((s) => <option key={s}>{s}</option>)}</ToolSelect></div>
          <div><FieldLabel>Company size</FieldLabel><ToolSelect value={size} onChange={(e) => setSize(e.target.value)}><option value="">Select size</option>{sizes.map((s) => <option key={s}>{s}</option>)}</ToolSelect></div>
          <div><FieldLabel>Jurisdiction</FieldLabel><ToolSelect value={jurisdiction} onChange={(e) => setJurisdiction(e.target.value)}>{jurisdictions.map((j) => <option key={j}>{j}</option>)}</ToolSelect></div>
        </div>
        <div className="mt-5"><FieldLabel>Specific requirements or context</FieldLabel><ToolTextarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. We have office and remote staff. We allow up to 2 days WFH per week..." /></div>
        {error && <p className="mt-4 text-sm font-medium text-risk-red">{error}</p>}
        <button onClick={generatePdf} className="mt-6 bg-sienna px-7 py-4 font-dm text-xs font-bold uppercase tracking-wider2 text-paper transition-colors hover:bg-umber">
          Generate policy
        </button>
      </div>

      {ready && (
        <>
          <ToolEmailCapture
            toolName={TOOL_NAME}
            getOutputText={buildOutputText}
            documentKind="Policy"
            getDocumentName={() => `${type}${companyName ? ` — ${companyName}` : ""}`}
          />
          <UpsellStrip title="Your PDF has downloaded." body="A prepared-for-you version can turn this starter policy into a complete, legally aligned policy suite for your business." href="/business#services" link="See HR Foundation Pack →" />
        </>
      )}
      <SuggestionBox title="Need a policy that isn’t listed?" subtitle="Tell me what policy you need and I’ll add it to the generator — or build it directly." placeholder="e.g. I need a social media policy or company car usage policy..." />
    </section>
  );
}
