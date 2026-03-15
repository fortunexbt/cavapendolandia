

## Ambient Music Overhaul: Rotating Tracks

### Problem
The current system generates 8 separate short SFX clips (10 seconds each) via ElevenLabs and layers them all simultaneously — this creates a cacophony of overlapping sounds. The user wants a single ambient music track playing at a time, rotating through 4-5 longer tracks in the style of Pink Floyd ambient, Blade Runner, lofi beats, Aphex Twin Selected Ambient Works.

### Approach

**Replace the multi-layer SFX system with a single-track rotation system.**

1. **New prompts** — 5 tracks, each 22 seconds (ElevenLabs SFX max), using the **Music API** (`/v1/music`) instead of sound effects API for higher quality:
   - `ambient-1`: "deep atmospheric ambient music, Pink Floyd inspired, slow evolving synthesizer pads, reverberant guitar echoes, melancholic and spacious"
   - `ambient-2`: "Blade Runner inspired ambient, warm analog synth drones, distant reverb, rainy night atmosphere, Vangelis style pads"
   - `ambient-3`: "lofi ambient beats, soft dusty vinyl crackle, mellow Rhodes piano chords, warm tape saturation, slow downtempo"
   - `ambient-4`: "Aphex Twin Selected Ambient Works style, gentle evolving synth textures, dreamy ethereal pads, soft granular synthesis"
   - `ambient-5`: "deep space ambient, slow cinematic strings, warm sub bass drone, contemplative and immersive, sci-fi atmosphere"

2. **New edge function** `generate-ambient-music` using the ElevenLabs **Music** endpoint (`/v1/music`) with `prompt` param and `duration_seconds: 22`

3. **Rotation logic** in `useAmbientAudio`:
   - Play one track at a time
   - When a track ends, crossfade (2s) to the next track in sequence
   - Loop through all 5 tracks endlessly
   - Only one audio element active at a time (no layering)
   - Cache prefix bumped to `gallery-music-v1`

4. **Remove** all creature-specific SFX prompts (seahorse, owl, cat, etc.) — just the 5 ambient tracks

### Files to modify
- `supabase/functions/generate-ambient-sfx/index.ts` → rename/update to use `/v1/music` endpoint with `prompt` param
- `src/components/CavapendoGallery.tsx` → replace `SFX_PROMPTS`, rewrite `useAmbientAudio` for single-track rotation with crossfade

