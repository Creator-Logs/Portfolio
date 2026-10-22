"use client";

import type * as THREE from "three";
import { getMaterial, type Preset } from "./materials";

// Attach a shared preset material to a JSX mesh: <mesh><boxGeometry /><Mat preset="pla_matte" /></mesh>.
// Never pass shared materials via `material={...}`: R3F disposes a mesh's material on unmount,
// which would kill the cached instance for every other mesh. Primitives are never disposed, and
// R3F restores the mesh's original material when this detaches (3D_GUIDE §7b rule 11).
export function Mat({ preset, color }: { preset: Preset; color?: THREE.ColorRepresentation }) {
  return <primitive object={getMaterial(preset, color)} attach="material" />;
}
