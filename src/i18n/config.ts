import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";
import it from "./locales/it.json";

export const languages = [
  { code: "it", name: "IT", nativeName: "Italiano" },
  { code: "en", name: "EN", nativeName: "English" },
] as const;

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    it: { translation: it },
  },
  lng: "it",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
