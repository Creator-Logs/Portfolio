"use client";

import { useEffect, useState, type RefObject } from "react";

// True while the element intersects the viewport (plus `margin`). Drives FrameDriver so
// offscreen 3D blocks stop requesting frames (3D_GUIDE §7b rule 7).
export function useInView(ref: RefObject<Element | null>, margin = "100px") {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin: margin });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, margin]);
  return inView;
}
