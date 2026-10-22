"use client";

import { useThree } from "@react-three/fiber";
import { useEffect, type RefObject } from "react";
import * as THREE from "three";

/**
 * Pre-warms a below-the-fold View scene while it is still offscreen (3D_GUIDE §7b rule 24):
 * compiles its shaders in parallel (compileAsync), then — when the browser is idle — renders it once into
 * a 1×1 target, which forces the GPU buffer/texture uploads. Without this the first visible frame paid
 * for both mid-scroll (measured 729 ms on the 600k-triangle wheel).
 */
export function useWarmup(camera: RefObject<THREE.Camera | null>) {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  useEffect(() => {
    let cancelled = false;
    let idle = 0;
    const cam = camera.current;
    if (!cam) return;
    gl.compileAsync(scene, cam)
      .then(() => {
        if (cancelled) return;
        const run = () => {
          if (cancelled) return;
          // the camera may not be fitted yet: disable culling for this one draw so everything uploads
          const culled: THREE.Object3D[] = [];
          scene.traverse((o) => {
            if (o.frustumCulled) {
              o.frustumCulled = false;
              culled.push(o);
            }
          });
          const target = new THREE.WebGLRenderTarget(1, 1);
          const prev = gl.getRenderTarget();
          gl.setRenderTarget(target);
          gl.render(scene, cam);
          gl.setRenderTarget(prev);
          target.dispose();
          culled.forEach((o) => (o.frustumCulled = true));
        };
        idle = typeof requestIdleCallback === "function" ? requestIdleCallback(run, { timeout: 2000 }) : window.setTimeout(run, 200);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      if (typeof cancelIdleCallback === "function") cancelIdleCallback(idle);
      else clearTimeout(idle);
    };
  }, [gl, scene, camera]);
}
