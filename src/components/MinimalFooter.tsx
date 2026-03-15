import { Link } from "react-router-dom";

const MinimalFooter = () => {
  return (
    <footer className="py-4 text-center">
      <p className="font-mono-light text-[0.6rem] uppercase tracking-[0.15em] text-muted-foreground/40">
        Cavapendolandia · 2026 ·{" "}
        <Link to="/rimozione" className="hover:text-muted-foreground transition-colors">
          Rimozione
        </Link>
      </p>
    </footer>
  );
};

export default MinimalFooter;
