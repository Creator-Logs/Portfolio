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
};

const rigs: Record<StudioPreset, Softbox[]> = {
  "dark-studio": [
    { color: "#FFD9B0", intensity: 3, position: [-3, 4, 3], scale: [4, 3] }, // key: warm, above-front-left
    { color: "#F2F0EC", intensity: 4, position: [4, 2, -4], scale: [0.6, 6] }, // rim strip, behind-right
    { color: "#FFB98A", intensity: 0.4, position: [4, 1, 4], scale: [3, 3] }, // fill: low, warm, front-right
    { color: "#382416", intensity: 0.8, position: [0, -3, 0], scale: [10, 10], rotation: [-Math.PI / 2, 0, 0] }, // ground bounce
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
    const mat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(box.color).multiplyScalar(box.intensity),
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

export function StudioEnvironment({ preset = "dark-studio", rotation = 0 }: { preset?: StudioPreset; rotation?: number }) {
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
    scene.environmentIntensity = tuning.envIntensity;
    scene.environmentRotation.set(0, rotation, 0);
    invalidate();
    return () => {
      scene.environment = null;
    };
  }, [gl, scene, preset, rotation, invalidate]);

  return null;
}
