import Image from "next/image";
import { CoreXYDemo } from "./CoreXYDemo";

export function CoreXY() {
  return (
    <section id="core_xy" data-nav-theme="light" className="w-full bg-studio-2">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-6 py-16 landscape:py-20">
        <div className="flex flex-col gap-8 lg:flex-row lg:justify-between">
          <div className="text-[#2F2E2B] lg:w-[40%]">
            <h3 className="py-4 text-4xl font-medium md:text-5xl lg:pt-12">Core XY Mechanism</h3>
            <p className="text-lg md:text-xl">
              I chose the Core-XY motion system over the standard Cartesian design because it provides greater
              stability since the motors are stationary. It further provides more efficient motor load distribution,
              and a more space-efficient layout, allowing for a larger build volume within a compact frame.
            </p>
            <h3 className="py-4 pt-12 text-4xl font-medium md:text-5xl lg:pt-16">How it Works</h3>
            {/* v1 had the motor behaviour backwards; corrected with Ansh's OK (2026-10-22). */}
            <p className="text-lg md:text-xl">
              A Core-XY system uses two motors and crossed belts to move a carriage in the X and Y directions. Turning
              one motor alone moves the carriage diagonally; turning both together moves it straight along X, and in
              opposite directions straight along Y. This setup keeps the motors stationary, reducing moving mass and
              allowing faster, more precise motion.
            </p>
          </div>
          <Image
            src="/project_media/3d_printer/core_xy_image.webp"
            alt="Top-down render of the Core-XY gantry"
            width={703}
            height={653}
            className="h-auto w-full object-contain mix-blend-darken lg:w-auto"
          />
        </div>

        <CoreXYDemo />
      </div>
    </section>
  );
}
