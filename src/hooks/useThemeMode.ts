import { useEffect, useMemo, useState } from "react";

export type ThemeMode = "system" | "light" | "dark";

const STORAGE_KEY = "cavapendolandia-theme";
const DARK_QUERY = "(prefers-color-scheme: dark)";

const getSystemPrefersDark = () =>
  typeof window !== "undefined" && window.matchMedia(DARK_QUERY).matches;

const getStoredMode = (): ThemeMode => {
  if (typeof window === "undefined") return "system";
  const raw = window.localStorage.getItem(STORAGE_KEY);
  return raw === "light" || raw === "dark" || raw === "system"
    ? raw
    : "system";
};

export const useThemeMode = () => {
  const [mode, setMode] = useState<ThemeMode>(getStoredMode);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const root = window.document.documentElement;
    const media = window.matchMedia(DARK_QUERY);

    const apply = () => {
      const isDark = mode === "dark" || (mode === "system" && media.matches);
      root.classList.toggle("dark", isDark);
    };

    apply();

    if (mode === "system") {
      media.addEventListener("change", apply);
      return () => media.removeEventListener("change", apply);
    }
  }, [mode]);

  const setThemeMode = (nextMode: ThemeMode) => {
    setMode(nextMode);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, nextMode);
    }
  };

  const resolvedMode = useMemo(() => {
    if (mode === "system") return getSystemPrefersDark() ? "dark" : "light";
    return mode;
  }, [mode]);

  return { mode, resolvedMode, setThemeMode };
};
