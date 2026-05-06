import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// We do NOT use translation JSON files.
// All Arabic strings live alongside their English counterparts in the
// component tree via <T en="..." ar="..." /> and the tr(en, ar) helper.
// i18next is used only to track the current language across the app.

i18n.use(initReactI18next).init({
  resources: { en: { translation: {} }, ar: { translation: {} } },
  lng: "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

export default i18n;
