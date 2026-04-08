import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import MinimalHeader from "@/components/MinimalHeader";
import MinimalFooter from "@/components/MinimalFooter";

const NotFound = () => {
  const { t } = useTranslation();
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-background">
      <MinimalHeader />

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pt-24 pb-12 text-center">
        <p className="font-mono-light text-xs uppercase tracking-[0.25em] text-muted-foreground mb-6">
          {t("notFound404.label")}
        </p>
        <h1 className="text-5xl md:text-7xl font-light text-foreground/80 mb-4">404</h1>
        <p className="text-lg italic text-muted-foreground/60 mb-10">
          {t("notFound404.message")}
        </p>
        <Link
          to="/"
          className="inline-block border border-foreground/25 px-7 py-2 font-mono-light text-xs uppercase tracking-[0.13em] text-foreground/85 hover:bg-foreground hover:text-primary-foreground transition-all duration-300"
        >
          {t("grazie.ctaHome")}
        </Link>
      </main>

      <MinimalFooter />
    </div>
  );
};

export default NotFound;
