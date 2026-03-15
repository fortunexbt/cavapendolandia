import { Link } from "react-router-dom";
import { useState } from "react";

const SEAHORSE_SVG = (
  <svg viewBox="0 0 280 240" className="h-8 w-8">
    <path d="M175 35c22 24 30 55 22 88-4 17-15 31-29 39 5 22-3 42-20 60-13 13-28 19-45 17 19-9 30-23 34-43 4-19 0-36-12-50-16-18-24-39-22-62 2-24 14-45 35-60 23-16 50-14 71 11Z" fill="currentColor" className="text-secondary" />
    <polygon points="115,92 146,68 186,74 198,108 167,127 132,117" fill="currentColor" className="text-accent" />
    <polygon points="102,129 129,108 159,133 143,163 111,156" fill="currentColor" className="text-destructive/80" />
    <polygon points="161,150 189,137 203,160 183,187 154,173" fill="currentColor" className="text-ring" />
    <ellipse cx="205" cy="84" rx="18" ry="18" fill="none" stroke="currentColor" strokeWidth="4" className="text-foreground/20" />
    <circle cx="208" cy="84" r="5" fill="currentColor" className="text-foreground/40" />
  </svg>
);

const MinimalHeader = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/30">
      <div className="mx-auto w-full px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            {SEAHORSE_SVG}
          </Link>
          
          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex flex-col gap-1.5 p-2 md:hidden"
            aria-label="Menu"
          >
            <span className={`block h-0.5 w-6 bg-foreground/70 transition-transform ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block h-0.5 w-6 bg-foreground/70 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block h-0.5 w-6 bg-foreground/70 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>

          <nav className="hidden md:flex items-center gap-6 font-mono-light text-base">
            <Link to="/che-cose" className="text-foreground/80 hover:text-foreground transition-colors">
              Che cos'è
            </Link>
            <Link to="/galleria" className="text-foreground/80 hover:text-foreground transition-colors">
              Galleria
            </Link>
            <Link to="/regole" className="text-foreground/80 hover:text-foreground transition-colors">
              Regole
            </Link>
            <Link to="/rimozione" className="text-foreground/80 hover:text-foreground transition-colors">
              Rimozione
            </Link>
          </nav>
        </div>

        {menuOpen && (
          <nav className="mt-4 pb-4 flex flex-col gap-4 font-mono-light text-lg md:hidden border-t border-border/30 pt-4">
            <Link 
              to="/che-cose" 
              className="text-foreground/80 hover:text-foreground transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Che cos'è
            </Link>
            <Link 
              to="/galleria" 
              className="text-foreground/80 hover:text-foreground transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Galleria
            </Link>
            <Link 
              to="/regole" 
              className="text-foreground/80 hover:text-foreground transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Regole
            </Link>
            <Link 
              to="/rimozione" 
              className="text-foreground/80 hover:text-foreground transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Rimozione
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
};

export default MinimalHeader;
