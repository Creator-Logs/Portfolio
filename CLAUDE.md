# Creator Logs — Ansh Gupta Portfolio (v2 refactor)

This repo is mid-refactor. The old portfolio is being replaced by a new 3D-first site.
All planning lives in `docs/portfolio/`. **Every build session follows those docs.**

## Before doing anything in a build session
1. Read `docs/portfolio/README.md` (build order, session protocol, status).
2. Read `docs/portfolio/DESIGN.md` and `docs/portfolio/3D_GUIDE.md`.
3. Read `docs/portfolio/ARCHITECTURE.md`.
4. Read the page file you were asked to build (`docs/portfolio/pages/*.md` or `docs/portfolio/projects/*.md`).
5. **Run that file's STEP 0** — ask Ansh what he already has for the page and wait for answers. Do not write code before STEP 0 is answered.

## Hard rules
- The **3D printer page is preserved**. Rebuild it exactly per `docs/portfolio/projects/3d-printer.md`; don't redesign it.
- Use only the tokens/components defined in `DESIGN.md`. If something new is needed, add it to `DESIGN.md` first so later sessions stay consistent.
- All 3D models go through the pipeline in `3D_GUIDE.md` (Blender cleanup → GLB → gltf-transform). Never ship raw Fusion/STEP exports.
- Projects from `Ansh_Gupta_Engineering_Resume_.pdf` take priority over the software resume.
- Out of scope for now (don't add): FSAE Dashboard/Telemetry, Deep Learning/nanoGPT, Hero MotoCorp internship.
- Copy must be factual — numbers come from the resumes or from Ansh. Never invent metrics.
- After finishing a page: update the status table in `docs/portfolio/README.md` and write Ansh's answers back into the page file's "Questions" section.
