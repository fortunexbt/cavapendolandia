import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";
import it from "./locales/it.json";

export const languages = [
  { code: "it", name: "IT", nativeName: "Italiano" },
  { code: "en", name: "EN", nativeName: "English" },
] as const;

const STORAGE_KEY = "i18nextLng";

const getInitialLng = (): string => {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? "it";
  } catch {
    return "it";
  }
};

i18n.on("languageChanged", (lng) => {
  try {
    localStorage.setItem(STORAGE_KEY, lng);
  } catch {
    // localStorage unavailable — non-fatal
  }
});

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    it: { translation: it },
  },
  lng: getInitialLng(),
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
