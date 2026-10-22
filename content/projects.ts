// Single source of truth for projects (docs/portfolio/ARCHITECTURE.md "Content model").
// Facts come from Ansh_Gupta_Engineering_Resume_.pdf — never invent metrics.
// `poster` / `trinket` are filled in as each model and poster is produced (landing Phase 3, project sessions).

export type ProjectSlug =
  | "steering-wheel"
  | "3d-printer"
  | "imu-wearable"
  | "camera-gimbal"
  | "tapcarry"
  | "garage-inventory";

export type Tool = { name: string; logo?: string };

export type Project = {
  slug: ProjectSlug;
  order: number;
  title: string;
  subtitle: string;
  category: "mechanical" | "electronics" | "software";
  period: string;
  tools: Tool[];
  specLine: string;
  poster?: string;
  trinket?: string;
  status?: "in-progress";
};

const list: Project[] = [
  {
    slug: "steering-wheel",
    order: 1,
    title: "Steering Wheel",
    subtitle: "Formula SAE Electric · Illini Electric Motorsports",
    category: "mechanical",
    period: "Aug 2025 – Apr 2026",
    tools: [{ name: "PTC Creo", logo: "/logos/Creo.svg" }, { name: "Ansys", logo: "/logos/Ansys.svg" }],
    specLine: "Carbon-fiber baseplate · SLS enclosure · Min FoS ~3",
    poster: "/project_media/steering-wheel/poster.webp",
  },
  {
    slug: "3d-printer",
    order: 2,
    title: "3D Printer",
    subtitle: "A Core-XY 3D printer built from scratch",
    category: "mechanical",
    period: "Summer 2025",
    tools: [{ name: "Fusion 360", logo: "/logos/Fusion360.svg" }, { name: "Blender", logo: "/logos/Blender.svg" }],
    specLine: "Core-XY · 220 × 220 × 180 mm · Fusion 360",
    poster: "/project_media/3d-printer/poster.webp",
  },
  {
    slug: "imu-wearable",
    order: 3,
    title: "IMU Wearable",
    subtitle: "A 6-axis IMU device that measures jump height",
    category: "electronics",
    period: "Jan – May 2026",
    tools: [{ name: "KiCad" }, { name: "C++" }, { name: "Python" }, { name: "PyTorch" }],
    specLine: "Custom PCB · 500 Hz · 1D CNN · 2.5 cm mean error",
    poster: "/project_media/imu-wearable/poster.webp",
  },
  {
    slug: "camera-gimbal",
    order: 4,
    title: "Camera Gimbal",
    subtitle: "A seatpost-mounted 3-axis motorized gimbal",
    category: "mechanical",
    period: "2026 – Present",
    tools: [{ name: "Parametric CAD" }, { name: "FDM" }],
    specLine: "3-axis · 500 g payload · Seatpost mount · Parametric",
    status: "in-progress",
  },
  {
    slug: "tapcarry",
    order: 5,
    title: "TapCarry",
    subtitle: "Apple & Google Wallet loyalty platform",
    category: "software",
    period: "May – Aug 2026",
    tools: [{ name: "Next.js" }, { name: "PostgreSQL" }],
    specLine: "Next.js · PostgreSQL · 14 tables · Sole engineer",
    poster: "/project_media/tapcarry/hero.webp",
  },
  {
    slug: "garage-inventory",
    order: 6,
    title: "Garage Inventory",
    subtitle: "A 3D-mapped inventory and checkout system for a makerspace",
    category: "software",
    period: "Jan 2026 – Present",
    tools: [{ name: "Next.js" }, { name: "Three.js" }, { name: "Microsoft Graph" }],
    specLine: "Next.js · Three.js · Microsoft Graph · QR",
  },
];

export const projects = [...list].sort((a, b) => a.order - b.order);

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);
