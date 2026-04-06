#!/usr/bin/env python3

from __future__ import annotations

import math
import subprocess
import tempfile
import wave
from array import array
from pathlib import Path

SAMPLE_RATE = 16000
OUTPUT_ROOT = Path("public/audio/cavapendolandia/gallery")


class FastRandom:
  def __init__(self, seed: int):
    self.state = seed & 0xFFFFFFFF

  def next(self) -> float:
    self.state = (1664525 * self.state + 1013904223) & 0xFFFFFFFF
    return self.state / 0xFFFFFFFF

  def between(self, minimum: float, maximum: float) -> float:
    return minimum + (maximum - minimum) * self.next()


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


def adsr(local_time: float, duration: float, attack: float, release: float) -> float:
  if local_time < 0 or local_time > duration:
    return 0.0
  if local_time < attack:
    return local_time / max(attack, 1e-4)
  if local_time > duration - release:
    return max(0.0, (duration - local_time) / max(release, 1e-4))
  return 1.0


def rhodes_tone(t: float, freq: float) -> float:
  fundamental = math.sin(t * freq * math.pi * 2)
  second = math.sin(t * freq * 2.01 * math.pi * 2) * 0.42
  third = math.sin(t * freq * 3.03 * math.pi * 2) * 0.16
  shimmer = math.sin(t * freq * 6.2 * math.pi * 2) * 0.04
  return fundamental * 0.66 + second + third + shimmer


def bass_tone(t: float, freq: float) -> float:
  fundamental = math.sin(t * freq * math.pi * 2)
  overtone = math.sin(t * freq * 2 * math.pi * 2) * 0.22
  return fundamental * 0.78 + overtone


def brush_noise(phase: float, strength: float) -> float:
  sweep = math.sin(phase * math.pi) ** 2
  hiss = math.sin(phase * 63) * 0.18 + math.sin(phase * 121) * 0.08
  return sweep * hiss * strength


CHORD_PROGRESSIONS = [
  [
    ([146.83, 174.61, 220.0, 261.63], 1.8),
    ([130.81, 174.61, 220.0, 246.94], 1.8),
    ([164.81, 196.0, 246.94, 293.66], 1.6),
    ([146.83, 184.99, 220.0, 277.18], 1.8),
  ],
  [
    ([146.83, 184.99, 220.0, 277.18], 1.8),
    ([174.61, 220.0, 261.63, 311.13], 1.8),
    ([164.81, 196.0, 246.94, 293.66], 1.6),
    ([146.83, 174.61, 220.0, 261.63], 1.8),
  ],
]

BASS_ROOTS = [73.42, 65.41, 82.41, 73.42]


def render_gallery_track(duration: float, seed: int) -> array:
  total = int(duration * SAMPLE_RATE)
  bpm = 72
  beat = 60 / bpm
  bar = beat * 4
  rng = FastRandom(seed)
  signal = [0.0] * total

  bar_count = int(duration / bar) + 1
  for bar_index in range(bar_count):
    progression = CHORD_PROGRESSIONS[bar_index % len(CHORD_PROGRESSIONS)]
    bar_start = bar_index * bar
    for chord_index, (notes, length_beats) in enumerate(progression):
      note_start = bar_start + chord_index * beat
      duration_seconds = length_beats * beat
      if note_start >= duration:
        continue
      start_index = int(note_start * SAMPLE_RATE)
      end_index = min(total, int((note_start + duration_seconds) * SAMPLE_RATE))
      phase_shift = rng.between(0.0, math.pi * 2)
      for index in range(start_index, end_index):
        t = index / SAMPLE_RATE
        local_time = t - note_start
        env = adsr(local_time, duration_seconds, 0.06, 0.42)
        tremolo = 0.86 + math.sin((t + phase_shift) * 1.7) * 0.08
        chord_sample = 0.0
        for note_index, freq in enumerate(notes):
          detune = 1.0 + note_index * 0.002
          chord_sample += rhodes_tone(local_time, freq * detune)
        signal[index] += chord_sample / len(notes) * env * tremolo * 0.095

    root = BASS_ROOTS[bar_index % len(BASS_ROOTS)]
    for beat_index in range(4):
      note_start = bar_start + beat_index * beat
      duration_seconds = beat * (0.78 if beat_index == 3 else 0.68)
      if note_start >= duration:
        continue
      start_index = int(note_start * SAMPLE_RATE)
      end_index = min(total, int((note_start + duration_seconds) * SAMPLE_RATE))
      freq = root * (1.5 if beat_index == 2 else 1.0)
      for index in range(start_index, end_index):
        t = index / SAMPLE_RATE
        local_time = t - note_start
        env = adsr(local_time, duration_seconds, 0.02, 0.24)
        signal[index] += bass_tone(local_time, freq) * env * 0.06

      brush_len = int(beat * 0.32 * SAMPLE_RATE)
      for offset in range(brush_len):
        sample_index = start_index + offset
        if sample_index >= total:
          break
        local_phase = offset / max(1, brush_len - 1)
        signal[sample_index] += brush_noise(local_phase, 0.016 if beat_index % 2 == 0 else 0.01)

  for index in range(total):
    t = index / SAMPLE_RATE
    room = math.sin(t * 0.12 + seed * 0.01) * 0.004
    room += math.sin(t * 0.037 + seed * 0.02) * 0.003
    signal[index] += room

  peak = max(abs(sample) for sample in signal) or 1.0
  scale = 0.86 / peak
  pcm = array("h")
  for sample in signal:
    pcm.append(int(clamp(sample * scale) * 32767))
  return pcm


def main() -> None:
  OUTPUT_ROOT.mkdir(parents=True, exist_ok=True)
  specs = [
    ("room-score-a.ogg", 94.0, 1301),
    ("room-score-b.ogg", 102.0, 1337),
  ]

  with tempfile.TemporaryDirectory() as temp_dir:
    temp_root = Path(temp_dir)
    for filename, duration, seed in specs:
      pcm = render_gallery_track(duration, seed)
      temp_wav = temp_root / filename.replace(".ogg", ".wav")
      write_wav(temp_wav, pcm)
      encode_ogg(temp_wav, OUTPUT_ROOT / filename)
      print(f"generated {filename}")


if __name__ == "__main__":
  main()
