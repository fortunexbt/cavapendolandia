import { useEffect, useRef, useState } from "react";
import {
  type RenderProfile,
  type WorldZone,
} from "@/components/cavapendo-gallery/runtime";
import {
  type AmbientTransitionCue,
  type AmbientStateSnapshot,
  type DepositSite,
  type DoorTrigger,
} from "@/components/cavapendo-gallery/types";
import { type MeadowSector, type AmbientAudioCue } from "@/lib/meadowWorld";

type MeadowAccentCue =
  | "return_court_accent"
  | "lantern_ridge_accent"
  | "whisper_grove_accent"
  | "shrine_basin_accent"
  | "far_rim_accent";

type MeadowOneShotCue =
  | "bird_call"
  | "gust"
  | "grass_rustle"
  | "wood_creak"
  | "wing_flutter";

export type GalleryMusicTrackId =
  | "direct_to_video"
  | "what_does_anybody_know";

type ContinuousLayerId = "gallery_hush" | "wind" | "birds" | "grass" | MeadowAccentCue;

type AudioContextWindow = Window & {
  webkitAudioContext?: typeof AudioContext;
};

type OneShotReporter = (cue: MeadowOneShotCue) => void;
type GalleryTrackReporter = (trackId: GalleryMusicTrackId | null) => void;

export interface AmbientMix {
  zone: WorldZone;
  layerGains: Record<ContinuousLayerId, number>;
  oneShotPool: MeadowOneShotCue[];
}

interface AmbientEngineUpdate {
  mix: AmbientMix;
  volume: number;
  muted: boolean;
  oneShotEnabled: boolean;
  oneShotDensityScale: number;
}

interface AmbientEngine {
  resume(): void;
  update(config: AmbientEngineUpdate): void;
  playTransitionCue(cue: AmbientTransitionCue, volume: number): void;
  hardStopZone(zone: WorldZone): void;
  stopAll(): void;
  destroy(): void;
}

const GALLERY_MUSIC_TRACKS = [
  {
    id: "direct_to_video",
    path: "/audio/cavapendolandia/gallery/interior-direct-to-video.ogg",
    minDurationSeconds: 240,
  },
  {
    id: "what_does_anybody_know",
    path: "/audio/cavapendolandia/gallery/interior-what-does-anybody-know.ogg",
    minDurationSeconds: 240,
  },
] as const satisfies ReadonlyArray<{
  id: GalleryMusicTrackId;
  path: string;
  minDurationSeconds: number;
}>;

export const GALLERY_MUSIC_ASSETS = GALLERY_MUSIC_TRACKS;

const GALLERY_TRACK_ID_BY_PATH = GALLERY_MUSIC_TRACKS.reduce(
  (accumulator, track) => {
    accumulator[track.path] = track.id;
    return accumulator;
  },
  {} as Record<string, GalleryMusicTrackId>,
);

const CONTINUOUS_LAYER_PATHS: Record<ContinuousLayerId, string[]> = {
  gallery_hush: GALLERY_MUSIC_TRACKS.map((track) => track.path),
  wind: [
    "/audio/cavapendolandia/meadow/base/wind-bed-a.ogg",
    "/audio/cavapendolandia/meadow/base/wind-bed-b.ogg",
  ],
  birds: [
    "/audio/cavapendolandia/meadow/base/birds-bed-a.ogg",
    "/audio/cavapendolandia/meadow/base/birds-bed-b.ogg",
  ],
  grass: [
    "/audio/cavapendolandia/meadow/base/grass-bed-a.ogg",
    "/audio/cavapendolandia/meadow/base/grass-bed-b.ogg",
  ],
  return_court_accent: [
    "/audio/cavapendolandia/meadow/sectors/return-court-accent.ogg",
  ],
  lantern_ridge_accent: [
    "/audio/cavapendolandia/meadow/sectors/lantern-ridge-accent.ogg",
  ],
  whisper_grove_accent: [
    "/audio/cavapendolandia/meadow/sectors/whisper-grove-accent.ogg",
  ],
  shrine_basin_accent: [
    "/audio/cavapendolandia/meadow/sectors/shrine-basin-accent.ogg",
  ],
  far_rim_accent: ["/audio/cavapendolandia/meadow/sectors/far-rim-accent.ogg"],
};

