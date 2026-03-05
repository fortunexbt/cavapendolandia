import { Link } from "react-router-dom";
import EntraComingSoon from "@/components/EntraComingSoon";

const SEAHORSE_SVG = (
  <svg viewBox="0 0 280 240" className="h-10 w-10 md:h-12 md:w-12">
    <path d="M175 35c22 24 30 55 22 88-4 17-15 31-29 39 5 22-3 42-20 60-13 13-28 19-45 17 19-9 30-23 34-43 4-19 0-36-12-50-16-18-24-39-22-62 2-24 14-45 35-60 23-16 50-14 71 11Z" fill="currentColor" className="text-foreground/80" />
    <polygon points="115,92 146,68 186,74 198,108 167,127 132,117" fill="currentColor" className="text-foreground/60" />
    <polygon points="102,129 129,108 159,133 143,163 111,156" fill="currentColor" className="text-foreground/50" />
    <polygon points="161,150 189,137 203,160 183,187 154,173" fill="currentColor" className="text-foreground/40" />
    <ellipse cx="205" cy="84" rx="18" ry="18" fill="none" stroke="currentColor" strokeWidth="3" className="text-foreground/30" />
    <circle cx="208" cy="84" r="5" fill="currentColor" className="text-foreground/30" />
  </svg>
);

const MinimalHeader = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-sm">
      <div className="mx-auto w-full max-w-6xl px-4 py-3 md:px-10">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              {SEAHORSE_SVG}
            </Link>
            <nav className="flex items-center gap-2 font-mono-light text-sm tracking-[0.08em] md:gap-4 md:text-base">
              <Link to="/che-cose" className="text-foreground/70 hover:text-foreground transition-colors">
                Che cos'è
              </Link>
              <Link to="/regole" className="text-foreground/70 hover:text-foreground transition-colors">
                Regole
              </Link>
              <Link to="/rimozione" className="text-foreground/70 hover:text-foreground transition-colors">
                Rimozione
              </Link>
            </nav>
          </div>
          <div className="flex items-center justify-center">
            <EntraComingSoon className="text-muted-foreground/55" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default MinimalHeader;
