// Experience rows (landing.md §6). Facts from Ansh_Gupta_Engineering_Resume_.pdf only.
import type { ProjectSlug } from "./projects";

export type ExperienceRow = {
  org: string;
  role: string;
  dates: string;
  summary: string;
  project?: ProjectSlug;
};

export const experience: ExperienceRow[] = [
  {
    org: "Illini Electric Motorsports",
    role: "Steering Wheel Project Lead, Cockpit (Aug 2025 – Apr 2026) · Dashboard & Telemetry (Apr 2026 – Present)",
    dates: "Aug 2025 – Present",
    summary:
      "Owned the mechanical design of the Formula SAE Electric steering wheel in PTC Creo — carbon-fiber baseplate, SLS enclosure, grips and quick-disconnect standoffs — from hand calcs and Ansys FEA to machining.",
    project: "steering-wheel",
  },
  {
    org: "The Garage Makerspace, UIUC",
    role: "Program Manager & Software Lead",
    dates: "Jan 2026 – Present",
    summary:
      "Train 300+ students per semester on 3D printing, laser cutting, CNC milling and woodworking, and built the shop's Next.js/Three.js inventory system.",
    project: "garage-inventory",
  },
  {
    org: "TapCarry",
    role: "Founding Engineer",
    dates: "May – Aug 2026",
    summary:
      "Shipped v1 of a multi-tenant Apple/Google Wallet loyalty platform in two weeks as the sole engineer; reached 65 merchant sign-ups.",
    project: "tapcarry",
  },
  {
    org: "University of Illinois Urbana-Champaign",
    role: "B.S. Systems Engineering & Design · Dean's List",
    dates: "Expected Dec 2028",
    summary: "Coursework: Design for Manufacturing, CAD, Intro Electronics, Probability & Statistics, Linear Algebra.",
  },
];