const ONE_SHOT_LAYER_PATHS: Record<MeadowOneShotCue, string[]> = {
  bird_call: [
    "/audio/cavapendolandia/meadow/oneshots/bird-call-01.ogg",
    "/audio/cavapendolandia/meadow/oneshots/bird-call-02.ogg",
  ],
  gust: [
    "/audio/cavapendolandia/meadow/oneshots/gust-01.ogg",
    "/audio/cavapendolandia/meadow/oneshots/gust-02.ogg",
  ],
  grass_rustle: [
    "/audio/cavapendolandia/meadow/oneshots/grass-rustle-01.ogg",
    "/audio/cavapendolandia/meadow/oneshots/grass-rustle-02.ogg",
  ],
  wood_creak: ["/audio/cavapendolandia/meadow/oneshots/wood-creak-01.ogg"],
  wing_flutter: ["/audio/cavapendolandia/meadow/oneshots/wing-flutter-01.ogg"],
};

const TRANSITION_CUE_PATHS: Record<AmbientTransitionCue, string[]> = {
  portal_hit_out: [
    "/audio/cavapendolandia/gallery/portal-hit-out.ogg",
  ],
  portal_hit_in: [
    "/audio/cavapendolandia/gallery/portal-hit-in.ogg",
  ],
};

export const MEADOW_AMBIENCE_AUDIO_PATHS = [
  ...new Set([
    ...Object.values(CONTINUOUS_LAYER_PATHS).flatMap((paths) => paths),
    ...Object.values(ONE_SHOT_LAYER_PATHS).flatMap((paths) => paths),
    ...Object.values(TRANSITION_CUE_PATHS).flatMap((paths) => paths),
  ]),
];

const EMPTY_LAYER_GAINS: Record<ContinuousLayerId, number> = {
  gallery_hush: 0,
  wind: 0,
  birds: 0,
  grass: 0,
  return_court_accent: 0,
  lantern_ridge_accent: 0,
  whisper_grove_accent: 0,
  shrine_basin_accent: 0,
  far_rim_accent: 0,
};

const SECTOR_ACCENT_CUE: Record<MeadowSector, MeadowAccentCue> = {
  return_court: "return_court_accent",
  lantern_ridge: "lantern_ridge_accent",
  whisper_grove: "whisper_grove_accent",
  shrine_basin: "shrine_basin_accent",
  far_rim: "far_rim_accent",
};

const SECTOR_BASE_MIX: Record<
  MeadowSector,
  {
    wind: number;
    birds: number;
    grass: number;
    accent: number;
    oneShots: MeadowOneShotCue[];
  }
> = {
  return_court: {
    wind: 0.22,
    birds: 0.16,
    grass: 0.1,
    accent: 0.05,
    oneShots: ["bird_call", "gust", "wood_creak"],
  },
  lantern_ridge: {
    wind: 0.24,
    birds: 0.18,
    grass: 0.1,
    accent: 0.06,
    oneShots: ["bird_call", "gust", "wing_flutter"],
  },
  whisper_grove: {
    wind: 0.2,
    birds: 0.22,
    grass: 0.12,
    accent: 0.08,
    oneShots: ["bird_call", "grass_rustle", "wood_creak", "wing_flutter"],
  },
  shrine_basin: {
    wind: 0.2,
    birds: 0.17,
    grass: 0.11,
    accent: 0.07,
    oneShots: ["bird_call", "gust", "grass_rustle"],
  },
  far_rim: {
    wind: 0.26,
    birds: 0.14,
    grass: 0.08,
    accent: 0.05,
    oneShots: ["gust", "bird_call", "wing_flutter"],
  },
};

const LAYER_STOP_THRESHOLD = 0.01;
const ACTIVE_CUE_THRESHOLD = 0.035;
const ONE_SHOT_REPORT_WINDOW_MS = 2600;
const TRANSITION_REPORT_WINDOW_MS = 2200;

export const resolveAmbientTransitionCue = (
  previousZone: WorldZone,
  nextZone: WorldZone,
): AmbientTransitionCue | null => {
  if (previousZone === nextZone) return null;
  return nextZone === "meadow" ? "portal_hit_out" : "portal_hit_in";
};

const uniqueCues = (cues: AmbientAudioCue[]) => Array.from(new Set(cues));

const randomItem = <T,>(items: T[], previous?: T | null) => {
  if (items.length <= 1) return items[0] || null;
  const eligible = previous ? items.filter((item) => item !== previous) : items;
  return eligible[Math.floor(Math.random() * eligible.length)] || items[0] || null;
};

const getAudioContextConstructor = () => {
  const audioWindow = window as AudioContextWindow;
  return window.AudioContext || audioWindow.webkitAudioContext || null;
};

