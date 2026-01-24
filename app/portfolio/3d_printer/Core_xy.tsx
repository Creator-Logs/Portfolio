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
        <div>
            <h2 className="text-light-text py-4 text-5xl font-medium">
        CAD Overview
      </h2>
      </div>
        <img src="/project_media/3d_printer/core_xy_image.webp" alt="Printer Frame" className="object-contain mix-blend-darken"/>
        </div>
      
      
    </main>
  </section>
  );
};
