import { ReactNode } from "react";
import { useTranslation } from "react-i18next";

/**
 * Bilingual text component.
 *
 * Usage:
 *   <T en="Practical HR" ar="موارد بشرية عملية" />
 *
 * If no Arabic is provided, English is shown in both languages (graceful
 * fallback for newly-added copy that hasn't been translated yet).
 *
 * IMPORTANT for maintainers: every time English copy is added or changed
 * anywhere in the site (except profile pages), add the matching `ar`
 * translation in the same edit.
 */
export function T({ en, ar }: { en: ReactNode; ar?: ReactNode }) {
  const { i18n } = useTranslation();
  if (i18n.language === "ar" && ar !== undefined && ar !== null && ar !== "") return <>{ar}</>;
  return <>{en}</>;
}

/** String-context helper for attributes (alt, title, placeholder, aria-label). */
export function useTr() {
  const { i18n } = useTranslation();
  return (en: string, ar?: string) => (i18n.language === "ar" && ar ? ar : en);
}

/** Returns the active language ("en" | "ar"). */
export function useLang() {
  const { i18n } = useTranslation();
  return (i18n.language || "en").startsWith("ar") ? ("ar" as const) : ("en" as const);
}

/** Picks the localized variant from a `{ en, ar }` data object. */
export function pick<T>(value: { en: T; ar?: T } | T, lang: "en" | "ar"): T {
  if (value && typeof value === "object" && "en" in (value as object)) {
    const v = value as { en: T; ar?: T };
    return lang === "ar" && v.ar !== undefined ? (v.ar as T) : v.en;
  }
  return value as T;
}
