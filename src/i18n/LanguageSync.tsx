import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import i18n from "./index";

/**
 * Reads the URL prefix on every navigation and syncs i18next + <html lang/dir>.
 * - Paths starting with /ar  → Arabic, RTL
 * - Everything else          → English, LTR
 *
 * Profile pages (/:slug, /khalil, /bishoy, sample profiles) are intentionally
 * always rendered in English — the /ar prefix doesn't apply to them.
 */
const LanguageSync = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const isArabic = pathname === "/ar" || pathname.startsWith("/ar/");
    const lang = isArabic ? "ar" : "en";
    if (i18n.language !== lang) i18n.changeLanguage(lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = isArabic ? "rtl" : "ltr";
  }, [pathname]);

  return null;
};

export default LanguageSync;
