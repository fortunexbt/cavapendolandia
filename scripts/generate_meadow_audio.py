#!/usr/bin/env python3

from __future__ import annotations

import math
import subprocess
import tempfile
import wave
from array import array
from dataclasses import dataclass
from pathlib import Path

SAMPLE_RATE = 16000
OUTPUT_ROOT = Path("public/audio/cavapendolandia/meadow")


class FastRandom:
  def __init__(self, seed: int):
    self.state = seed & 0xFFFFFFFF

  def next(self) -> float:
    self.state = (1664525 * self.state + 1013904223) & 0xFFFFFFFF
    return self.state / 0xFFFFFFFF

  def signed(self) -> float:
    return self.next() * 2.0 - 1.0

  def between(self, minimum: float, maximum: float) -> float:
    return minimum + (maximum - minimum) * self.next()


@dataclass(frozen=True)
class StemSpec:
  path: str
  duration: float
  kind: str
  seed: int


STEMS: list[StemSpec] = [
  StemSpec("base/wind-bed-a.ogg", 96.0, "wind", 1103),
  StemSpec("base/wind-bed-b.ogg", 104.0, "wind", 1121),
  StemSpec("base/birds-bed-a.ogg", 91.0, "birds", 2107),
  StemSpec("base/birds-bed-b.ogg", 99.0, "birds", 2143),
  StemSpec("base/grass-bed-a.ogg", 84.0, "grass", 3109),
  StemSpec("base/grass-bed-b.ogg", 92.0, "grass", 3137),
  StemSpec("sectors/return-court-accent.ogg", 70.0, "return_court", 4103),
  StemSpec("sectors/lantern-ridge-accent.ogg", 72.0, "lantern_ridge", 4129),
  StemSpec("sectors/whisper-grove-accent.ogg", 74.0, "whisper_grove", 4153),
  StemSpec("sectors/shrine-basin-accent.ogg", 76.0, "shrine_basin", 4177),
  StemSpec("sectors/far-rim-accent.ogg", 72.0, "far_rim", 4201),
  StemSpec("oneshots/bird-call-01.ogg", 2.8, "bird_call", 5101),
  StemSpec("oneshots/bird-call-02.ogg", 3.3, "bird_call", 5119),
  StemSpec("oneshots/gust-01.ogg", 4.8, "gust", 6103),
  StemSpec("oneshots/gust-02.ogg", 5.6, "gust", 6127),
  StemSpec("oneshots/grass-rustle-01.ogg", 3.6, "grass_rustle", 7109),
  StemSpec("oneshots/grass-rustle-02.ogg", 4.2, "grass_rustle", 7123),
  StemSpec("oneshots/wood-creak-01.ogg", 3.1, "wood_creak", 8107),
  StemSpec("oneshots/wing-flutter-01.ogg", 2.4, "wing_flutter", 9109),
]


def clamp(value: float, minimum: float = -1.0, maximum: float = 1.0) -> float:
  return max(minimum, min(maximum, value))


def write_wav(path: Path, samples: array) -> None:
  with wave.open(str(path), "wb") as wav_file:
    wav_file.setnchannels(1)
    wav_file.setsampwidth(2)
    wav_file.setframerate(SAMPLE_RATE)
    wav_file.writeframes(samples.tobytes())


def encode_ogg(temp_wav: Path, output_path: Path) -> None:
  output_path.parent.mkdir(parents=True, exist_ok=True)
  subprocess.run(
    [
      "/opt/homebrew/bin/ffmpeg",
      "-y",
      "-loglevel",
      "error",
      "-i",
      str(temp_wav),
      "-ac",
      "2",
      "-c:a",
      "vorbis",
      "-strict",
      "-2",
      "-qscale:a",
      "4",
      str(output_path),
    ],
    check=True,
  )


def render_noise(duration: float, seed: int) -> list[float]:
  rng = FastRandom(seed)
  total = int(duration * SAMPLE_RATE)
  signal = [0.0] * total
  low = 0.0
  band = 0.0

  for index in range(total):
    white = rng.signed()
    low += (white - low) * 0.02
    band += (white - band) * 0.16
    signal[index] = low * 0.7 + (band - low) * 0.3

  return signal


def mix_signal(target: list[float], source: list[float], gain: float = 1.0) -> None:
  for index, sample in enumerate(source):
    target[index] += sample * gain


