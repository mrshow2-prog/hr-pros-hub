import { useState, FormEvent } from "react";
import { ArrowUpRight, BriefcaseBusiness, CheckCircle2, Clock3, Compass, Edit3, FileText, Grid2X2, Linkedin, Loader2, Mail, RotateCcw, Target, TrendingUp, Upload, UserRoundCheck } from "lucide-react";
import JSZip from "jszip";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.mjs?url";
import PsLogo from "@/components/ui/PsLogo";
import sampleWebCvPreview from "@/assets/sample-web-cv-preview.jpg";
import { BOOKING_HREF, COMPANY_EMAIL } from "@/lib/contact";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const marqueeItems = ["CV Design", "LinkedIn Optimisation", "Interview Coaching", "Personal Branding", "Salary Negotiation", "Career Pivot", "UAE Market Entry", "Outplacement Support", "Executive Presence"];

const audience = [
  { icon: TrendingUp, title: "Career-driven professionals", desc: "You're capable and you know it. But your CV lists what you did, not what you made possible.", badge: "CV · LinkedIn · Interview coaching" },
  { icon: Clock3, title: "New arrivals to the UAE", desc: "Your CV was built for another market. Your LinkedIn needs to speak to GCC recruiters and hiring managers.", badge: "UAE market entry coaching" },
  { icon: Compass, title: "Professionals in transition", desc: "Redundancy, career pivot, senior step-up. You need a clear narrative and the confidence to own it.", badge: "Career pivot · Outplacement" },
  { icon: UserRoundCheck, title: "UAE nationals entering private sector", desc: "Translate public-sector experience into private-sector credibility, language, and value.", badge: "Emiratisation career coaching" },
  { icon: Target, title: "Executives and senior leaders", desc: "Personal branding and thought leadership positioning — not just a CV refresh.", badge: "Personal brand strategy" },
  { icon: Grid2X2, title: "HR professionals themselves", desc: "You help others advance. Now you need the same sharp thinking applied to your own career.", badge: "Career coaching · Branding" },
];

const services = [
  ["Foundation", "CV design & rewrite", ["Full rewrite from scratch", "UAE/GCC market calibration", "ATS-optimised and recruiter-ready", "Up to 2 revision rounds"]],
  ["Visibility", "LinkedIn profile optimisation", ["Full profile audit and rewrite", "Headline and summary repositioning", "GCC recruiter keyword strategy", "Content and engagement guidance"]],
  ["High impact", "Interview coaching", ["Role-specific interview simulation", "Competency question preparation", "Salary and offer negotiation", "Written feedback after session"]],
  ["Strategic", "Personal brand strategy", ["Brand audit and positioning", "Professional narrative development", "LinkedIn content strategy", "Executive bio and speaker profile"]],
  ["Transition support", "Career pivot consulting", ["Transferable value mapping", "Target role and sector analysis", "CV and LinkedIn repositioning", "90-day job search action plan"]],
  ["Unique to us", "Salary negotiation coaching", ["Market rate benchmarking", "Negotiation script and strategy", "Offer evaluation framework", "Counter-offer coaching"]],
];

const webCvLevels = [
  ["Essential", "A polished one-page web CV with profile, headline, career highlights, and contact links."],
  ["Signature", "A fully designed professional profile with narrative sections, metrics, timeline, and PDF export."],
  ["Executive", "A personal brand site with thought leadership, media-ready bio, speaking profile, and tailored positioning."],
];

type AtsResult = { score: number; strengths: string[]; gaps: string[]; wordCount: number };

const atsKeywords = ["managed", "led", "developed", "implemented", "improved", "increased", "reduced", "delivered", "strategy", "stakeholder", "budget", "team", "project", "operations", "recruitment", "performance", "analysis", "reporting", "compliance", "training"];

const extractDocxText = async (file: File) => {
  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  const documentXml = await zip.file("word/document.xml")?.async("text");
  if (!documentXml) return "";
  return documentXml.replace(/<w:tab\/>/g, " ").replace(/<w:br\/>/g, "\n").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
};

const extractPdfText = async (file: File) => {
  const pdf = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
  const pages = await Promise.all(Array.from({ length: pdf.numPages }, async (_, index) => {
    const page = await pdf.getPage(index + 1);
    const content = await page.getTextContent();
    return content.items.map((item) => "str" in item ? item.str : "").join(" ");
  }));
  return pages.join(" ");
};

