"use client";

import { useThree } from "@react-three/fiber";
import { useLayoutEffect } from "react";
import * as THREE from "three";
import { tuning } from "./store";

// Light rigs from 3D_GUIDE §3, built from emissive "softbox" planes (0 kB download) and baked
// ONCE per preset into a PMREM texture shared by every View for the app's lifetime.
// (drei <Environment> re-bakes per mount and leaks the PMREM texture on unmount — measured with ?debug.)
// Each drei View has its own scene, so render <StudioEnvironment/> inside every View.

export type StudioPreset = "dark-studio" | "light-studio";

type Softbox = {
  color: string;
  intensity: number;
  position: [number, number, number];
  scale: [number, number];
  /** Face the origin (default) or use an explicit rotation. */
  rotation?: [number, number, number];
  /** Edge softness 0..1 (share of the half-size that falls off) — real softboxes are hot in the
   *  middle and roll off at the diffuser edge, which is what makes a highlight read as a light. */
  soft?: number;
};

const rigs: Record<StudioPreset, Softbox[]> = {
  // Tuned on the steering wheel (mostly black SLS / carbon / black-oxide): dark surfaces only read
  // through large, bright reflections, so the softboxes are big; warmth is kept off metals' underside.
  // Gradient softboxes with a high key:fill ratio; crisp narrow strips give dark parts a bright edge line.
  "dark-studio": [
    { color: "#FFEEDD", intensity: 9, position: [-3, 5, 3], scale: [6, 4], soft: 0.7 }, // key: barely warm, large, above-front-left
    { color: "#FFFFFF", intensity: 12, position: [4.5, 2, -4], scale: [0.6, 8], soft: 0.25 }, // rim strip, behind-right
    { color: "#F4EEE8", intensity: 5, position: [-5, 2, -3], scale: [0.5, 6], soft: 0.25 }, // second rim, behind-left
    { color: "#F2F4F8", intensity: 0.9, position: [4, 1, 4], scale: [5, 4], soft: 0.9 }, // fill: soft, faintly cool, front-right
    { color: "#FFFFFF", intensity: 2.2, position: [0.5, 3, 5], scale: [3.5, 0.35], soft: 0.3 }, // front strip: edge line on top faces
    { color: "#FFFFFF", intensity: 0.45, position: [0, 7, 0], scale: [12, 12], rotation: [Math.PI / 2, 0, 0], soft: 1 }, // overhead dome
    { color: "#2A2018", intensity: 0.3, position: [0, -3, 0], scale: [10, 10], rotation: [-Math.PI / 2, 0, 0], soft: 1 }, // ground bounce
  ],
  "light-studio": [
    { color: "#ffffff", intensity: 2.5, position: [0, 6, 0], scale: [10, 10], rotation: [Math.PI / 2, 0, 0] },
    { color: "#ffffff", intensity: 1, position: [-5, 2, 3], scale: [4, 4] },
    { color: "#ffffff", intensity: 1, position: [5, 2, 3], scale: [4, 4] },
    { color: "#e8e8e8", intensity: 0.6, position: [0, 1, -6], scale: [12, 4] },
  ],
};

const baked = new Map<StudioPreset, THREE.Texture>();

function bake(gl: THREE.WebGLRenderer, preset: StudioPreset) {
  const scene = new THREE.Scene();
  const plane = new THREE.PlaneGeometry(1, 1);
  const materials: THREE.Material[] = [];
  for (const box of rigs[preset]) {
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color(box.color).multiplyScalar(box.intensity) },
        uSoft: { value: box.soft ?? 0.5 },
      },
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor;
        uniform float uSoft;
        varying vec2 vUv;
        void main() {
          vec2 d = abs(vUv - 0.5) * 2.0;
          vec2 edge = 1.0 - smoothstep(1.0 - uSoft, 1.0, d);
          float hot = 1.0 + 0.6 * (1.0 - dot(d, d) * 0.5) * uSoft; // diffuser hotspot
          gl_FragColor = vec4(uColor * edge.x * edge.y * hot, 1.0);
        }`,
      side: THREE.DoubleSide,
      toneMapped: false,
    });
    materials.push(mat);
    const mesh = new THREE.Mesh(plane, mat);
    mesh.position.set(...box.position);
    mesh.scale.set(box.scale[0], box.scale[1], 1);
    if (box.rotation) mesh.rotation.set(...box.rotation);
    else mesh.lookAt(0, 0, 0);
    scene.add(mesh);
  }
  const pmrem = new THREE.PMREMGenerator(gl);
  const target = pmrem.fromScene(scene, 0, 0.1, 100);
  pmrem.dispose();
  plane.dispose();
  materials.forEach((m) => m.dispose());
  return target.texture; // kept for the app's lifetime (one per preset)
}

export function StudioEnvironment({
  preset = "dark-studio",
  rotation = 0,
  intensity = 1,
}: {
  preset?: StudioPreset;
  rotation?: number;
  /** Multiplier on the global tuning value (e.g. brighter for a single hero object). */
  intensity?: number;
}) {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const invalidate = useThree((s) => s.invalidate);

  useLayoutEffect(() => {
    let texture = baked.get(preset);
    if (!texture) {
      texture = bake(gl, preset);
      baked.set(preset, texture);
    }
    scene.environment = texture;
    scene.environmentIntensity = tuning.envIntensity * intensity;
    scene.environmentRotation.set(0, rotation, 0);
    invalidate();
    return () => {
      scene.environment = null;
    };
  }, [gl, scene, preset, rotation, intensity, invalidate]);

  return null;
}
