import { Link, NavLink } from "react-router-dom";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  to: string;
};

const ADMIN_NAV_ITEMS: NavItem[] = [
  { label: "Offerings", to: "/admin/offerings/pending" },
  { label: "Iniziative", to: "/admin/iniziative" },
  { label: "Pagine", to: "/admin/pagine" },
  { label: "Prato", to: "/admin/prato" },
  { label: "Messaggi", to: "/admin/messaggi" },
];

interface AdminNavProps {
  className?: string;
}

const AdminNav = ({ className }: AdminNavProps) => {
  return (
    <nav className={cn("flex flex-wrap items-center gap-4 md:gap-6", className)}>
      {ADMIN_NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            cn(
              "font-mono-light text-[0.67rem] uppercase tracking-[0.12em] flex items-center gap-1.5 transition-colors",
              isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground",
            )
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
};

export { AdminNav, ADMIN_NAV_ITEMS };