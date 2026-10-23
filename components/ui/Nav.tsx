"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { site } from "@/content/site";

export function Nav() {
  const [open, setOpen] = useState(false);

  const pathname = usePathname();
  const [light, setLight] = useState(false);

  // Light studio sections opt in with `data-nav-theme="light"`; the nav goes studio-ink while one sits
  // under it (printer page). Default is cream on ink.
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const probe = 32;
      const under = Array.from(document.querySelectorAll<HTMLElement>("[data-nav-theme]")).find((el) => {
        const r = el.getBoundingClientRect();
        return r.top <= probe && r.bottom > probe;
      });
      setLight(under?.dataset.navTheme === "light");
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [pathname]);

  const tone = light && !open ? "text-studio-ink" : "text-cream";

  // Lock page scroll while the mobile overlay is open; close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.documentElement.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <header className="px-page fixed inset-x-0 top-0 z-50 flex items-start justify-between pt-5 md:pt-6">
      {/* The hero already carries the big wordmark, so the nav only shows the sub-brand. */}
      <Link
        href="/"
        aria-label={`${site.name}, home`}
        className={`type-label ${tone} transition-colors hover:text-orange`}
        onClick={() => setOpen(false)}
      >
        {site.subBrand}
      </Link>

      <nav aria-label="Primary" className="hidden md:block">
        <ul className={`type-label flex items-center gap-2 ${tone} transition-colors`}>
          {site.nav.map((item, i) => (
            <li key={item.href} className="flex items-center gap-2">
              {i > 0 && <span className="text-grey-brown">·</span>}
              <Link
                href={item.href}
                className="border-b border-dotted border-transparent pb-0.5 transition-colors hover:border-orange hover:text-orange"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <button
        type="button"
        className={`type-label relative z-10 ${tone} md:hidden`}
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? "Close" : "Menu"}
      </button>

      <div
        id="mobile-menu"
        className={`px-page fixed inset-0 flex flex-col justify-end bg-ink pb-16 transition-opacity duration-300 md:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!open}
      >
        <ul className="flex flex-col">
          {site.nav.map((item, i) => (
            <li key={item.href} className="rule-dotted">
              <Link
                href={item.href}
                tabIndex={open ? 0 : -1}
                onClick={() => setOpen(false)}
                className="flex items-baseline justify-between py-4"
              >
                <span className="type-h2">{item.label}</span>
                <span className="type-label text-grey-brown">0{i + 1}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}
