// "Everything on the bench" (landing.md §5). Skills from Ansh_Gupta_Engineering_Resume_.pdf.
// `usedIn` links only where the resume ties the skill to that project; otherwise a factual `note`
// (never inferred — e.g. TypeScript has no explicit project in the resume, so it gets neither).
import type { ProjectSlug } from "./projects";

export type Skill = { name: string; logo?: string; usedIn?: ProjectSlug[]; note?: string };
export type SkillGroup = { id: string; title: string; skills: Skill[] };

export const skillGroups: SkillGroup[] = [
  {
    id: "cad",
    title: "CAD & analysis",
    skills: [
      { name: "PTC Creo", logo: "/logos/Creo.svg", usedIn: ["steering-wheel"] },
      { name: "Fusion 360", logo: "/logos/Fusion360.svg", usedIn: ["3d-printer"] },
      { name: "Ansys FEA", logo: "/logos/Ansys.svg", usedIn: ["steering-wheel"] },
      { name: "Tolerance analysis", usedIn: ["3d-printer"] },
      { name: "Engineering drawings", usedIn: ["steering-wheel"] },
      { name: "DFM", note: "Design for Manufacturing coursework" },
    ],
  },
  {
    id: "make",
    title: "Manufacturing",
    skills: [
      { name: "CNC milling", usedIn: ["steering-wheel", "3d-printer"] },
      { name: "Lathe", usedIn: ["3d-printer"] },
      { name: "Waterjet / laser", usedIn: ["steering-wheel", "3d-printer"] },
      { name: "Sheet-metal forming", usedIn: ["3d-printer"] },
      { name: "FDM", usedIn: ["3d-printer", "steering-wheel", "camera-gimbal"] },
      { name: "SLS design", usedIn: ["steering-wheel"] },
      { name: "3D scanning", usedIn: ["steering-wheel"] },
      { name: "Injection-mold design", note: "Coursework" },
    ],
  },
  {
    id: "code",
    title: "Code & hardware",
    skills: [
      { name: "Python", usedIn: ["imu-wearable"] },
      { name: "C++", usedIn: ["imu-wearable"] },
      { name: "TypeScript" },
      { name: "SQL" },
      { name: "PyTorch", usedIn: ["imu-wearable"] },
      { name: "Next.js", usedIn: ["tapcarry", "garage-inventory"] },
      { name: "Three.js", usedIn: ["garage-inventory"] },
      { name: "PostgreSQL", usedIn: ["tapcarry"] },
      { name: "KiCad", usedIn: ["imu-wearable"] },
      { name: "ESP32", usedIn: ["imu-wearable"] },
      { name: "Raspberry Pi", note: "Illini EV driver display & telemetry" },
      { name: "CAN bus", note: "Illini EV driver display & telemetry" },
    ],
  },
];
