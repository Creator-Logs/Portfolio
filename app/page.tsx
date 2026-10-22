import { ChapterHeader } from "@/components/ui/ChapterHeader";
import { SpecLine } from "@/components/ui/SpecLine";
import { PillButton } from "@/components/ui/PillButton";
import { site } from "@/content/site";
import { projects } from "@/content/projects";

// Phase 1 shell: every landing section exists with its anchor and final typography,
// and gets its real content/3D in the phase noted in each placeholder.
const placeholders = [
  { id: "about", eyebrow: "Pinned showcase · Phase 6", lines: ["Built,", "not just drawn."] },
  { id: "tapcarry", eyebrow: "Software · Founding engineer · Phase 7", lines: ["TapCarry"] },
  { id: "bench", eyebrow: "Everything on the bench · Phase 9", lines: ["The toolchain"] },
  { id: "experience", eyebrow: "Experience · Phase 10", lines: ["Where I build"] },
];

export default function Home() {
  return (
    <main>
      <section id="intro" className="px-page relative flex min-h-svh flex-col justify-between pb-10 pt-28 md:pt-32">
        <div>
          <p className="type-label max-w-[46ch] text-grey-brown">{site.tagline}</p>
          <h1 className="type-h1 mt-4">
            <span className="block">Ansh</span>
            <span className="block">Gupta</span>
          </h1>
        </div>
        <div className="glass flex max-w-md items-center gap-4 rounded-xl p-4">
          {/* Portrait slot — swap for next/image once Ansh provides the photo. */}
          <div
            role="img"
            aria-label={`Photo of ${site.name} (placeholder)`}
            className="type-label grid aspect-[4/5] w-20 shrink-0 place-items-center rounded-lg border border-dashed border-grey-brown text-grey-brown md:w-24"
          >
            Photo
          </div>
          <div>
            <p className="type-label text-orange">Hero mat · Phase 4</p>
            <p className="type-body2 mt-2 text-cream-dim">{site.intro}</p>
          </div>
        </div>
      </section>

      {placeholders.slice(0, 2).map((s) => (
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

      {placeholders.slice(2).map((s) => (
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
