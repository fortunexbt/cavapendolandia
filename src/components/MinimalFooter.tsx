import { Link } from "react-router-dom";

const MinimalFooter = () => {
  return (
    <footer className="py-8 text-center">
      <nav className="flex items-center justify-center gap-5 font-mono-light text-muted-foreground/62">
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
    </footer>
  );
};

export default MinimalFooter;
