import { Link } from "react-router-dom";
import { T, useTr } from "@/i18n/T";
import { useLocalizedPath } from "@/i18n/useLocalizedPath";

interface SiteFooterProps {
  /** Use the dark/olive (Career) palette instead of the light/paper palette. */
  variant?: "light" | "dark";
  /** Applied to the outer <footer> element — use for layout wrappers (e.g. absolute positioning on Index). */
  className?: string;
}

const LEGAL_LINKS = [
  { en: "Privacy Policy", ar: "سياسة الخصوصية", to: "/legal#privacy" },
  { en: "Terms", ar: "الشروط", to: "/legal#terms" },
  { en: "Disclaimer", ar: "إخلاء المسؤولية", to: "/legal#disclaimer" },
] as const;

export default function SiteFooter({ variant = "light", className = "" }: SiteFooterProps) {
  const dark = variant === "dark";
  const tr = useTr();
  const { localize } = useLocalizedPath();
  const baseText = dark ? "text-paper/55" : "text-ink/50";
  const mutedText = dark ? "text-paper/40" : "text-ink/40";
  const linkText = dark
    ? "text-paper/55 hover:text-paper"
    : "text-ink/55 hover:text-ink";
  const divider = dark ? "border-paper/15" : "border-ink/10";
  const dot = dark ? "bg-paper/25" : "bg-ink/20";

  return (
    <footer
      className={`border-t ${divider} px-6 py-6 font-dm text-[0.66rem] font-medium uppercase tracking-wider2 ${baseText} md:px-10 ${className}`}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-4">
        {/* Top row: copyright + legal links */}
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
          <span>
            © {new Date().getFullYear()} {tr("People.Studio · Bishoy Mesiha Advisory · Dubai, UAE", "بيبول.ستوديو · استشارات بيشوي مسيحه · دبي، الإمارات")}
          </span>
          <nav aria-label={tr("Legal", "قانوني")} className="flex flex-wrap items-center gap-x-4 gap-y-2">
            {LEGAL_LINKS.map((link, i) => (
              <span key={link.to} className="flex items-center gap-x-4">
                <Link to={localize(link.to)} className={`transition-colors ${linkText}`}>
                  <T en={link.en} ar={link.ar} />
                </Link>
                {i < LEGAL_LINKS.length - 1 && (
                  <span aria-hidden="true" className={`inline-block h-1 w-1 rounded-full ${dot}`} />
                )}
              </span>
            ))}
          </nav>
        </div>

        {/* Bottom row: trade license + VAT (normal-case for legibility) */}
        <div className={`flex flex-wrap items-center gap-x-3 gap-y-1 border-t ${divider} pt-4 font-dm text-[0.7rem] font-normal normal-case tracking-normal ${mutedText}`}>
          <span>
            <T
              en="Licensed under Tajmeel Events Organizing and Managing Co. L.L.C · Trade License No. 1335626 · Dubai DED"
              ar="مرخّص تحت شركة تجميل لتنظيم وإدارة الفعاليات ذ.م.م · رخصة تجارية رقم 1335626 · دائرة الاقتصاد بدبي"
            />
          </span>
          <span aria-hidden="true" className={`hidden h-1 w-1 rounded-full ${dot} sm:inline-block`} />
          <span><T en="Not registered for UAE VAT" ar="غير مسجّل في ضريبة القيمة المضافة الإماراتية" /></span>
        </div>
      </div>
    </footer>
  );
}
