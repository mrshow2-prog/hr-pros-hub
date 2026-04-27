import { TICKER_ITEMS } from "@/data/profile";

export default function MetricsTicker() {
  const doubled = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div className="overflow-hidden py-4 bg-navy-deep border-y border-navy-soft/15">
      <div className="flex animate-marquee-slow whitespace-nowrap" style={{ width: "max-content" }}>
        {doubled.map((item, i) => (
          <span key={i} className="font-dm text-sm mx-6 inline-flex items-center gap-6 text-cream/80" style={{ letterSpacing: "0.04em" }}>
            {item}
            <span className="text-navy-soft/60">◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}
