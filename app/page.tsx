import { ChapterHeader } from "@/components/ui/ChapterHeader";
import { SpecLine } from "@/components/ui/SpecLine";
import { PillButton } from "@/components/ui/PillButton";
import { site } from "@/content/site";
import { projects } from "@/content/projects";
import { HeroScene } from "@/components/landing/HeroScene";
import { ScrollCue } from "@/components/ui/ScrollCue";
import { Showcase } from "@/components/landing/Showcase";

// Phase 1 shell: every landing section exists with its anchor and final typography,
// and gets its real content/3D in the phase noted in each placeholder.
const placeholders = [
  { id: "tapcarry", eyebrow: "Software · Founding engineer · Phase 7", lines: ["TapCarry"] },
  { id: "bench", eyebrow: "Everything on the bench · Phase 9", lines: ["The toolchain"] },
  { id: "experience", eyebrow: "Experience · Phase 10", lines: ["Where I build"] },
];

export default function Home() {
  return (
    <main>
      <section id="intro" className="relative min-h-svh overflow-hidden">
        {/* The mat fills the hero; type sits on top and lets pointer events through to the models. */}
        <HeroScene className="!absolute inset-0" />
        <div className="px-page pointer-events-none relative z-10 flex min-h-svh flex-col justify-between pb-8 pt-24 md:pb-10 md:pt-28">
          <div>
            <p className="type-label max-w-[46ch] text-cream/70">{site.tagline}</p>
            <h1 className="type-h1 mt-4">
              <span className="block">Ansh</span>
              <span className="block">Gupta</span>
            </h1>
          </div>
          <div className="flex items-end justify-between gap-6">
            <div className="glass pointer-events-auto flex max-w-md items-center gap-4 rounded-xl bg-ink/60 p-4">
              {/* Portrait slot — swap for next/image once Ansh provides the photo. */}
              <div
                role="img"
                aria-label={`Photo of ${site.name} (placeholder)`}
                className="type-label grid aspect-[4/5] w-16 shrink-0 place-items-center rounded-lg border border-dashed border-grey-brown text-grey-brown md:w-24"
              >
                Photo
              </div>
              <div>
                <p className="type-label text-orange">{site.location}</p>
                <p className="type-body2 mt-2 text-cream-dim">{site.intro}</p>
              </div>
            </div>
            <ScrollCue className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 md:flex" />
          </div>
        </div>
      </section>

      <Showcase />

      {placeholders.slice(0, 1).map((s) => (
        <PlaceholderSection key={s.id} {...s} />
      ))}

      <section id="work" className="px-page py-24">
        <ChapterHeader eyebrow="Selected works · Phase 8" lines={["Selected", "works."]} accentLast />
        <ol className="mt-12">
          {projects.map((p) => (
            <li key={p.slug} className="rule-dotted grid gap-2 py-6 md:grid-cols-[8rem_1fr_auto] md:items-baseline">
              <span className="type-label text-grey-brown">
                {String(p.order).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}
              </span>
              <div>
                <h3 className="type-h3">{p.title}</h3>
                <SpecLine className="mt-2">{p.specLine}</SpecLine>
              </div>
              <span className="type-label text-grey-brown">{p.period}</span>
            </li>
          ))}
        </ol>
      </section>

      {placeholders.slice(1).map((s) => (
        <PlaceholderSection key={s.id} {...s} />
      ))}

      <section id="contact" className="px-page flex min-h-[70svh] flex-col justify-center gap-8 py-24">
        <h2 className="type-h1">
          <span className="block">Got an idea?</span>
          <span className="block text-orange">Let&apos;s build it.</span>
        </h2>
        <div>
          <PillButton href={`mailto:${site.email}`}>Email me</PillButton>
        </div>
      </section>
    </main>
  );
}

function PlaceholderSection({ id, eyebrow, lines }: { id: string; eyebrow: string; lines: string[] }) {
  return (
    <section id={id} className="px-page flex min-h-[80svh] items-center border-t border-dotted border-brown py-24">
      <ChapterHeader eyebrow={eyebrow} lines={lines} accentLast={lines.length > 1} />
    </section>
  );
}
