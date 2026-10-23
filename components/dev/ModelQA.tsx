"use client";

import { lazy, useEffect } from "react";
import { SceneBlock } from "@/components/three/SceneBlock";
import type { StudioPreset } from "@/components/three/StudioEnvironment";

const ModelQAScene = lazy(() => import("./ModelQAScene"));

type Props = { src: string; view: number; env: StudioPreset; explode?: number };

export function ModelQA({ src, view, env, explode }: Props) {
  useEffect(() => {
    document.documentElement.classList.add("qa"); // hides nav + animated grain so screenshots are deterministic
    return () => document.documentElement.classList.remove("qa");
  }, []);
  return (
    <main className="h-svh w-full">
      <SceneBlock posterAlt="" className="h-full w-full">
        <ModelQAScene src={src} view={view} env={env} explode={explode} />
      </SceneBlock>
    </main>
  );
}
