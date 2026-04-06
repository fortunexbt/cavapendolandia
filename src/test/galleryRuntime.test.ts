import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  canScheduleAmbientOneShots,
  GALLERY_MUSIC_ASSETS,
  getActiveAmbientCues,
  resolveAmbientMix,
  resolveAmbientTransitionCue,
  resolveOneShotDensityScale,
} from "@/components/cavapendo-gallery/audio";
import {
  getAutoDowngradeFloor,
  getControlProfile,
  getNextAutoRenderProfile,
  getRenderProfileSource,
  readViewportMetrics,
  resolveRenderProfileId,
} from "@/components/cavapendo-gallery/runtime";
import {
  MEADOW_COLLIDERS,
  MEADOW_DEPOSIT_SITES,
  MEADOW_LANDMARKS,
  MEADOW_MONOLITHS,
  MEADOW_PLAYER_COLLIDER_RADIUS,
  MEADOW_PLANET_CENTER,
  MEADOW_PLANET_RADIUS,
  MEADOW_SKYLINE_LANDMARKS,
  MEADOW_SKYLINE_RIDGES,
  MEADOW_TREE_LAYOUT,
  getPlanarFromMeadowNormal,
  getMeadowSurfaceRadius,
  getMeadowSkylineLandmarksForQuality,
  getMeadowSkylineRidgesForQuality,
  getMeadowTerrainLift,
  projectPlanarPointToMeadowRadialNormal,
  projectPlanarPointToMeadowSurface,
  resolvePlanarMeadowCollisions,
} from "@/lib/meadowWorld";

function pointDistanceFromCenter(position: [number, number, number]) {
  return Math.hypot(
    position[0] - MEADOW_PLANET_CENTER.x,
    position[1] - MEADOW_PLANET_CENTER.y,
    position[2] - MEADOW_PLANET_CENTER.z,
  );
}

