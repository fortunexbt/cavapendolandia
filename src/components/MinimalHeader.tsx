import { Link } from "react-router-dom";
import EntraComingSoon from "@/components/EntraComingSoon";

const MinimalHeader = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/70 bg-background/95 backdrop-blur-sm">
      <div className="mx-auto w-full max-w-6xl px-4 py-2 md:px-10">
        <div className="flex items-center justify-between gap-2">
          <Link
            to="/"
            className="font-mono-light text-[0.68rem] uppercase tracking-[0.18em] text-foreground/78 hover:text-foreground"
          >
            CAVAPENDOLANDIA
          </Link>
          <nav className="flex items-center gap-3">
            <EntraComingSoon className="font-mono-light text-[0.68rem] text-muted-foreground/55" />
            <Link
              to="/offri"
              className="font-mono-light text-[0.68rem] text-muted-foreground/82 hover:text-foreground"
            >
              Lascia un'offerta
            </Link>
          </nav>
        </div>
        <nav className="mt-2 flex items-center justify-center gap-3 border-t border-border/60 pt-2 font-mono-light text-[0.72rem] tracking-[0.06em] text-muted-foreground/90">
          <Link to="/che-cose" className="hover:text-foreground transition-colors">
            Che cos'è
          </Link>
          <span className="text-border">·</span>
          <Link to="/regole" className="hover:text-foreground transition-colors">
            Regole
          </Link>
          <span className="text-border">·</span>
          <Link to="/rimozione" className="hover:text-foreground transition-colors">
            Rimozione
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default MinimalHeader;
