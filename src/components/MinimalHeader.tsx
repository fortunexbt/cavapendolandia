import { Link } from "react-router-dom";
import EntraComingSoon from "@/components/EntraComingSoon";

const MinimalHeader = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-sm">
      <div className="mx-auto w-full max-w-6xl px-3 py-3 md:px-10">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="font-mono-light text-[0.68rem] uppercase tracking-[0.18em] text-foreground/78 hover:text-foreground"
            >
              CAVAPENDOLANDIA
            </Link>
            <Link
              to="/offri"
              className="font-mono-light text-xs tracking-[0.1em] text-foreground/82 hover:text-foreground transition-colors md:text-[0.68rem]"
            >
              Lascia una cavapendolata
            </Link>
          </div>
          <nav className="flex items-center justify-center gap-3 font-mono-light text-[0.62rem] tracking-[0.08em] text-muted-foreground/70 md:gap-4 md:text-[0.68rem] md:tracking-[0.1em]">
            <Link to="/che-cose" className="hover:text-foreground transition-colors">
              Che cos'è
            </Link>
            <Link to="/regole" className="hover:text-foreground transition-colors">
              Regole
            </Link>
            <Link to="/rimozione" className="hover:text-foreground transition-colors">
              Rimozione
            </Link>
            <span className="text-border">|</span>
            <EntraComingSoon className="text-muted-foreground/55" />
          </nav>
        </div>
      </div>
    </header>
  );
};

export default MinimalHeader;
