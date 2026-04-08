import { useTranslation } from "react-i18next";

type EntraComingSoonProps = {
  label?: string;
  className?: string;
  hint?: string;
};

const EntraComingSoon = ({
  label,
  className = "",
  hint,
}: EntraComingSoonProps) => {
  const { t } = useTranslation();
  const defaultLabel = t("index.ctaEnter");
  const defaultHint = t("index.entraComingSoonHint");

  return (
    <span className="group relative inline-flex items-center">
      <span
        aria-disabled="true"
        title={hint ?? defaultHint}
        className={`cursor-not-allowed select-none text-muted-foreground/45 ${className}`}
      >
        {label ?? defaultLabel}
      </span>
      <span
        role="tooltip"
        className="pointer-events-none absolute left-1/2 top-full z-30 mt-2 w-max max-w-[18rem] -translate-x-1/2 rounded-sm border border-border/80 bg-background/95 px-3 py-1.5 text-center font-mono-light text-[0.64rem] uppercase tracking-[0.08em] text-muted-foreground/85 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100"
      >
        {hint ?? defaultHint}
      </span>
    </span>
  );
};

export default EntraComingSoon;
