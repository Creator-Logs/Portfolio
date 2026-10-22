# Project: IMU Jump-Height Wearable

> Route: `/projects/imu-wearable` · Order: **03** · Jan – May 2026
> Tools: KiCad, C++ (Arduino), Python, PyTorch, pandas, SciPy, scikit-learn, sensor characterization

---

## STEP 0 — Ask Ansh before writing any code (mandatory)
1. "What do you already have for the IMU wearable?" — KiCad project / 3D export, enclosure CAD, photos of the PCB
   (bare, soldered, in enclosure, on an athlete), firmware repo, dataset sample, training notebooks, plots
   (confusion matrix, bias vs temperature, predicted vs video heights), demo video, report/slides.
2. "Can the dataset or a sample of it be shown publicly (athlete privacy)?"
3. "Is there a GitHub repo to link?"

---

## Story arc
**Hardware → Firmware → Data → Model → Accuracy.** A full-stack hardware + ML project: a custom board you can wear,
that knows when you jump and how high.

## Section spec
1. **Hero** — Title `JUMP WEARABLE` (confirm name), subtitle *"A 6-axis IMU device that measures jump height"*,
   spec line `CUSTOM PCB · 500 HZ · 1D CNN · 2.5 CM MEAN ERROR`. 3D: PCB + enclosure, pinned rotate; PCB glows
   subtly (LED/emissive) when "on".
2. **The Goal** — athlete-worn device to detect jumps and estimate height accurately vs video.
3. **Chapter 01 / THE BOARD** — custom KiCad PCB, hand-soldered **0402 / QFN** parts. 3D: exploded enclosure → PCB
   lifts out → hotspots on IMU, MCU, battery, connectors. Toggle "layers": top copper / silkscreen texture swap (if available).
4. **Chapter 02 / FIRMWARE** — C++ firmware streaming 6-axis data at **500 Hz**, low-voltage cutoff + sleep mode
   validated by battery-life testing. Visual: a live-looking oscilloscope strip (canvas) playing a recorded IMU trace.
5. **Chapter 03 / KNOW YOUR SENSOR** — measured temperature-dependent gyro/accel bias vs datasheet; implemented firmware
   temperature compensation. Visual: bias-vs-temp chart, before/after compensation.
6. **Chapter 04 / THE DATA** — video-synced labeling pipeline; **200+ jumps, 1.43M samples, 6 athletes**.
   Visual: synced video + signal scrubber (scroll scrubs both).
7. **Chapter 05 / THE MODEL** — 1D CNN (PyTorch) on 8-channel windows (6-axis + magnitude + jerk), class-weighted loss
   + augmentation for 1:12 imbalance → **0.95 jump F1 (99% accuracy)** on held-out windows. Visual: animated
   architecture diagram (blocks as 3D extrusions or SVG), confusion matrix.
8. **Chapter 06 / HOW HIGH** — DSP pipeline: Butterworth filtering → airtime thresholding → impact-peak landing
   detection → height **2.5 cm mean error, r = 0.98** vs video. Visual: interactive chart toggling raw → filtered →
   detected airtime, plus scatter predicted vs actual.
9. **Interactive demo (signature)** — the device model "jumps" (follows a recorded trajectory); a big height readout
   counts up in real time; user can pick one of a few recorded jumps.
10. **Results** — stats: `0.95 F1`, `2.5 CM`, `r = 0.98`, `1.43M SAMPLES`. **Next** → Camera Gimbal.

## 3D treatment
- PCB: KiCad *File → Export → glTF* (or VRML) → Blender: `pcb_soldermask`, `pcb_gold`, silkscreen texture, component
  bodies (black epoxy `roughness .4`), USB/connectors `steel_polished`.
- Enclosure: Fusion export, `pla_matte` (V1 FDM) with layer-line normal.
- Charts: custom SVG/canvas in DESIGN tokens (orange signal on ink, dotted grid). Keep data files small: downsample
  traces to ~2–5k points per chart, ship as compact JSON.

## Assets requested from Ansh
- [ ] KiCad project or glTF/VRML/STEP export of the PCB; board render or photo
- [ ] Enclosure CAD (Fusion export)
- [ ] Photos: bare PCB, soldered PCB (macro of 0402/QFN), device on athlete
- [ ] One or more recorded jumps: IMU CSV (time, ax, ay, az, gx, gy, gz) + matching video clip + labelled height
- [ ] Bias-vs-temperature data or plot
- [ ] Confusion matrix + predicted-vs-actual height data/plot
- [ ] CNN architecture summary (layers, window size)
- [ ] Battery-life test result (hours) if available
- [ ] Repo link (optional)

## Questions for Ansh
- [ ] Project name for the page? Answer:
- [ ] Was this a class project, research, or personal? Team or solo? Answer:
- [ ] Athlete privacy — OK to show faces/video? Answer:
- [ ] Battery life numbers / device mass / dimensions? Answer:
- [ ] Is there a V2 enclosure planned (mention in "next")? Answer:
- [ ] Which sport/athletes (volleyball, basketball…)? Answer:

## Done when
- [ ] PCB + enclosure model with exploded view and hotspots
- [ ] At least the DSP chart and the jump demo use real recorded data
- [ ] All metrics match résumé/Ansh; reduced-motion + mobile OK; perf budget
- [ ] README status + answers recorded
