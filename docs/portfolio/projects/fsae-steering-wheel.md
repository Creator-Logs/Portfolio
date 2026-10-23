# Project: FSAE Electric Steering Wheel — Illini Electric Motorsports

> Route: `/projects/steering-wheel` · Order: **01** (highest priority — top of the engineering résumé)
> Role: Steering Wheel Project Lead, Cockpit (Aug 2025 – Apr 2026) · Tools: PTC Creo, Ansys Mechanical, CNC mill,
> waterjet, SLS, FDM, 3D scanning

---

## STEP 0 — Ask Ansh before writing any code (mandatory)
1. "What do you already have for the steering wheel?" — Creo files/exports, renders, FEA screenshots/reports,
   hand-calc sheets / FBDs, machining drawings, 3D scans of the clay grips, photos/videos of machining & waterjet,
   photos of the assembled prototype, driver-evaluation photos, design review slides.
2. "Are there team / sponsor / competition restrictions on publishing the CAD or FEA?" (FSAE teams sometimes restrict this.)
3. "Do you have a photo of the wheel on the car or with a driver?"

---

## Page plan v2 (2026-10-22) — supersedes "Section spec" below where they differ
Built from Ansh's media (`~/Downloads/Steering Wheel Assets/`, 14 files) + `Desktop/IEM/` + the FEA viewer.
Rule from Ansh: a 3D-led page with a **labelled exploded view**, not a page of pictures.

### Media triage (8 of 14 used)
| File | What it is | Use |
|---|---|---|
| `A001_01311736_C022.MOV` (8.7 s, 4K) | Structured-light scanner + turntable projecting onto the clay grip on an acrylic plate | **Ch 03 loop** (hero of the grips chapter) |
| `A001_01311827_C035.MOV` (12.6 s) | Raw scan mesh of the grip turning on screen | **Ch 03 loop**, step 2 |
| `A001_02251424_C043.MOV` (15 s, 4K) | CNC mill cutting the triangular standoff | **Ch 05 loop** |
| `F7CA10FC….jpg` | Finished standoff stack with studs | Ch 05 photo |
| `IMG_9298.HEIC` | Top-down: waterjet CF plate + both grips | Ch 05 / results (best "it's real" shot) |
| `IMG_9606.JPG` | Partial wheel mounted in the car, gold QD visible | **Results** — honest "on the car, mid-build" |
| `16CBD5D0….jpg` | PCB sandwiched on the aluminium standoff on the CF plate | **Lessons** (it literally shows the decision Ansh would change) |
| `Screenshot 2026-10-22 200924.png` | Lug hand calcs (600 lbf·in → 200 lbf/bolt; net-section 44.9, tear-out 35.6, bearing 49.2) | **Ch 02 calc card** — re-typeset, original as thumbnail |
| skipped | `IMG_9297` (dup of 9298, angled), `IMG_9486` (blurry), `IMG_9487` (feet in frame — maybe a tight crop), `4965194A` (single standoff, weaker than F7CA), `C026` (scan alignment, 26 s — C035 tells it cleaner), `79350780118….MOV` (portrait dup of C043; maybe mobile-only) | |
No waterjet footage exists → animate the **real cut file** (`IEM/Steering Wheel Waterjet DXF.dxf`) as an SVG toolpath instead.

### Sections
1. **Hero** — pinned 3D wheel (existing detail GLB), rim-sweep on scroll. `STEERING WHEEL` / Formula SAE Electric · Illini
   Electric Motorsports / role line `PROJECT LEAD · COCKPIT · AUG 2025 – APR 2026` / tool chips (Creo, Ansys, CNC, waterjet, SLS, scan).
2. **The brief** — goal paragraph + requirement rows (dotted rules): `180 LBF PUSH / PULL` · `600 LBF·IN TORQUE` ·
   `QUICK-DISCONNECT` · `WATERPROOF ENCLOSURE` · `ELECTRONICS PACKAGED WITH THE ELECTRICAL TEAM`.
3. **01 / THE STACK-UP — the centrepiece.** Pinned scroll: the wheel turns to a 3/4 view, then explodes along the column
   axis layer by layer (front panel + window → enclosure + gaskets → PCB → baseplate → grips out sideways → standoffs →
   QD). Each group gets a **leader line + label** (mono name + one spec line) that draws in as it separates. At full
   explode the orbit unlocks (`EXPLORE IN 3D`); click/tap a part (or its DOM list row) → part popover (material ·
   process · why). Needs a new model build that joins per *part group*, not per material (see 3D treatment).
