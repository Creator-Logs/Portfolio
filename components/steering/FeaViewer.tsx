"use client";

import { lazy, useEffect, useRef, useState } from "react";
import { SceneBlock } from "@/components/three/SceneBlock";
import { useInView } from "@/hooks/useInView";
import { ANSYS_BANDS } from "./feaMaterial";
import { createControls, DEFAULT_VIEW, EXAGGERATION, type FeaControls } from "./feaControls";
import { fea, groupStats, ksi, minFos, peakBody, stackDispIn } from "./feaData";

// Interactive Ansys result (steering-wheel.md chapter 02): the solved model with its real per-node von Mises
// stress and displacement. Drag to turn; scrub the load (linear static: results scale with it); exaggerate
// the deformation; hover a part in the table to isolate it.
const FeaScene = lazy(() => import("./FeaScene"));

const TICKS = Array.from({ length: ANSYS_BANDS.length + 1 }, (_, i) => (fea.vmMaxPsi * (ANSYS_BANDS.length - i)) / ANSYS_BANDS.length);

export function FeaViewer() {
  const ctl = useRef<FeaControls>(createControls());
  const box = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<0 | 1>(1);
  const [exaggerated, setExaggerated] = useState(false);
  const [focus, setFocus] = useState<string | null>(null);
  const seen = useInView(box, "-25% 0px");
  const played = useRef(false);

  useEffect(() => {
    if (!seen || played.current) return;
    played.current = true;
    ctl.current.load = 0;
    ctl.current.play = true;
  }, [seen]);

  const set = (patch: Partial<FeaControls>) => Object.assign(ctl.current, patch);

  // drag to turn (mouse: both axes; touch: horizontal only, so the page still scrolls)
  const drag = useRef<{ x: number; y: number; yaw: number; pitch: number } | null>(null);
  const onPointerDown = (e: React.PointerEvent) => {
    drag.current = { x: e.clientX, y: e.clientY, yaw: ctl.current.yaw, pitch: ctl.current.pitch };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const w = box.current?.clientWidth ?? 800;
    ctl.current.yaw = d.yaw + ((e.clientX - d.x) / w) * Math.PI * 1.6;
    if (e.pointerType === "mouse") ctl.current.pitch = Math.max(-1.2, Math.min(1.2, d.pitch + ((e.clientY - d.y) / w) * Math.PI));
  };
  const endDrag = () => (drag.current = null);

  const els = ctl.current.els;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(320px,26%)] lg:gap-12">
      <div
        ref={box}
        className="relative h-[72svh] min-h-[420px] cursor-grab touch-pan-y select-none active:cursor-grabbing max-md:h-[60svh]"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <SceneBlock animate loadMargin="100% 0px" poster="/project_media/steering-wheel/poster-fea.webp" posterAlt="Ansys von Mises stress on the steering wheel's plate and standoff stack" className="!absolute inset-0">
          <FeaScene ctl={ctl} />
        </SceneBlock>

        {/* tags that follow the model (positioned by the scene every frame) */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <Tag refEl={(el) => void (els.peak = el)} tone="red" letter="MAX">
            {ksi(peakBody.peakPsi)} ksi
          </Tag>
          <Tag refEl={(el) => void (els.force = el)} letter="A">
            {fea.loads.forceLbf} lbf push / pull
          </Tag>
          <Tag refEl={(el) => void (els.moment = el)} letter="B">
            {fea.loads.momentLbfIn} lbf·in torque
          </Tag>
          <Tag refEl={(el) => void (els.fixed = el)} tone="blue" letter="C">
            Fixed support
          </Tag>
        </div>

        {/* legend, top-left (Mechanical's banded scale) */}
        <div
          className={`pointer-events-none absolute left-0 top-0 transition-opacity duration-500 ${mode ? "opacity-100" : "opacity-0"}`}
          aria-hidden={!mode}
        >
          <p className="type-label text-cream">Equivalent (von Mises) stress</p>
          <p className="type-label text-grey-brown">ksi · 100 % load · bands fixed</p>
          <div className="mt-3 flex gap-2">
            <div className="flex w-3 flex-col">
              {[...ANSYS_BANDS].reverse().map((c) => (
                <span key={c} className="h-5 w-3" style={{ background: c }} />
              ))}
            </div>
            <div className="-mt-[0.45em] flex flex-col">
              {TICKS.map((t, i) => (
                <span key={i} className="type-label h-5 leading-none text-cream/80 tabular-nums">
                  {ksi(t)}
                  {i === 0 && <span className="ml-2 text-[#ff4040]">MAX</span>}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* controls, bottom */}
        <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-4" onPointerDown={(e) => e.stopPropagation()}>
          <div className="flex flex-wrap gap-2">
            <Toggle on={mode === 1} onClick={() => (setMode(1), set({ mode: 1 }))}>
              Stress
            </Toggle>
            <Toggle on={mode === 0} onClick={() => (setMode(0), set({ mode: 0 }))}>
              Material
            </Toggle>
            <Toggle
              on={exaggerated}
              onClick={() => {
                setExaggerated(!exaggerated);
                set({ exaggerate: exaggerated ? 1 : EXAGGERATION });
              }}
            >
              {exaggerated ? `Deformation ×${EXAGGERATION}` : "True-scale deformation"}
            </Toggle>
            <Toggle on={false} onClick={() => set({ ...DEFAULT_VIEW, load: 0, play: true })}>
              Replay
            </Toggle>
          </div>
          <label className="flex min-w-[240px] flex-1 flex-col gap-1 md:max-w-sm">
            <span className="type-label flex justify-between text-grey-brown">
              <span>Load</span>
              <span ref={(el) => void (els.readout = el)} className="text-cream tabular-nums">
                100% · {fea.loads.forceLbf} lbf · {fea.loads.momentLbfIn} lbf·in
              </span>
            </span>
            <input
              ref={(el) => void (els.slider = el)}
              type="range"
              min={0}
              max={100}
              defaultValue={100}
              onInput={(e) => set({ play: false, load: Number((e.target as HTMLInputElement).value) / 100 })}
              className="accent-orange"
              aria-label="Load factor"
            />
          </label>
        </div>
      </div>

      {/* results per part — also the keyboard / screen-reader way into the model */}
      <div className="flex flex-col justify-end">
        <p className="type-label text-grey-brown">Results at full load · hover to isolate</p>
        <table className="mt-4 w-full border-collapse text-left">
          <thead>
            <tr className="type-label text-grey-brown">
              <th className="pb-2 font-normal">Part</th>
              <th className="pb-2 text-right font-normal">Peak</th>
              <th className="pb-2 text-right font-normal">FoS (yield)</th>
            </tr>
          </thead>
          <tbody>
            {groupStats.map((g) => (
              <tr
                key={g.id}
                tabIndex={0}
                onMouseEnter={() => (setFocus(g.id), set({ focus: g.id }))}
                onMouseLeave={() => (setFocus(null), set({ focus: null }))}
                onFocus={() => (setFocus(g.id), set({ focus: g.id }))}
                onBlur={() => (setFocus(null), set({ focus: null }))}
                className={`rule-dotted cursor-default outline-none transition-colors ${focus === g.id ? "text-orange" : "text-cream"}`}
              >
                <td className="py-3">
                  <span className="type-body2 block">{g.label}</span>
                  <span className="type-label text-grey-brown">{g.material}</span>
                </td>
                <td className="type-label py-3 text-right tabular-nums">{g.peakPsi === null ? "n/a" : `${ksi(g.peakPsi)} ksi`}</td>
                <td className={`type-label py-3 text-right tabular-nums ${g.fos === minFos ? "text-orange" : ""}`}>
                  {g.fos?.toFixed(1) ?? "n/a"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="type-label mt-6 text-grey-brown">
          Ansys Mechanical · {fea.nodes.toLocaleString("en-US")} nodes · fixed at the QD · standoff stack deflects{" "}
          {(stackDispIn * 25.4).toFixed(3)} mm
        </p>
      </div>
    </div>
  );
}

function Toggle({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={`rounded-full border px-4 py-2 font-mono text-[12px] uppercase tracking-[0.04em] transition-colors duration-200 ${
        on ? "border-orange bg-orange text-cream" : "border-brown bg-ink text-cream hover:border-grey-brown"
      }`}
    >
      {children}
    </button>
  );
}

function Tag({
  refEl,
  letter,
  tone = "orange",
  children,
}: {
  refEl: (el: HTMLDivElement | null) => void;
  letter: string;
  tone?: "orange" | "red" | "blue";
  children: React.ReactNode;
}) {
  const bg = { orange: "bg-orange", red: "bg-[#d61f1f]", blue: "bg-[#2747d8]" }[tone];
  return (
    <div ref={refEl} className="group absolute left-0 top-0 opacity-0 will-change-transform">
      <div className="flex -translate-y-1/2 items-center gap-2 pl-3 group-data-[flip=1]:flex-row-reverse group-data-[flip=1]:pl-0 group-data-[flip=1]:pr-3">
        <span className={`type-label rounded-sm px-1.5 py-0.5 text-cream ${bg}`}>{letter}</span>
        <span className="type-label whitespace-nowrap text-cream">{children}</span>
      </div>
    </div>
  );
}
