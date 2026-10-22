# Design System — "Dark Workshop"

Direction: **Oryzo's warm, cinematic darkness** (one beautifully lit object per scene, huge uppercase type,
cream on near-black, orange accent) **+ Badge Factory's maker-bench structure** (cutting mat, numbered build
chapters, mono spec lines, parts you can pick up, assembly on scroll).

The story the design tells: *an engineer's bench at night.* Things start as CAD wireframes and resolve into real,
rendered objects — Ansh designs it, machines it, and codes it.

---

## 1. Reference breakdown (what we studied, what we borrow)

### oryzo.ai (by Lusion — Astro + three.js r178, AgX tone mapping, clearcoat/sheen/transmission, bloom, GSAP)
| Section | What happens | Borrow? |
|---|---|---|
| Intro | Olive-green screen, orange CAD construction lines + dashed circles **draw themselves** as you scroll, then the cork coaster resolves into a photoreal render on a green cutting mat, desk props around it (pencils, paperclips, eraser, box cutter), shallow depth of field | **Yes** — blueprint → render intro on the hero |
| Hero | Gigantic `ORYZO` wordmark top-left (cream), small caps tagline, glass-blur card bottom-left ("DESIGNED BY LUSION…"), corner video PIP with PLAY, "scroll to continue" cue bottom-centre | **Yes** — wordmark scale, PIP card, scroll cue |
| "Isn't just a coaster" | Background goes to warm near-black; the coaster is **pinned centre** and rotates/flips on scroll with a warm rim light; heading left (uppercase, 2 lines), paragraph right that **fades in line-by-line**; tiny footnote bottom-right with dotted rule | **Yes** — core pattern for the pinned showcase and project pages |
| Wearable | Horizontal strip of photos, centred card with a fake chat input + orange SEND pill | Maybe (card style only) |
| Features | Full-bleed scenes (thermal-camera palette shot, macro texture), left column: round icon, small caps title, short paragraph, giant feature title bottom-left | **Yes** — feature/chapter layout |
| Reviews | Rows separated by dotted rules, stars + `[5/5]` in mono, quote with orange highlighted phrase, image right, 3D object floating in the background | **Yes** — dotted row list (use for experience timeline) |
| Capabilities | Large rounded image cards with huge serif-less headlines over photography | Maybe (project cards) |
| Footer | Big CTA, socials, legal | Simplify |

### hervestudio badge-factory (vanilla three.js + cannon-es, STLLoader/GLB, RoomEnvironment, ACES 0.85, PCF shadows, GTAO + FXAA, adaptive pixel ratio)
| Section | What happens | Borrow? |
|---|---|---|
| Hero | Lavender gradient, small caps eyebrow "A LITTLE BADGE. A LOT INSIDE.", huge heavy display title with a 3D smiley button embedded **inline in the headline**, subtitle, white pill CTA "LET'S BUILD IT" | **Yes** — 3D object living inside the headline; pill CTA |
| Everything on the bench | Every part laid out on a **green cutting mat** in 3D; tap a part for a spec sheet; rearrange the mat (physics); "tidy up" link; dark pill "BILL OF MATERIALS" | **Yes** — hero trinkets on a mat, the "bench / skills" section |
| 10 chapters | Scroll assembles the badge piece by piece. Left: `03 / THE FACE OF IT` mono eyebrow, huge title (2–3 lines, second line in accent colour), body, bold instruction, mono caps spec line (`MEDIUM ENCLOSURE · 66 × 134 × 16 MM`), checklists, warning callouts. Right: the 3D assembly. Bottom bar: chapter name + progress line + `08 / 10`. Right edge: dot navigation | **Yes** — the project-page chapter system |
| Finale | Assembled object, "Made of parts. **Full of life.**", "EXPLORE IN 3D" black pill, "Got an idea?" + yellow pill | **Yes** — project page ending + next project |
| Render-settings panel | dat.GUI to tweak lights/materials, copy JSON | Dev-only: build a `?debug` leva panel for tuning |

---

## 2. Colour

Tokens live in the Tailwind v4 `@theme` block in `app/globals.css` (so `bg-ink`, `text-cream`… work and the values are CSS vars) and are mirrored in `components/three/materials.ts`. There is no `tailwind.config` file.

