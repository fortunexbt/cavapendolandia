import { type FC } from "react";

interface SeahorseIconProps {
  className?: string;
  /** Icon size variant: "sm" = h-8 w-8, "md" = h-24 w-24, "lg" = h-48 w-48 */
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-24 w-24",
  lg: "h-48 w-48",
};

export const SeahorseIcon: FC<SeahorseIconProps> = ({
  className = "",
  size = "sm",
}) => (
  <svg
    viewBox="0 0 280 240"
    className={`${sizeClasses[size]} ${className}`.trim()}
  >
    <path
      d="M175 35c22 24 30 55 22 88-4 17-15 31-29 39 5 22-3 42-20 60-13 13-28 19-45 17 19-9 30-23 34-43 4-19 0-36-12-50-16-18-24-39-22-62 2-24 14-45 35-60 23-16 50-14 71 11Z"
      fill="currentColor"
      className="text-secondary"
    />
    <polygon
      points="115,92 146,68 186,74 198,108 167,127 132,117"
      fill="currentColor"
      className="text-accent"
    />
    <polygon
      points="102,129 129,108 159,133 143,163 111,156"
      fill="currentColor"
      className="text-destructive/80"
    />
    <polygon
      points="161,150 189,137 203,160 183,187 154,173"
      fill="currentColor"
      className="text-ring"
    />
    <ellipse
      cx="205"
      cy="84"
      rx="18"
      ry="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="4"
      className="text-foreground/20"
    />
    <circle cx="208" cy="84" r="5" fill="currentColor" className="text-foreground/40" />
  </svg>
);

export default SeahorseIcon;
