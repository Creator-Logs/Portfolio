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
         {/* Footer copyright */}
       <footer className="relative z-10 py-8 text-center text-sm text-light-textSec dark:text-dark-textSec border-t border-dark-tertiary dark:border-dark-tertiary mt-2 mx-6 md:mx-20">
            <p>© {new Date().getFullYear()} Creator Logs</p>
          </footer>
          </div>
  );
}
