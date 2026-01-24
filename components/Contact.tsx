import React from "react";
import { IconArrowRight } from "./Icons";

export const Contact: React.FC = () => {
  return (
    <section
      id="contact"
      className="scroll-mt-32 h-[55vh]"
    >
      
      <div className="max-w-7xl">
        <h2 className="text-4xl md:text-6xl font-medium mb-2">
          GET IN TOUCH
        </h2>

        <a
          href="mailto:anshgupta0621@gmail.com"
          className="text-xl md:text-4xl underline underline-offset-4"
        >
          anshgupta0621@gmail.com
        </a>

        {/* Links */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-12 max-w-md">
          {/* Internal links */}
          <div>
            <p className="mb-2 text-xl font-medium">Links</p>
            <ul className="text-white/80">
              <li className="hover:text-white transition">
                <a href="#works">Selected Works</a>
              </li>
              <li className="hover:text-white transition">
                <a href="#about">About Me</a>
              </li>
            </ul>
          </div>

          {/* Socials */}
          <div>
            <p className="mb-2 text-xl font-medium">Socials</p>
            <ul className="text-white/80">
              <li className="hover:text-white transition">
                <a href="#">Instagram</a>
              </li>
              <li className="hover:text-white transition">
                <a href="#">YouTube</a>
              </li>
              <li className="hover:text-white transition">
                <a href="#">GitHub</a>
              </li>
              <li className="hover:text-white transition">
                <a href="#">LinkedIn</a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Big background text */}
      <div className="pointer-events-none absolute bottom-6 right-8 md:right-20">
        <h1 className="text-[3rem] sm:text-[5rem] md:text-[7rem] lg:text-[9rem] font-bold text-white">
          Creator Logs
        </h1>
      </div>
   
    </section>
  );
};
