import { Link } from "react-router-dom";
import EntraComingSoon from "@/components/EntraComingSoon";

const MinimalHeader = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-sm">
      <div className="mx-auto w-full max-w-6xl px-4 py-3 md:px-10">
        <div className="flex items-center justify-between gap-4">
          <Link
            to="/"
            className="font-mono-light text-[0.68rem] uppercase tracking-[0.18em] text-foreground/78 hover:text-foreground"
          >
            CAVAPENDOLANDIA
          </Link>
          <nav className="flex items-center gap-4 font-mono-light text-[0.68rem] tracking-[0.1em]">
            <Link to="/che-cose" className="text-muted-foreground/70 hover:text-foreground transition-colors">
              Che cos'è
            </Link>
            <Link to="/regole" className="text-muted-foreground/70 hover:text-foreground transition-colors">
              Regole
            </Link>
            <Link to="/rimozione" className="text-muted-foreground/70 hover:text-foreground transition-colors">
              Rimozione
            </Link>
            <span className="text-border">|</span>
            <EntraComingSoon className="text-muted-foreground/55" />
            <Link
              to="/offri"
              className="text-foreground/82 hover:text-foreground transition-colors"
            >
              Lascia una cavapendolata
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default MinimalHeader;
