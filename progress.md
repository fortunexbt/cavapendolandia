Original prompt: Keep improving the cavapendolandia game. Add another door on the opposite side of the exit that takes the user to an open world with grass, trees, and places where cavapendolate can be left. We may also want to optimize and improve the current state of the gameified world, which can be very laggy on older devices and the sensitivity/fullscreen/viewport is kinda buggy.

2026-03-26
- Bootstrapped progress tracking for the gallery outdoor-zone and stability pass.
- Confirmed current world architecture: the navigable experience lives in `src/components/CavapendoGallery.tsx`; the decorative landing background is separate.
- Confirmed the current exit arch is on the front wall and the new outdoor door should be added on the opposite wall.
- Baseline observations before edits:
  - build passes after installing dependencies
  - tests already fail for unrelated route-smoke expectations and missing `ResizeObserver` coverage
  - lint already fails on pre-existing `any` usage and hook dependency warnings
  - runtime gallery issues include bad signed URLs for `/cavapendoli/*` demo assets, missing deterministic game hooks, and mobile/render instability during the prelude/gallery handoff
- Current implementation order:
  - extract shared offering submission logic for `/offri` and the in-world deposit overlay
  - refactor gallery into gallery/meadow zones with new door triggers and deposit sites
  - add adaptive quality, sensitivity/fullscreen controls, safer sizing, and deterministic hooks
  - validate with build/tests and the web-game Playwright client

- Shared submission slice completed:
  - added reusable submission helpers in `src/lib/offeringSubmission.ts`
  - added reusable wizard UI in `src/components/OfferingSubmissionWizard.tsx`
  - switched `/offri` to the shared wizard
  - fixed local public media URLs in `src/lib/offeringMedia.ts` so `/cavapendoli/*` demo assets are no longer treated like storage keys
  - verification: `npm run build` passes, `npx vitest run src/test/offeringValidation.test.ts` passes

- World/game pass completed in `src/components/CavapendoGallery.tsx`:
  - split the experience into indoor `gallery` and outdoor `meadow` zones with a back-wall `ESTERNO` door and meadow-side `GALLERIA` return arch
  - added low-cost meadow terrain, instanced grass, ringed tree clusters, and three in-world deposit sites
  - added adaptive quality selection, persisted sensitivity, fullscreen toggle (`f`), keyboard-first focus handling, and mobile joysticks
  - replaced the old click-only interaction path with deterministic keyboard interaction (`Enter` / `E`) and exposed `nearby_deposit` in `render_game_to_text`
  - made `window.advanceTime(ms)` wait for the world controller to register before consuming test frames, which fixed the short-burst Playwright client regression on fresh loads
  - updated the global prelude so first interaction dismisses it early instead of forcing a long block every time

- Verification after the world pass:
  - `npm run build` passes
  - `npx vitest run src/test/offeringMedia.test.ts src/test/offeringSubmission.test.ts src/test/offeringValidation.test.ts` passes
  - web-game client checks now pass for:
    - short deterministic movement from spawn
    - gallery -> meadow transition through `ESTERNO`
    - meadow -> gallery return through `GALLERIA`
    - gallery front exit -> `/grazie`
    - deposit modal opening from the meadow path
  - focused Playwright browser QA confirmed:
    - fullscreen toggles on with `f`
    - mobile viewport loads with medium auto-quality and on-screen controls visible
    - deposit submission closes the modal and increments the local meadow deposit count when the backend insert succeeds

- Added targeted regression tests:
  - `src/test/offeringMedia.test.ts` covers local-public-asset passthrough and storage signing
  - `src/test/offeringSubmission.test.ts` covers shared submission progression, normalization, success insertion, and invalid-link rejection

- Residual notes / follow-up:
  - build still warns about the large main JS chunk; no code-splitting pass was done here
  - browser warnings still include React Router future flags and the upstream `THREE.THREE.Clock` deprecation warning
  - full repo lint/test was not rerun end-to-end because there were already unrelated red suites before this feature pass

- Dreamscape Demo + Green Baseline pass completed:
  - `src/components/CavapendoWorld.tsx` was rebuilt into a more deliberate landing dreamscape with typed shader refs, clearer landmarking, richer layered atmosphere, and cleaned hook dependencies
  - `src/pages/Index.tsx` and `src/components/CavapendoliPrelude.tsx` were restyled so the threshold, prelude, and gallery/meadow feel like one visual arc instead of separate screens
  - `src/components/CavapendoGallery.tsx` got the meadow polish pass:
    - stronger indoor/outdoor contrast
    - clearer arch silhouettes and a centered moon-disc horizon
    - shrine-like deposit markers with better landmark readability
    - denser but tier-aware decorative set dressing on `high`
    - safer interaction/proximity wiring so the new deposit cue state stays in sync with `render_game_to_text`
  - repo cleanup for local green checks:
    - replaced remaining `any` usage in `src/components/CavapendoWorld.tsx` and `src/pages/admin/Anticamera.tsx`
    - fixed stale hook-dependency warnings in the world components
    - updated route smoke coverage to current product truth and wrapped it in the same provider shape as the app
    - added `ResizeObserver` + scroll polyfills in `src/test/setup.ts`

- Full local gate verification after the dreamscape pass:
  - `npm run lint` passes
  - `npm run test` passes
  - `npm run build` passes

- Additional QA after the dreamscape pass:
  - hard-reload browser check on `/galleria` confirmed the earlier `onDepositProximityChange is not a function` error was only a stale HMR session artifact, not a fresh-load runtime bug
  - mobile viewport check at 390x844 confirmed the post-prelude gallery still renders with visible joysticks, controls, and readable layered composition
  - deterministic mocked deposit submission was rerun in desktop Chromium with SwiftShader flags:
    - walked gallery -> meadow -> `radura-centrale`
    - opened the in-world deposit wizard
    - submitted a mocked link offering successfully
    - confirmed `render_game_to_text` reported `radura-centrale` with `deposited_here: 1`
    - verified the settled success state still leaves the player in the meadow with the local acknowledgement banner visible

- Remaining notes:
  - the build still reports the pre-existing large JS chunk warning
  - test stderr still includes React Router future-flag warnings and the existing Supabase env warning during isolated utility tests
  - temporary QA screenshots under `tmp/` were removed after verification to keep the worktree cleaner

- Full 360 meadow + desktop runtime floor pass completed:
  - `src/components/cavapendo-gallery/runtime.ts` now exposes an explicit auto-downgrade floor and next-auto-profile helper so desktop `auto` can only fall from `desktop_showcase` to `desktop_balanced`, never into the mobile tiers
  - `src/components/cavapendo-gallery/gameplay.tsx` now uses that floor in `RenderProfileGuardian` and publishes a second landmark stream for skyline readability instead of mixing horizon life into the nearby interactive landmark list
  - `src/components/CavapendoGallery.tsx` now records richer runtime diagnostics in `render_game_to_text()`:
    - `device_class`
    - `resolved_render_profile`
    - `auto_downgrade_floor`
    - `render_profile_reason`
    - `horizon_landmarks`
    - `horizon_landmark_summary`
  - `src/lib/meadowWorld.ts` now has a formal `MEADOW_SKYLINE_LANDMARKS` layer plus quality filtering, more west/south/east mid-ring landmarks, more outer trees/monoliths/reeds/grass patches/cloud banks/creatures, and a lower navigation floor to reduce the “invisible southern wall” feel
  - `src/components/cavapendo-gallery/meadow-scene.tsx` now renders the skyline ring from shared meadow-world data and uses softer ground/shadow lighting so the globe no longer reads as a dark inhabited wedge next to a dead half

- Verification after the 360 meadow pass:
  - `npm run test -- src/test/galleryRuntime.test.ts` passes (19 tests)
  - `npm run test` passes (34 tests)
  - `npm run lint` passes
  - `npm run build` passes
  - web-game client run completed against `http://127.0.0.1:4183/galleria` and wrote artifacts to `tmp/web-game-360-pass/`
  - browser QA on live `/galleria` confirmed:
    - desktop `auto` resolves to `desktop_showcase` in gallery with `auto_downgrade_floor: "desktop_balanced"`
    - after entering the meadow, desktop runtime may still step down to `desktop_balanced`, but it no longer drops into `mobile_safe`
    - `render_game_to_text()` now reports a populated horizon ring across representative meadow views instead of only nearby landmark ids

