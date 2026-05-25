import { Upload, Sparkles, FileDown } from "lucide-react";

const STEPS = [
  {
    icon: Upload,
    title: "Upload what you have",
    body: "Drop your existing CV, LinkedIn export, or start blank. We parse the structure automatically.",
  },
  {
    icon: Sparkles,
    title: "Rewrite & score",
    body: "Get a sharper version tailored to the role, with a live ATS score and section-by-section feedback.",
  },
  {
    icon: FileDown,
    title: "Export ATS-ready",
    body: "Download a clean PDF or DOCX. Seven templates, every one tested against major ATS parsers.",
  },
];

export default function HowItWorks() {
  return (
    <section className="border-t border-ink/10 px-6 md:px-10 py-20 md:py-28">
      <div className="max-w-5xl mx-auto">
        <p className="font-dm text-xs uppercase tracking-wider2 text-ink/55">How it works</p>
        <h2 className="mt-3 font-syne text-3xl md:text-4xl tracking-tight">
          From upload to offer-ready in three steps.
        </h2>
        <div className="mt-12 grid gap-10 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <div key={s.title}>
              <div className="flex items-center gap-3">
                <span className="font-syne text-2xl text-sienna">0{i + 1}</span>
                <s.icon className="h-5 w-5 text-ink/60" strokeWidth={1.5} />
              </div>
              <h3 className="mt-4 font-syne text-xl text-ink">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/65">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
