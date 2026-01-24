import React from "react";
import Link from "next/link";

export const PrinterHero: React.FC = () => {
  return (
    <section
      id="printer_hero"
      className="w-screen h-screen flex flex-col bg-[#D9D9D9]"
    >
      <div className="flex-1 flex flex-col bg-[url(/project_media/3d_printer/printer_hero_image_mobile.webp)] landscape:bg-[url(/project_media/3d_printer/printer_hero_image.webp)] bg-no-repeat bg-contain bg-bottom landscape:bg-cover landscape:bg-[20%_center] w-screen landscape:h-screen">
        <main className="w-full h-full flex-1 z-10 max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20 py-2 landscape:py-12  flex flex-col">
          <Link
            href="/"
            className="flex items-center gap-2 text-dark-bg hover:text-dark-textSec transition-all duration-300 hover:gap-3 group"
          >
            <svg
              className="w-6 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 28 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 19l-7-7m0 0l7-7m-7 7h26"
              />
            </svg>
            <span className="text-landscape">Back</span>
          </Link>
          <div className="flex-1 flex justify-center items-center landscape:justify-start">
            <div className="portrait:hidden w-[80%] xl:w-[70%]"></div>
            <div className="flex flex-col items-center landscape:items-start">
              <h1 className="text-5xl text-center landscape:text-left landscape:text-6xl font-semibold text-dark-light">
                3D Printer
              </h1>
              <div className="w-16 border-b-2 my-2 border-dark-light"></div>
              <p className="text-sm text-center landscape:text-left landscape:text-landscape text-dark-light">
                A Core-XY 3D Printer Build From Scratch
              </p>
              <p className="pt-8 text-center landscape:text-left landscape:pt-[8vh] text-landscape text-dark-light font-medium">
                Tools Used
              </p>
              <div className="mt-2 flex-1 flex">
                <div className="flex items-center justify-center bg-light-gray h-14 w-14 border border-light-textSec rounded-xl">
                  <img
                    src="/logos/Fusion360.svg"
                    alt="Fusion360 Logo"
                    className="w-10 h-10 object-contain"
                  ></img>
                </div>
                <div className="ml-2 flex items-center justify-center bg-light-gray h-14 w-14 border border-light-textSec rounded-xl">
                  <img
                    src="/logos/Blender.svg"
                    alt="Blender Logo"
                    className="w-10 h-10 object-contain"
                  ></img>
                </div>
              </div>
            </div>
          </div>
          <div className="h-[50%] md:h-[70%] landscape:h-0"></div>
        </main>
      </div>
    </section>
  );
};
