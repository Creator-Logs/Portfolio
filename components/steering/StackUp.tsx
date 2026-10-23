"use client";

import { lazy, useCallback, useRef, useState } from "react";
import { SceneBlock } from "@/components/three/SceneBlock";
import { ChapterHeader } from "@/components/ui/ChapterHeader";
import { SpecLine } from "@/components/ui/SpecLine";
import { parts, stackUp } from "@/content/steering-wheel";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useScrollProgress } from "@/hooks/useScrollProgress";
import { createExplodedControls, EXPLORE_FROM, type ExplodedControls } from "./explodedControls";

// Chapter 01 / THE STACK-UP (fsae-steering-wheel.md §3): pinned exploded view. Scroll turns and explodes the wheel
// (ExplodedScene); every part gets a leader line + label as it separates. Fully exploded, drag turns it and clicking
// a part — or its label / list row, the keyboard way in — opens its popover (material · process · why).
// Reduced motion: no pin; the exploded poster + the full list with notes.
const ExplodedScene = lazy(() => import("./ExplodedScene"));

export function StackUp() {
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const hint = useRef<HTMLParagraphElement>(null);
  const mobile = useIsMobile();
  const [selected, setSelected] = useState<number | null>(null);

  const onProgress = useCallback((p: number) => {
    const exploring = p >= EXPLORE_FROM;
    if (hint.current) hint.current.style.opacity = exploring ? "1" : "0";
    if (stage.current) stage.current.dataset.explore = exploring ? "1" : "0";
    ctl.current?.kick?.();
  }, []);
  const progress = useScrollProgress(section, onProgress);
  const ctl = useRef<ExplodedControls>(null as unknown as ExplodedControls);
  if (!ctl.current) ctl.current = createExplodedControls(progress);

  const select = (i: number | null) => {
    setSelected(i);
    ctl.current.selected = i;
    ctl.current.kick?.();
  };
  const hover = (i: number | null) => {
    ctl.current.hover = i;
    ctl.current.kick?.();
  };

  // drag to turn / click to pick, once fully exploded
  const drag = useRef<{ x: number; y: number; yaw: number; pitch: number; moved: boolean } | null>(null);
  const exploring = () => progress.value >= EXPLORE_FROM;
  const toNdc = (e: React.PointerEvent): [number, number] => {
    const r = stage.current!.getBoundingClientRect();
    return [((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1];
  };
  const onPointerDown = (e: React.PointerEvent) => {
    if (!exploring()) return;
    const c = ctl.current;
    drag.current = { x: e.clientX, y: e.clientY, yaw: c.yaw, pitch: c.pitch, moved: false };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    const c = ctl.current;
    if (d) {
      if (Math.hypot(e.clientX - d.x, e.clientY - d.y) > 6) d.moved = true;
      const w = stage.current?.clientWidth ?? 800;
      c.yaw = d.yaw + ((e.clientX - d.x) / w) * Math.PI * 1.6;
      if (e.pointerType === "mouse") c.pitch = Math.max(-0.9, Math.min(0.9, d.pitch + ((e.clientY - d.y) / w) * Math.PI));
      c.kick?.();
    } else if (exploring() && e.pointerType === "mouse") {
      const hit = c.pick?.(...toNdc(e)) ?? null;
      if (hit !== c.hover) hover(hit);
      stage.current!.style.cursor = hit === null ? "" : "pointer";
    }
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const d = drag.current;
    drag.current = null;
    if (d && !d.moved) select(ctl.current.pick?.(...toNdc(e)) ?? null);
  };

  const part = selected === null ? null : parts[selected];

  return (
    <>
      <section
        id="stack-up"
        ref={section}
        className="relative h-[420svh] max-md:h-[320svh] motion-reduce:h-auto"
        aria-label="The stack-up"
      >
        <div className="sticky top-0 h-svh overflow-hidden motion-reduce:relative">
          <div className="px-page pointer-events-none relative z-10 flex flex-col pt-20 md:h-full md:w-[36%] md:pt-24">
            <ChapterHeader number="01" eyebrow="The stack-up" lines={stackUp.lines} accentLast />
            <p className="type-body2 mt-5 max-w-[42ch] text-cream-dim max-md:hidden">{stackUp.body}</p>
            {/* desktop list: hover highlights, click opens the popover */}
            <ol className="pointer-events-auto mt-8 grid grid-cols-2 gap-x-6 max-md:hidden">
              {parts.map((p, i) => (
                <li key={p.name} className="rule-dotted">
                  <button
                    type="button"
                    onMouseEnter={() => hover(i)}
                    onMouseLeave={() => hover(null)}
                    onFocus={() => hover(i)}
                    onBlur={() => hover(null)}
                    onClick={() => select(selected === i ? null : i)}
                    aria-pressed={selected === i}
                    className={`type-label flex w-full gap-3 py-2 text-left transition-colors hover:text-orange ${selected === i ? "text-orange" : "text-cream"}`}
                  >
                    <span className="text-grey-brown tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                    {p.name}
                  </button>
                </li>
              ))}
            </ol>
            {/* part popover (DESIGN.md §5) — here, not over the model: nothing opaque over the canvas (rule 26) */}
            <div
              className={`glass pointer-events-auto mt-6 max-w-[420px] rounded-xl p-5 transition-opacity duration-200 max-md:hidden ${part ? "opacity-100" : "pointer-events-none opacity-0"}`}
              role="region"
              aria-live="polite"
              aria-label={part ? part.name : undefined}
            >
              {part && (
                <>
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="type-h4 text-cream">{part.name}</h3>
                    <button type="button" onClick={() => select(null)} className="type-label text-grey-brown hover:text-orange" aria-label="Close">
                      ✕
                    </button>
                  </div>
                  <SpecLine className="mt-2">{part.spec}</SpecLine>
                  <p className="type-body2 mt-3 text-cream-dim">{part.note}</p>
                </>
              )}
            </div>
          </div>

          <div
            ref={stage}
            data-explore="0"
            className="group/stage absolute inset-x-0 bottom-0 top-[34%] touch-pan-y select-none data-[explore=1]:cursor-grab md:left-[36%] md:top-0"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={() => (drag.current = null)}
            onPointerLeave={() => !drag.current && hover(null)}
          >
            <SceneBlock
              loadMargin="100% 0px"
              poster="/project_media/steering-wheel/poster-exploded.webp"
              posterFit="contain"
              posterAlt="Exploded view of the steering wheel: controls, front panel, gaskets, grips, carbon plate, standoffs, board, enclosure and quick-disconnect"
              className="!absolute inset-0"
            >
              <ExplodedScene ctl={ctl} mobile={mobile} />
            </SceneBlock>

            {/* leader lines + labels, positioned by the scene every frame */}
            <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible max-md:hidden motion-reduce:hidden" aria-hidden>
              {parts.map((p, i) => (
                <g key={p.name}>
                  <line ref={(el) => void (ctl.current.els.lines[i] = el)} className="stroke-orange" strokeWidth={1} style={{ opacity: 0 }} />
                  <circle ref={(el) => void (ctl.current.els.dots[i] = el)} r={2.5} className="fill-orange" style={{ opacity: 0 }} />
                </g>
              ))}
            </svg>
            <div className="pointer-events-none absolute inset-0 motion-reduce:hidden">
              {parts.map((p, i) => (
                <button
                  key={p.name}
                  ref={(el) => void (ctl.current.els.labels[i] = el)}
                  type="button"
                  tabIndex={-1} // the list is the keyboard way in
                  onClick={() => select(selected === i ? null : i)}
                  onMouseEnter={() => hover(i)}
                  onMouseLeave={() => hover(null)}
                  className={`type-label pointer-events-auto absolute left-0 top-0 whitespace-nowrap opacity-0 transition-colors hover:text-orange max-md:hidden ${selected === i ? "text-orange" : "text-cream"}`}
                >
                  <span className="mr-2 text-grey-brown tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                  {p.name}
                </button>
              ))}
            </div>

            <p
              ref={hint}
              className="type-label pointer-events-none absolute bottom-6 right-[3.125vw] text-cream/70 opacity-0 transition-opacity duration-500 motion-reduce:hidden"
              aria-hidden
            >
              Drag to turn<span className="max-md:hidden"> · click a part</span>
            </p>
          </div>
        </div>
      </section>

      {/* phones + reduced motion: the full list with notes (on desktop it's the pinned list + popovers) */}
      <ol className="px-page pb-16 md:hidden motion-reduce:block" aria-label="Parts">
        {parts.map((p, i) => (
          <li key={p.name} className="rule-dotted grid grid-cols-[2.5rem_1fr] gap-x-3 py-4">
            <span className="type-label pt-0.5 text-grey-brown tabular-nums">{String(i + 1).padStart(2, "0")}</span>
            <span>
              <span className="type-body2 block text-cream">{p.name}</span>
              <span className="type-label text-grey-brown">{p.spec}</span>
              <span className="type-body2 mt-1 block text-cream-dim">{p.note}</span>
            </span>
          </li>
        ))}
      </ol>
    </>
  );
}