def add_wind(signal: list[float], seed: int) -> None:
  rng = FastRandom(seed)
  total = len(signal)
  gust_count = max(6, int(total / SAMPLE_RATE / 12))
  gusts: list[tuple[float, float, float]] = []
  for _ in range(gust_count):
    start = rng.between(0.0, total / SAMPLE_RATE - 10.0)
    span = rng.between(4.5, 9.0)
    strength = rng.between(0.12, 0.24)
    gusts.append((start, span, strength))

  low_band = 0.0
  airy = 0.0
  for index in range(total):
    t = index / SAMPLE_RATE
    base = 0.08 + 0.02 * math.sin(t * 0.17 + seed * 0.01)
    base += 0.015 * math.sin(t * 0.051 + seed * 0.03)
    gust = 0.0
    for start, span, strength in gusts:
      local = (t - start) / span
      if 0.0 <= local <= 1.0:
        gust += strength * max(0.0, math.sin(local * math.pi)) ** 2
    low_band = low_band * 0.996 + signal[index] * 0.004
    airy = airy * 0.985 + signal[index] * 0.015
    signal[index] = low_band * (base + gust) * 0.42 + airy * 0.045


def add_grass(signal: list[float], seed: int) -> None:
  rng = FastRandom(seed)
  total = len(signal)
  duration = total / SAMPLE_RATE
  events: list[tuple[float, float, float]] = []
  event_count = max(10, int(duration / 6.8))
  for _ in range(event_count):
    start = rng.between(0.0, max(0.0, duration - 3.2))
    span = rng.between(1.4, 3.2)
    strength = rng.between(0.05, 0.12)
    events.append((start, span, strength))

  for index in range(total):
    t = index / SAMPLE_RATE
    pulse = 0.0
    for start, span, strength in events:
      local = (t - start) / span
      if 0.0 <= local <= 1.0:
        pulse += strength * max(0.0, math.sin(local * math.pi)) ** 1.4
    flutter = math.sin(t * 12.0 + math.sin(t * 0.26) * 0.3) * 0.004
    signal[index] = signal[index] * pulse * 0.22 + flutter * pulse


def add_birds(signal: list[float], seed: int) -> None:
  rng = FastRandom(seed)
  total = len(signal)
  duration = total / SAMPLE_RATE
  event_count = max(22, int(duration / 3.8))
  events: list[tuple[float, float, float, float, float]] = []
  for _ in range(event_count):
    start = rng.between(0.0, duration - 1.8)
    span = rng.between(0.24, 1.2)
    start_freq = rng.between(1400.0, 3200.0)
    end_freq = start_freq + rng.between(-500.0, 900.0)
    amp = rng.between(0.012, 0.042)
    events.append((start, span, start_freq, end_freq, amp))

  for start, span, start_freq, end_freq, amp in events:
    start_index = int(start * SAMPLE_RATE)
    end_index = min(total, int((start + span) * SAMPLE_RATE))
    phase = rng.between(0.0, math.pi * 2)
    for index in range(start_index, end_index):
      local = (index / SAMPLE_RATE - start) / span
      env = max(0.0, math.sin(local * math.pi)) ** 1.8
      freq = start_freq + (end_freq - start_freq) * local
      trill = math.sin(local * math.pi * (2.0 + rng.between(0.0, 2.4)))
      tone = math.sin(index / SAMPLE_RATE * freq * math.pi * 2 + phase)
      overtone = math.sin(index / SAMPLE_RATE * freq * 2.02 * math.pi * 2 + phase * 0.7)
      signal[index] += env * amp * (tone * 0.72 + overtone * 0.28 + trill * 0.1)


