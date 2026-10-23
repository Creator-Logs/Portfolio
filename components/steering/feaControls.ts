// Shared, mutable state between the FEA viewer's DOM (buttons, slider, drag) and its 3D scene.
// The DOM writes targets; the scene eases toward them in useFrame and writes DOM labels back through the
// element refs — no React state on the per-frame path (3D_GUIDE §7b rule 8).
export type FeaControls = {
  mode: 0 | 1; // 0 material, 1 von Mises
  load: number; // target load factor 0..1
  /** Ramp the load from 0 to 1 once (first time the viewer is on screen). */
  play: boolean;
  exaggerate: number; // deformation scale (1 = true scale)
  focus: string | null; // FEA_GROUPS id, or null
  yaw: number;
  pitch: number;
  els: {
    peak: HTMLElement | null;
    force: HTMLElement | null;
    moment: HTMLElement | null;
    fixed: HTMLElement | null;
    slider: HTMLInputElement | null;
    readout: HTMLElement | null;
  };
};

export const DEFAULT_VIEW = { yaw: 2.35, pitch: 0.38 }; // behind 3/4, above: the plate face with the standoff stack and QD on it
export const EXAGGERATION = 50;

export const createControls = (): FeaControls => ({
  mode: 1,
  load: 1,
  play: false,
  exaggerate: 1,
  focus: null,
  ...DEFAULT_VIEW,
  els: { peak: null, force: null, moment: null, fixed: null, slider: null, readout: null },
});
