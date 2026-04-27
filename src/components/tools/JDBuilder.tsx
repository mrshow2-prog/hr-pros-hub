import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BUSINESS_SECTORS, GCC_LOCATIONS } from "@/data/tools";
import { downloadPdf, type PdfSection } from "@/lib/brandedPdf";
import { recordToolUsage, saveToolLead } from "@/lib/toolsTracking";
import { FieldLabel, SuggestionBox, ToolInput, ToolSelect, ToolTextarea, UpsellStrip } from "./ToolPrimitives";
import EmailGatedGenerate from "./EmailGatedGenerate";

const TOOL_NAME = "JD Builder";
const levels = ["Entry level (0–2 years)", "Mid level (3–5 years)", "Senior (6–10 years)", "Manager / Team lead", "Director / Head of", "C-suite / VP"];

interface JdResult {
  mohreClassification: string;
  aboutUs: string;
  roleOverview: string;
  keyResponsibilities: string[];
  requiredQualifications: string[];
  preferredQualifications: string[];
  coreCompetencies: string[];
  whatWeOffer: string[];
}

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function bullets(items: string[]): string[] {
  return items.map((s) => (s.trim().startsWith("-") ? s.trim() : `- ${s.trim()}`));
}

function buildSections(jd: JdResult): PdfSection[] {
  const sections: PdfSection[] = [];

  if (jd.mohreClassification && jd.mohreClassification.trim()) {
    sections.push({ title: "MoHRE Classification", body: jd.mohreClassification.trim() });
  }
  sections.push({
    title: "About us",
    body: "[Insert your company description here — 2–3 sentences about who you are and what you stand for.]",
  });
  sections.push({ title: "Role overview", body: jd.roleOverview });
  sections.push({ title: "Key responsibilities", body: bullets(jd.keyResponsibilities) });
  sections.push({ title: "Required qualifications", body: bullets(jd.requiredQualifications) });
  sections.push({ title: "Preferred qualifications", body: bullets(jd.preferredQualifications) });
  sections.push({ title: "Core competencies", body: bullets(jd.coreCompetencies) });
  sections.push({ title: "What we offer", body: bullets(jd.whatWeOffer) });
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

export default function JDBuilder() {
  const [companyName, setCompanyName] = useState("");
  const [title, setTitle] = useState("");
  const [level, setLevel] = useState("");
  const [sector, setSector] = useState("");
  const [location, setLocation] = useState("Dubai, UAE");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [sentTo, setSentTo] = useState("");

  const fieldsValid = !!(companyName.trim() && title.trim() && level && sector);

  const generate = async (userEmail: string) => {
    if (!fieldsValid) {
      setError("Please complete company name, job title, seniority level, and sector.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("generate-jd", {
        body: { companyName, title, level, sector, location, notes },
      });
      if (fnError) {
        const ctx = (fnError as { context?: { error?: string } })?.context;
        setError(ctx?.error || fnError.message || "Couldn't generate the JD. Please try again.");
        setLoading(false);
        return;
      }
      const jd = (data as { jd?: JdResult } | null)?.jd;
      if (!jd) {
        setError("AI returned an unexpected response. Please try again.");
        setLoading(false);
        return;
      }
      const sections = buildSections(jd);
      const documentName = `${title}${companyName ? ` — ${companyName}` : ""}`;
      const outputText = `${title} — ${companyName}\n${level} · ${sector} · ${location}\n\n${sectionsToPlainText(sections)}`;

      // 1. Trigger PDF download for the user
      downloadPdf({
        title,
        subtitle: `${level} · ${sector} · ${location}`,
        documentLabel: "Job Description · AI-generated draft",
        companyName,
        sections,
        footerNote: "Want a full role architecture? People.Studio prepares properly scoped JDs, grading frameworks, and competency profiles for UAE & GCC businesses.",
      }, `${slug(companyName)}-${slug(title)}-job-description.pdf`);

      // 2. Log the lead with the captured email
      void saveToolLead({ toolName: TOOL_NAME, outputText: outputText.slice(0, 200000), userEmail });
      void recordToolUsage(TOOL_NAME);

      // 3. Auto-send a copy to the user's inbox (BCC to admin handled server-side)
      try {
        const { error: emailErr } = await supabase.functions.invoke("send-tool-email", {
          body: {
            toEmail: userEmail,
            documentKind: "Job Description",
            documentName,
            outputText: outputText.slice(0, 200000),
          },
        });
        if (!emailErr) {
          setEmailSent(true);
          setSentTo(userEmail);
        } else {
          console.error("send-tool-email error:", emailErr);
        }
      } catch (err) {
        console.error("send-tool-email threw:", err);
      }

      setReady(true);
    } catch (e) {
      console.error("JD generation failed:", e);
      setError(e instanceof Error ? e.message : "Couldn't generate the JD. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-3xl">
      <h2 className="mb-2 font-serif text-2xl font-normal text-ink">Job description builder</h2>
      <p className="mb-8 max-w-xl font-dm text-sm leading-7 text-ink/55">Generate a UAE-market-calibrated, labor-law-aware job description PDF — drafted by an AI trained on senior HR consulting practice for the UAE & GCC.</p>

      <div className="border border-ink/10 bg-clay/35 p-6">
        <div className="grid gap-5 md:grid-cols-2">
          <div><FieldLabel>Company name</FieldLabel><ToolInput value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="e.g. Acme Trading LLC" /></div>
          <div><FieldLabel>Job title</FieldLabel><ToolInput value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Senior Marketing Manager" /></div>
          <div><FieldLabel>Seniority level</FieldLabel><ToolSelect value={level} onChange={(e) => setLevel(e.target.value)}><option value="">Select level</option>{levels.map((l) => <option key={l}>{l}</option>)}</ToolSelect></div>
          <div><FieldLabel>Industry / sector</FieldLabel><ToolSelect value={sector} onChange={(e) => setSector(e.target.value)}><option value="">Select sector</option>{BUSINESS_SECTORS.map((s) => <option key={s}>{s}</option>)}</ToolSelect></div>
          <div><FieldLabel>Location</FieldLabel><ToolSelect value={location} onChange={(e) => setLocation(e.target.value)}>{GCC_LOCATIONS.map((l) => <option key={l}>{l}</option>)}</ToolSelect></div>
        </div>
        <div className="mt-5"><FieldLabel>Key responsibilities or context</FieldLabel><ToolTextarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. This role leads a team of 4, manages agency relationships, and owns LinkedIn strategy..." /></div>

        <EmailGatedGenerate
          buttonLabel="Build job description"
          loadingLabel="Generating…"
          parentValid={fieldsValid}
          externalError={error}
          loading={loading}
          onSubmit={generate}
        />
      </div>

      {ready && (
        <>
          {emailSent && (
            <div className="mt-6 border border-olive/25 bg-olive/10 px-5 py-4">
              <p className="font-dm text-sm font-medium text-olive">PDF downloaded — copy emailed to your inbox.</p>
              <p className="mt-1 font-dm text-xs leading-6 text-ink/55">
                Sent to <span className="font-medium text-ink/75">{sentTo}</span>.
              </p>
            </div>
          )}
          <UpsellStrip title="Your PDF has downloaded." body="Properly scoped JDs, grading frameworks, and competency profiles can sit inside an Organisation Design engagement." href="/business#services" link="See Organisation Design →" />
        </>
      )}
      <SuggestionBox title="Need something the builder doesn’t cover?" subtitle="Tell me what role output you need — interview questions, competency framework, or assessment criteria." placeholder="e.g. I need interview questions for this role or a competency matrix for my whole team..." />
    </section>
  );
}
