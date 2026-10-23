"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChapterHeader } from "@/components/ui/ChapterHeader";
import { getProject } from "@/content/projects";
import { skillGroups, type Skill } from "@/content/skills";
import { useReducedMotion } from "@/hooks/useReducedMotion";

// "Everything on the bench" (landing.md §5, Ansh: 2D tiles with tilt). The toolchain laid out on a
// CSS cutting mat (same grid as the hero mat); tiles tilt toward the cursor and open a "Used in" card.
// No 3D here on purpose — the page already runs three scenes.

const MAT_GRID = {
  backgroundColor: "var(--color-olive)",
  backgroundImage: [
    "linear-gradient(rgba(140,155,112,0.55) 1px, transparent 1px)", // 50 mm
    "linear-gradient(90deg, rgba(140,155,112,0.55) 1px, transparent 1px)",
    "linear-gradient(rgba(111,126,88,0.45) 1px, transparent 1px)", // 10 mm
    "linear-gradient(90deg, rgba(111,126,88,0.45) 1px, transparent 1px)",
  ].join(","),
  backgroundSize: "120px 120px, 120px 120px, 24px 24px, 24px 24px",
} as const;

export function Bench() {
  const [open, setOpen] = useState<string | null>(null);
  const reducedMotion = useReducedMotion();

  // close the card on Escape / outside click
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    const onDown = (e: PointerEvent) => !(e.target as Element).closest("[data-skill]") && setOpen(null);
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  return (
    <section id="bench" className="px-page py-24 md:py-32" aria-labelledby="bench-heading">
      <ChapterHeader eyebrow="Everything on the bench" lines={["The", "toolchain."]} accentLast />
      <span id="bench-heading" className="sr-only">
        The toolchain
      </span>

      <div className="relative mt-12 overflow-hidden rounded-2xl border border-[#2f3a22] p-5 md:mt-16 md:p-10" style={MAT_GRID}>
        <div className="grid gap-10 md:grid-cols-3 md:gap-8">
          {skillGroups.map((g, gi) => (
            <div key={g.id}>
              <p className="type-label text-[#cfd8bd]">
                <span className="text-cream">{String(gi + 1).padStart(2, "0")}</span> / {g.title}
              </p>
              <ul className="mt-4 flex flex-wrap gap-2.5">
                {g.skills.map((s) => {
                  const id = `${g.id}:${s.name}`;
                  return (
                    <SkillTile
                      key={id}
                      skill={s}
                      group={g.title}
                      open={open === id}
                      tilt={!reducedMotion}
                      onToggle={() => setOpen((o) => (o === id ? null : id))}
                    />
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
        <p className="type-label mt-10 text-[#cfd8bd]/80">Tap a tool to see where I used it</p>
      </div>
    </section>
  );
}

function SkillTile({ skill, group, open, tilt, onToggle }: { skill: Skill; group: string; open: boolean; tilt: boolean; onToggle: () => void }) {
  const tile = useRef<HTMLButtonElement>(null);

  // tilt toward the cursor — written straight to the style, no React state per pointer move
  const onMove = (e: React.PointerEvent) => {
    const el = tile.current;
    if (!tilt || !el || e.pointerType !== "mouse") return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(500px) rotateX(${(-y * 14).toFixed(2)}deg) rotateY(${(x * 14).toFixed(2)}deg) translateZ(6px)`;
  };
  const onLeave = () => {
    if (tile.current) tile.current.style.transform = "";
  };

  const projects = (skill.usedIn ?? []).map((slug) => getProject(slug)!).filter(Boolean);
  const cardId = `skill-${group}-${skill.name}`.replace(/\W+/g, "-");

  return (
    <li className="relative" data-skill>
      <button
        ref={tile}
        type="button"
        onClick={onToggle}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        aria-expanded={open}
        aria-controls={cardId}
        className={`type-label flex items-center gap-2 rounded-xl border px-3 py-2.5 text-cream shadow-[0_6px_14px_rgba(16,9,4,0.45)] transition-[transform,border-color,background-color] duration-200 ease-out-expo ${
          open ? "border-orange bg-ink" : "border-brown bg-ink-2 hover:border-grey-brown"
        }`}
      >
        {skill.logo && <Image src={skill.logo} alt="" width={16} height={16} className="size-4 object-contain" />}
        {skill.name}
      </button>

      {open && (
        <div
          id={cardId}
          role="region"
          aria-label={`${skill.name}: where I used it`}
          className="absolute left-0 top-full z-20 mt-2 w-64 rounded-xl border border-brown bg-ink p-4 shadow-[0_12px_30px_rgba(0,0,0,0.5)]"
        >
          <p className="type-h4">{skill.name}</p>
          <p className="type-label mt-1 text-grey-brown">{group}</p>
          {projects.length > 0 ? (
            <div className="rule-dotted mt-3 pt-3">
              <p className="type-label text-grey-brown">Used in</p>
              <ul className="mt-2 space-y-1.5">
                {projects.map((p) => (
                  <li key={p.slug}>
                    <Link href={`/projects/${p.slug}`} className="type-body2 text-cream hover:text-orange">
                      {p.title} →
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            skill.note && <p className="type-body2 rule-dotted mt-3 pt-3 text-cream-dim">{skill.note}</p>
          )}
        </div>
      )}
    </li>
  );
}
