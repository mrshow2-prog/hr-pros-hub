const POINTS = [
  {
    title: "Tuned for GCC formats",
    body: "Photo placement, nationality, and visa-status fields handled the way Gulf recruiters expect — not hidden behind Western defaults.",
  },
  {
    title: "Arabic-name handling",
    body: "Bilingual names render cleanly in PDF and DOCX, with proper transliteration guidance and consistent ordering across sections.",
  },
  {
    title: "Region-aware ATS scoring",
    body: "Our scoring weighs the keywords UAE and KSA employers actually screen for, not just generic US/UK templates.",
  },
];

export default function WhyRegional() {
  return (
    <section className="border-t border-ink/10 bg-ink/[0.02] px-6 md:px-10 py-20 md:py-28">
      <div className="max-w-5xl mx-auto">
        <p className="font-dm text-xs uppercase tracking-wider2 text-ink/55">Why People Studio CV</p>
        <h2 className="mt-3 font-syne text-3xl md:text-4xl tracking-tight max-w-2xl">
          Built for the region the global tools forgot.
        </h2>
        <div className="mt-12 grid gap-10 md:grid-cols-3">
          {POINTS.map((p) => (
            <div key={p.title}>
              <h3 className="font-syne text-lg text-ink">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/65">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
