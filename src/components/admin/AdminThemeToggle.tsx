import { Moon, Sun, Monitor } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import type { ThemeMode } from "@/hooks/useThemeMode";

type AdminThemeToggleProps = {
  mode: ThemeMode;
  onChange: (mode: ThemeMode) => void;
};

const AdminThemeToggle = ({ mode, onChange }: AdminThemeToggleProps) => {
  const { t } = useTranslation();
  const options: { value: ThemeMode; labelKey: string; icon: typeof Sun }[] = [
    { value: "system", labelKey: "theme.auto", icon: Monitor },
    { value: "light", labelKey: "theme.lightLabel", icon: Sun },
    { value: "dark", labelKey: "theme.darkLabel", icon: Moon },
  ];
  return (
    <div className="inline-flex items-center rounded-full border border-border bg-card/80 p-1 backdrop-blur">
      {options.map((option) => {
        const Icon = option.icon;
        const active = option.value === mode;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[0.62rem] uppercase tracking-[0.14em] font-mono-light",
              active
                ? "bg-foreground text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="h-3 w-3" />
            {t(option.labelKey)}
          </button>
        );
      })}
    </div>
  );
};

export default AdminThemeToggle;
