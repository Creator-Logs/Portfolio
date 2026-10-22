# Landing Page (`/`) — includes Foundation

> Build session prompt: *"Build the landing page per docs/portfolio/pages/landing.md."*
> This is the **first** session. It also does the teardown + foundation from ARCHITECTURE.md.

---

## STEP 0 — Ask Ansh before writing any code (mandatory)

Ask these, wait for answers, record them in the "Answers" block at the bottom:

1. **Hero trinkets:** *Which of your models do you want floating/sitting on the hero bench as trinkets?*
   For each: name, which project it links to (or "just for fun"), and the file (Fusion export / GLB / STL).
   Ask him to list everything he's considering — we'll pick 5–9 for desktop, ≤ 5 for mobile.
   Ask which **one** trinket should be the "hero of the hero" (the pinned rotating object in section 2).
2. **TapCarry:** Does he have a screen recording of the TapCarry landing page? The live URL? Is he allowed to embed it?
3. **Branding:** Wordmark `ANSH GUPTA` or `CREATOR LOGS`? (Old site was "Creator Logs"; domain is creatorlogs.com.)
4. **Portrait / photos:** Keep `public/ansh_gupta_portrait.webp`? Any new photos (shop, team, working)?
5. **Anything else he already has** for the landing page (copy he likes, a showreel video, logos, a font choice).
6. Keep or delete `public/creator_logs_hero_image.webp` and `public/Overlay.svg`?

Then do the Foundation, then build sections in order, asking the "Questions for Ansh" as each becomes relevant.

---

## Foundation (do first, after STEP 0)

0. **Before deleting anything:** run the old site (`npm run dev`) and save full-page screenshots of
   `/portfolio/3d_printer` at 1440×900 and 375×812 to `docs/portfolio/reference/printer-v1-*.png` — the printer
   session uses them for side-by-side comparison.
1. Teardown per ARCHITECTURE.md → commit "chore: tear down v1 portfolio".
2. Upgrade Next/React/Tailwind; install three, R3F, drei, postprocessing, rapier, gsap, lenis.
3. Tokens in `globals.css` + Tailwind config per DESIGN.md; load fonts (display, body, DM Mono).
4. `SceneRoot` (single canvas + `View.Port`), `StudioEnvironment` (dark-studio, light-studio), `materials.ts`,
   `Model`, `PosterFallback`, `useReducedMotion`, Lenis + ScrollTrigger wiring.
5. `Nav`, `Footer`, `Grain`, `PillButton`, `ChapterHeader`, `SpecLine`, `ScrollCue`, `ToolChips`.
6. `content/site.ts` + `content/projects.ts` (all 6 projects; posters can be placeholders until each project session).
7. `?debug` leva panel to tune lights/materials live.
8. Redirect `/portfolio/3d_printer → /projects/3d-printer`.

---

## Goal

In 10 seconds a recruiter should know: **Ansh designs physical things, makes them with his hands, and writes
the software too** — and they should want to play with the page. The trinkets are proof: they are *his* CAD.

## Section spec

### 1. Intro → Hero bench (`#intro`)
- **Loading/intro: CUT by Ansh (2026-10-22, Phase 5).** A blueprint draw-on → "print" reveal was built and removed;
  the mat appears directly with models streaming in. Do not re-add.
- **Mat scene (REVISED by Ansh 2026-10-22 — replaces the physics bench; built in Phase 4):** a green cutting mat
  (procedural: `components/landing/CuttingMat.tsx`, mm/cm/5 cm grid, ruler numbers, 45°/60° guides) on a warm dark
  desk, high 3/4 camera. Every model from `content/trinkets.ts` rests on it doing a gentle **idle animation** (bob +
  sway, own phase); **no physics, no drag, no tidy-up**:
  - hover → lift + orange fresnel rim + mono label pill + orange ring cursor;
  - click → camera pushes in (`expo.inOut`, 0.7 s) then routes to the project page;
  - models stream in one at a time (smallest first), mat LOD only; IMU shown with its sleeve slid off (electronics visible).
- **Overlay type:** huge wordmark top-left (`--h1`, cream). Mono tagline above or below, e.g.
  `SYSTEMS ENGINEERING & DESIGN @ UIUC — I DESIGN IT, MACHINE IT, AND CODE IT.` (confirm with Ansh).
  Glass card bottom-left: 2–3 lines intro (name, school, GPA optional). Scroll cue bottom-centre.
  Optional video PIP bottom-right (showreel) if Ansh has one.
- Mobile: top-down camera, ≤ 5 trinkets, tap to bounce, no drag; wordmark stacks.
- DOM fallback: a visually hidden list of trinket links for keyboard/screen readers.

