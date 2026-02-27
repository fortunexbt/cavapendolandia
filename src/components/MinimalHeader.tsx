import { Link } from "react-router-dom";

const MinimalHeader = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 md:px-10">
      <Link
        to="/"
        className="font-mono-light uppercase tracking-[0.2em] text-foreground/70 hover:text-foreground transition-colors duration-700"
      >
        CAVAPENDOLANDIA
      </Link>
      <nav className="flex items-center gap-4">
        <Link
          to="/entra"
          className="font-mono-light text-muted-foreground/70 hover:text-foreground transition-colors duration-700"
        >
          Entra
        </Link>
        <Link
          to="/offri"
          className="font-mono-light text-muted-foreground hover:text-foreground transition-colors duration-700"
        >
          Lascia un'offerta
        </Link>
      </nav>
    </header>
  );
};

export default MinimalHeader;
