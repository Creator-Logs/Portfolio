"use client";

import { useEffect, useRef } from "react";
import { useInView } from "@/hooks/useInView";
import { useReducedMotion } from "@/hooks/useReducedMotion";

// DESIGN.md §5 Loop video: muted shop footage that plays only while on screen. `src` is the path without
// extension: <src>.webm, <src>.mp4 and the poster <src>.webp (the loop's first frame — scripts/media/*).
// Reduced motion: the poster only, nothing downloads.
type Props = { src: string; label: string; className?: string };

export function LoopVideo({ src, label, className = "" }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const inView = useInView(ref, "0px");
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const v = ref.current;
    if (!v || reducedMotion) return;
    if (inView) v.play().catch(() => {}); // autoplay can be refused (power saving): the poster stays
    else v.pause();
  }, [inView, reducedMotion]);

  return (
    <video
      ref={ref}
      muted
      loop
      playsInline
      preload={reducedMotion ? "none" : "metadata"}
      poster={`${src}.webp`}
      aria-label={label}
      className={`block h-auto w-full rounded-xl bg-ink-2 ${className}`}
    >
      {!reducedMotion && (
        <>
          <source src={`${src}.webm`} type="video/webm" />
          <source src={`${src}.mp4`} type="video/mp4" />
        </>
      )}
    </video>
  );
}
