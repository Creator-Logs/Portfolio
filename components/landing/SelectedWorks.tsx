"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import { ChapterHeader } from "@/components/ui/ChapterHeader";
import { ProgressCounter } from "@/components/ui/ProgressCounter";
import { SpecLine } from "@/components/ui/SpecLine";
import { ToolChips } from "@/components/ui/ToolChips";
import { projects, type Project } from "@/content/projects";
import { trinkets } from "@/content/trinkets";
import { useScrollProgress } from "@/hooks/useScrollProgress";

// Selected works (landing.md §4): Badge Factory chapter rows, one per project, dotted rules between.
// Media is a still: a light-studio Cycles product render (scripts/renders/) or, for software, a
// screenshot; hover only zooms it slightly (Ansh: no live 3D in the list). A bottom progress counter
// tracks the row.

const pad = (n: number) => String(n).padStart(2, "0");

export function SelectedWorks() {
  const section = useRef<HTMLElement>(null);
  const rows = useRef<(HTMLLIElement | null)[]>([]);
  const line = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);
  const [inView, setInView] = useState(false);

  useScrollProgress(
    section,
    useCallback((p: number) => {
      if (line.current) line.current.style.width = `${p * 100}%`;
      // Counter shows while the list covers mid-screen; current row = the one under mid-screen.
      // (Computed here, not with IntersectionObserver, so jumps/anchor links can't leave it stale.)
      const mid = window.innerHeight / 2;
      const r = section.current!.getBoundingClientRect();
      setInView(r.top < mid && r.bottom > mid);
      const i = rows.current.findIndex((row) => {
        const b = row?.getBoundingClientRect();
        return b && b.top <= mid && b.bottom > mid;
      });
      if (i >= 0) setCurrent(i);
    }, []),
  );

  return (
    <section id="work" ref={section} className="px-page py-24 md:py-32" aria-labelledby="work-heading">
      <ChapterHeader eyebrow="Selected works" lines={["Selected", "works."]} accentLast />
      <span id="work-heading" className="sr-only">
        Selected works
      </span>
      <ol className="mt-12 md:mt-16">
        {projects.map((p, i) => (
          <li
            key={p.slug}
            ref={(el) => {
              rows.current[i] = el;
            }}
            className="rule-dotted"
          >
            <Link
              href={`/projects/${p.slug}`}
              className="group grid gap-5 py-8 md:grid-cols-[6rem_minmax(0,1fr)_20rem_2rem] md:items-center md:gap-8 md:py-10"
            >
              <span className="type-label hidden text-grey-brown md:block">
                <span className="text-cream">{pad(p.order)}</span> / {pad(projects.length)}
              </span>
              <div className="order-2 md:order-none">
                <p className="type-label text-grey-brown">
                  <span className="text-cream md:hidden">{pad(p.order)} / </span>
                  {p.category} · {p.period}
                  {p.status === "in-progress" && (
                    <span className="ml-3 rounded-full border border-orange px-2 py-0.5 text-orange">In progress</span>
                  )}
                </p>
                <h3 className="type-h2 mt-3 transition-transform duration-300 ease-out-expo md:group-hover:translate-x-3">
                  {p.title}
                </h3>
                <p className="type-body2 mt-3 max-w-[52ch] text-cream-dim">{p.subtitle}</p>
                <SpecLine className="mt-4">{p.specLine}</SpecLine>
                <ToolChips tools={p.tools} className="mt-4" />
              </div>
              <RowMedia project={p} />
              <span
                aria-hidden
                className="hidden text-2xl text-orange opacity-0 transition-[opacity,transform] duration-300 ease-out-expo group-hover:translate-x-1 group-hover:opacity-100 md:block"
              >
                →
              </span>
            </Link>
          </li>
        ))}
      </ol>
      <ProgressCounter ref={line} label={projects[current].title} index={current + 1} total={projects.length} visible={inView} />
    </section>
  );
}

function RowMedia({ project }: { project: Project }) {
  const def = trinkets.find((t) => t.slug === project.slug);
  // Product renders sit on a light studio sweep: the box carries the same cream so object-cover crops blend.
  const box = "order-1 relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-brown md:order-none";
  if (!project.poster) {
    return (
      <div className={`${box} grid place-items-center bg-ink-2`}>
        <span className="type-label text-grey-brown">Media coming soon</span>
      </div>
    );
  }
  const isScreenshot = !def || def.kind === "monitor";
  return (
    <div className={`${box} ${isScreenshot ? "bg-ink-2" : "bg-studio-warm"}`}>
      <Image
        src={project.poster}
        alt={project.title}
        fill
        quality={90}
        sizes="(max-width: 767px) 100vw, 20rem"
        className={`object-cover ${isScreenshot ? "object-left-top" : ""} transition-transform duration-500 ease-out-expo md:group-hover:scale-[1.03]`}
      />
    </div>
  );
}