export const resolveAmbientMix = ({
  zone,
  sector,
  nearbyTriggerId,
  nearbyDepositId,
}: {
  zone: WorldZone;
  sector: MeadowSector | null;
  nearbyTriggerId: DoorTrigger["id"] | null;
  nearbyDepositId: DepositSite["id"] | null;
}): AmbientMix => {
  const layerGains = { ...EMPTY_LAYER_GAINS };

  if (zone === "gallery") {
    layerGains.gallery_hush = 0.18;
    return {
      zone,
      layerGains,
      oneShotPool: [],
    };
  }

  const resolvedSector = sector || "return_court";
  const sectorBase = SECTOR_BASE_MIX[resolvedSector];
  layerGains.wind = sectorBase.wind;
  layerGains.birds = sectorBase.birds;
  layerGains.grass = sectorBase.grass;

  const accentCue = SECTOR_ACCENT_CUE[resolvedSector];
  let accentGain = sectorBase.accent;

  if (resolvedSector === "return_court" && nearbyTriggerId === "return") {
    accentGain += 0.05;
  }

  if (nearbyDepositId) {
    accentGain += resolvedSector === "shrine_basin" ? 0.06 : 0.04;
    layerGains.grass += 0.015;
  }

  layerGains[accentCue] = Math.min(accentGain, 0.16);

  return {
    zone,
    layerGains,
    oneShotPool: sectorBase.oneShots,
  };
};

export const getActiveAmbientCues = (
  mix: AmbientMix,
  {
    muted,
    volume,
    recentOneShots = [],
  }: {
    muted: boolean;
    volume: number;
    recentOneShots?: AmbientAudioCue[];
  },
) => {
  if (muted || volume <= 0.01) return [];

  const continuousCues = (
    Object.entries(mix.layerGains) as Array<[ContinuousLayerId, number]>
  )
    .filter(([, gain]) => gain * volume > ACTIVE_CUE_THRESHOLD)
    .map(([cue]) => cue as AmbientAudioCue);

  return uniqueCues([...continuousCues, ...recentOneShots]);
};

export const resolveOneShotDensityScale = (renderProfileId: RenderProfile) => {
  if (renderProfileId === "mobile_safe") return 0.55;
  if (renderProfileId === "mobile_balanced") return 0.8;
  if (renderProfileId === "desktop_balanced") return 0.92;
  return 1;
};

export const canScheduleAmbientOneShots = ({
  enabled,
  zone,
  muted,
  volume,
  visibilityState = document.visibilityState,
}: {
  enabled: boolean;
  zone: WorldZone;
  muted: boolean;
  volume: number;
  visibilityState?: DocumentVisibilityState;
}) =>
  enabled &&
  zone === "meadow" &&
  !muted &&
  volume > 0.03 &&
  visibilityState !== "hidden";

class AudioBufferCache {
  private readonly cache = new Map<string, Promise<AudioBuffer | null>>();

  constructor(private readonly context: AudioContext) {}

  load(url: string) {
    if (!this.cache.has(url)) {
      this.cache.set(
        url,
        fetch(url)
          .then((response) => {
            if (!response.ok) return null;
            return response.arrayBuffer();
          })
          .then((arrayBuffer) => {
            if (!arrayBuffer) return null;
            return this.context.decodeAudioData(arrayBuffer.slice(0));
          })
          .catch(() => null),
      );
    }

    return this.cache.get(url)!;
  }
}

class WebAudioLayerController {
  private readonly output: GainNode;
  private activeStems: Array<{ source: AudioBufferSourceNode; gain: GainNode }> = [];
  private nextStartTimer = 0;
  private stopTimer = 0;
  private targetGain = 0;
  private lastUrl: string | null = null;
  private destroyed = false;

  constructor(
    private readonly context: AudioContext,
    private readonly bufferCache: AudioBufferCache,
    private readonly urls: string[],
    destination: GainNode,
    private readonly onTrackChange?: (url: string | null) => void,
  ) {
    this.output = context.createGain();
    this.output.gain.value = 0;
    this.output.connect(destination);
  }

  private clearTimers() {
    if (this.nextStartTimer) {
      window.clearTimeout(this.nextStartTimer);
      this.nextStartTimer = 0;
    }
    if (this.stopTimer) {
      window.clearTimeout(this.stopTimer);
      this.stopTimer = 0;
    }
  }

