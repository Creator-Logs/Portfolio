import React, { useState, useEffect } from "react";
import { Parallax } from "react-scroll-parallax";

export const Hero: React.FC = () => {
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };

    // Check on mount
    checkMobile();

    // Add event listener for window resize
    window.addEventListener("resize", checkMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col justify-center pt-20 md:pt-28 lg:pt-32">
      <div className="w-full max-w-[1440px] mx-auto space-y-8">
        {/* Intro Text */}
        <div className="max-w-3xl hero-fade-in-1">
          <p className="font-medium text-2xl text-light-textSec dark:text-dark-textSec leading-relaxed">
            Hi, i'm{" "}
            <span className="text-light-text dark:text-dark-text font-semibold">
              Ansh
            </span>
            . I bring multiple engineering disciplines together to design,
            prototype, and build solutions.
          </p>
        </div>

        {/* Visual Container - Parent with Rounding & Overflow Hidden ensures all corners are perfect */}
        <div className="w-full h-[32vh] group overflow-hidden hero-fade-in-2 rounded-2xl">
          <Parallax speed={-30} disabled={isMobile}>
            <img
              src="/creator_logs_hero_image.webp"
              alt="creator_logs_hero_image"
              className="w-full object-cover transition-transform duration-700"
            />
          </Parallax>
        </div>

        <h1 className="text-[10vw] leading-[1] md:text-7xl lg:text-[8vw] font-semibold tracking-tight text-light-text dark:text-dark-text hero-fade-in-3">
          Design & Engineer<span className="lg:hidden"> </span>
          <br className="hidden lg:block" />
          Products
        </h1>
      </div>
    </section>
  );
};
