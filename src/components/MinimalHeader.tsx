import { Link } from "react-router-dom";
import { useState } from "react";
import { Sun, Moon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useThemeMode } from "@/hooks/useThemeMode";
import { SeahorseIcon } from "@/components/shared/SeahorseIcon";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const MinimalHeader = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { resolvedMode, setThemeMode } = useThemeMode();
  const { t } = useTranslation();

  const navLinks = [
    { to: "/che-cose", labelKey: "nav.cheCose" },
    { to: "/galleria", labelKey: "nav.galleria" },
    { to: "/offri", labelKey: "nav.offri" },
    { to: "/regole", labelKey: "nav.regole" },
    { to: "/rimozione", labelKey: "nav.rimozione" },
    { to: "/contatti", labelKey: "nav.contatti" },
  ];

  const toggleTheme = () => {
    setThemeMode(resolvedMode === "dark" ? "light" : "dark");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/30">
      <div className="mx-auto w-full px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <SeahorseIcon />
          </Link>
          
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center gap-6 font-mono-light text-base">
              {navLinks.map((link) => (
                <Link key={link.to} to={link.to} className="text-foreground/80 hover:text-foreground transition-colors">
                  {t(link.labelKey)}
                </Link>
              ))}
            </nav>

            <button
              onClick={toggleTheme}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={resolvedMode === "dark" ? t("theme.light") : t("theme.dark")}
            >
              {resolvedMode === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            <LanguageSwitcher />

            <button 
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex flex-col gap-1.5 p-2 md:hidden"
              aria-label="Menu"
            >
              <span className={`block h-0.5 w-6 bg-foreground/70 transition-transform ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block h-0.5 w-6 bg-foreground/70 ${menuOpen ? 'opacity-0' : ''}`} />
              <span className={`block h-0.5 w-6 bg-foreground/70 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav className="mt-4 pb-4 flex flex-col gap-4 font-mono-light text-lg md:hidden border-t border-border/30 pt-4">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-foreground/80 hover:text-foreground transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                {t(link.labelKey)}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
};

export default MinimalHeader;