### 2. Pinned showcase (`#about` intro beat)
- The chosen hero trinket is **pinned centre**, rotating with scroll under a fixed rim-light rig (rim sweep).
- Left: 2-line uppercase heading (draft: `NOT JUST / A RENDER.` or `BUILT, / NOT JUST DRAWN.`).
- Right: paragraph fading in line by line (draft from resume): *"Every part on this page is something I designed in
  CAD and then made — on a lathe, a CNC mill, a waterjet, a printer, or in code. Systems Engineering & Design at
  UIUC, 3.96 GPA."*
- Footnote bottom-right with dotted rule (e.g. which project the object is from).

### 3. TapCarry monitor — CUT by Ansh (2026-10-22, Phase 7 skipped)
- No separate TapCarry section on the landing. TapCarry stays as the monitor on the hero mat and as row 05 in
  Selected works; its full story lives on `/projects/tapcarry`.

### 4. Selected works (`#work`)
- Badge Factory chapter style, one row per project, ordered from `content/projects.ts`:
  `01 / STEERING WHEEL`, `02 / 3D PRINTER`, `03 / IMU WEARABLE`, `04 / CAMERA GIMBAL`, `05 / TAPCARRY`, `06 / GARAGE INVENTORY`.
- Each row: eyebrow, display title, one sentence, spec line, tool chips, and a media slot (small `View` with the
  model on hover-rotate, or poster image). Rows separated by dotted rules (Oryzo reviews style).
- Hover row → model spins up, title shifts right, orange arrow appears. Whole row is a link.
- Progress counter bottom bar while this section is in view (`03 / 06`).

### 5. The bench / skills (`#bench`)
- "Everything on the bench" (Badge Factory): a top-down mat with the toolchain as objects/tiles:
  CAD & analysis (Creo, Fusion 360, Ansys, tolerance analysis, drawings, DFM) · Manufacturing (CNC mill, lathe,
  waterjet/laser, sheet metal, FDM, SLS, 3D scanning) · Code & hardware (Python, C++, TypeScript, SQL, PyTorch,
  Next.js, PostgreSQL, KiCad, ESP32, Raspberry Pi, CAN).
- Tap a tile → small spec popover ("Used in: Steering Wheel, 3D Printer").
- Can be 2D tiles with subtle 3D tilt if budget is tight — decide with Ansh.

### 6. Experience (`#experience`)
- Dotted-rule list rows (Oryzo reviews layout): role, org, dates (mono), 1–2 lines, link to project if relevant.
  - **Illini Electric Motorsports** — Steering Wheel Project Lead, Cockpit (Aug 2025–Apr 2026); Dashboard & Telemetry (Apr 2026–Present)
    *(telemetry project itself is out of scope — role line only, confirm with Ansh)*
  - **The Garage Makerspace, UIUC** — Program Manager & Software Lead (Jan 2026–Present) — 300+ students trained/semester
  - **TapCarry** — Founding Engineer (May–Aug 2026)
  - **Education:** UIUC, B.S. Systems Engineering & Design, expected Dec 2028, GPA 3.96, Dean's List
- Optional `DOWNLOAD RÉSUMÉ` pill.

### 7. Contact / footer (`#contact`)
- Huge line: `GOT AN IDEA?` / `LET'S BUILD IT.` (Badge Factory finale energy) + orange pill `EMAIL ME`.
- Links: LinkedIn, GitHub (github.com/Creator-Logs), email, résumé. Mono small print: location (Urbana, IL), © year.
- A trinket or two can tumble into the footer for fun (optional).

## 3D treatment summary
- Scenes: bench (physics), pinned hero object, monitor. All in one canvas via `View`.
- Lighting: `dark-studio` preset; bench adds a warm desk-lamp key from top-left with `AccumulativeShadows` baked
  once after trinkets settle (re-bake on "tidy up"), or `ContactShadows` if simpler.
- Materials: map each trinket's Blender materials to presets (most will be `pla_matte`).
- Tone mapping: AgX; switch the monitor screen material to `toneMapped:false`.

## Assets requested from Ansh
- [ ] Trinket models — Fusion export (FBX/OBJ/STEP) or GLB, one per trinket, with real colours noted
- [ ] Which trinket = hero showcase object
- [ ] TapCarry landing page scroll recording: 1920×1200 (16:10) or 2560×1600, 10–20s loop, MP4 (H.264) + WebM, no cursor
- [ ] TapCarry poster frame (PNG/WebP) and live URL; confirm iframe embedding is allowed
- [ ] Portrait / personal photo(s)
- [ ] Optional showreel video for the hero PIP
- [ ] Résumé PDF to link (which version?)
- [ ] Social links + email to display
- [ ] Wordmark/brand decision; favicon if changing
- [ ] Font decision (or approve Clash Grotesk + DM Mono)