  private async spawnStem() {
    if (this.destroyed || this.targetGain <= LAYER_STOP_THRESHOLD) return;

    const url = randomItem(this.urls, this.lastUrl);
    if (!url) return;

    const buffer = await this.bufferCache.load(url);
    if (!buffer || this.destroyed || this.targetGain <= LAYER_STOP_THRESHOLD) return;

    const now = this.context.currentTime;
    const stemGain = this.context.createGain();
    const source = this.context.createBufferSource();
    const maxOffset = buffer.duration > 28 ? Math.max(0, buffer.duration - 24) : 0;
    const startOffset = maxOffset > 0 ? Math.random() * maxOffset : 0;
    const remainingDuration = Math.max(8, buffer.duration - startOffset);
    const crossfadeSeconds = Math.min(5.2, Math.max(1.8, remainingDuration * 0.18));

    source.buffer = buffer;
    source.connect(stemGain).connect(this.output);
    stemGain.gain.setValueAtTime(0, now);
    stemGain.gain.linearRampToValueAtTime(1, now + Math.min(3.8, crossfadeSeconds));
    source.start(now, startOffset);

    const stem = { source, gain: stemGain };

    source.onended = () => {
      this.activeStems = this.activeStems.filter(
        (activeStem) => activeStem.source !== source,
      );
      try {
        source.disconnect();
        stemGain.disconnect();
      } catch {
        // ignore disconnect races during fast zone changes
      }
    };

    this.activeStems.forEach((activeStem) => {
      activeStem.gain.gain.cancelScheduledValues(now);
      activeStem.gain.gain.setValueAtTime(activeStem.gain.gain.value, now);
      activeStem.gain.gain.linearRampToValueAtTime(0, now + crossfadeSeconds);
      try {
        activeStem.source.stop(now + crossfadeSeconds + 0.15);
      } catch {
        // source may already be stopping
      }
    });
    this.activeStems = [stem];
    this.lastUrl = url;
    this.onTrackChange?.(url);

    this.clearTimers();
    this.nextStartTimer = window.setTimeout(
      () => {
        void this.spawnStem();
      },
      Math.max(4, remainingDuration - crossfadeSeconds) * 1000,
    );
  }

  setTargetGain(nextGain: number) {
    if (this.destroyed) return;

    this.targetGain = nextGain;
    const now = this.context.currentTime;
    this.output.gain.cancelScheduledValues(now);
    this.output.gain.setValueAtTime(this.output.gain.value, now);
    this.output.gain.linearRampToValueAtTime(nextGain, now + 1.1);

    if (nextGain > LAYER_STOP_THRESHOLD) {
      if (!this.activeStems.length) {
        void this.spawnStem();
      }
      return;
    }

    this.clearTimers();
    this.stopTimer = window.setTimeout(() => {
      this.stopNow();
    }, 1200);
  }

  stopNow() {
    if (this.destroyed) return;

    this.clearTimers();
    const now = this.context.currentTime;
    this.output.gain.cancelScheduledValues(now);
    this.output.gain.setValueAtTime(0, now);
    this.activeStems.forEach((stem) => {
      try {
        stem.source.stop(now);
      } catch {
        // source already ended
      }
    });
    this.activeStems = [];
    this.onTrackChange?.(null);
  }

  destroy() {
    this.destroyed = true;
    this.stopNow();
    try {
      this.output.disconnect();
    } catch {
      // ignore duplicate disconnects on teardown
    }
  }
}

class WebAudioOneShotController {
  private readonly output: GainNode;
  private readonly activeSources = new Set<AudioBufferSourceNode>();
  private nextTimer = 0;
  private destroyed = false;
  private enabled = false;
  private volume = 0;
  private densityScale = 1;
  private pool: MeadowOneShotCue[] = [];

  constructor(
    private readonly context: AudioContext,
    private readonly bufferCache: AudioBufferCache,
    destination: GainNode,
    private readonly onTrigger: OneShotReporter,
  ) {
    this.output = context.createGain();
    this.output.gain.value = 0;
    this.output.connect(destination);
  }

  private clearTimer() {
    if (this.nextTimer) {
      window.clearTimeout(this.nextTimer);
      this.nextTimer = 0;
    }
  }

  private scheduleNext() {
    this.clearTimer();
    if (!this.enabled || this.destroyed || !this.pool.length) return;

    const baseDelay = 7200 + Math.random() * 8200;
    const delay = baseDelay / Math.max(0.4, this.densityScale);
    this.nextTimer = window.setTimeout(() => {
      void this.triggerRandomCue();
    }, delay);
  }

  private async triggerRandomCue() {
    if (!this.enabled || this.destroyed || !this.pool.length) return;

    const cue = randomItem(this.pool);
    if (!cue) return;
    const url = randomItem(ONE_SHOT_LAYER_PATHS[cue]);
    if (!url) return;

    const buffer = await this.bufferCache.load(url);
    if (!buffer || !this.enabled || this.destroyed) return;

    const now = this.context.currentTime;
    const source = this.context.createBufferSource();
    const gain = this.context.createGain();
    const cueGain =
      cue === "bird_call"
        ? 0.16
        : cue === "gust"
          ? 0.13
          : cue === "grass_rustle"
            ? 0.1
            : cue === "wood_creak"
              ? 0.08
              : 0.11;

    source.buffer = buffer;
    source.connect(gain).connect(this.output);
    gain.gain.setValueAtTime(cueGain * this.volume, now);
    source.start(now);

    source.onended = () => {
      this.activeSources.delete(source);
      try {
        source.disconnect();
      } catch {
        // ignore teardown races
      }
    };

    this.activeSources.add(source);
    this.onTrigger(cue);
    this.scheduleNext();
  }

