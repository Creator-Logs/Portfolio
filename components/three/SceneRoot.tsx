"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { detectWebGL, threeStore, useThreeState } from "./store";

// The one persistent canvas (3D_GUIDE §7b rules 1–3). three.js is code-split out of first paint.
const SceneCanvas = dynamic(() => import("./SceneCanvas"), { ssr: false });

export function SceneRoot() {
  const { webgl } = useThreeState();
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    threeStore.set({
      webgl: detectWebGL() ? "ok" : "none",
      debug: new URLSearchParams(window.location.search).has("debug"),
    });
  }, []);

  // Reduced motion: every block shows its poster, so skip the renderer entirely.
  if (webgl !== "ok" || reducedMotion) return null;
  return <SceneCanvas />;
}
