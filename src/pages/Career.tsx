import { useState, useRef, FormEvent } from "react";
import { AlertTriangle, ArrowUpRight, BriefcaseBusiness, CheckCircle2, Clock3, Compass, Edit3, FileText, Grid2X2, Linkedin, Loader2, Mail, RotateCcw, Star, Target, TrendingUp, Upload, UserRoundCheck } from "lucide-react";
import CvDropzone from "@/components/career/CvDropzone";
import StartingPointMatcher from "@/components/career/StartingPointMatcher";
import JSZip from "jszip";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.mjs?url";
import PsLogo from "@/components/ui/PsLogo";
import SiteFooter from "@/components/ui/SiteFooter";
import WebCvShowcase from "@/components/career/WebCvShowcase";
import SEO, { PERSON_SCHEMA } from "@/components/seo/SEO";
import { BOOKING_HREF, COMPANY_EMAIL } from "@/lib/contact";
import { supabase } from "@/integrations/supabase/client";
import { T, pick, useLang } from "@/i18n/T";
import LanguageToggle from "@/components/ui/LanguageToggle";

type Bi = { en: string; ar: string };

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const marqueeItems: Bi[] = [
  { en: "CV Design", ar: "تصميم السيرة الذاتية" },
  { en: "LinkedIn Optimisation", ar: "تحسين لينكدإن" },
  { en: "Interview Coaching", ar: "تدريب المقابلات" },
  { en: "Personal Branding", ar: "العلامة الشخصية" },
  { en: "Salary Negotiation", ar: "التفاوض على الراتب" },
  { en: "Career Pivot", ar: "التحوّل المهني" },
  { en: "UAE Market Entry", ar: "دخول سوق الإمارات" },
  { en: "Outplacement Support", ar: "دعم إعادة التوظيف" },
  { en: "Executive Presence", ar: "الحضور التنفيذي" },
];

const TESTIMONIALS: { quote: string; name: string; role: string | null; service: string; source: string }[] = [
  {
    quote: "Bishoy did an exceptional job on my CV. He has a keen eye for detail and a great understanding of how to present skills and experience effectively. His ability to tailor the CV to specific job applications was impressive. The end result is a professional and compelling document that truly represents my qualifications.",
    name: "Mohamed Salah",
    role: null,
    service: "CV Writing",
    source: "LinkedIn · July 2024",
  },
  {
    quote: "I highly recommend working with Bishoy. He has extensive expertise in crafting professional CVs and a real ability to generate ideas that make a profile stand out. An invaluable resource for anyone looking to enhance their professional profile.",
    name: "Abanoub Nabil",
    role: "Senior Sales Manager · Fairmont Hotels & Resorts",
    service: "Resume Review",
    source: "LinkedIn · July 2024",
  },
];

const audience: { icon: typeof TrendingUp; title: Bi; desc: Bi; badge: Bi; q1: number; reveal: Bi }[] = [
  { icon: TrendingUp, title: { en: "Career-driven professionals", ar: "محترفون طموحون" }, desc: { en: "You're capable and you know it. But your CV lists what you did, not what you made possible.", ar: "أنت قادر وتعرف ذلك. لكن سيرتك الذاتية تسرد ما فعلته، لا ما جعلته ممكناً." }, badge: { en: "CV · LinkedIn · Interview coaching", ar: "السيرة الذاتية · لينكدإن · تدريب المقابلات" }, q1: 0, reveal: { en: "Sound familiar? You're applying to roles you're qualified for and hearing nothing back.", ar: "هل يبدو مألوفاً؟ أنت تتقدم لوظائف أنت مؤهل لها ولا تسمع رداً." } },
  { icon: Clock3, title: { en: "New arrivals to the UAE", ar: "القادمون الجدد إلى الإمارات" }, desc: { en: "Your CV was built for another market. Your LinkedIn needs to speak to GCC recruiters and hiring managers.", ar: "سيرتك الذاتية مُعدّة لسوق آخر. ولينكدإن يجب أن يخاطب موظفي التوظيف ومديري التوظيف في الخليج." }, badge: { en: "UAE market entry coaching", ar: "تدريب دخول سوق الإمارات" }, q1: 0, reveal: { en: "Sound familiar? You have the experience — but the UAE market doesn't know how to read it yet.", ar: "هل يبدو مألوفاً؟ لديك الخبرة — لكن سوق الإمارات لا يعرف كيف يقرأها بعد." } },
  { icon: Compass, title: { en: "Professionals in transition", ar: "محترفون في مرحلة انتقالية" }, desc: { en: "Redundancy, career pivot, senior step-up. You need a clear narrative and the confidence to own it.", ar: "تسريح، تحوّل مهني، ارتقاء قيادي. تحتاج إلى سردية واضحة وثقة لامتلاكها." }, badge: { en: "Career pivot · Outplacement", ar: "تحوّل مهني · إعادة توظيف" }, q1: 2, reveal: { en: "Sound familiar? You know what you're worth. The next step is making sure the market agrees.", ar: "هل يبدو مألوفاً؟ تعرف قيمتك. الخطوة التالية أن يوافق السوق." } },
  { icon: UserRoundCheck, title: { en: "UAE nationals entering private sector", ar: "المواطنون الإماراتيون المنتقلون للقطاع الخاص" }, desc: { en: "Translate public-sector experience into private-sector credibility, language, and value.", ar: "ترجمة خبرة القطاع الحكومي إلى مصداقية ولغة وقيمة في القطاع الخاص." }, badge: { en: "Emiratisation career coaching", ar: "تدريب مهني للتوطين" }, q1: 3, reveal: { en: "Sound familiar? Your background is strong. The language of the private sector just needs unlocking.", ar: "هل يبدو مألوفاً؟ خلفيتك قوية. لغة القطاع الخاص تحتاج فقط إلى فك شفرتها." } },
  { icon: Target, title: { en: "Executives and senior leaders", ar: "التنفيذيون والقادة" }, desc: { en: "Personal branding and thought leadership positioning — not just a CV refresh.", ar: "علامة شخصية وتموضع قيادي فكري — لا مجرد تحديث للسيرة الذاتية." }, badge: { en: "Personal brand strategy", ar: "استراتيجية العلامة الشخصية" }, q1: 0, reveal: { en: "Sound familiar? At your level, the next move isn't found on a job board — it's built.", ar: "هل يبدو مألوفاً؟ في مستواك، الخطوة التالية لا تُوجد في موقع وظائف — بل تُبنى." } },
  { icon: Grid2X2, title: { en: "HR professionals themselves", ar: "محترفو الموارد البشرية أنفسهم" }, desc: { en: "You help others advance. Now you need the same sharp thinking applied to your own career.", ar: "أنت تساعد الآخرين على التقدم. الآن تحتاج التفكير الحاد نفسه لمسارك المهني." }, badge: { en: "Career coaching · Branding", ar: "تدريب مهني · علامة شخصية" }, q1: 0, reveal: { en: "Sound familiar? You've built careers for others. Yours deserves the same rigour.", ar: "هل يبدو مألوفاً؟ بنيت مسارات الآخرين. مسارك يستحق الصرامة ذاتها." } },
];