- QA caveat for future passes:
  - `set_meadow_debug_pose(...)` bypasses collision resolution, so some forced camera poses can land inside reeds or trunks even when normal walking would not; use its text-state output for deterministic coverage, but prefer real movement paths for “is this prop clipping the player?” checks

- HUD / onboarding / sensitivity refinement pass completed:
  - `src/components/CavapendoGallery.tsx` now separates base sensitivity from effective device-tuned look sensitivity
  - desktop mouse-look and mobile touch-look no longer share the same raw multiplier
  - mobile right-joystick input now uses a stronger dead-zone + response curve for finer camera control near center
  - the HUD now includes a reusable 3-step guide panel that adapts copy for desktop vs mobile and can be reopened from settings
  - desktop bottom hints were split into clearer control chips instead of one compressed sentence
  - mobile now gets labeled joysticks plus an explicit `Lascia qui` action button when standing in a deposit radius
  - proximity chips now use real door labels (`ESTERNO`, `GALLERIA`, `USCITA`) instead of internal ids
  - `render_game_to_text()` now exposes `guide_step`, `mouse_sensitivity`, and `touch_look_sensitivity` for deterministic QA

- Verification after the HUD pass:
  - `npm run lint` passes
  - `npm run test` passes
  - `npm run build` passes
  - web-game client desktop checks confirmed:
    - fresh spawn shows the new guide card and segmented HUD
    - gallery -> meadow still works and the guide collapses into the next objective state
  - Playwright mobile checks confirmed:
    - the guide card renders fully below the top action buttons at 390px width
    - joystick labels and the center jump button remain readable
    - near `radura-centrale`, the new mobile `Lascia qui` button appears above the controls as intended
  - temporary HUD QA screenshots were removed after review

- Gallery architecture correction pass completed after screenshot review:
  - fixed the back-wall `ESTERNO` arch orientation so the label is no longer mirrored from the spawn side
  - resized the arch internals and label plaque so the glowing portal now sits inside the frame instead of clipping past it
  - replaced the flat blank back-wall treatment with a low-cost exterior glass/panorama panel using a baked meadow texture rather than live rendering
  - added larger rounded corner columns to soften the harsh back-wall/side-wall seams that were showing up as bright vertical breaks in angled views
  - kept the solution lightweight: no second live render, just a generated texture and simple architectural cleanup

- Verification after the architecture correction pass:
  - `npm run lint` passes
  - `npm run test` passes
  - `npm run build` passes
  - web-game client fresh-spawn check confirms the `ESTERNO` text now reads in the correct direction from the room-facing side
  - manual screenshot review confirms the back arch now reads as a contained portal with a more deliberate wall treatment behind it

- Glass-pane refinement pass completed:
  - corrected the positive-`z` arch label orientation so `USCITA` and `GALLERIA` also face the player instead of showing mirrored backsides
  - fixed the fake window stack so the exterior preview and the glass layer face into the room
  - strengthened the baked `ESTERNO` preview with clearer sky, meadow, tree silhouettes, path, and shrine markers so it reads as an approximate world beyond the pane
  - lowered the glass opacity / increased transmission so the pane now feels see-through instead of like another painted wall

- Verification after the glass-pane refinement:
  - `npm run lint` passes
  - `npm run build` passes
  - `npm run test` passes
  - Playwright visual review on `/galleria` with the guide suppressed now shows a readable faux exterior beyond the glass pane
  - the latest web-game client sanity check still loads the corrected room without runtime errors

- Back-wall architecture polish pass completed:
  - tightened the `ArchPortal` proportions with an inner jamb, softer plaque treatment, and a shadow plane so the door no longer feels pasted onto the glass wall
  - rebuilt the panoramic back wall into a recessed bay made from actual border pieces instead of a flat full-wall slab, which preserved the faux exterior view while giving the room more depth
  - kept the glass effect lightweight: baked exterior texture behind the pane, transparent glass in front, mullions/sill around it, no second live render
  - increased plaque contrast and label sizing so `ESTERNO` is readable from the spawn shot again after the window-bay refactor

- Verification after the architecture polish:
  - `npm run lint` passes
  - `npm run test` passes
  - `npm run build` passes
  - web-game client capture still reports the expected gallery spawn state with `USCITA` / `ESTERNO` door labels in `state-0.json`
  - live Playwright screenshot review on `/galleria` now shows:
    - a visible faux meadow/sky scene beyond the back glass pane
    - the `ESTERNO` plaque reading correctly from the spawn side
    - a deeper, less flat back-wall composition than the earlier all-white wall treatment

- Globe meadow pass completed:
  - converted the outdoor meadow from a flat plane into a small spherical world with a real planet center and planet-surface anchor positions
  - moved the meadow spawn deeper onto the globe and tightened the `GALLERIA` return trigger so the exterior transition no longer lands inside the return arch radius
  - remapped outdoor deposits, trees, grass, and horizon monoliths onto the curved surface so the player can keep walking around the little-planet exterior instead of hitting flat-world edges
  - reduced meadow gravity and jump force pairing for a floatier outside feel inspired by a tiny-planet / Little Prince vibe
  - updated `render_game_to_text()` to use 3D door distances and to describe the meadow as globe-based world-space instead of the old flat-zone language
  - cleared the meadow spawn sightline and reduced grass scale so the spherical hill reads on entry instead of getting buried in oversized blades

- Verification after the globe meadow pass:
  - `npm run lint` passes
  - `npm run test` passes
  - `npm run build` passes
  - live Playwright checks confirmed:
    - gallery -> meadow still transitions in-canvas
    - meadow spawn now starts with `nearby_trigger: null` and a clear distance back to `GALLERIA`
    - walking farther in the meadow changes the player pose from `y: -3.4, z: 8.85` to `y: -11.41, z: -19.8`, confirming traversal around the globe instead of flat translation
    - jumping outside leaves the player airborne with a still-rising / slowly-falling state (`grounded: false`, `vy: -0.36`) after the same short burst, confirming the lighter outdoor gravity
  - web-game client capture now reaches the meadow and records `zone: "meadow"` with the updated globe coordinate note

- Globe readability follow-up completed:
  - updated the meadow guide copy to explicitly describe the globe and tell the player to follow suspended lanterns instead of generic rings
  - raised the deposit-site beacons and moved the central shrine closer to the main forward travel arc so the meadow has a visible landmark ahead from the entry slope
  - kept the sphere traversal and gravity settings unchanged; this pass was only about outdoor readability and navigation pull

- Verification after the globe readability pass:
  - `npm run lint` passes
  - `npm run build` passes
  - live Playwright entry screenshot now shows a visible floating beacon ring above the forward meadow ridge instead of a completely empty hill line

- Vertical-slice authored-globe pass completed:
  - extracted the outdoor authored world data into `src/lib/meadowWorld.ts`
    - larger planet radius (`36`)
    - authored sectors (`return_court`, `lantern_ridge`, `whisper_grove`, `shrine_basin`, `far_rim`)
    - clear zones, landmarks, tree layout, monolith layout, grass patches, deposit metadata, and creature definitions
  - rebuilt the meadow scene in `src/components/CavapendoGallery.tsx` around that data:
    - clean return court around `GALLERIA`
    - lantern ridge / shrine basin / far-rim landmarking
    - oversized cedar landmark moved off the return axis
    - authored trees/monoliths/grass instead of the old radial scatter
    - reactive ambient creatures (walkers, perchers, floaters)
  - switched door transitions to explicit interaction:
    - `ESTERNO`, `GALLERIA`, and `USCITA` now use prompts + confirm instead of passive auto-fire
    - mobile now gets explicit door action buttons when near a trigger
  - added the secondary ritual layer for meadow deposits:
    - shrine interaction opens a lightweight ritual prompt first
    - the shared offering wizard still handles the actual submission after confirmation
  - added ambient audio controls and local assets:
    - generated local bundled wav files under `public/audio/cavapendolandia/`
    - persistent ambience volume + mute in settings
    - gallery hush / meadow wind / shrine hum / return hum + sporadic creature call playback
  - extended deterministic game output:
    - `render_game_to_text()` now includes `sector`, `door_prompt`, `nearby_creatures`, `visible_landmarks`, and `ambience`
  - adjusted the meadow ritual/shrine readability after browser review:
    - removed the oversized always-visible 3D shrine labels that were overpowering close-up views
    - ritual card + HUD now carry the naming instead

