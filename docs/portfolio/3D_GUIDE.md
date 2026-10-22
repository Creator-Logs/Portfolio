# 3D Guide — Fusion 360 → Web, Shading & Performance

Goal: CAD models that look like **product photography**, not CAD screenshots — and still load fast.
The biggest wins, in order: **(1) a good environment map, (2) correct tone mapping/colour, (3) bevelled edges
and clean normals, (4) honest material presets, (5) soft contact shadows + AO.**

---

## 1. Asset pipeline

```
Fusion 360 ──export──▶ Blender ──cleanup/materials──▶ GLB ──gltf-transform──▶ public/models/<slug>/*.glb
```

### 1.1 Export from Fusion 360
- Preferred: **File → Export → FBX** (keeps component hierarchy & names) or **OBJ** (simple parts).
  Alternative: **STEP** → import in Blender via the *STEPper* / *CAD Sketcher* importers or convert with FreeCAD.
- Set mesh **refinement to High** (or Custom: surface deviation ≈ 0.02 mm, normal deviation ≈ 10°). Curved parts
  (pulleys, grips, coasters) need it; we decimate later where needed.
- Name components meaningfully in Fusion **before** export (`frame`, `z_assembly`, `extruder`, `standoff_L`…).
  These names drive exploded views and material mapping.
- One file per "trinket"; for project pages one assembly file with sub-components.
- Units: export in mm; scale to metres in Blender (0.001) so lights/physics behave.
- For moving mechanisms (gimbal, Core-XY): note joint axes/origins — we need pivot points.

### 1.2 Blender cleanup (Ansh already uses Blender)
1. Apply scale (`Ctrl+A → Scale`), set origin to geometry/base, put the model on the world origin, Y-up on export.
2. **Normals:** `Shade Auto Smooth` at ~30°, or add a *Weighted Normal* modifier — fixes CAD faceting/shading streaks.
3. **Bevels:** CAD has perfectly sharp edges, which never catch a highlight. Add a *Bevel* modifier
   (0.2–0.5 mm, 2–3 segments, limit by angle 30°) on visible hard edges. This single step makes the biggest
   "real object" difference.
4. Merge by distance; delete hidden internal geometry (screws inside, internal faces) unless needed for exploded views.
5. **Materials:** use Principled BSDF and name materials by preset (`pla_black`, `alu_anodized`, `carbon`, `sls_nylon`,
   `brass`, `pcb_green`, `rubber`) — the site maps names → presets in `materials.ts` and can override.
6. Optional **AO bake** (Cycles, 1k–2k, single UV set) for static hero objects — cheaper than runtime AO and better looking.
7. Decimate if > ~150k triangles for a trinket (target 20–80k per trinket, ≤ 300k for a project hero assembly).
8. Export **glTF Binary (.glb)**: +Y up, apply modifiers, include custom properties, no cameras/lights,
   compression off (we compress next).

### 1.3 Optimise
```bash
npx @gltf-transform/cli optimize in.glb out.glb \
  --compress meshopt \
  --texture-compress webp --texture-size 2048
# heavy textures (carbon weave, scans): use --texture-compress ktx2 instead
npx @gltf-transform/cli inspect out.glb   # check tris, textures, size
```
- Load with drei `useGLTF(url, true /*draco*/, true /*meshopt*/)` or set the `MeshoptDecoder` on GLTFLoader.
- Don't use `--simplify` blindly on mechanical parts — it chews flat faces. Prefer Blender decimate per object.
- Keep the raw `.blend` and Fusion exports in `assets-src/<slug>/` (gitignored if large).

### 1.4 Posters
For every 3D block render a **WebP poster** from the same angle (Blender Cycles still, or a Fusion Render) at
2560px wide, transparent or `--ink` background. Used for LCP, fallback, reduced-motion, and social previews.

### 1.5 Other sources
- **KiCad** (IMU PCB): PCB Editor → *File → Export → glTF/VRML/STEP* (KiCad 7+ supports glTF/GLB export).
  Bring into Blender for materials (solder mask, gold pads, silkscreen texture).
- **PTC Creo** (steering wheel): *Save As → STEP*, or OBJ/STL per part → Blender.
- **3D scans** (grip clay molds): decimate to ≤ 100k tris, bake normal map from the high-poly onto the low-poly.
- **Ansys FEA results:** export a contour image, or a result file → map as vertex colours/texture on the part in
  Blender (see steering-wheel page).

---

## 2. Renderer defaults (set once in `SceneRoot`)

