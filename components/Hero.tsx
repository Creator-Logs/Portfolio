import React from "react";
import { Parallax } from "react-scroll-parallax";

export const Hero: React.FC = () => {
  return (
    <section className="relative min-h-screen flex flex-col justify-center pt-32 pb-12">
      <div className="w-full max-w-[1440px] mx-auto space-y-8">
        {/* Intro Text */}
        <div className="max-w-3xl hero-fade-in-1">
          <p className="font-medium md:text-2xl text-light-textSec dark:text-dark-textSec leading-relaxed">
            Hi, i'm{" "}
            <span className="text-light-text dark:text-dark-text font-semibold">
              Ansh
            </span>
            . I bring multiple engineering disciplines together to design,
            prototype, and build solutions.
          </p>
        </div>

        {/* Visual Container - Parent with Rounding & Overflow Hidden ensures all corners are perfect */}
        <div
          style={{
            WebkitMaskImage: `url(/Overlay.svg)`,
            maskImage: `url(/Overlay.svg)`,
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
            WebkitMaskSize: "contain",
            maskSize: "contain",
            WebkitMaskPosition: "center",
            maskPosition: "center",
          }}
          className="w-full mt-12 group overflow-hidden aspect-[4/3] md:aspect-[2/1] hero-fade-in-2"
        >
          <Parallax speed={-30}>
            <img
              src="/Hero.jpg"
              alt="Hero Image"
              className="w-full h-full object-cover transition-transform duration-700"
            />
          </Parallax>
        </div>

        <h1 className="text-5xl absolute bottom-24 left-2 md:text-8xl lg:text-[116px] font-semibold tracking-tight text-light-text dark:text-dark-text hero-fade-in-3">
          Design & Engineer
          <br />
          Products
        </h1>
      </div>
    </section>
  );
};