- Verification after the vertical-slice pass:
  - `npm run lint` passes
  - `npm run test` passes
  - `npm run build` passes
  - browser QA confirmed:
    - the meadow uses explicit interaction instead of passive transition once you actually reach the door
    - the authored outdoor spawn reads with lanterns, obelisk, trees, and a visible creature in view
    - moving into the shrine basin can now open the intermediate ritual prompt before the shared deposit form

2026-03-27
- Meadow spread + zone-transition loading pass completed:
  - `src/components/CavapendoGallery.tsx`
    - wired a real zone-transition state into the gallery/meadow door swap instead of switching zones instantly
    - added timer-cleaned loading choreography for `ESTERNO` and `GALLERIA`
    - blocked repeated trigger spam during the crossing by treating the transition as an interrupted scene state
    - reset transient input during the crossing so movement/look does not leak through the loading moment
    - mounted the new `ZoneTransitionOverlay` above the scene and initialized the richer ambience snapshot shape in the deterministic state
  - `src/components/cavapendo-gallery/overlays.tsx`
    - added the cavapendoli logo transition screen
    - styled the crossing as an iris / eyelid opening with an expanding oval highlight rather than a plain fade
  - `src/lib/meadowWorld.ts`
    - redistributed the authored world outward with new landmarks:
      - `sentinella-dei-sussurri`
      - `meridiana-del-bacino`
      - `soglia-del-rim`
    - added more outer-sector tree stands, monoliths, grass fields, and cloud banks across whisper-grove west, shrine-basin south, and far-rim south/east
    - added new outer-sector creatures (`custode-del-meridiano`, `riverbero-del-rim`) so the southern and rim arcs no longer feel abandoned

- Verification after the spread + transition pass:
  - `npm run lint` passes
  - `npm run test` passes (`27` tests)
  - `npm run build` passes
  - browser QA on `http://127.0.0.1:4182/galleria` confirmed:
    - gallery -> meadow still transfers successfully through `ESTERNO`
    - meadow spawn/runtime now reports the new wider landmark set in `render_game_to_text()`, including `sentinella-dei-sussurri` and `soglia-del-rim`, instead of only the near-entry cluster
    - current meadow capture after the redistribution pass is `/var/folders/bm/mrfv93d96_l4nmxff2nf1fcw0000gn/T/playwright-mcp-output/1774591851048/page-2026-03-27T12-32-33-340Z.png`

- Southern-half expansion follow-up completed:
  - the lower / negative-`z` arc was still too empty, so `src/lib/meadowWorld.ts` got another authored spread pass focused specifically on the bottom side
  - added new southern landmarks:
    - `campana-del-sud`
    - `orto-sommerso`
    - `casa-del-sole-basso`
    - `obelisco-di-sotto`
  - added more bottom-half structural props:
    - extra whisper-grove south trees + `grove-south-needle`
    - lower-basin tree line + `orchard-spire` + `low-sun-marker`
    - far-rim lower tree line + `rim-south-observer`
  - extended the lower-half foliage / atmosphere:
    - new south grass bands in grove, basin, and rim
    - new south terrain bands
    - new south cloud banks
  - added more bottom-half creature activity:
    - `custode-della-campana`
    - `viandante-del-sole-basso`
    - `ronzatore-dell-orlo-basso`

- Verification after the southern-half expansion:
  - `npm run lint` passes
  - `npm run build` passes
  - `npm run test -- src/test/galleryRuntime.test.ts` passes

- Southern skyline correction completed after visual failure review:
  - the added lower-half assets were still too short to break the horizon from the return side because the small-planet curvature was hiding them
  - `src/lib/meadowWorld.ts` was updated again to turn the bottom-side anchors into actual skyline silhouettes:
    - raised and enlarged southern beacons (`campana-del-sud`, `lanterna-del-meriggio`, `faro-del-bordo-basso`)
    - enlarged the lower obelisks / lower architecture (`soglia-del-rim`, `obelisco-di-sotto`, `casa-del-sole-basso`, `orto-sommerso`)
    - promoted key lower trees into giant landmark silhouettes so they remain visible over the curve
  - browser QA now shows the south-facing meadow view with visible lower-horizon structure instead of a bare grass arc
    - latest capture: `/var/folders/bm/mrfv93d96_l4nmxff2nf1fcw0000gn/T/playwright-mcp-output/1774591851048/page-2026-03-27T12-45-51-458Z.png`

2026-03-27
- Premium `ESTERNO` threshold + gallery music rebuild pass completed:
  - replaced the gallery’s generated micro-loop score with real long-form interior music assets:
    - `public/audio/cavapendolandia/gallery/interior-direct-to-video.ogg`
    - `public/audio/cavapendolandia/gallery/interior-what-does-anybody-know.ogg`
  - added provenance manifest at `src/components/cavapendo-gallery/audio-asset-provenance.json`
  - added generated portal transition one-shots via `scripts/generate_gallery_transition_audio.py`
    - `public/audio/cavapendolandia/gallery/portal-hit-out.ogg`
    - `public/audio/cavapendolandia/gallery/portal-hit-in.ogg`
  - rebuilt `src/components/cavapendo-gallery/audio.ts` so:
    - gallery music reports the active interior track in ambience debug state
    - portal crossings resolve explicit `portal_hit_out` / `portal_hit_in` cues
    - zone changes crossfade instead of hard-cutting instantly, with delayed hard-stop cleanup
    - `render_game_to_text()` now exposes `ambience.galleryTrack` and `ambience.transition`
  - extended runtime coverage in `src/test/galleryRuntime.test.ts`:
    - added transition-cue resolution coverage
    - added gallery music presence + duration checks using `ffprobe`
  - rebuilt the `ESTERNO` back wall composition in `src/components/cavapendo-gallery/gallery-scene.tsx`:
    - moved the meadow world plane materially behind the glass instead of pinning it to the glazing
    - added a separate portal lightwell behind the arch so the threshold reads independently from the wall glass
    - replaced the static inner-white treatment with an animated threshold light component
    - intensified localized interior air/floor rays without washing the whole wall
    - darkened the arch structure and tightened the opening so the bright cut sits behind the architecture
  - refined `src/components/cavapendo-gallery/assets.ts` glass generation:
    - softer haze
    - more restrained gloss
    - vertical imperfections / edge sheen so the pane reads more like glass than a projected mural

- Verification after the threshold + music rebuild:
  - `npm run lint` passes
  - `npm run test` passes
  - `npm run build` passes
  - direct browser QA on `http://127.0.0.1:4182/galleria` confirmed:
    - full-wall exterior world is visible again behind the glazing
    - gallery audio resumes after first interaction and now reports a real interior track in `render_game_to_text()`
    - latest spawn screenshot with the rebuilt lightwell is `var/folders/bm/mrfv93d96_l4nmxff2nf1fcw0000gn/T/playwright-mcp-output/1774591851048/page-2026-03-27T12-08-20-782Z.png`
  - web-game client remains partially flaky in this environment:
    - selector-based click timed out once even though the page mounted normally in direct browser QA
    - raw-click client run still produced `tmp/web-game-threshold/shot-0.png` and `tmp/web-game-threshold/state-0.json`
    - the captured state confirms `ambience.galleryTrack` can switch tracks (`what_does_anybody_know` observed in that run)

