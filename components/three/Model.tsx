"use client";

import { useGLTF } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";
import { getMaterial, isPreset, type Preset } from "./materials";

// Loads a meshopt-compressed GLB (3D_GUIDE §1.3) and maps materials to presets.
// - `materials`: { pattern: preset | [preset, colour] } matched (case-insensitive) against mesh *or*
//   material names. Otherwise a material named "preset" or "preset#rrggbb" (what scripts/models/process.py
//   writes) uses that preset (and colour); anything else keeps the GLB's material.
// - Raycasting is off by default: interact through a hit proxy (3D_GUIDE §7b rule 14).

type MaterialMap = Record<string, Preset | [Preset, THREE.ColorRepresentation]>;

type Props = Omit<React.JSX.IntrinsicElements["group"], "children"> & {
  src: string;
  materials?: MaterialMap;
  raycastable?: boolean;
  castShadow?: boolean;
};

export function Model({ src, materials, raycastable = false, castShadow = false, ...group }: Props) {
  const { scene } = useGLTF(src, false, true);

  const object = useMemo(() => {
    // clone(true) shares geometry + materials with the cached GLB — cheap to reuse.
    const root = scene.clone(true);
    const rules = Object.entries(materials ?? {}).map(([pattern, v]) => ({
      re: new RegExp(pattern, "i"),
      mat: Array.isArray(v) ? getMaterial(v[0], v[1]) : getMaterial(v),
    }));
    root.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      const current = mesh.material as THREE.Material;
      const rule = rules.find((r) => r.re.test(mesh.name) || r.re.test(current?.name ?? ""));
      if (rule) mesh.material = rule.mat;
      else if (current?.name) {
        const [preset, hex] = current.name.split("#");
        if (isPreset(preset)) mesh.material = getMaterial(preset, hex ? `#${hex}` : undefined);
      }
      mesh.castShadow = castShadow;
      if (!raycastable) mesh.raycast = () => {};
    });
    return root;
  }, [scene, materials, raycastable, castShadow]);

  return <primitive object={object} {...group} />;
}

Model.preload = (src: string) => useGLTF.preload(src, false, true);
