"use client";

import { useEffect, useState } from "react";

// DESIGN.md §5: circle with chevron + mono label, bottom-centre, fades out after the first scroll.
export function ScrollCue({ className = "" }: { className?: string }) {
  const [gone, setGone] = useState(false);
  useEffect(() => {
    const onScroll = () => setGone(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div
      aria-hidden
      className={`flex flex-col items-center gap-2 transition-opacity duration-500 ${gone ? "opacity-0" : "opacity-100"} ${className}`}
    >
      <span className="grid size-9 place-items-center rounded-full border border-cream/30">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="motion-safe:animate-bounce">
          <path d="M2 4.5 6 8.5l4-4" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      </span>
      <span className="type-label text-cream/70">Scroll to continue</span>
    </div>
  );
}
