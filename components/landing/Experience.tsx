import Link from "next/link";
import { ChapterHeader } from "@/components/ui/ChapterHeader";
import { experience } from "@/content/experience";

// Experience (landing.md §6): Oryzo-reviews style rows separated by dotted rules — org + role,
// one or two lines, mono dates, and a link to the related project where there is one.
export function Experience() {
  return (
    <section id="experience" className="px-page py-24 md:py-32" aria-labelledby="experience-heading">
      <ChapterHeader eyebrow="Experience" lines={["Where I", "build."]} accentLast />
      <span id="experience-heading" className="sr-only">
        Experience
      </span>
      <ol className="mt-12 md:mt-16">
        {experience.map((row) => (
          <li key={row.org} className="rule-dotted grid gap-3 py-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)_12rem] md:gap-10">
            <div>
              <h3 className="type-h3">{row.org}</h3>
              <p className="type-label mt-2 text-grey-brown">{row.role}</p>
            </div>
            <div>
              <p className="type-body2 max-w-[58ch] text-cream-dim">{row.summary}</p>
              {row.project && (
                <Link href={`/projects/${row.project}`} className="type-label mt-3 inline-block text-cream hover:text-orange">
                  See the project →
                </Link>
              )}
            </div>
            <p className="type-label text-grey-brown md:text-right">{row.dates}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
