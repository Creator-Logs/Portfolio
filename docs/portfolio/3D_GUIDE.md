# 3D Guide — Fusion 360 → Web, Shading & Performance

Goal: CAD models that look like **product photography**, not CAD screenshots — and still load fast.
The biggest wins, in order: **(1) a good environment map, (2) correct tone mapping/colour, (3) bevelled edges
and clean normals, (4) honest material presets, (5) soft contact shadows + AO.**

---

## 1. Asset pipeline

### 1.0 What actually runs (built 2026-10-22, Phase 3) — read this first
Blender 5.2 has **no STEP importer**, and Ansh's CAD arrives as STEP, so the shipped pipeline is scripted end to end:

```
STEP ─cascadio (OpenCASCADE)─▶ raw GLB ─Blender headless (process.py)─▶ processed GLB ─gltf-transform─▶ public/models/<slug>/
```
```bash
scripts/models/build.sh <slug> [detail|mat]   # needs .venv-models (cascadio, trimesh) + Blender 5.2
scripts/models/qa.sh    <slug> [detail|mat]   # dev server on :3000; pixel-diffs vs the uncompressed detail build
```
Per-model config: `scripts/models/<slug>.json` (source STEP, up-axis, `rotate_deg` so the user-facing side is +Z,
`transparent` parts, material rules `[regex, preset, colour?]`, optional `lods` overrides).

**Fidelity rules (Ansh: "keep them detailed, no visual defects")** — nothing is ever decimated or simplified:
1. *Tessellation* is exact CAD at a max surface error: **detail 0.02 mm / 20°**, **mat 0.1 mm / 30°** (LOD for the
   landing mat, where the model is a few hundred px). Small models (IMU) override mat → detail tolerances.
2. *Exact duplicates* (same part exported twice in place) are removed — they z-fight.
3. *Z-fighting* between different parts (CAD interference, flush stickers/labels) is detected (`zfight.py`) and the
   smaller part wins: nudged 0.02 mm out along the shared plane, or grown 0.02 mm (inside the tessellation error).
4. *Never-visible parts* are removed via a 162-direction ID render (see-through parts never occlude).
5. *Join per material* → draw calls ≈ number of materials (~10 per model).
6. *Compression*: dedup (**not materials** — names carry presets), weld (bit-exact), prune, meshopt with
   **16-bit positions + 16-bit normals** passed *to meshopt itself* (it re-quantizes at 14/10 bits otherwise).
7. *QA gate*: render uncompressed vs shipped in the real three.js scene from 3 fixed cameras; PASS < 0.1 % pixels
   changed by > 8/255. Noise floor measured at 0.000 % (renderer is deterministic). Comparisons are saved to
   `docs/portfolio/reference/models/*-compare.png`.

Materials: STEP from Creo/Fusion carried **no colours**, so presets come from the config (`preset#hex` material
names, mapped by `Model.tsx`). Fusion **mesh bodies are dropped by STEP export** (IMU PCB pads, 0402s, VL53L1X, JST
are missing) — convert Mesh→BRep in Fusion before exporting. Audit script used: compare cascadio's "skipped node
without geometry" warnings.

Results (2026-10-22):

| Model | detail (tris / MB) | mat (tris / MB) | QA detail | notes |
|---|---|---|---|---|
| steering-wheel | 601k / 5.2 | 254k / 2.9 | 0.036 % ✅ | 26 hidden parts, 1 duplicate knob; faces +Z = driver side |
| 3d-printer | 2.26M / 16.0 | 1.16M / 9.0 | 0.052 % ✅ | 33 duplicates, 32 z-fights fixed (mount corner, stickers, label) |
| imu-wearable | 30k / 0.23 | = detail | 0.001 % ✅ | closed enclosure hides the PCB; STEP missing mesh-body parts |

Mat LOD QA at mat size: views 0/1 ≤ 0.17 %; the 2.4× close-up shows ≤ 0.73 % (highlight edges on small cylinders).
**Decision (Ansh, 2026-10-22): the landing mat loads the mat LOD only**; detail is for project pages + pinned showcase.

