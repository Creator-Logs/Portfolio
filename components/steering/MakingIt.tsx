import { ChapterHeader } from "@/components/ui/ChapterHeader";
import { Figure } from "@/components/ui/Figure";
import { SpecLine } from "@/components/ui/SpecLine";
import { making } from "@/content/steering-wheel";
import { WaterjetPath } from "./WaterjetPath";

// Chapter 04 / MAKING IT (fsae-steering-wheel.md §6): CNC loop + finished standoffs; the waterjet cut file drawing
// itself. (No drawings strip — Ansh 2026-10-22.)
export function MakingIt() {
  const { cnc, waterjet } = making;
  return (
    <section id="making" className="px-page py-24 md:py-32" aria-label="Making it">
      <ChapterHeader number="04" eyebrow="Making it" lines={making.lines} accentLast />

      <div className="mt-16 grid gap-8 md:grid-cols-16 md:gap-x-6">
        <div className="md:col-span-5">
          <h3 className="type-h4 text-cream">{cnc.title}</h3>
          <p className="type-body2 mt-4 max-w-[40ch] text-cream-dim">{cnc.body}</p>
        </div>
        <Figure video={cnc.video} caption={cnc.caption} className="md:col-span-6 md:col-start-7" />
        <Figure
          src={cnc.photo.src}
          w={cnc.photo.w}
          h={cnc.photo.h}
          caption={cnc.photo.caption}
          sizes="(max-width: 767px) 100vw, 25vw"
          className="md:col-span-4 md:col-start-13 md:self-end"
        />
      </div>

      {/* pinned: the cut file stays on screen while it draws, then the page moves on (Ansh 2026-10-22) */}
      <WaterjetPath>
        <div className="rule-dotted grid gap-4 pt-6 md:grid-cols-16 md:gap-x-6">
          <h3 className="type-h4 text-cream md:col-span-5">{waterjet.title}</h3>
          <div className="md:col-span-8 md:col-start-7">
            <SpecLine>{waterjet.spec}</SpecLine>
            <p className="type-body2 mt-3 max-w-[48ch] text-cream-dim">{waterjet.body}</p>
          </div>
        </div>
      </WaterjetPath>
    </section>
  );
}
