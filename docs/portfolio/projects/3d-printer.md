# Project: Custom Core-XY 3D Printer — PRESERVED PAGE

> Route: `/projects/3d-printer` (redirect from old `/portfolio/3d_printer`)
> **Ansh likes how this page is presented. Rebuild it faithfully — same sections, same order, same copy, same
> images, same colours, same layout.** This file is the full inventory of the v1 page (source: commit `cf67374`,
> `app/portfolio/3d_printer/*.tsx`), so the old code can be deleted safely.

---

## STEP 0 — Ask Ansh before writing any code (mandatory)
1. "What else do you have for the 3D printer now?" (new renders, photos of the built printer, machining photos/videos,
   print samples, a GLB/Fusion export, drawings, Klipper config, cost breakdown).
2. "Do you want only a faithful port, or also any of the optional enhancements listed below?"
3. Resolve the **build-volume conflict** (see Questions).
4. "Is the Manufacturing section ready to be filled in, or keep 'Coming Soon'?"

---

## Allowed changes (everything else stays identical)
- New site **Nav** and **Footer** replace the old ones (the Back link in the hero stays).
- Fonts/colours mapped to DESIGN.md tokens that match the originals (`--studio-*`, ink, etc.). Visual result should
  look the same.
- **Responsive fixes** — the v1 Specs, CAD bento grid and Core-XY section don't adapt to mobile. Keep desktop
  identical; make mobile stack cleanly.
- Route moves to `/projects/3d-printer`; `next/image` for images.
- Obvious typo fixes only (e.g. missing space in "axis.This setup").

---

## v1 inventory (rebuild exactly)

Page order: **Hero → The Goal → Design Specifications → CAD Overview → Core XY Mechanism → Manufacturing Coming Soon**.
v1 colour tokens used: `light-bg #F5F5F7`, `light-text #1D1D1F`, `light-textSec #86868B`, `light-gray #BFBFBF`,
`dark-bg #1B1B1B`, `dark-tertiary #2F2E2B`, `dark-light #3D3C3A`, `dark-text #F8F8F8`, `dark-textSec #8D8D8D`.
Font: Clash Grotesk (variable). Content max width 1440px, centered.

### 1. Hero (`#printer_hero`)
- Full viewport (`100vw × 100vh`), background colour **`#D9D9D9`**.
- Background image: **`/project_media/3d_printer/printer_hero_image.webp`** in landscape (`bg-cover`, positioned
  **20% center**); **`/project_media/3d_printer/printer_hero_image_mobile.webp`** in portrait (`bg-contain`, bottom,
  no-repeat). The render shows the printer front-on, left side of frame, on a light seamless with reflection.
- Content container: max-w 1440, padding x 24 / 48 (md) / 80 (lg), py 8 (portrait) / 48 (landscape).
- **Back link** top-left: left-arrow SVG (28×24 viewBox, stroke 1.5, path `M8 19l-7-7m0 0l7-7m-7 7h26`) + text
  "Back"; colour `#1B1B1B`, hover `#8D8D8D`, gap animates 8→12px on hover. Links to `/`.
- Text block: in landscape sits to the **right** of an empty spacer that is 80% (70% at xl) wide → text
  is right-of-centre over empty background; in portrait centred above the image.
  - `h1` **"3D Printer"** — 48px portrait / 60px landscape, semibold, colour `#3D3C3A`.
  - Rule: 64px wide, 2px bottom border, `#3D3C3A`, 8px vertical margin.
  - Subtitle **"A Core-XY 3D Printer Build From Scratch"** — small (portrait) / landscape size, `#3D3C3A`.
  - Label **"Tools Used"** — medium weight, 32px top padding (8vh in landscape), `#3D3C3A`.
  - Two tool tiles: 56×56, bg `#BFBFBF`, 1px border `#86868B`, radius 12px, 8px gap; logos 40×40 contain:
    **`/logos/Fusion360.svg`** ("Fusion360 Logo"), **`/logos/Blender.svg`** ("Blender Logo").
- Portrait: bottom spacer 50% (md 70%) so the image shows below the text.