4. **02 / PROVING IT** — left: typeset **lug calc card** from Ansh's sheet (load path: 600 lbf·in ÷ 1 in ÷ 3 bolts =
   200 lbf/bolt; three failure modes with FoS) + thumbnail of the handwritten original. Then: "hand calcs cover one lug;
   the whole stack needs FEA" → the **FEA viewer** (`components/steering/FeaViewer.tsx`, done).
5. **03 / SHAPED BY HANDS** — three-step strip: clay (frame from C022) → scan (C022 loop) → mesh (C035 loop) → final
   grip (3D grip from the exploded model, or IMG_9298 crop). Short copy on driver-sculpted ergonomics.
6. **04 / MAKING IT** — CNC loop (C043) + standoff stack photo (F7CA); waterjet: DXF toolpath drawing itself on scroll
   + "20-ply CF, pilot holes against delamination"; released drawings strip (PDF thumbnails: standoff, tri-standoff,
   base plate, enclosure).
7. **05 / WHERE IT LANDED** — IMG_9606 large (caption: partial wheel on the car mid-build; the final wheel didn't make
   it onto the car) + IMG_9298. **What I'd change** with photo 16CBD5D0: don't sandwich the electronics with a standoff —
   carbon or aluminium enclosure carries the load directly. One line: later Dashboard & Telemetry role.
8. **Next project** → 3D Printer.
(Gasket chapter cut — Ansh 2026-10-22.)

### Build order
1. ✅ Model: `scripts/models` variant that joins per part group (new config key `groups: [[regex, id]]`) → `steering-wheel-parts.glb`; QA vs detail.
   *Done 2026-10-22* — `scripts/models/steering-wheel-parts.json`, 8.9 MB, QA 0.017 % ✅ vs detail at explode 0 (use this
   one GLB for hero **and** stack-up). 14 groups, offsets in the config, read at runtime from `userData.explode`:
   `controls` (knobs, dials, encoders, quad O-ring) · `front_panel` (+ polycarb window, its screws/nuts) · `front_gasket`
   · `hub_bolts` (3× NAS 6203) · `grip_left` / `grip_right` (+ thumb buttons, screws, heat-set inserts) · `base_plate` ·
   `enclosure_gasket` · `standoff` · `pcb` · `tri_standoff` · `enclosure` (+ bumpers, screws, locknuts) · `qd_gasket` ·
   `qd` (+ lock nut, stainless nuts). Previews: `docs/portfolio/reference/models/steering-wheel-parts-*.png`.
   **CAD findings that change the stack-up order above:** the enclosure sits on the *column* side of the plate (driver
   side = controls → front panel → gasket → plate); the electrical board is in the STEP (unnamed `2026-01-12-*` parts,
   110 × 64 mm) sandwiched between standoff and tri-standoff — the exact detail in the "what I'd change" photo, so the
   exploded view can point at it. Board = black soldermask (photo 16CBD5D0); its small components are plain black.
   **For step 4:** `materials.ts` needs the `_ao` → `_ao_x` mix (uniform per Model) — the dev page only swaps at t ≥ 0.5.
   Size is over the 6 MB hero budget (threaded fasteners); if mobile needs it, `build.sh steering-wheel-parts mat`.
   Source media copied into the repo: `assets-src/steering-wheel/media/` (all 14 files) + `iem/` (waterjet DXF, drawings).
