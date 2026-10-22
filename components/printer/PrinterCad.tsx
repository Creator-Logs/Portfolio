import Image from "next/image";

// v1 bento (12 × 8 grid) from lg up; mobile stacks 1 → 2 columns.
const tiles = [
  { src: "printer_frame.webp", w: 413, h: 386, label: "Printer Frame", span: "lg:col-span-4 lg:row-span-4" },
  { src: "z_assembly.webp", w: 407, h: 384, label: "Z-Axis Assembly", span: "lg:col-span-4 lg:row-span-4" },
  { src: "extruder.webp", w: 375, h: 480, label: "Extruder & Hotend", span: "lg:col-span-4 lg:row-span-5" },
  { src: "end_stop_assembly.webp", w: 311, h: 423, label: "End-Stop Mounting", span: "lg:col-span-3 lg:row-span-4" },
  { src: "full_assembly.webp", w: 510, h: 423, label: "Full Assembly", span: "lg:col-span-5 lg:row-span-4" },
  { src: "pulley_hub.webp", w: 374, h: 324, label: "Pulley Hub", span: "lg:col-span-4 lg:row-span-3" },
];

export function PrinterCad() {
  return (
    <section id="printer_cad" data-nav-theme="light" className="w-full bg-studio-3">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-6 pb-16 lg:px-20 lg:py-20">
        <h2 className="py-4 text-4xl font-medium text-studio-ink md:text-5xl">CAD Overview</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-12 lg:grid-rows-8">
          {tiles.map((t) => (
            <figure
              key={t.src}
              className={`relative flex items-center justify-center overflow-hidden rounded-2xl border border-gray-300 bg-white ${t.span}`}
            >
              <Image
                src={`/project_media/3d_printer/${t.src}`}
                alt={t.label}
                width={t.w}
                height={t.h}
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="h-auto max-h-[420px] w-full object-contain lg:h-full lg:max-h-none"
              />
              <figcaption className="absolute bottom-4 right-4 rounded-full bg-[#1B1B1B]/50 px-4 py-2 text-base font-medium text-white backdrop-blur-sm lg:bottom-6 lg:right-6 lg:text-xl">
                {t.label}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
