import React from "react";
import { PrinterHero } from "./Printer_hero";
import { PrinterGoals } from "./Printer_goals";
import { PrinterSpecs } from "./Printer_specs";

export default function PrinterPage() {
  return (
    <>
      <PrinterHero />
      <PrinterGoals />
      <PrinterSpecs />
    </>
  );
}
