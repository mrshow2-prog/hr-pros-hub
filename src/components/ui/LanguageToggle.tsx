import { Link } from "react-router-dom";
import { useLocalizedPath } from "@/i18n/useLocalizedPath";

type Props = { className?: string; tone?: "ink" | "paper" };

/**
 * Compact EN / ع language switcher. Preserves path + hash.
 *
 *   tone="ink"   → for light backgrounds (default)
 *   tone="paper" → for dark/olive backgrounds
 */
const LanguageToggle = ({ className = "", tone = "ink" }: Props) => {
  const { isArabic, swap } = useLocalizedPath();

  const base =
    tone === "paper"
      ? "text-paper/55 hover:text-paper"
      : "text-ink/55 hover:text-ink";
  const active = tone === "paper" ? "text-paper" : "text-ink";

  return (
    <Link
      to={swap()}
      aria-label={isArabic ? "Switch to English" : "التبديل إلى العربية"}
      className={`inline-flex items-center gap-1 font-dm text-[0.68rem] font-medium uppercase tracking-widest2 transition-colors ${base} ${className}`}
    >
      <span className={isArabic ? base : active}>EN</span>
      <span aria-hidden="true" className="opacity-50">/</span>
      <span lang="ar" className={`text-base leading-none ${isArabic ? active : base}`}>ع</span>
    </Link>
  );
};

export default LanguageToggle;
