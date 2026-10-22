// Temporary stub so landing links resolve. Each project session adds a static
// `app/projects/<slug>/page.tsx`, which takes precedence over this route; delete this
// file once all six exist.
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChapterHeader } from "@/components/ui/ChapterHeader";
import { SpecLine } from "@/components/ui/SpecLine";
import { getProject, projects } from "@/content/projects";

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export default async function ProjectStub({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  return (
    <main className="px-page flex min-h-svh flex-col justify-center gap-6 py-32">
      <ChapterHeader
        number={String(project.order).padStart(2, "0")}
        eyebrow={project.subtitle}
        lines={[project.title, "Coming soon."]}
        accentLast
        as="h1"
      />
      <SpecLine>{project.specLine}</SpecLine>
      <Link href="/#work" className="type-label text-grey-brown hover:text-orange">
        ← Back to work
      </Link>
    </main>
  );
}