  update({
    enabled,
    volume,
    densityScale,
    pool,
  }: {
    enabled: boolean;
    volume: number;
    densityScale: number;
    pool: MeadowOneShotCue[];
  }) {
    this.enabled = enabled;
    this.volume = volume;
    this.densityScale = densityScale;
    this.pool = pool;
    this.output.gain.value = enabled ? 1 : 0;

    if (enabled) {
      if (!this.nextTimer) this.scheduleNext();
      return;
    }

    this.clearTimer();
  }

  stopNow() {
    this.clearTimer();
    const now = this.context.currentTime;
    this.output.gain.cancelScheduledValues(now);
    this.output.gain.setValueAtTime(0, now);
    this.activeSources.forEach((source) => {
      try {
        source.stop(now);
      } catch {
        // source already ended
      }
    });
    this.activeSources.clear();
  }

  destroy() {
    this.destroyed = true;
    this.stopNow();
    try {
      this.output.disconnect();
    } catch {
      // ignore duplicate disconnects
    }
  }
}

class WebAudioAmbientEngine implements AmbientEngine {
  private readonly context: AudioContext;
  private readonly masterGain: GainNode;
  private readonly bufferCache: AudioBufferCache;
  private readonly layers: Record<ContinuousLayerId, WebAudioLayerController>;
  private readonly oneShots: WebAudioOneShotController;

  constructor(
    onTrigger: OneShotReporter,
    onGalleryTrackChange: GalleryTrackReporter,
    AudioContextCtor: typeof AudioContext,
  ) {
    this.context = new AudioContextCtor();
    this.masterGain = this.context.createGain();
    this.masterGain.gain.value = 0;
    this.masterGain.connect(this.context.destination);
    this.bufferCache = new AudioBufferCache(this.context);

    this.layers = {
      gallery_hush: new WebAudioLayerController(
        this.context,
        this.bufferCache,
        CONTINUOUS_LAYER_PATHS.gallery_hush,
        this.masterGain,
        (url) => {
          onGalleryTrackChange(url ? GALLERY_TRACK_ID_BY_PATH[url] || null : null);
        },
      ),
      wind: new WebAudioLayerController(
        this.context,
        this.bufferCache,
        CONTINUOUS_LAYER_PATHS.wind,
        this.masterGain,
      ),
      birds: new WebAudioLayerController(
        this.context,
        this.bufferCache,
        CONTINUOUS_LAYER_PATHS.birds,
        this.masterGain,
      ),
      grass: new WebAudioLayerController(
        this.context,
        this.bufferCache,
        CONTINUOUS_LAYER_PATHS.grass,
        this.masterGain,
      ),
      return_court_accent: new WebAudioLayerController(
        this.context,
        this.bufferCache,
        CONTINUOUS_LAYER_PATHS.return_court_accent,
        this.masterGain,
      ),
      lantern_ridge_accent: new WebAudioLayerController(
        this.context,
        this.bufferCache,
        CONTINUOUS_LAYER_PATHS.lantern_ridge_accent,
        this.masterGain,
      ),
      whisper_grove_accent: new WebAudioLayerController(
        this.context,
        this.bufferCache,
        CONTINUOUS_LAYER_PATHS.whisper_grove_accent,
        this.masterGain,
      ),
      shrine_basin_accent: new WebAudioLayerController(
        this.context,
        this.bufferCache,
        CONTINUOUS_LAYER_PATHS.shrine_basin_accent,
        this.masterGain,
      ),
      far_rim_accent: new WebAudioLayerController(
        this.context,
        this.bufferCache,
        CONTINUOUS_LAYER_PATHS.far_rim_accent,
        this.masterGain,
      ),
    };

    this.oneShots = new WebAudioOneShotController(
      this.context,
      this.bufferCache,
      this.masterGain,
      onTrigger,
    );
  }

  resume() {
    if (this.context.state === "suspended") {
      void this.context.resume().catch(() => undefined);
    }
  }

