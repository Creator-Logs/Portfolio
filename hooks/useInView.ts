"use client";

import { useEffect, useState, type RefObject } from "react";

// True while the element intersects the viewport (plus `margin`). Drives FrameDriver so
// offscreen 3D blocks stop requesting frames (3D_GUIDE §7b rule 7).
export function useInView(ref: RefObject<Element | null>, margin = "100px") {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // ratio > 0: an element merely touching the viewport edge is not "in view" (it would otherwise be
    // rendered every frame while invisible — measured: +600k triangles per hero frame).
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting && entry.intersectionRatio > 0), {
      rootMargin: margin,
      threshold: [0, 0.001],
    });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, margin]);
  return inView;
}
