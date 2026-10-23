"use client";

import { useCallback, useEffect, useRef } from "react";
import cut from "@/content/steering/waterjet.json";
import { useScrollProgress } from "@/hooks/useScrollProgress";

// Chapter 04 (fsae-steering-wheel.md §6): there's no waterjet footage, so the real cut file draws itself — the DXF
// Ansh sent to the waterjet (scripts/media/dxf_to_svg.py): pilot holes first, then the contours, with an orange
// "jet" at the cutting point. Pinned (Ansh 2026-10-22): the block sticks while the cut plays out over the tall
// wrapper's scroll, holds complete, then the page moves on. Reduced motion: no pin, drawn complete.

const size = `${cut.width.toFixed(1)} × ${cut.height.toFixed(1)} mm`;
const total = cut.paths.reduce((a, p) => a + p.len, 0);
const starts = cut.paths.reduce<number[]>((acc, p, i) => [...acc, i ? acc[i - 1] + cut.paths[i - 1].len : 0], []);
const DRAW = [0.04, 0.86] as const; // share of the pinned scroll over which the cut plays (then holds complete)

export function WaterjetPath({ children }: { children?: React.ReactNode }) {
  const section = useRef<HTMLDivElement>(null);
  const paths = useRef<(SVGPathElement | null)[]>([]);
  const jet = useRef<SVGCircleElement>(null);

  const draw = useCallback((p: number) => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const done = (reduced ? 1 : Math.min(1, Math.max(0, (p - DRAW[0]) / (DRAW[1] - DRAW[0])))) * total;
    let head: [SVGPathElement, number] | null = null;
    paths.current.forEach((path, i) => {
      if (!path) return;
      const raw = (done - starts[i]) / cut.paths[i].len;
      const local = raw > 0.9995 ? 1 : Math.max(0, raw); // float drift: the last path must end exactly (no stuck jet)
      path.style.strokeDashoffset = String(1 - local);
      if (local > 0 && local < 1) head = [path, local];
    });
    const j = jet.current;
    if (j) {
      if (head) {
        const [path, local] = head as [SVGPathElement, number];
        const pt = path.getPointAtLength(local * path.getTotalLength());
        j.setAttribute("cx", String(pt.x));
        j.setAttribute("cy", String(pt.y));
      }
      j.style.opacity = head ? "1" : "0";
    }
  }, []);
  const progress = useScrollProgress(section, draw);
  useEffect(() => draw(progress.value), [draw, progress]); // initial state (hidden) before the first scroll

  return (
    <div ref={section} className="relative mt-20 h-[260svh] max-md:h-[200svh] motion-reduce:h-auto">
      <div className="sticky top-0 flex h-svh flex-col justify-center gap-8 py-20 motion-reduce:relative motion-reduce:h-auto">
        {children}
        <figure className="min-h-0 flex-1">
          <svg
            viewBox={`-4 -4 ${cut.width + 8} ${cut.height + 8}`}
            className="h-full max-h-full w-full"
            role="img"
            aria-label={`Waterjet cut file for the ${size} carbon baseplate`}
          >
            {cut.paths.map((p, i) => (
              <path
                key={i}
                ref={(el) => void (paths.current[i] = el)}
                d={p.d}
                pathLength={1}
                strokeDasharray="1 1" // with pathLength 1: offset 1 = hidden, 0 = drawn (no non-scaling-stroke: it breaks this)
                fill="none"
                className={p.kind === "hole" ? "stroke-orange" : "stroke-cream"}
                strokeWidth={0.35} // mm (viewBox units) ≈ 1.5 px at full width
                style={{ strokeDashoffset: 1 }} // hidden until the first progress update (no drawn-then-hidden flash)
              />
            ))}
            <circle ref={jet} r={2.2} className="fill-orange" style={{ opacity: 0, filter: "drop-shadow(0 0 3px #DC5000)" }} />
          </svg>
        </figure>
        <p className="type-label flex justify-between text-grey-brown">
          <span>
            {cut.source.replace(/\.dxf$/i, "")} · {cut.paths.filter((p) => p.kind === "hole").length} holes
          </span>
          <span>{size}</span>
        </p>
      </div>
    </div>
  );
}
