"use client";

import { PerspectiveCamera } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useRef } from "react";
import * as THREE from "three";
import { Model } from "@/components/three/Model";
import { StudioEnvironment } from "@/components/three/StudioEnvironment";
import { threeStore } from "@/components/three/store";
import { useWarmup } from "@/components/three/useWarmup";
import type { Progress } from "@/hooks/useScrollProgress";

// Pinned showcase (landing.md §2): the steering wheel (detail LOD) sits centred and turns ~200° with
// scroll while the lights stay put, so the rim highlight sweeps across it (DESIGN.md §6 "rim sweep").
// Frames are only rendered on scroll (scroll invalidates the canvas), never idle.

const TURN = THREE.MathUtils.degToRad(100); // -100° .. +100°: back-ish -> front -> other side
const FILL = { desktop: 0.62, mobile: 1.0 }; // share of the limiting viewport dimension the wheel fills

export default function ShowcaseScene({ progress, mobile }: { progress: Progress; mobile: boolean }) {
  const camera = useRef<THREE.PerspectiveCamera>(null);
  const spin = useRef<THREE.Group>(null);
  const centred = useRef<THREE.Group>(null);
  const radius = useRef(0.15);
  const lastAspect = useRef(0);

  // compile + upload while still a screen away (SceneBlock loadMargin), not on the first visible frame
  useWarmup(camera);

  // poster capture (?poster=showcase, scripts/posters.sh): the wheel has loaded; frame at progress 0
  useEffect(() => {
    if (threeStore.get().poster !== "showcase") return;
    const id = setTimeout(() => (document.body.dataset.posterReady = "showcase"), 1500);
    return () => clearTimeout(id);
  }, []);

  // pivot through the model's centre (GLBs rest on y = 0)
  useLayoutEffect(() => {
    const g = centred.current!;
    // idempotent: effects can run twice (dev double-invoke / remount) — measure from a clean transform
    g.position.set(0, 0, 0);
    g.updateWorldMatrix(true, true);
    const box = new THREE.Box3().setFromObject(g);
    const c = box.getCenter(new THREE.Vector3());
    g.position.set(-c.x, -c.y, -c.z);
    radius.current = box.getSize(new THREE.Vector3()).length() / 2;
  }, []);

  useFrame(() => {
    const cam = camera.current;
    const s = spin.current;
    if (!cam || !s) return;
    // fit to whichever field of view is tighter (portrait phones are width-limited)
    if (cam.aspect !== lastAspect.current) {
      lastAspect.current = cam.aspect;
      const v = THREE.MathUtils.degToRad(cam.fov);
      const h = 2 * Math.atan(Math.tan(v / 2) * cam.aspect);
      const fill = mobile ? FILL.mobile : FILL.desktop;
      const dist = radius.current / Math.sin(Math.min(v, h) / 2) / fill;
      cam.position.set(0, dist * 0.12, dist);
      cam.lookAt(0, 0, 0);
    }
    const p = progress.value;
    s.rotation.y = THREE.MathUtils.lerp(-TURN, TURN, p);
    s.rotation.x = THREE.MathUtils.lerp(0.18, -0.06, p); // slight nod so the face catches the key light
  });

  return (
    <>
      <PerspectiveCamera ref={camera} makeDefault fov={28} near={0.01} far={10} />
      {/* The wheel is mostly black (SLS, carbon, black oxide): it only reads through strong, large
          reflections, so this single-object scene gets a brighter environment than the mat. */}
      <StudioEnvironment preset="dark-studio" intensity={2.2} />
      {/* fixed rig: warm key front-left, strong cool-white rim behind-right — the sweep comes from turning */}
      {/* only the key is warm: black parts must stay black, not bronze */}
      <directionalLight position={[-1.5, 1.4, 2]} intensity={2.4} color="#FFE7CF" />
      <directionalLight position={[2.5, 1, -2.2]} intensity={6} color="#EEF2F8" />
      <directionalLight position={[-2.5, 0.6, -1.5]} intensity={3} color="#F4F4F2" />
      <directionalLight position={[1.5, -0.4, 2]} intensity={0.6} color="#F2F0EC" />
      <GlowBackdrop />
      <group ref={spin}>
        <group ref={centred}>
          <Model src="/models/steering-wheel/steering-wheel.glb" />
        </group>
      </group>
    </>
  );
}

// Warm radial glow behind the wheel (DESIGN.md §2 "background warmth"). It lives in the 3D scene because
// anything in the page DOM sits *above* the shared canvas and would haze the model.
const glowMaterial = new THREE.ShaderMaterial({
  uniforms: { uInner: { value: new THREE.Color("#5a4636") }, uOuter: { value: new THREE.Color("#100904") } },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: /* glsl */ `
    uniform vec3 uInner;
    uniform vec3 uOuter;
    varying vec2 vUv;
    void main() {
      float d = length(vUv - 0.5) * 2.0;
      float a = 1.0 - smoothstep(0.0, 1.0, d);
      // a dark, wide gradient bands in 8 bits: dither by ~1 LSB (interleaved gradient noise)
      float n = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715)))) - 0.5;
      gl_FragColor = vec4(mix(uOuter, uInner, a * a) + n * (1.5 / 255.0), a);
    }`,
  transparent: true,
  depthWrite: false,
  toneMapped: false,
});

function GlowBackdrop() {
  return (
    <mesh position={[0, 0, -0.45]} renderOrder={-1} raycast={() => null}>
      <planeGeometry args={[1.6, 1.6]} />
      <primitive object={glowMaterial} attach="material" />
    </mesh>
  );
}
