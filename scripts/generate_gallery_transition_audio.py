#!/usr/bin/env python3

from __future__ import annotations

import math
import random
import subprocess
import tempfile
import wave
from array import array
from pathlib import Path

SAMPLE_RATE = 22050
OUTPUT_ROOT = Path("public/audio/cavapendolandia/gallery")


def clamp(sample: float) -> float:
  return max(-1.0, min(1.0, sample))


def write_wav(path: Path, samples: list[float]) -> None:
  pcm = array(
    "h",
    [int(clamp(sample) * 32767) for sample in samples],
  )
  with wave.open(str(path), "wb") as wav_file:
    wav_file.setnchannels(1)
    wav_file.setsampwidth(2)
    wav_file.setframerate(SAMPLE_RATE)
    wav_file.writeframes(pcm.tobytes())


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
      "5",
      str(output_path),
    ],
    check=True,
  )


def render_portal_hit(
  *,
  seed: int,
  duration: float,
  base_freq: float,
  end_freq: float,
  noise_gain: float,
  swell_bias: float,
) -> list[float]:
  total = int(duration * SAMPLE_RATE)
  rng = random.Random(seed)
  samples = [0.0] * total
  phase = rng.random() * math.pi * 2

  for index in range(total):
    t = index / SAMPLE_RATE
    progress = index / max(1, total - 1)
    attack = min(1.0, progress / 0.08)
    release = (1.0 - progress) ** (1.8 + swell_bias)
    env = attack * release
    freq = base_freq + (end_freq - base_freq) * progress
    harmonic = math.sin(t * freq * math.pi * 2 + phase)
    shimmer = math.sin(t * freq * 2.4 * math.pi * 2 + phase * 0.73)
    air = rng.uniform(-1.0, 1.0) * noise_gain * env
    samples[index] = env * (harmonic * 0.56 + shimmer * 0.18) + air

  return samples


def render_portal_out() -> list[float]:
  signal = render_portal_hit(
    seed=1401,
    duration=2.4,
    base_freq=220.0,
    end_freq=620.0,
    noise_gain=0.12,
    swell_bias=0.15,
  )
  total = len(signal)
  for index in range(total):
    progress = index / max(1, total - 1)
    flare = max(0.0, math.sin(progress * math.pi)) ** 2.2
    signal[index] += flare * 0.06 * math.sin(progress * 74.0)
  return signal


def render_portal_in() -> list[float]:
  signal = render_portal_hit(
    seed=1459,
    duration=2.1,
    base_freq=520.0,
    end_freq=170.0,
    noise_gain=0.09,
    swell_bias=0.28,
  )
  total = len(signal)
  for index in range(total):
    progress = index / max(1, total - 1)
    vacuum = (1.0 - progress) ** 1.5
    signal[index] += vacuum * 0.04 * math.sin(progress * 58.0 + 1.1)
  return signal


def render_to_ogg(filename: str, samples: list[float]) -> None:
  with tempfile.TemporaryDirectory() as temp_dir:
    temp_wav = Path(temp_dir) / "portal.wav"
    write_wav(temp_wav, samples)
    encode_ogg(temp_wav, OUTPUT_ROOT / filename)


def main() -> None:
  render_to_ogg("portal-hit-out.ogg", render_portal_out())
  render_to_ogg("portal-hit-in.ogg", render_portal_in())


if __name__ == "__main__":
  main()
