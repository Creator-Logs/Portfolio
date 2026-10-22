"use client";

import { useThree } from "@react-three/fiber";
import { useEffect, type RefObject } from "react";
import * as THREE from "three";

/**
 * Pre-warms a below-the-fold View scene while it is still offscreen (3D_GUIDE §7b rule 24):
 * compiles its shaders in parallel (compileAsync), then — when the browser is idle — renders it once into
 * one canvas pixel (cleared after), which forces the GPU buffer/texture uploads. Without this the first visible frame paid
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
          // Draw into ONE scissored pixel of the canvas itself, then clear it. (A render target would compile a
          // different program variant — no tone mapping — and pay that compile synchronously: measured ~90 ms
          // per material.)
          const viewport = new THREE.Vector4();
          const scissor = new THREE.Vector4();
          gl.getViewport(viewport);
          gl.getScissor(scissor);
          const scissorTest = gl.getScissorTest();
          const autoClear = gl.autoClear;
          gl.setRenderTarget(null);
          gl.setViewport(0, 0, 1, 1);
          gl.setScissor(0, 0, 1, 1);
          gl.setScissorTest(true);
          gl.autoClear = false;
          gl.render(scene, cam);
          gl.clear(true, true, false);
          gl.autoClear = autoClear;
          gl.setViewport(viewport);
          gl.setScissor(scissor);
          gl.setScissorTest(scissorTest);
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
