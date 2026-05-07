import { useState, useEffect, useRef } from "react";
import { ArrowUpRight, Download, Send, Sparkles, Star, X } from "lucide-react";
import { PHOTO_URL } from "@/data/profile";
import { T, pick, useLang } from "@/i18n/T";

type Bi = { en: string; ar: string };

type Tier = "essential" | "signature" | "executive";

const PACKAGES: { id: Tier; name: string; stars: number; slug: string; desc: string }[] = [
  {
    id: "essential",
    name: "Essential",
    stars: 3,
    slug: "sarah-essential",
    desc: "A polished one-page web CV — profile, career highlights, education, and contact links. Clean, shareable, and instantly readable by any recruiter.",
  },
  {
    id: "signature",
    name: "Signature",
    stars: 4,
    slug: "sarah-signature",
    desc: "A fully designed professional profile — narrative bio, key metrics, career timeline, skill strengths, and PDF export. Your story, properly told.",
  },
  {
    id: "executive",
    name: "Executive",
    stars: 5,
    slug: "sarah-executive",
    desc: "A personal brand site — thought leadership positioning, media-ready bio, speaking profile, press mentions, and a tailored visual identity.",
  },
];

/* ─────────────── ESSENTIAL CV ─────────────── */
function EssentialCv() {
  return (
    <div className="h-full w-full bg-[#FAFAF8] font-dm text-ink">
      <div className="grid grid-cols-[1fr_92px] items-start gap-6 border-b-2 border-ink bg-[#E8DFD1] px-14 pb-8 pt-10">
        <div>
          <p className="mb-2.5 font-dm text-[10px] font-medium uppercase tracking-[0.22em] text-ink/55">Senior HR Professional · UAE</p>
          <h2 className="mb-1.5 font-serif text-[48px] font-medium italic leading-[1] tracking-tight text-ink">Sarah Mahmoud</h2>
          <p className="font-dm text-xs font-medium uppercase tracking-[0.16em] text-ink/55">Head of Human Resources</p>
          <div className="mt-4 flex flex-wrap gap-5 font-dm text-xs font-medium text-career-blue">
            <span className="border-b border-career-blue/30 pb-px">sarah@email.com</span>
            <span className="border-b border-career-blue/30 pb-px">linkedin.com/in/smahm</span>
            <span className="border-b border-career-blue/30 pb-px">Dubai, UAE</span>
          </div>
        </div>
        <div className="h-28 w-24 overflow-hidden rounded border-2 border-ink/10">
          <img src={PHOTO_URL} alt="" className="h-full w-full object-cover object-top" />
        </div>
      </div>
      <div className="px-14 py-8">
        <Section label="Profile">
          <p className="font-dm text-[14px] font-light leading-[1.7] text-ink">
            Senior HR professional with 14 years of experience building people functions across the UAE and GCC. Known for translating business strategy into people operations — without the noise.
          </p>
        </Section>
        <Section label="Career Highlights">
          <ul>
            {[
              ["2021 – Now", "Head of HR · Majid Al Futtaim", "Dubai, UAE — Retail & Entertainment"],
              ["2018 – 2021", "HR Business Partner · Chalhoub Group", "Dubai, UAE — Luxury Retail"],
              ["2015 – 2018", "Senior HR Manager · Emaar Properties", "Dubai, UAE — Real Estate"],
              ["2012 – 2015", "HR Generalist · Aldar Properties", "Abu Dhabi, UAE"],
            ].map(([yr, role, co]) => (
              <li key={role} className="flex gap-4 border-b border-ink/[0.07] py-3 text-[13px] last:border-0">
                <span className="min-w-[80px] pt-0.5 font-dm text-[10px] font-medium uppercase tracking-[0.12em] text-ink/55">{yr}</span>
                <div>
                  <span className="block font-medium text-ink">{role}</span>
                  <span className="block text-[12px] font-light text-ink/55">{co}</span>
                </div>
              </li>
            ))}
          </ul>
        </Section>
        <Section label="Education">
          <ul>
            <li className="flex gap-4 py-3 text-[13px]">
              <span className="min-w-[80px] pt-0.5 font-dm text-[10px] font-medium uppercase tracking-[0.12em] text-ink/55">2011</span>
              <div>
                <span className="block font-medium text-ink">MBA, Human Resources</span>
                <span className="block text-[12px] font-light text-ink/55">American University of Sharjah</span>
              </div>
            </li>
          </ul>
        </Section>
      </div>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-7">
      <p className="mb-3 border-b border-ink/[0.12] pb-1.5 font-dm text-[10px] font-medium uppercase tracking-[0.22em] text-career-blue">{label}</p>
      {children}
    </div>
  );
}

