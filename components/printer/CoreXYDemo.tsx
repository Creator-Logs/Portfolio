"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Interactive top-down Core-XY gantry. Hold a button to spin the motors; the carriage follows the Core-XY
// kinematics ΔX = ½(ΔA + ΔB), ΔY = ½(ΔA − ΔB). SVG y points down, so +Y (towards the motors) is −y on screen.

type Spin = -1 | 0 | 1;
type Mode = { id: string; label: string; a: Spin; b: Spin };

const MODES: Mode[] = [
  { id: "a", label: "Motor A", a: 1, b: 0 },
  { id: "b", label: "Motor B", a: 0, b: 1 },
  { id: "same", label: "Both, same way", a: 1, b: 1 },
  { id: "opposite", label: "Both, opposite", a: 1, b: -1 },
];

const OMEGA = 4; // motor speed, rad/s
const PULLEY_R = 12; // svg units; belt travel per radian
// Carriage travel limits (svg units).
const X_MIN = 76;
const X_MAX = 244;
const Y_MIN = 82;
const Y_MAX = 262;

// Frame + idler geometry.
const L = 36;
const R = 284;
const TOP = 36;

const spinGlyph = (s: Spin) => (s === 1 ? "↻" : s === -1 ? "↺" : "·");

function moveLabel(a: number, b: number) {
  const dx = Math.sign(a + b);
  const dy = Math.sign(a - b);
  if (!dx && !dy) return "Idle";
  const arrows: Record<string, string> = {
    "1,0": "→ straight along X",
    "-1,0": "← straight along X",
    "0,1": "↑ straight along Y",
    "0,-1": "↓ straight along Y",
    "1,1": "↗ diagonal",
    "-1,-1": "↙ diagonal",
    "1,-1": "↘ diagonal",
    "-1,1": "↖ diagonal",
  };
  return arrows[`${dx},${dy}`];
}