### 2. The Goal (`#printer_goals`)
- Height 70vh (portrait) / 60vh (landscape); bg **`#1B1B1B`**; centered column.
- `h2` **"The Goal"** — 48px, medium, `#F8F8F8`, centered.
- Paragraphs (centered, width 65vw portrait / 50vw landscape, 16→18px, `#F8F8F8`, 24px top padding):
  1. "This project focused on designing a compact 3D printer entirely from the ground up with a total system cost under $200, balancing cost efficiency with high-speed printing performance through careful system-level tradeoffs."
  2. "The printer was built as a flexible rapid-prototyping platform for future projects, with a support for future upgrades, iteration, and the integration of new tools as requirements evolve."

### 3. Design Specifications (`#printer_specs`)
- Full viewport, bg **`#F5F5F7`**; two columns (`justify-between`), padding 80px (landscape).
- **Left column:** `h2` **"Design Specifications"** (48px, medium, `#1D1D1F`), then 6 rows. Each row: label (20px,
  medium, `#BFBFBF`), value (36px, medium, `#1D1D1F`), then a 1px bottom border `#8D8D8D` with 24px top padding
  (no border after the last row). First row 48px top padding, others 24px.

  | Label | Value |
  |---|---|
  | Motion System | Core-XY |
  | Frame Material | 2020 T-Slot Aluminium Extrusions |
  | X, Y Axis Driving Mechanism | GT2 Pulleys & 6mm Timing Belts |
  | Z Axis Driving Mechanism | Lead Screw & Nut |
  | Motion Guiding Mechanism | Linear Bearings & Smooth Rods |
  | Voltage & Power | 24 V / 350 W |

- **Right column** (`mix-blend-multiply`, centered): image **`/project_media/3d_printer/printer_isometric.webp`**
  (alt "3d_printer_isometric", 600×610, priority). Below it, two side-by-side tables (128px gap):
  - **Build Volume** (label 20px `#BFBFBF`): Width **200 mm**, Depth **185 mm**, Height **160 mm** ⚠ see conflict
  - **Physical Dimensions**: Width **389 mm**, Depth **410 mm**, Height **409 mm**
  - Table text 20px medium `#1D1D1F`, label column + value column with 16px gap.

