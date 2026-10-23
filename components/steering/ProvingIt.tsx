import { FeaViewer } from "./FeaViewer";
import { ChapterHeader } from "@/components/ui/ChapterHeader";
import { provingIt } from "@/content/steering-wheel";

// Chapter 02 / PROVING IT (fsae-steering-wheel.md §4): the interactive Ansys result. (Lug calc card removed, Ansh 2026-10-22.)
export function ProvingIt() {
  return (
    <section id="proving-it" className="px-page py-24 md:py-32" aria-label="Proving it">
      <div className="grid gap-8 md:grid-cols-16 md:gap-x-6">
        <ChapterHeader number="02" eyebrow="Proving it" lines={provingIt.lines} accentLast className="md:col-span-7" />
        <p className="type-body2 max-w-[44ch] self-end text-cream-dim md:col-span-6 md:col-start-10">{provingIt.body}</p>
      </div>
      <p className="type-body2 mt-16 max-w-[60ch] text-cream-dim">{provingIt.feaIntro}</p>
      <div className="mt-10">
        <FeaViewer />
      </div>
    </section>
  );
}