  playTransitionCue(cue: AmbientTransitionCue, volume: number) {
    const url = randomItem(TRANSITION_CUE_PATHS[cue]);
    if (!url) return;

    void this.bufferCache.load(url).then((buffer) => {
      if (!buffer) return;
      const now = this.context.currentTime;
      const source = this.context.createBufferSource();
      const gain = this.context.createGain();
      const cueGain = cue === "portal_hit_out" ? 0.42 : 0.36;

      source.buffer = buffer;
      source.connect(gain).connect(this.masterGain);
      gain.gain.setValueAtTime(cueGain * Math.max(0.18, volume), now);
      source.start(now);
      source.onended = () => {
        try {
          source.disconnect();
          gain.disconnect();
        } catch {
          // ignore disconnect races during teardown
        }
      };
    });
  }

  update({ mix, volume, muted, oneShotEnabled, oneShotDensityScale }: AmbientEngineUpdate) {
    const masterTarget = muted ? 0 : volume;
    const now = this.context.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
    this.masterGain.gain.linearRampToValueAtTime(masterTarget, now + 0.6);

    (
      Object.entries(this.layers) as Array<
        [ContinuousLayerId, WebAudioLayerController]
      >
    ).forEach(([layerId, layer]) => {
      const target = muted ? 0 : mix.layerGains[layerId];
      layer.setTargetGain(target);
    });

    this.oneShots.update({
      enabled: oneShotEnabled && !muted,
      volume,
      densityScale: oneShotDensityScale,
      pool: mix.oneShotPool,
    });
  }

  hardStopZone(zone: WorldZone) {
    if (zone === "gallery") {
      this.layers.gallery_hush.stopNow();
      return;
    }

    this.layers.wind.stopNow();
    this.layers.birds.stopNow();
    this.layers.grass.stopNow();
    this.layers.return_court_accent.stopNow();
    this.layers.lantern_ridge_accent.stopNow();
    this.layers.whisper_grove_accent.stopNow();
    this.layers.shrine_basin_accent.stopNow();
    this.layers.far_rim_accent.stopNow();
    this.oneShots.stopNow();
  }

  stopAll() {
    this.hardStopZone("gallery");
    this.hardStopZone("meadow");
    const now = this.context.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(0, now);
  }

  destroy() {
    this.stopAll();
    Object.values(this.layers).forEach((layer) => layer.destroy());
    this.oneShots.destroy();
    void this.context.close().catch(() => undefined);
  }
}

class HtmlAmbientEngine implements AmbientEngine {
  private readonly loops: Record<ContinuousLayerId, HTMLAudioElement>;
  private readonly activeOneShots = new Set<HTMLAudioElement>();
  private readonly loopUrls = {} as Record<ContinuousLayerId, string>;
  private oneShotTimer = 0;
  private oneShotPool: MeadowOneShotCue[] = [];
  private oneShotEnabled = false;
  private volume = 0;
  private densityScale = 1;

  constructor(
    private readonly onTrigger: OneShotReporter,
    private readonly onGalleryTrackChange: GalleryTrackReporter,
  ) {
    this.loops = (
      Object.entries(CONTINUOUS_LAYER_PATHS) as Array<[ContinuousLayerId, string[]]>
    ).reduce(
      (accumulator, [layerId, urls]) => {
        const audio = new Audio(urls[0]);
        audio.loop = true;
        audio.preload = "auto";
        audio.volume = 0;
        accumulator[layerId] = audio;
        this.loopUrls[layerId] = urls[0];
        return accumulator;
      },
      {} as Record<ContinuousLayerId, HTMLAudioElement>,
    );
  }

  private clearOneShotTimer() {
    if (this.oneShotTimer) {
      window.clearTimeout(this.oneShotTimer);
      this.oneShotTimer = 0;
    }
  }

  private scheduleOneShot() {
    this.clearOneShotTimer();
    if (!this.oneShotEnabled || !this.oneShotPool.length) return;

    const delay = (7200 + Math.random() * 8200) / Math.max(0.4, this.densityScale);
    this.oneShotTimer = window.setTimeout(() => {
      const cue = randomItem(this.oneShotPool);
      if (!cue || !this.oneShotEnabled) return;
      const url = randomItem(ONE_SHOT_LAYER_PATHS[cue]);
      if (!url) return;

      const audio = new Audio(url);
      audio.volume = this.volume * 0.12;
      audio.play().catch(() => undefined);
      audio.onended = () => {
        this.activeOneShots.delete(audio);
      };
      this.activeOneShots.add(audio);
      this.onTrigger(cue);
      this.scheduleOneShot();
    }, delay);
  }

  resume() {
    // HTMLAudioElement playback resumes lazily on demand.
  }

  playTransitionCue(cue: AmbientTransitionCue, volume: number) {
    const url = randomItem(TRANSITION_CUE_PATHS[cue]);
    if (!url) return;

    const audio = new Audio(url);
    audio.volume = Math.max(0.12, volume) * (cue === "portal_hit_out" ? 0.38 : 0.32);
    audio.play().catch(() => undefined);
  }

