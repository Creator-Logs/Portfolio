import fea from "@/content/fea/steering-wheel.json";

// Everything numeric here is generated from the solved Ansys model (scripts/fea/build_fea.py -> the JSON);
// this file only groups the 10 analysed bodies for display. Names on the left are the Ansys body names.
export { fea };

export type FeaGroup = {
  id: string;
  label: string;
  bodies: string[];
  /** Display material, when it differs from the analysis material. */
  material?: string;
  /** false: no stress / FoS numbers shown. The baseplate is the real 20-ply carbon sheet, but the solve used a
   *  stand-in material for it (the study is about the standoffs) — Ansh 2026-10-22: show the whole stack, plate
   *  included, and describe the plate as 20-ply carbon fiber; never quote the stand-in's numbers. */
  results?: false;
  /** Look in "material" mode: the real part, not the analysis material. */
  look: { color: string; metalness: number; roughness: number };
};

export const FEA_GROUPS: FeaGroup[] = [
  { id: "plate", label: "Baseplate", bodies: ["Base_plate"], material: "20-ply carbon fiber sheet", results: false, look: { color: "#2e2e2e", metalness: 0, roughness: 0.4 } },
  { id: "standoff1", label: "Standoff 1", bodies: ["standoff1"], look: { color: "#c8c8c8", metalness: 1, roughness: 0.28 } },
  { id: "standoff2", label: "Standoff 2", bodies: ["standoff 2"], look: { color: "#c8c8c8", metalness: 1, roughness: 0.28 } },
  { id: "bolts", label: "NAS bolts ×3", bodies: ["NAS 1", "NAS 2", "NAS 3"], look: { color: "#b9bbbc", metalness: 1, roughness: 0.22 } },
  { id: "nuts", label: "Nuts ×3", bodies: ["nut 1", "nut 2", "nut 3"], look: { color: "#b9bbbc", metalness: 1, roughness: 0.22 } },
  { id: "qd", label: "QD profile", bodies: ["QD Profile"], look: { color: "#c9a04c", metalness: 1, roughness: 0.3 } },
];

type Body = (typeof fea.bodies)[number];
const byName = new Map<string, Body>(fea.bodies.map((b) => [b.name, b]));

export const groupStats = FEA_GROUPS.map((g) => {
  const bodies = g.bodies.map((n) => byName.get(n)!);
  const worst = bodies.reduce((a, b) => (b.peakPsi > a.peakPsi ? b : a));
  const shown = g.results !== false;
  return {
    ...g,
    material: g.material ?? worst.material,
    peakPsi: shown ? worst.peakPsi : null,
    fos: shown ? worst.fosYield : null,
    maxDispIn: shown ? Math.max(...bodies.map((b) => b.maxDispIn)) : null,
  };
});

/** The body carrying the model-wide peak (where the MAX tag goes) — always a standoff-stack body. */
export const peakBody = fea.bodies.reduce((a, b) => (b.peakPsi > a.peakPsi ? b : a));
export const minFos = Math.min(...groupStats.map((g) => g.fos ?? Infinity));

/** Largest deflection anywhere in the standoff stack (inches). */
export const stackDispIn = Math.max(...groupStats.map((g) => g.maxDispIn ?? 0));

export const ksi = (psi: number) => (psi / 1000).toFixed(1);
