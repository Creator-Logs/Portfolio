"use client";

import { useEffect } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

// Lenis smooth scroll driven by GSAP's ticker so ScrollTrigger pins stay in sync (ARCHITECTURE "Stack").
// Loaded after first paint to keep it out of the initial bundle. Disabled under reduced motion
// (native scrolling, no scroll-jacking).
export function SmoothScroll() {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;
    let cleanup: (() => void) | undefined;
    let cancelled = false;

    Promise.all([import("lenis"), import("gsap"), import("gsap/ScrollTrigger")]).then(
      ([{ default: Lenis }, { gsap }, { ScrollTrigger }]) => {
        if (cancelled) return;
        gsap.registerPlugin(ScrollTrigger);
        const lenis = new Lenis({ anchors: true });
        lenis.on("scroll", ScrollTrigger.update);
        const tick = (time: number) => lenis.raf(time * 1000);
        gsap.ticker.add(tick);
        gsap.ticker.lagSmoothing(0);
        cleanup = () => {
          gsap.ticker.remove(tick);
          lenis.destroy();
        };
      },
    );

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [reducedMotion]);

  return null;
}