function AudienceCard({
  icon: Icon,
  title,
  desc,
  badge,
  reveal,
  onCta,
}: {
  icon: typeof TrendingUp;
  title: string;
  desc: string;
  badge: string;
  reveal: string;
  onCta: () => void;
}) {
  return (
    <article
      onClick={onCta}
      className="group relative cursor-pointer bg-career-surface p-7 transition-all duration-200 ease-out hover:z-20 hover:-translate-y-1 hover:bg-career-deep hover:shadow-[0_20px_40px_-12px_hsl(var(--career-deep)/0.6)] hover:ring-1 hover:ring-career-sky/40"
    >
      <div className="mb-5 grid h-10 w-10 place-items-center border border-career-sky/15 bg-career-sky/10 text-career-sky">
        <Icon size={18} />
      </div>
      <h3 className="mb-3 font-dm text-lg font-bold text-paper">{title}</h3>
      <p className="mb-5 text-sm leading-7 text-paper/45">{desc}</p>
      <span className="inline-flex border border-career-sky/20 bg-career-sky/10 px-3 py-1 font-dm text-[10px] font-bold uppercase tracking-wider2 text-career-sky">{badge}</span>

      {/* Hover reveal overlay — absolute so it doesn't push siblings */}
      <div className="pointer-events-none absolute inset-x-0 top-full z-10 origin-top translate-y-0 bg-career-deep px-7 pb-6 pt-3 opacity-0 shadow-[0_20px_40px_-12px_hsl(var(--career-deep)/0.6)] ring-1 ring-career-sky/40 transition-opacity duration-200 ease-out group-hover:pointer-events-auto group-hover:opacity-100">
        <p className="mb-3 text-sm leading-6 text-paper/55">{reveal}</p>
        <span className="inline-flex items-center gap-1.5 font-dm text-xs font-bold uppercase tracking-wider2 text-career-sky">
          <T en="This is for you" ar="هذا مناسب لك" />
          <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
    </article>
  );
}