- Current residuals after the latest user feedback:
  - close-up `ESTERNO` framing may still want an even more engulfing door-only lightwell treatment when the player is right at the threshold
  - a more explicit “loading into the outside world” animation inside the door could be pushed further if needed (the current pass adds animated sun drift/pulse inside the opening, but not a dedicated loading motif)

2026-03-27
- Premium meadow ambience + exterior presence pass completed:
  - replaced the old short-loop meadow stack in `src/components/cavapendo-gallery/audio.ts` with a layered ambience resolver and runtime:
    - continuous meadow buses now expose `wind`, `birds`, `grass`, and sector-specific accent cues
    - one-shots are scheduled separately and are density-scaled by render profile
    - gallery/meadow zone changes hard-stop the opposite zone so outside audio does not leak indoors
    - `render_game_to_text()` now reports meaningful ambience cues instead of the old `meadow_wind / shrine_hum / return_hum` set
  - added reproducible long-form ambience asset generation in `scripts/generate_meadow_audio.py`
    - outputs new stems and one-shots under `public/audio/cavapendolandia/meadow/`
    - wind + bird beds are 90s+; grass and sector stems are 70s+; one-shots live in a separate folder
  - updated `src/components/cavapendo-gallery/assets.ts`:
    - preload path now includes the new meadow audio tree
    - meadow ground texture shifted to broader, softer tonal variation
    - added a generated moving shadow texture for cloud-band drift across the meadow
  - updated `src/components/cavapendo-gallery/meadow-scene.tsx`:
    - canopy sway on trees
    - grass-clump motion
    - moving shadow sphere over the meadow
    - warmer sun / cooler fill lighting split
  - updated `src/components/cavapendo-gallery/gallery-scene.tsx`:
    - exterior window painting now matches the meadow palette more closely and includes moving shadow bands over the distant grassland

- Regression found and corrected during this pass:
  - the first shadow-sphere version used `MultiplyBlending`, which spammed `THREE.WebGLState: MultiplyBlending requires...` errors in live QA
  - fixed by switching the shadow layer to a regular transparent overlay instead of multiply blending

- Audio follow-up correction after live feedback:
  - the first generated meadow audio pass leaned too hard on synthetic noise + tonal accents and read as hiss / hum
  - regenerated all meadow stems with quieter wind, sparser grass rustle, less constant tonal content, and lower runtime bus gains
  - reduced one-shot gains as well so the meadow reads as air and distance instead of a buzzing wall

- Verification after the ambience/exterior pass:
  - `npm run lint` passes
  - `npm run test` passes (`25` tests)
  - `npm run build` passes
  - web-game client re-run still captures the gallery load from `/galleria`
  - browser QA on `http://127.0.0.1:4181/galleria` confirmed:
    - gallery after first click reports `ambience.activeCues: [\"gallery_hush\"]`
    - meadow entry reports `ambience.activeCues: [\"wind\", \"birds\", \"grass\", \"return_court_accent\"]`
    - gallery window now shows a more coherent exterior panorama
    - the meadow no longer throws the multiply-blend WebGL spam

- Remaining caveat:
  - Playwright still reports the existing pointer-lock limitation (`The root document of this element is not valid for pointer lock.`) during automated desktop interaction. That is separate from the ambience pass and seems tied to automation, not a new runtime crash.

- Gallery window + interior score correction completed:
  - `src/components/cavapendo-gallery/gallery-scene.tsx`
    - the back pane now renders a static exterior painting from `useExteriorWindowTexture(...)` underneath the animated layer so the window never falls back to a blank white slab while the animated texture is warming up
    - reduced the glass glare overlays so the pane reads as transparent again
  - `src/components/cavapendo-gallery/audio.ts`
    - the gallery cue now points to new interior-only score stems under `public/audio/cavapendolandia/gallery/` instead of the old hush file
    - meadow layers are still meadow-only; gallery debug state still reports the existing `gallery_hush` cue id for compatibility, but it now corresponds to the indoor score bed
  - added `scripts/generate_gallery_audio.py` and generated:
    - `public/audio/cavapendolandia/gallery/room-score-a.ogg`
    - `public/audio/cavapendolandia/gallery/room-score-b.ogg`

- Verification after the window/score correction:
  - `npm run lint` passes
  - `npm run test` passes
  - `npm run build` passes
  - fresh Playwright gallery screenshot now shows the exterior again through the back glass instead of a white pane
  - after clearing local ambience settings, `render_game_to_text()` in the gallery reports `ambience.activeCues: ["gallery_hush"]` with default `volume: 0.72`

2026-03-27
- Gallery visual regression recovery pass completed after user screenshot review:
  - removed the fake back-window / glass-bay stack from `src/components/cavapendo-gallery/gallery-scene.tsx` and rebuilt the room around a simpler plaster-gallery shell instead
  - restored deeper frame construction with warmer wood tones, lighter mats, subtler glass, and pin details so the offerings no longer read as flat dark slabs
  - simplified `ArchPortal` in `src/components/cavapendo-gallery/scene-primitives.tsx` by removing the heavy dark backing and extra stone clutter, keeping the door read cleaner
  - softened the procedural wall texture in `src/components/cavapendo-gallery/assets.ts` so the walls read as warm stucco rather than muddy striping
  - removed the offending door-wall trim lines that were cutting across the portal composition in the spawn shot
- Verification after the regression recovery pass:
  - `npm run lint` passes
  - `npm run test` passes
  - `npm run build` passes
  - browser screenshot review on `/galleria` now shows:
    - no giant translucent/broken band across the wall
    - a much cleaner `ESTERNO` portal silhouette
    - lighter, calmer wall treatment with less fake-glass clutter
  - note: the only observed console error during automation was the expected synthetic pointer-lock warning (`The root document of this element is not valid for pointer lock.`) triggered by automated canvas clicking, not a fresh rendering/runtime defect

- Ambient audio + meadow collision regression pass completed:
  - `src/components/cavapendo-gallery/audio.ts`
    - stopped treating all ambience loops as always-playing silent beds
    - now starts/stops loops based on actual target audibility, and force-stops meadow cues when re-entering the gallery
    - force-stops gallery hush when entering the meadow so zone transitions no longer ghost the wrong atmosphere
  - `src/lib/meadowWorld.ts`
    - added authored meadow collider data derived from trees, monoliths, shrine/house/obelisk landmarks, and deposit markers
    - added `resolvePlanarMeadowCollisions()` plus `MEADOW_PLAYER_COLLIDER_RADIUS`
  - `src/components/cavapendo-gallery/gameplay.tsx`
    - wired meadow movement through authored collider resolution before the player is reprojected back onto the globe surface
    - this makes trees, altars/deposit shrines, and major stone props behave like blockers instead of pure decoration
  - `src/test/galleryRuntime.test.ts`
    - added focused tests covering authored meadow collision push-out and a no-collision open-area case

- Verification after the ambience/collision pass:
  - `npm run lint` passes
  - `npm run test` passes (`21` tests)
  - `npm run build` passes
  - runtime sanity on `/galleria` at forced `desktop_balanced` profile now reports no meadow ambience cue active while still in `zone: "gallery"`
    - `render_game_to_text()` reports the new authored-world fields and ambience state
  - the web-game client script still appears to hang on shutdown in this environment, but it did produce capture artifacts during the pass; I inspected the generated screenshot and then used Playwright directly for the tighter interaction/debug loop
  - temporary QA output folders were removed after verification so the worktree stays cleaner

- Remaining notes after the authored-globe pass:
  - build still reports the existing large JS chunk warning
  - browser/test warnings still include React Router future-flag warnings and the upstream `THREE.Clock` warning
  - the outdoor slice is much stronger now, but there is still room to tighten creature silhouettes and meadow camera composition if the next pass is pure polish

