import type { CSSProperties } from "react";

type PresenceVariant = "soglia" | "vagare" | "silenzio" | "offri" | "dettaglio";
type Sheet = "a" | "b";
type Drift = "a" | "b" | "c";

const SHEETS: Record<Sheet, string> = {
  a: "/cavapendoli/models-a.png",
  b: "/cavapendoli/models-b.png",
};

const TUNE: Record<
  PresenceVariant,
  {
    globalOpacity: number;
    blur: number;
    saturation: number;
    brightness: number;
  }
> = {
  soglia: { globalOpacity: 0.12, blur: 10, saturation: 76, brightness: 98 },
  vagare: { globalOpacity: 0.11, blur: 11, saturation: 74, brightness: 96 },
  silenzio: { globalOpacity: 0.085, blur: 14, saturation: 66, brightness: 94 },
  offri: { globalOpacity: 0.075, blur: 16, saturation: 62, brightness: 93 },
  dettaglio: { globalOpacity: 0.07, blur: 18, saturation: 58, brightness: 92 },
};

const SPRITES: Array<{
  sheet: Sheet;
  col: 0 | 1 | 2;
  row: 0 | 1 | 2;
  top: string;
  left: string;
  size: string;
  rotate: number;
  opacity: number;
  drift: Drift;
}> = [
  { sheet: "a", col: 0, row: 0, top: "8%", left: "7%", size: "clamp(8.5rem, 15vw, 15rem)", rotate: -8, opacity: 0.9, drift: "a" },
  { sheet: "a", col: 1, row: 0, top: "5%", left: "41%", size: "clamp(8rem, 14vw, 14rem)", rotate: 6, opacity: 0.82, drift: "b" },
  { sheet: "a", col: 2, row: 0, top: "9%", left: "74%", size: "clamp(8rem, 14vw, 14rem)", rotate: -5, opacity: 0.88, drift: "c" },
  { sheet: "a", col: 0, row: 1, top: "38%", left: "6%", size: "clamp(9rem, 16vw, 15rem)", rotate: 2, opacity: 0.72, drift: "c" },
  { sheet: "a", col: 1, row: 1, top: "42%", left: "40%", size: "clamp(8rem, 14vw, 13.5rem)", rotate: -4, opacity: 0.8, drift: "a" },
  { sheet: "a", col: 2, row: 1, top: "39%", left: "72%", size: "clamp(8.5rem, 15vw, 14.5rem)", rotate: 4, opacity: 0.78, drift: "b" },
  { sheet: "b", col: 0, row: 2, top: "69%", left: "7%", size: "clamp(8rem, 14vw, 13.5rem)", rotate: -6, opacity: 0.74, drift: "b" },
  { sheet: "b", col: 1, row: 2, top: "70%", left: "38%", size: "clamp(10rem, 18vw, 17rem)", rotate: 1, opacity: 0.8, drift: "c" },
  { sheet: "b", col: 2, row: 2, top: "68%", left: "74%", size: "clamp(8rem, 14vw, 13.5rem)", rotate: 5, opacity: 0.75, drift: "a" },
];

const CavapendoliPresence = ({ variant }: { variant: PresenceVariant }) => {
  const tune = TUNE[variant];

  return (
    <div className="cava-presence-root" aria-hidden>
      {SPRITES.map((sprite, index) => {
        const style = {
          "--cava-top": sprite.top,
          "--cava-left": sprite.left,
          "--cava-size": sprite.size,
          "--cava-rotate": `${sprite.rotate}deg`,
          "--cava-opacity": `${(sprite.opacity * tune.globalOpacity).toFixed(3)}`,
          "--cava-blur": `${tune.blur}px`,
          "--cava-saturation": `${tune.saturation}%`,
          "--cava-brightness": `${tune.brightness}%`,
          "--cava-position": `${sprite.col * 50}% ${sprite.row * 50}%`,
          backgroundImage: `url('${SHEETS[sprite.sheet]}')`,
        } as CSSProperties;

        return (
          <span
            key={`${sprite.sheet}-${sprite.col}-${sprite.row}-${index}`}
            className={`cava-sprite cava-sprite-${sprite.drift}`}
            style={style}
          />
        );
      })}
      <span className="cava-presence-vignette" />
    </div>
  );
};

export default CavapendoliPresence;
