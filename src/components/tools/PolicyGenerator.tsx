import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BUSINESS_SECTORS, POLICY_TYPES } from "@/data/tools";
import { downloadPdf, type PdfSection } from "@/lib/brandedPdf";
import { recordToolUsage } from "@/lib/toolsTracking";
import { FieldLabel, SuggestionBox, ToolInput, ToolSelect, ToolTextarea, UpsellStrip } from "./ToolPrimitives";
import ToolEmailCapture from "./ToolEmailCapture";

const TOOL_NAME = "Policy Generator";
const sizes = ["1–20 employees", "20–60 employees", "60–150 employees", "150+ employees"];
const jurisdictions = ["UAE Mainland", "UAE Free Zone", "KSA", "Qatar", "Kuwait", "Bahrain", "Jordan", "Egypt"];

interface PolicyResult {
  purpose: string;
  scope: string;
  provisions: string[];
  employeeResponsibilities: string[];
  employerResponsibilities: string[];
  hrResponsibilities: string[];
  nonCompliance: string[];
  relatedDocuments: string[];
  policyOwner: string;
  legalReference: string;
  freeZoneNote: string;
}

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function bullets(items: string[]): string[] {
  return items.map((s) => (s.trim().startsWith("-") ? s.trim() : `- ${s.trim()}`));
}

function numbered(items: string[]): string[] {
  return items.map((s, i) => {
    const clean = s.trim().replace(/^\d+[.)]\s*/, "");
    return `${i + 1}. ${clean}`;
  });
}

function buildSections(p: PolicyResult): PdfSection[] {
  const sections: PdfSection[] = [];
  if (p.freeZoneNote && p.freeZoneNote.trim()) {
    sections.push({ title: "Important note", body: p.freeZoneNote.trim() });
  }
  sections.push({ title: "Purpose", body: p.purpose });
  sections.push({ title: "Scope", body: p.scope });
  sections.push({ title: "Policy provisions", body: numbered(p.provisions) });
  sections.push({ title: "Employee responsibilities", body: bullets(p.employeeResponsibilities) });
  sections.push({ title: "Employer responsibilities", body: bullets(p.employerResponsibilities) });
  sections.push({ title: "HR responsibilities", body: bullets(p.hrResponsibilities) });
  sections.push({ title: "Non-compliance consequences", body: bullets(p.nonCompliance) });
  sections.push({ title: "Related documents / policies", body: bullets(p.relatedDocuments) });
  sections.push({
    title: "Policy ownership & legal basis",
    body: [
      `Policy owner: ${p.policyOwner || "HR Department (or its designated representative)"}`,
      `Legal reference: ${p.legalReference || "Federal Decree-Law No. 33 of 2021 and Cabinet Resolution No. 1 of 2022"}`,
      `Review date: **[REVIEW DATE — complete before issuing]**`,
    ],
  });
  return sections;
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
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [generated, setGenerated] = useState<PdfSection[] | null>(null);

  const generatePdf = async () => {
    if (!companyName.trim() || !type || !sector || !size) {
      setError("Please complete company name, policy type, sector, and company size.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("generate-policy", {
        body: { companyName, type, sector, size, jurisdiction, notes },
      });
      if (fnError) {
        const ctx = (fnError as { context?: { error?: string } })?.context;
        setError(ctx?.error || fnError.message || "Couldn't generate the policy. Please try again.");
        setLoading(false);
        return;
      }
      const policy = (data as { policy?: PolicyResult } | null)?.policy;
      if (!policy) {
        setError("AI returned an unexpected response. Please try again.");
        setLoading(false);
        return;
      }
      const sections = buildSections(policy, notes);
      setGenerated(sections);
      downloadPdf({
        title: type,
        subtitle: `A UAE/GCC-grounded HR policy for ${companyName}.`,
        documentLabel: "HR Policy · AI-generated draft",
        companyName,
        sections,
        footerNote: "Want a version tailored to your organisation? People.Studio prepares policies, handbooks, and job descriptions specific to your business, your people, and the UAE & GCC regulatory context — not generic templates.",
      }, `${slug(companyName)}-${slug(type)}.pdf`);
      void recordToolUsage(TOOL_NAME);
      setReady(true);
    } catch (e) {
      console.error("Policy generation failed:", e);
      setError(e instanceof Error ? e.message : "Couldn't generate the policy. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const buildOutputText = () => {
    if (!generated) return "";
    return `${type} — ${companyName}\n${sector} · ${size} · ${jurisdiction}\n\n${sectionsToPlainText(generated)}`;
  };

  return (
    <section className="max-w-3xl">
      <h2 className="mb-2 font-serif text-2xl font-normal text-ink">Policy generator</h2>
      <p className="mb-8 max-w-xl font-dm text-sm leading-7 text-ink/55">Generate a UAE/GCC-grounded HR policy PDF — drafted with the relevant Labour Law articles cited inline.</p>

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
        <button
          onClick={generatePdf}
          disabled={loading}
          className="mt-6 bg-sienna px-7 py-4 font-dm text-xs font-bold uppercase tracking-wider2 text-paper transition-colors hover:bg-umber disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Generating…" : "Generate policy"}
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
