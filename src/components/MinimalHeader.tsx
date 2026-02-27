import { Link } from "react-router-dom";
import EntraComingSoon from "@/components/EntraComingSoon";

const MinimalHeader = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-auto w-full max-w-6xl px-6 py-3 md:px-10">
        <div className="flex items-center justify-between gap-3">
          <Link
            to="/"
            className="font-mono-light uppercase tracking-[0.2em] text-foreground/72 hover:text-foreground"
          >
            CAVAPENDOLANDIA
          </Link>
          <nav className="flex items-center gap-4">
            <EntraComingSoon className="font-mono-light text-muted-foreground/45" />
            <Link
              to="/offri"
              className="font-mono-light text-muted-foreground/78 hover:text-foreground"
            >
              Lascia un'offerta
            </Link>
          </nav>
        </div>
        <nav className="mt-3 flex items-center justify-center gap-5 font-mono-light text-muted-foreground/68">
          <Link to="/che-cose" className="hover:text-foreground">
            Che cos'è
          </Link>
          <span className="text-border">·</span>
          <Link to="/regole" className="hover:text-foreground">
            Regole
          </Link>
          <span className="text-border">·</span>
          <Link to="/rimozione" className="hover:text-foreground">
            Rimozione
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default MinimalHeader;
