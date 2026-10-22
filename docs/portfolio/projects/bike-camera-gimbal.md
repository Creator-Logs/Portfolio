# Project: Bike-Mounted 3-Axis Camera Gimbal (in progress)

> Route: `/projects/camera-gimbal` · Order: **04** · 2026 – Present · **Status: in progress** (show a badge)
> Tools: Fusion 360 (parametric CAD), FDM prototyping

---

## STEP 0 — Ask Ansh before writing any code (mandatory)
1. "What do you already have for the gimbal?" — Fusion model (with joints?), renders, prototype photos, interview
   notes/synthesis, requirement doc, sketches, any test footage (stabilised vs not), electronics/motor choices.
2. "What's the current status and what's next?" (so the page can show progress honestly).
3. "Do you want to show interview insights (quotes/themes) from the 50+ filmmakers?"

---

## Story arc
**Listen → Spec → Design → Prototype → (next).** User-research-driven hardware: 50+ filmmaker interviews turned into
hard requirements, then a parametric mechanism.

## Section spec
1. **Hero** — Title `CAMERA GIMBAL`, subtitle *"A seatpost-mounted 3-axis motorized gimbal for cyclists who film"*,
   `IN PROGRESS` pill, spec line `3-AXIS · 500 G PAYLOAD · SEATPOST MOUNT · PARAMETRIC`. 3D: gimbal on a seatpost stub,
   camera level while the post sways gently.
2. **The Goal** — stabilised footage from a bike without a chest rig or handheld.
3. **Chapter 01 / 50+ CONVERSATIONS** — interview research. Visual: grid of anonymised quote cards / theme tags
   that cluster into requirements (animate cards → requirement rows).
4. **Requirements** — dotted rows: `PAYLOAD 500 G` · `HANDLEBAR JOYSTICK + DISPLAY CONTROL` · `VIBRATION ISOLATION` ·
   `QUICK-RELEASE CAMERA MOUNT` · `SEATPOST CLAMP`.
5. **Chapter 02 / THE MECHANISM** — parametric arms adjustable to camera centre of mass; camera interface; silicone
   damper; seatpost clamp. 3D: exploded view + hotspots.
6. **Interactive demo (signature) / STABILISATION** — user drags (or a "ride" toggle simulates road noise) the
   seatpost/bike; the three gimbal axes counter-rotate (simple inverse rotation per axis with slight lag/spring) so
   the camera stays level. A small "camera view" inset shows a level horizon vs a shaky one.
   Second control: **COM slider** — slide arm length; a COM marker moves; the balance indicator goes green when centred.
7. **Chapter 03 / PROTOTYPING** — FDM-prototyped arms; iteration photos.
8. **What's next** — honest roadmap (motors/controller, IMU, joystick, field tests) per Ansh.
9. **Next project** → TapCarry.

## 3D treatment
- Fusion export with **named joints/pivots** (`yaw_arm`, `roll_arm`, `pitch_arm`, `camera_plate`, `damper`, `clamp`);
  in Blender set each pivot object's origin on its axis so rotations are clean.
- Materials: `pla_matte` (prototype arms, layer lines), `rubber_silicone` (damper), `alu_machined` (clamp/hardware),
  a simple camera body (or a placeholder mirrorless model from Ansh / CC0 source).
- Demo math: camera target orientation = level; each axis angle = −(disturbance component) with a critically-damped
  spring for a believable lag. Clearly labelled as a visualisation, not the real controller.

## Assets requested from Ansh
- [ ] Fusion assembly (FBX/STEP) with named components and joint origins
- [ ] Prototype photos (arms, clamp, damper), on-bike photos if any
- [ ] Interview synthesis: top themes, a handful of anonymised quotes, count by user type
- [ ] Requirements doc / spec table
- [ ] Any footage (shaky vs stabilised) — even phone tests
- [ ] Planned electronics (motors, controller, IMU) for the roadmap

## Questions for Ansh
- [ ] Solo or team? Class project or personal/startup? Answer:
- [ ] Current status in one sentence? Answer:
- [ ] Which camera(s) is it sized for? Answer:
- [ ] OK to publish interview quotes (anonymised)? Answer:
- [ ] Target mass / price? Answer:
- [ ] Should the demo be playful (bumpy road toggle) or more technical (axis angle readouts)? Answer:

## Done when
- [ ] Stabilisation demo + COM slider working, labelled as visualisation
- [ ] Requirements traced back to interview insights
- [ ] In-progress status clear; mobile + reduced-motion OK; perf budget
- [ ] README status + answers recorded