/* ─────────────── SIGNATURE CV ─────────────── */
function SignatureCv() {
  return (
    <div className="h-full w-full bg-[#FAFAF8] font-dm text-ink">
      <div className="grid grid-cols-[200px_1fr] bg-career-deep">
        <div className="flex items-end justify-center bg-gradient-to-b from-career-bg to-career-deep pt-5">
          <img src={PHOTO_URL} alt="" className="block h-44 w-36 rounded-t object-cover object-top" />
        </div>
        <div className="flex flex-col justify-center px-10 py-8">
          <p className="mb-2 font-dm text-[10px] font-medium uppercase tracking-[0.22em] text-career-sky">Senior HR Professional · UAE & GCC</p>
          <h2 className="mb-1.5 font-serif text-[40px] font-medium italic leading-[1] tracking-tight text-paper">Sarah Mahmoud</h2>
          <p className="font-dm text-[11px] font-medium uppercase tracking-[0.18em] text-paper/60">Head of Human Resources</p>
        </div>
      </div>
      <div className="grid grid-cols-4 bg-career-blue">
        {[
          ["14", "Years in HR"],
          ["6", "GCC Markets"],
          ["4", "C-suite roles"],
          ["PHRi", "HRCI Certified"],
        ].map(([n, l], i) => (
          <div key={i} className={`px-4 py-4 ${i < 3 ? "border-r border-paper/20" : ""}`}>
            <div className={`font-serif italic leading-none text-paper ${n === "PHRi" ? "pt-1 text-[18px]" : "text-[26px] tracking-tight"}`}>{n}</div>
            <div className="mt-1 font-dm text-[9px] font-medium uppercase tracking-[0.18em] text-paper/70">{l}</div>
          </div>
        ))}
      </div>
      <div className="overflow-hidden border-t border-paper/10 bg-career-deep py-2">
        <div className="inline-block whitespace-nowrap font-dm text-[10px] font-medium uppercase tracking-[0.18em] text-paper/70 animate-marquee">
          {Array.from({ length: 2 }).map((_, k) => (
            <span key={k}>
              &nbsp;&nbsp;Emiratisation &nbsp;·&nbsp; Org Design &nbsp;·&nbsp; C&amp;B Architecture &nbsp;·&nbsp; Talent Strategy &nbsp;·&nbsp; Performance Mgmt &nbsp;·&nbsp; UAE Labour Law &nbsp;·&nbsp; People Analytics &nbsp;·&nbsp; HR Foundation &nbsp;·&nbsp; MENA Markets &nbsp;·&nbsp; PHRi Certified &nbsp;·&nbsp;
            </span>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-[1fr_220px] gap-9 px-10 py-8">
        <div>
          <SigSec label="Narrative">
            <p className="font-dm text-[13px] font-light leading-[1.7] text-ink">
              I build HR functions that actually work — for growing companies in the UAE and GCC who are past the startup phase and need real people infrastructure. Fourteen years in the field means I've seen most of what can go wrong, and I know how to fix it without adding ten new processes.
            </p>
          </SigSec>
          <SigSec label="Career Timeline">
            <ul>
              {[
                ["Head of HR · Majid Al Futtaim", "Dubai · Retail & Entertainment", "2021 – Present"],
                ["HR Business Partner · Chalhoub Group", "Dubai · Luxury Retail", "2018 – 2021"],
                ["Senior HR Manager · Emaar Properties", "Dubai · Real Estate", "2015 – 2018"],
                ["HR Generalist · Aldar Properties", "Abu Dhabi", "2012 – 2015"],
              ].map(([role, co, yr], i, arr) => (
                <li key={role} className="grid grid-cols-[10px_1fr] gap-3 border-b border-ink/[0.07] py-2.5 text-[12px] last:border-0">
                  <div className="flex flex-col items-center pt-1">
                    <div className="h-2 w-2 shrink-0 rounded-full bg-career-blue" />
                    {i < arr.length - 1 && <div className="mt-1 w-px flex-1 bg-career-blue/20" />}
                  </div>
                  <div>
                    <span className="block text-[12px] font-medium">{role}</span>
                    <span className="block text-[11px] font-light text-ink/55">{co}</span>
                    <span className="block text-[10px] tracking-wider text-ink/55">{yr}</span>
                  </div>
                </li>
              ))}
            </ul>
          </SigSec>
        </div>
        <div>
          <SigSec label="Skill Strengths">
            <ul className="space-y-3">
              {[
                ["Emiratisation", "Expert", 94],
                ["Org Design", "Advanced", 86],
                ["C&B Architecture", "Advanced", 80],
                ["Talent Acquisition", "Strong", 72],
                ["L&D Design", "Proficient", 65],
              ].map(([name, level, pct]) => (
                <li key={name as string}>
                  <div className="mb-1 flex justify-between text-[11px] font-medium text-ink">
                    <span>{name}</span>
                    <span className="font-light text-ink/55">{level}</span>
                  </div>
                  <div className="h-1 overflow-hidden rounded-full bg-ink/10">
                    <div className="h-full rounded-full bg-career-blue" style={{ width: `${pct}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </SigSec>
          <div className="mt-2 rounded bg-[#E8DFD1] p-4">
            <p className="mb-2 font-dm text-[9px] font-medium uppercase tracking-[0.22em] text-ink/55">Contact</p>
            <a className="block font-dm text-[12px] leading-[1.9] text-career-blue">sarah@email.com</a>
            <a className="block font-dm text-[12px] leading-[1.9] text-career-blue">linkedin.com/in/smahm</a>
            <a className="block font-dm text-[12px] leading-[1.9] text-career-blue">+971 50 000 0000</a>
          </div>
        </div>
      </div>
      <div className="mx-10 mb-8 flex items-center justify-center gap-2 rounded border border-ink/15 py-2.5 font-dm text-[11px] font-medium uppercase tracking-[0.1em] text-ink/55">
        <Download size={12} /> Download PDF version
      </div>
    </div>
  );
}

function SigSec({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <p className="mb-2.5 border-b border-ink/[0.12] pb-1.5 font-dm text-[10px] font-medium uppercase tracking-[0.22em] text-career-blue">{label}</p>
      {children}
    </div>
  );
}

/* ─────────────── EXECUTIVE CV ─────────────── */
function ExecutiveCv() {
  return (
    <div className="h-full w-full bg-[#F4EFE6] font-dm text-ink">
      <div className="flex items-center justify-between bg-ink px-11 py-3.5">
        <div className="font-serif text-base italic tracking-tight text-paper">sarah mahmoud</div>
        <div className="flex gap-5">
          {["About", "Speaking", "Media", "Contact"].map((l, i) => (
            <span key={l} className={`font-dm text-[11px] font-medium uppercase tracking-[0.12em] ${i === 0 ? "text-career-sky" : "text-paper/50"}`}>{l}</span>
          ))}
        </div>
      </div>
      <div className="flex items-center border-b border-paper/10 bg-career-blue">
        <span className="bg-career-deep px-3.5 py-1.5 font-dm text-[9px] font-bold uppercase tracking-[0.22em] text-paper">Latest</span>
        <div className="flex-1 overflow-hidden">
          <div className="inline-block whitespace-nowrap py-1.5 pl-3 font-dm text-[10px] font-medium uppercase tracking-[0.16em] text-paper/85 animate-marquee-slow">
            {Array.from({ length: 2 }).map((_, k) => (
              <span key={k}>
                HR Summit MENA 2024 Speaker &nbsp;·&nbsp; Forbes ME Featured &nbsp;·&nbsp; Emiratisation Expert &nbsp;·&nbsp; PHRi Certified &nbsp;·&nbsp; 14 Yrs Executive HR &nbsp;·&nbsp; 11 MENA Markets &nbsp;·&nbsp; Arabian Business Contributor &nbsp;·&nbsp; Future Workplace UAE Keynote &nbsp;·&nbsp; SHRM MENA Panelist &nbsp;·&nbsp;
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-[1fr_240px] bg-ink">
        <div className="flex flex-col justify-center px-12 py-12">
          <div className="mb-5 flex items-center gap-2.5 font-dm text-[10px] font-medium uppercase tracking-[0.24em] text-career-sky">
            <span className="h-px w-5 bg-career-sky" /> HR Executive · Thought Leader · Dubai
          </div>
          <h2 className="mb-1 font-serif text-[54px] font-medium leading-[0.96] tracking-tight text-paper">
            Sarah<br /><em className="font-normal italic text-career-sky">Mahmoud</em>
          </h2>
          <p className="mt-3.5 font-dm text-[11px] font-light uppercase leading-[1.5] tracking-[0.14em] text-paper/60">
            Chief People Officer · Board Advisor · Speaker
          </p>
        </div>
        <div className="flex items-end justify-center overflow-hidden bg-gradient-to-b from-career-deep to-career-bg">
          <img src={PHOTO_URL} alt="" className="block h-[260px] w-[210px] rounded-t object-cover object-top" />
        </div>
      </div>
      <div className="bg-career-blue px-12 py-5">
        <div className="font-serif text-[19px] font-normal italic leading-[1.35] tracking-tight text-paper">
          “The best HR systems are the ones people don't notice — because they just work.”
        </div>
        <div className="mt-2 font-dm text-[10px] font-medium uppercase tracking-[0.14em] text-paper/70">Sarah Mahmoud · HR Summit MENA, 2024</div>
      </div>
      <div className="grid grid-cols-[1fr_240px] gap-11 px-12 py-10">
        <div>
          <ExecSec label="Executive Profile">
            <p className="font-dm text-[13px] font-light leading-[1.72] text-ink">
              Sarah Mahmoud is a Chief People Officer with 14 years of experience building and transforming HR functions across the UAE, Saudi Arabia, and wider GCC. <strong className="font-medium">Known for translating complex business challenges into people strategy</strong>, she has led workforce transformations at scale — from Emiratisation compliance to pan-GCC organisational redesigns affecting 4,000+ employees.
            </p>
          </ExecSec>
          <ExecSec label="Speaking & Thought Leadership">
            <ul>
              {[
                ["2024", "Emiratisation: What Companies Get Wrong", "HR Summit MENA · Dubai"],
                ["2023", "People Strategy for High-Growth SMEs", "Future Workplace UAE · Abu Dhabi"],
                ["2023", "Workforce Planning Post-Pandemic", "SHRM MENA Annual Conference"],
              ].map(([yr, name, org]) => (
                <li key={name} className="grid grid-cols-[38px_1fr] items-start gap-3 border-b border-ink/[0.08] py-3 last:border-0">
                  <span className="font-serif text-[14px] italic text-career-blue">{yr}</span>
                  <div>
                    <span className="block font-dm text-[12px] font-medium text-ink">{name}</span>
                    <span className="block font-dm text-[11px] font-light text-ink/55">{org}</span>
                  </div>
                </li>
              ))}
            </ul>
          </ExecSec>
        </div>
        <div>
          <div className="mb-5">
            <p className="mb-2.5 font-dm text-[10px] font-medium uppercase tracking-[0.22em] text-career-blue">Media & Press</p>
            <div className="flex flex-wrap gap-1.5">
              {["Arabian Business", "Gulf News", "HR Magazine ME", "Forbes ME"].map((t) => (
                <span key={t} className="border border-ink/15 px-2 py-1 font-dm text-[10px] font-medium text-ink/70">{t}</span>
              ))}
            </div>
          </div>
          <div className="rounded bg-ink p-4">
            <p className="mb-3 font-dm text-[10px] font-medium uppercase tracking-[0.2em] text-career-sky">Work with Sarah</p>
            <a className="block font-dm text-[12px] leading-[1.9] text-paper/80">sarah@email.com</a>
            <a className="block font-dm text-[12px] leading-[1.9] text-paper/80">linkedin.com/in/smahm</a>
            <a className="block font-dm text-[12px] leading-[1.9] text-career-sky">Speaking enquiries →</a>
            <button className="mt-3 w-full bg-career-blue px-3 py-2 font-dm text-[10px] font-bold uppercase tracking-[0.14em] text-paper">Book a conversation</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ExecSec({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-7">
      <p className="mb-3 border-b border-ink/[0.12] pb-1.5 font-dm text-[10px] font-medium uppercase tracking-[0.22em] text-career-blue">{label}</p>
      {children}
    </div>
  );
}

/* ─────────────── AI AGENT WIDGET (overlay, not scaled) ─────────────── */
type AiMsg = { role: "visitor" | "agent"; text: string };
const AI_CONVO: AiMsg[] = [
  { role: "visitor", text: "What's Sarah's experience with Emiratisation?" },
  { role: "agent", text: "Sarah has led Emiratisation programs for 3 major UAE groups, achieving 100% quota compliance and securing Nafis subsidies. She's also spoken on the topic at HR Summit MENA." },
];

function AiAgentWidget() {
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<AiMsg[]>([]);
  const [typing, setTyping] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const clearAll = () => { timers.current.forEach(clearTimeout); timers.current = []; };
    clearAll();
    setVisible(false); setOpen(false); setMessages([]); setTyping(false);

    timers.current.push(setTimeout(() => setVisible(true), 1400));
    timers.current.push(setTimeout(() => setOpen(true), 2000));
    // play conversation
    timers.current.push(setTimeout(() => setMessages([AI_CONVO[0]]), 2600));
    timers.current.push(setTimeout(() => setTyping(true), 3200));
    timers.current.push(setTimeout(() => {
      setTyping(false);
      setMessages([AI_CONVO[0], AI_CONVO[1]]);
    }, 4400));

    return clearAll;
  }, []);

  return (
    <div
      className={`pointer-events-none absolute bottom-3.5 right-3.5 z-30 flex flex-col items-end gap-2 transition-opacity duration-400 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className={`flex max-h-[268px] w-[220px] origin-bottom-right flex-col overflow-hidden rounded-[10px] bg-white shadow-[0_8px_32px_rgba(0,0,0,0.22)] ring-1 ring-ink/[0.08] transition-all duration-300 ${
          open ? "pointer-events-auto translate-y-0 scale-100 opacity-100" : "pointer-events-none translate-y-1.5 scale-95 opacity-0"
        }`}
      >
        <div className="flex items-center gap-2 bg-ink px-3 py-2">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-career-blue text-[11px] font-semibold text-paper">
            <Sparkles size={12} />
          </div>
          <div className="flex-1">
            <div className="font-dm text-[11px] font-medium text-paper">Sarah's AI</div>
            <div className="font-dm text-[9px] tracking-wider text-paper/50">ASK ANYTHING</div>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); setOpen(false); }}
            className="pointer-events-auto px-0.5 text-paper/50 hover:text-paper"
            aria-label="Close"
          >
            <X size={14} />
          </button>
        </div>
        <div className="flex max-h-[148px] min-h-[80px] flex-1 flex-col gap-2 overflow-y-auto p-2.5">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`max-w-[88%] rounded-lg px-2.5 py-1.5 font-dm text-[11px] leading-[1.5] animate-fade-in ${
                m.role === "visitor"
                  ? "self-end rounded-br-sm bg-clay text-ink"
                  : "self-start rounded-bl-sm bg-ink text-paper/90"
              }`}
            >
              {m.text}
            </div>
          ))}
          {typing && (
            <div className="flex items-center gap-1 self-start rounded-lg rounded-bl-sm bg-ink px-2.5 py-2">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-paper/50 [animation-delay:0ms]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-paper/50 [animation-delay:150ms]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-paper/50 [animation-delay:300ms]" />
            </div>
          )}
        </div>
        <div className="flex items-center gap-1.5 border-t border-ink/[0.08] bg-[#FAFAFA] px-2.5 py-2">
          <input
            disabled
            placeholder="Ask about Sarah…"
            className="flex-1 bg-transparent font-dm text-[11px] text-ink outline-none placeholder:text-ink/35"
          />
          <button className="pointer-events-auto flex h-6 w-6 items-center justify-center rounded-md bg-career-blue text-paper">
            <Send size={11} />
          </button>
        </div>
      </div>
      <button
        onClick={() => setOpen((o) => !o)}
        className="pointer-events-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-career-blue text-paper shadow-[0_4px_16px_rgba(0,0,0,0.3)] transition-transform hover:scale-110"
        aria-label="Chat with Sarah's AI"
      >
        <Sparkles size={16} />
      </button>
    </div>
  );
}

/* ─────────────── SHOWCASE ─────────────── */
const CV_DESIGN_WIDTH = 800;

export default function WebCvShowcase() {
  const [active, setActive] = useState<Tier>("executive");
  const viewportRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const update = () => {
      if (!viewportRef.current) return;
      setScale(viewportRef.current.clientWidth / CV_DESIGN_WIDTH);
    };
    update();
    const ro = new ResizeObserver(update);
    if (viewportRef.current) ro.observe(viewportRef.current);
    return () => ro.disconnect();
  }, []);

  const activePkg = PACKAGES.find((p) => p.id === active)!;

  const scrollToContact = () => {
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section id="web-cv" className="relative border-y border-career-sky/15 bg-career-bg px-6 py-20 md:px-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,hsl(var(--career-sky)/0.10),transparent_55%),radial-gradient(circle_at_12%_92%,hsl(var(--career-blue)/0.12),transparent_60%)]" />
      <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[280px_1fr_320px] lg:items-center">
        {/* LEFT COPY */}
        <div>
          <p className="mb-5 flex items-center gap-2.5 font-dm text-[11px] font-medium uppercase tracking-[0.24em] text-career-sky">
            <span className="h-px w-6 bg-career-sky" /> Only at People.Studio
          </p>
          <h2 className="mb-5 font-serif text-4xl font-medium leading-[1.05] tracking-tight text-paper md:text-5xl">
            A CV people can <em className="italic text-career-sky">actually</em> experience.
          </h2>
          <p className="mb-8 max-w-[300px] font-light leading-[1.65] text-paper/70">
            For senior professionals, founders, and HR leaders who need more than a document: a polished personal brand page that recruiters, employers, and collaborators can open instantly.
          </p>
          <a
            href="/profile"
            className="group inline-flex min-h-12 items-center gap-2.5 rounded-md bg-career-sky px-6 font-dm text-[13px] font-bold uppercase tracking-[0.08em] text-career-deep shadow-[0_12px_32px_-12px_hsl(var(--career-sky)/0.6)] transition-all hover:-translate-y-0.5 hover:bg-paper"
          >
            See the live demo
            <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </div>

        {/* CENTER: BROWSER FRAME */}
        <div className="flex justify-center">
          <div className="w-full max-w-[520px] overflow-hidden rounded-xl bg-[#2C2C2A] shadow-[0_32px_80px_rgba(0,0,0,0.5)] ring-1 ring-paper/10">
            {/* Browser bar */}
            <div className="flex items-center gap-3 border-b border-paper/5 bg-[#3A3A38] px-4 py-2.5">
              <div className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#FFBD2E]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
              </div>
              <div className="flex h-6 flex-1 items-center gap-2 rounded bg-paper/[0.08] px-2.5 font-dm text-[11px] text-paper/45">
                <span className="h-2 w-2 shrink-0 rounded-full bg-[#28C840] opacity-70" />
                <span className="truncate">peoplestudio.ae/cv/{activePkg.slug}</span>
                <span className="ml-auto shrink-0 font-dm text-[11px] tracking-[2px] text-career-sky">
                  {"★".repeat(activePkg.stars)}
                </span>
              </div>
            </div>
            {/* Viewport */}
            <div
              ref={viewportRef}
              className="relative aspect-[4/5] overflow-hidden bg-[#FAFAF8]"
            >
              {(["essential", "signature", "executive"] as Tier[]).map((tier) => (
                <div
                  key={tier}
                  className={`absolute inset-0 overflow-hidden transition-opacity duration-300 ${
                    active === tier ? "opacity-100" : "pointer-events-none opacity-0"
                  }`}
                >
                  <div
                    style={{
                      width: CV_DESIGN_WIDTH,
                      transform: `scale(${scale})`,
                      transformOrigin: "top left",
                    }}
                  >
                    {tier === "essential" && <EssentialCv />}
                    {tier === "signature" && <SignatureCv />}
                    {tier === "executive" && <ExecutiveCv />}
                  </div>
                </div>
              ))}
              {/* AI agent overlay — only visible on Executive (re-mounts on tier change to replay) */}
              {active === "executive" && <AiAgentWidget key="ai-exec" />}
            </div>
          </div>
        </div>

        {/* RIGHT: PACKAGES */}
        <div className="flex flex-col gap-1" onMouseLeave={() => setActive("executive")}>
          {PACKAGES.map((pkg) => {
            const isActive = active === pkg.id;
            return (
              <button
                key={pkg.id}
                type="button"
                onMouseEnter={() => setActive(pkg.id)}
                onFocus={() => setActive(pkg.id)}
                onClick={() => {
                  setActive(pkg.id);
                  scrollToContact();
                }}
                className={`group cursor-pointer rounded-lg border p-5 text-left transition-all duration-300 ${
                  isActive
                    ? "border-career-sky/40 bg-career-sky/10"
                    : "border-transparent hover:border-paper/15 hover:bg-paper/[0.06]"
                }`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-serif text-xl font-normal italic tracking-tight text-paper">{pkg.name}</span>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={12}
                        strokeWidth={1.5}
                        className={`fill-current transition-opacity duration-300 ${
                          i < pkg.stars
                            ? isActive
                              ? "text-career-sky opacity-100"
                              : "text-career-sky opacity-40 group-hover:opacity-100"
                            : "text-paper/15 opacity-50"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p
                  className={`text-[13px] leading-[1.6] transition-colors duration-300 ${
                    isActive ? "text-paper/85" : "text-paper/55 group-hover:text-paper/80"
                  }`}
                >
                  {pkg.desc}
                </p>
                <div
                  className={`mt-2.5 inline-flex items-center gap-1.5 overflow-hidden font-dm text-[11px] font-medium uppercase tracking-[0.08em] text-career-sky transition-all duration-300 ${
                    isActive ? "max-h-10 opacity-100" : "max-h-0 opacity-0 group-hover:max-h-10 group-hover:opacity-100"
                  }`}
                >
                  Get started <ArrowUpRight size={12} />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