  update({ mix, volume, muted, oneShotEnabled, oneShotDensityScale }: AmbientEngineUpdate) {
    this.volume = muted ? 0 : volume;
    this.oneShotEnabled = oneShotEnabled && !muted;
    this.oneShotPool = mix.oneShotPool;
    this.densityScale = oneShotDensityScale;

    (
      Object.entries(this.loops) as Array<[ContinuousLayerId, HTMLAudioElement]>
    ).forEach(([layerId, audio]) => {
      const target = muted ? 0 : mix.layerGains[layerId] * volume;
      audio.volume = target;
      if (target > LAYER_STOP_THRESHOLD) {
        if (audio.paused) {
          const nextUrl = randomItem(
            CONTINUOUS_LAYER_PATHS[layerId],
            this.loopUrls[layerId],
          );
          if (nextUrl && nextUrl !== this.loopUrls[layerId]) {
            audio.src = nextUrl;
            audio.load();
            this.loopUrls[layerId] = nextUrl;
          }
          audio.play().catch(() => undefined);
        }
        if (layerId === "gallery_hush") {
          this.onGalleryTrackChange(
            GALLERY_TRACK_ID_BY_PATH[this.loopUrls.gallery_hush] || null,
          );
        }
        return;
      }

      audio.pause();
      audio.currentTime = 0;
      if (layerId === "gallery_hush") {
        this.onGalleryTrackChange(null);
      }
    });

    if (this.oneShotEnabled) {
      if (!this.oneShotTimer) this.scheduleOneShot();
    } else {
      this.clearOneShotTimer();
      this.activeOneShots.forEach((audio) => {
        audio.pause();
        audio.currentTime = 0;
      });
      this.activeOneShots.clear();
    }
  }

  hardStopZone(zone: WorldZone) {
    const stopLayer = (layerId: ContinuousLayerId) => {
      const audio = this.loops[layerId];
      audio.pause();
      audio.currentTime = 0;
      audio.volume = 0;
      if (layerId === "gallery_hush") {
        this.onGalleryTrackChange(null);
      }
    };

    if (zone === "gallery") {
      stopLayer("gallery_hush");
      return;
    }

    stopLayer("wind");
    stopLayer("birds");
    stopLayer("grass");
    stopLayer("return_court_accent");
    stopLayer("lantern_ridge_accent");
    stopLayer("whisper_grove_accent");
    stopLayer("shrine_basin_accent");
    stopLayer("far_rim_accent");
    this.activeOneShots.forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
    });
    this.activeOneShots.clear();
    this.clearOneShotTimer();
  }

  stopAll() {
    this.hardStopZone("gallery");
    this.hardStopZone("meadow");
  }

  destroy() {
    this.stopAll();
    Object.values(this.loops).forEach((audio) => {
      audio.pause();
      audio.src = "";
    });
    this.onGalleryTrackChange(null);
  }
}

const createAmbientEngine = (
  onTrigger: OneShotReporter,
  onGalleryTrackChange: GalleryTrackReporter,
): AmbientEngine => {
  const AudioContextCtor = getAudioContextConstructor();
  if (AudioContextCtor) {
    try {
      return new WebAudioAmbientEngine(
        onTrigger,
        onGalleryTrackChange,
        AudioContextCtor,
      );
    } catch {
      // fall through to a simpler HTMLAudioElement-based engine
    }
  }

  return new HtmlAmbientEngine(onTrigger, onGalleryTrackChange);
};

