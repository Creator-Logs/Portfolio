"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { lazy, useCallback, useEffect, useRef, useState } from "react";
import { SceneBlock } from "@/components/three/SceneBlock";
import { trinkets, type TrinketDef } from "@/content/trinkets";
import { useIsMobile } from "@/hooks/useIsMobile";

// Lazy 3D content must be created in a client module and rendered from it — passing a
// React.lazy export through a Server Component double-wraps it.
const HeroMatScene = lazy(() => import("./HeroMatScene"));

// Small orange ring cursor while over a model (DESIGN.md §6).
const RING_CURSOR = `url("data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28"><circle cx="14" cy="14" r="9" fill="none" stroke="#DC5000" stroke-width="2"/></svg>',
)}") 14 14, pointer`;

export function HeroScene({ className }: { className?: string }) {
  const router = useRouter();
  const mobile = useIsMobile();
  const [hovered, setHovered] = useState<string | null>(null);
  const label = useRef<HTMLDivElement>(null);
  const hoveredDef = trinkets.find((t) => t.id === hovered);

  useEffect(() => {
    trinkets.forEach((t) => router.prefetch(`/projects/${t.slug}`));
  }, [router]);

  useEffect(() => {
    document.body.style.cursor = hovered ? RING_CURSOR : "";
    return () => {
      document.body.style.cursor = "";
    };
  }, [hovered]);

  // Called every frame while something is hovered — write the transform directly, no React state.
  const onLabel = useCallback((ndcX: number, ndcY: number) => {
    const el = label.current;
    const box = el?.parentElement;
    if (!el || !box) return;
    const x = ((ndcX + 1) / 2) * box.clientWidth;
    const y = ((1 - ndcY) / 2) * box.clientHeight;
    el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -100%)`;
  }, []);

  const onNavigate = useCallback((t: TrinketDef) => router.push(`/projects/${t.slug}`), [router]);

  return (
    <div className={className}>
      <SceneBlock animate priority posterAlt="Ansh's projects laid out on a green cutting mat" className="h-full w-full">
        <HeroMatScene mobile={mobile} hovered={hovered} onHover={setHovered} onLabel={onLabel} onNavigate={onNavigate} />
      </SceneBlock>

      <div
        ref={label}
        aria-hidden
        className={`type-label pointer-events-none absolute left-0 top-0 whitespace-nowrap rounded-full border border-orange/60 bg-ink/85 px-3 py-1.5 text-cream transition-opacity duration-200 ${
          hoveredDef ? "opacity-100" : "opacity-0"
        }`}
      >
        {hoveredDef?.label}
        {hoveredDef && mobile && <span className="text-orange"> · tap again</span>}
      </div>

      {/* Keyboard / screen-reader equivalent of the 3D objects (ARCHITECTURE quality bar). */}
      <ul className="sr-only">
        {trinkets.map((t) => (
          <li key={t.id}>
            <Link href={`/projects/${t.slug}`}>{t.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
