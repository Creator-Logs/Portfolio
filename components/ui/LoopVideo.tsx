"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "@/hooks/useInView";
import { useReducedMotion } from "@/hooks/useReducedMotion";

// DESIGN.md §5 Loop video: muted shop footage that plays only while on screen. `src` is the path without
// extension: <src>.mp4, <src>.webm and the poster <src>.webp (the loop's first frame — scripts/media/*).
// - MP4 (H.264) is listed first: iOS Safari claims WebM support and can pick the VP9 file, then fail to decode it
//   with no fallback to the next <source> (Ansh 2026-10-22: loops didn't play on his phone).
// - Autoplay can be refused (iOS Low Power Mode) and reduced motion never autoplays: then a play button shows and a
//   tap plays the loop (an explicit tap is allowed everywhere).
type Props = { src: string; label: string; className?: string };

export function LoopVideo({ src, label, className = "" }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const inView = useInView(ref, "0px");
  const reducedMotion = useReducedMotion();
  const [blocked, setBlocked] = useState(false); // autoplay refused, or reduced motion
  const [playing, setPlaying] = useState(false);
  const chosen = useRef(false); // the visitor pressed play / pause: stop auto play/pause

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.muted = true; // iOS only autoplays muted inline video; set the property too, not just the attribute
    if (reducedMotion) {
      if (!chosen.current) setBlocked(true);
      return;
    }
    if (chosen.current) return;
    if (inView) {
      v.play().then(
        () => setBlocked(false),
        () => setBlocked(true), // power saving etc.: the poster stays, the button offers a tap
      );
    } else v.pause();
  }, [inView, reducedMotion]);

  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    chosen.current = true;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  };

  return (
    <div className="relative">
      <video
        ref={ref}
        muted
        loop
        playsInline
        preload={reducedMotion ? "none" : "metadata"}
        poster={`${src}.webp`}
        aria-label={label}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        className={`block h-auto w-full rounded-xl bg-ink-2 ${className}`}
      >
        <source src={`${src}.mp4`} type="video/mp4" />
        <source src={`${src}.webm`} type="video/webm" />
      </video>
      {(blocked || chosen.current) && (
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? `Pause: ${label}` : `Play: ${label}`}
          className="type-label absolute bottom-3 left-3 flex items-center gap-2 rounded-full bg-ink/80 px-3 py-2 text-cream transition-colors hover:text-orange"
        >
          <span aria-hidden>{playing ? "❚❚" : "▶"}</span>
          {playing ? "Pause" : "Play"}
        </button>
      )}
    </div>
  );
}
