const COSTS = [
  { value: "AED 130k+", label: "Average cost of one bad hire" },
  { value: "AED 80k+", label: "Average MoHRE labour claim cost" },
  { value: "AED 200k+", label: "Two-year Emiratisation gap exposure" },
  { value: "AED 90k", label: "One full year of Growth Retainer" },
];

export default function BusinessRealCost() {
  return (
    <section className="py-24 px-6 md:px-20 bg-paper">
      <div className="max-w-6xl mx-auto">
        <span
          className="font-dm font-bold text-xs uppercase block mb-5 text-terracotta"
          style={{ letterSpacing: "0.18em" }}
        >
          THE REAL COST
        </span>
        <h2
          className="font-serif font-normal leading-[1.05] mb-12 text-ink"
          style={{ fontSize: "clamp(2rem, 4.5vw, 3.5rem)" }}
        >
          One of these covers <em className="text-terracotta" style={{ fontStyle: "italic" }}>all the others.</em>
        </h2>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {COSTS.map((c, i) => (
            <div
              key={i}
              className="bg-ink text-cream p-8 rounded-sm flex flex-col justify-between min-h-[180px]"
            >
              <div
                className="font-serif font-bold mb-4 text-cream"
                style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)", letterSpacing: "-0.02em" }}
              >
                {c.value}
              </div>
              <div className="font-dm text-sm text-cream/70" style={{ fontWeight: 300 }}>
                {c.label}
              </div>
            </div>
          ))}
        </div>

        <p className="font-dm text-sm md:text-base text-ink/60 max-w-3xl" style={{ fontWeight: 300 }}>
          One engagement protects you from all three. Most clients recover the full annual fee in the first avoided incident.
        </p>
      </div>
    </section>
  );
}
