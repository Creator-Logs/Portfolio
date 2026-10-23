"use client";

import Link from "next/link";
import { lazy, useRef } from "react";
import { SceneBlock } from "@/components/three/SceneBlock";
import { ToolChips } from "@/components/ui/ToolChips";
import { hero } from "@/content/steering-wheel";
import { useIsMobile } from "@/hooks/useIsMobile";
import { HERO_VIEW, type HeroControls } from "./WheelHeroScene";

// Page hero (fsae-steering-wheel.md §1): wordmark over the CAD, which you drag to turn (Ansh 2026-10-22 —
// replaces the planned scroll rim-sweep). Mouse turns both axes; touch turns horizontally only so the page
// still scrolls; arrow keys when focused. The parts GLB at explode 0 renders like the detail build
// (QA 0.017 %), so the page loads one model for the hero and the stack-up.
const WheelHeroScene = lazy(() => import("./WheelHeroScene"));

const PITCH = 0.9; // radians, either way

export function WheelHero() {
  const ctl = useRef<HeroControls>({ ...HERO_VIEW });
  const mobile = useIsMobile();

  const turn = (yaw: number, pitch: number) => {
    const c = ctl.current;
    c.yaw = yaw;
    c.pitch = Math.max(-PITCH, Math.min(PITCH, pitch));
    c.kick?.();
  };
  const drag = useRef<{ x: number; y: number; yaw: number; pitch: number } | null>(null);
  const onPointerDown = (e: React.PointerEvent) => {
    drag.current = { x: e.clientX, y: e.clientY, yaw: ctl.current.yaw, pitch: ctl.current.pitch };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const w = window.innerWidth;
    const pitch = e.pointerType === "mouse" ? d.pitch + ((e.clientY - d.y) / w) * Math.PI : d.pitch;
    turn(d.yaw + ((e.clientX - d.x) / w) * Math.PI * 2, pitch);
  };
  const endDrag = () => (drag.current = null);
  const onKeyDown = (e: React.KeyboardEvent) => {
    const c = ctl.current;
    const step = { ArrowLeft: [-0.25, 0], ArrowRight: [0.25, 0], ArrowUp: [0, -0.15], ArrowDown: [0, 0.15] }[e.key];
    if (!step) return;
    e.preventDefault();
    turn(c.yaw + step[0], c.pitch + step[1]);
  };

  return (
    <section className="relative h-svh min-h-[560px] overflow-hidden" aria-labelledby="wheel-title">
      <div
        role="img"
        aria-label="CAD model of the steering wheel. Drag or use the arrow keys to turn it."
        tabIndex={0}
        className="absolute inset-0 cursor-grab touch-pan-y select-none outline-none active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={onKeyDown}
      >
        <SceneBlock
          priority
          poster={mobile ? "/project_media/steering-wheel/poster-hero-mobile.webp" : "/project_media/steering-wheel/poster-hero.webp"}
          posterFit={mobile ? "cover" : "height"}
          posterAlt="The Illini EV steering wheel, driver side"
          className="!absolute inset-0"
        >
          <WheelHeroScene ctl={ctl} mobile={mobile} />
        </SceneBlock>
      </div>

      <div className="px-page pointer-events-none relative z-10 flex h-full flex-col justify-between pb-8 pt-20 md:pt-24">
        <div>
          <Link href="/#work" className="type-label pointer-events-auto text-grey-brown hover:text-orange">
            ← Work
          </Link>
          <p className="type-label mt-6 text-grey-brown">
            <span className="text-cream">01</span> / {hero.eyebrow}
          </p>
          <h1 id="wheel-title" className="type-h1 mt-3 max-md:text-[calc(54*var(--u))]">
            Steering <span className="max-md:block">wheel</span>
          </h1>
        </div>
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="type-label text-cream">{hero.role}</p>
            <ToolChips tools={hero.tools} className="pointer-events-auto mt-3 max-w-md" />
          </div>
          <p className="type-label hidden items-center gap-2 text-cream/70 md:flex motion-reduce:!hidden" aria-hidden>
            <span className="grid size-9 place-items-center rounded-full border border-cream/30">⟲</span>
            Drag to turn the CAD
          </p>
        </div>
      </div>
    </section>
  );
}