The subsections below are the original manual (Fusion → Blender) guidance — still valid for FBX/OBJ sources and
hand-made scenes, but the per-step settings above take precedence for STEP models.


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
| `steel_black_oxide` (McMaster black-oxide screws) | `#2b2b2d` | 1 | 0.38 | — |
| `steel_zinc` (zinc-plated hardware) | `#c4c6c2` | 1 | 0.3 | — |
| `brass` (lead-screw nut, inserts) | `#c9a14a` | 1 | 0.25 | — |
| `carbon_fiber` (baseplate) | `#111` | 0 | 0.35 base | **twill weave normal + roughness map**, `clearcoat 1, clearcoatRoughness .05`, `anisotropy .5` rotated per weave |
| `rubber_silicone` (grips, damper) | from model | 0 | 0.7 | `sheen .5, sheenRoughness .8, sheenColor` slightly lighter |
| `pcb_soldermask` | `#0d3b1e` / black | 0 | 0.35 | `clearcoat .6`; separate `pcb_gold` (metal 1, rough .25, `#d4a64a`), `pcb_silkscreen` via texture |
| `polycarbonate_clear` (small windows) | `#dfe7ea` | 0 | 0.04 | `transparent, opacity .28, clearcoat 1, depthWrite false` — no transmission pass |
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
| Landing 3D payload before interaction | poster/LCP first; models stream after (mat LODs ≈ 12 MB total, sequential) |
| Each trinket GLB | fidelity first (Ansh): mat LOD as small as the QA gate allows — currently 0.2–9 MB, streamed one at a time after the poster |
| Project hero assembly GLB | ≤ 6 MB, lazy-loaded |
| HDRI | 1k `.hdr` ≤ 1.5 MB, or Lightformers (0 kB) |
| Textures | ≤ 2048², WebP/KTX2 |
| Triangles on screen | ≤ ~1M desktop, ≤ ~400k mobile |
| Draw calls | ≤ ~150 (merge static meshes sharing a material) |

Techniques: `PerformanceMonitor` → step DPR/AO/bloom down; `frameloop="demand"` + `invalidate()` when nothing moves;
`useGLTF.preload` only for above-the-fold; lazy-load section scenes with IntersectionObserver; `<Bvh>` for raycast-heavy
scenes; dispose on route change; KTX2 for big textures; test on a mid-range Android and an iPhone.

## 7b. Runtime rules (so the site never crashes or stutters)

Written 2026-10-22 from the three.js manual (disposal, render on demand, optimise lots of objects), R3F
"Performance pitfalls" + "Scaling performance", drei `View` source, and Next 16 lazy-loading docs. **Every session follows these.**

**Renderer & context**
1. **One renderer, one WebGL context:** `SceneRoot` (in `app/layout.tsx`) owns the only `<Canvas>`; sections use
   `SceneBlock` → drei `<View>`. Never add another `<Canvas>`. The canvas persists across routes (no re-init cost).
2. `SceneRoot` is loaded with `next/dynamic({ ssr: false })` from a client component, so three.js never blocks first
   paint; the LCP element is always text or a poster.
3. **Context loss is a normal path:** `SceneRoot` listens for `webglcontextlost` (calls `preventDefault()` so the
   browser may restore) and `webglcontextrestored`; while lost, every `SceneBlock` shows its poster. No WebGL support →
   the canvas is never mounted and posters show.
4. Every 3D block is wrapped in an error boundary + `<Suspense>`; on a load/render error the block falls back to its poster.

**Frame loop**
5. `frameloop="demand"`. Nothing renders unless something calls `invalidate()`.
6. drei `View` measures its DOM rect *inside the frame loop*, so `SceneRoot` calls `invalidate()` on `scroll` and
   `resize`. Views already skip rendering when offscreen (drei checks the rect).
7. Continuous animation (idle bob, scroll rotation) uses `<FrameDriver active={inView && !reducedMotion}/>`, which
   invalidates each frame only while its block is on screen (IntersectionObserver). Hidden tab → rAF stops by itself.
8. In `useFrame`: **no allocations** (reuse module/ref-scoped `Vector3`/`Quaternion`), **no `setState`**, mutate refs,
   use `delta` for frame-rate independence. No `setState` in `onPointerMove` either.
9. Toggle `visible` rather than mounting/unmounting meshes (mounting recompiles shaders).

**Resources & memory**
10. Load GLBs only via `useGLTF(url, false, true)` (meshopt) → cached per URL. Reuse with `scene.clone(true)`
    (shares geometry + materials). `useGLTF.preload` only for above-the-fold models.
