"use client";

import Image from "next/image";
import Link from "next/link";
import { lazy, useCallback, useEffect, useRef, useState } from "react";
import { SceneBlock } from "@/components/three/SceneBlock";
import { ChapterHeader } from "@/components/ui/ChapterHeader";
import { ProgressCounter } from "@/components/ui/ProgressCounter";
import { SpecLine } from "@/components/ui/SpecLine";
import { ToolChips } from "@/components/ui/ToolChips";
import { projects, type Project } from "@/content/projects";
import { trinkets } from "@/content/trinkets";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useScrollProgress } from "@/hooks/useScrollProgress";

// Selected works (landing.md §4): Badge Factory chapter rows, one per project, dotted rules between.
// Media is a still poster; on desktop hover the row's model spins up in its place (only one live 3D
// thumbnail at a time — the printer alone is 1.16M triangles). A bottom progress counter tracks the row.
const WorkSpinScene = lazy(() => import("./WorkSpinScene"));

const pad = (n: number) => String(n).padStart(2, "0");

export function SelectedWorks() {
  const section = useRef<HTMLElement>(null);
  const rows = useRef<(HTMLLIElement | null)[]>([]);
  const line = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);
  const [hovered, setHovered] = useState<string | null>(null);
  const mobile = useIsMobile();
  const [inView, setInView] = useState(false);
  const lastScroll = useRef(0);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useScrollProgress(
    section,
    useCallback((p: number) => {
      lastScroll.current = performance.now();
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

  // Hover intent: rows scrolling under a resting cursor also get mouseenter — mounting live 3D then
  // stalled scrolling (measured 742 ms). Only go live after the pointer rests 250 ms with no scrolling.
  const enter = (slug: string) => {
    clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => {
      if (performance.now() - lastScroll.current > 200) setHovered(slug);
    }, 250);
  };
  const leave = (slug: string) => {
    clearTimeout(hoverTimer.current);
    setHovered((h) => (h === slug ? null : h));
  };
  useEffect(() => () => clearTimeout(hoverTimer.current), []);


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
              onMouseEnter={() => enter(p.slug)}
              onMouseMove={() => hovered !== p.slug && enter(p.slug)}
              onMouseLeave={() => leave(p.slug)}
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
              <RowMedia project={p} live={hovered === p.slug && !mobile} />
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

function RowMedia({ project, live }: { project: Project; live: boolean }) {
  const def = trinkets.find((t) => t.slug === project.slug);
  // No background on boxes that can hold 3D: page DOM sits *above* the shared canvas, so an opaque
  // background would hide the model (3D_GUIDE §7b rule 26). Posters carry their own dark background.
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
    <div className={box}>
      {live && def ? (
        <SceneBlock animate poster={project.poster} posterAlt={project.title} className="h-full w-full">
          <WorkSpinScene def={def} />
        </SceneBlock>
      ) : (
        <Image
          src={project.poster}
          alt={project.title}
          fill
          sizes="(max-width: 767px) 100vw, 20rem"
          className={`${isScreenshot ? "object-cover object-left-top" : "object-contain"} transition-transform duration-500 ease-out-expo md:group-hover:scale-[1.03]`}
        />
      )}
    </div>
  );
}