export function useAmbientAudio({
  enabled,
  zone,
  sector,
  nearbyTriggerId,
  nearbyDepositId,
  volume,
  muted,
  renderProfileId,
}: {
  enabled: boolean;
  zone: WorldZone;
  sector: MeadowSector | null;
  nearbyTriggerId: DoorTrigger["id"] | null;
  nearbyDepositId: DepositSite["id"] | null;
  volume: number;
  muted: boolean;
  renderProfileId: RenderProfile;
}) {
  const engineRef = useRef<AmbientEngine | null>(null);
  const mixRef = useRef<AmbientMix>(
    resolveAmbientMix({
      zone,
      sector,
      nearbyTriggerId,
      nearbyDepositId,
    }),
  );
  const recentOneShotsRef = useRef<Record<MeadowOneShotCue, number>>({
    bird_call: 0,
    gust: 0,
    grass_rustle: 0,
    wood_creak: 0,
    wing_flutter: 0,
  });
  const paramsRef = useRef({
    enabled,
    zone,
    volume,
    muted,
  });
  const galleryTrackRef = useRef<GalleryMusicTrackId | null>(null);
  const transitionRef = useRef<{
    cue: AmbientTransitionCue | null;
    expiresAt: number;
  }>({
    cue: null,
    expiresAt: 0,
  });
  const zoneStopTimerRef = useRef(0);
  const previousZoneRef = useRef(zone);
  const syncStateRef = useRef<() => void>(() => undefined);
  const [visibilityState, setVisibilityState] = useState<DocumentVisibilityState>(
    () => document.visibilityState,
  );
  const [state, setState] = useState<AmbientStateSnapshot>({
    activeCues: [],
    muted,
    volume,
    zone,
    galleryTrack: null,
    transition: {
      cue: null,
      active: false,
    },
  });

  paramsRef.current = {
    enabled,
    zone,
    volume,
    muted,
  };

  syncStateRef.current = () => {
    const now = performance.now();
    const recentOneShots = (
      Object.entries(recentOneShotsRef.current) as Array<[MeadowOneShotCue, number]>
    )
      .filter(([, expiresAt]) => expiresAt > now)
      .map(([cue]) => cue);
    const transitionActive =
      transitionRef.current.cue !== null && transitionRef.current.expiresAt > now;
    const transitionCue = transitionActive ? transitionRef.current.cue : null;

    setState({
      activeCues: paramsRef.current.enabled
        ? getActiveAmbientCues(mixRef.current, {
            muted: paramsRef.current.muted,
            volume: paramsRef.current.volume,
            recentOneShots: transitionCue
              ? [...recentOneShots, transitionCue]
              : recentOneShots,
          })
        : [],
      muted: paramsRef.current.muted,
      volume: paramsRef.current.volume,
      zone: paramsRef.current.zone,
      galleryTrack: galleryTrackRef.current,
      transition: {
        cue: transitionCue,
        active: transitionActive,
      },
    });
  };

  useEffect(() => {
    const engine = createAmbientEngine(
      (cue) => {
        recentOneShotsRef.current[cue] = performance.now() + ONE_SHOT_REPORT_WINDOW_MS;
        syncStateRef.current();
      },
      (trackId) => {
        galleryTrackRef.current = trackId;
        syncStateRef.current();
      },
    );

    engineRef.current = engine;
    return () => {
      if (zoneStopTimerRef.current) {
        window.clearTimeout(zoneStopTimerRef.current);
        zoneStopTimerRef.current = 0;
      }
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setVisibilityState(document.visibilityState);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    const engine = engineRef.current;
    mixRef.current = resolveAmbientMix({
      zone,
      sector,
      nearbyTriggerId,
      nearbyDepositId,
    });

    if (!engine) {
      syncStateRef.current();
      return;
    }

    if (previousZoneRef.current !== zone) {
      const previousZone = previousZoneRef.current;
      const transitionCue = resolveAmbientTransitionCue(previousZone, zone);

      if (transitionCue) {
        transitionRef.current = {
          cue: transitionCue,
          expiresAt: performance.now() + TRANSITION_REPORT_WINDOW_MS,
        };
        engine.playTransitionCue(transitionCue, volume);
      }

      if (zoneStopTimerRef.current) {
        window.clearTimeout(zoneStopTimerRef.current);
      }

      zoneStopTimerRef.current = window.setTimeout(() => {
        engine.hardStopZone(previousZone);
        zoneStopTimerRef.current = 0;
      }, 2000);
      previousZoneRef.current = zone;
    }

    if (!enabled) {
      engine.stopAll();
      galleryTrackRef.current = null;
      transitionRef.current = {
        cue: null,
        expiresAt: 0,
      };
      if (zoneStopTimerRef.current) {
        window.clearTimeout(zoneStopTimerRef.current);
        zoneStopTimerRef.current = 0;
      }
      recentOneShotsRef.current = {
        bird_call: 0,
        gust: 0,
        grass_rustle: 0,
        wood_creak: 0,
        wing_flutter: 0,
      };
      syncStateRef.current();
      return;
    }

    engine.resume();
    engine.update({
      mix: mixRef.current,
      volume,
      muted,
      oneShotEnabled: canScheduleAmbientOneShots({
        enabled,
        zone,
        muted,
        volume,
        visibilityState,
      }),
      oneShotDensityScale: resolveOneShotDensityScale(renderProfileId),
    });
    syncStateRef.current();
  }, [
    enabled,
    muted,
    nearbyDepositId,
    nearbyTriggerId,
    renderProfileId,
    sector,
    visibilityState,
    volume,
    zone,
  ]);

  useEffect(() => {
    if (!enabled) return undefined;

    const intervalId = window.setInterval(() => {
      syncStateRef.current();
    }, 500);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [enabled]);

  return state;
}
