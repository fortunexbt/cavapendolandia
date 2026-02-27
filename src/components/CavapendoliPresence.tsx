import type { CSSProperties } from "react";

type PresenceVariant =
  | "soglia"
  | "vagare"
  | "nuovi"
  | "silenzio"
  | "offri"
  | "dettaglio"
  | "info";
type Sheet = "bw" | "colorA" | "colorB";
type Drift = "a" | "b" | "c";

const SHEETS: Record<Sheet, string> = {
  bw: "/cavapendoli/source/bw-sheet.png",
  colorA: "/cavapendoli/source/color-sheet-a.png",
  colorB: "/cavapendoli/source/color-sheet-b.png",
};

const TUNE: Record<
  PresenceVariant,
  {
    globalOpacity: number;
    blur: number;
    brightness: number;
    saturationBw: number;
    saturationColor: number;
    sheetMix: Record<Sheet, number>;
  }
> = {
  soglia: {
    globalOpacity: 0.105,
    blur: 15,
    brightness: 99,
    saturationBw: 74,
    saturationColor: 36,
    sheetMix: { bw: 1, colorA: 0.2, colorB: 0.16 },
  },
  vagare: {
    globalOpacity: 0.098,
    blur: 13,
    brightness: 97,
    saturationBw: 76,
    saturationColor: 52,
    sheetMix: { bw: 0.7, colorA: 0.6, colorB: 0.58 },
  },
  nuovi: {
    globalOpacity: 0.102,
    blur: 12,
    brightness: 98,
    saturationBw: 74,
    saturationColor: 58,
    sheetMix: { bw: 0.6, colorA: 0.68, colorB: 0.66 },
  },
  silenzio: {
    globalOpacity: 0.079,
    blur: 17,
    brightness: 95,
    saturationBw: 64,
    saturationColor: 24,
    sheetMix: { bw: 1, colorA: 0.12, colorB: 0.1 },
  },
  offri: {
    globalOpacity: 0.067,
    blur: 18,
    brightness: 94,
    saturationBw: 56,
    saturationColor: 30,
    sheetMix: { bw: 0.58, colorA: 0.22, colorB: 0.2 },
  },
  dettaglio: {
    globalOpacity: 0.062,
    blur: 19,
    brightness: 93,
    saturationBw: 55,
    saturationColor: 26,
    sheetMix: { bw: 0.55, colorA: 0.18, colorB: 0.16 },
  },
  info: {
    globalOpacity: 0.056,
    blur: 20,
    brightness: 93,
    saturationBw: 54,
    saturationColor: 24,
    sheetMix: { bw: 0.5, colorA: 0.14, colorB: 0.14 },
  },
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
  {
    sheet: "bw",
    col: 0,
    row: 0,
    top: "5%",
    left: "4%",
    size: "clamp(7.6rem, 14vw, 13rem)",
    rotate: -10,
    opacity: 0.84,
    drift: "a",
  },
  {
    sheet: "colorA",
    col: 1,
    row: 0,
    top: "6%",
    left: "32%",
    size: "clamp(7rem, 12vw, 12rem)",
    rotate: 6,
    opacity: 0.66,
    drift: "b",
  },
  {
    sheet: "colorB",
    col: 2,
    row: 0,
    top: "4%",
    left: "78%",
    size: "clamp(7.6rem, 13vw, 12.6rem)",
    rotate: -5,
    opacity: 0.7,
    drift: "c",
  },
  {
    sheet: "bw",
    col: 0,
    row: 1,
    top: "32%",
    left: "1.5%",
    size: "clamp(8.4rem, 15vw, 14rem)",
    rotate: 2,
    opacity: 0.78,
    drift: "c",
  },
  {
    sheet: "colorA",
    col: 2,
    row: 1,
    top: "30%",
    left: "83%",
    size: "clamp(7.4rem, 13vw, 12.6rem)",
    rotate: 3,
    opacity: 0.65,
    drift: "a",
  },
  {
    sheet: "bw",
    col: 1,
    row: 1,
    top: "46%",
    left: "89%",
    size: "clamp(6.6rem, 11vw, 11.4rem)",
    rotate: 8,
    opacity: 0.64,
    drift: "b",
  },
  {
    sheet: "colorB",
    col: 0,
    row: 2,
    top: "70%",
    left: "5%",
    size: "clamp(7.2rem, 12vw, 12rem)",
    rotate: -7,
    opacity: 0.67,
    drift: "b",
  },
  {
    sheet: "bw",
    col: 1,
    row: 2,
    top: "75%",
    left: "37%",
    size: "clamp(8.8rem, 16vw, 15rem)",
    rotate: 1,
    opacity: 0.77,
    drift: "c",
  },
  {
    sheet: "colorA",
    col: 2,
    row: 2,
    top: "72%",
    left: "78%",
    size: "clamp(7rem, 12vw, 12rem)",
    rotate: 5,
    opacity: 0.66,
    drift: "a",
  },
  {
    sheet: "colorB",
    col: 1,
    row: 0,
    top: "20%",
    left: "92%",
    size: "clamp(6.4rem, 10vw, 10.6rem)",
    rotate: -8,
    opacity: 0.58,
    drift: "c",
  },
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
          "--cava-opacity": `${(
            sprite.opacity *
            tune.globalOpacity *
            tune.sheetMix[sprite.sheet]
          ).toFixed(3)}`,
          "--cava-blur": `${tune.blur}px`,
          "--cava-saturation": `${
            sprite.sheet === "bw" ? tune.saturationBw : tune.saturationColor
          }%`,
          "--cava-grayscale": `${sprite.sheet === "bw" ? 26 : 40}%`,
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
      <span className="cava-presence-center-clear" />
      <span className="cava-presence-vignette" />
    </div>
  );
};

export default CavapendoliPresence;
