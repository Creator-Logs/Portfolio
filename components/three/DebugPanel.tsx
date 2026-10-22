"use client";

import { invalidate } from "@react-three/fiber";
import { useControls } from "leva";
import { useEffect, useState } from "react";
import type * as THREE from "three";
import { tuning } from "./store";

// ?debug only: live tuning (leva) + renderer.info overlay to verify 3D_GUIDE §7b rules 10–13.
export default function DebugPanel({ gl }: { gl: THREE.WebGLRenderer }) {
  useControls("Renderer", {
    exposure: {
      value: tuning.exposure,
      min: 0.4,
      max: 1.6,
      step: 0.01,
      onChange: (v: number) => {
        tuning.exposure = v;
        gl.toneMappingExposure = v;
        invalidate();
      },
    },
  });

  const [info, setInfo] = useState(snapshot(gl));
  useEffect(() => {
    const id = setInterval(() => setInfo(snapshot(gl)), 500);
    return () => clearInterval(id);
  }, [gl]);

  return (
    <pre className="type-label fixed bottom-3 left-3 z-[70] rounded-md bg-ink/90 p-3 text-cream-dim normal-case">
      {Object.entries(info)
        .map(([k, v]) => `${k.padEnd(11)} ${v}`)
        .join("\n")}
    </pre>
  );
}

function snapshot(gl: THREE.WebGLRenderer) {
  return {
    frame: gl.info.render.frame, // stops increasing when nothing animates (demand frameloop)
    calls: gl.info.render.calls,
    triangles: gl.info.render.triangles.toLocaleString(),
    geometries: gl.info.memory.geometries,
    textures: gl.info.memory.textures,
    programs: gl.info.programs?.length ?? 0,
    dpr: gl.getPixelRatio().toFixed(2),
  };
}
