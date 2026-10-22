"use client";

import { PerspectiveCamera } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useRef } from "react";
import * as THREE from "three";
import { Model } from "@/components/three/Model";
import { Monitor } from "@/components/three/Monitor";
import { StudioEnvironment } from "@/components/three/StudioEnvironment";
import type { TrinketDef } from "@/content/trinkets";

// Selected-works row media on hover (landing.md §4): the project's model spins up in place of the poster.
// Uses the same mat-LOD files as the hero (already cached), mounted only while the row is hovered.
export default function WorkSpinScene({ def }: { def: TrinketDef }) {
  const camera = useRef<THREE.PerspectiveCamera>(null);
  const spin = useRef<THREE.Group>(null);
  const centred = useRef<THREE.Group>(null);
  const radius = useRef(0.2);
  const lastAspect = useRef(0);

  // same light rig as ShowcaseScene -> identical shader programs (already compiled by the time the visitor
  // reaches this list); compileAsync covers a direct jump here (3D_GUIDE §7b rule 24)
  const gl = useThree((st) => st.gl);
  const scene = useThree((st) => st.scene);
  useEffect(() => {
    if (camera.current) gl.compileAsync(scene, camera.current).catch(() => {});
  }, [gl, scene]);

  useLayoutEffect(() => {
    const g = centred.current!;
    g.position.set(0, 0, 0); // idempotent (3D_GUIDE §7b rule 25)
    g.updateWorldMatrix(true, true);
    const box = new THREE.Box3().setFromObject(g);
    const c = box.getCenter(new THREE.Vector3());
    g.position.set(-c.x, -c.y, -c.z);
    radius.current = box.getSize(new THREE.Vector3()).length() / 2;
  }, []);

  useFrame((_, delta) => {
    const cam = camera.current;
    const s = spin.current;
    if (!cam || !s) return;
    if (cam.aspect !== lastAspect.current) {
      lastAspect.current = cam.aspect;
      const v = THREE.MathUtils.degToRad(cam.fov);
      const h = 2 * Math.atan(Math.tan(v / 2) * cam.aspect);
      const dist = radius.current / Math.sin(Math.min(v, h) / 2) / 0.92;
      cam.position.set(0, dist * 0.3, dist);
      cam.lookAt(0, 0, 0);
    }
    s.rotation.y += delta * 0.9;
  });

  return (
    <>
      <PerspectiveCamera ref={camera} makeDefault fov={30} near={0.01} far={10} />
      <StudioEnvironment preset="dark-studio" intensity={2.2} />
      <directionalLight position={[-1.5, 1.4, 2]} intensity={3} color="#FFD9B0" />
      <directionalLight position={[2.5, 1, -2.2]} intensity={7} color="#F4F1EC" />
      <directionalLight position={[-2.5, 0.6, -1.5]} intensity={3} color="#F4F1EC" />
      <directionalLight position={[1.5, -0.4, 2]} intensity={0.8} color="#FFE6CC" />
      <group ref={spin}>
        <group ref={centred}>
          {def.kind === "monitor" ? <Monitor screen="/project_media/tapcarry/hero.webp" /> : <Model src={def.src!} />}
        </group>
      </group>
    </>
  );
}