11. Materials come from `materials.ts` `getMaterial(preset, color)`, which caches instances — never `new
    MeshPhysicalMaterial` per mesh per render. **Attach shared materials with `<Mat preset=… />`** (a
    `<primitive attach="material">`), never `material={getMaterial(…)}`: R3F disposes a mesh's material on unmount,
    which would destroy the cached instance for every other mesh. (`Model` handles this itself.)
12. R3F auto-disposes JSX-created objects on unmount, **but not** `<primitive>` objects or the `useGLTF` cache. Cached
    GLBs stay resident on purpose (fast back-navigation); `renderer.info.memory` must stay **flat** across repeated
    navigation, not necessarily drop. Anything created imperatively (render targets, textures from canvas,
    `ImageBitmap`) must be disposed / `.close()`d in the effect cleanup. `material.dispose()` does not dispose its textures.
13. Merge static meshes that share a material (fewer draw calls); `InstancedMesh` for identical repeats (fasteners)
    only when visually identical. Target ≤ ~150 draw calls per view.

**Interaction**
14. Model meshes have raycasting disabled (`Model raycastable={false}` default); interaction goes through an invisible
    **hit proxy** (box/hull from the bounding box). Detailed models stay detailed and hover stays O(1).

**Quality scaling** (never by reducing model detail)
15. `PerformanceMonitor` steps DPR within `[1, min(devicePixelRatio, 1.25)]` (see rule 19; was 1.75 — caused scroll freezes) and is the only thing that lowers quality;
    later it may also drop post-FX and shadow resolution. Model geometry is never simplified at runtime.
16. Use **our** `StudioEnvironment` (bakes each preset once into a shared PMREM texture for the app's lifetime) and
    **our** `ContactShadows` (bakes once by default, disposes its render targets). Don't use drei's `<Environment>` or
    `<ContactShadows>`: measured with `?debug`, they leak 1 and 2 textures per mount respectively.
17. Post-processing (if any) must work with Views — decide per scene; not used in the foundation.
18. Mobile: stream models one at a time (sequential `Suspense`), DPR cap 1.5.

**Scroll lag (found 2026-10-22, Ansh reported "lags like crazy" scrolling in/out of the hero)** — measured in
headed Chrome on an Intel iGPU (ANGLE/D3D11) with wheel scrolling + Lenis; Chrome trace showed the GPU thread
blocked in `DXGISwapChainImageBacking::Present` for up to 12 s. A fixed full-screen canvas re-renders on *every*
scroll frame (drei View has to re-align), so its per-frame GPU cost competes with Chrome's page compositing:
19. **MSAA above ~1.25× DPR is the killer**: render DPR is `min(devicePixelRatio, 1.25)` with `antialias: true`.
    (1.5× + MSAA → 12 s freezes; 1.25× + MSAA → 0 stalls, p99 12.5 ms at 1×/1.5×/2× screen scales.) Never let
    PerformanceMonitor raise DPR above the device's real ratio.
20. **No `backdrop-filter` and no `mix-blend-mode`** on anything layered over the canvas (they force re-compositing
    of the live canvas every frame). Glass = solid translucent ink; grain = static, normal-blended, viewport-sized.
21. Keep `MeshPhysicalMaterial` extras (clearcoat/sheen/anisotropy) at 0 unless they visibly matter.
22. How to test: `scripts`-style Playwright run in **headed** Chrome (`headless: false`) with `mouse.wheel`, at
    deviceScaleFactor 1, 1.5 and 2; count rAF gaps > 150 ms. Headless shows ~2 s artefact gaps even when headed is clean.

**Lazy 3D content**: create `React.lazy` scene components inside a *client* module that renders the `SceneBlock`
(e.g. `components/landing/HeroScene.tsx`). Passing a lazy export through a Server Component double-wraps it and crashes.

**Verified 2026-10-22 (Phase 2):** 6 landing ↔ project round trips → `geometries/textures/programs` flat at 4/4/7;
frame counter stops when the block is offscreen; hover via hit proxy works; render error → poster fallback works.

**Debug**: `?debug` shows a leva panel (exposure, env intensity, DPR) and a live `renderer.info` overlay
(frame counter, calls, triangles, geometries, textures, programs, DPR). Use it to verify rules 10–13 on every page.

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
