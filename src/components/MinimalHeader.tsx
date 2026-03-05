import { Link } from "react-router-dom";
import EntraComingSoon from "@/components/EntraComingSoon";

const MinimalHeader = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-sm">
      <div className="mx-auto w-full max-w-6xl px-4 py-4 md:px-10">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="font-mono-light text-sm uppercase tracking-[0.18em] text-foreground/78 hover:text-foreground md:text-[0.68rem]"
            >
              CAVAPENDOLAND
            </Link>
            <Link
              to="/offri"
              className="font-mono-light text-sm tracking-[0.1em] text-foreground/82 hover:text-foreground transition-colors md:text-base"
            >
              Lascia una cavapendolata
            </Link>
          </div>
          <nav className="flex items-center justify-center gap-4 font-mono-light text-sm tracking-[0.08em] text-muted-foreground/70 md:gap-6 md:text-base md:tracking-[0.1em]">
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