export function CoreXYDemo() {
  const [state, setState] = useState({ a: 0, b: 0, x: 160, y: 172 });
  const stateRef = useRef(state);
  const [active, setActive] = useState<Mode | null>(null);
  const [reverse, setReverse] = useState(false);
  const [stalled, setStalled] = useState(false);
  const raf = useRef(0);

  const dir = reverse ? -1 : 1;
  const drive = active ? { a: (active.a * dir) as Spin, b: (active.b * dir) as Spin } : { a: 0 as Spin, b: 0 as Spin };

  // rAF loop only while a button is held.
  useEffect(() => {
    if (!active) return;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const s = stateRef.current;
      const dA = drive.a * OMEGA * dt;
      const dB = drive.b * OMEGA * dt;
      const x = s.x + ((dA + dB) / 2) * PULLEY_R;
      const y = s.y - ((dA - dB) / 2) * PULLEY_R;
      // Hitting an end stop stalls both motors.
      const out = x < X_MIN || x > X_MAX || y < Y_MIN || y > Y_MAX;
      setStalled(out);
      if (!out) {
        stateRef.current = { a: s.a + dA, b: s.b + dB, x, y };
        setState(stateRef.current);
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [active, drive.a, drive.b]);

  // Only release if `m` is still the one driving: pressing another button blurs the previous one
  // after the new press has already started, and that blur mustn't cancel it.
  const stop = useCallback((m: Mode) => {
    setActive((cur) => (cur?.id === m.id ? null : cur));
    setStalled(false);
  }, []);

  const { a, b, x, y } = state;
  const deg = (r: number) => (r * 180) / Math.PI;

  // Two belt loops on separate layers: A on the inner track, B on the outer. Each loop runs
  // carriage → gantry idler → up the side → across the rear → down the other side → carriage.
  const inner = 6;
  const outer = -6;
  const loop = (o: number, cy: number) =>
    [
      [x - 16, cy],
      [L + o, cy],
      [L + o, TOP + o],
      [R - o, TOP + o],
      [R - o, cy],
      [x + 16, cy],
    ]
      .map((p) => p.join(","))
      .join(" ");

  return (
    <div className="flex flex-col gap-8 border-t border-[#2F2E2B]/25 pt-12 lg:flex-row lg:justify-between">
      <div className="text-[#2F2E2B] lg:w-[40%]">
        <h3 className="py-4 text-3xl font-medium md:text-4xl">Try It</h3>
        <p className="text-lg md:text-xl">
          Hold a button to spin the motors and watch where the carriage goes.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-2">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              aria-pressed={active?.id === m.id}
              onPointerDown={(e) => {
                e.currentTarget.setPointerCapture(e.pointerId);
                setActive(m);
              }}
              onPointerUp={() => stop(m)}
              onPointerCancel={() => stop(m)}
              onKeyDown={(e) => {
                if ((e.key === " " || e.key === "Enter") && !e.repeat) {
                  e.preventDefault();
                  setActive(m);
                }
              }}
              onKeyUp={() => stop(m)}
              onBlur={() => stop(m)}
              onContextMenu={(e) => e.preventDefault()}
              className={`touch-none select-none rounded-xl border px-4 py-3 text-left text-base font-medium transition-colors md:text-lg ${
                active?.id === m.id
                  ? "border-orange bg-orange text-[#F8F8F8]"
                  : "border-studio-muted bg-[#BFBFBF]/40 hover:bg-[#BFBFBF]"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        <label className="mt-4 flex w-fit cursor-pointer items-center gap-3 text-base md:text-lg">
          <input
            type="checkbox"
            checked={reverse}
            onChange={(e) => setReverse(e.target.checked)}
            className="size-4 accent-orange"
          />
          Reverse direction
        </label>

        <p className="mt-6 font-mono text-sm uppercase tracking-[0.04em]" aria-live="polite">
          A {spinGlyph(drive.a)} · B {spinGlyph(drive.b)} →{" "}
          {stalled ? "end of travel" : active ? moveLabel(drive.a, drive.b) : "hold a button"}
        </p>
      </div>

      <svg
        viewBox="0 0 320 320"
        className="h-auto w-full max-w-[520px] self-center"
        role="img"
        aria-label="Top-down Core-XY gantry: two motors at the rear corners, crossed belts, and a carriage on a moving gantry"
      >
        {/* Frame */}
        <rect x={20} y={20} width={280} height={280} rx={6} fill="none" stroke="#2F2E2B" strokeWidth={2} />
        <text x={160} y={312} textAnchor="middle" className="fill-[#2F2E2B] font-mono text-[9px] uppercase">
          front
        </text>

        {/* Belts: dashes travel with their motor's rotation. */}
        <polyline
          points={loop(outer, y + 3)}
          fill="none"
          stroke="#2F2E2B"
          strokeWidth={2.5}
          strokeDasharray="5 4"
          strokeDashoffset={-b * PULLEY_R}
          strokeLinejoin="round"
        />
        <polyline
          points={loop(inner, y - 3)}
          fill="none"
          stroke="#DC5000"
          strokeWidth={2.5}
          strokeDasharray="5 4"
          strokeDashoffset={a * PULLEY_R}
          strokeLinejoin="round"
        />

        {/* Gantry (moves in Y) + its idlers */}
        <line x1={L} y1={y} x2={R} y2={y} stroke="#2F2E2B" strokeWidth={5} strokeOpacity={0.35} strokeLinecap="round" />
        <circle cx={L} cy={y} r={5} fill="#CBCBCB" stroke="#2F2E2B" strokeWidth={1.5} />
        <circle cx={R} cy={y} r={5} fill="#CBCBCB" stroke="#2F2E2B" strokeWidth={1.5} />

        {/* Carriage */}
        <rect x={x - 16} y={y - 14} width={32} height={28} rx={4} fill="#1D1D1F" />
        <circle cx={x} cy={y} r={4} fill="#DC5000" />

        {/* Rear idlers (the other motor's corner on each belt layer) */}
        <circle cx={R - inner} cy={TOP + inner} r={4} fill="#CBCBCB" stroke="#DC5000" strokeWidth={1.5} />
        <circle cx={L + outer} cy={TOP + outer} r={4} fill="#CBCBCB" stroke="#2F2E2B" strokeWidth={1.5} />

        {/* Motors */}
        {[
          { cx: L + inner, cy: TOP + inner, angle: a, name: "A", accent: "#DC5000" },
          { cx: R - outer, cy: TOP + outer, angle: b, name: "B", accent: "#2F2E2B" },
        ].map((m) => (
          <g key={m.name}>
            <rect x={m.cx - 14} y={m.cy - 14} width={28} height={28} rx={3} fill="#1D1D1F" />
            <circle cx={m.cx} cy={m.cy} r={8} fill="#CBCBCB" stroke={m.accent} strokeWidth={2} />
            <line
              x1={m.cx}
              y1={m.cy}
              x2={m.cx}
              y2={m.cy - 8}
              stroke="#1D1D1F"
              strokeWidth={2}
              strokeLinecap="round"
              transform={`rotate(${deg(m.angle)} ${m.cx} ${m.cy})`}
            />
            <text
              x={m.cx}
              y={m.cy + 26}
              textAnchor="middle"
              className="fill-[#2F2E2B] font-mono text-[10px] font-medium"
            >
              {m.name}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