2. ✅ Media: HEIC → WebP, 4K MOV → 1080p H.264/WebM loops (muted, ≤ 3 MB each, poster frames) into `public/project_media/steering-wheel/`.
   *Done 2026-10-22* — reproducible: `.venv-models/Scripts/python -I scripts/media/steering-wheel.py` (sources in
   `assets-src/steering-wheel/media/`; crops/trims/quality in the script). Photos: EXIF-rotated, Display-P3 → sRGB,
   long edge 2560. Loops: 1440×1080 (4:3, 12 fps as shot), last 0.5 s crossfades into the start so handheld clips loop
   cleanly; poster = loop's first frame.
   | File | From | Size |
   |---|---|---|
   | `scan-rig.mp4/.webm/.webp` | C022, cropped to scanner + turntable | 1.51 / 0.77 MB, 8.2 s |
   | `scan-mesh.mp4/.webm/.webp` | C035, taskbar cropped | 2.17 / 1.36 MB, 12.1 s |
   | `cnc-standoff.mp4/.webm/.webp` | C043, full frame | 1.72 / 1.11 MB, 14.6 s |
   | `clay-grip.webp` | C022 @ 4.6 s (projector off) — Ch 03 "clay" step | 59 kB |
   | `standoff-stack.webp` · `plate-grips.webp` · `on-car.webp` · `pcb-sandwich.webp` · `lug-calcs.webp` | F7CA · IMG_9298 · IMG_9606 · 16CBD5D0 · screenshot | 277 · 448 · 674 · 833 · 78 kB |
3. ✅ Route `app/projects/steering-wheel/page.tsx` + sections in `components/steering/`; reuse ChapterHeader, SpecLine, SceneBlock, PillButton.
   *Done 2026-10-22* — copy + part data in `content/steering-wheel.ts`; sections `WheelHero` (+ `WheelHeroScene`),
   `WheelBrief`, `StackUp` (part list; empty `data-stage="exploded-view"` box for step 4), `ProvingIt` (FeaViewer),
   `ShapedByHands`, `MakingIt`, `WhereItLanded`, `project/NextProject` → 3D Printer. New UI: `ui/LoopVideo`, `ui/Figure`
   (in DESIGN.md §5). Changes from the plan, per Ansh mid-session:
   - **Hero: drag to turn the CAD**, no scroll rotation (mouse both axes, touch horizontal, arrow keys). One screen, not pinned.
   - **FEA shows the whole model**, plate at full strength, labelled "20-ply carbon fiber sheet"; plate has no peak/FoS
     numbers (the solve used a stand-in material for it). Default view moved to a back 3/4 so the plate face reads.
   - **Mesh loop = C026** (scan alignment, first 14 s), not C035. **Print photo rotated 90°** (horns up, whole wheel).
   Still for step 4: exploded-view scene + popovers, calc card, DXF toolpath, drawings strip, posters (hero currently
   borrows `landing/showcase.webp`), FEA tags overflow on phones.
