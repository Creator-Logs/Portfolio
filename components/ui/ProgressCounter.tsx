"use client";

import { forwardRef } from "react";

// DESIGN.md §5 Progress counter: bottom bar — chapter name left, thin orange progress line, "03 / 06" right.
// The line's width is written directly by the owner (ref) from scroll progress; no React state per scroll.
type Props = { label: string; index: number; total: number; visible: boolean };

export const ProgressCounter = forwardRef<HTMLDivElement, Props>(function ProgressCounter({ label, index, total, visible }, line) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <div
      aria-hidden
      className={`px-page pointer-events-none fixed inset-x-0 bottom-0 z-40 pb-4 transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`}
    >
      <div className="type-label flex items-center gap-4 text-cream">
        <span className="w-40 truncate md:w-56">{label}</span>
        <span className="relative h-px flex-1 bg-brown">
          <span ref={line} className="absolute inset-y-0 left-0 w-0 bg-orange" />
        </span>
        <span className="tabular-nums">
          {pad(index)} <span className="text-grey-brown">/ {pad(total)}</span>
        </span>
      </div>
    </div>
  );
});
