// Models on the landing hero mat. Add a model = add an entry (built with scripts/models/build.sh <slug> mat).
// Positions are on the cutting mat in metres (x right, z toward the viewer); the mat is 0.9 × 0.6 m and
// centred in the frame. Keep the back-left quarter clear (the wordmark sits over it on desktop).
// `size` is the model's longest side on the mat (models are shown at "toy" scale, not real scale).
// Every GLB faces +Z (its user-facing side; see scripts/models/*.json rotate_deg), so rotation [0,0,0]
// faces the viewer.
import type { ProjectSlug } from "./projects";

export type TrinketDef = {
  id: string;
  slug: ProjectSlug;
  label: string;
  kind: "model" | "monitor";
  src?: string;
  size: number;
  position: [number, number];
  mobilePosition: [number, number];
  /** degrees, applied X then Y then Z (e.g. lay the wheel flat) */
  rotation: [number, number, number];
};

// Load order = smallest first, so the mat fills in quickly (3D_GUIDE §7b rule 18).
export const trinkets: TrinketDef[] = [
  {
    id: "imu",
    slug: "imu-wearable",
    label: "IMU jump wearable · custom PCB",
    kind: "model",
    src: "/models/imu-wearable/imu-wearable-mat.glb",
    size: 0.17,
    position: [0.22, 0.15],
    mobilePosition: [0.075, 0.18],
    rotation: [0, 80, 0], // long axis across the screen, opened gap facing the viewer
  },
  {
    id: "monitor",
    slug: "tapcarry",
    label: "TapCarry · wallet loyalty platform",
    kind: "monitor",
    size: 0.25,
    position: [0.0, -0.15],
    mobilePosition: [-0.075, 0.05],
    rotation: [0, 12, 0], // turned slightly toward the centre of the group
  },
  {
    id: "wheel",
    slug: "steering-wheel",
    label: "Steering wheel · Illini Electric Motorsports",
    kind: "model",
    src: "/models/steering-wheel/steering-wheel-mat.glb",
    size: 0.27,
    position: [-0.12, 0.135],
    mobilePosition: [-0.075, 0.18],
    rotation: [-90, 0, -6], // lying face-up (driver side), top of the wheel pointing away
  },
  {
    id: "printer",
    slug: "3d-printer",
    label: "Core-XY 3D printer · built from scratch",
    kind: "model",
    src: "/models/3d-printer/3d-printer-mat.glb",
    size: 0.26,
    position: [0.26, -0.11],
    mobilePosition: [0.075, 0.075],
    rotation: [0, -22, 0], // front (motors + PSU side) turned toward the camera
  },
];
