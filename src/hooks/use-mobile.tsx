import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
      const shortSide = Math.min(window.innerWidth, window.innerHeight);
      const touchPoints =
        typeof navigator === "undefined" ? 0 : navigator.maxTouchPoints || 0;
      setIsMobile(
        window.innerWidth < MOBILE_BREAKPOINT ||
          (coarsePointer && touchPoints > 0 && shortSide < 900),
      );
    };
    mql.addEventListener("change", onChange);
    onChange();
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobile;
}
