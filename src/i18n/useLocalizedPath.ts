import { useLocation } from "react-router-dom";

/**
 * Returns helpers for building language-aware paths.
 *
 * - `localize("/business")` → "/ar/business" when in Arabic, "/business" in English.
 * - `swap()` → toggles between EN and AR variants of the current URL.
 *
 * Profile slugs and admin routes are NOT prefixed (they're English-only).
 */
const PROFILE_OR_ADMIN_PATTERNS = [/^\/admin(\/|$)/];

export function useLocalizedPath() {
  const { pathname, search, hash } = useLocation();
  const isArabic = pathname === "/ar" || pathname.startsWith("/ar/");
  const lang: "en" | "ar" = isArabic ? "ar" : "en";

  const stripAr = (p: string) =>
    p === "/ar" ? "/" : p.startsWith("/ar/") ? p.slice(3) : p;

  const localize = (path: string) => {
    if (lang !== "ar") return path;
    if (PROFILE_OR_ADMIN_PATTERNS.some((re) => re.test(path))) return path;
    if (path.startsWith("/ar")) return path;
    if (path === "/") return "/ar";
    if (!path.startsWith("/")) return path; // external/mailto/tel/wa.me etc.
    return `/ar${path}`;
  };

  const swap = () => {
    const base = stripAr(pathname);
    const target = isArabic ? base : base === "/" ? "/ar" : `/ar${base}`;
    return `${target}${search}${hash}`;
  };

  return { lang, isArabic, localize, swap };
}
