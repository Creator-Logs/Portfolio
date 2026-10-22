"use client";

import { Canvas, useFrame, useThree, type RootState } from "@react-three/fiber";
import { PerformanceMonitor, View } from "@react-three/drei";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import * as THREE from "three";
import { threeStore, tuning, useThreeState } from "./store";

const DebugPanel = dynamic(() => import("./DebugPanel"), { ssr: false });

export default function SceneCanvas() {
  const { debug } = useThreeState();
  // 3D render resolution: never above the screen's real pixel ratio, and capped at 1.25. MSAA on a
  // full-screen canvas above ~1.25x (a 1.5x Windows laptop = 2160x1350 multisampled) saturated Intel
  // GPUs while Chrome composited the scrolling page: 12 s freezes. 1.25x + MSAA measured stall-free.
  // DOM text still renders at full resolution. (3D_GUIDE §7b rule 15)
  const maxDpr = Math.min(window.devicePixelRatio || 1, 1.25);
  const [dpr, setDpr] = useState(maxDpr);
  const [gl, setGl] = useState<THREE.WebGLRenderer | null>(null);

  const onCreated = (state: RootState) => {
    const renderer = state.gl;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.AgXToneMapping;
    renderer.toneMappingExposure = tuning.exposure;
    renderer.info.autoReset = false; // reset once per frame in InfoReset so all Views are counted

    const canvas = renderer.domElement;
    canvas.addEventListener("webglcontextlost", (e) => {
      e.preventDefault(); // allow the browser to restore the context
      threeStore.set({ contextLost: true });
    });
    canvas.addEventListener("webglcontextrestored", () => {
      threeStore.set({ contextLost: false });
      state.invalidate();
    });
    setGl(renderer);
  };

  return (
    <>
      <Canvas
        // Fixed behind the page; events come from <body> so DOM stays interactive (drei View setup).
        style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}
        eventSource={document.body}
        eventPrefix="client"
        frameloop="demand"
        dpr={dpr}
        gl={{ antialias: true, powerPreference: "high-performance", alpha: true }}
        onCreated={onCreated}
      >
        <PerformanceMonitor
          onChange={({ factor }) => setDpr(Math.round((1 + (maxDpr - 1) * factor) * 4) / 4)}
          flipflops={3}
          onFallback={() => setDpr(1)}
        />
        <InvalidateOnScroll />
        <InfoReset />
        <View.Port />
      </Canvas>
      {debug && gl && <DebugPanel gl={gl} />}
    </>
  );
}

// drei View measures its DOM rect inside the frame loop, so scrolling/resizing must request a frame (rule 6).
function InvalidateOnScroll() {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    const onChange = () => invalidate();
    window.addEventListener("scroll", onChange, { passive: true });
    window.addEventListener("resize", onChange);
    return () => {
      window.removeEventListener("scroll", onChange);
      window.removeEventListener("resize", onChange);
    };
  }, [invalidate]);
  return null;
}

function InfoReset() {
  useFrame(({ gl }) => gl.info.reset(), -1);
  return null;
}
