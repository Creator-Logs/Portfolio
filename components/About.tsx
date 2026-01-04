import React from "react";
import GrainSVG from "./GrainSVG";
import { FaGithub, FaLinkedin, FaInstagram, FaYoutube } from "react-icons/fa";

// Helper component for uniform cards
const BentoCard: React.FC<{
  title: string;
  children?: React.ReactNode;
  className?: string;
}> = ({ title, children, className = "" }) => (
  <div
    className={`bg-light-secondary dark:bg-dark-secondary rounded-[1.5rem] p-6 flex flex-col ${className} transition-colors duration-300`}
  >
    <h3 className="text-lg font-semibold uppercase text-light-text dark:text-dark-text mb-4">
      {title}
    </h3>
    <div className="flex-1">{children}</div>
  </div>
);

export const About: React.FC = () => {
  return (
    <section id="about" className="scroll-mt-32 py-12">
      <div className="mb-16 text-center">
        <h2 className="text-5xl md:text-7xl lg:text-7xl font-semibold tracking-tight uppercase text-light-text dark:text-dark-text">
          About Me
        </h2>
      </div>

      {/* 
         Layout Strategy:
         - Mobile: 1 col grid.
         - Tablet: 2 col grid.
         - Desktop: 3 col grid (Where columns are flex containers).
         
         To guarantee equal height columns on Desktop, the direct children of the grid are flex-cols with h-full.
      */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* COLUMN 1 */}
        {/* On Tablet: Left Column */}
        <div className="flex flex-col gap-4 h-full">
          <BentoCard title="BACKGROUND" className="flex-grow min-h-[240px]">
            <p className="text-md leading-relaxed text-light-textSec dark:text-dark-textSec">
              Hey, I'm Ansh Gupta and I enjoy tinkering away in a workshop,
              chasing the rush of adventure sports like rock climbing, and
              capturing those epic moments through videography. These passions
              fuel my curiosity and keep me grounded in the real world.
              <br />
              <br />
              I'm an engineering student who builds cool stuff where mechanics,
              AI, and electronics collide. I love diving into hands-on projects
              that turn big ideas into reality, whether it's crafting precise
              CAD models, designing PCBs, or coding.
            </p>
          </BentoCard>

          <BentoCard title="SKILLS" className="shrink-0">
            <div className="flex flex-wrap gap-2">
              {[
                "CAD",
                "PCB Design",
                "Web Development",
                "Machine learning",
                "CNC milling",
                "Wood Working",
                "3D Printing",
              ].map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1.5 bg-light-bg dark:bg-dark-tertiary rounded-lg text-sm font-medium text-light-textsc dark:text-dark-textSec dark:border-gray-800"
                >
                  {skill}
                </span>
              ))}
            </div>
          </BentoCard>
        </div>

        {/* COLUMN 2 */}
        {/* On Tablet: Right Column */}
        <div className="flex flex-col gap-4 h-full">
          <BentoCard title="SOCIALS" className="shrink-0">
            <div className="flex gap-[10px]">
              <a
                href="https://github.com/Creator-Logs"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-light-bg dark:bg-dark-tertiary w-12 h-12 rounded-lg flex items-center justify-center hover:scale-110 transition-transform"
                aria-label="GitHub"
              >
                <FaGithub
                  size={28}
                  className="text-[#181717] dark:text-[#f5f5f5]"
                />
              </a>
              <a
                href="https://www.linkedin.com/in/ansh-gupta-542613255/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-light-bg dark:bg-dark-tertiary w-12 h-12 rounded-lg flex items-center justify-center hover:scale-110 transition-transform"
                aria-label="LinkedIn"
              >
                <FaLinkedin size={28} className="text-[#0077b5]" />
              </a>
              <a
                href="https://www.instagram.com/creatorlogs/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-light-bg dark:bg-dark-tertiary w-12 h-12 rounded-lg flex items-center justify-center hover:scale-110 transition-transform"
                aria-label="Instagram"
              >
                <FaInstagram size={28} className="text-[#E4405F]" />
              </a>
              <a
                href="https://www.youtube.com/@CreatorLogs"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-light-bg dark:bg-dark-tertiary w-12 h-12 rounded-lg flex items-center justify-center hover:scale-110 transition-transform"
                aria-label="YouTube"
              >
                <FaYoutube size={28} className="text-[#FF0000]" />
              </a>
            </div>
          </BentoCard>

          <div className="flex-grow min-h-[200px] bg-gray-200 dark:bg-gray-800 rounded-[1.5rem] overflow-hidden relative group">
            <div className="relative w-full h-full">
              <img
                src="/ansh_gupta_portrait.webp"
                alt="ansh_gupta_portrait"
                className="w-full h-full grayscale hover:grayscale-[0] object-cover transition-all duration-500 ease-in-out"
              />
              {/* Grain Overlay */}
              {/* SVG Grain Overlay */}
              {/* prettier-ignore */}
              <GrainSVG opacity={0.5} blendMode="overlay" />
            </div>
          </div>

          <BentoCard title="INTERESTS" className="shrink-0">
            <ul className="text-md text-light-textSec dark:text-dark-textSec space-y-1">
              <li>Videography</li>
              <li>Rock Climbing</li>
              <li>Volleyball</li>
            </ul>
          </BentoCard>
        </div>

        {/* COLUMN 3 */}
        {/* On Tablet: Spans 2 columns (Full Width Bottom) */}
        <div className="flex flex-col gap-4 h-full md:col-span-2 lg:col-span-1">
          <BentoCard title="EXPERIENCE" className="flex-grow min-h-[300px]">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
                {/* Inner grid for tablet to use width better? Optional. Keeping list simple. */}
                <div>
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className="font-semibold">Senior Product Engineer</h4>
                    <span className="text-sm text-light-textSec dark:text-dark-textSec">
                      2023-Present
                    </span>
                  </div>
                  <p className="text-sm text-light-textSec dark:text-dark-textSec">
                    TechCorp Inc.
                  </p>
                </div>
                <div>
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className="font-semibold">Hardware Design Intern</h4>
                    <span className="text-sm text-light-textSec dark:text-dark-textSec">
                      2022-2023
                    </span>
                  </div>
                  <p className="text-sm text-light-textSec dark:text-dark-textSec">
                    Robotics Lab
                  </p>
                </div>
                <div>
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className="font-semibold">Freelance Developer</h4>
                    <span className="text-sm text-light-textSec dark:text-dark-textSec">
                      2020-2022
                    </span>
                  </div>
                  <p className="text-sm text-light-textSec dark:text-dark-textSec">
                    Self-Employed
                  </p>
                </div>
              </div>
            </div>
          </BentoCard>

          <BentoCard title="TOOLS" className="shrink-0">
            <div className="grid grid-cols-[repeat(auto-fit,minmax(52px,52px))] gap-1 justify-start">
              {[
                {
                  name: "Creo Parametric",
                  iconUrl: "logos/Creo.svg",
                },
                {
                  name: "Fusion 360",
                  iconUrl: "logos/Fusion360.svg",
                },
                {
                  name: "Ansys",
                  iconUrl: "logos/Ansys.svg",
                },
                {
                  name: "Figma",
                  iconUrl:
                    "https://upload.wikimedia.org/wikipedia/commons/d/db/Fusion360_Logo.svg",
                },
                {
                  name: "Blender",
                  iconUrl:
                    "https://upload.wikimedia.org/wikipedia/commons/d/db/Fusion360_Logo.svg",
                },
                {
                  name: "Docker",
                  iconUrl:
                    "https://upload.wikimedia.org/wikipedia/commons/d/db/Fusion360_Logo.svg",
                },
                {
                  name: "Git",
                  iconUrl:
                    "https://upload.wikimedia.org/wikipedia/commons/d/db/Fusion360_Logo.svg",
                },
                {
                  name: "Notion",
                  iconUrl:
                    "https://upload.wikimedia.org/wikipedia/commons/d/db/Fusion360_Logo.svg",
                },
                {
                  name: "Python",
                  iconUrl:
                    "https://upload.wikimedia.org/wikipedia/commons/d/db/Fusion360_Logo.svg",
                },
                {
                  name: "React",
                  iconUrl:
                    "https://upload.wikimedia.org/wikipedia/commons/d/db/Fusion360_Logo.svg",
                },
              ].map((tool, index) => (
                <div
                  key={index}
                  className="w-[52px] h-[52px] rounded-lg bg-light-bg dark:bg-dark-bg flex items-center justify-center p-3 hover:border-light-textSec/40 dark:hover:border-dark-textSec/40 transition-colors"
                  title={tool.name}
                >
                  <img
                    src={tool.iconUrl}
                    alt={tool.name}
                    className="w-full h-full object-contain"
                  />
                </div>
              ))}
            </div>
          </BentoCard>
        </div>
      </div>
    </section>
  );
};
