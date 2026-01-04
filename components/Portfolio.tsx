import React, { useState, useMemo } from "react";
import { Project, Category } from "../types";
import { IconArrowRight } from "./Icons";

interface PortfolioProps {
  projects: Project[];
  onProjectClick: (project: Project) => void;
}

export const Portfolio: React.FC<PortfolioProps> = ({
  projects,
  onProjectClick,
}) => {
  const [activeCategory, setActiveCategory] = useState<Category>(Category.ALL);

  const filteredProjects = useMemo(() => {
    if (activeCategory === Category.ALL) return projects;
    return projects.filter((p) => p.category.includes(activeCategory));
  }, [activeCategory, projects]);

  return (
    <section id="portfolio" className="scroll-mt-32 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
        <div>
          <h3 className="text-sm font-semibold text-accent dark:text-accent-dark uppercase tracking-widest mb-2">
            Portfolio
          </h3>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
            Selected Works
          </h2>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 md:gap-4">
          {Object.values(Category).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                activeCategory === cat
                  ? "bg-light-text text-light-bg dark:bg-dark-text dark:text-dark-bg shadow-lg scale-105"
                  : "bg-light-secondary dark:bg-dark-secondary text-light-textSec dark:text-dark-textSec hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProjects.map((project) => (
          <div
            key={project.id}
            onClick={() => onProjectClick(project)}
            className="group cursor-pointer flex flex-col gap-4 animate-fade-in-up"
          >
            {/* Card Thumbnail */}
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-light-secondary dark:bg-dark-secondary shadow-sm transition-all duration-500 group-hover:shadow-2xl group-hover:-translate-y-2">
              <img
                src={project.thumbnailUrl}
                alt={project.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>

              {/* Floating Link Icon */}
              <div className="absolute bottom-4 right-4 w-10 h-10 bg-white/90 dark:bg-black/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ease-out">
                <IconArrowRight className="w-5 h-5 text-black dark:text-white" />
              </div>
            </div>

            {/* Card Info */}
            <div>
              <div className="flex gap-2 mb-2">
                {project.category.slice(0, 2).map((c) => (
                  <span
                    key={c}
                    className="text-xs uppercase font-medium text-accent dark:text-accent-dark px-2 py-1 bg-dark-tertiary rounded-md"
                  >
                    {c}
                  </span>
                ))}
              </div>
              <h3 className="text-xl font-semibold mb-1 group-hover:text-accent dark:group-hover:text-accent-dark transition-colors">
                {project.title}
              </h3>
              <p className="text-sm text-light-textSec dark:text-dark-textSec">
                {project.subtitle}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
