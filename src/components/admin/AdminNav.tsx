import { Link, NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type NavItem = {
  labelKey: string;
  to: string;
};

const ADMIN_NAV_ITEMS: NavItem[] = [
  { labelKey: "admin.navOfferings", to: "/admin/offerings/pending" },
  { labelKey: "admin.navIniziative", to: "/admin/iniziative" },
  { labelKey: "admin.navPagine", to: "/admin/pagine" },
  { labelKey: "admin.navPrato", to: "/admin/prato" },
  { labelKey: "admin.navMessaggi", to: "/admin/messaggi" },
];

interface AdminNavProps {
  className?: string;
}

const AdminNav = ({ className }: AdminNavProps) => {
  const { t } = useTranslation();
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
          {t(item.labelKey)}
        </NavLink>
      ))}
    </nav>
  );
};

export { AdminNav };