```ts
gl.outputColorSpace = THREE.SRGBColorSpace;
gl.toneMapping = THREE.AgXToneMapping;      // per-scene override: THREE.NeutralToneMapping
gl.toneMappingExposure = 0.9;               // tune 0.8–1.1
dpr = [1, 1.75];                             // clamp; PerformanceMonitor lowers it
shadows = 'soft';                            // or false if only ContactShadows are used
```
- **AgX** (what Oryzo uses): filmic, graceful highlight rolloff, slightly desaturated — great for the moody dark scenes.
- **Khronos PBR Neutral** (`NeutralToneMapping`): keeps base colours accurate — use for brand-coloured things
  (TapCarry UI, coloured plastic trinkets) where AgX would wash colours out.
- Avoid ACES on new scenes (hue shifts on saturated plastics). Badge Factory uses ACES at 0.85 — acceptable but not preferred.
- Colour textures must be `SRGBColorSpace`; normal/roughness/metalness/AO stay linear (GLTFLoader handles this).

## 3. Environment & lighting

- **Environment map is the main light.** Use a studio HDRI (1k, `.hdr`, Poly Haven e.g. "studio_small_09",
  "brown_photostudio", "empty_warehouse") via drei `<Environment files=… />`, or drei `<Environment>` with
  `<Lightformer>`s to build a custom softbox studio (best control, zero download). Fallback: `RoomEnvironment` via PMREM.
- Tune globally with `scene.environmentIntensity` (0.6–1.2) and per material `envMapIntensity`.
- Set `background` to the CSS colour (`--ink`), **not** the HDRI — keep the dark seamless look; use
  `environmentRotation` to move highlights.
- **Light rig preset "dark-studio"** (Oryzo look):
  - Key: warm (`#FFD9B0`), large softbox Lightformer above-front-left, intensity ~2–4.
  - Rim: neutral/cool strip Lightformer behind-right — creates the bright edge line that separates object from black.
  - Fill: very low, warm, front-right.
  - Optional ground bounce: brown plane Lightformer below (warms the underside).
- **Light rig preset "light-studio"** (printer page / CAD chapters): big soft overhead, white sweep, gentle shadows.
- Shadows: prefer drei **`<ContactShadows>`** (static/slow objects; opacity .5–.7, blur 2–3, far ~1) or
  **`<AccumulativeShadows>` + `<RandomizedLight>`** (static hero, beautiful soft shadow, computed once).
  Max 1–2 real shadow-casting lights (directional/spot, `shadow.mapSize` 1024–2048, `shadow.bias` -0.0005, `normalBias` 0.02).
  Never shadow-casting point lights (6 passes each).

## 4. Material presets (`components/three/materials.ts`)

All `MeshPhysicalMaterial` unless noted. Values are starting points — tune per scene with the `?debug` leva panel.

| Preset | color | metalness | roughness | extras |
|---|---|---|---|---|
| `pla_matte` (FDM PLA/PETG) | from model | 0 | 0.55–0.65 | `clearcoat .1, clearcoatRoughness .5`; optional tiling **layer-line normal map** (0.2mm pitch, scale tuned to model) — sells "3D-printed" instantly |
| `pla_silk` | from model | 0 | 0.35 | `sheen .3`, `clearcoat .3` |
| `sls_nylon` (steering wheel enclosure/grips) | `#2a2a2a` or white | 0 | 0.85–0.95 | fine grain `bumpMap` / noise normal, `bumpScale .02` |
| `alu_extrusion_black` (2020 T-slot) | `#151515` | 1 | 0.35–0.45 | slight `anisotropy .3` along extrusion axis |
| `alu_machined` (CNC standoffs, heat spreader) | `#c8c8c8` | 1 | 0.2–0.3 | `anisotropy .6` + circular/linear brushed normal |
| `steel_polished` (rods, lead screw) | `#d6d6d6` | 1 | 0.12–0.2 | — |
| `brass` (lead-screw nut, inserts) | `#c9a14a` | 1 | 0.25 | — |
| `carbon_fiber` (baseplate) | `#111` | 0 | 0.35 base | **twill weave normal + roughness map**, `clearcoat 1, clearcoatRoughness .05`, `anisotropy .5` rotated per weave |
| `rubber_silicone` (grips, damper) | from model | 0 | 0.7 | `sheen .5, sheenRoughness .8, sheenColor` slightly lighter |
| `pcb_soldermask` | `#0d3b1e` / black | 0 | 0.35 | `clearcoat .6`; separate `pcb_gold` (metal 1, rough .25, `#d4a64a`), `pcb_silkscreen` via texture |
| `acrylic_clear` | `#ffffff` | 0 | 0.05 | `transmission 1, thickness .5, ior 1.49` — **sparingly** (extra render pass) |
| `screen_glass` (TapCarry monitor) | black | 0 | 0.05 | screen = `MeshBasicMaterial` with `VideoTexture` (toneMapped: false) + thin glass layer `clearcoat 1` for reflections |
| `cork` / `wood` (bench props) | texture | 0 | 0.8 | albedo + normal from Poly Haven (1k) |