const analyseCvText = (text: string, file: File): AtsResult => {
  const normalised = text.toLowerCase();
  const words = normalised.match(/[a-z0-9+#.-]+/g) || [];
  const uniqueKeywords = atsKeywords.filter((keyword) => normalised.includes(keyword));
  const emailFound = /[\w.+-]+@[\w.-]+\.[a-z]{2,}/i.test(text);
  const phoneFound = /(\+?\d[\d\s().-]{7,}\d)/.test(text);
  const linkedinFound = /linkedin\.com\/in\//i.test(text);
  const metricsCount = (text.match(/\b\d+\s*(%|k|m|million|years?|x|aed|usd|gbp|eur)?\b/gi) || []).length;
  const actionVerbCount = uniqueKeywords.length;
  const coreSections = ["experience", "education", "skills", "summary", "profile"].filter((section) => normalised.includes(section));
  const formatScore = /\.pdf$|\.docx$/i.test(file.name) ? 12 : 4;
  const lengthScore = words.length >= 350 && words.length <= 950 ? 18 : words.length >= 220 && words.length <= 1200 ? 12 : 5;
  const contactScore = [emailFound, phoneFound, linkedinFound].filter(Boolean).length * 5;
  const sectionScore = Math.min(coreSections.length * 7, 28);
  const impactScore = Math.min(metricsCount * 3, 18);
  const keywordScore = Math.min(actionVerbCount * 2, 16);
  const score = Math.max(18, Math.min(96, formatScore + lengthScore + contactScore + sectionScore + impactScore + keywordScore));
  const strengths = [
    emailFound && phoneFound ? "Contact details are easy for recruiters to identify." : "The file could be read and scored successfully.",
    coreSections.length >= 4 ? "Core ATS sections are present and clearly labelled." : "Some recognisable CV structure is present.",
    metricsCount >= 4 ? "The CV includes measurable achievements and numbers." : "The CV includes some keyword-readable content.",
  ].filter(Boolean) as string[];
  const gaps = [
    !linkedinFound && "Add a full LinkedIn profile URL near your contact details.",
    coreSections.length < 4 && "Use standard section headings such as Summary, Experience, Skills, and Education.",
    metricsCount < 4 && "Add more measurable outcomes, percentages, budgets, team sizes, or delivery metrics.",
    actionVerbCount < 8 && "Include more role-relevant action verbs and keywords from target job descriptions.",
    (words.length < 350 || words.length > 950) && "Adjust length so the CV is detailed enough without becoming difficult to scan.",
  ].filter(Boolean) as string[];
  return { score, strengths, gaps, wordCount: words.length };
};

export default function Career() {
  const [contact, setContact] = useState({ name: "", email: "", phone: "", linkedin: "", goal: "" });
  const [contactCv, setContactCv] = useState<File | null>(null);
  const [contactSent, setContactSent] = useState(false);
  const [atsEmail, setAtsEmail] = useState("");
  const [atsFile, setAtsFile] = useState<File | null>(null);
  const [atsLoading, setAtsLoading] = useState(false);
  const [atsResult, setAtsResult] = useState<AtsResult | null>(null);
  const [atsError, setAtsError] = useState("");

  const handleContactSubmit = (e: FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent("Career Studio Enquiry — People Studio");
    const body = encodeURIComponent(`Name: ${contact.name}\nEmail: ${contact.email}\nPhone: ${contact.phone}\nLinkedIn: ${contact.linkedin}\nCV file selected: ${contactCv?.name || "Not attached"}\n\nCareer goal:\n${contact.goal}`);
    window.location.href = `mailto:${COMPANY_EMAIL}?subject=${subject}&body=${body}`;
    setContactSent(true);
  };

  const handleAtsSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!atsEmail || !atsFile) return;
    setAtsLoading(true);
    setAtsError("");
    setAtsResult(null);
    try {
      const ext = atsFile.name.split(".").pop()?.toLowerCase();
      const text = ext === "pdf" ? await extractPdfText(atsFile) : ext === "docx" ? await extractDocxText(atsFile) : "";
      if (text.trim().length < 120) throw new Error("low-text");
      setAtsResult(analyseCvText(text, atsFile));
    } catch {
      setAtsError("We couldn't read enough text from this file. Please upload a text-based PDF or DOCX CV.");
    } finally {
      setAtsLoading(false);
    }
  };

  const resetAts = () => {
    setAtsFile(null);
    setAtsResult(null);
    setAtsError("");
    setAtsLoading(false);
  };

  return (
    <main className="min-h-screen overflow-hidden bg-career-bg font-dm text-paper">
      <nav className="fixed left-0 right-0 top-0 z-50 border-b border-career-border bg-career-bg/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
          <div className="flex items-center gap-3">
            <PsLogo light size="md" />
            <span className="hidden border-l border-career-border pl-3 font-dm text-[10px] font-bold uppercase tracking-wider2 text-paper/35 sm:inline">Career Studio</span>
          </div>
          <div className="hidden items-center gap-6 md:flex">
            {["Who", "Services", "Web CV", "ATS Review"].map((label) => (
              <a key={label} href={`#${label.toLowerCase().replace(" ", "-")}`} className="font-dm text-xs font-bold uppercase tracking-wider2 text-paper/45 transition-colors hover:text-career-sky">
                {label}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <a href={BOOKING_HREF} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center bg-career-blue px-4 font-dm text-xs font-bold uppercase tracking-wider2 text-paper transition-colors hover:bg-career-deep">Book a free call</a>
          </div>
        </div>
      </nav>

      <section className="relative flex min-h-screen flex-col justify-end overflow-hidden px-6 pb-16 pt-28 md:px-10 md:pb-20 md:pt-32">
        <div className="absolute inset-0 bg-career-bg" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_74%_24%,hsl(var(--career-sky)/0.28),transparent_30%),radial-gradient(circle_at_18%_82%,hsl(var(--career-blue)/0.26),transparent_34%),linear-gradient(135deg,hsl(var(--career-deep))_0%,hsl(var(--career-bg))_46%,hsl(var(--career-surface))_100%)]" />
        <div className="absolute inset-x-0 top-20 h-[54vh] opacity-80 md:h-[62vh]">
          <div className="absolute left-[8%] top-[8%] h-52 w-36 rotate-[-10deg] border border-career-sky/20 bg-paper/5 shadow-2xl shadow-career-deep/30 backdrop-blur-sm md:h-72 md:w-52" />
          <div className="absolute right-[10%] top-[4%] h-56 w-44 rotate-[8deg] border border-paper/10 bg-career-sky/10 backdrop-blur-md md:h-80 md:w-64" />
          <div className="absolute left-[38%] top-[18%] h-44 w-72 rotate-[-3deg] border border-paper/10 bg-career-blue/15 backdrop-blur-sm md:h-56 md:w-[28rem]" />
          <div className="absolute inset-0 [background-image:linear-gradient(hsl(var(--paper)/0.11)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--paper)/0.09)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_75%_70%_at_58%_34%,black_24%,transparent_78%)]" />
          <svg className="absolute inset-0 h-full w-full text-career-sky/35" viewBox="0 0 1200 620" fill="none" aria-hidden="true">
            <path d="M94 432 C 235 268, 368 372, 508 232 S 802 114, 1098 242" stroke="currentColor" strokeWidth="1.2" strokeDasharray="7 13" />
            <path d="M188 170 C 322 214, 383 74, 526 126 S 780 324, 1012 136" stroke="currentColor" strokeWidth="0.8" opacity="0.65" />
            <circle cx="512" cy="232" r="5" fill="currentColor" /><circle cx="802" cy="154" r="4" fill="currentColor" /><circle cx="1098" cy="242" r="5" fill="currentColor" />
          </svg>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-career-bg via-career-bg/58 to-career-deep/20" />
        <div className="relative z-10 max-w-5xl">
          <p className="mb-6 flex items-center gap-3 font-dm text-xs font-bold uppercase tracking-widest2 text-career-sky before:block before:h-px before:w-7 before:bg-career-sky">Career Studio · UAE &amp; GCC</p>
          <h1 className="mb-7 max-w-4xl font-serif text-5xl font-normal leading-[0.96] text-paper drop-shadow-2xl md:text-7xl lg:text-8xl">You're good at your job.<br /><span className="italic text-career-sky">The market doesn't know it yet</span><span className="text-career-sky">.</span></h1>
          <p className="mb-9 max-w-xl text-base font-light leading-8 text-paper/70 md:text-lg">Career positioning, CV architecture, and interview preparation for professionals who want to move — and move well.</p>
          <div className="flex flex-wrap gap-3">
            <a href={BOOKING_HREF} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center border border-career-sky/30 px-7 font-dm text-xs font-bold uppercase tracking-wider2 text-career-sky transition-all hover:-translate-y-0.5 hover:bg-career-sky/10">Book a free discovery call</a>
            <a href="#web-cv" className="inline-flex min-h-12 items-center bg-career-blue px-7 font-dm text-xs font-bold uppercase tracking-wider2 text-paper transition-colors hover:bg-career-deep">Create your personal brand website</a>
          </div>
        </div>
        <div className="relative z-10 mt-14 grid gap-6 text-right md:absolute md:bottom-20 md:right-10 md:mt-0">
          {[["16+", "Years on the hiring side"], ["11", "MENAT markets"], ["Arabic", "& English fluent"]].map(([num, label]) => <div key={label}><div className="font-serif text-3xl font-bold text-career-sky">{num}</div><div className="text-xs text-paper/40">{label}</div></div>)}
        </div>
      </section>

      <div className="overflow-hidden border-y border-career-blue/50 bg-career-blue py-4"><div className="flex w-max animate-marquee whitespace-nowrap">{[...marqueeItems, ...marqueeItems].map((item, i) => <span key={`${item}-${i}`} className="px-5 font-dm text-xs font-bold uppercase tracking-widest text-paper/90">{item} ·</span>)}</div></div>

      <section id="about" className="bg-career-deep px-6 py-20 md:px-10"><div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2"><div><p className="mb-4 font-dm text-xs font-bold uppercase tracking-widest2 text-career-sky">Why this exists</p><h2 className="mb-8 font-serif text-4xl font-bold leading-tight text-paper md:text-5xl">The best candidate rarely gets the job.</h2><div className="space-y-5 text-base font-light leading-8 text-paper/60"><p>After 16 years seeing thousands of hiring decisions made across 11 markets, the pattern is clear: <strong className="font-medium text-paper">the candidate who best communicates their value wins</strong> — not always the most qualified one.</p><p>Most professionals are vastly underselling themselves. A CV that lists responsibilities instead of impact. A LinkedIn profile that reads like a job posting. An interview that covers what they did rather than what they made possible.</p><p>The Career Studio exists to fix that gap — for professionals whose career materials haven't caught up with their actual capability.</p></div></div><div className="border border-career-border bg-career-sky/5 p-7"><p className="mb-6 font-dm text-xs font-bold uppercase tracking-widest2 text-career-sky/70">How it works</p>{["Free 30-min discovery call", "Bespoke engagement scoped", "You show up differently"].map((title, i) => <div key={title} className="mb-6 flex gap-4 last:mb-0"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-career-sky/25 bg-career-sky/10 font-serif text-sm font-bold text-career-sky">{i + 1}</span><div><h3 className="mb-1 font-dm font-bold text-paper">{title}</h3><p className="text-sm leading-6 text-paper/45">{i === 0 ? "Tell me where you are and where you want to be. I'll tell you what's actually holding you back." : i === 1 ? "We agree exactly what we're doing, in what timeframe, with what outcomes." : "Your materials, your narrative, your confidence — aligned and ready for the next opportunity."}</p></div></div>)}<a href={BOOKING_HREF} target="_blank" rel="noopener noreferrer" className="mt-7 inline-flex min-h-12 w-full items-center justify-center bg-career-blue px-6 font-dm text-xs font-bold uppercase tracking-wider2 text-paper transition-colors hover:bg-career-deep">Book a free discovery call</a></div></div></section>

      <section id="who" className="bg-career-surface px-6 py-20 md:px-10"><div className="mx-auto max-w-6xl"><p className="mb-4 font-dm text-xs font-bold uppercase tracking-widest2 text-career-sky">Who this is for</p><h2 className="mb-4 font-serif text-4xl font-bold leading-tight text-paper md:text-5xl">Every professional with more to offer.</h2><p className="mb-12 max-w-xl font-light leading-8 text-paper/45">Six distinct situations. One common thread — your career deserves better representation than it's getting.</p><div className="grid border border-career-border bg-career-border md:grid-cols-2 lg:grid-cols-3">{audience.map(({ icon: Icon, title, desc, badge }) => <article key={title} className="bg-career-surface p-7 transition-colors hover:bg-career-deep"><div className="mb-5 grid h-10 w-10 place-items-center border border-career-sky/15 bg-career-sky/10 text-career-sky"><Icon size={18} /></div><h3 className="mb-3 font-dm text-lg font-bold text-paper">{title}</h3><p className="mb-5 text-sm leading-7 text-paper/45">{desc}</p><span className="inline-flex border border-career-sky/20 bg-career-sky/10 px-3 py-1 font-dm text-[10px] font-bold uppercase tracking-wider2 text-career-sky">{badge}</span></article>)}</div></div></section>

      <section id="services" className="bg-career-bg px-6 py-20 md:px-10"><div className="mx-auto max-w-6xl"><p className="mb-4 font-dm text-xs font-bold uppercase tracking-widest2 text-career-sky">Career services</p><h2 className="mb-4 font-serif text-4xl font-bold leading-tight text-paper md:text-5xl">What we can build together.</h2><p className="mb-12 max-w-xl font-light leading-8 text-paper/45">Every engagement is scoped individually after a free discovery call. Pricing reflects your situation, not a menu.</p><div className="grid border border-career-border bg-career-border md:grid-cols-2 lg:grid-cols-3">{services.map(([cat, name, list]) => <article key={name as string} className="bg-career-bg p-7 transition-colors hover:bg-career-surface"><p className="mb-4 font-dm text-xs font-bold uppercase tracking-wider2 text-career-sky">{cat}</p><h3 className="mb-3 font-dm text-xl font-bold leading-snug text-paper">{name}</h3><ul className="mb-5 space-y-2">{(list as string[]).map((item) => <li key={item} className="text-sm leading-6 text-paper/55 before:mr-2 before:text-career-sky before:content-['—']">{item}</li>)}</ul><p className="group inline-flex items-center gap-2 font-dm text-xs font-bold uppercase tracking-wider2 text-career-sky/70">Pricing on call <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-1" /></p></article>)}</div></div></section>

      <section id="web-cv" className="bg-career-deep px-6 py-20 md:px-10"><div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.9fr_1.1fr]"><div><p className="mb-4 font-dm text-xs font-bold uppercase tracking-widest2 text-career-sky">Personal brand web-CV</p><h2 className="mb-5 font-serif text-4xl font-bold leading-tight text-paper md:text-5xl">A CV people can actually experience.</h2><p className="mb-7 font-light leading-8 text-paper/55">For senior professionals, founders, and HR leaders who need more than a document: a polished personal brand page that recruiters, employers, and collaborators can open instantly.</p><a href="/profile" className="inline-flex min-h-12 items-center bg-career-blue px-7 font-dm text-xs font-bold uppercase tracking-wider2 text-paper transition-colors hover:bg-career-bg">View sample CV page</a></div><div className="grid gap-5 md:grid-cols-[0.85fr_1fr]"><a href="/profile" className="block overflow-hidden border border-career-sky/25 bg-paper p-2 transition-transform hover:-translate-y-1"><img src={sampleWebCvPreview} alt="Generated preview of a sample personal brand web-CV page" width={1280} height={960} loading="lazy" className="h-full min-h-[320px] w-full object-cover" /></a><div className="grid gap-3">{webCvLevels.map(([level, desc]) => <article key={level} className="border border-career-border bg-career-sky/5 p-5"><h3 className="mb-2 font-dm text-lg font-bold text-paper">{level}</h3><p className="text-sm leading-6 text-paper/50">{desc}</p></article>)}</div></div></div></section>

      <section id="ats-review" className="bg-career-surface px-6 py-20 md:px-10"><div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2"><div><p className="mb-4 font-dm text-xs font-bold uppercase tracking-widest2 text-career-sky">Free ATS review</p><h2 className="mb-5 font-serif text-4xl font-bold leading-tight text-paper md:text-5xl">Check if your CV can pass the first screen.</h2><p className="font-light leading-8 text-paper/50">Upload your CV and enter your email to receive an instant ATS readiness score based on structure, searchable text, recruiter contact details, keywords, and measurable impact.</p></div><form onSubmit={handleAtsSubmit} className="relative overflow-hidden border border-career-border bg-career-bg p-6"><div className={atsLoading ? "pointer-events-none opacity-25" : ""}>{!atsResult ? <><label className="mb-2 block font-dm text-xs font-bold uppercase tracking-wider2 text-career-sky">Email</label><input required type="email" value={atsEmail} onChange={(e) => setAtsEmail(e.target.value)} className="mb-4 w-full border border-career-border bg-career-surface px-4 py-3 text-sm text-paper outline-none focus:border-career-sky" /><div className="mb-5 flex gap-3 border-l-2 border-amber-400/70 bg-amber-400/10 px-4 py-3"><AlertTriangle className="mt-0.5 shrink-0 text-amber-300" size={16} /><p className="text-xs leading-6 text-amber-100/85"><span className="font-bold uppercase tracking-wider2 text-amber-200">Note · </span>This tool works best with text-based CVs exported directly from Word or Google Docs. CVs designed in Canva, Adobe, or similar tools — or scanned documents — cannot be read by ATS systems and will return inaccurate results. If your CV is designed, we recommend requesting a text version.</p></div><label className="mb-2 block font-dm text-xs font-bold uppercase tracking-wider2 text-career-sky">CV upload</label>{atsFile ? <div className="mb-5 flex min-h-20 items-center justify-between gap-4 border border-career-sky/25 bg-career-sky/10 px-4 py-4"><div className="flex min-w-0 items-center gap-3"><FileText className="shrink-0 text-career-sky" size={20} /><span className="truncate text-sm text-paper/75">{atsFile.name}</span></div><label className="inline-flex shrink-0 cursor-pointer items-center gap-2 font-dm text-[10px] font-bold uppercase tracking-wider2 text-career-sky"><Edit3 size={14} /> Replace<input type="file" accept=".pdf,.docx" onChange={(e) => { setAtsFile(e.target.files?.[0] || null); setAtsError(""); }} className="sr-only" /></label></div> : <label className="mb-5 flex min-h-28 cursor-pointer flex-col items-center justify-center border border-dashed border-career-sky/35 bg-career-sky/5 px-4 py-5 text-center text-paper/55"><Upload className="mb-2 text-career-sky" size={22} /><span className="text-sm">Upload PDF or DOCX</span><input required type="file" accept=".pdf,.docx" onChange={(e) => { setAtsFile(e.target.files?.[0] || null); setAtsError(""); }} className="sr-only" /></label>}{atsError && <div className="mb-4 flex gap-3 border-l-2 border-amber-400/70 bg-amber-400/10 px-4 py-3"><AlertTriangle className="mt-0.5 shrink-0 text-amber-300" size={16} /><p className="text-xs leading-6 text-amber-100/90"><span className="font-bold uppercase tracking-wider2 text-amber-200">Couldn't read file · </span>{atsError.replace("We couldn't read this file. ", "")}</p></div>}<button type="submit" disabled={atsLoading} className="min-h-12 w-full bg-career-blue px-6 font-dm text-xs font-bold uppercase tracking-wider2 text-paper transition-colors hover:bg-career-deep disabled:cursor-not-allowed disabled:opacity-60">Analyse my CV</button></> : <div className="border border-career-sky/25 bg-career-sky/10 p-5"><div className="mb-2 flex items-center gap-2 text-career-sky"><CheckCircle2 size={18} /><span className="font-dm text-xs font-bold uppercase tracking-wider2">ATS ready score</span></div><div className="mb-3 font-serif text-5xl font-bold text-paper">{atsResult.score}%</div><p className="mb-4 text-sm leading-6 text-paper/55">Analysed {atsResult.wordCount} words from {atsFile?.name}. {atsResult.score >= 80 ? "Your CV is structurally strong. A positioning review can still sharpen your impact." : "Your CV needs stronger ATS structure, keywords, or measurable achievements before it reaches recruiters."}</p><div className="grid gap-4 md:grid-cols-2"><div><p className="mb-2 font-dm text-[10px] font-bold uppercase tracking-wider2 text-career-sky">Working well</p><ul className="space-y-2 text-sm leading-6 text-paper/55">{atsResult.strengths.map((item) => <li key={item}>— {item}</li>)}</ul></div><div><p className="mb-2 font-dm text-[10px] font-bold uppercase tracking-wider2 text-career-sky">Improve next</p><ul className="space-y-2 text-sm leading-6 text-paper/55">{atsResult.gaps.map((item) => <li key={item}>— {item}</li>)}</ul></div></div><div className="mt-5 flex flex-wrap gap-3"><a href="#contact" className="inline-flex min-h-11 items-center gap-2 bg-career-blue px-5 font-dm text-xs font-bold uppercase tracking-wider2 text-paper">Connect for CV update <ArrowUpRight size={14} /></a><button type="button" onClick={resetAts} className="inline-flex min-h-11 items-center gap-2 border border-career-sky/30 px-5 font-dm text-xs font-bold uppercase tracking-wider2 text-career-sky"><RotateCcw size={14} /> Analyse new CV</button></div></div>}</div>{atsLoading && <div className="absolute inset-0 grid place-items-center bg-career-bg/90"><div className="text-center"><Loader2 className="mx-auto mb-4 animate-spin text-career-sky" size={34} /><p className="font-dm text-xs font-bold uppercase tracking-widest2 text-career-sky">Reading and scoring your CV</p></div></div>}</form></div></section>

      <section id="contact" className="bg-career-blue px-6 py-20 md:px-10"><div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2"><div><p className="mb-5 font-dm text-xs font-bold uppercase tracking-widest2 text-paper/70">Contact</p><h2 className="mb-6 font-serif text-4xl font-bold leading-tight text-paper md:text-5xl">Start the conversation.<br />No pressure.</h2><p className="mb-9 max-w-lg font-light leading-8 text-paper/75">Tell us where your career is now, what you want next, and whether your CV or LinkedIn is holding you back.</p><div className="space-y-5"><a href={`mailto:${COMPANY_EMAIL}`} className="flex items-center gap-3 text-paper hover:underline"><Mail size={16} /> {COMPANY_EMAIL}</a><a href="https://www.linkedin.com/in/bmesiha/" target="_blank" rel="noreferrer" className="flex items-center gap-3 text-paper hover:underline"><Linkedin size={16} /> Connect on LinkedIn</a><p className="flex items-center gap-3 text-paper/75"><BriefcaseBusiness size={16} /> Dubai · UAE · GCC</p></div></div>{!contactSent ? <form onSubmit={handleContactSubmit} className="space-y-4">{[["name", "Your name", "text", true], ["email", "Email", "email", true], ["phone", "Phone (optional)", "tel", false], ["linkedin", "LinkedIn profile link (optional)", "url", false]].map(([id, label, type, required]) => <div key={id as string}><label className="mb-2 block font-dm text-xs font-bold uppercase tracking-wider2 text-paper/70">{label as string}</label><input required={required as boolean} type={type as string} value={contact[id as keyof typeof contact]} onChange={(e) => setContact((p) => ({ ...p, [id as string]: e.target.value }))} className="w-full border border-paper/20 bg-paper/10 px-4 py-3 text-sm text-paper outline-none focus:border-paper/70" /></div>)}<div><label className="mb-2 block font-dm text-xs font-bold uppercase tracking-wider2 text-paper/70">Attach CV (optional)</label><label className="flex min-h-16 cursor-pointer items-center gap-3 border border-paper/20 bg-paper/10 px-4 py-3 text-sm text-paper/75"><FileText size={18} /> {contactCv ? contactCv.name : "Choose PDF or DOCX"}<input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setContactCv(e.target.files?.[0] || null)} className="sr-only" /></label></div><div><label className="mb-2 block font-dm text-xs font-bold uppercase tracking-wider2 text-paper/70">What do you want to change?</label><textarea rows={5} value={contact.goal} onChange={(e) => setContact((p) => ({ ...p, goal: e.target.value }))} className="w-full resize-none border border-paper/20 bg-paper/10 px-4 py-3 text-sm text-paper outline-none focus:border-paper/70" /></div><button type="submit" className="min-h-12 w-full bg-paper px-6 font-dm text-xs font-bold uppercase tracking-wider2 text-career-blue transition-colors hover:bg-career-deep hover:text-paper">Send enquiry</button></form> : <div className="flex items-center"><div><div className="mb-3 font-serif text-2xl font-bold text-paper">Message started.</div><p className="font-light text-paper/75">Your email client should open. If not, email {COMPANY_EMAIL} directly.</p></div></div>}</div></section>

      <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-career-border bg-career-bg px-6 py-8 md:px-10"><PsLogo light size="sm" /><p className="text-xs text-paper/25">© 2025 People Studio — Bishoy Mesiha Advisory. Dubai, UAE.</p></footer>
    </main>
  );
}
