import { BOOKING_HREF } from "@/lib/contact";
import { T } from "@/i18n/T";

interface BookCallBannerProps {
  dark?: boolean;
}

export default function BookCallBanner({ dark = false }: BookCallBannerProps) {
  return (
    <section
      className={`px-8 md:px-20 py-14 ${dark ? "bg-ink" : "bg-cream"}`}
      style={{ borderTop: dark ? "1px solid hsl(var(--cream) / 0.06)" : "1px solid hsl(var(--ink) / 0.06)" }}
    >
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <p className={`font-serif font-semibold text-2xl md:text-3xl ${dark ? "text-cream" : "text-ink"}`} style={{ letterSpacing: "-0.02em" }}>
            <T en="Ready to talk?" ar="جاهز للحديث؟" />
          </p>
          <p className={`font-dm text-sm mt-2 ${dark ? "text-cream/55" : "text-moss"}`} style={{ fontWeight: 300 }}>
            <T en="Free 30-minute call. No obligation. Honest answers about your HR risk." ar="مكالمة مجانية مدّتها 30 دقيقة. دون التزام. إجابات صريحة حول مخاطر الموارد البشرية لديك." />
          </p>
        </div>
        <a
          href={BOOKING_HREF}
          target="_blank"
          rel="noopener noreferrer"
          className="font-dm font-bold text-xs uppercase px-7 py-4 rounded-sm whitespace-nowrap transition-colors duration-200 bg-terracotta hover:bg-terracotta-deep text-cream self-start md:self-auto"
          style={{ letterSpacing: "0.1em" }}
        >
          <T en="Book a Call →" ar="احجز مكالمة ←" />
        </a>
      </div>
    </section>
  );
}