- Stability decomposition pass completed:
  - extracted shared scene/config data into:
    - `src/components/cavapendo-gallery/types.ts`
    - `src/components/cavapendo-gallery/config.ts`
  - extracted controller/runtime-heavy gameplay pieces into:
    - `src/components/cavapendo-gallery/gameplay.tsx`
    - `src/components/cavapendo-gallery/audio.ts`
    - `src/components/cavapendo-gallery/modals.tsx`
  - rewired `src/components/CavapendoGallery.tsx` to consume the new modules instead of carrying local copies of:
    - joystick input UI
    - world controller / locomotion integration
    - render-profile downgrade guardian
    - ambient audio hook
    - offering / creature / ritual / deposit modal overlays
  - removed the duplicated local config/type blocks and dead helper leftovers from `src/components/CavapendoGallery.tsx`
  - current structure result:
    - `src/components/CavapendoGallery.tsx` shrank from 4671 lines to 3157 lines
    - the remaining file is still large, but the highest-risk mixed concerns are now split into dedicated modules

- Verification after the decomposition pass:
  - `npm run lint` passes
  - `npm run test` passes
  - `npm run build` passes
  - dedicated web-game client run against `/galleria` still produced a valid first gameplay capture and state payload after the refactor
    - screenshot: `tmp/web-game-refactor/shot-0.png`
    - state: `tmp/web-game-refactor/state-0.json`
  - direct Playwright gameplay validation after the client stalled on shutdown in this environment:
    - gallery loads with the refactored HUD / settings / guide stack intact
    - synthetic `W` movement still reaches the `ESTERNO` door prompt
    - synthetic `E` interaction still transitions gallery -> meadow
    - `render_game_to_text()` still updates correctly after the move / transition sequence
    - meadow screenshot captured after transition: `tmp/playwright-refactor-meadow.png`
  - headless Playwright still reports the upstream `THREE.Clock` warning, and a forced reload in that environment also emitted noisy WebGL draw warnings; the scene still rendered and the state hooks stayed correct

- Current follow-up opportunities:
  - continue decomposing `src/components/CavapendoGallery.tsx` by extracting the gallery and meadow scene bodies themselves
  - turn the current game-client shutdown hang into a reproducible local bug instead of a testing footnote
  - investigate whether the headless WebGL warning flood is purely environment-specific or a real scene-state issue worth guarding

- Mobile portrait recovery + HUD contrast pass completed:
  - darkened the in-game guidance / HUD surfaces in `src/components/cavapendo-gallery/overlays.tsx`
    - the mobile orientation card now uses a dark opaque panel instead of the washed-out translucent shell
    - the player HUD / guide / objective pill all use stronger background, border, and text values for readability
  - traced the broken portrait mobile runtime to the production bundle graph rather than game logic:
    - the shipped build was throwing `TypeError: Cannot read properties of undefined (reading 'useLayoutEffect')`
    - investigation showed the custom Vite manual vendor chunking was producing circular cross-chunk React / R3F helper imports in the built assets
    - removed the custom `manualChunks` vendor graph from `vite.config.ts` and let Vite emit its default dependency graph for the production build
  - kept the route-level lazy loading and preload shell intact; only the unsafe vendor split strategy was removed
  - extended earlier mobile debug output so the runtime state remains visible through:
    - `profile_locked`
    - `mobile_orientation_state`
    - `controls_layout`
    - `outdoor_radius`

- Verification after the portrait fix:
  - `npm run lint` passes
  - `npm run test` passes
  - `npm run build` passes
  - fresh portrait mobile probe against the built preview no longer throws any page errors:
    - `tmp/manual-qa/mobile-probe-errors.json` is now `[]`
    - the old `useLayoutEffect` crash path no longer reproduces
  - live mobile probe confirms the game surface mounts and exports deterministic state:
    - `window.render_game_to_text()` exists on portrait mobile after load
    - sampled state reported `zone: "gallery"`, `render_profile: "mobile_balanced"`, `mobile_orientation_state: "portrait_hint"`, and `controls_layout: "mobile_portrait"`
  - fresh portrait/landscape viewport captures were regenerated under `tmp/manual-qa/`

- Remaining notes after the portrait fix:
  - removing the custom vendor chunk map trades chunk neatness for runtime correctness; production is the priority here
  - the build no longer has the portrait white-screen bug, but it now uses Vite's default chunk layout again
  - the existing Supabase env warning in the utility tests is still expected and unrelated

- Whole-route premium polish pass completed:
  - finished the next structural extraction in `/galleria`:
    - added `src/components/cavapendo-gallery/gallery-scene.tsx`
    - moved the live indoor gallery rendering there
    - removed the stale local meadow renderer and the remaining indoor scene implementation from `src/components/CavapendoGallery.tsx`
    - `src/components/CavapendoGallery.tsx` now acts much more like an orchestrator instead of a mixed scene/runtime file
  - indoor gallery premium pass landed in `src/components/cavapendo-gallery/gallery-scene.tsx`:
    - warmer sculptural room palette and lighting
    - richer frame materials with trim/glass instead of flatter placeholder-looking cards
    - stronger back-wall glass composition with a deeper framed reveal
    - more deliberate ceiling rails, sconces, plinths, and arch framing around `ESTERNO` / `USCITA`
  - painterly texture pass landed in `src/components/cavapendo-gallery/assets.ts`:
    - warmer layered wall texture
    - richer wood floor texture
    - denser exterior window panorama painting so the preview surface reads less fake
    - meadow grass texture now carries more tonal variation and flower flecks
  - outdoor globe polish landed in `src/components/cavapendo-gallery/meadow-scene.tsx`:
    - thicker terrain-scatter layering
    - softer/denser tree canopies and base seating
    - added a `WildflowerField` pass for mid-scale grounded detail
    - stronger shrine / house / obelisk staging and atmospheric shells
    - pushed sky discs, fog, and lighting toward a more airy painterly read without changing the authored sectors or mechanics
  - HUD / onboarding presentation cleanup landed in `src/components/cavapendo-gallery/overlays.tsx`:
    - orientation card, guide, prompt pill, and settings panel now share a darker premium surface treatment
    - player HUD is still compact but reads more intentional and less like temporary debug chrome
    - contrast remains strong on bright backgrounds while the visual style matches the world better

- Verification after the premium polish pass:
  - `npm run lint` passes
  - `npm run test` passes
  - `npm run build` passes
  - required web-game client run after the extraction/polish chunk succeeded for the short deterministic gallery pass:
    - captures under `tmp/manual-qa/premium-polish/`
    - inspected `shot-0.png` and `shot-1.png`; the indoor scene, guide, and HUD were all visibly updated and readable
    - `state-0.json` / `state-1.json` confirmed the route still mounts with valid deterministic state
  - direct headed Playwright probe confirmed the updated gallery visuals and stable state export:
    - screenshot under `tmp/manual-qa/premium-polish-headed/meadow-shot.png`
    - state export remained live and consistent from `/galleria`
  - attempted longer meadow and mobile browser probes exposed environment-specific automation limitations rather than product crashes:
    - the canned web-game client still hangs on shutdown for longer bursts in this environment
    - headless Chromium still hits the known WebGL-context failure path, producing white captures and `render_game_to_text() === null`
    - additional headed probes can also stall on shutdown after the page has already mounted, so they are useful for captures but not perfectly reliable as a fully unattended loop

- Current follow-up opportunities after this pass:
  - keep decomposing the scene stack if the next phase touches more rendering; `CavapendoGallery.tsx` is much cleaner now but still owns a lot of orchestration
  - tighten the first-time guide choreography further if the user wants more of the world visible immediately on spawn
  - if we need stronger automated meadow/mobile QA, fix the long-burst client shutdown hang and the headed-browser close flake instead of layering more ad hoc probes on top

2026-03-27
- Stability + fidelity pass started for `/galleria`.
- Landed the first runtime/layout chunk:
  - `src/components/cavapendo-gallery/runtime.ts` now exposes wrapper-aware viewport measurement via `readViewportMetrics()` and `useViewportMetrics(targetRef)`.
  - viewport state now distinguishes embedded vs fullscreen context and tracks the measured gallery surface instead of only window dimensions.
  - render profile resolution now has explicit helpers for clamping and source reporting (`manual`, `auto`, `auto_downgraded`).
  - `src/components/CavapendoGallery.tsx` now stores render-profile source and measured surface data in the deterministic snapshot / `render_game_to_text()` payload.
  - `src/pages/Galleria.tsx` now hands sizing off to the gallery surface instead of baking the header offset directly into the game root class.