4. ✅ Exploded view → calc card + FEA → grips → making → results. Posters for every 3D block; reduced-motion + mobile pass; `npm run build`.
   *Done 2026-10-22:*
   - **Exploded view** (`StackUp` + `ExplodedScene` + `explodedControls`): pinned 420 svh (phones 320). Turn from the
     hero pose to a 3/4 side view (0–12 %), groups separate outermost-first (14–82 %), fully exploded from 84 %: drag
     to turn, click a part / label / list row → popover. Labels sit in 4 lanes above/below the model with leader
     lines (the column axis runs across the frame); popover lives in the left column under the list (nothing opaque
     over the canvas). AO mixes `_ao` → `_ao_x` with the explode (`Model aoExplode`, `materials.ts USE_VERTEX_AO_X`).
     Phones: no labels/popover, full list with notes below. Picking = ray vs per-group boxes (no mesh raycasts).
   - **Calc card** (`LugCalcCard`): all results derived from Ansh's inputs (`content lugCalc`) — see open question.
   - **Waterjet** (`WaterjetPath`, data from `scripts/media/dxf_to_svg.py` → `content/steering/waterjet.json`): the real
     cut file (254.0 × 150.3 mm = the base plate), holes first then contours, scroll-drawn with a "jet" dot.
     **Pinned** (Ansh 2026-10-22): 260 svh wrapper (phones 200), sticky block with the title/text + drawing; the cut
     plays over 4–86 % of it, holds complete, then the page moves on. Reduced motion: no pin, drawn complete.
   - **Drawings strip: removed** (Ansh 2026-10-22 — doesn't want them). Material facts read from the drawings' title
     blocks stay in the part specs: standoffs 7075-T6, enclosure PA 66 GF.
   - **Posters**: `scripts/posters-steering-wheel.sh` → `poster-{hero,hero-mobile,exploded,fea}.webp`.
   - FEA tags flip leftwards past 60 % of the viewer (no overflow on phones).

## Story arc
**Requirements → Design → Prove it → Make it → Hold it.**
A steering wheel that has to survive steering torque and a driver yanking on it under braking, stay waterproof,
fit the electronics, and feel right in the hands — designed, analysed, and manufactured by Ansh.

## Section spec

1. **Hero** — Title `STEERING WHEEL`, subtitle *"Formula SAE Electric · Illini Electric Motorsports"*, tool chips
   (Creo, Ansys, + machining icons), spec line `CARBON-FIBER BASEPLATE · SLS ENCLOSURE · FoS ≈ 3`.
   3D: the assembled wheel in `dark-studio`, slow rim-sweep rotation (pinned on scroll).
2. **The Goal** — Draft: *"Own the mechanical design of the team's steering wheel: a carbon-fiber baseplate, SLS
   enclosure and front panel, gaskets, ergonomic grips, and quick-disconnect standoffs — packaged around the
   electronics and strong enough for steering torque and braking push/pull."*
3. **Requirements / load cases** — dotted-rule rows: `AXIAL LOAD 180 lbf` · `TORQUE 600 lbf-in` · `MIN FoS ≈ 3`
   · `WATERPROOF ENCLOSURE` · `QUICK-DISCONNECT` · `ELECTRONICS PACKAGED W/ ELECTRICAL TEAM`. Visual: FBD diagram (SVG,
   drawn from Ansh's sketch) with arrows that animate in.
4. **Chapter 01 / THE STACK-UP** — exploded view on scroll: baseplate, enclosure, front panel, gaskets, grips,
   standoffs, QD hub. Each part gets a popover (material + process + why). Part list mono spec lines.
5. **Chapter 02 / PROVING IT** — Hand calcs (lug/bolt shear, tear-out) shown as a clean "calc card" (KaTeX or SVG),
   then **Ansys FEA**: toggle on the standoff model between material view and stress heatmap; legend with FoS.
   Copy: sized standoffs via FBDs + hand calcs + FEA → min FoS ~3 at 180 lbf axial and 600 lbf-in torque; released
   machining drawings; specified encoder O-ring fits.
6. **Chapter 03 / SHAPED BY HANDS** — grips: driver-sculpted clay mold → 3D scan → refined CAD → pocketed solid SLS
   grip (mass reduction). 3D: scan mesh morph/crossfade into final grip, or side-by-side with a slider.
7. **Chapter 04 / KEEPING WATER OUT** — gasket iteration through FDM prototypes (photo strip of iterations, v1→vN).
8. **Chapter 05 / MAKING IT** — CNC-milled standoffs; waterjet-cut **20-ply** carbon-fiber plate with pilot holes to
   prevent delamination. Shop video in a PIP / full-bleed loop.
9. **Results** — Assembled prototype photos; "built for driver evaluation"; stats: `FoS ≈ 3`, `20-PLY CF`,
   `N ITERATIONS` (ask), mass (ask).
10. **Next project** → 3D Printer.

## 3D treatment
- GLB from Creo (STEP → Blender → GLB). Part names must match the exploded-view config:
  `baseplate, enclosure, front_panel, gasket_*, grip_L, grip_R, standoff_*, qd_hub, encoder, display`.
- Materials: `carbon_fiber` (baseplate — weave normal map is essential), `sls_nylon` (enclosure, front panel, grips),
  `alu_machined` (standoffs), `rubber_silicone` (gaskets), screen/buttons as needed.
- **FEA heatmap:** preferred — Ansh exports the standoff result as an image/contour; in Blender, project it as a texture
  or bake to vertex colours; the site crossfades between materials. Alternative: approximate with a gradient shader
  along the load path — only if clearly labelled as illustrative.
- Exploded view driven by scroll in chapter 01; orbit unlocked at the end ("EXPLORE IN 3D" pill).

## Assets requested from Ansh
- [ ] Creo assembly → STEP (or per-part STL/OBJ) with named parts
- [ ] Ansys result images (stress, displacement, FoS) + load-case setup screenshot
- [ ] Hand calcs / FBD sketches (photo or PDF is fine)
- [ ] Machining drawings (PDF)
- [ ] 3D scan meshes of clay grips (OBJ/PLY/STL) + photo of clay molds
- [ ] Gasket iteration photos
- [ ] Shop photos/videos: CNC standoffs, waterjet CF plate
- [ ] Final prototype photos (studio-ish if possible), driver photos
- [ ] Team logo + permission to use it

## Questions for Ansh
- [x] Any publishing restrictions from the team? Answer: none — team is OK with CAD/FEA/logo (2026-10-22).
- [ ] Which hand calcs are worth showing (pick 1–2 headline calcs)? Answer: photos being added to the folder — pick from them.
- [x] Mass of the final wheel / mass saved by pocketing grips? Answer: skip (no mass stats).
- [x] How many gasket iterations? What failed in early ones? Answer: skip — no gasket chapter (cut chapter 04).
- [x] Did the wheel get used on the car / at competition? Any driver feedback quote? Answer: the final wheel never made it onto the car; there's a photo of a partial wheel on the car mid-progress. No driver quote.
- [x] Mention the later Dashboard & Telemetry role at all on this page? (Project itself is out of scope.) Answer: yes, mention it.
- [x] Hero interaction? Answer: drag to rotate the CAD instead of rotating on scroll (2026-10-22).
- [x] FEA framing? Answer: show the whole thing incl. the baseplate; say the plate is a 20-ply carbon fibre sheet (2026-10-22).
      (Plate stress numbers stay hidden — the solve modelled it as a stand-in; its contours are still drawn.)
- [x] Released-drawings strip? Answer: remove it — doesn't want the drawings on the page (2026-10-22).
- [x] Grips strip media? Answer: use the other mesh video (C026); rotate the print photo 90° so the whole wheel shows (2026-10-22).
- [ ] Lug calc sheet: net-section area is written 0.136 in², but (0.326 − 0.191) × 0.797 = 0.108 in² → σ ≈ 1,860 psi,
      FoS ≈ 35.5 (sheet: 1,470.6 psi, 44.9). Which should the calc card show? (Tear-out 35.6 and bearing 49.2 check out.)
- [x] Anything you'd do differently (for the lessons section)? Answer: don't sandwich the electronics with a standoff — make the enclosure carbon (load goes straight through the enclosure) or aluminium. Plastic was chosen to save weight but made electronics integration unnecessarily complex.

## Done when
- [x] Exploded view works on scroll + parts have popovers
- [x] FEA toggle uses real Ansys output (or is clearly marked illustrative)
- [ ] All numbers match the résumé or Ansh's answers — pending: lug net-section area (calc card) and FoS wording (3.7 vs ≈3)
- [x] Mobile + reduced-motion fallbacks; perf budget — one 8.9 MB GLB for hero + stack-up (over the 6 MB guideline, accepted for fidelity)
- [x] README status + answers recorded

## Assets found / answers (2026-10-22)
- Ansh wants a **labelled exploded view** as a centrepiece — not a page of pictures. Design review slides: mine them
  for content, never embed slides.
- Coming from Ansh: hand-calc photos, 3D-scan setup photo (with software view), CNC + waterjet photos, design review slides.
- `Desktop/IEM/`: Ansys project `SW-FEA.wbpj` (solved), 11 machining drawing PDFs (`Drawings/`), waterjet DXFs,
  final grip STLs (`driver_grips_*_FINAL_revA`, `New Grips.stl`), part STEPs.
- **FEA (read from the solve, `content/fea/steering-wheel.json`):** 10 bodies (baseplate, 2 standoffs, 3 NAS 6203
  bolts + nuts, QD profile); 224,339 nodes; fixed at the QD; 180 lbf axial + 600 lbf·in torque on the baseplate's
  driver face (one combined load step). Peak von Mises 18.0 ksi on standoff 1 → FoS 3.7 on 7075-T6 yield (66 ksi);
  max deflection 0.36 mm. The baseplate was analysed as **4130 steel**, not carbon. Viewer: `components/steering/FeaViewer.tsx`
  (preview `/dev/fea`).
- [x] Baseplate as 4130 (Ansh 2026-10-22): the CF plate was known to be stronger than needed, so the default steel was
  used; the study was about the **standoffs**. **Don't mention the plate's material or numbers** — present it as
  standoff FEA (viewer frames the stack, plate dimmed as context, plate excluded from the results table).
- [ ] FoS wording: viewer shows the solved 3.7 (standoff 1, yield); résumé says ≈ 3. Not yet confirmed by Ansh.
- [x] Grips: no SLS photos exist — use the FDM prototype photos (IMG_9298). Grips were printed split in halves.
- [x] PCB in `16CBD5D0….jpg` = the electrical team's steering wheel board.