## Questions for Ansh (ask as relevant; write answers inline)
- [ ] Wordmark: `ANSH GUPTA` vs `CREATOR LOGS`? Answer:
- [x] Tagline wording? Answer: keep "Systems Engineering & Design @ UIUC — I design it, machine it, and code it." (2026-10-22)
- [ ] Which email to show — `anshg3@illinois.edu` (résumé) or `anshgupta0621@gmail.com` (old site)? Answer:
- [ ] How many trinkets, and should they be physics toys (drag/toss) or calmer (float + hover)? Answer:
- [ ] Should clicking a trinket route to its project, or open a quick-look popover first? Answer:
- [x] Blueprint intro on every visit, or first visit only (sessionStorage)? Answer: first chose first-visit-only, then **cut it entirely** after seeing it (2026-10-22).
- [ ] Monitor style: procedural generic, or a specific model? Answer:
- [x] Show GPA on the landing page? Answer: **no GPA** (2026-10-22).
- [ ] Include the Illini EV telemetry role in the experience list even though the project is out of scope? Answer:
- [ ] Résumé download — engineering or software version (or both)? Answer:
- [ ] Bench/skills section: full 3D or 2D tiles? Answer:
- [ ] Any sections you'd add/remove? Answer:

## Done when
- [ ] Teardown committed; build passes on the new stack
- [ ] All 7 sections implemented, desktop + 375px mobile
- [ ] Trinkets interactive, links work, keyboard-accessible DOM fallback exists
- [ ] Monitor video plays; live mode works or gracefully opens a new tab
- [ ] Reduced-motion mode: posters, no pins, no Lenis
- [ ] Perf budget from 3D_GUIDE met; Lighthouse desktop perf ≥ 80
- [ ] README status updated, answers recorded below

## Answers (filled during the build)
STEP 0 (2026-10-22):
- **Hero (changed from spec):** green cutting mat with every model on it doing an idle animation; hover shows the
  name, click routes to the project. **No physics / drag / tidy-up.**
- **Models:** STEP files for the 3D printer, IMU device and steering wheel (`~/Downloads/3D Models - STP/`), plus a
  TapCarry monitor model. More models will be added later. **Keep them detailed — no optimisation that causes visual defects.**
- **Hero showcase object (section 2):** steering wheel.
- **TapCarry:** a still picture of the tapcarry.com hero section on the monitor (no video, no live iframe); clicking
  goes to the case study `/projects/tapcarry`. Claude captures the screenshot.
- **Wordmark:** `ANSH GUPTA` only in the hero (not repeated in the nav); nav shows the `CREATOR LOGS` mono sub-brand.
- **Intro card:** includes a photo of Ansh (placeholder slot until he provides the photo).
- **Fonts:** Cabinet Grotesk (display) + Inter (body) + DM Mono (labels).
- **Assets:** keep `ansh_gupta_portrait.webp`; deleted `creator_logs_hero_image.webp` and `Overlay.svg`.
- **Process:** build phase by phase with approval at each checkpoint; follow three.js docs best practices so the site
  doesn't crash or lag.
Phase 3 (models, 2026-10-22):
- Hero mat loads the **mat LOD only** (exact CAD at 0.1 mm); full detail is for project pages + the pinned showcase.
- IMU: use the STEP **as-is** for now (missing Fusion mesh-body parts); it renders as a closed enclosure from outside.
- Materials/colours: **render with defaults now; tune lighting + materials together later**.
Phase 6 (pinned showcase, 2026-10-22):
- Heading: **DESIGNED. / MACHINED. / CODED.** (last line orange). Paragraph without GPA.
- Built with CSS sticky (not a GSAP pin), detail wheel LOD loaded a screen ahead, renders only on scroll.
Phase 8 (selected works, 2026-10-22):
- Rows from `content/projects.ts`; media = still poster (rendered from /dev/models view 0 → public/project_media/<slug>/poster.webp;
  TapCarry uses its hero screenshot); desktop hover-intent (250 ms rest, no scroll) mounts the live spinning model.
- Gimbal + Garage have no media yet ("Media coming soon" tiles) — ask Ansh in those project sessions.
- Known, for Phase 11: ~2 s main-thread freeze during first load while the 9 MB printer mat GLB uploads.
- Note for the printer session: the v1 printer page overflows horizontally at 375px (see `reference/printer-v1-mobile.png`).