Hover/selection highlight: add an orange **fresnel rim** via `onBeforeCompile` or a second additive shell mesh — not an outline pass.

## 5. Post-processing (`@react-three/postprocessing`)

Order: **N8AO** (or GTAO; skip if AO baked) → **SMAA** → selective **Bloom** (`luminanceThreshold ~1`, only emissive
screen / hot-end glow) → **Vignette** (offset .3, darkness .6) → (film grain is CSS, not a pass).
Disable multisampling on the canvas when SMAA is used. Drop AO and bloom at low `PerformanceMonitor` tiers.

## 6. Signature effects

- **Blueprint intro:** for each mesh, build `EdgesGeometry(geom, 25°)` → `LineSegments` with a dashed line material
  in `--orange`; animate `dashOffset`/draw-range from 0 → full; meanwhile background `--olive` with a faint grid.
  Then reveal the shaded mesh with a world-space clip plane or a noise-dissolve in `onBeforeCompile`, crossfading
  background to `--ink`. Add dimension-style annotation lines (thin lines + mm labels via `<Html>`) for engineering flavour.
- **Rim sweep:** keep lights fixed, rotate the object with scroll → highlights travel across the surface.
- **Exploded view:** offsets stored per part name; tween `position = assembled + explodeDir * t`. Optionally draw
  thin orange leader lines to labels.
- **Physics trinkets:** rapier `RigidBody` with `colliders="hull"` (convex hull of decimated mesh; never trimesh for
  dynamic bodies), `restitution .2–.4`, `friction .8`, linear/angular damping .5; drag via pointer → kinematic
  target or spring joint; walls just outside the viewport. Sleep bodies when idle so the frameloop can rest.

## 7. Performance budget

| Item | Budget |
|---|---|
| Landing initial JS (excluding three chunk) | ≤ 200 kB gz |
| Landing 3D payload before interaction | ≤ 4 MB (all trinkets + HDRI) |
| Each trinket GLB | ≤ 1.5 MB (aim 300–800 kB) |
| Project hero assembly GLB | ≤ 6 MB, lazy-loaded |
| HDRI | 1k `.hdr` ≤ 1.5 MB, or Lightformers (0 kB) |
| Textures | ≤ 2048², WebP/KTX2 |
| Triangles on screen | ≤ ~1M desktop, ≤ ~400k mobile |
| Draw calls | ≤ ~150 (merge static meshes sharing a material) |

Techniques: `PerformanceMonitor` → step DPR/AO/bloom down; `frameloop="demand"` + `invalidate()` when nothing moves;
`useGLTF.preload` only for above-the-fold; lazy-load section scenes with IntersectionObserver; `<Bvh>` for raycast-heavy
scenes; dispose on route change; KTX2 for big textures; test on a mid-range Android and an iPhone.

## 8. Checklist before a model ships
- [ ] Bevels/normals fixed, no shading streaks under a moving light
- [ ] Materials mapped to presets, colours accurate under the chosen tone mapper
- [ ] Meshopt-compressed GLB within budget, `gltf-transform inspect` clean
- [ ] Poster WebP rendered from the same angle
- [ ] Part names match the page's exploded-view/hotspot config
- [ ] Looks good in both `dark-studio` and (if used) `light-studio`

## Sources consulted
- oryzo.ai and hervestudio.github.io/badge-factory (shipped code: three r178/AgX/clearcoat/sheen/bloom; RoomEnvironment/ACES/GTAO/FXAA/cannon-es)
- three.js forum on AgX vs ACES: https://discourse.threejs.org/t/is-agx-tonemapping-implemented-correctly/60609
- Three.js Journey "Realistic render": https://threejs-journey.com/lessons/realistic-render
- gltf-transform optimize / meshopt vs draco notes: https://discourse.threejs.org/t/gltf-and-or-glb-online-optimization-and-compression/62753
