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
- [ ] Any publishing restrictions from the team? Answer:
- [ ] Which hand calcs are worth showing (pick 1–2 headline calcs)? Answer:
- [ ] Mass of the final wheel / mass saved by pocketing grips? Answer:
- [ ] How many gasket iterations? What failed in early ones? Answer:
- [ ] Did the wheel get used on the car / at competition? Any driver feedback quote? Answer:
- [ ] Mention the later Dashboard & Telemetry role at all on this page? (Project itself is out of scope.) Answer:
- [ ] Anything you'd do differently (for the lessons section)? Answer:

## Done when
- [ ] Exploded view works on scroll + parts have popovers
- [ ] FEA toggle uses real Ansys output (or is clearly marked illustrative)
- [ ] All numbers match the résumé or Ansh's answers
- [ ] Mobile + reduced-motion fallbacks; perf budget
- [ ] README status + answers recorded
