import { Link } from "react-router-dom";
import PsLogo from "@/components/ui/PsLogo";
import { T } from "@/i18n/T";
import LanguageToggle from "@/components/ui/LanguageToggle";
import { useLocalizedPath } from "@/i18n/useLocalizedPath";

export default function ToolsNav() {
  const { localize } = useLocalizedPath();
  return (
    <nav className="sticky top-0 z-50 border-b border-ink/10 bg-paper/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-10">
        <div className="flex items-center gap-3">
          <PsLogo size="sm" />
          <span className="hidden border-l border-ink/15 pl-3 font-dm text-[10px] font-bold uppercase tracking-wider2 text-ink/45 sm:inline">
            <T en="Free Tools" ar="أدوات مجانية" />
          </span>
        </div>
        <div className="hidden items-center gap-6 md:flex">
          <Link
            to={localize("/business")}
            className="font-dm text-[0.7rem] font-bold uppercase tracking-wider2 text-ink/45 transition-colors hover:text-ink"
          >
            <T en="Back" ar="رجوع" />
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <LanguageToggle tone="ink" />
          <a
            href="mailto:bmesiha@outlook.com?subject=People.Studio — Free tools call"
            className="bg-sienna px-4 py-2.5 font-dm text-[0.68rem] font-bold uppercase tracking-wider2 text-paper transition-colors hover:bg-umber"
          >
            <T en="Book a Call" ar="احجز مكالمة" />
          </a>
        </div>
      </div>
    </nav>
  );
}
