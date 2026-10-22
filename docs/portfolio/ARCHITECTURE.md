# Architecture

## Stack

| Concern | Choice | Why |
|---|---|---|
| Framework | **Next.js (App Router), latest stable**, TypeScript | Already the repo's framework; static export / Vercel friendly |
| Styling | **Tailwind CSS** (latest) + CSS variables for tokens from DESIGN.md | Tokens live in CSS vars so 3D/GSAP code can read them too |
| 3D | `three`, `@react-three/fiber`, `@react-three/drei` | Declarative scenes, `View`, `useGLTF`, `ContactShadows`, `Environment`, `Html`, `PerformanceMonitor` |
| Post FX | `@react-three/postprocessing` (+ `n8ao` if not bundled) | SMAA, AO, selective bloom, vignette |
| Physics | `@react-three/rapier` | Hero trinkets you can drag/toss (Badge Factory uses cannon-es; Rapier is the maintained R3F equivalent) |
| Scroll/motion | **GSAP + ScrollTrigger**, **Lenis** smooth scroll | Pinned scroll scenes like Oryzo; Lenis drives ScrollTrigger via `lenis.on('scroll', ScrollTrigger.update)` |
| Assets | `@gltf-transform/cli` (dev tool, run via `npx`) | Meshopt compression, texture resize/WebP/KTX2 |
| Charts (IMU page) | lightweight custom SVG/canvas or `visx` | Only if needed; decide in that session |

Pin exact versions in `package.json` when installing; check that the R3F major matches the React major.

## Teardown (first task of the landing-page session)

Delete:
- `components/` (all), `App.tsx`, `index.tsx`, `index.html`, `constants.tsx`, `types.ts`, `metadata.json`
- `app/page.tsx`, `app/portfolio/` (printer components are re-created from `projects/3d-printer.md`)
- `public/Overlay.svg`, `public/creator_logs_hero_image.webp` (unless Ansh says keep — ask in landing STEP 0)
- Old grain/scroll-snap CSS in `app/globals.css` (rewrite the file)
- `react-scroll-parallax` dependency; `next.config.mjs` remote image patterns for unsplash/picsum/dicebear

Keep:
- `public/project_media/3d_printer/*` (all 11 images), `public/logos/*`, `public/fonts/ClashGrotesk-Variable.ttf`
  (until a display font is chosen), `public/ansh_gupta_portrait.webp`, all favicons in `app/`
- `Ansh_Gupta_*_Resume*.pdf` at the root (source material; consider moving to `docs/portfolio/source/`)

The old site remains recoverable from git (last commit before refactor: `cf67374`). Commit the teardown as its
own commit so it's easy to diff.

## Folder layout (target)

```
app/
  layout.tsx                 # fonts, <Nav/>, <SmoothScroll/>, <SceneRoot/> (persistent canvas), <Grain/>
  page.tsx                   # landing
  projects/
    3d-printer/page.tsx
    steering-wheel/page.tsx
    imu-wearable/page.tsx
    camera-gimbal/page.tsx
    tapcarry/page.tsx
    garage-inventory/page.tsx
  globals.css                # tokens (CSS vars), base type, utilities
components/
  three/
    SceneRoot.tsx            # single fixed <Canvas> + <View.Port/>; renderer defaults from 3D_GUIDE
    StudioEnvironment.tsx    # HDRI/RoomEnvironment + light rig presets ("dark-studio", "light-studio")
    Model.tsx                # useGLTF + meshopt decoder + material overrides by mesh name
    ModelViewer.tsx          # orbit, exploded-view slider, hotspots, auto-rotate, poster fallback
    Trinket.tsx              # rapier rigid body + drag + hover label + click-to-route
    Monitor.tsx              # 3D monitor with video texture / live iframe swap
    Blueprint.tsx            # wireframe/edges "drawing" intro material (see DESIGN motion)
    materials.ts             # material presets from 3D_GUIDE
  ui/
    Nav.tsx  Footer.tsx  ChapterHeader.tsx  SpecLine.tsx  PillButton.tsx  ScrollCue.tsx
    ProgressCounter.tsx  PartPopover.tsx  VideoPip.tsx  ToolChips.tsx  Grain.tsx  PosterFallback.tsx
  project/
    ProjectHero.tsx  GoalSection.tsx  SpecsSection.tsx  Chapter.tsx  NextProject.tsx
content/
  projects.ts                # single source of truth: slug, title, subtitle, tools, specLine, poster, model, order
  site.ts                    # name, tagline, links, email
hooks/
  useScrollProgress.ts  useReducedMotion.ts  useIsMobile.ts
public/
  models/<slug>/*.glb
  project_media/<slug>/*
  hdri/*.hdr
```

## Shared 3D layer

- **One WebGL context.** A single fixed full-screen `<Canvas>` lives in `layout.tsx` (`SceneRoot`). Sections place
  `<View>` (drei) regions that render into it. Never mount multiple `<Canvas>` elements — browsers cap contexts and
  each one re-uploads the same textures.
- Renderer defaults (AgX, sRGB, DPR clamp, etc.) are set once in `SceneRoot` per 3D_GUIDE.
- `Model.tsx` takes a `materials` map (`{ meshNamePattern: presetName }`) so Blender material names or mesh names
  map to presets from `materials.ts`.
- `ModelViewer.tsx` is the reusable "inspect the CAD" block for project pages:
  - props: `src`, `poster`, `explode` (map part name → offset vector), `hotspots` (part → label/spec),
    `autoRotate`, `environment` preset.
  - exploded view driven either by scroll progress or a slider.
- Every 3D block must have a **poster fallback** (WebP still) used when: no WebGL, `prefers-reduced-motion`,
  low-power detection, or before the GLB loads.

## Content model (`content/projects.ts`)

```ts
type Project = {
  slug: 'steering-wheel' | '3d-printer' | 'imu-wearable' | 'camera-gimbal' | 'tapcarry' | 'garage-inventory';
  order: number;            // engineering projects first
  title: string;
  subtitle: string;
  category: 'mechanical' | 'electronics' | 'software';
  period: string;           // e.g. "Summer 2025"
  tools: { name: string; logo: string }[];   // logos in /public/logos
  specLine: string;         // mono caps line, e.g. "CORE-XY · 200 × 185 × 160 MM · FUSION 360"
  poster: string;           // webp
  trinket?: string;         // glb used on the landing hero, if any
  status?: 'in-progress';
};
```

Default order: 1 steering-wheel, 2 3d-printer, 3 imu-wearable, 4 camera-gimbal, 5 tapcarry, 6 garage-inventory.

## Routes

`/` · `/projects/steering-wheel` · `/projects/3d-printer` · `/projects/imu-wearable` · `/projects/camera-gimbal`
· `/projects/tapcarry` · `/projects/garage-inventory`

Add a permanent redirect `/portfolio/3d_printer → /projects/3d-printer` in `next.config.mjs` (the old URL may be shared).

## Quality bar (all sessions)

- `npm run build` passes, no TS errors, no console errors.
- Lighthouse: Performance ≥ 80 on desktop for the landing page with 3D; LCP element is text or poster, not the canvas.
- Works at 375px width with no horizontal scroll.
- `prefers-reduced-motion`: no scroll-jacking, no auto-rotation; posters replace heavy scenes.
- Keyboard: every clickable 3D object has a DOM equivalent (link/button) for accessibility.
