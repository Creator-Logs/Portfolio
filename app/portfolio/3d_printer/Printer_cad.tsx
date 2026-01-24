import React from "react";
import Image from "next/image";

export const PrinterCAD: React.FC = () => {
  return (
    <section
    id="printer_cad"
    className="w-screen bg-light-bg"
  >
    <main className="flex flex-col gap-6 z-10 w-full max-w-[1440px] mx-auto px-6 landscape:px-20 landscape:py-20 h-full">
      <h2 className="text-light-text py-4 text-5xl font-medium">
        CAD Overview
      </h2>
      
      {/* Bento Grid */}
      <div className="grid grid-cols-12 grid-rows-8 gap-4 flex-1">
        {/* Printer Frame - Top Left */}
        <div className="col-span-4 row-span-4 rounded-2xl border-[1px] border-gray-300 bg-white flex items-center justify-center relative overflow-hidden">
          <img src="/project_media/3d_printer/printer_frame.webp" alt="Printer Frame" className="object-contain" />
          <div className="absolute bottom-6 right-6 bg-dark-bg/50 backdrop-blur-sm px-4 py-2 rounded-full">
  <p className="text-white text-xl font-medium">Print Frame</p>
</div>
        </div>
        
        {/* Z-axis assembly - Top Middle */}
        <div className="col-span-4 row-span-4 rounded-2xl border-[1px] border-gray-300 bg-white flex items-center justify-center relative overflow-hidden">
          <img src="/project_media/3d_printer/z_assembly.webp" alt="Z-axis assembly" className="w-full h-full object-contain" />
          <div className="absolute bottom-6 right-6 bg-dark-bg/50 backdrop-blur-sm px-4 py-2 rounded-full">
  <p className="text-white text-xl font-medium">Z-Axis Assembly</p>
</div>
        </div>
        
        {/* Extruder & Hotend - Top Right (tall) */}
        <div className="col-span-4 row-span-5 rounded-2xl border-[1px] border-gray-300 bg-white flex items-center justify-center relative overflow-hidden">
          <img src="/project_media/3d_printer/extruder.webp" alt="Extruder & Hotend" className="w-full h-full object-contain" />
          <div className="absolute bottom-6 right-6 bg-dark-bg/50 backdrop-blur-sm px-4 py-2 rounded-full">
  <p className="text-white text-xl font-medium">Extruder & Hotend</p>
</div>
        </div>
        
        {/* Printer Frame Detail - Bottom Left */}
        <div className="col-span-3 row-span-4 rounded-2xl border-[1px] border-gray-300 bg-white flex items-center justify-center relative overflow-hidden">
          <img src="/project_media/3d_printer/end_stop_assembly.webp" alt="Printer Frame Detail" className="w-full h-full object-contain" />
          <div className="absolute bottom-6 right-6 bg-dark-bg/50 backdrop-blur-sm px-4 py-2 rounded-full">
  <p className="text-white text-xl font-medium">End-Stop Mounting</p>
</div>
        </div>
        
        {/* Full Assembly - Bottom Middle */}
        <div className="col-span-5 row-span-4 rounded-2xl border-[1px] border-gray-300 bg-white flex items-center justify-center relative overflow-hidden">
          <img src="/project_media/3d_printer/full_assembly.webp" alt="Full Assembly" className="w-full h-full object-contain" />
          <div className="absolute bottom-6 right-6 bg-dark-bg/50 backdrop-blur-sm px-4 py-2 rounded-full">
  <p className="text-white text-xl font-medium">Full Assembly</p>
</div>
        </div>
        
        {/* Pulley Hub - Bottom Right */}
        <div className="col-span-4 row-span-3 rounded-2xl border-[1px] border-gray-300 bg-white flex items-center justify-center relative overflow-hidden">
          <img src="/project_media/3d_printer/pulley_hub.webp" alt="Pulley Hub" className="w-full h-full object-contain" />
          <div className="absolute bottom-6 right-6 bg-dark-bg/50 backdrop-blur-sm px-4 py-2 rounded-full">
  <p className="text-white text-xl font-medium">Pulley Hub</p>
</div>
        </div>
      </div>
    </main>
  </section>
  );
};
