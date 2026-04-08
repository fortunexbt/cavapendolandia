import { useTranslation } from "react-i18next";
import { languages } from "@/i18n";

const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    i18n.changeLanguage(e.target.value);
  };

  return (
    <select
      value={i18n.language}
      onChange={handleChange}
      className="bg-transparent text-xs font-mono-light uppercase tracking-[0.15em] border border-border/50 px-2 py-1 focus:border-foreground/50 focus:outline-none transition-colors cursor-pointer"
      aria-label={i18n.language === "it" ? t("nav.selectLanguage") : "Select language"}
    >
      {languages.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.nativeName}
        </option>
      ))}
    </select>
  );
};

export default LanguageSwitcher;
