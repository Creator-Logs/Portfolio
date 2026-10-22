"use client";

import { useEffect, useRef, type RefObject } from "react";

export type Progress = { value: number };

/**
 * 0..1 progress of scrolling through a tall (sticky-pinned) element: 0 when its top reaches the top of
 * the viewport, 1 when its bottom reaches the bottom. Returns a stable mutable object — read it in
 * useFrame; `onChange` runs inside the scroll handler for direct DOM writes. No React state per scroll.
 */
export function useScrollProgress(ref: RefObject<HTMLElement | null>, onChange?: (p: number) => void): Progress {
  const progress = useRef<Progress>({ value: 0 }).current;
  const cb = useRef(onChange);
  cb.current = onChange;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const r = el.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      progress.value = span > 0 ? Math.min(1, Math.max(0, -r.top / span)) : 0;
      cb.current?.(progress.value);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [ref, progress]);

  return progress;
}
