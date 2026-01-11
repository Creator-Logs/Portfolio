import { Category, Project } from "./types";

export const NAV_LINKS = [
  { label: "Home", href: "#" },
  { label: "About", href: "#about" },
  { label: "Portfolio", href: "#portfolio" },
  { label: "Contact", href: "#contact" },
];

export const projects: Project[] = [
  {
    id: "1",
    title: "Core-XY 3D Printer (Work in Progress)",
    subtitle: "Custom 3D Printer designed and built from scratch",
    description:
      "This project involves the end-to-end design of a custom **Core-XY 3D printer**, developed from first principles with a focus on mechanical precision and system integration. I machined critical rotating components by **turning shafts on a lathe with micro-grooves** to improve belt grip and alignment. Custom 3D-printed parts were designed and iterated to validate fit, stiffness, and assembly sequencing during early prototyping. I produced **manufacturing-ready drawings for sheet-metal fabrication**, accounting for bend radii, tolerances, and fastener access. The printer architecture balances rigidity, modularity, and manufacturability to enable rapid iteration at the CAD and hardware level. This ongoing project serves as a platform to explore motion systems, DFM principles, and precision mechanical design.",
    category: [Category.CAD],
    thumbnailUrl: "/project_gallery/3d_printer/3dprinter_picture.png",
    galleryUrls: ["/project_gallery/3d_printer/3dprinter_picture.png"],
    date: "Jun 2025 - Ongoing",
    tools: ["Fusion 360"],
    specs: [
      "Core-XY Driving Mechanism",
      "Klipper Firmware",
      "200x200x180 mm build volume",
    ],
  },
];
