import type { RoomId } from "@/world/types";

type RoomStem = {
  gain: GainNode;
  oscA: OscillatorNode;
  oscB: OscillatorNode;
  filter: BiquadFilterNode;
  lfo: OscillatorNode;
  lfoGain: GainNode;
};

type RoomSoundProfile = {
  freqA: number;
  freqB: number;
  typeA: OscillatorType;
  typeB: OscillatorType;
  filterHz: number;
  lfoRate: number;
  lfoDepth: number;
};

const ROOM_SOUND: Record<RoomId, RoomSoundProfile> = {
  home_atrium: {
    freqA: 108,
    freqB: 216,
    typeA: "sine",
    typeB: "triangle",
    filterHz: 800,
    lfoRate: 0.16,
    lfoDepth: 18,
  },
  manifesto_room: {
    freqA: 126,
    freqB: 252,
    typeA: "triangle",
    typeB: "sine",
    filterHz: 940,
    lfoRate: 0.2,
    lfoDepth: 22,
  },
  regole_room: {
    freqA: 96,
    freqB: 192,
    typeA: "square",
    typeB: "triangle",
    filterHz: 640,
    lfoRate: 0.12,
    lfoDepth: 14,
  },
  rimozione_room: {
    freqA: 88,
    freqB: 176,
    typeA: "sine",
    typeB: "sawtooth",
    filterHz: 520,
    lfoRate: 0.09,
    lfoDepth: 10,
  },
  archivio_room: {
    freqA: 132,
    freqB: 264,
    typeA: "triangle",
    typeB: "sawtooth",
    filterHz: 1040,
    lfoRate: 0.24,
    lfoDepth: 26,
  },
  offri_room: {
    freqA: 102,
    freqB: 204,
    typeA: "sawtooth",
    typeB: "triangle",
    filterHz: 730,
    lfoRate: 0.18,
    lfoDepth: 17,
  },
  offering_detail_room: {
    freqA: 118,
    freqB: 236,
    typeA: "triangle",
    typeB: "sine",
    filterHz: 900,
    lfoRate: 0.14,
    lfoDepth: 14,
  },
};

export class AudioDirector {
  private context: AudioContext | null = null;

  private master: GainNode | null = null;

  private stems: Partial<Record<RoomId, RoomStem>> = {};

  private enabled = true;

  init() {
    if (this.context) return;
    const AudioContextClass =
      window.AudioContext ||
      (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    this.context = new AudioContextClass();
    this.master = this.context.createGain();
    this.master.gain.value = this.enabled ? 0.05 : 0;
    this.master.connect(this.context.destination);

    (Object.keys(ROOM_SOUND) as RoomId[]).forEach((roomId) => {
      if (!this.context || !this.master) return;
      const profile = ROOM_SOUND[roomId];
      const gain = this.context.createGain();
      gain.gain.value = 0;

      const filter = this.context.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = profile.filterHz;
      filter.Q.value = 0.8;

      gain.connect(filter);
      filter.connect(this.master);

      const oscA = this.context.createOscillator();
      oscA.type = profile.typeA;
      oscA.frequency.value = profile.freqA;
      oscA.connect(gain);

      const oscB = this.context.createOscillator();
      oscB.type = profile.typeB;
      oscB.frequency.value = profile.freqB;
      oscB.connect(gain);

      const lfo = this.context.createOscillator();
      lfo.type = "sine";
      lfo.frequency.value = profile.lfoRate;

      const lfoGain = this.context.createGain();
      lfoGain.gain.value = profile.lfoDepth;
      lfo.connect(lfoGain);
      lfoGain.connect(oscA.detune);
      lfoGain.connect(oscB.detune);

      oscA.start();
      oscB.start();
      lfo.start();
      this.stems[roomId] = { gain, oscA, oscB, filter, lfo, lfoGain };
    });
  }

  async resume() {
    this.init();
    if (!this.context) return;
    if (this.context.state === "suspended") {
      await this.context.resume();
    }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (!this.master || !this.context) return;
    const now = this.context.currentTime;
    this.master.gain.setTargetAtTime(enabled ? 0.05 : 0, now, 0.2);
  }

  setRoomFocus(roomId: RoomId, amount: number) {
    if (!this.context) return;
    const now = this.context.currentTime;
    (Object.keys(this.stems) as RoomId[]).forEach((id) => {
      const stem = this.stems[id];
      if (!stem) return;
      const target = id === roomId ? amount : 0;
      stem.gain.gain.setTargetAtTime(this.enabled ? target * 0.12 : 0, now, 0.18);
      const baseFilter = ROOM_SOUND[id].filterHz;
      const filterTarget = id === roomId ? baseFilter * 1.1 : baseFilter * 0.72;
      stem.filter.frequency.setTargetAtTime(filterTarget, now, 0.24);
    });
  }

  dispose() {
    (Object.keys(this.stems) as RoomId[]).forEach((id) => {
      const stem = this.stems[id];
      if (!stem) return;
      try {
        stem.oscA.stop();
        stem.oscB.stop();
        stem.lfo.stop();
      } catch {
        // Already stopped.
      }
      stem.oscA.disconnect();
      stem.oscB.disconnect();
      stem.lfo.disconnect();
      stem.lfoGain.disconnect();
      stem.filter.disconnect();
      stem.gain.disconnect();
    });
    this.stems = {};

    if (this.master) {
      this.master.disconnect();
      this.master = null;
    }

    if (this.context) {
      void this.context.close();
      this.context = null;
    }
  }
}
