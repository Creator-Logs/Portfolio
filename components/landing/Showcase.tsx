"use client";

import Link from "next/link";
import { lazy, useCallback, useRef } from "react";
import { SceneBlock } from "@/components/three/SceneBlock";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useScrollProgress } from "@/hooks/useScrollProgress";

// Pinned showcase (landing.md §2). CSS sticky pin (compositor-friendly, no GSAP spacer); one scroll
// progress value drives the wheel's turn and the paragraph's word-by-word reveal.
const ShowcaseScene = lazy(() => import("./ShowcaseScene"));

const HEADING = ["Designed.", "Machined.", "Coded."]; // Ansh, Phase 6
const PARAGRAPH =
  "Every part on this page is something I designed in CAD and then made — on a lathe, a CNC mill, a waterjet, a printer, or in code. Systems Engineering & Design at UIUC.";
const WORDS = PARAGRAPH.split(" ");
const REVEAL = [0.12, 0.7]; // progress range over which the words light up (DESIGN.md §6: scrubbed, .15 -> 1)

export function Showcase() {
  const section = useRef<HTMLElement>(null);
  const words = useRef<(HTMLSpanElement | null)[]>([]);
  const mobile = useIsMobile();

  const onProgress = useCallback((p: number) => {
    const t = (p - REVEAL[0]) / (REVEAL[1] - REVEAL[0]);
    words.current.forEach((el, i) => {
      if (!el) return;
      const local = Math.min(1, Math.max(0, t * WORDS.length - i));
      el.style.opacity = String(0.15 + 0.85 * local);
    });
  }, []);
  const progress = useScrollProgress(section, onProgress);

  return (
    <section
      id="about"
      ref={section}
      className="relative h-[300svh] max-md:h-[220svh] motion-reduce:h-auto"
      aria-labelledby="about-heading"
    >
      <div className="sticky top-0 h-svh overflow-hidden motion-reduce:static motion-reduce:h-auto">
        <SceneBlock loadMargin="100% 0px" posterAlt="The Illini EV steering wheel" className="!absolute inset-0">
          <ShowcaseScene progress={progress} mobile={mobile} />
        </SceneBlock>

        <div className="px-page pointer-events-none relative z-10 flex h-full flex-col justify-between pb-10 pt-24 md:flex-row md:items-center md:pb-0 md:pt-0 motion-reduce:gap-12 motion-reduce:py-24">
          <h2 id="about-heading" className="type-h2 md:max-w-[30%]">
            {HEADING.map((line, i) => (
              <span key={line} className={`block ${i === HEADING.length - 1 ? "text-orange" : ""}`}>
                {line}
              </span>
            ))}
          </h2>
          <p className="type-body1 max-w-[30ch] text-cream md:max-w-[26%]">
            {WORDS.map((w, i) => (
              <span
                key={i}
                ref={(el) => {
                  words.current[i] = el;
                }}
                className="motion-reduce:!opacity-100"
                style={{ opacity: 0.15 }}
              >
                {w}{" "}
              </span>
            ))}
          </p>
        </div>

        {/* footnote with dotted rule (Oryzo) */}
        <div className="px-page pointer-events-auto absolute bottom-6 right-0 z-10 hidden w-full max-w-md md:block">
          <div className="rule-dotted flex items-baseline justify-between gap-4 pt-3">
            <span className="type-label text-grey-brown">Steering wheel · Illini Electric Motorsports</span>
            <Link href="/projects/steering-wheel" className="type-label text-cream hover:text-orange">
              See the build →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
