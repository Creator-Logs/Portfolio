import { ChapterHeader } from "@/components/ui/ChapterHeader";
import { Figure } from "@/components/ui/Figure";
import { grips } from "@/content/steering-wheel";

// Chapter 03 / SHAPED BY HANDS (fsae-steering-wheel.md §5): clay -> scan -> mesh -> print, one strip.
export function ShapedByHands() {
  return (
    <section id="grips" className="px-page py-24 md:py-32" aria-label="Shaped by hands">
      <div className="grid gap-8 md:grid-cols-16 md:gap-x-6">
        <ChapterHeader number="03" eyebrow="Shaped by hands" lines={grips.lines} accentLast className="md:col-span-7" />
        <p className="type-body2 max-w-[44ch] self-end text-cream-dim md:col-span-6 md:col-start-10">{grips.body}</p>
      </div>
      <ol className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        {grips.steps.map((s) => (
          <li key={s.label}>
            <p className="type-label mb-3 text-cream">{s.label}</p>
            {s.kind === "video" ? (
              <Figure video={s.src} caption={s.caption} />
            ) : (
              // portrait print photo cropped to the strip's 4:3 so the four steps line up
              <Figure
                src={s.src}
                w={s.w}
                h={s.h}
                caption={s.caption}
                sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 25vw"
                className="[&_img]:aspect-[4/3] [&_img]:object-cover"
              />
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
