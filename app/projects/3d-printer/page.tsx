// Preserved v1 page, ported per docs/portfolio/projects/3d-printer.md. Layout, copy, images and colours
// match v1 (commit cf67374); allowed changes are mobile stacking, the new nav/footer, and the additions
// Ansh approved (Core-XY demo, Manufacturing rows).
import type { Metadata } from "next";
import localFont from "next/font/local";
import { PrinterHero } from "@/components/printer/PrinterHero";
import { PrinterGoal } from "@/components/printer/PrinterGoal";
import { PrinterSpecs } from "@/components/printer/PrinterSpecs";
import { PrinterCad } from "@/components/printer/PrinterCad";
import { CoreXY } from "@/components/printer/CoreXY";
import { PrinterManufacturing } from "@/components/printer/PrinterManufacturing";

// v1 font, kept for this page only (DESIGN.md §3).
const clash = localFont({
  src: "../../../public/fonts/ClashGrotesk-Variable.ttf",
  weight: "200 700",
  display: "swap",
});

export const metadata: Metadata = {
  title: "3D Printer — Ansh Gupta",
  description: "A Core-XY 3D printer designed and built from scratch: 200 × 185 × 160 mm build volume, under $200.",
};

export default function PrinterPage() {
  return (
    <main className={clash.className}>
      <PrinterHero />
      <PrinterGoal />
      <PrinterSpecs />
      <PrinterCad />
      <CoreXY />
      <PrinterManufacturing />
    </main>
  );
}
