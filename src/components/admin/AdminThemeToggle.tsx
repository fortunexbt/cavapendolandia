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

  const OPTIONS: { value: ThemeMode; icon: typeof Sun }[] = [
    { value: "system", icon: Monitor },
    { value: "light", icon: Sun },
    { value: "dark", icon: Moon },
  ];

  const labelFor = (value: ThemeMode) => {
    if (value === "system") return t("theme.auto");
    if (value === "light") return t("theme.lightLabel");
    return t("theme.darkLabel");
  };

  return (
    <div className="inline-flex items-center rounded-full border border-border bg-card/80 p-1 backdrop-blur">
      {OPTIONS.map((option) => {
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
            {labelFor(option.value)}
          </button>
        );
      })}
    </div>
  );
};

export default AdminThemeToggle;
