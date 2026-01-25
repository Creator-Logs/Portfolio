import React from "react";
import { PrinterHero } from "./Printer_hero";
import { PrinterGoals } from "./Printer_goals";
import { PrinterSpecs } from "./Printer_specs";
import { PrinterCAD } from "./Printer_cad";
import { CoreXY } from "./Core_xy";
import { Contact } from "@/components/Contact";

export default function PrinterPage() {
  return (
     <div className="relative">
      <PrinterHero />
      <PrinterGoals />
      <PrinterSpecs />
      <PrinterCAD />
      <CoreXY/>
      <div className="flex w-screen h-screen bg-[url(/project_media/3d_printer/3d_printer_render.webp)] bg-cover items-center">
      <div className="z-10 w-full max-w-[1440px] mx-auto px-6 landscape:px-6 landscape:py-20">
      <text className="font-semibold text-dark-text text-7xl">
  Manufacturing<br />
  Coming Soon...
</text>

      </div>
      
      </div>
         {/* Footer copyright */}
       
          </div>
  );
}
