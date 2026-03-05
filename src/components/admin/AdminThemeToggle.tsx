import { Moon, Sun, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ThemeMode } from "@/hooks/useThemeMode";

type AdminThemeToggleProps = {
  mode: ThemeMode;
  onChange: (mode: ThemeMode) => void;
};

const OPTIONS: { value: ThemeMode; label: string; icon: typeof Sun }[] = [
  { value: "system", label: "Auto", icon: Monitor },
  { value: "light", label: "Luce", icon: Sun },
  { value: "dark", label: "Buio", icon: Moon },
];

const AdminThemeToggle = ({ mode, onChange }: AdminThemeToggleProps) => {
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
            {option.label}
          </button>
        );
      })}
    </div>
  );
};

export default AdminThemeToggle;
