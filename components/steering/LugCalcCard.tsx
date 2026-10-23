import Image from "next/image";
import { lugCalc as c } from "@/content/steering-wheel";

// Chapter 02 calc card (fsae-steering-wheel.md §4): Ansh's lug hand calc, re-typeset. Every result is derived
// here from the inputs in content/steering-wheel.ts — nothing hand-typed — next to a thumbnail of the original.

const bolt = c.torqueLbfIn / (c.boltRadiusIn * c.bolts); // lbf per bolt
const edge = (c.lugWidthIn - c.holeDiaIn) / 2;
const modes = [
  {
    name: "Net-section tension",
    formula: "A = (w − d) · t",
    area: (c.lugWidthIn - c.holeDiaIn) * c.lugThicknessIn,
  },
  {
    name: "Shear tear-out, 2 planes",
    formula: "A = 2 · a · t",
    area: 2 * edge * c.lugThicknessIn,
  },
  {
    name: "Bearing",
    formula: "A = D · t",
    area: c.boltDiaIn * c.lugThicknessIn,
  },
].map((m) => ({ ...m, stress: bolt / m.area, fos: c.yieldPsi / (bolt / m.area) }));

const n = (x: number, digits = 0) => x.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });

export function LugCalcCard() {
  return (
    <div className="grid gap-8 md:grid-cols-16 md:gap-x-6">
      <div className="rounded-xl border border-brown bg-ink-2 p-6 md:col-span-10 md:p-8">
        <p className="type-label text-grey-brown">Hand calc · one lug of the standoff</p>

        <p className="type-label mt-6 text-grey-brown">Load path</p>
        <p className="type-h4 mt-2 text-cream">
          {c.torqueLbfIn} lbf·in ÷ ({c.boltRadiusIn} in × {c.bolts} bolts) = <span className="text-orange">{n(bolt)} lbf</span> per bolt
        </p>

        <dl className="type-label mt-6 grid grid-cols-2 gap-x-6 gap-y-1 text-grey-brown sm:grid-cols-3">
          {[
            ["Hole d", `${c.holeDiaIn}"`],
            ["Bolt D", `${c.boltDiaIn}"`],
            ["Lug t", `${c.lugThicknessIn}"`],
            ["Lug w", `${c.lugWidthIn}"`],
            ["Edge a = (w − d)/2", `${n(edge, 4)}"`],
            ["Yield (7075-T6)", `${n(c.yieldPsi)} psi`],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-3">
              <dt>{k}</dt>
              <dd className="text-cream tabular-nums">{v}</dd>
            </div>
          ))}
        </dl>

        <table className="mt-8 w-full border-collapse text-left">
          <thead>
            <tr className="type-label text-grey-brown">
              <th className="pb-2 font-normal">Failure mode</th>
              <th className="pb-2 text-right font-normal">Area</th>
              <th className="pb-2 text-right font-normal">Stress</th>
              <th className="pb-2 text-right font-normal">FoS</th>
            </tr>
          </thead>
          <tbody>
            {modes.map((m) => (
              <tr key={m.name} className="rule-dotted">
                <td className="py-3">
                  <span className="type-body2 block text-cream">{m.name}</span>
                  <span className="type-label text-grey-brown">{m.formula}</span>
                </td>
                <td className="type-label py-3 text-right text-cream tabular-nums">{n(m.area, 3)} in²</td>
                <td className="type-label py-3 text-right text-cream tabular-nums">{n(m.stress)} psi</td>
                <td className="type-h4 py-3 text-right text-orange tabular-nums">{n(m.fos, 1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <figure className="md:col-span-5 md:col-start-12 md:self-end">
        <a href={c.photo.src} target="_blank" rel="noreferrer" className="block">
          <Image
            src={c.photo.src}
            alt="Ansh's handwritten lug calculation: torque per bolt, net-section tension, shear tear-out and bearing"
            width={c.photo.w}
            height={c.photo.h}
            sizes="(max-width: 767px) 100vw, 30vw"
            className="h-auto w-full rounded-xl"
          />
        </a>
        <figcaption className="type-label mt-3 text-grey-brown">{c.photo.caption} ↗</figcaption>
      </figure>
    </div>
  );
}
