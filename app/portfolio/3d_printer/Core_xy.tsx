import React from "react";
import Image from "next/image";

export const CoreXY: React.FC = () => {
  return (
    <section
    id="core_xy"
    className="w-screen bg-[#CBCBCB]"
  >
    <main className="flex flex-col gap-6 z-10 w-full max-w-[1440px] mx-auto px-6 landscape:px-6 landscape:py-20 h-full">
      
      <div className="flex justify-between">
        <div className="w-[40%]">
            <h3 className="pt-12 text-dark-tertiary py-4 text-5xl font-medium">
            Core XY Mechanism
      </h3>
      <p className="text-xl text-dark-tertiary">I chose the Core-XY motion system over the standard Cartesian design because it provides greater stability since the motors are stationary. It further provides more efficient motor load distribution, and a more space-efficient layout, allowing for a larger build volume within a compact frame.</p>
      <h3 className="pt-16 text-dark-tertiary py-4 text-5xl font-medium">
            How it Works
      </h3>
      <p className="text-xl text-dark-tertiary">A Core-XY system uses two motors and crossed belts to move a carriage in the X and Y directions. Both motors turning together move the carriage diagonally, while turning in opposite directions moves it straight along one axis.This setup keeps the motors stationary, reducing moving mass and allowing faster, more precise motion.</p>
      </div>
        <img src="/project_media/3d_printer/core_xy_image.webp" alt="Printer Frame" className="object-contain mix-blend-darken"/>
        </div>
    </main>
  </section>
  );
};