| Token | Hex | Use |
|---|---|---|
| `--ink` | `#100904` | Page background (warm near-black, never pure black) |
| `--ink-2` | `#1A120C` | Raised surfaces, cards on dark |
| `--brown` | `#382416` | Borders on dark, secondary buttons, gradient glow |
| `--grey-brown` | `#6C5F51` | Muted text on dark, dotted rules |
| `--cream` | `#FFEDD7` | Primary text on dark, light buttons |
| `--cream-dim` | `#F6E0C6` | Secondary light surfaces |
| `--orange` | `#DC5000` | **Single accent**: CTAs, highlighted words, blueprint lines, active nav |
| `--orange-glow` | `rgba(220,80,0,.35)` | Rim-light glows, hover halos |
| `--olive` | `#445231` | Blueprint intro background, cutting mat |
| `--olive-2` | `#5D6C49` | Mat grid lines |
| `--studio-1` | `#D9D9D9` | Light studio pages (printer hero) |
| `--studio-2` | `#CBCBCB` | Light studio secondary (printer Core-XY section) |
| `--studio-3` | `#F5F5F7` | Light studio bg (printer specs / CAD) |
| `--studio-ink` | `#1D1D1F` | Text on light studio |
| `--studio-muted` | `#86868B` / `#BFBFBF` | Labels on light studio |
| Printer v1 palette | `#1B1B1B` `#2F2E2B` `#3D3C3A` `#BFBFBF` `#8D8D8D` `#F8F8F8` | **Printer page only** (preserved v1 values, used as arbitrary Tailwind colours in `components/printer/`) |
| `--studio-warm` | `#E6E0D7` | Warm light sweep behind the Cycles product renders (Selected Works tiles); renders are lit on the same colour |

Rules: one accent only (orange). Large surfaces are ink or studio grey; colour comes from the **models' materials**
and photography. Text contrast ≥ 4.5:1 (cream on ink passes easily; grey-brown only for ≥ 14px labels).

Background warmth: subtle radial gradient of `--brown` → `--ink` behind hero objects (Oryzo does this — a warm glow
bottom-left that drifts with scroll).

## 3. Typography

| Role | Font | Style |
|---|---|---|
| Display | **Cabinet Grotesk** (Fontshare, self-hosted woff2 500/700/800/900 in `public/fonts/`, `--font-cabinet`) — chosen by Ansh 2026-10-22. Headings use 800, wordmark 800. (Clash Grotesk TTF stays in `public/fonts/` only for the printer page port.) | uppercase, tracking `-0.02em`, line-height 0.9–0.95 |
| Body | **Inter** (`next/font/google`) | 1.35 line-height, max 60ch |
| Mono / labels | **DM Mono** 400 (Google Fonts) | uppercase, tracking `+0.04em`, small sizes |

