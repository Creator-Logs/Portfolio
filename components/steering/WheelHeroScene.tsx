"use client";

import { PerspectiveCamera } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useRef, type RefObject } from "react";
import * as THREE from "three";
import { GlowBackdrop } from "@/components/landing/ShowcaseScene";
import { Model } from "@/components/three/Model";
import { StudioEnvironment } from "@/components/three/StudioEnvironment";
import { useWarmup } from "@/components/three/useWarmup";

// Page hero (fsae-steering-wheel.md §1, Ansh 2026-10-22: drag to turn the CAD instead of scroll rotation).
// The DOM writes the target yaw/pitch (WheelHero); the wheel eases towards it and requests frames only until
// it settles (frameloop="demand"). Same light rig as the landing showcase, so its shaders are already compiled
// when arriving from the landing (3D_GUIDE §7b rule 27).

export type HeroControls = { yaw: number; pitch: number; /** set by the scene: request a frame */ kick?: () => void };
export const HERO_VIEW = { yaw: -0.45, pitch: 0.2 };
export const PARTS_GLB = "/models/steering-wheel/steering-wheel-parts.glb";

const FILL = { desktop: 0.78, mobile: 0.95 }; // share of the limiting viewport dimension the wheel fills
const damp = THREE.MathUtils.damp;

type Props = { ctl: RefObject<HeroControls>; mobile: boolean };

export default function WheelHeroScene({ ctl, mobile }: Props) {
  const camera = useRef<THREE.PerspectiveCamera>(null);
  const spin = useRef<THREE.Group>(null);
  const centred = useRef<THREE.Group>(null);
  const radius = useRef(0.15);
  const lastAspect = useRef(0);
  useWarmup(camera);
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    const c = ctl.current;
    c.kick = invalidate;
    return () => void (c.kick = undefined);
  }, [ctl, invalidate]);

  // pivot through the model's centre (GLBs rest on y = 0); idempotent (3D_GUIDE §7b rule 25)
  useLayoutEffect(() => {
    const g = centred.current!;
    g.position.set(0, 0, 0);
    g.updateWorldMatrix(true, true);
    const box = new THREE.Box3().setFromObject(g);
    const c = box.getCenter(new THREE.Vector3());
    g.position.set(-c.x, -c.y, -c.z);
    radius.current = box.getSize(new THREE.Vector3()).length() / 2;
  }, []);

  useFrame((state, dt) => {
    const cam = camera.current;
    const s = spin.current;
    const c = ctl.current;
    if (!cam || !s || !c) return;
    if (cam.aspect !== lastAspect.current) {
      lastAspect.current = cam.aspect;
      const v = THREE.MathUtils.degToRad(cam.fov);
      const h = 2 * Math.atan(Math.tan(v / 2) * cam.aspect);
      const dist = radius.current / Math.sin(Math.min(v, h) / 2) / (mobile ? FILL.mobile : FILL.desktop);
      const up = radius.current * (mobile ? 0.35 : 0.2); // wheel sits below the wordmark
      cam.position.set(0, dist * 0.12 + up, dist);
      cam.lookAt(0, up, 0);
    }
    s.rotation.y = damp(s.rotation.y, c.yaw, 8, dt);
    s.rotation.x = damp(s.rotation.x, c.pitch, 8, dt);
    if (Math.abs(s.rotation.y - c.yaw) + Math.abs(s.rotation.x - c.pitch) > 1e-4) state.invalidate();
  });

  return (
    <>
      <PerspectiveCamera ref={camera} makeDefault fov={28} near={0.01} far={10} />
      <StudioEnvironment preset="dark-studio" intensity={2.2} />
      <directionalLight position={[-1.5, 1.4, 2]} intensity={2.4} color="#FFE7CF" />
      <directionalLight position={[2.5, 1, -2.2]} intensity={6} color="#EEF2F8" />
      <directionalLight position={[-2.5, 0.6, -1.5]} intensity={3} color="#F4F4F2" />
      <directionalLight position={[1.5, -0.4, 2]} intensity={0.6} color="#F2F0EC" />
      <GlowBackdrop />
      <group ref={spin} rotation={[HERO_VIEW.pitch, HERO_VIEW.yaw, 0]}>
        <group ref={centred}>
          <Model src={PARTS_GLB} />
        </group>
      </group>
    </>
  );
}
