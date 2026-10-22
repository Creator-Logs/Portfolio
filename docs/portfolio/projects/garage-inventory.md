# Project: The Garage — Makerspace Inventory System

> Route: `/projects/garage-inventory` · Order: **06** · Jan 2026 – Present
> Role: Program Manager & Software Lead, The Garage Makerspace, UIUC Innovation Living-Learning Community
> Tools: Next.js, Three.js, Microsoft Graph API, Vercel, ESP32 + RFID, QR codes

---

## STEP 0 — Ask Ansh before writing any code (mandatory)
1. "What do you already have for the Garage inventory system?" — repo access, the Three.js shop map (model/code),
   floor plan, screenshots/recordings of the app, QR shelf photos, photos of the Garage, the Excel log format
   (redacted), ESP32 RFID hardware photos, usage stats.
2. "Can we reuse your actual map code/model here, or should we rebuild a lighter version?"
3. "Do you have permission from Garage leadership / University Housing to show the system?"

---

## Story arc
**Lost items → A map → One scan → A record.** Making a busy shop findable: from 5–10 minutes hunting to ~30 seconds.

## Section spec
1. **Hero** — Title `THE GARAGE`, subtitle *"A 3D-mapped inventory and checkout system for a 300+ student makerspace"*,
   spec line `NEXT.JS · THREE.JS · MICROSOFT GRAPH · QR · ESP32 RFID`. 3D: the isometric shop map, slowly orbiting.
2. **The Goal** — 500+ SKUs, 25 machines, ~50 checkouts/day, and no way to know where things were or who took them.
3. **Signature 3D / FIND ANYTHING** — the isometric map; a search box ("calipers", "M3 screws"…) → camera flies to the
   shelf, shelf glows orange, item card pops up. Stat: `5–10 MIN → ~30 S`.
4. **Chapter 01 / THE MAP** — built from floor plans with AI-assisted modelling; pinpoints any item's shelf.
5. **Chapter 02 / SCAN TO CHECK OUT** — QR-coded shelves for phone checkout. Visual: phone frame scanning a QR →
   checkout confirmation animation.
6. **Chapter 03 / A SYSTEM OF RECORD** — Microsoft Graph sync logs every checkout (item, location, timestamp) to
   Excel, University Housing's required system of record — the Garage's first way to trace missing items. Visual:
   rows appearing in a spreadsheet-styled table.
7. **Chapter 04 / GATED MACHINES** — integrating ESP32 RFID scans to gate machine access (in progress).
8. **Results** — stats: `~30 S` lookup · `500+ SKUs` · `25 MACHINES` · `~50 CHECKOUTS/DAY` · `300+ STUDENTS/SEMESTER` trained.
9. **Next project** → back to Steering Wheel (loop) or landing.

## 3D treatment
- Prefer reusing Ansh's existing map geometry exported as GLB (or loading his scene code into a `View`).
- Style it to the site: `dark-studio` lighting variant from above (isometric orthographic camera), shelves in muted
  `pla_matte`, selected shelf `--orange` emissive, labels via `<Html>`.
- Search demo uses a small static JSON of sample items → shelf IDs (no real backend calls).

## Assets requested from Ansh
- [ ] Repo access or exported map GLB + shelf ID list
- [ ] Floor plan image
- [ ] App screenshots / screen recording (search, checkout, admin)
- [ ] QR shelf photos, Garage photos
- [ ] Redacted Excel log screenshot
- [ ] ESP32 RFID hardware photo (if built)
- [ ] Usage numbers since launch (if any)

## Questions for Ansh
- [ ] Permission to show the system + Garage branding? Answer:
- [ ] Reuse actual map code, or rebuild a lighter replica? Answer:
- [ ] Is the system live? Any adoption stats? Answer:
- [ ] RFID gating status — built, testing, or planned? Answer:
- [ ] Include your Program Manager / training work (300+ students) on this page or only on landing? Answer:

## Done when
- [ ] Interactive map search demo works on desktop and mobile
- [ ] Facts match résumés/Ansh; permission confirmed
- [ ] Reduced-motion + perf budget
- [ ] README status + answers recorded
