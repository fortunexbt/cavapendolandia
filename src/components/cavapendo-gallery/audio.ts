import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { type WorldZone } from "@/components/cavapendo-gallery/runtime";
import {
  type AmbientStateSnapshot,
  type DepositSite,
  type DoorTrigger,
} from "@/components/cavapendo-gallery/types";
import { type MeadowSector, type AmbientAudioCue } from "@/lib/meadowWorld";

export function useAmbientAudio({
  enabled,
  zone,
  sector,
  nearbyTriggerId,
  nearbyDepositId,
  volume,
  muted,
}: {
  enabled: boolean;
  zone: WorldZone;
  sector: MeadowSector | null;
  nearbyTriggerId: DoorTrigger["id"] | null;
  nearbyDepositId: DepositSite["id"] | null;
  volume: number;
  muted: boolean;
}) {
  const audioRefs = useRef<Record<string, HTMLAudioElement>>(
    {} as Record<string, HTMLAudioElement>,
  );
  const [state, setState] = useState<AmbientStateSnapshot>({
    activeCues: [],
    muted,
    volume,
    zone,
  });

  useEffect(() => {
    const loops = {
      gallery_hush: new Audio("/audio/cavapendolandia/gallery-hush.wav"),
      meadow_wind: new Audio("/audio/cavapendolandia/meadow-wind.wav"),
      shrine_hum: new Audio("/audio/cavapendolandia/shrine-hum.wav"),
      return_hum: new Audio("/audio/cavapendolandia/return-hum.wav"),
    };

    Object.values(loops).forEach((audio) => {
      audio.loop = true;
      audio.preload = "auto";
      audio.volume = 0;
    });

    audioRefs.current = loops;

    return () => {
      Object.values(loops).forEach((audio) => {
        audio.pause();
        audio.src = "";
      });
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const ensurePlaying = (audio: HTMLAudioElement) => {
      if (audio.paused) {
        audio.play().catch(() => undefined);
      }
    };

    const intervalId = window.setInterval(() => {
      const targetVolumes: Record<string, number> = {
        gallery_hush: zone === "gallery" ? volume * 0.28 : 0,
        meadow_wind: zone === "meadow" ? volume * 0.44 : 0,
        shrine_hum:
          zone === "meadow"
            ? volume *
              (nearbyDepositId ? 0.34 : sector === "shrine_basin" ? 0.12 : 0.06)
            : 0,
        return_hum:
          zone === "meadow"
            ? volume *
              (nearbyTriggerId === "return"
                ? 0.3
                : sector === "return_court"
                  ? 0.1
                  : 0)
            : 0,
      };

      const activeCues = (
        Object.entries(targetVolumes) as Array<[AmbientAudioCue, number]>
      )
        .filter(([, cueVolume]) => !muted && cueVolume > 0.035)
        .map(([cue]) => cue);

      Object.entries(audioRefs.current).forEach(([key, audio]) => {
        ensurePlaying(audio);
        const target = muted ? 0 : targetVolumes[key] || 0;
        audio.volume = THREE.MathUtils.lerp(audio.volume, target, 0.22);
      });

      setState({
        activeCues,
        muted,
        volume,
        zone,
      });
    }, 120);

    return () => window.clearInterval(intervalId);
  }, [enabled, muted, nearbyDepositId, nearbyTriggerId, sector, volume, zone]);

  useEffect(() => {
    if (!enabled || zone !== "meadow" || muted || volume < 0.05) return;

    let cancelled = false;
    let timeoutId = 0;

    const schedule = () => {
      timeoutId = window.setTimeout(
        () => {
          if (cancelled) return;
          const call = new Audio("/audio/cavapendolandia/creature-call.wav");
          call.volume = volume * (sector === "whisper_grove" ? 0.26 : 0.18);
          call.play().catch(() => undefined);
          schedule();
        },
        6500 + Math.random() * 5500,
      );
    };

    schedule();

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [enabled, muted, sector, volume, zone]);

  useEffect(() => {
    if (enabled) return;
    setState({
      activeCues: [],
      muted,
      volume,
      zone,
    });
  }, [enabled, muted, volume, zone]);

  return state;
}