- Next chunk: harden controller lifecycle/input handling, remove per-frame allocation churn, then trim medium/low render cost in the scene files.
- Controller/runtime chunk landed in `src/components/cavapendo-gallery/gameplay.tsx`:
  - fullscreen, modal, blur, and visibility transitions now clear transient input state instead of leaving movement/pointer-lock state hanging.
  - first mouse deltas after fullscreen/resize/orientation transitions are guarded so camera jumps are less likely.
  - gallery/meadow movement reuse vector refs instead of allocating new direction vectors every step.
  - door/deposit/creature/landmark proximity checks now use scalar distance math instead of per-frame `THREE.Vector3` allocation.
- Next chunk: trim medium/low render cost in the gallery and meadow scene files, then add targeted tests and rerun build/test/browser QA.
- Scene and verification pass completed:
  - `src/components/cavapendo-gallery/gallery-scene.tsx` now keeps the rich glass/transmission treatment only on `high`; `medium`/`low` use cheaper material fallbacks and lighter sparkle counts.
  - `src/components/cavapendo-gallery/meadow-scene.tsx` now trims grass, flower, cloud, and tree density harder on `medium`/`low`, and repeated decorative meshes use lower segment counts outside the `high` tier.
  - `src/test/galleryRuntime.test.ts` covers wrapper-aware viewport metrics, profile clamping/source reporting, and control-profile scaling.
  - `src/hooks/use-mobile.tsx` now classifies mobile by coarse pointer/touch capability plus short side, so landscape phones no longer flip into desktop mode.
  - `src/pages/Galleria.tsx` now guarantees a real embedded min-height for the game surface, fixing the portrait collapse seen during mobile QA.

- Final verification after the stability/fidelity pass:
  - `npm run lint` passes.
  - `npm run test` passes with 19 tests across 6 files.
  - `npm run build` passes.
  - desktop QA via `tmp/cavapendo_desktop_qa.mjs` reached the meadow successfully:
    - screenshot: `tmp/manual-qa/desktop-meadow.png`
    - state export: `tmp/manual-qa/desktop-state.json`
    - state confirms `zone: meadow` with the expected outdoor landmark summary and no modal stuck open.
  - mobile QA via `tmp/cavapendo_mobile_probe.mjs` now reports correct embedded surface sizing and layout modes:
    - portrait state: `tmp/manual-qa/mobile-portrait-state.json` -> `surface.height: 788`, `mobile_orientation_state: portrait_hint`, `controls_layout: mobile_portrait`
    - landscape state: `tmp/manual-qa/mobile-landscape-state.json` -> `surface.width: 844`, `mobile_orientation_state: landscape`, `controls_layout: mobile_landscape`
    - screenshots: `tmp/manual-qa/mobile-probe.png`, `tmp/manual-qa/mobile-landscape-viewport.png`
    - console/page errors remain empty in `tmp/manual-qa/mobile-probe-errors.json`
  - headless fullscreen automation is still the one caveat:
    - the settings-button fullscreen click path in headless Chromium still reports `fullscreen: false`, so fullscreen wiring is implemented and state-safe, but a fully trustworthy automated fullscreen confirmation likely still needs a headed/manual pass or a less brittle browser harness.

- Follow-up visual polish pass completed on `/galleria`:
  - `src/components/CavapendoGallery.tsx` now mounts the Three scene inside an explicit absolute-fill surface so the canvas no longer falls back to the browser-default 150px height in embedded mobile/desktop layouts.
  - `src/components/CavapendoGalleryShell.tsx` no longer blocks first mount on asset/audio warmup; the scene mounts after the bundle is ready and preheating continues in the background.
  - `src/components/cavapendo-gallery/assets.ts` now caps warmup time for audio preloads so the preload card cannot hold the route indefinitely.
  - `src/components/cavapendo-gallery/overlays.tsx` got a second presentation pass:
    - mobile guide behavior is now pill-first instead of opening a tall left-side card over the controls.
    - the portrait rotation overlay now reads cleanly over the mounted gallery instead of competing with guide/HUD layers.
    - player HUD guide reopen affordance is desktop-only, reducing handheld chrome.
    - mobile landscape objective guidance now sits as a centered compact pill, leaving the twin-stick controls readable.

- Verification after the visual follow-up:
  - `npm run lint` passes.
  - `npm run test` passes with 19 tests across 6 files.
  - `npm run build` passes.
  - fresh mobile captures against the updated dev server show the intended UI split:
    - portrait rotation prompt: `tmp/manual-qa/mobile-portrait-viewport-4177.png`
    - portrait state: `tmp/manual-qa/mobile-portrait-state-4177.json`
    - landscape playfield with compact guide pill: `tmp/manual-qa/mobile-landscape-viewport-4177.png`
    - landscape state: `tmp/manual-qa/mobile-landscape-state-4177.json`
  - fresh desktop meadow pass confirms the high-tier outdoor read still holds after the surface/layout changes:
    - screenshot: `tmp/manual-qa/desktop-meadow-4177.png`
    - state export: `tmp/manual-qa/desktop-state-4177.json`

- Full-wall exterior glazing pass completed on `/galleria`:
  - `src/components/cavapendo-gallery/gallery-scene.tsx` no longer treats the `ESTERNO` view as a centered inset pane over a solid back wall.
  - the entire back wall is now a near floor-to-ceiling glazed surface with the exterior painting + animated sky layer spanning wall width.
  - removed the back-wall wainscot, opaque upper infill, and back sconces so the exterior reads as one continuous world surface behind the outdoor portal.
  - kept a lighter structural frame/mullion system so the `ESTERNO` arch still sits in front of a believable gallery facade instead of floating in blank space.

- Verification after the full-wall glazing pass:
  - `npm run build` passes.
  - browser QA on `http://127.0.0.1:4181/galleria` confirms the whole back wall now shows the outside world instead of a small inset pane.
  - reference screenshot: `/var/folders/bm/mrfv93d96_l4nmxff2nf1fcw0000gn/T/playwright-mcp-output/1774591851048/page-2026-03-27T11-16-12-064Z.png`

- Exterior depth/composition follow-up completed:
  - simplified the glazing rhythm in `src/components/cavapendo-gallery/gallery-scene.tsx` from multiple interior mullions to a cleaner central seam plus perimeter frame.
  - upgraded the animated exterior layer with a softer sky grade, extra distant ridge depth, moving mist bands, warmer meadow lighting, denser foreground reeds, and small drifting motes so the wall reads less like a flat painted card.
  - upgraded the static fallback in `src/components/cavapendo-gallery/assets.ts` to match the animated pass more closely, so the window still reads as a layered world if the animated texture is late or unavailable.

- Verification after the exterior depth/composition follow-up:
  - `npm run build` passes.
  - `npm run lint` passes.
  - live browser screenshot after refresh: `/var/folders/bm/mrfv93d96_l4nmxff2nf1fcw0000gn/T/playwright-mcp-output/1774591851048/page-2026-03-27T11-22-35-258Z.png`
  - web-game client artifact after key-based prelude dismiss:
    - screenshot: `tmp/web-game-client/full-wall-depth-pass/shot-0.png`
    - state: `tmp/web-game-client/full-wall-depth-pass/state-0.json`

- Door/glass correction follow-up:
  - the first `ESTERNO` threshold pass regressed into a hard white inner rectangle and oversized beam overlays; removed that treatment.
  - `src/components/cavapendo-gallery/scene-primitives.tsx` now supports brightened arch trim, but the current gallery usage backs off from forcing a white boxed inner frame.
  - `src/components/cavapendo-gallery/gallery-scene.tsx` now:
    - removes the center mullion slicing through the `ESTERNO` doorway
    - localizes the warm light spill to a smaller bright opening + narrow floor beam instead of giant wall-spanning beams
    - reduces the glass overlay stack so the pane reads more subtly instead of as a heavy post-effect
  - `src/components/cavapendo-gallery/assets.ts` tones down the glass texture streaks/gloss so the pane is less stylized.

