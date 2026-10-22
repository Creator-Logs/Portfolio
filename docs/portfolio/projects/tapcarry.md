# Project: TapCarry — Wallet Loyalty Platform (best software project)

> Route: `/projects/tapcarry` · Order: **05** · Founding Engineer, May – Aug 2026, remote
> Tools: Next.js, PostgreSQL (Supabase, RLS), Vercel, Apple Wallet / Google Wallet passes, Paddle, Claude Code
> Also featured on the landing page as the **3D monitor** section — reuse `components/three/Monitor.tsx`.

---

## STEP 0 — Ask Ansh before writing any code (mandatory)
1. "What do you already have for TapCarry?" — landing page recording, live URL, logo/brand kit, wallet pass designs
   (Apple/Google), merchant dashboard screenshots, staff app screens, ERD/schema diagram, architecture diagram,
   load-test results, pilot café photos/testimonials, metrics.
2. "What can be shown publicly?" (confidentiality, merchant names, internal dashboards).
3. "Should the page link to the live site?"

---

## Story arc
**Problem → Ship fast → Make it safe → Make it cheap → Traction.** Sole engineer shipping a real multi-tenant
product in two weeks, then hardening it.

## Section spec
1. **Hero** — the monitor scene from the landing page, closer and larger; screen plays the landing recording.
   Title `TAPCARRY`, subtitle *"Apple & Google Wallet loyalty cards for independent merchants"*, spec line
   `NEXT.JS · POSTGRESQL · RLS · WALLET PASSES · SOLE ENGINEER`. Pill `VISIT TAPCARRY` (if allowed) + "Try it live" mode.
2. **The Goal** — what TapCarry is and who it's for (punch cards that live in your phone's wallet).
3. **Chapter 01 / TWO WEEKS TO V1** — shipped v1 as sole engineer in 2 weeks; used Claude Code to accelerate backend
   development. Visual: timeline strip day 1 → 14.
4. **Signature 3D / THE PASS** — a 3D wallet pass card (thin rounded rect, glossy clearcoat card material,
   front/back textures) that flips on scroll; stamps fill in one by one (6.3 visits avg); a phone frame optional.
   Tapping the card "stamps" it with a satisfying bounce.
5. **Chapter 02 / ISOLATED BY DESIGN** — 14-table PostgreSQL schema with row-level security for tenant isolation; an
   event ledger recording before/after balances on every stamp, redemption, and admin adjustment. Visual: ERD as
   floating 3D tiles or a clean SVG graph; a ledger row animation (before → after).
6. **Chapter 03 / ANTI-FRAUD** — 3 layers built at merchants' request: geofenced stamping, device fingerprinting,
   API rate limiting. Visual: three concentric rings/shields that light up.
7. **Chapter 04 / FREE-TIER ENGINEERING** — load-tested with AI-generated user behaviour; cut Supabase egress **80%**
   via image compression + caching to stay on the free tier; enforced Paddle subscription-tier limits on passes,
   staff seats, push frequency. Visual: bar going from 100 → 20.
8. **Results** — stats: `65` merchant sign-ups · `6.3` avg visits per pilot café customer · `20` rewards redeemed in
   3 weeks · `80%` egress cut · `2 WEEKS` to v1.
9. **Next project** → Garage Inventory.

## 3D treatment
- **Monitor:** procedural or provided model; screen `MeshBasicMaterial` + `VideoTexture` (`toneMapped:false`),
  glass layer with clearcoat reflections; `NeutralToneMapping` here so brand colours stay accurate.
- **Live mode:** camera dolly to screen, then swap to iframe (drei `<Html transform>` aligned to the screen plane or
  a DOM overlay). Check the live site's `X-Frame-Options` / CSP `frame-ancestors`; if blocked, open a new tab.
- **Wallet pass:** thin rounded box, front/back textures from Ansh's pass designs, `clearcoat .8` for that glossy
  card sheen; stamps as decals/instanced meshes.

## Assets requested from Ansh
- [ ] Landing page scroll recording (1920×1200 or 2560×1600, 10–20 s loop, MP4 + WebM, no cursor) + poster frame
- [ ] Live URL; confirm embedding is OK (or that Ansh can add our domain to `frame-ancestors`)
- [ ] Logo (SVG) + brand colours
- [ ] Apple/Google Wallet pass designs (front/back PNG) or screenshots
- [ ] Merchant dashboard / staff app screenshots (redacted if needed)
- [ ] ERD / schema export (even a screenshot of Supabase table editor)
- [ ] Pilot café photo/testimonial (with permission)

## Questions for Ansh
- [ ] Confidentiality — anything that must not be shown? Answer:
- [ ] Link the live site? Answer:
- [ ] Your title — "Founding Engineer" — and is TapCarry still running / your current involvement? Answer:
- [ ] Mention Claude Code usage on the page (it's on the résumé)? Answer:
- [ ] Any additional metrics since the résumé was written? Answer:
- [ ] Is there a merchant you can name? Answer:

## Done when
- [ ] Monitor hero + live mode; wallet pass interaction
- [ ] Every number matches the résumé or Ansh's answers
- [ ] Mobile + reduced-motion OK; perf budget
- [ ] README status + answers recorded