### 4. CAD Overview (`#printer_cad`)
- bg **`#F5F5F7`**, padding 80px; `h2` **"CAD Overview"** (48px, medium, `#1D1D1F`).
- **Bento grid: 12 columns × 8 rows, 16px gap.** Every tile: radius 16px, 1px border `gray-300` (#D1D5DB), bg white,
  image `object-contain` centered, label pill bottom-right (24px inset): bg `#1B1B1B` at 50% + `backdrop-blur-sm`,
  rounded-full, px 16 py 8, text white 20px medium.

  | Order | Image | Label | Span |
  |---|---|---|---|
  | 1 | `/project_media/3d_printer/printer_frame.webp` | Print Frame | col 4 × row 4 |
  | 2 | `/project_media/3d_printer/z_assembly.webp` | Z-Axis Assembly | col 4 × row 4 |
  | 3 | `/project_media/3d_printer/extruder.webp` | Extruder & Hotend | col 4 × row 5 |
  | 4 | `/project_media/3d_printer/end_stop_assembly.webp` | End-Stop Mounting | col 3 × row 4 |
  | 5 | `/project_media/3d_printer/full_assembly.webp` | Full Assembly | col 5 × row 4 |
  | 6 | `/project_media/3d_printer/pulley_hub.webp` | Pulley Hub | col 4 × row 3 |

  (Note "Print Frame" is the v1 label text — ask whether it should read "Printer Frame".)
- Mobile (new): 2-column then 1-column stack, keep aspect, same tile style.

### 5. Core XY Mechanism (`#core_xy`)
- bg **`#CBCBCB`**; container max 1440, px 24, py 80 (landscape). Two columns, `justify-between`.
- Left (40% width), text colour `#2F2E2B`:
  - `h3` **"Core XY Mechanism"** (48px, medium, 48px top padding)
  - p (20px): "I chose the Core-XY motion system over the standard Cartesian design because it provides greater stability since the motors are stationary. It further provides more efficient motor load distribution, and a more space-efficient layout, allowing for a larger build volume within a compact frame."
  - `h3` **"How it Works"** (48px, medium, 64px top padding)
  - p (20px): "A Core-XY system uses two motors and crossed belts to move a carriage in the X and Y directions. Both motors turning together move the carriage diagonally, while turning in opposite directions moves it straight along one axis. This setup keeps the motors stationary, reducing moving mass and allowing faster, more precise motion."
- Right: **`/project_media/3d_printer/core_xy_image.webp`** (top-down render of the Core-XY gantry), `object-contain`,
  **`mix-blend-darken`** (so its light background disappears into `#CBCBCB`).

### 6. Manufacturing — Coming Soon
- Full viewport, background image **`/project_media/3d_printer/3d_printer_render.webp`** (`bg-cover`), content vertically centered.
- Text: **"Manufacturing<br/>Coming Soon..."** — 72px, semibold, `#F8F8F8`, left-aligned in the 1440 container.

### Assets in repo (keep all — 11 files in `public/project_media/3d_printer/`)
`3d_printer_render.webp`, `core_xy_image.webp`, `end_stop_assembly.webp`, `extruder.webp`, `full_assembly.webp`,
`printer_frame.webp`, `printer_hero_image.webp`, `printer_hero_image_mobile.webp`, `printer_isometric.webp`,
`pulley_hub.webp`, `z_assembly.webp`. Logos: `/logos/Fusion360.svg`, `/logos/Blender.svg`.

---

## Optional enhancements (ONLY with Ansh's explicit approval)
- **Manufacturing section filled in** from the résumé: lathe-turned flanged shafts (micro-grooved for belt grip per v1
  constants), brake-formed laser-cut sheet metal with manufacturing drawings, aluminium heat spreader faced on a CNC
  mill, FDM-printed parts, and shaft / retaining-clip / hole-fit tolerance analysis. Would need shop photos/video.
- **Interactive Core-XY demo** in the Core XY section: top-down GLB/2D SVG of the gantry; two motor dials — rotate
  same direction → diagonal move, opposite → straight; belts animate. Must sit inside the existing layout (replace or
  sit beside `core_xy_image.webp`).
- **Orbitable GLB** of the full assembly (light-studio preset) as an alternate view in CAD Overview ("Spin it" toggle),
  keeping the bento grid as default.
- Klipper firmware mention / print-speed results / cost breakdown (under $200).

## Assets requested from Ansh (only if enhancements approved)
- [ ] Full assembly GLB or Fusion FBX export with named components (frame, z_assembly, extruder, gantry, belts, motors)
- [ ] Machining/manufacturing photos & short clips (lathe, brake, CNC, prints)
- [ ] Photos of the finished physical printer
- [ ] Print speed / quality results, cost breakdown

## Questions for Ansh
- [x] Build volume: page says **200 × 185 × 160 mm**, engineering résumé says **220 × 220 × 180 mm** — which is correct? Answer: **220 × 220 × 180 mm** (résumé). Specs table updated.
- [x] Old `constants.tsx` also said "200x200x180 mm build volume" and "Klipper Firmware" — mention Klipper anywhere? Answer: **No.**
- [x] CAD tile label "Print Frame" → keep, or change to "Printer Frame"? Answer: **"Printer Frame".**
- [x] Hero "Tools Used" — add machining tools (lathe, CNC, sheet metal) or keep Fusion 360 + Blender only? Answer: Fusion 360 + Blender only (not raised; kept v1).
- [x] Should this page use the new dark nav, or a light variant to match the grey studio look? Answer: **Light.** Implemented as `data-nav-theme="light"` on the light sections (nav goes studio-ink while one is under it).
- [x] Fill in Manufacturing now, or keep "Coming Soon"? Answer: **Fill in now**, text only: lathe-turned shafts, sheet metal, FDM parts (no CNC heat spreader). Photos to come — set `image` on a row in `components/printer/PrinterManufacturing.tsx`.
- [x] "How it Works" copy had the motor behaviour backwards (v1: both together → diagonal). Answer: **Fix it** → one motor alone → diagonal; both same way → straight along X; opposite → straight along Y.
- [x] Which optional enhancements, if any? Answer: **Interactive Core-XY demo** (2D SVG, below the Core XY text/image) + **Manufacturing filled in**. No orbitable GLB.

## Done when
- [ ] Side-by-side screenshot comparison vs v1 at 1440×900 shows the same layout/copy/images (use
      `docs/portfolio/reference/printer-v1-*.png` captured before teardown, or check out `cf67374` and run it)
- [ ] Mobile 375px stacks cleanly, no overflow
- [ ] Old route redirects
- [ ] Questions answered and recorded; README status updated
