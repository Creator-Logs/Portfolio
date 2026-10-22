"use client";

import { useSyncExternalStore } from "react";

// Tiny shared state between the DOM side (posters) and the canvas. No three.js imports here,
// so it stays in the initial bundle cheaply.
type ThreeState = {
  webgl: "unknown" | "ok" | "none";
  contextLost: boolean;
  debug: boolean;
  /** ?poster[=hero|showcase]: capture mode for scripts/posters.sh (full DPR, canvas only). */
  poster: string | null;
};

let state: ThreeState = { webgl: "unknown", contextLost: false, debug: false, poster: null };
const listeners = new Set<() => void>();

export const threeStore = {
  get: () => state,
  set(patch: Partial<ThreeState>) {
    state = { ...state, ...patch };
    listeners.forEach((l) => l());
  },
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

const serverState: ThreeState = state;

export function useThreeState() {
  return useSyncExternalStore(threeStore.subscribe, threeStore.get, () => serverState);
}

// Live-tunable values (written by the ?debug panel, read by scenes each frame / on mount).
export const tuning = {
  exposure: 1.0,
  envIntensity: 1,
};

export function detectWebGL() {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    const ok = !!gl;
    (gl as WebGLRenderingContext | null)?.getExtension("WEBGL_lose_context")?.loseContext();
    return ok;
  } catch {
    return false;
  }
}
