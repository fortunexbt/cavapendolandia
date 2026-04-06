import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import { AdminNav } from "./AdminNav";
import { useAdmin } from "@/hooks/useAdmin";

interface AdminShellProps {
  children: ReactNode;
  rightContent?: ReactNode;
}

const AdminShell = ({ children, rightContent }: AdminShellProps) => {
  const { signOut } = useAdmin();

  return (
    <div className="min-h-screen bg-background">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,hsl(var(--trace)/0.45),transparent_35%),radial-gradient(circle_at_bottom_right,hsl(var(--whisper)/0.22),transparent_38%)]" />

      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 px-4 py-4 backdrop-blur md:px-6">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-4 md:gap-6">
            <Link to="/" className="font-mono-light text-xs text-muted-foreground hover:text-foreground">
              ← Torna al sito
            </Link>
            <AdminNav />
          </div>

          <div className="flex items-center gap-3">
            {rightContent}
            <button
              onClick={signOut}
              className="rounded-full border border-border px-4 py-2 font-mono-light text-[0.62rem] uppercase tracking-[0.12em] text-muted-foreground hover:text-foreground"
            >
              SignOut
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 md:py-8">
        {children}
      </main>
    </div>
  );
};

export { AdminShell };