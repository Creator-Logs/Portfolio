import * as THREE from "three";

// Material presets from docs/portfolio/3D_GUIDE.md §4. Starting values — tune live via ?debug.
// Perf: MeshPhysicalMaterial only compiles a clearcoat/sheen/anisotropy pass when the value is > 0, so keep
// those at 0 unless they visibly matter (carbon clearcoat does). They were starving iGPUs during scroll.
// Instances are cached per (preset, colour) so every mesh using the same look shares one material
// (3D_GUIDE §7b rule 11). Never mutate a returned material per-mesh; clone it if you must.

export type Preset =
  | "pla_matte"
  | "pla_silk"
  | "sls_nylon"
  | "alu_extrusion_black"
  | "alu_machined"
  | "steel_polished"
  | "steel_black_oxide"
  | "steel_zinc"
  | "brass"
  | "carbon_fiber"
  | "rubber_silicone"
  | "pcb_soldermask"
  | "pcb_gold"
  | "acrylic_clear"
  | "polycarbonate_clear"
  | "screen_glass";

type Params = THREE.MeshPhysicalMaterialParameters;

const presets: Record<Preset, Params> = {
  pla_matte: { metalness: 0, roughness: 0.6 },
  pla_silk: { metalness: 0, roughness: 0.35, sheen: 0.3, clearcoat: 0.3 },
  sls_nylon: { color: "#2a2a2a", metalness: 0, roughness: 0.9 },
  alu_extrusion_black: { color: "#151515", metalness: 1, roughness: 0.4 },
  alu_machined: { color: "#c8c8c8", metalness: 1, roughness: 0.25 },
  steel_polished: { color: "#d6d6d6", metalness: 1, roughness: 0.15 },
  steel_black_oxide: { color: "#2b2b2d", metalness: 1, roughness: 0.38 },
  steel_zinc: { color: "#c4c6c2", metalness: 1, roughness: 0.3 },
  brass: { color: "#c9a14a", metalness: 1, roughness: 0.25 },
  carbon_fiber: { color: "#111111", metalness: 0, roughness: 0.35, clearcoat: 1, clearcoatRoughness: 0.05 },
  rubber_silicone: { metalness: 0, roughness: 0.7 },
  pcb_soldermask: { color: "#0d3b1e", metalness: 0, roughness: 0.35, clearcoat: 0.6 },
  pcb_gold: { color: "#d4a64a", metalness: 1, roughness: 0.25 },
  acrylic_clear: { color: "#ffffff", metalness: 0, roughness: 0.05, transmission: 1, thickness: 0.5, ior: 1.49 },
  // Cheap see-through (no transmission pass): small windows on trinkets.
  polycarbonate_clear: { color: "#dfe7ea", metalness: 0, roughness: 0.04, transparent: true, opacity: 0.28, clearcoat: 1, depthWrite: false },
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
