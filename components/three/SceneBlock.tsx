"use client";

import dynamic from "next/dynamic";
import { useCallback, useRef, useState } from "react";
import { PosterFallback } from "@/components/ui/PosterFallback";
import { useInView } from "@/hooks/useInView";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useThreeState } from "./store";

// The only way sections put 3D on the page (3D_GUIDE §7b): a DOM box that shows a poster,
// then renders `children` (3D content) into the shared canvas through a drei View once
// WebGL is available. Falls back to the poster on no-WebGL, reduced motion, context loss or error.
//
// Pass 3D content as React.lazy components created in a *client* module (see landing/HeroScene.tsx)
// so three.js code stays out of first paint.

const SceneView = dynamic(() => import("./SceneView"), { ssr: false });

type Props = {
  children: React.ReactNode;
  poster?: string;
  posterAlt: string;
  /** Needs continuous frames while on screen (idle animation, scroll-driven motion). */
  animate?: boolean;
  priority?: boolean;
  className?: string;
};

export function SceneBlock({ children, poster, posterAlt, animate = false, priority, className = "" }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const reducedMotion = useReducedMotion();
  const { webgl, contextLost } = useThreeState();
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const onReady = useCallback(() => setReady(true), []);
  const onError = useCallback(() => setFailed(true), []);

  const show3D = webgl === "ok" && !reducedMotion && !failed;
  const active = show3D && inView;

  return (
    <div ref={ref} className={`relative ${className}`}>
      <PosterFallback src={poster} alt={posterAlt} visible={!show3D || !ready || contextLost} priority={priority} />
      {show3D && (
        <SceneView active={active} animate={animate} onReady={onReady} onError={onError}>
          {children}
        </SceneView>
      )}
    </div>
  );
}
