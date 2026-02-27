import { Link } from "react-router-dom";
import EntraComingSoon from "@/components/EntraComingSoon";

const MinimalHeader = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4 md:px-10">
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
    </header>
  );
};

export default MinimalHeader;
