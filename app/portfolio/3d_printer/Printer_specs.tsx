import React from "react";
import Image from "next/image";

export const PrinterSpecs: React.FC = () => {
  return (
    <section
      id="printer_specs"
      className="px-12 py-10 mx-auto landscape:px-20 landscape:py-20
      w-screen h-screen flex bg-light-bg justify-between"
    >
      <div className="h-full">
        <h2 className="text-light-text text-5xl font-medium ">
          Design Specifications
        </h2>
        <div className="pt-12">
          <p className="text-light-gray text-xl font-medium">Motion System</p>
          <p className="text-light-text text-4xl font-medium">Core-XY</p>
          <div className="border-b pt-6 border-dark-textSec"></div>
        </div>
        <div className="pt-6">
          <p className="text-light-gray text-xl font-medium">Frame Material</p>
          <p className="text-light-text text-4xl font-medium">
            2020 T-Slot Aluminium Extrusions
          </p>
          <div className="border-b pt-6 border-dark-textSec"></div>
        </div>
        <div className="pt-6">
          <p className="text-light-gray text-xl font-medium">
            X, Y Axis Driving Mechanism
          </p>
          <p className="text-light-text text-4xl font-medium">
            GT2 Pulleys & 6mm Timing Belts
          </p>
          <div className="border-b pt-6 border-dark-textSec"></div>
        </div>
        <div className="pt-6">
          <p className="text-light-gray text-xl font-medium">
            Z Axis Driving Mechanism
          </p>
          <p className="text-light-text text-4xl font-medium">
            Lead Screw & Nut
          </p>
          <div className="border-b pt-6 border-dark-textSec"></div>
        </div>
        <div className="pt-6">
          <p className="text-light-gray text-xl font-medium">
            Motion Guiding Mechanism{" "}
          </p>
          <p className="text-light-text text-4xl font-medium">
            Linear Bearings & Smooth Rods
          </p>
          <div className="border-b pt-6 border-dark-textSec"></div>
        </div>
        <div className="pt-6">
          <p className="text-light-gray text-xl font-medium">Voltage & Power</p>
          <p className="text-light-text text-4xl font-medium">24 V / 350 W</p>
        </div>
      </div>
      <div className="h-full flex flex-col items-center mix-blend-multiply">
        <Image
          src="/project_media/3d_printer/printer_isometric.webp"
          alt="3d_printer_isometric"
          priority
          width={600}
          height={610}
        />
        <div className="flex">
          <div className="pr-32">
            <p className="py-2 text-light-gray text-xl font-medium">
              Build Volume
            </p>
            <div className="flex">
              <div className="pr-4">
                <p className="text-light-text text-xl font-medium">Width</p>
                <p className="text-light-text text-xl font-medium">Depth</p>
                <p className="text-light-text text-xl font-medium">Height</p>
              </div>
              <div>
                <p className="text-light-text text-xl font-medium">200 mm</p>
                <p className="text-light-text text-xl font-medium">185 mm</p>
                <p className="text-light-text text-xl font-medium">160 mm</p>
              </div>
            </div>
          </div>
          <div>
            <p className="py-2 text-light-gray text-xl font-medium">
              Physical Dimensions
            </p>
            <div className="flex">
              <div className="pr-4">
                <p className="text-light-text text-xl font-medium">Width</p>
                <p className="text-light-text text-xl font-medium">Depth</p>
                <p className="text-light-text text-xl font-medium">Height</p>
              </div>
              <div>
                <p className="text-light-text text-xl font-medium">389 mm</p>
                <p className="text-light-text text-xl font-medium">410 mm</p>
                <p className="text-light-text text-xl font-medium">409 mm</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