def add_sector_accent(signal: list[float], kind: str, seed: int) -> None:
  rng = FastRandom(seed)
  total = len(signal)
  duration = total / SAMPLE_RATE
  noise = render_noise(duration, seed + 9)

  if kind == "whisper_grove":
    event_count = max(12, int(duration / 6.0))
  elif kind == "far_rim":
    event_count = max(10, int(duration / 7.5))
  else:
    event_count = max(8, int(duration / 9.0))

  for _ in range(event_count):
    start = rng.between(0.0, max(0.0, duration - 4.0))
    span = rng.between(1.8, 4.4)
    start_index = int(start * SAMPLE_RATE)
    end_index = min(total, int((start + span) * SAMPLE_RATE))
    base_freq = (
      420.0
      if kind == "lantern_ridge"
      else 320.0
      if kind == "shrine_basin"
      else 180.0
    )
    for index in range(start_index, end_index):
      local = (index / SAMPLE_RATE - start) / span
      env = max(0.0, math.sin(local * math.pi)) ** 1.8
      if kind == "whisper_grove":
        signal[index] += noise[index] * env * 0.045
      elif kind == "far_rim":
        signal[index] += noise[index] * env * 0.038
      elif kind == "return_court":
        signal[index] += noise[index] * env * 0.026
      else:
        t = index / SAMPLE_RATE
        tone = math.sin(t * base_freq * math.pi * 2)
        overtone = math.sin(t * base_freq * 1.52 * math.pi * 2)
        signal[index] += env * (tone * 0.012 + overtone * 0.005)


def render_one_shot(duration: float, kind: str, seed: int) -> list[float]:
  total = int(duration * SAMPLE_RATE)
  signal = [0.0] * total
  if kind == "bird_call":
    add_birds(signal, seed)
  elif kind == "gust":
    base = render_noise(duration, seed)
    for index in range(total):
      local = index / max(1, total - 1)
      env = max(0.0, math.sin(local * math.pi)) ** 1.4
      swell = 0.4 + 0.6 * math.sin(local * math.pi * 0.5)
      signal[index] = base[index] * env * swell * 0.5
  elif kind == "grass_rustle":
    base = render_noise(duration, seed)
    for index in range(total):
      local = index / max(1, total - 1)
      env = max(0.0, math.sin(local * math.pi)) ** 1.6
      signal[index] = base[index] * env * (0.18 + 0.2 * math.sin(local * math.pi * 5))
  elif kind == "wood_creak":
    for index in range(total):
      t = index / SAMPLE_RATE
      local = index / max(1, total - 1)
      env = max(0.0, math.sin(local * math.pi)) ** 1.8
      signal[index] = (
        math.sin(t * 92 * math.pi * 2 + math.sin(t * 7) * 0.6) * 0.08
        + math.sin(t * 143 * math.pi * 2) * 0.03
      ) * env
  elif kind == "wing_flutter":
    base = render_noise(duration, seed)
    for index in range(total):
      t = index / SAMPLE_RATE
      burst = math.sin(t * 22) ** 2
      env = math.sin(index / max(1, total - 1) * math.pi)
      signal[index] = base[index] * burst * env * 0.25
  return signal


def normalize_to_pcm(signal: list[float], headroom: float = 0.9) -> array:
  peak = max(abs(sample) for sample in signal) or 1.0
  scale = headroom / peak
  pcm = array("h")
  for sample in signal:
    pcm.append(int(clamp(sample * scale) * 32767))
  return pcm


def render_stem(spec: StemSpec) -> array:
  if spec.kind == "wind":
    signal = render_noise(spec.duration, spec.seed)
    add_wind(signal, spec.seed)
  elif spec.kind == "birds":
    signal = [0.0] * int(spec.duration * SAMPLE_RATE)
    add_birds(signal, spec.seed)
  elif spec.kind == "grass":
    signal = render_noise(spec.duration, spec.seed)
    add_grass(signal, spec.seed)
  elif spec.kind in {
    "return_court",
    "lantern_ridge",
    "whisper_grove",
    "shrine_basin",
    "far_rim",
  }:
    signal = [0.0] * int(spec.duration * SAMPLE_RATE)
    add_sector_accent(signal, spec.kind, spec.seed)
  else:
    signal = render_one_shot(spec.duration, spec.kind, spec.seed)

  return normalize_to_pcm(signal)


def main() -> None:
  OUTPUT_ROOT.mkdir(parents=True, exist_ok=True)
  with tempfile.TemporaryDirectory() as temp_dir:
    temp_root = Path(temp_dir)
    for spec in STEMS:
      pcm = render_stem(spec)
      temp_wav = temp_root / (Path(spec.path).stem + ".wav")
      write_wav(temp_wav, pcm)
      encode_ogg(temp_wav, OUTPUT_ROOT / spec.path)
      print(f"generated {spec.path}")


if __name__ == "__main__":
  main()