describe("gallery runtime helpers", () => {
  it("reads measured embedded surface metrics from the gallery wrapper", () => {
    const target = document.createElement("div");
    target.getBoundingClientRect = () =>
      ({
        width: 960,
        height: 540,
      }) as DOMRect;

    const metrics = readViewportMetrics({
      target,
      viewportWidth: 1280,
      viewportHeight: 720,
      dpr: 2,
    });

    expect(metrics).toMatchObject({
      width: 960,
      height: 540,
      shortSide: 540,
      longSide: 960,
      dpr: 2,
      context: "embedded",
      fullscreen: false,
    });
  });

  it("switches to fullscreen surface metrics when the wrapper is fullscreen", () => {
    const target = document.createElement("div");
    target.getBoundingClientRect = () =>
      ({
        width: 980,
        height: 560,
      }) as DOMRect;

    const metrics = readViewportMetrics({
      target,
      fullscreenElement: target,
      viewportWidth: 1366,
      viewportHeight: 768,
      dpr: 1.5,
    });

    expect(metrics).toMatchObject({
      width: 1366,
      height: 768,
      shortSide: 768,
      longSide: 1366,
      dpr: 1.5,
      context: "fullscreen",
      fullscreen: true,
    });
  });

  it("clamps unsupported mobile manual profiles and reports auto downgrade source", () => {
    expect(
      resolveRenderProfileId({
        deviceClass: "mobile",
        reduceMotion: false,
        preference: "desktop_showcase",
      }),
    ).toBe("mobile_balanced");

    expect(
      getRenderProfileSource({
        preference: "auto",
        resolvedProfile: "desktop_showcase",
        activeProfile: "desktop_balanced",
      }),
    ).toBe("auto_downgraded");
  });

  it("keeps desktop auto downgrades above the mobile tiers", () => {
    expect(getAutoDowngradeFloor("desktop")).toBe("desktop_balanced");
    expect(
      getNextAutoRenderProfile({
        currentProfile: "desktop_showcase",
        deviceClass: "desktop",
      }),
    ).toBe("desktop_balanced");
    expect(
      getNextAutoRenderProfile({
        currentProfile: "desktop_balanced",
        deviceClass: "desktop",
      }),
    ).toBeNull();
    expect(
      getNextAutoRenderProfile({
        currentProfile: "mobile_balanced",
        deviceClass: "mobile",
      }),
    ).toBe("mobile_safe");
  });

  it("preserves the deep-south authored skyline anchors on lower quality tiers", () => {
    const mediumLandmarks = getMeadowSkylineLandmarksForQuality("medium").map(
      (landmark) => landmark.id,
    );
    const lowLandmarks = getMeadowSkylineLandmarksForQuality("low").map(
      (landmark) => landmark.id,
    );
    const mediumRidges = getMeadowSkylineRidgesForQuality("medium").map(
      (ridge) => ridge.id,
    );
    const lowRidges = getMeadowSkylineRidgesForQuality("low").map(
      (ridge) => ridge.id,
    );

    [
      "skyline-southwest-outer-crown",
      "skyline-south-outer-meridian",
      "skyline-southeast-outer-crown",
    ].forEach((id) => {
      expect(mediumLandmarks).toContain(id);
      expect(lowLandmarks).toContain(id);
    });

    [
      "ridge-deep-southwest-shoulder",
      "ridge-deep-south-meridian",
      "ridge-deep-southeast-shoulder",
    ].forEach((id) => {
      expect(mediumRidges).toContain(id);
      expect(lowRidges).toContain(id);
    });
  });

  it("scales control calibration from the measured surface size", () => {
    const compactDesktop = getControlProfile({
      deviceClass: "desktop",
      mouseSensitivity: 1.06,
      touchSensitivity: 1.02,
      viewport: {
        width: 960,
        height: 540,
        shortSide: 540,
        longSide: 960,
        dpr: 1,
        context: "embedded",
        fullscreen: false,
      },
      joystickRadius: 56,
      invertLook: false,
      reducedCameraMotion: false,
    });
    const fullscreenMobile = getControlProfile({
      deviceClass: "mobile",
      mouseSensitivity: 1.06,
      touchSensitivity: 1.02,
      viewport: {
        width: 1366,
        height: 768,
        shortSide: 768,
        longSide: 1366,
        dpr: 2,
        context: "fullscreen",
        fullscreen: true,
      },
      joystickRadius: 56,
      invertLook: false,
      reducedCameraMotion: false,
    });

    expect(compactDesktop.mouseLookSensitivity).toBeGreaterThan(1);
    expect(fullscreenMobile.touchLookSensitivity).toBeLessThan(1.02);
    expect(fullscreenMobile.moveJoystickRadius).toBeGreaterThan(56);
  });

  it("pushes the player out of authored meadow blocker volumes", () => {
    const cedarCollider = MEADOW_COLLIDERS.find((collider) =>
      collider.id.includes("grove-cedar"),
    );

    expect(cedarCollider).toBeTruthy();

    const resolved = resolvePlanarMeadowCollisions(
      cedarCollider!.center,
      MEADOW_PLAYER_COLLIDER_RADIUS,
    );
    const dx = resolved[0] - cedarCollider!.center[0];
    const dz = resolved[1] - cedarCollider!.center[1];
    const distance = Math.hypot(dx, dz);

    expect(distance).toBeGreaterThanOrEqual(
      cedarCollider!.radius + MEADOW_PLAYER_COLLIDER_RADIUS - 0.01,
    );
  });

  it("leaves open meadow positions untouched when no blocker is nearby", () => {
    const point: [number, number] = [0, 66];
    const resolved = resolvePlanarMeadowCollisions(
      point,
      MEADOW_PLAYER_COLLIDER_RADIUS,
    );

    expect(resolved).toEqual(point);
  });

  it("shapes the lower hemisphere with authored rises and bowls without collapsing to flat lawn", () => {
    const southernBowl = getMeadowTerrainLift(12, -69);
    const leftSouthRidge = getMeadowTerrainLift(-72, -60);
    const centerSouthRise = getMeadowTerrainLift(15, -93);
    const deepSouthWest = getMeadowTerrainLift(-132, -147);
    const deepSouthEast = getMeadowTerrainLift(138, -150);
    const returnCourt = getMeadowTerrainLift(0, 72);

    expect(southernBowl).toBeLessThan(leftSouthRidge);
    expect(southernBowl).toBeLessThan(centerSouthRise);
    expect(leftSouthRidge).toBeGreaterThan(returnCourt + 0.8);
    expect(centerSouthRise).toBeGreaterThan(returnCourt + 0.7);
    expect(deepSouthWest).toBeGreaterThan(returnCourt + 0.3);
    expect(deepSouthEast).toBeGreaterThan(returnCourt + 0.3);
  });

  it("projects meadow surface points onto the deformed terrain radius", () => {
    const point = projectPlanarPointToMeadowSurface(42, -87, 0);
    const radius = point.distanceTo(MEADOW_PLANET_CENTER);

    expect(radius).toBeCloseTo(getMeadowSurfaceRadius(42, -87), 4);
  });

  it("round-trips deep-south meadow normals without collapsing at the equator", () => {
    [
      [0, -120],
      [0, -168],
      [66, -126],
      [-84, -108],
      [42, -168],
    ].forEach(([x, z]) => {
      const normal = projectPlanarPointToMeadowRadialNormal(x, z);
      const planar = getPlanarFromMeadowNormal(normal);

      expect(planar.x).toBeCloseTo(x, 4);
      expect(planar.z).toBeCloseTo(z, 4);
    });
  });

  it("keeps core southern authored content inside the reachable lower arc", () => {
    const southPoleBudget = (Math.PI / 2) * MEADOW_PLANET_RADIUS - 3;
    const authoredSouthAnchors = [
      ...MEADOW_LANDMARKS.filter(
        (landmark) => landmark.coreVisual && landmark.anchor.planar[1] < 0,
      ).map((landmark) => landmark.anchor.planar),
      ...MEADOW_SKYLINE_LANDMARKS.filter(
        (landmark) => landmark.coreVisual && landmark.anchor.planar[1] < 0,
      ).map((landmark) => landmark.anchor.planar),
      ...MEADOW_SKYLINE_RIDGES.filter(
        (ridge) => ridge.coreVisual && ridge.anchor.planar[1] < 0,
      ).map((ridge) => ridge.anchor.planar),
      ...MEADOW_TREE_LAYOUT.filter(
        (tree) => tree.landmark && tree.anchor.planar[1] < 0,
      ).map((tree) => tree.anchor.planar),
      ...MEADOW_MONOLITHS.filter(
        (monolith) => monolith.coreVisual && monolith.anchor.planar[1] < 0,
      ).map((monolith) => monolith.anchor.planar),
    ];

    expect(authoredSouthAnchors.length).toBeGreaterThan(20);
    authoredSouthAnchors.forEach(([, z]) => {
      expect(Math.abs(z)).toBeLessThanOrEqual(southPoleBudget);
    });
  });

  it("keeps deep outer-ring surface samples grounded on the reshaped globe", () => {
    [
      [-126, -84],
      [0, -174],
      [132, -105],
    ].forEach(([x, z]) => {
      const point = projectPlanarPointToMeadowSurface(x, z, 0);
      const radius = point.distanceTo(MEADOW_PLANET_CENTER);

      expect(radius).toBeCloseTo(getMeadowSurfaceRadius(x, z), 4);
    });
  });

  it("keeps major southern authored anchors flagged for low-tier preservation", () => {
    expect(
      [
        "campana-del-sud",
        "orto-sommerso",
        "casa-del-sole-basso",
        "obelisco-di-sotto",
        "faro-del-sud-profondo",
        "sole-del-fondo",
        "arco-dell-orlo-profondo",
      ].every(
        (id) => MEADOW_LANDMARKS.find((landmark) => landmark.id === id)?.coreVisual,
      ),
    ).toBe(true);

    expect(
      [
        "grove-south-needle",
        "orchard-spire",
        "low-sun-marker",
        "rim-south-observer",
        "deep-south-west-spine",
        "deep-south-meridian-spire",
        "deep-south-east-spine",
      ].every(
        (id) => MEADOW_MONOLITHS.find((monolith) => monolith.id === id)?.coreVisual,
      ),
    ).toBe(true);
  });

  it("preserves the outer skyline ring on medium and low quality tiers", () => {
    expect(MEADOW_SKYLINE_LANDMARKS.length).toBeGreaterThanOrEqual(18);

    const mediumIds = new Set(
      getMeadowSkylineLandmarksForQuality("medium").map((landmark) => landmark.id),
    );
    const lowIds = new Set(
      getMeadowSkylineLandmarksForQuality("low").map((landmark) => landmark.id),
    );

    [
      "skyline-west-ridge",
      "skyline-southwest-spine",
      "skyline-south-meridian-crown",
      "skyline-south-near-meridian",
      "skyline-south-sun-beacon",
      "skyline-south-inner-east-crown",
      "skyline-southeast-spine",
      "skyline-east-lower-crown",
      "skyline-east-rim-crown",
      "skyline-west-lower-crown",
    ].forEach((id) => {
      expect(mediumIds.has(id)).toBe(true);
      expect(lowIds.has(id)).toBe(true);
    });
  });

  it("keeps the skyline ridge band alive on medium and low quality tiers", () => {
    expect(MEADOW_SKYLINE_RIDGES.length).toBeGreaterThanOrEqual(13);

    const mediumIds = new Set(
      getMeadowSkylineRidgesForQuality("medium").map((ridge) => ridge.id),
    );
    const lowIds = new Set(
      getMeadowSkylineRidgesForQuality("low").map((ridge) => ridge.id),
    );

    [
      "ridge-west-basin",
      "ridge-west-lower-step",
      "ridge-southwest-bowl",
      "ridge-southwest-inner",
      "ridge-south-meridian",
      "ridge-south-inner-ring",
      "ridge-southeast-shelf",
      "ridge-southeast-inner",
      "ridge-east-lower-step",
      "ridge-east-rim",
    ].forEach((id) => {
      expect(mediumIds.has(id)).toBe(true);
      expect(lowIds.has(id)).toBe(true);
    });
  });

  it("keeps authored deposit sites grounded above the reshaped terrain", () => {
    const lowSunHouseSite = MEADOW_DEPOSIT_SITES.find(
      (site) => site.id === "radura-centrale",
    );

    expect(lowSunHouseSite).toBeTruthy();
    expect(
      pointDistanceFromCenter(lowSunHouseSite!.position),
    ).toBeGreaterThan(
      getMeadowSurfaceRadius(
        lowSunHouseSite!.planar[0],
        lowSunHouseSite!.planar[1],
      ),
    );
  });

  it("resolves meadow ambience into continuous base layers plus one sector accent", () => {
    const mix = resolveAmbientMix({
      zone: "meadow",
      sector: "whisper_grove",
      nearbyTriggerId: null,
      nearbyDepositId: null,
    });

    expect(mix.layerGains.wind).toBeGreaterThan(0);
    expect(mix.layerGains.birds).toBeGreaterThan(0);
    expect(mix.layerGains.grass).toBeGreaterThan(0);
    expect(mix.layerGains.whisper_grove_accent).toBeGreaterThan(0);
    expect(mix.layerGains.return_court_accent).toBe(0);
    expect(
      getActiveAmbientCues(mix, {
        muted: false,
        volume: 1,
      }),
    ).toEqual(
      expect.arrayContaining([
        "wind",
        "birds",
        "grass",
        "whisper_grove_accent",
      ]),
    );
  });

  it("keeps gallery ambience isolated from meadow layers", () => {
    const mix = resolveAmbientMix({
      zone: "gallery",
      sector: "shrine_basin",
      nearbyTriggerId: "return",
      nearbyDepositId: "soglia-casa-muta",
    });

    expect(mix.layerGains.gallery_hush).toBeGreaterThan(0);
    expect(mix.layerGains.wind).toBe(0);
    expect(mix.layerGains.birds).toBe(0);
    expect(mix.layerGains.grass).toBe(0);
    expect(mix.oneShotPool).toEqual([]);
  });

  it("boosts the active sector accent near return and deposit interactions", () => {
    const returnBase = resolveAmbientMix({
      zone: "meadow",
      sector: "return_court",
      nearbyTriggerId: null,
      nearbyDepositId: null,
    });
    const returnBoosted = resolveAmbientMix({
      zone: "meadow",
      sector: "return_court",
      nearbyTriggerId: "return",
      nearbyDepositId: null,
    });
    const shrineBase = resolveAmbientMix({
      zone: "meadow",
      sector: "shrine_basin",
      nearbyTriggerId: null,
      nearbyDepositId: null,
    });
    const shrineBoosted = resolveAmbientMix({
      zone: "meadow",
      sector: "shrine_basin",
      nearbyTriggerId: null,
      nearbyDepositId: "radura-ovest",
    });

    expect(returnBoosted.layerGains.return_court_accent).toBeGreaterThan(
      returnBase.layerGains.return_court_accent,
    );
    expect(shrineBoosted.layerGains.shrine_basin_accent).toBeGreaterThan(
      shrineBase.layerGains.shrine_basin_accent,
    );
  });

  it("reduces one-shot density on the safest mobile profile and gates hidden tabs", () => {
    expect(resolveOneShotDensityScale("mobile_safe")).toBeLessThan(
      resolveOneShotDensityScale("desktop_showcase"),
    );

    expect(
      canScheduleAmbientOneShots({
        enabled: true,
        zone: "meadow",
        muted: false,
        volume: 0.6,
        visibilityState: "visible",
      }),
    ).toBe(true);
    expect(
      canScheduleAmbientOneShots({
        enabled: true,
        zone: "meadow",
        muted: false,
        volume: 0.6,
        visibilityState: "hidden",
      }),
    ).toBe(false);
    expect(
      canScheduleAmbientOneShots({
        enabled: true,
        zone: "meadow",
        muted: true,
        volume: 0.6,
        visibilityState: "visible",
      }),
    ).toBe(false);
  });

  it("resolves explicit portal transition cues for zone crossings", () => {
    expect(resolveAmbientTransitionCue("gallery", "meadow")).toBe("portal_hit_out");
    expect(resolveAmbientTransitionCue("meadow", "gallery")).toBe("portal_hit_in");
    expect(resolveAmbientTransitionCue("gallery", "gallery")).toBeNull();
  });

  it("ships long-form gallery music assets instead of tiny generated loops", () => {
    const cwd = process.cwd();

    GALLERY_MUSIC_ASSETS.forEach((track) => {
      const absolutePath = path.resolve(
        cwd,
        "public",
        track.path.replace(/^\/audio\//, "audio/"),
      );

      expect(existsSync(absolutePath)).toBe(true);

      const duration = Number(
        execFileSync(
          "ffprobe",
          [
            "-v",
            "error",
            "-show_entries",
            "format=duration",
            "-of",
            "default=nk=1:nw=1",
            absolutePath,
          ],
          { encoding: "utf8" },
        ).trim(),
      );

      expect(duration).toBeGreaterThanOrEqual(track.minDurationSeconds);
    });
  });
});
