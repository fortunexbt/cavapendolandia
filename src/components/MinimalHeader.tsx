import { Link } from "react-router-dom";
import EntraComingSoon from "@/components/EntraComingSoon";
import { cn } from "@/lib/utils";

type MinimalHeaderProps = {
  immersive?: boolean;
};

const MinimalHeader = ({ immersive = false }: MinimalHeaderProps) => {
  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50",
        immersive
          ? "border-b border-white/20 bg-gradient-to-b from-black/45 to-black/10 backdrop-blur-[2px]"
          : "border-b border-border/70 bg-background/95 backdrop-blur-sm",
      )}
    >
      <div className="mx-auto w-full max-w-6xl px-4 py-2 md:px-10">
        <div className="flex items-center justify-between gap-2">
          <Link
            to="/"
            className={cn(
              "font-mono-light text-[0.68rem] uppercase tracking-[0.18em]",
              immersive
                ? "text-[#f3e8d4]/90 hover:text-[#fff5dd]"
                : "text-foreground/78 hover:text-foreground",
            )}
          >
            CAVAPENDOLANDIA
          </Link>
          <nav className="flex items-center gap-3">
            <EntraComingSoon
              className={cn(
                "font-mono-light text-[0.68rem]",
                immersive ? "text-[#d0d8e5]/65" : "text-muted-foreground/55",
              )}
            />
            <Link
              to="/offri"
              className={cn(
                "font-mono-light text-[0.68rem]",
                immersive
                  ? "text-[#f8efdf]/88 hover:text-[#fff8eb]"
                  : "text-muted-foreground/82 hover:text-foreground",
              )}
            >
              Lascia un'offerta
            </Link>
          </nav>
        </div>
        <nav
          className={cn(
            "mt-2 flex items-center justify-center gap-3 border-t pt-2 font-mono-light text-[0.72rem] tracking-[0.06em]",
            immersive
              ? "border-white/20 text-[#d9dce0]/92"
              : "border-border/60 text-muted-foreground/90",
          )}
        >
          <Link to="/che-cose" className={cn("transition-colors", immersive ? "hover:text-[#fff8ea]" : "hover:text-foreground")}>
            Che cos'è
          </Link>
          <span className={cn(immersive ? "text-white/30" : "text-border")}>·</span>
          <Link to="/regole" className={cn("transition-colors", immersive ? "hover:text-[#fff8ea]" : "hover:text-foreground")}>
            Regole
          </Link>
          <span className={cn(immersive ? "text-white/30" : "text-border")}>·</span>
          <Link
            to="/rimozione"
            className={cn("transition-colors", immersive ? "hover:text-[#fff8ea]" : "hover:text-foreground")}
          >
            Rimozione
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default MinimalHeader;
