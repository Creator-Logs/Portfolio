import { PillButton } from "@/components/ui/PillButton";
import { site } from "@/content/site";
import { HeroScene } from "@/components/landing/HeroScene";
import { ScrollCue } from "@/components/ui/ScrollCue";
import { Showcase } from "@/components/landing/Showcase";
import { SelectedWorks } from "@/components/landing/SelectedWorks";
import { Bench } from "@/components/landing/Bench";
import { Experience } from "@/components/landing/Experience";

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

      <SelectedWorks />
      <Bench />

      <Experience />

      <section id="contact" className="px-page flex min-h-[80svh] flex-col justify-center gap-10 py-24" aria-labelledby="contact-heading">
        <p className="type-label text-grey-brown">Contact</p>
        <h2 id="contact-heading" className="type-h1">
          <span className="block">Got an idea?</span>
          <span className="block text-orange">Let&apos;s build it.</span>
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          <PillButton href={`mailto:${site.email}`}>Email me</PillButton>
          <PillButton href={site.links.linkedin} variant="ink" target="_blank" rel="noreferrer">
            LinkedIn ↗
          </PillButton>
          <PillButton href={site.links.github} variant="ink" target="_blank" rel="noreferrer">
            GitHub ↗
          </PillButton>
        </div>
        <p className="type-label text-grey-brown">{site.email}</p>
      </section>
    </main>
  );
}