- Verification after the door/glass correction follow-up:
  - `npm run build` passes.
  - `npm run lint` passes.
  - clean-state browser screenshot after reload: `/var/folders/bm/mrfv93d96_l4nmxff2nf1fcw0000gn/T/playwright-mcp-output/1774591851048/page-2026-03-27T11-34-47-544Z.png`
  - remaining art note: the door is now cleaner, but a truly convincing threshold likely needs a dedicated door-opening mask/texture treatment instead of more generic plane stacking.

- Lower-hemisphere exploration + horizon population pass:
  - `src/lib/meadowWorld.ts` now opens the meadow’s outer arc further with a lower `MEADOW_MIN_NAV_NORMAL_Y`, gentler but wider deep-south terrain shaping, stronger flattening under authored southern landmarks, and smaller tree/monolith collider radii so the lower route stops feeling artificially blocked.
  - added a deeper south asset layer in `src/lib/meadowWorld.ts`: new core-visual beacons/lanterns (`faro-del-sud-profondo`, `sole-del-fondo`, `arco-dell-orlo-profondo`, `lanterna-della-curva-bassa`, `veglia-del-fianco-lungo`), new deep-south trees, monolith spines, reeds, grass patches, cloud banks, and creature routes across west/center/east lower arcs.
  - `src/components/cavapendo-gallery/assets.ts` softens the meadow shadow texture so it no longer paints one hard dark-green seam between the “inhabited” and “empty” halves of the globe.
  - `src/components/cavapendo-gallery/meadow-scene.tsx` now renders a non-colliding peripheral silhouette band around the outer shoulder of the meadow so return-court and lower-rim views pick up large readable canopy/glow forms instead of collapsing into bare horizon.

- Verification after the lower-hemisphere pass:
  - `npm run test -- src/test/galleryRuntime.test.ts` passes.
  - `npm run lint` passes.
  - `npm run build` passes.
  - current spawn-facing meadow screenshot after HMR shows the horizon shoulder populated instead of blank:
    - `tmp/current-meadow-after2.png`
  - current meadow state from the browser debug hook still resolves multiple southern landmarks from the lower route:
    - `visible_landmarks`: `casa-del-sole-basso`, `specchio-del-fondo`, `lanterna-del-fondo-centrale`, `veglia-del-sud-est`, `lanterna-della-curva-bassa`, `veglia-del-fianco-lungo`, `sole-del-fondo`, `arco-dell-orlo-profondo`

- 360 meadow readability follow-up:
  - desktop `auto` is still capped correctly:
    - `src/components/cavapendo-gallery/runtime.ts` keeps desktop auto-downgrade pinned to `desktop_balanced` as the lowest automatic floor.
  - `src/components/cavapendo-gallery/gameplay.tsx` now resolves `set_meadow_debug_pose(...)` through `resolvePlanarMeadowCollisions(...)` before placing the camera, so debug QA no longer drops straight into authored tree/monolith colliders.
  - `src/lib/meadowWorld.ts` now pushes the decorative skyline ring materially farther out and adds a second non-blocking ridge layer via `MEADOW_SKYLINE_RIDGES`, so the outer world reads more like a distant inhabited shell instead of giant near-camera props.
  - `src/components/cavapendo-gallery/meadow-scene.tsx` now renders:
    - slimmer distant skyline trees with saner world-scale sizing
    - a far ridge band behind the authored meadow
    - an extra `OuterScatterField` of shrubs/reeds/stones/glow stalks across west/south/east outer arcs so exploration outside the entry cluster stops collapsing into empty lawn
  - `src/test/galleryRuntime.test.ts` now covers skyline ridge preservation on medium/low tiers.

- Verification after the 360 readability follow-up:
  - `npm run lint` passes.
  - `npm run test -- src/test/galleryRuntime.test.ts` passes with 20 tests.
  - `npm run test` passes with 35 tests across 6 files.
  - `npm run build` passes.
  - browser QA artifacts from the current pass:
    - fresh walked meadow state after entering from the gallery: `tmp/qa-current-walk-after-scatter.png`
    - deep-south debug pose after the outer scatter/ridge pass: `tmp/qa-deep-south-after-scatter.png`
    - east-rim debug pose after the skyline scale correction: `tmp/qa-east-ridge-after-fix.png`

- Remaining caveat from the current browser harness:
  - headless Chromium is still noisy with repeated `GL_INVALID_OPERATION: glDrawArrays: Vertex buffer is not big enough for the draw call` warnings once the meadow is live. This appears during browser automation, but the build and runtime tests are clean. If the next agent continues the meadow art pass, recheck this in a headed browser before assuming it is a real player-visible regression.

- Southern-hemisphere wall fix:
  - the real blocker was not just sparse content or collider density; the meadow navigation path still converted movement through the old upper-hemisphere inverse (`x / y`, `z / y`) even after the world art expanded southward.
  - `src/lib/meadowWorld.ts` now uses a rotation-based radial mapping for meadow navigation and exposes `getPlanarFromMeadowNormal(...)` as the inverse used by gameplay.
  - `src/components/cavapendo-gallery/gameplay.tsx` now resolves meadow movement through that inverse instead of clamping against `MEADOW_MIN_NAV_NORMAL_Y`, which was effectively acting like a fake equator wall before collision resolution even ran.
  - `src/test/galleryRuntime.test.ts` now includes a regression that round-trips deep-south coordinates just beyond the old clamp threshold (for example `z = -168`) so the southern wall cannot quietly return.

- Verification after the southern-wall fix:
  - `npm run lint` passes.
  - `npm run test -- src/test/galleryRuntime.test.ts` passes with 21 tests.
  - `npm run test` passes with 36 tests across 6 files.
  - `npm run build` passes.
  - one geometry caveat remains: the current planar coordinate model is still latitude/longitude-like, so exact south-pole crossing is a singularity. The fake wall before the pole is fixed; a true full over-the-pole traversal would require a larger movement-state refactor.

- Lower-horizon population follow-up:
  - the bottom hemisphere still looked empty from ordinary views because too much of the skyline band was pushed absurdly far out (`z` near `-200`) and would still sink under the globe curve from representative south-facing frames.
  - `src/lib/meadowWorld.ts` now adds a nearer lower-horizon crown:
    - new skyline trees/beacons at `skyline-west-lower-crown`, `skyline-southwest-near-beacon`, `skyline-south-inner-west-crown`, `skyline-south-near-meridian`, `skyline-south-inner-east-crown`, `skyline-southeast-near-beacon`, and `skyline-east-lower-crown`
    - new skyline ridges at `ridge-west-lower-step`, `ridge-southwest-inner`, `ridge-south-inner-ring`, `ridge-southeast-inner`, and `ridge-east-lower-step`
  - the lower playable surface also got more non-collider population:
    - new grass bands across `lower-west-shoulder`, `lower-meridian-band`, `lower-east-shoulder`, `far-south-west-band`, `far-south-east-band`, and `far-south-meridian-halo`
    - new reed stands across `lower-west-rim-reeds`, `lower-meridian-halo-reeds`, and `lower-east-rim-reeds`
  - `src/components/cavapendo-gallery/meadow-scene.tsx` now thickens `OuterScatterField` with three extra lower-world bands (`lower-west-rim`, `lower-meridian`, `lower-east-rim`) so the bottom side has more visible shrubs/stalks/stones even before the player reaches the far south.
  - `src/test/galleryRuntime.test.ts` now expects the expanded skyline population to survive on medium/low tiers, so the lower horizon cannot collapse quietly on reduced detail profiles.

- Verification after the lower-horizon population follow-up:
  - `npm run lint` passes.
  - `npm run test -- src/test/galleryRuntime.test.ts` passes with 21 tests.
  - `npm run test` passes with 36 tests across 6 files.
  - `npm run build` passes.
  - this pass was data/layout heavy; it still needs a fresh headed-browser visual check focused specifically on the lower hemisphere because the current headless harness remains noisy once the meadow is live.

