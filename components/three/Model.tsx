"use client";

import { useGLTF } from "@react-three/drei";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { createMaterial, isPreset, type Preset } from "./materials";

// Loads a meshopt-compressed GLB (3D_GUIDE §1.3) and maps materials to presets.
// - `materials`: { pattern: preset | [preset, colour] } matched (case-insensitive) against mesh *or*
//   material names. Otherwise a material named "preset" or "preset#rrggbb" (what scripts/models/process.py
//   writes) uses that preset (and colour); anything else keeps the GLB's material.
// - Each Model owns its material set (one per preset/colour/ao, created here, disposed on unmount):
//   the materials' model-space detail reads this model's root transform (materials.ts).
// - Meshes with the baked "_ao" attribute get the AO material variant.
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

  const { object, owned } = useMemo(() => {
    // clone(true) shares geometry with the cached GLB — cheap to reuse.
    const root = scene.clone(true);
    const owned = new Map<string, THREE.Material>();
    const material = (preset: Preset, color: THREE.ColorRepresentation | undefined, ao: boolean) => {
      const key = `${preset}|${color === undefined ? "" : new THREE.Color(color).getHexString()}|${ao}`;
      if (!owned.has(key)) owned.set(key, createMaterial(preset, color, ao));
      return owned.get(key)!;
    };
    const rules = Object.entries(materials ?? {}).map(([pattern, v]) => ({
      re: new RegExp(pattern, "i"),
      preset: Array.isArray(v) ? v[0] : v,
      color: Array.isArray(v) ? v[1] : undefined,
    }));
    root.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      const current = mesh.material as THREE.Material;
      const ao = mesh.geometry.hasAttribute("_ao"); // baked by scripts/models/process.py
      const rule = rules.find((r) => r.re.test(mesh.name) || r.re.test(current?.name ?? ""));
      if (rule) mesh.material = material(rule.preset, rule.color, ao);
      else if (current?.name) {
        const [preset, hex] = current.name.split("#");
        if (isPreset(preset)) mesh.material = material(preset, hex ? `#${hex}` : undefined, ao);
      }
      mesh.userData.modelRoot = root;
      mesh.castShadow = castShadow;
      if (!raycastable) mesh.raycast = () => {};
    });
    return { object: root, owned };
  }, [scene, materials, raycastable, castShadow]);
  // created imperatively -> disposed here (3D_GUIDE §7b rule 12); the GPU programs stay shared
  useEffect(() => () => owned.forEach((m) => m.dispose()), [owned]);

  return <primitive object={object} {...group} />;
}

Model.preload = (src: string) => useGLTF.preload(src, false, true);