Fluid scale (Oryzo's method; implemented as `--u`, `--h1…--label` vars and `type-h1…type-label` utilities in `globals.css`): `--u = min(100vw / 1800, 100vh / 820)` on desktop, `--u = 100vw / 343` on mobile.

| Token | Desktop | Mobile |
|---|---|---|
| `--h1` (wordmark/hero) | 164u | 96u (scaled to mobile u) |
| `--h1-hero` (landing wordmark only) | = `--h1` | 60u (keeps the name off the hero models) |
| `--h2` (section/chapter title) | 68u | 38u |
| `--h3` | 45u | 26u |
| `--h4` | 32u | 16u |
| `--body1` | 24u | 18u |
| `--body2` | 18u | 16u |
| `--label` (mono) | 13u | 11u |

Emphasis pattern (from Badge Factory): second line of a chapter title in `--orange` ("Made of parts. **Full of life.**").
Inline highlight in body (from Oryzo reviews): key phrase coloured orange, not bold.

## 4. Layout & grid

- 16 columns desktop / 6 tablet / 4 mobile. Side padding `3.125vw` desktop, `16px` mobile. Gutter ≈ 24/90 of a column.
- Max content width: none for full-bleed scenes; 1440px for text-heavy blocks.
- **Dotted hairline rules** (`border-top: 1px dotted var(--grey-brown)`) separate rows/list items — signature detail of both references.
- Chapter layout (project pages): text in columns 1–6, 3D/media in 8–16. Mobile: media on top, text below, never side-by-side.
- Sections are generally `min-height: 100svh`; pinned scenes use ScrollTrigger pin with 150–300% scroll length.

## 5. Components

| Component | Spec |
|---|---|
| **Nav** | Fixed, transparent. Left: wordmark (display, ~22px, cream). Right: mono caps links (`WORK · ABOUT · CONTACT`), active link gets a dotted underline. Turns studio-ink while a section marked `data-nav-theme="light"` is under it (Nav probes on scroll); cream everywhere else. Mobile: `MENU / CLOSE` toggle → full-screen ink overlay. |
| **Chapter eyebrow** | `01 / THE FOUNDATION` — DM Mono, label size, `--grey-brown`, number in cream. |
| **Chapter title** | Display, `--h2`, 2–3 lines, last line orange optional. |
| **Spec line** | DM Mono caps with `·` separators: `CARBON PLATE · 20-PLY · WATERJET-CUT`. |
| **Pill button** | Fully rounded, mono caps, 14px; variants `orange` (cream text), `cream` (ink text), `ink` (cream text, brown border). Hover: slight scale 1.03 + glow. |
| **Scroll cue** | Circle with chevron + `SCROLL TO CONTINUE` mono, bottom-centre, fades out after first scroll. |
| **Video PIP** | Rounded 12px card, bottom-right, orange 1px border, thumbnail + `PLAY`; click expands to modal. Use for project reels. |
| **Glass card** | `backdrop-filter: blur(14px)`, `rgba(255,237,215,.06)` bg, 1px `rgba(255,237,215,.12)` border. |
| **Part popover** | On clicking a 3D part: small card with part name (display h4), mono spec line, 1–2 sentence note. Anchored via drei `<Html>`. |
| **Progress counter** | Bottom bar: chapter name left, thin orange progress line, `03 / 10` right (mono). Right-edge dot nav on desktop. |
| **Tool chips** | Rounded-xl square tiles with a tool logo (preserves the printer hero's "Tools Used" pattern). On dark pages: `--ink-2` bg, brown border. |
| **Grain** | Fixed full-screen noise overlay at ~6% opacity, `mix-blend-mode: overlay`, CSS-animated steps. Use a local noise PNG (not a remote URL). |
| **Stat** | Huge number (display) + mono label below: `65` / `MERCHANT SIGN-UPS`. |

## 6. Motion

- **Easing:** `power3.out` for reveals, `expo.inOut` for camera moves, `none` (scrubbed) for scroll-linked rotation.
  CSS fallback: `cubic-bezier(.16,1,.3,1)`.
- **Durations:** UI 200–300ms; text reveals 600–900ms, staggered 60–80ms per line; camera moves 1.2–1.6s.
- **Text reveal:** split into lines; each line goes from `opacity .15` → `1` as it enters (Oryzo's paragraph fade-in
  is scrubbed with scroll, not timed).
- **Pinned object scene:** object centred, rotates 0→~200° across the pin while the light rig stays fixed so the
  rim highlight sweeps across the surface (that sweep is what makes Oryzo feel expensive).
- **Blueprint → render:** edges drawn with `EdgesGeometry` + animated dash offset in orange on olive, then a
  dissolve/clip-plane wipe reveals the shaded mesh; background crossfades olive → ink. (See 3D_GUIDE §6.)
- **Assembly on scroll:** parts start exploded/offset along named axes, tween to assembled positions per chapter.
- **Hover on 3D:** cursor changes to a small orange ring; hovered object lifts 2–4% and gets an orange fresnel rim.
- **Reduced motion:** disable Lenis + pins; show posters; reveals become simple fades; no auto-rotate.

## 7. Imagery & 3D look

- Objects lit like product photography: dark seamless background, warm key, cool-ish rim, deep soft shadows.
- Show real materials honestly (FDM layer lines, carbon weave, anodised aluminium) — see 3D_GUIDE material presets.
- Photography (shop/prototype photos): slightly warm grade, lifted blacks to match `--ink`, rounded 12px corners.
- Light-studio exception: the **3D printer page** keeps its light grey studio look (it's preserved). Other project
  pages may use a light studio chapter for CAD/drawings if Ansh wants — but default is dark.

## 8. Voice & copy

- Confident, specific, numbers-first. "Minimum FoS ≈ 3 at 180 lbf axial and 600 lbf-in torque." beats "robust design".
- Short headline beats, Oryzo-style: big claim left, explanation right.
- A little playful in microcopy (scroll cues, hover labels, "tidy up the bench") — but **no fake satire**, all facts real.
- First person ("I designed…") in body copy; headlines can be impersonal.

## 9. Responsive

- Breakpoints: `sm 640`, `md 768`, `lg 1024`, `xl 1440`.
- Mobile: hero trinkets reduce in count (≤ 5) and physics simplifies (tap to bounce instead of drag); pinned scenes
  shorten to ~120% scroll; chapters stack.
- Never horizontal scroll at 375px.