const services: { cat: Bi; name: Bi; list: Bi[]; roi: Bi }[] = [
  { cat: { en: "Foundation", ar: "الأساس" }, name: { en: "CV design & rewrite", ar: "تصميم وإعادة كتابة السيرة الذاتية" }, list: [{ en: "Full rewrite from scratch", ar: "إعادة كتابة كاملة من الصفر" }, { en: "UAE/GCC market calibration", ar: "معايرة لسوق الإمارات والخليج" }, { en: "ATS-optimised and recruiter-ready", ar: "محسّنة لأنظمة ATS وجاهزة للموظفين" }, { en: "Up to 2 revision rounds", ar: "حتى جولتي مراجعة" }], roi: { en: "Compresses 4 months of job searching into 6 weeks. On AED 20,000/month, that's a 13× return in year 1.", ar: "تختصر 4 أشهر من البحث عن عمل إلى 6 أسابيع. على راتب 20,000 درهم/شهر، هذا عائد 13× في السنة الأولى." } },
  { cat: { en: "Visibility", ar: "الظهور" }, name: { en: "LinkedIn profile optimisation", ar: "تحسين ملف لينكدإن" }, list: [{ en: "Full profile audit and rewrite", ar: "تدقيق وإعادة كتابة كاملة للملف" }, { en: "Headline and summary repositioning", ar: "إعادة تموضع العنوان والملخص" }, { en: "GCC recruiter keyword strategy", ar: "استراتيجية كلمات مفتاحية لموظفي توظيف الخليج" }, { en: "Content and engagement guidance", ar: "إرشاد المحتوى والتفاعل" }], roi: { en: "A fully optimised profile gets 5–11× more recruiter messages. One inbound role paying 10% more = AED 24,000/yr.", ar: "ملف مُحسَّن بالكامل يحصل على 5–11× مزيد من رسائل الموظفين. وظيفة واحدة بزيادة 10% = 24,000 درهم/سنة." } },
  { cat: { en: "High impact", ar: "تأثير عالٍ" }, name: { en: "Interview coaching", ar: "تدريب المقابلات" }, list: [{ en: "Role-specific interview simulation", ar: "محاكاة مقابلة لدور محدد" }, { en: "Competency question preparation", ar: "تحضير أسئلة الكفاءات" }, { en: "Salary and offer negotiation", ar: "التفاوض على الراتب والعرض" }, { en: "Written feedback after session", ar: "تغذية راجعة مكتوبة بعد الجلسة" }], roi: { en: "Avoiding two failed interview cycles saves 2–3 months of delayed income — typically AED 40,000+ at mid-level.", ar: "تجنب دورتي مقابلات فاشلتين يوفر 2–3 أشهر من الدخل المؤجل — عادة 40,000+ درهم في المستوى المتوسط." } },
  { cat: { en: "Strategic", ar: "استراتيجي" }, name: { en: "Personal brand strategy", ar: "استراتيجية العلامة الشخصية" }, list: [{ en: "Brand audit and positioning", ar: "تدقيق وتموضع العلامة" }, { en: "Professional narrative development", ar: "تطوير السردية المهنية" }, { en: "LinkedIn content strategy", ar: "استراتيجية محتوى لينكدإن" }, { en: "Executive bio and speaker profile", ar: "سيرة تنفيذية وملف متحدث" }], roi: { en: "At senior level, the next move isn't found on a job board. It's built. Brand investment here returns in the quality of the opportunity, not just the salary.", ar: "في المستوى القيادي، الخطوة التالية لا توجد في موقع وظائف. بل تُبنى. الاستثمار في العلامة هنا يعود في جودة الفرصة، لا الراتب فقط." } },
  { cat: { en: "Transition support", ar: "دعم الانتقال" }, name: { en: "Career pivot consulting", ar: "استشارة التحوّل المهني" }, list: [{ en: "Transferable value mapping", ar: "تحديد القيمة القابلة للنقل" }, { en: "Target role and sector analysis", ar: "تحليل الدور والقطاع المستهدف" }, { en: "CV and LinkedIn repositioning", ar: "إعادة تموضع السيرة ولينكدإن" }, { en: "90-day job search action plan", ar: "خطة عمل 90 يوماً للبحث عن عمل" }], roi: { en: "A successful sector pivot typically delivers 20–35% salary uplift. On AED 20,000/month, that's AED 4,000–7,000 more — every month.", ar: "تحوّل قطاعي ناجح يحقق عادة زيادة راتب 20–35%. على 20,000 درهم/شهر، هذا 4,000–7,000 درهم إضافية — كل شهر." } },
  { cat: { en: "Unique to us", ar: "حصري لنا" }, name: { en: "Salary negotiation coaching", ar: "تدريب التفاوض على الراتب" }, list: [{ en: "Market rate benchmarking", ar: "قياس معدلات السوق" }, { en: "Negotiation script and strategy", ar: "نص واستراتيجية التفاوض" }, { en: "Offer evaluation framework", ar: "إطار تقييم العرض" }, { en: "Counter-offer coaching", ar: "تدريب على العرض المضاد" }], roi: { en: "Professionals who negotiate earn 18.83% more on average. On AED 25,000/month, that's AED 45,000/year — every year.", ar: "المحترفون الذين يتفاوضون يكسبون 18.83% أكثر في المتوسط. على 25,000 درهم/شهر، هذا 45,000 درهم/سنة — كل سنة." } },
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

const NON_CV_MESSAGE =
  "This doesn't appear to be a CV or resume. Please upload a CV or resume file to use this tool. If you uploaded the wrong file, try again — or use the Policy Generator for HR policy documents.";

// Heuristic: lenient check that the document looks like a CV/resume.
// We score multiple signal categories and require any 2+ to pass. This avoids
// false rejections on real CVs that use unusual name formatting, omit an
// "Education" section, or use non-standard date formats.
const looksLikeCv = (text: string): boolean => {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (cleaned.length < 80) return false;

  const lower = cleaned.toLowerCase();
  let signals = 0;

  // Contact signals (email / phone / linkedin)
  const hasEmail = /[\w.+-]+@[\w.-]+\.[a-z]{2,}/i.test(cleaned);
  const hasPhone = /(\+?\d[\d\s().-]{7,}\d)/.test(cleaned);
  const hasLinkedin = /linkedin\.com\/in\//i.test(cleaned);
  if (hasEmail || hasPhone || hasLinkedin) signals++;

  // Experience / section heading signals
  const sectionTerms = [
    "experience", "employment", "work history", "professional experience",
    "career history", "work experience", "summary", "profile", "objective",
    "skills", "key skills", "achievements", "certifications", "references",
    "languages", "projects",
  ];
  if (sectionTerms.some((t) => lower.includes(t))) signals++;

  // Job title signals
  const jobTitleTerms = [
    "manager", "director", "engineer", "consultant", "analyst", "officer",
    "specialist", "coordinator", "lead", "head of", "executive", "chef",
    "supervisor", "assistant", "associate", "intern", "developer", "designer",
    "architect", "administrator", "accountant", "advisor", "president",
    "vice president", "vp", "ceo", "cfo", "coo", "cto", "founder",
  ];
  if (jobTitleTerms.some((t) => lower.includes(t))) signals++;

  // Date range signals
  const dateRangeRegex =
    /\b(19|20)\d{2}\s*[-–—to]+\s*((19|20)\d{2}|present|current)\b|\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+(19|20)\d{2}\b/i;
  if (dateRangeRegex.test(cleaned)) signals++;

  // Education signals
  const educationTerms = [
    "education", "bachelor", "master", "mba", "phd", "degree", "university",
    "college", "diploma", "bsc", "msc", "b.a.", "m.a.", "high school",
    "secondary school", "graduated",
  ];
  if (educationTerms.some((t) => lower.includes(t))) signals++;

  return signals >= 2;
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
  const lang = useLang();
  const [contact, setContact] = useState({ name: "", email: "", phone: "", linkedin: "", goal: "" });
  const [contactCv, setContactCv] = useState<File | null>(null);
  const [contactStatus, setContactStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [contactError, setContactError] = useState("");
  const contactSent = contactStatus === "sent";
  const contactSending = contactStatus === "sending";
  const [atsEmail, setAtsEmail] = useState("");
  const [atsFile, setAtsFile] = useState<File | null>(null);
  const [atsLoading, setAtsLoading] = useState(false);
  const [atsResult, setAtsResult] = useState<AtsResult | null>(null);
  const [atsError, setAtsError] = useState("");
  const [contactCvError, setContactCvError] = useState("");
  const goalRef = useRef<HTMLTextAreaElement>(null);
  const [matcherTrigger, setMatcherTrigger] = useState<{ q1Index: number; nonce: number } | null>(null);
  const [calcSalary, setCalcSalary] = useState<string>("20000");
  const [calcPct, setCalcPct] = useState<string>("15");
  const calcSalaryNum = Math.max(0, Number(calcSalary) || 0);
  const calcPctNum = Math.max(0, Number(calcPct) || 0);
  const calcMonthly = calcSalaryNum * (calcPctNum / 100);
  const calcAnnual = calcMonthly * 12;
  const calcThreeYr = calcAnnual * 3;
  const calcRoi = calcThreeYr > 0 ? Math.round(calcThreeYr / 2000) : 0;
  const fmt = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 0 });

  const handleAudienceCta = (q1Index: number) => {
    document.getElementById("matcher")?.scrollIntoView({ behavior: "smooth" });
    setMatcherTrigger({ q1Index, nonce: Date.now() });
  };

  const handleServiceClick = (name: string) => {
    setContact((p) => {
      const prefill = `I'd like to learn more about: ${name}.\n\n`;
      const next = p.goal.trim().length === 0 ? prefill : `${prefill}${p.goal}`;
      return { ...p, goal: next };
    });
    setTimeout(() => {
      document.getElementById("contact")?.scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(() => {
        goalRef.current?.focus();
        const len = goalRef.current?.value.length ?? 0;
        goalRef.current?.setSelectionRange(len, len);
      }, 600);
    }, 0);
  };

  const handleContactSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setContactStatus("sending");
    setContactError("");
    try {
      const messageBody = [
        contact.goal,
        contactCv ? `\n\n(CV file selected by sender: ${contactCv.name} — please reply to request it.)` : "",
      ]
        .filter(Boolean)
        .join("");

      const { data, error } = await supabase.functions.invoke("send-contact-enquiry", {
        body: {
          source: "Career",
          name: contact.name,
          email: contact.email,
          phone: contact.phone,
          linkedin: contact.linkedin,
          goal: messageBody,
        },
      });
      if (error || !data?.success) {
        const ctx = (error as { context?: { error?: string } })?.context;
        setContactError(ctx?.error || error?.message || "Couldn't send your enquiry. Please email us directly.");
        setContactStatus("error");
        return;
      }
      setContactStatus("sent");
    } catch (err) {
      console.error("send-contact-enquiry threw:", err);
      setContactError(err instanceof Error ? err.message : "Couldn't send your enquiry. Please email us directly.");
      setContactStatus("error");
    }
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
      if (!looksLikeCv(text)) {
        setAtsError(NON_CV_MESSAGE);
        return;
      }
      setAtsResult(analyseCvText(text, atsFile));
    } catch {
      setAtsError("We couldn't read this file. This usually means it's a designed/image-based CV (Canva, InDesign, etc.) or a scanned document. ATS systems can't read these either — which may already be hurting your job search. Upload a plain Word or PDF export instead.");
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
      <SEO
        title="Career Studio UAE · CV, LinkedIn & Career Coaching — People.Studio"
        description="Career coaching, CV design, LinkedIn optimisation, and personal brand websites for professionals across the UAE and GCC. Written by an HR director who has made thousands of hiring decisions."
        path="/career"
        jsonLd={[PERSON_SCHEMA]}
      />
      <nav className="fixed left-0 right-0 top-0 z-50 border-b border-career-border bg-career-bg/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
          <div className="flex items-center gap-3">
            <PsLogo light size="md" />
            <span className="hidden border-l border-career-border pl-3 font-dm text-[10px] font-bold uppercase tracking-wider2 text-paper/35 sm:inline">Career Studio</span>
          </div>
          <div className="hidden items-center gap-6 md:flex">
            {[
              { label: { en: "Why", ar: "لماذا" }, href: "#about" },
              { label: { en: "Web CV", ar: "السيرة الإلكترونية" }, href: "#web-cv" },
              { label: { en: "Who", ar: "لمن" }, href: "#who" },
              { label: { en: "Services", ar: "الخدمات" }, href: "#services" },
              { label: { en: "ATS Review", ar: "مراجعة ATS" }, href: "#ats-review" },
            ].map(({ label, href }) => (
              <a key={href} href={href} className="font-dm text-xs font-bold uppercase tracking-wider2 text-paper/45 transition-colors hover:text-career-sky">
                {pick(label, lang)}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <LanguageToggle tone="paper" />
            <a href={BOOKING_HREF} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center bg-career-blue px-4 font-dm text-xs font-bold uppercase tracking-wider2 text-paper transition-colors hover:bg-career-deep"><T en="Book a free call" ar="احجز مكالمة مجانية" /></a>
          </div>
        </div>
      </nav>

      <section className="relative flex min-h-screen flex-col justify-end overflow-hidden px-6 pb-16 pt-28 md:px-10 md:pb-20 md:pt-32">
        <div className="absolute inset-0 bg-career-bg" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_74%_24%,hsl(var(--career-sky)/0.28),transparent_30%),radial-gradient(circle_at_18%_82%,hsl(var(--career-blue)/0.26),transparent_34%),linear-gradient(135deg,hsl(var(--career-deep))_0%,hsl(var(--career-bg))_46%,hsl(var(--career-surface))_100%)]" />
        <div className="absolute inset-x-0 top-20 h-[54vh] opacity-80 md:h-[62vh]">
          {/* Decorative CV cards — desktop only */}
          <div className="pointer-events-none absolute inset-0 hidden md:block">
            {/* Card 1 — "The old way" (back, lifeless) */}
            <div
              className="absolute left-[14%] top-[18%] h-[340px] w-[260px] -rotate-6 overflow-hidden rounded-sm opacity-0 animate-[fade-up_0.9s_ease-out_0.4s_both]"
              style={{ backgroundColor: "rgba(232, 227, 219, 0.28)" }}
              aria-hidden="true"
            >
              <div className="absolute inset-x-0 top-0 h-10" style={{ backgroundColor: "rgba(180, 172, 160, 0.15)" }} />
              <div className="absolute inset-x-5 top-[60px] space-y-3">
                {[92, 78, 88, 65, 95, 70, 84, 60, 76].map((w, i) => (
                  <div
                    key={i}
                    className="h-1 rounded-[2px]"
                    style={{ width: `${w}%`, backgroundColor: "rgba(180, 172, 160, 0.2)" }}
                  />
                ))}
              </div>
            </div>

            {/* Card 2 — "The new way" (front, alive) */}
            <div
              className="absolute right-[12%] top-[10%] h-[380px] w-[300px] rotate-2 overflow-hidden rounded-md opacity-0 animate-[fade-up_0.9s_ease-out_0.7s_both]"
              style={{
                backgroundColor: "hsl(var(--career-deep) / 0.6)",
                boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
              }}
              aria-hidden="true"
            >
              <div className="absolute left-6 top-6 h-12 w-12 rounded-full border border-career-sky/30" />
              <div className="absolute left-6 right-6 top-[88px]">
                <div className="h-3 w-[70%] rounded-[2px] bg-paper/35" />
                <div className="mt-3 h-1.5 w-[45%] rounded-[2px] bg-paper/20" />
              </div>
              <svg className="absolute -bottom-2 -right-2 text-career-sky" width="180" height="180" viewBox="0 0 180 180" fill="none">
                <path d="M180 100 A 80 80 0 0 0 100 180" stroke="currentColor" strokeOpacity="0.15" strokeWidth="1" />
                <path d="M180 120 A 60 60 0 0 0 120 180" stroke="currentColor" strokeOpacity="0.12" strokeWidth="1" />
                <path d="M180 140 A 40 40 0 0 0 140 180" stroke="currentColor" strokeOpacity="0.1" strokeWidth="1" />
              </svg>
              <div className="absolute bottom-6 left-6 flex gap-3">
                <div className="h-10 w-[60px] rounded-sm bg-paper/[0.08]" />
                <div className="h-10 w-[60px] rounded-sm bg-paper/[0.08]" />
              </div>
            </div>
          </div>
          <div className="absolute inset-0 [background-image:linear-gradient(hsl(var(--paper)/0.11)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--paper)/0.09)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_75%_70%_at_58%_34%,black_24%,transparent_78%)]" />
          <svg className="absolute inset-0 h-full w-full text-career-sky/35" viewBox="0 0 1200 620" fill="none" aria-hidden="true">
            <path d="M94 432 C 235 268, 368 372, 508 232 S 802 114, 1098 242" stroke="currentColor" strokeWidth="1.2" strokeDasharray="7 13" />
            <path d="M188 170 C 322 214, 383 74, 526 126 S 780 324, 1012 136" stroke="currentColor" strokeWidth="0.8" opacity="0.65" />
            <circle cx="512" cy="232" r="5" fill="currentColor" /><circle cx="802" cy="154" r="4" fill="currentColor" /><circle cx="1098" cy="242" r="5" fill="currentColor" />
          </svg>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-career-bg via-career-bg/58 to-career-deep/20" />
        <div className="relative z-10 max-w-5xl">
          <p className="mb-6 flex items-center gap-3 font-dm text-xs font-bold uppercase tracking-widest2 text-career-sky before:block before:h-px before:w-7 before:bg-career-sky"><T en="Career Studio" ar="استوديو المسار المهني" /></p>
          <h1 className="mb-7 max-w-4xl font-serif text-5xl font-normal leading-[0.96] text-paper drop-shadow-2xl md:text-7xl lg:text-8xl"><T en={<>You're good at your job.<br /><span className="italic text-career-sky">The market doesn't know it yet</span><span className="text-career-sky">.</span></>} ar={<>أنت بارع في عملك.<br /><span className="italic text-career-sky">لكن السوق لا يعرف ذلك بعد</span><span className="text-career-sky">.</span></>} /></h1>
          <p className="mb-9 max-w-xl text-base font-light leading-8 text-paper/70 md:text-lg"><T en="Career positioning, CV architecture, and interview preparation for professionals who want to move — and move well." ar="تموضع مهني، وهندسة سيرة ذاتية، وتحضير للمقابلات، للمحترفين الذين يريدون الانتقال — والانتقال بإتقان." /></p>
          <div className="flex flex-wrap gap-3">
            <a href={BOOKING_HREF} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center border border-career-sky/30 px-7 font-dm text-xs font-bold uppercase tracking-wider2 text-career-sky transition-all hover:-translate-y-0.5 hover:bg-career-sky/10"><T en="Book a free discovery call" ar="احجز مكالمة استكشاف مجانية" /></a>
            <a href="#web-cv" className="inline-flex min-h-12 items-center bg-career-blue px-7 font-dm text-xs font-bold uppercase tracking-wider2 text-paper transition-colors hover:bg-career-deep"><T en="Create your personal brand website" ar="أنشئ موقع علامتك الشخصية" /></a>
          </div>
        </div>
        <div className={`relative z-10 mt-14 grid gap-6 md:absolute md:bottom-20 md:mt-0 ${lang === "ar" ? "text-left md:left-10" : "text-right md:right-10"}`}>
          {([
            { num: "16+", label: { en: "Years on the hiring side", ar: "سنوات في جانب التوظيف" }, note: "" },
            { num: "11", label: { en: "MENAT markets", ar: "أسواق منطقة الشرق الأوسط" }, note: "" },
            { num: { en: "Bilingual", ar: "ثنائي اللغة" }, label: { en: "Arabic & English", ar: "العربية والإنجليزية" }, note: "" },
            { num: "18.83%", label: { en: "average salary gain when professionals negotiate", ar: "متوسط الزيادة في الراتب عند التفاوض" }, note: { en: "Harvard Business School 2024–25", ar: "كلية هارفارد للأعمال 2024–25" } },
          ] as { num: string | Bi; label: Bi; note: string | Bi }[]).map((s, i) => <div key={i}><div className="font-serif text-3xl font-bold text-career-sky">{typeof s.num === "string" ? s.num : pick(s.num, lang)}</div><div className="text-paper/40 text-xs">{pick(s.label, lang)}</div>{s.note && <div className="mt-1 text-[10px] text-paper/30">{typeof s.note === "string" ? s.note : pick(s.note, lang)}</div>}</div>)}
        </div>
      </section>

      <div className="overflow-hidden border-y border-career-blue/50 bg-career-blue py-4"><div className="flex w-max animate-marquee whitespace-nowrap">{[...marqueeItems, ...marqueeItems].map((item, i) => <span key={`${item.en}-${i}`} className="px-5 font-dm text-xs font-bold uppercase tracking-widest text-paper/90">{pick(item, lang)} ·</span>)}</div></div>

      <section id="about" className="bg-career-deep px-6 py-20 md:px-10"><div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2"><div><p className="mb-4 font-dm text-xs font-bold uppercase tracking-widest2 text-career-sky"><T en="Why this exists" ar="لماذا وُجد هذا" /></p><h2 className="mb-8 font-serif text-4xl font-bold leading-tight text-paper md:text-5xl"><T en="The best candidate rarely gets the job." ar="نادراً ما يحصل أفضل مرشح على الوظيفة." /></h2><div className="space-y-5 text-base font-light leading-8 text-paper/60"><p><T en={<>After 16 years seeing thousands of hiring decisions made across 11 markets, the pattern is clear: <strong className="font-medium text-paper">the candidate who best communicates their value wins</strong> — not always the most qualified one.</>} ar={<>بعد 16 عاماً من مشاهدة آلاف قرارات التوظيف عبر 11 سوقاً، النمط واضح: <strong className="font-medium text-paper">المرشح الذي يُوصِل قيمته بأفضل شكل يفوز</strong> — وليس دائماً الأكثر تأهيلاً.</>} /></p><p><T en="Most professionals are vastly underselling themselves. A CV that lists responsibilities instead of impact. A LinkedIn profile that reads like a job posting. An interview that covers what they did rather than what they made possible." ar="معظم المحترفين يقدّمون أنفسهم بأقل من قيمتهم بكثير. سيرة ذاتية تسرد المسؤوليات بدل الأثر. ملف لينكدإن يبدو كإعلان وظيفة. مقابلة تغطي ما فعلوه لا ما جعلوه ممكناً." /></p><p><T en="The Career Studio exists to fix that gap — for professionals whose career materials haven't caught up with their actual capability." ar="وُجد استوديو المسار المهني لسد تلك الفجوة — للمحترفين الذين لم تواكب موادهم المهنية قدراتهم الفعلية." /></p></div></div><div className="border border-career-border bg-career-sky/5 p-7"><p className="mb-6 font-dm text-xs font-bold uppercase tracking-widest2 text-career-sky/70"><T en="How it works" ar="كيف يعمل" /></p>{[{ en: "Free 30-min discovery call", ar: "مكالمة استكشاف مجانية 30 دقيقة" }, { en: "Bespoke engagement scoped", ar: "تحديد نطاق ارتباط مخصص" }, { en: "You show up differently", ar: "تظهر بشكل مختلف" }].map((title, i) => <div key={title.en} className="mb-6 flex gap-4 last:mb-0"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-career-sky/25 bg-career-sky/10 font-serif text-sm font-bold text-career-sky">{i + 1}</span><div><h3 className="mb-1 font-dm font-bold text-paper">{pick(title, lang)}</h3><p className="text-sm leading-6 text-paper/45">{i === 0 ? <T en="Tell me where you are and where you want to be. I'll tell you what's actually holding you back." ar="أخبرني أين أنت وأين تريد أن تكون. سأخبرك بما يعيقك فعلاً." /> : i === 1 ? <T en="We agree exactly what we're doing, in what timeframe, with what outcomes." ar="نتفق بدقة على ما سنفعله، وفي أي إطار زمني، وبأي نتائج." /> : <T en="Your materials, your narrative, your confidence — aligned and ready for the next opportunity." ar="موادك، وسرديتك، وثقتك — متوائمة وجاهزة للفرصة التالية." />}</p></div></div>)}<a href={BOOKING_HREF} target="_blank" rel="noopener noreferrer" className="mt-7 inline-flex min-h-12 w-full items-center justify-center bg-career-blue px-6 font-dm text-xs font-bold uppercase tracking-wider2 text-paper transition-colors hover:bg-career-deep"><T en="Book a free discovery call" ar="احجز مكالمة استكشاف مجانية" /></a></div></div></section>

      <WebCvShowcase />

      <section id="who" className="bg-career-surface px-6 py-20 md:px-10"><div className="mx-auto max-w-6xl"><p className="mb-4 font-dm text-xs font-bold uppercase tracking-widest2 text-career-sky"><T en="Who this is for" ar="لمن هذا الموقع" /></p><h2 className="mb-4 font-serif text-4xl font-bold leading-tight text-paper md:text-5xl"><T en="Every professional with more to offer." ar="كل محترف لديه المزيد ليقدمه." /></h2><p className="mb-12 max-w-xl font-light leading-8 text-paper/45"><T en="Six distinct situations. One common thread — your career deserves better representation than it's getting." ar="ست حالات مختلفة. خيط مشترك واحد — مسارك المهني يستحق تمثيلاً أفضل مما يحصل عليه." /></p><div className="grid gap-px border border-career-border bg-career-border md:grid-cols-2 lg:grid-cols-3">{audience.map((a) => <AudienceCard key={a.title.en} icon={a.icon} title={pick(a.title, lang)} desc={pick(a.desc, lang)} badge={pick(a.badge, lang)} reveal={pick(a.reveal, lang)} onCta={() => handleAudienceCta(a.q1)} />)}</div></div></section>

      <section id="testimonials" className="bg-career-deep px-6 py-20 md:px-10">
        <div className="mx-auto max-w-6xl">
          <p className="mb-4 font-dm text-xs font-bold uppercase tracking-widest2 text-career-sky"><T en="What clients say" ar="ما يقوله العملاء" /></p>
          <h2 className="mb-12 font-serif text-4xl font-bold leading-tight text-paper md:text-5xl"><T en="Results speak for themselves." ar="النتائج تتحدث عن نفسها." /></h2>
          <div className="grid gap-6 md:grid-cols-2">
            {TESTIMONIALS.map((t) => (
              <article key={t.name} className="flex h-full flex-col border border-career-border bg-career-surface p-7">
                <div className="mb-5 flex gap-1 text-career-sky" aria-label="5 out of 5 stars">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={16} className="fill-current" />
                  ))}
                </div>
                <blockquote className="mb-6 font-light leading-8 text-paper/75">&ldquo;{t.quote}&rdquo;</blockquote>
                <div className="mt-auto border-t border-career-border pt-5">
                  <div className="font-dm text-sm font-bold text-paper">{t.name}</div>
                  {t.role && <div className="mt-1 text-xs leading-5 text-paper/55">{t.role}</div>}
                  <div className="mt-2 font-dm text-[10px] font-bold uppercase tracking-wider2 text-career-sky/70">{t.service}</div>
                  <div className="mt-1 text-[11px] text-paper/35">{t.source}</div>
                </div>
              </article>
            ))}
          </div>
          <p className="mt-8 text-sm text-paper/45">
            <a href="https://www.linkedin.com/in/bmesiha/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-career-sky"><T en="More recommendations available on LinkedIn →" ar="مزيد من التوصيات متاحة على لينكدإن ←" /></a>
          </p>
        </div>
      </section>

      <section id="roi" className="bg-career-surface px-6 py-20 md:px-10">
        <div className="mx-auto max-w-5xl">
          <p className="mb-4 font-dm text-xs font-bold uppercase tracking-widest2 text-career-sky"><T en="The return on investment" ar="العائد على الاستثمار" /></p>
          <h2 className="mb-8 font-serif text-4xl font-bold leading-tight text-paper md:text-5xl"><T en="You pay once. The return comes every month." ar="تدفع مرة واحدة. والعائد يأتي كل شهر." /></h2>
          <div className="mb-10 grid gap-5 max-w-3xl text-base font-light leading-8 text-paper/60">
            <p><T en="Most professionals leave AED 45,000 on the table every year by not negotiating their starting salary. They accept the first number, say thank you, and spend the next three years wondering if they left money on the table. They did." ar="معظم المحترفين يتركون 45,000 درهم على الطاولة كل عام بعدم التفاوض على راتبهم الابتدائي. يقبلون أول رقم، ويقولون شكراً، ويقضون السنوات الثلاث التالية يتساءلون إن كانوا تركوا مالاً. لقد فعلوا." /></p>
            <p><T en="Your starting salary is the anchor for every future raise, bonus, and pension contribution. A 15% negotiation today means 15% more compounding indefinitely. The investment: AED 2,000. The lifetime cost of not making it: AED 360,000+." ar="راتبك الابتدائي هو المرساة لكل زيادة ومكافأة ومساهمة تقاعدية مستقبلية. تفاوض بنسبة 15% اليوم يعني 15% أكثر تتراكم إلى ما لا نهاية. الاستثمار: 2,000 درهم. التكلفة مدى الحياة لعدم القيام به: 360,000+ درهم." /></p>
          </div>
          <div className="mb-10 grid gap-px overflow-hidden border border-career-border bg-career-border md:grid-cols-3">
            {([
              { stat: "18.83%", label: { en: "average salary increase when professionals negotiate", ar: "متوسط الزيادة في الراتب عند التفاوض" }, source: { en: "Harvard Business School, 2024–25", ar: "كلية هارفارد للأعمال، 2024–25" } },
              { stat: "55%", label: { en: "of professionals accept the first offer without negotiating", ar: "من المحترفين يقبلون أول عرض دون تفاوض" }, source: { en: "Pew Research Center", ar: "مركز بيو للأبحاث" } },
              { stat: "67×", label: { en: "ROI on a coaching session that secures 15% more on a AED 25,000/month offer over 3 years", ar: "العائد على جلسة تدريب تضمن زيادة 15% على عرض 25,000 درهم/شهر خلال 3 سنوات" }, source: { en: "", ar: "" } },
            ] as { stat: string; label: Bi; source: Bi }[]).map((b) => (
              <div key={b.label.en} className="bg-career-deep p-7">
                <div className="mb-3 font-serif text-4xl font-bold text-career-sky">{b.stat}</div>
                <div className="mb-2 text-sm leading-6 text-paper/65">{pick(b.label, lang)}</div>
                {pick(b.source, lang) && <div className="font-dm text-[10px] uppercase tracking-wider2 text-paper/30">{pick(b.source, lang)}</div>}
              </div>
            ))}
          </div>
          <a href={BOOKING_HREF} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center bg-career-blue px-7 font-dm text-xs font-bold uppercase tracking-wider2 text-paper transition-colors hover:bg-career-deep"><T en="Book a free 20-minute call →" ar="احجز مكالمة مجانية 20 دقيقة ←" /></a>
          <p className="mt-4 text-xs text-paper/40"><T en="Free call. No obligation. We'll tell you honestly whether and how we can help." ar="مكالمة مجانية. دون التزام. سنخبرك بصراحة هل وكيف يمكننا المساعدة." /></p>
        </div>
      </section>

      <div id="matcher"><StartingPointMatcher trigger={matcherTrigger} /></div>

      <section id="services" className="bg-career-bg px-6 py-20 md:px-10"><div className="mx-auto max-w-6xl"><p className="mb-4 font-dm text-xs font-bold uppercase tracking-widest2 text-career-sky"><T en="Career services" ar="الخدمات المهنية" /></p><h2 className="mb-4 font-serif text-4xl font-bold leading-tight text-paper md:text-5xl"><T en="What we can build together." ar="ما يمكننا بناؤه معاً." /></h2><p className="mb-12 max-w-xl font-light leading-8 text-paper/45"><T en="Every engagement is scoped individually after a free discovery call. Pricing reflects your situation, not a menu." ar="يُحدّد نطاق كل ارتباط بشكل فردي بعد مكالمة استكشاف مجانية. التسعير يعكس وضعك، وليس قائمة أسعار." /></p><div className="grid gap-px overflow-hidden rounded-lg border border-career-border bg-career-border shadow-[0_20px_60px_-30px_hsl(var(--career-blue)/0.45)] md:grid-cols-2 lg:grid-cols-3">{services.map((s) => <button type="button" onClick={() => handleServiceClick(s.name.en)} key={s.name.en} className="group relative flex h-full flex-col bg-career-bg p-7 text-left transition-all duration-300 hover:-translate-y-1 hover:bg-career-surface hover:ring-1 hover:ring-inset hover:ring-career-sky/40 active:-translate-y-0.5 active:bg-career-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-career-sky cursor-pointer"><p className="relative mb-4 inline-block self-start font-dm text-xs font-bold uppercase tracking-wider2 text-career-sky after:absolute after:bottom-[-4px] after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-career-sky after:transition-transform after:duration-300 group-hover:after:scale-x-100">{pick(s.cat, lang)}</p><h3 className="mb-3 font-dm text-xl font-bold leading-snug text-paper transition-colors duration-300 group-hover:text-career-sky">{pick(s.name, lang)}</h3><ul className="mb-5 space-y-2">{s.list.map((item) => <li key={item.en} className="text-sm leading-6 text-paper/55 transition-colors duration-300 before:mr-2 before:text-career-sky before:content-['—'] group-hover:text-paper/75 group-hover:before:text-blush">{pick(item, lang)}</li>)}</ul><p className="mt-auto mb-4 border-l-2 border-blush/60 pl-3 font-dm text-[11px] leading-5 text-blush/90">{pick(s.roi, lang)}</p><p className="inline-flex items-center gap-2 font-dm text-xs font-bold uppercase tracking-wider2 text-career-sky/70 transition-colors duration-300 group-hover:text-paper"><T en="Start this conversation" ar="ابدأ هذه المحادثة" /> <ArrowUpRight size={14} className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-1.5" /></p></button>)}</div></div></section>
      <section id="ats-review" className="bg-career-surface px-6 py-20 md:px-10"><div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2"><div><p className="mb-4 font-dm text-xs font-bold uppercase tracking-widest2 text-career-sky"><T en="Free ATS review" ar="مراجعة ATS مجانية" /></p><h2 className="mb-5 font-serif text-4xl font-bold leading-tight text-paper md:text-5xl"><T en="Check if your CV can pass the first screen." ar="تحقق إذا كانت سيرتك الذاتية تجتاز الفلترة الأولى." /></h2><p className="font-light leading-8 text-paper/50"><T en="Upload your CV and enter your email to receive an instant ATS readiness score based on structure, searchable text, recruiter contact details, keywords, and measurable impact." ar="ارفع سيرتك الذاتية وأدخل بريدك الإلكتروني لتحصل على درجة جاهزية ATS فورية بناءً على البنية والنص القابل للبحث وتفاصيل الاتصال والكلمات المفتاحية والأثر القابل للقياس." /></p><div className="mt-6 flex gap-3 border-l-2 border-amber-400/70 bg-amber-400/10 px-4 py-3"><AlertTriangle className="mt-0.5 shrink-0 text-amber-300" size={16} /><p className="text-xs leading-6 text-amber-100/85"><span className="font-bold uppercase tracking-wider2 text-amber-200"><T en="Note · " ar="ملاحظة · " /></span><T en="This tool works best with text-based CVs exported directly from Word or Google Docs. CVs designed in Canva, Adobe, or similar tools — or scanned documents — cannot be read by ATS systems and will return inaccurate results. If your CV is designed, we recommend requesting a text version." ar="تعمل هذه الأداة بشكل أفضل مع السير الذاتية النصية المُصدّرة مباشرة من Word أو Google Docs. السير المُصمَّمة في Canva أو Adobe أو أدوات مشابهة — أو المستندات الممسوحة — لا يمكن لأنظمة ATS قراءتها وستعيد نتائج غير دقيقة. إذا كانت سيرتك مُصمَّمة، نوصي بطلب نسخة نصية." /></p></div></div><form onSubmit={handleAtsSubmit} className="relative overflow-hidden border border-career-border bg-career-bg p-6"><div className={atsLoading ? "pointer-events-none opacity-25" : ""}>{!atsResult ? <><label className="mb-2 block font-dm text-xs font-bold uppercase tracking-wider2 text-career-sky"><T en="Email" ar="البريد الإلكتروني" /></label><input required type="email" value={atsEmail} onChange={(e) => setAtsEmail(e.target.value)} className="mb-5 w-full border border-career-border bg-career-surface px-4 py-3 text-sm text-paper outline-none focus:border-career-sky" /><label className="mb-2 block font-dm text-xs font-bold uppercase tracking-wider2 text-career-sky"><T en="CV upload" ar="رفع السيرة الذاتية" /></label><div className="mb-5"><CvDropzone variant="ats" file={atsFile} onFile={setAtsFile} onError={setAtsError} accept=".pdf,.docx" allowedExt={["pdf","docx"]} required /></div>{atsError && <div className="mb-4 flex gap-3 border-l-2 border-amber-400/70 bg-amber-400/10 px-4 py-3"><AlertTriangle className="mt-0.5 shrink-0 text-amber-300" size={16} /><p className="text-xs leading-6 text-amber-100/90"><span className="font-bold uppercase tracking-wider2 text-amber-200"><T en="Couldn't read file · " ar="تعذّر قراءة الملف · " /></span>{atsError.replace("We couldn't read this file. ", "")}</p></div>}<button type="submit" disabled={atsLoading} className="min-h-12 w-full bg-career-blue px-6 font-dm text-xs font-bold uppercase tracking-wider2 text-paper transition-colors hover:bg-career-deep disabled:cursor-not-allowed disabled:opacity-60"><T en="Analyse my CV" ar="حلّل سيرتي الذاتية" /></button></> : <div className="border border-career-sky/25 bg-career-sky/10 p-5"><div className="mb-2 flex items-center gap-2 text-career-sky"><CheckCircle2 size={18} /><span className="font-dm text-xs font-bold uppercase tracking-wider2"><T en="ATS ready score" ar="درجة جاهزية ATS" /></span></div><div className="mb-3 font-serif text-5xl font-bold text-paper">{atsResult.score}%</div><p className="mb-4 text-sm leading-6 text-paper/55"><T en={`Analysed ${atsResult.wordCount} words from ${atsFile?.name}. ${atsResult.score >= 80 ? "Your CV is structurally strong. A positioning review can still sharpen your impact." : "Your CV needs stronger ATS structure, keywords, or measurable achievements before it reaches recruiters."}`} ar={`تم تحليل ${atsResult.wordCount} كلمة من ${atsFile?.name}. ${atsResult.score >= 80 ? "سيرتك الذاتية قوية بنيوياً. مراجعة التموضع يمكن أن تشحذ أثرك." : "تحتاج سيرتك الذاتية بنية ATS أقوى، أو كلمات مفتاحية، أو إنجازات قابلة للقياس قبل أن تصل إلى موظفي التوظيف."}`} /></p><div className="grid gap-4 md:grid-cols-2"><div><p className="mb-2 font-dm text-[10px] font-bold uppercase tracking-wider2 text-career-sky"><T en="Working well" ar="يعمل جيداً" /></p><ul className="space-y-2 text-sm leading-6 text-paper/55">{atsResult.strengths.map((item) => <li key={item}>— {item}</li>)}</ul></div><div><p className="mb-2 font-dm text-[10px] font-bold uppercase tracking-wider2 text-career-sky"><T en="Improve next" ar="حسّن لاحقاً" /></p><ul className="space-y-2 text-sm leading-6 text-paper/55">{atsResult.gaps.map((item) => <li key={item}>— {item}</li>)}</ul></div></div><div className="mt-5 flex flex-wrap gap-3"><a href="#contact" className="inline-flex min-h-11 items-center gap-2 bg-career-blue px-5 font-dm text-xs font-bold uppercase tracking-wider2 text-paper"><T en="Connect for CV update" ar="تواصل لتحديث السيرة" /> <ArrowUpRight size={14} /></a><button type="button" onClick={resetAts} className="inline-flex min-h-11 items-center gap-2 border border-career-sky/30 px-5 font-dm text-xs font-bold uppercase tracking-wider2 text-career-sky"><RotateCcw size={14} /> <T en="Analyse new CV" ar="حلّل سيرة جديدة" /></button></div></div>}</div>{atsLoading && <div className="absolute inset-0 grid place-items-center bg-career-bg/90"><div className="text-center"><Loader2 className="mx-auto mb-4 animate-spin text-career-sky" size={34} /><p className="font-dm text-xs font-bold uppercase tracking-widest2 text-career-sky"><T en="Reading and scoring your CV" ar="قراءة وتقييم سيرتك الذاتية" /></p></div></div>}</form></div></section>

      <section id="maths" className="bg-career-deep px-6 py-20 md:px-10">
        <div className="mx-auto max-w-5xl">
          <p className="mb-4 font-dm text-xs font-bold uppercase tracking-widest2 text-career-sky"><T en="The numbers" ar="الأرقام" /></p>
          <h2 className="mb-10 font-serif text-4xl font-bold leading-tight text-paper md:text-5xl"><T en="Do the maths on your situation." ar="احسب الأرقام على وضعك." /></h2>
          <div className="grid gap-5 md:grid-cols-2 mb-8">
            <div>
              <label className="mb-2 block font-dm text-xs font-bold uppercase tracking-wider2 text-career-sky"><T en="Your current monthly salary (AED)" ar="راتبك الشهري الحالي (درهم)" /></label>
              <input type="number" inputMode="numeric" min={0} value={calcSalary} onChange={(e) => setCalcSalary(e.target.value)} placeholder="e.g. 20,000" className="w-full border border-career-border bg-career-surface px-4 py-3 text-sm text-paper outline-none focus:border-career-sky" />
            </div>
            <div>
              <label className="mb-2 block font-dm text-xs font-bold uppercase tracking-wider2 text-career-sky"><T en="Your target negotiation increase (%)" ar="نسبة الزيادة المستهدفة من التفاوض (%)" /></label>
              <input type="number" inputMode="numeric" min={0} value={calcPct} onChange={(e) => setCalcPct(e.target.value)} placeholder="e.g. 15" className="w-full border border-career-border bg-career-surface px-4 py-3 text-sm text-paper outline-none focus:border-career-sky" />
            </div>
          </div>
          <div className="grid gap-px overflow-hidden border border-career-border bg-career-border md:grid-cols-3 mb-6">
            {[
              { label: { en: "Monthly gain", ar: "المكسب الشهري" }, value: { en: `AED ${fmt(calcMonthly)}/month`, ar: `${fmt(calcMonthly)} درهم/شهر` } },
              { label: { en: "Annual gain", ar: "المكسب السنوي" }, value: { en: `AED ${fmt(calcAnnual)}/year`, ar: `${fmt(calcAnnual)} درهم/سنة` } },
              { label: { en: "3-year compounding value", ar: "القيمة المتراكمة لـ 3 سنوات" }, value: { en: `AED ${fmt(calcThreeYr)} over 3 years`, ar: `${fmt(calcThreeYr)} درهم خلال 3 سنوات` } },
            ].map((r) => (
              <div key={r.label.en} className="bg-career-surface p-6">
                <div className="mb-2 font-dm text-[10px] font-bold uppercase tracking-wider2 text-career-sky">{pick(r.label, lang)}</div>
                <div className="font-serif text-2xl font-bold text-paper">{pick(r.value, lang)}</div>
              </div>
            ))}
          </div>
          <p className="text-sm leading-7 text-paper/60">
            <T en={<>Coaching investment: <span className="text-paper">AED 2,000</span>. Your potential return above: <span className="text-paper">AED {fmt(calcThreeYr)}</span>. That's a <span className="font-bold text-career-sky">{calcRoi}×</span> return.</>} ar={<>استثمار التدريب: <span className="text-paper">2,000 درهم</span>. عائدك المحتمل أعلاه: <span className="text-paper">{fmt(calcThreeYr)} درهم</span>. هذا عائد <span className="font-bold text-career-sky">{calcRoi}×</span>.</>} />
          </p>
        </div>
      </section>

      <section id="contact" className="bg-career-blue px-6 py-20 md:px-10"><div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2"><div><p className="mb-5 font-dm text-xs font-bold uppercase tracking-widest2 text-paper/70"><T en="Contact" ar="تواصل" /></p><h2 className="mb-6 font-serif text-4xl font-bold leading-tight text-paper md:text-5xl"><T en={<>Start the conversation.<br />No pressure.</>} ar={<>ابدأ المحادثة.<br />دون ضغط.</>} /></h2><p className="mb-9 max-w-lg font-light leading-8 text-paper/75"><T en="Tell us where your career is now, what you want next, and whether your CV or LinkedIn is holding you back." ar="أخبرنا أين مسارك المهني الآن، وماذا تريد لاحقاً، وهل سيرتك الذاتية أو لينكدإن يعيقانك." /></p><div className="space-y-5"><a href={`mailto:${COMPANY_EMAIL}`} className="flex items-center gap-3 text-paper hover:underline"><Mail size={16} /> {COMPANY_EMAIL}</a><a href="https://www.linkedin.com/in/bmesiha/" target="_blank" rel="noreferrer" className="flex items-center gap-3 text-paper hover:underline"><Linkedin size={16} /> <T en="Connect on LinkedIn" ar="تواصل على لينكدإن" /></a><p className="flex items-center gap-3 text-paper/75"><BriefcaseBusiness size={16} /> <T en="Dubai · UAE · GCC" ar="دبي · الإمارات · الخليج" /></p></div></div>{!contactSent ? <form onSubmit={handleContactSubmit} className="space-y-4">{[["name", { en: "Your name", ar: "اسمك" }, "text", true], ["email", { en: "Email", ar: "البريد الإلكتروني" }, "email", true], ["phone", { en: "Phone (optional)", ar: "الهاتف (اختياري)" }, "tel", false], ["linkedin", { en: "LinkedIn profile link (optional)", ar: "رابط لينكدإن (اختياري)" }, "url", false]].map(([id, label, type, required]) => <div key={id as string}><label className="mb-2 block font-dm text-xs font-bold uppercase tracking-wider2 text-paper/70">{pick(label as Bi, lang)}</label><input required={required as boolean} type={type as string} value={contact[id as keyof typeof contact]} onChange={(e) => setContact((p) => ({ ...p, [id as string]: e.target.value }))} disabled={contactSending} maxLength={320} className="w-full border border-paper/20 bg-paper/10 px-4 py-3 text-sm text-paper outline-none focus:border-paper/70 disabled:opacity-60" /></div>)}<div><label className="mb-2 block font-dm text-xs font-bold uppercase tracking-wider2 text-paper/70"><T en="Attach CV (optional)" ar="إرفاق سيرة ذاتية (اختياري)" /></label><CvDropzone variant="contact" file={contactCv} onFile={setContactCv} onError={setContactCvError} error={contactCvError} accept=".pdf,.doc,.docx" allowedExt={["pdf","doc","docx"]} footerNote={<T en={<>Note: file uploads aren&rsquo;t attached to the enquiry yet — we&rsquo;ll request your CV in our reply.</>} ar={<>ملاحظة: لا تُرفق الملفات بالاستفسار بعد — سنطلب سيرتك الذاتية في ردنا.</>} />} /></div><div><label htmlFor="contact-goal" className="mb-2 block font-dm text-xs font-bold uppercase tracking-wider2 text-paper/70"><T en="What do you want to change?" ar="ما الذي تريد تغييره؟" /></label><textarea id="contact-goal" ref={goalRef} rows={5} value={contact.goal} onChange={(e) => setContact((p) => ({ ...p, goal: e.target.value }))} disabled={contactSending} maxLength={5000} className="w-full resize-none border border-paper/20 bg-paper/10 px-4 py-3 text-sm text-paper outline-none focus:border-paper/70 disabled:opacity-60" /></div>{contactStatus === "error" && contactError && <p className="font-dm text-sm text-paper bg-ink/40 px-4 py-3">{contactError}</p>}<button type="submit" disabled={contactSending} className="min-h-12 w-full bg-paper px-6 font-dm text-xs font-bold uppercase tracking-wider2 text-career-blue transition-colors hover:bg-career-deep hover:text-paper disabled:cursor-not-allowed disabled:opacity-60">{contactSending ? <T en="Sending…" ar="جارٍ الإرسال…" /> : <T en="Send enquiry" ar="إرسال الاستفسار" />}</button></form> : <div className="flex items-center"><div><div className="mb-3 font-serif text-2xl font-bold text-paper"><T en="Message sent." ar="تم إرسال الرسالة." /></div><p className="font-light text-paper/75"><T en={`Thanks ${contact.name || "—"}. We'll reply to ${contact.email} within one business day.`} ar={`شكراً ${contact.name || "—"}. سنرد على ${contact.email} خلال يوم عمل واحد.`} /></p></div></div>}</div></section>

      <div className="bg-career-bg px-6 pt-8 md:px-10"><PsLogo light size="sm" /></div>
      <SiteFooter variant="dark" className="bg-career-bg" />
    </main>
  );
}
