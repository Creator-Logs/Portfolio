"use client";

import { lazy } from "react";
import { SceneBlock } from "@/components/three/SceneBlock";

// Lazy 3D content must be created in a client module and rendered from it — passing a
// React.lazy export through a Server Component double-wraps it.
const HeroTestScene = lazy(() => import("./HeroTestScene"));

export function HeroScene({ className }: { className?: string }) {
  return (
    <SceneBlock animate posterAlt="3D test scene" className={className}>
      <HeroTestScene />
    </SceneBlock>
  );
}
