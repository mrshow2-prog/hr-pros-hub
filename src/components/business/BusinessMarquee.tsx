import { MARQUEE_SERVICES } from "@/data/business";
import { pick, useLang } from "@/i18n/T";

export default function BusinessMarquee() {
  const lang = useLang();
  const doubled = [...MARQUEE_SERVICES, ...MARQUEE_SERVICES];
  return (
    <div className="overflow-hidden py-5 bg-ink">
      <div className="flex animate-marquee whitespace-nowrap" style={{ width: "max-content" }}>
        {doubled.map((s, i) => (
          <span key={i} className="font-dm font-bold text-xs uppercase mx-8 inline-flex items-center gap-8 text-paper" style={{ letterSpacing: "0.14em" }}>
            {pick(s, lang)}
            <span className="text-terracotta">·</span>
          </span>
        ))}
      </div>
    </div>
  );
}
