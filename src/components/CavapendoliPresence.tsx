import type { CSSProperties } from "react";

type PresenceVariant = "soglia" | "vagare" | "silenzio" | "offri" | "dettaglio";

const ASSET_A = "/cavapendoli/models-a.png";
const ASSET_B = "/cavapendoli/models-b.png";

const VARIANT_STYLE: Record<
  PresenceVariant,
  {
    opacityA: string;
    opacityB: string;
    blurA: string;
    blurB: string;
    scaleA: string;
    scaleB: string;
  }
> = {
  soglia: {
    opacityA: "0.08",
    opacityB: "0.05",
    blurA: "16px",
    blurB: "24px",
    scaleA: "1.12",
    scaleB: "1.18",
  },
  vagare: {
    opacityA: "0.09",
    opacityB: "0.06",
    blurA: "18px",
    blurB: "26px",
    scaleA: "1.1",
    scaleB: "1.14",
  },
  silenzio: {
    opacityA: "0.07",
    opacityB: "0.04",
    blurA: "22px",
    blurB: "30px",
    scaleA: "1.08",
    scaleB: "1.12",
  },
  offri: {
    opacityA: "0.06",
    opacityB: "0.035",
    blurA: "24px",
    blurB: "30px",
    scaleA: "1.06",
    scaleB: "1.1",
  },
  dettaglio: {
    opacityA: "0.055",
    opacityB: "0.03",
    blurA: "26px",
    blurB: "32px",
    scaleA: "1.05",
    scaleB: "1.08",
  },
};

const CavapendoliPresence = ({ variant }: { variant: PresenceVariant }) => {
  const cfg = VARIANT_STYLE[variant];

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div
        className="cava-presence cava-presence-a"
        style={
          {
            "--cava-opacity": cfg.opacityA,
            "--cava-blur": cfg.blurA,
            "--cava-scale": cfg.scaleA,
            backgroundImage: `url('${ASSET_A}')`,
          } as CSSProperties
        }
      />
      <div
        className="cava-presence cava-presence-b"
        style={
          {
            "--cava-opacity": cfg.opacityB,
            "--cava-blur": cfg.blurB,
            "--cava-scale": cfg.scaleB,
            backgroundImage: `url('${ASSET_B}')`,
          } as CSSProperties
        }
      />
    </div>
  );
};

export default CavapendoliPresence;
