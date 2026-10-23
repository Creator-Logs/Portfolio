# Portfolio v2 — Planning Index

New portfolio for **Ansh Gupta** (Systems Engineering & Design, UIUC). 3D-first, dark "workshop" aesthetic,
built from the references **oryzo.ai** (mood, cinematic 3D, type) and **hervestudio.github.io/badge-factory**
(maker-bench structure, numbered build chapters, spec lines, physics on a cutting mat).

Each page is built in its **own Claude session** to keep quality high. This folder is the shared brain
between those sessions.

## Files

| File | Purpose |
|---|---|
| [ARCHITECTURE.md](ARCHITECTURE.md) | Stack, folder layout, teardown of the old site, shared components, routes |
| [DESIGN.md](DESIGN.md) | Design system: palette, type, grid, motion, components, tone, reference breakdown |
| [3D_GUIDE.md](3D_GUIDE.md) | Fusion 360 → web pipeline, shading/lighting best practices, material presets, perf budget |
| [pages/landing.md](pages/landing.md) | Landing page (hero trinkets, TapCarry monitor, selected works, bench, experience, contact) |
| [projects/_TEMPLATE.md](projects/_TEMPLATE.md) | Shared project-page skeleton |
| [projects/fsae-steering-wheel.md](projects/fsae-steering-wheel.md) | Illini EV steering wheel |
| [projects/3d-printer.md](projects/3d-printer.md) | Core-XY 3D printer — **PRESERVED page, port faithfully** |
| [projects/imu-jump-wearable.md](projects/imu-jump-wearable.md) | IMU jump-height wearable |
| [projects/bike-camera-gimbal.md](projects/bike-camera-gimbal.md) | Bike-mounted 3-axis camera gimbal |
| [projects/tapcarry.md](projects/tapcarry.md) | TapCarry wallet loyalty platform |
| [projects/garage-inventory.md](projects/garage-inventory.md) | The Garage makerspace inventory system |

## Build order

1. **Landing page** — includes the foundation work: tear down the old site, install the stack, build the
   design tokens + shared 3D layer + nav/footer. Everything after this depends on it.
2. **3D Printer** — port of the existing page. Proves out the project-page route + template.
3. **FSAE Steering Wheel** (highest-priority engineering project)
4. **IMU Jump-Height Wearable**
5. **Bike Camera Gimbal**
6. **TapCarry** (reuses the landing monitor scene)
7. **Garage Inventory**

## Session protocol (every page)

1. Start a new session: *"Build `<page>` per `docs/portfolio/<path>.md`."*
2. Claude reads `CLAUDE.md` → this README → DESIGN → 3D_GUIDE → ARCHITECTURE → the page file.
3. **STEP 0:** Claude asks Ansh what he already has for the page (the questions are listed at the top of
   each page file). Ansh answers / drops assets into the repo.
4. Claude confirms the section plan against what Ansh provided, then builds.
5. Questions in the page's "Questions for Ansh" section are asked as they become relevant during the build
   (not all at once) — answers get written back into the file.
6. Verify (see the page's "Done when" list), run `npm run build`, check desktop + mobile + reduced-motion.
7. Update the status table below.

## Where to put assets

- Raw source files (Fusion exports, STEP, FBX, videos before compression): `assets-src/<slug>/` (gitignored if large).
- Web-ready files: `public/models/<slug>/*.glb`, `public/project_media/<slug>/*.webp|mp4|webm`.
- See 3D_GUIDE.md for export settings.

## Status

| Page | Status | Notes |
|---|---|---|
| Foundation (in landing session) | ✅ done | Stack, tokens, shared 3D layer, runtime rules (3D_GUIDE §7b), STEP→GLB pipeline (§1.0) |
| Landing | ✅ done | Hero mat, steering-wheel showcase, selected works, bench, contact. Cut by Ansh: blueprint intro, TapCarry section, experience. Visuals pass 2026-10-22: baked AO + shader detail, Cycles product renders, HD posters, portrait. |
| 3D Printer | ✅ done | Faithful v1 port + mobile stacking, light nav, build volume 200 × 185 × 160 (v1), Core-XY SVG demo, Manufacturing rows (text; photos pending). |
| FSAE Steering Wheel | ✅ done | Drag-to-turn hero, pinned labelled exploded view with popovers (per-part-group GLB), full-stack FEA viewer (min FoS 3.7), grips strip, pinned waterjet cut file drawing itself, results + lessons. Lug calc card and drawings removed by Ansh. Loop videos: MP4 first + tap-to-play (iOS fix). |
| IMU Jump-Height Wearable | ☐ not started | |
| Bike Camera Gimbal | ☐ not started | |
| TapCarry | ☐ not started | |
| Garage Inventory | ☐ not started | |

## Decisions already made (2026-10-22)

- Mood: **dark workshop** (Oryzo palette & cinematic lighting + Badge Factory bench/chapter structure).
- TapCarry on the landing page: 3D monitor plays a **recorded scroll video** of the TapCarry landing page;
  click → camera zooms in and swaps to a **live iframe**.
- Out of scope for now: FSAE Dashboard/Telemetry, Deep Learning/nanoGPT, Hero MotoCorp internship.
- Engineering-resume projects take priority in ordering and depth.