- Lower-hemisphere coordinate remap + visibility correction:
  - the biggest remaining bottom-world bug was not only sparse art; a lot of the new southern authored content had been placed with unscaled coordinates that become invalidly deep southern latitudes after the repo's `scalePlanarPoint(...)*3` mapping.
  - in practice, that meant many “south” trees/ridges/beacons/grass bands were authored past the reachable lower arc and ended up reading like missing content because they sat on the far/back side of the sphere.
  - `src/lib/meadowWorld.ts` now remaps the worst offenders back into valid southern latitudes:
    - core southern landmarks such as `faro-del-sud-profondo`, `sole-del-fondo`, `arco-dell-orlo-profondo`, and `meridiano-della-brace`
    - lower/southern skyline anchors in `MEADOW_SKYLINE_LANDMARKS` and `MEADOW_SKYLINE_RIDGES`
    - the extra lower-band trees, monoliths, grass patches, reeds, and lower creature routes/orbits
  - `src/components/cavapendo-gallery/meadow-scene.tsx` also remaps the lower procedural scatter bands (`lower-west-rim`, `deep-south`, `lower-meridian`, `lower-east-rim`) so the non-collider filler actually lands on the visible lower world instead of behind it.
  - `src/components/cavapendo-gallery/assets.ts` further softens the meadow shadow wash and lowers its scene opacity so the ground no longer reinforces a false “alive side / dead side” seam.
  - `src/test/galleryRuntime.test.ts` now adds a regression that keeps core southern authored content inside the reachable lower-arc latitude budget, so future passes cannot quietly author another batch of south-band content behind the globe.

- Verification after the lower-hemisphere coordinate remap:
  - `npm run lint` passes.
  - `npm run test` passes with 37 tests across 6 files.
  - `npm run build` passes.
  - live browser QA on `http://127.0.0.1:4184/galleria` now shows the deep-south debug pose resolving a populated lower arc instead of grass + sky only:
    - `visible_landmarks` includes `brace-del-sud-ovest`, `lanterna-del-fondo-centrale`, `veglia-del-sud-est`, `lanterna-della-curva-bassa`, `veglia-del-fianco-lungo`, `faro-del-sud-profondo`, `sole-del-fondo`, `arco-dell-orlo-profondo`, `corona-del-ponente`, `specola-della-conca`, `meridiano-della-brace`, `anello-del-rim-est`, and `vedetta-del-levante`
    - `horizon_landmarks` remains fully populated at the same time, confirming the skyline ring survived the remap instead of collapsing.
  - current browser screenshot after the remap:
    - `/var/folders/bm/mrfv93d96_l4nmxff2nf1fcw0000gn/T/playwright-mcp-output/1774591851048/page-2026-03-27T16-14-16-651Z.png`
  - one remaining art note: the lower hemisphere is materially less empty now, but the current south-facing frame still reads as a sheltered grove/basin rather than a grand composed vista; the next pass should improve landmark rhythm and sightlines, not reintroduce extreme south coordinates.

- March 28 finish pass:
  - shared route loading is no longer a blank wait state:
    - `src/App.tsx` now uses a branded atmospheric fallback with copy and framing that matches the site tone instead of flashing a generic empty screen during lazy route loads.
  - `/galleria` page shell is more intentional:
    - `src/pages/Galleria.tsx` now adds a darker radial room backdrop plus subtle frame lines so the gallery surface feels embedded in a designed page instead of dropped into plain black.
  - gallery material/threshold cleanup:
    - `src/components/cavapendo-gallery/assets.ts` now uses a warmer plaster wall texture and a softer meadow shadow wash so the old muddy wall/seam treatment is reduced.
    - `src/components/cavapendo-gallery/gallery-scene.tsx` now lightens frame tones, refines the sconces, and splits the `ESTERNO` wall into separate glass side/top panels around the portal void instead of one flatter projected-wall read.
    - the threshold lightwell was strengthened with a hotter core and more localized rays so the doorway detaches more clearly from the glazed wall.
  - meadow composition follow-up:
    - `src/lib/meadowWorld.ts` now lowers the initial meadow pitch/yaw to show more horizon and adds a real south-handoff band much closer to normal play:
      - return-facing skyline anchors moved inward and enlarged (`skyline-return-left-crown`, `skyline-return-threshold-beacon`, `skyline-return-right-crown`)
      - new handoff skyline anchors (`skyline-return-south-left`, `skyline-return-south-meridian`, `skyline-return-south-right`)
      - new return-facing ridges (`ridge-return-left-shoulder`, `ridge-return-right-shoulder`) plus a smaller/lower `ridge-return-forward`
      - new near-south trees, monoliths, grass patches, reeds, and one broad `south-handoff` terrain band so the ordinary exit view and the first southern arc have actual mid-ring structure
    - `src/components/cavapendo-gallery/meadow-scene.tsx` now widens the rendered world instead of over-pruning it:
      - `OuterScatterField` includes three new south-handoff bands and denser west/south/east coverage
      - landmark/deposit exclusion radii inside the scatter pass were reduced so more filler actually survives between authored anchors
      - skyline tree/ridge silhouettes render slightly fuller and brighter so they read from ordinary horizon frames instead of only appearing in debug summaries
  - browser QA after this pass:
    - return-court ordinary view is materially fuller than before; current artifact:
      - `tmp/qa-meadow-current-2.png`
    - the deep-south debug pose no longer reads as grass + sky only, but one probe still landed inside a dense lower-world cluster:
      - `tmp/qa-deep-south-current.png`
    - that means the lower hemisphere is more populated, but deep-south camera composition still needs another deliberate pass; this turn fixed the emptiness more than it fixed the final art direction.
  - verification after the March 28 finish pass:
    - `npm run lint` passes.
    - `npm run test` passes with 38 tests across 6 files.
    - `npm run build` passes.

- March 28 forecourt + anti-gamification follow-up:
  - outdoor arrival and HUD were still too prototype-like after the earlier finish pass:
    - the first meadow frame still read as a blank green hump with thin horizon dressing
    - the center guide pill was still pulling the eye during ordinary wandering
    - the small-planet read was still too strong from normal play even though the southern-wall bugs were fixed
  - `src/lib/meadowWorld.ts`
    - pushed the meadow radius from `420` to `1200` and moved the planet center to match, so ordinary play reads much flatter and less like a toy globe
    - added dedicated terrain shaping/flattening for the threshold forecourt and its south lane (`forecourt-shelf`, `forecourt-south-lane`, `forecourt`, `forecourt-lane`)
    - moved the first west / south / east handoff landmarks closer to the arrival view:
      - `lantern-crown`
      - `cedro-vecchio`
      - `spirale-dei-reeds`
      - `obelisco-pallido`
      - `meridiana-del-bacino`
    - shifted the meadow spawn slightly forward and reduced the default downward pitch so the first exterior look carries more horizon and less dead foreground
    - renamed the mixed-language sector label `Forecourt` to `Radura di soglia`
  - `src/components/cavapendo-gallery/meadow-scene.tsx`
    - added a dedicated `ThresholdForecourtComposition` made of broad path plates and three visible threshold sentinels/beacons, so the first exterior view now has real foreground and midground structure instead of pure grass
  - `src/components/CavapendoGallery.tsx`
    - hid the center guide pill during normal meadow wandering; it now stays present in the gallery and around actual ritual/deposit contexts instead of reading like a mission UI over the landscape
    - removed the extra outdoor landmark chip from the player HUD so the scenery has room to breathe
  - browser QA after the forecourt follow-up:
    - the first exterior arrival is materially stronger now:
      - `tmp/2026-03-28-forecourt-view-after-flattening.png`
    - a south-basin ordinary frame is cleaner and less cluttered:
      - `tmp/2026-03-28-south-basin-ui-cleaner.png`
  - verification after the forecourt follow-up:
    - `npm run lint` passes.
    - `npm run test` passes with 38 tests across 6 files.
    - `npm run build` passes.
  - remaining caveat:
    - headless Chromium is still noisy in long meadow sessions and threw repeated WebGL `GL_INVALID_OPERATION` warnings during one live QA pass, so the next serious art-direction pass should use headed visual QA as the source of truth.
