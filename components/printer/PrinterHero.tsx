import Image from "next/image";
import Link from "next/link";

const tools = [
  { src: "/logos/Fusion360.svg", alt: "Fusion360 Logo" },
  { src: "/logos/Blender.svg", alt: "Blender Logo" },
];

// Portrait shows the mobile render under the text; landscape puts the text right of the printer.
export function PrinterHero() {
  return (
    <section id="printer_hero" data-nav-theme="light" className="flex h-svh w-full flex-col bg-studio-1">
      <div className="flex w-full flex-1 flex-col bg-[url(/project_media/3d_printer/printer_hero_image_mobile.webp)] bg-contain bg-bottom bg-no-repeat landscape:h-svh landscape:bg-[url(/project_media/3d_printer/printer_hero_image.webp)] landscape:bg-cover landscape:bg-[20%_center]">
        {/* pt clears the fixed nav, which v1 didn't have. */}
        <div className="mx-auto flex h-full w-full max-w-[1440px] flex-1 flex-col px-6 pb-2 pt-14 md:px-12 lg:px-20 landscape:pb-12 landscape:pt-16">
          <Link
            href="/"
            className="flex w-fit items-center gap-2 text-[#1B1B1B] transition-all duration-300 hover:gap-3 hover:text-[#8D8D8D]"
          >
            <svg className="h-5 w-6" fill="none" stroke="currentColor" viewBox="0 0 28 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 19l-7-7m0 0l7-7m-7 7h26" />
            </svg>
            <span>Back</span>
          </Link>

          <div className="flex flex-1 items-center justify-center landscape:justify-start">
            <div className="w-[80%] portrait:hidden xl:w-[70%]" />
            <div className="flex flex-col items-center landscape:items-start">
              <h1 className="text-center text-5xl font-semibold text-[#3D3C3A] landscape:text-left landscape:text-6xl">
                3D Printer
              </h1>
              <div className="my-2 w-16 border-b-2 border-[#3D3C3A]" />
              <p className="text-center text-sm text-[#3D3C3A] landscape:text-left landscape:text-base">
                A Core-XY 3D Printer Build From Scratch
              </p>
              <p className="pt-8 text-center font-medium text-[#3D3C3A] landscape:pt-[8vh] landscape:text-left">
                Tools Used
              </p>
              <ul className="mt-2 flex gap-2" aria-label="Tools used">
                {tools.map((t) => (
                  <li
                    key={t.src}
                    className="flex size-14 items-center justify-center rounded-xl border border-studio-muted bg-[#BFBFBF]"
                  >
                    <Image src={t.src} alt={t.alt} width={40} height={40} className="size-10 object-contain" />
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="h-[50%] md:h-[70%] landscape:h-0" />
        </div>
      </div>
    </section>
  );
}
