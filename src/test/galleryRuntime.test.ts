import { describe, expect, it } from "vitest";
import {
  getControlProfile,
  getRenderProfileSource,
  readViewportMetrics,
  resolveRenderProfileId,
} from "@/components/cavapendo-gallery/runtime";

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
});
