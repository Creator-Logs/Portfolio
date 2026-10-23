import { ChapterHeader } from "@/components/ui/ChapterHeader";
import { Figure } from "@/components/ui/Figure";
import { landed } from "@/content/steering-wheel";

// Chapter 05 / WHERE IT LANDED (fsae-steering-wheel.md §7): honest result + what I'd change.
export function WhereItLanded() {
  const { onCar, plate, lesson } = landed;
  return (
    <section id="landed" className="px-page py-24 md:py-32" aria-label="Where it landed">
      <div className="grid gap-8 md:grid-cols-16 md:gap-x-6">
        <ChapterHeader number="05" eyebrow="Where it landed" lines={landed.lines} accentLast className="md:col-span-7" />
        <p className="type-body2 max-w-[44ch] self-end text-cream-dim md:col-span-6 md:col-start-10">{landed.body}</p>
      </div>

      <div className="mt-16 grid gap-8 md:grid-cols-16 md:gap-x-6">
        <Figure {...onCar} sizes="(max-width: 767px) 100vw, 50vw" className="md:col-span-8" />
        <Figure {...plate} sizes="(max-width: 767px) 100vw, 33vw" className="md:col-span-6 md:col-start-11 md:self-end" />
      </div>

      <div className="rule-dotted mt-20 grid gap-8 pt-8 md:grid-cols-16 md:gap-x-6">
        <div className="md:col-span-6">
          <h3 className="type-h3 text-orange">{lesson.title}</h3>
          <p className="type-body2 mt-6 max-w-[44ch] text-cream">{lesson.body}</p>
          <p className="type-body2 mt-8 max-w-[44ch] text-grey-brown">{landed.next}</p>
        </div>
        <Figure {...lesson.photo} sizes="(max-width: 767px) 100vw, 50vw" className="md:col-span-8 md:col-start-9" />
      </div>
    </section>
  );
}
