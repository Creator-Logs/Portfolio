import Link from "next/link";
import { PillButton } from "@/components/ui/PillButton";
import { SpecLine } from "@/components/ui/SpecLine";
import { getProject, type ProjectSlug } from "@/content/projects";

// DESIGN.md §5 Next project: the ending of every project page.
export function NextProject({ slug }: { slug: ProjectSlug }) {
  const p = getProject(slug)!;
  const href = `/projects/${p.slug}`;
  return (
    <section className="px-page py-24 md:py-32" aria-label="Next project">
      <div className="rule-dotted flex flex-col gap-6 pt-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="type-label text-grey-brown">Next project</p>
          <Link href={href} className="type-h2 mt-4 block hover:text-orange">
            {p.title}
          </Link>
          <SpecLine className="mt-4">{p.specLine}</SpecLine>
        </div>
        <PillButton href={href}>See the build →</PillButton>
      </div>
    </section>
  );
}
