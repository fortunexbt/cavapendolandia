import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const MinimalFooter = () => {
  const { t } = useTranslation();

  return (
    <footer className="py-4 text-center">
      <p className="font-mono-light text-[0.6rem] uppercase tracking-[0.15em] text-muted-foreground/40">
{t("nav.footerBrand")} {" "}
        <Link to="/rimozione" className="hover:text-muted-foreground transition-colors">
          {t("nav.rimozione")}
        </Link>
      </p>
    </footer>
  );
};

export default MinimalFooter;
