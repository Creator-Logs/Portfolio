import * as THREE from "three";

// Material presets from docs/portfolio/3D_GUIDE.md §4. Starting values — tune live via ?debug.
// Instances are cached per (preset, colour) so every mesh using the same look shares one material
// (3D_GUIDE §7b rule 11). Never mutate a returned material per-mesh; clone it if you must.

export type Preset =
  | "pla_matte"
  | "pla_silk"
  | "sls_nylon"
  | "alu_extrusion_black"
  | "alu_machined"
  | "steel_polished"
  | "brass"
  | "carbon_fiber"
  | "rubber_silicone"
  | "pcb_soldermask"
  | "pcb_gold"
  | "acrylic_clear"
  | "screen_glass";

type Params = THREE.MeshPhysicalMaterialParameters;

const presets: Record<Preset, Params> = {
  pla_matte: { metalness: 0, roughness: 0.6, clearcoat: 0.1, clearcoatRoughness: 0.5 },
  pla_silk: { metalness: 0, roughness: 0.35, sheen: 0.3, clearcoat: 0.3 },
  sls_nylon: { color: "#2a2a2a", metalness: 0, roughness: 0.9 },
  alu_extrusion_black: { color: "#151515", metalness: 1, roughness: 0.4, anisotropy: 0.3 },
  alu_machined: { color: "#c8c8c8", metalness: 1, roughness: 0.25, anisotropy: 0.6 },
  steel_polished: { color: "#d6d6d6", metalness: 1, roughness: 0.15 },
  brass: { color: "#c9a14a", metalness: 1, roughness: 0.25 },
  carbon_fiber: { color: "#111111", metalness: 0, roughness: 0.35, clearcoat: 1, clearcoatRoughness: 0.05, anisotropy: 0.5 },
  rubber_silicone: { metalness: 0, roughness: 0.7, sheen: 0.5, sheenRoughness: 0.8 },
  pcb_soldermask: { color: "#0d3b1e", metalness: 0, roughness: 0.35, clearcoat: 0.6 },
  pcb_gold: { color: "#d4a64a", metalness: 1, roughness: 0.25 },
  acrylic_clear: { color: "#ffffff", metalness: 0, roughness: 0.05, transmission: 1, thickness: 0.5, ior: 1.49 },
  screen_glass: { color: "#000000", metalness: 0, roughness: 0.05, clearcoat: 1 },
};

const cache = new Map<string, THREE.MeshPhysicalMaterial>();

export function getMaterial(preset: Preset, color?: THREE.ColorRepresentation) {
  const key = `${preset}|${color === undefined ? "" : new THREE.Color(color).getHexString()}`;
  let mat = cache.get(key);
  if (!mat) {
    mat = new THREE.MeshPhysicalMaterial({ ...presets[preset], ...(color !== undefined && { color }) });
    mat.name = preset;
    cache.set(key, mat);
  }
  return mat;
}

export const isPreset = (name: string): name is Preset => name in presets;
