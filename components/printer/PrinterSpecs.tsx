import Image from "next/image";

const specs = [
  { label: "Motion System", value: "Core-XY" },
  { label: "Frame Material", value: "2020 T-Slot Aluminium Extrusions" },
  { label: "X, Y Axis Driving Mechanism", value: "GT2 Pulleys & 6mm Timing Belts" },
  { label: "Z Axis Driving Mechanism", value: "Lead Screw & Nut" },
  { label: "Motion Guiding Mechanism", value: "Linear Bearings & Smooth Rods" },
  { label: "Voltage & Power", value: "24 V / 350 W" },
];

// Build volume as on v1 (Ansh, 2026-10-22; résumé being corrected to match).
const tables = [
  { title: "Build Volume", rows: [["Width", "200 mm"], ["Depth", "185 mm"], ["Height", "160 mm"]] },
  { title: "Physical Dimensions", rows: [["Width", "389 mm"], ["Depth", "410 mm"], ["Height", "409 mm"]] },
];

export function PrinterSpecs() {
  return (
    <section id="printer_specs" data-nav-theme="light" className="w-full bg-studio-3 lg:min-h-svh">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-12 px-6 py-16 lg:flex-row lg:justify-between lg:gap-8 lg:px-20 lg:py-20">
        <div>
          <h2 className="text-4xl font-medium text-studio-ink md:text-5xl">Design Specifications</h2>
          <dl>
            {specs.map((s, i) => (
              <div key={s.label} className={i === 0 ? "pt-12" : "pt-6"}>
                <dt className="text-lg font-medium text-[#BFBFBF] md:text-xl">{s.label}</dt>
                <dd className="text-2xl font-medium text-studio-ink md:text-4xl">{s.value}</dd>
                {i < specs.length - 1 && <div className="border-b border-[#8D8D8D] pt-6" />}
              </div>
            ))}
          </dl>
        </div>

        <div className="flex flex-col items-center mix-blend-multiply">
          <Image
            src="/project_media/3d_printer/printer_isometric.webp"
            alt="3d_printer_isometric"
            priority
            width={600}
            height={610}
            className="h-auto w-full max-w-[600px]"
          />
          <div className="flex gap-12 sm:gap-32">
            {tables.map((t) => (
              <div key={t.title}>
                <p className="py-2 text-lg font-medium text-[#BFBFBF] md:text-xl">{t.title}</p>
                <dl className="grid grid-cols-[auto_auto] gap-x-4 text-lg font-medium text-studio-ink md:text-xl">
                  {t.rows.map(([k, v]) => (
                    <div key={k} className="contents">
                      <dt>{k}</dt>
                      <dd>{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
