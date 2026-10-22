import Image from "next/image";

// Copy from the engineering résumé only. Ansh is adding shop photos later: set `image` on a row
// (public/project_media/3d_printer/…) and it renders beside the text.
const processes: { title: string; body: string; image?: { src: string; alt: string; w: number; h: number } }[] = [
  {
    title: "Lathe-Turned Shafts",
    body: "I turned the flanged shafts on a lathe, and ran a tolerance analysis on the shaft, retaining-clip and hole fits.",
  },
  {
    title: "Sheet Metal",
    body: "Laser-cut sheet-metal parts, bent to shape on a press brake.",
  },
  {
    title: "FDM Parts",
    body: "FDM-printed parts used across the build.",
  },
];

export function PrinterManufacturing() {
  return (
    <>
      <section className="flex h-svh w-full items-center bg-[url(/project_media/3d_printer/3d_printer_render.webp)] bg-cover bg-center">
        <div className="mx-auto w-full max-w-[1440px] px-6 landscape:py-20">
          <h2 className="text-5xl font-semibold text-[#F8F8F8] md:text-7xl">Manufacturing</h2>
        </div>
      </section>

      <section id="printer_manufacturing" className="w-full bg-[#1B1B1B]">
        <ol className="mx-auto w-full max-w-[1440px] px-6 py-16 lg:px-20 lg:py-20">
          {processes.map((p, i) => (
            <li
              key={p.title}
              className={`flex flex-col gap-4 py-10 lg:flex-row lg:gap-8 ${i > 0 ? "border-t border-[#3D3C3A]" : ""}`}
            >
              <span className="text-xl font-medium text-[#8D8D8D] lg:w-24">0{i + 1}</span>
              <h3 className="text-3xl font-medium text-[#F8F8F8] md:text-4xl lg:w-[35%]">{p.title}</h3>
              <div className="flex flex-1 flex-col gap-6">
                <p className="max-w-[60ch] text-lg text-[#F8F8F8]/80 md:text-xl">{p.body}</p>
                {p.image && (
                  <Image
                    src={p.image.src}
                    alt={p.image.alt}
                    width={p.image.w}
                    height={p.image.h}
                    className="h-auto w-full rounded-xl"
                  />
                )}
              </div>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
